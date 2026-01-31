// ==============================
// IMAGE UPLOAD MODAL HANDLER
// ==============================
(function() {
  const uploadTrigger = document.getElementById('upload-trigger');
  const modal = document.getElementById('image-source-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const cameraBtn = document.getElementById('camera-btn');
  const galleryBtn = document.getElementById('gallery-btn');
  const cameraInput = document.getElementById('camera-input');
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('preview');
  const previewImg = document.getElementById('preview-img');
  const predictBtn = document.getElementById('predict-btn');
  const resultBox = document.getElementById('result');

  // Open modal when upload box is clicked
  if (uploadTrigger) {
    uploadTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      modal.style.display = 'flex';
      // Add animation class
      requestAnimationFrame(() => {
        modal.classList.add('show');
      });
    });
  }

  // Close modal functions
  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }

  if (modalClose) {
    modalClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // Camera button - triggers camera input
  if (cameraBtn) {
    cameraBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      // Small delay to ensure modal closes before camera opens
      setTimeout(() => {
        cameraInput.click();
      }, 150);
    });
  }

  // Gallery button - triggers file input
  if (galleryBtn) {
    galleryBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      // Small delay to ensure modal closes before file picker opens
      setTimeout(() => {
        fileInput.click();
      }, 150);
    });
  }

  // Handle camera input change
  if (cameraInput) {
    cameraInput.addEventListener('change', function(e) {
      handleFileSelect(e, 'camera');
    });
  }

  // Handle file input change
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      handleFileSelect(e, 'gallery');
    });
  }

  // Common file handler
  function handleFileSelect(e, source) {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        e.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        e.target.value = '';
        return;
      }

      // Create preview
      const reader = new FileReader();
      
      reader.onload = function(event) {
        previewImg.src = event.target.result;
        preview.style.display = 'block';
        predictBtn.disabled = false;
        resultBox.style.display = 'none';
        
        // Add fade-in animation
        preview.classList.add('fade-in');
      };
      
      reader.readAsDataURL(file);
      
      console.log(`Image loaded from ${source}:`, file.name);
    }
  }
})();
