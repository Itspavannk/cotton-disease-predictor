from flask import Flask, render_template, request, jsonify
import os
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite
from disease_info import disease_data

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
MODEL_PATH = os.path.join("model", "cotton_model.tflite")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# LOAD TFLITE MODEL
# =========================
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("✅ TFLite model loaded successfully")

# ⚠️ MUST MATCH train_gen.class_indices ORDER
CLASS_NAMES = [
    "Diseased Cotton Leaf",
    "Diseased Cotton Plant",
    "Fresh Cotton Leaf",
    "Fresh Cotton Plant"
]

# =========================
# PREPROCESS IMAGE
# (ResNet50-style, TFLite safe)
# =========================
def preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32)

    # ResNet50 preprocess_input equivalent
    img[..., 0] -= 103.939
    img[..., 1] -= 116.779
    img[..., 2] -= 123.68

    img = np.expand_dims(img, axis=0)
    return img

# =========================
# ROUTES
# =========================
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    # 1️⃣ Check file
    if "file" not in request.files:
        return jsonify(success=False, error="No file uploaded")

    file = request.files["file"]
    if file.filename == "":
        return jsonify(success=False, error="Empty file")

    # 2️⃣ Save file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # 3️⃣ Preprocess
        img = preprocess_image(file_path)

        # 4️⃣ Run inference
        interpreter.set_tensor(input_details[0]["index"], img)
        interpreter.invoke()
        preds = interpreter.get_tensor(output_details[0]["index"])[0]

        class_index = int(np.argmax(preds))
        confidence = float(np.max(preds) * 100)

        label = CLASS_NAMES[class_index]

        # 5️⃣ Fetch disease details
        info = disease_data.get(label, {})

        # 6️⃣ Send JSON response
        return jsonify(
            success=True,
            label=label,
            confidence=round(confidence, 2),
            cause=info.get("cause", "Not available"),
            symptoms=info.get("symptoms", []),
            prevention=info.get("prevention", []),
            treatment=info.get("treatment", [])
        )

    except Exception as e:
        print("🔥 Prediction error:", e)
        return jsonify(success=False, error=str(e))

# =========================
# RUN APP
# =========================
if __name__ == "__main__":
    app.run(debug=True)
