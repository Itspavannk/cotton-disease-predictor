// ==============================
// DOM ELEMENTS
// ==============================
const form = document.getElementById("upload-form");
const imageInput = document.getElementById("image-input");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("preview-img");
const predictBtn = document.getElementById("predict-btn");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("result");
const predictGrid = document.getElementById("predictGrid");

// ==============================
// IMAGE PREVIEW
// ==============================
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image");
    imageInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    preview.style.display = "block";
    predictBtn.disabled = false;
    resultBox.style.display = "none";
  };
  reader.readAsDataURL(file);
});

// ==============================
// FORM SUBMIT
// ==============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!imageInput.files.length) {
    alert("Please upload an image first");
    return;
  }

  // 👉 SPLIT LAYOUT
  predictGrid.classList.remove("single");
  predictGrid.classList.add("split");

  const formData = new FormData();
  formData.append("file", imageInput.files[0]);

  predictBtn.disabled = true;
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

    if (data.success) {
resultBox.innerHTML = `
  <h2>${data.label}</h2>

  <div class="result-meta">
    <div class="confidence">
      <span class="label">Confidence :</span>
      <span class="value">${data.confidence}%</span>
    </div>

    <div class="cause">
      <span class="label">Cause :</span>
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
    } else {
      resultBox.innerHTML = `<p style="color:red;">${data.error}</p>`;
      resultBox.style.display = "block";
    }

  } catch (error) {
    loader.style.display = "none";
    predictBtn.disabled = false;
    alert("Something went wrong. Please try again.");
  }
});
