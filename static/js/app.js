// ==============================
// DOM ELEMENTS
// ==============================
const form = document.getElementById("upload-form");
const cameraInput = document.getElementById("camera-input");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("preview-img");
const predictBtn = document.getElementById("predict-btn");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("result");
const predictGrid = document.getElementById("predictGrid");

// Variable to store which input was used
let currentInput = null;

// ==============================
// IMAGE PREVIEW FOR CAMERA INPUT
// ==============================
if (cameraInput) {
  cameraInput.addEventListener("change", (e) => {
    handleImagePreview(e);
    currentInput = cameraInput;
  });
}

// ==============================
// IMAGE PREVIEW FOR FILE INPUT
// ==============================
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    handleImagePreview(e);
    currentInput = fileInput;
  });
}

// ==============================
// SHARED IMAGE PREVIEW FUNCTION
// ==============================
function handleImagePreview(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    preview.style.display = "block";
    predictBtn.disabled = false;
    resultBox.style.display = "none";
    
    // Reset grid to single view when new image is uploaded
    predictGrid.classList.remove("split");
    predictGrid.classList.add("single");
  };
  reader.readAsDataURL(file);
}

// ==============================
// PREDICT BUTTON CLICK
// ==============================
if (predictBtn) {
  predictBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check which input has a file
    let selectedFile = null;
    if (cameraInput && cameraInput.files.length > 0) {
      selectedFile = cameraInput.files[0];
    } else if (fileInput && fileInput.files.length > 0) {
      selectedFile = fileInput.files[0];
    }

    if (!selectedFile) {
      alert("Please upload an image first");
      return;
    }

    console.log("Starting prediction for file:", selectedFile.name);

    // 👉 SPLIT LAYOUT
    predictGrid.classList.remove("single");
    predictGrid.classList.add("split");

    const formData = new FormData();
    formData.append("file", selectedFile);

    predictBtn.disabled = true;
    predictBtn.textContent = "Analyzing...";
    loader.style.display = "flex";
    resultBox.style.display = "none";

    try {
      const res = await fetch("/predict", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      loader.style.display = "none";
      predictBtn.disabled = false;
      predictBtn.textContent = "Predict Disease";

      if (data.success) {
        resultBox.innerHTML = `
          <h2>${data.label}</h2>

          <div class="result-meta">
            <div class="confidence">
              <span class="label">Confidence :</span>
              <span class="value">${data.confidence}%</span>
            </div>

            <div class="cause">
              <span class="label">Cause:</span>
              <span class="value">${data.cause}</span>
            </div>
          </div>

          <div class="result-sections">

            <h3>Symptoms</h3>
            <ul>
              ${data.symptoms.map(s => `<li>${s}</li>`).join("")}
            </ul>

            <h3>Prevention</h3>
            <ul>
              ${data.prevention.map(p => `<li>${p}</li>`).join("")}
            </ul>

            <h3>Treatment</h3>
            <ul>
              ${data.treatment.map(t => `<li>${t}</li>`).join("")}
            </ul>

          </div>
        `;

        resultBox.style.display = "block";
        
        console.log("Prediction successful:", data.label);
      } else {
        resultBox.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
        resultBox.style.display = "block";
        console.error("Prediction failed:", data.error);
      }

    } catch (error) {
      loader.style.display = "none";
      predictBtn.disabled = false;
      predictBtn.textContent = "Predict Disease";
      alert("Something went wrong. Please try again.");
      console.error("Prediction error:", error);
    }
  });
}
