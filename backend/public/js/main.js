// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {
  const originalFileInput = document.getElementById("original-file");
  const swapFileInput = document.getElementById("swap-file");
  const originalPreview = document.getElementById("original-preview");
  const swapPreview = document.getElementById("swap-preview");
  const form = document.querySelector("form");
  const loaderContainer = document.getElementById("loader-container");

  const handleFilePreview = (fileInput, previewContainer) => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewContainer.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      previewContainer.innerHTML = "<p>Image preview...</p>";
    }
  };

  if (originalFileInput) {
    originalFileInput.addEventListener("change", () =>
      handleFilePreview(originalFileInput, originalPreview)
    );
  }
  if (swapFileInput) {
    swapFileInput.addEventListener("change", () =>
      handleFilePreview(swapFileInput, swapPreview)
    );
  }

  if (form) {
    form.addEventListener("submit", () => {
      loaderContainer.style.display = "flex";
    });
  }
});
