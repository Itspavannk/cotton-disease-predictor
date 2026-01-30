from flask import Flask, render_template, request, jsonify
import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
from disease_info import disease_data

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
MODEL_PATH = "model/cotton_model.h5"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# LOAD MODEL
# =========================
model = load_model(MODEL_PATH, compile=False)
print("✅ Model loaded successfully")

# ⚠️ MUST MATCH train_gen.class_indices ORDER
CLASS_NAMES = [
    "Diseased Cotton Leaf",
    "Diseased Cotton Plant",
    "Fresh Cotton Leaf",
    "Fresh Cotton Plant"
]

# =========================
# PREPROCESS IMAGE
# =========================
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img = image.img_to_array(img)
    img = preprocess_input(img)   # ResNet50 preprocessing
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
        # 3️⃣ Preprocess & predict
        img = preprocess_image(file_path)
        preds = model.predict(img)[0]

        class_index = int(np.argmax(preds))
        confidence = float(np.max(preds) * 100)

        label = CLASS_NAMES[class_index]

        # 4️⃣ Fetch disease details
        info = disease_data.get(label, {})

        # 5️⃣ Send JSON response
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
        return jsonify(success=False, error=str(e))

# =========================
# RUN APP
# =========================
if __name__ == "__main__":
    app.run(debug=True)
