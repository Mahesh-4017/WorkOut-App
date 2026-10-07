import { uploadImage } from './api.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 8 * 1024 * 1024;

export function mountImagePicker({
  fileInputId = 'imageFile',
  dropZoneId = 'drop-zone',
  previewWrapId = 'image-preview-wrap',
  previewImageId = 'image-preview',
  urlInputId = 'imageUrl',
  clearButtonId = 'remove-image',
  errorId = 'image-error',
} = {}) {
  const fileInput = document.getElementById(fileInputId);
  const dropZone = document.getElementById(dropZoneId);
  const previewWrap = document.getElementById(previewWrapId);
  const previewImage = document.getElementById(previewImageId);
  const urlInput = document.getElementById(urlInputId);
  const error = document.getElementById(errorId);
  let selectedFile = null;
  let objectUrl = null;

  const showError = message => {
    if (!error) return;
    error.textContent = message;
    error.classList.toggle('hidden', !message);
  };
  const renderPreview = () => {
    const source = objectUrl || urlInput.value.trim();
    previewImage.src = source || '';
    previewWrap.classList.toggle('hidden', !source);
  };
  const setFile = file => {
    if (file && !ALLOWED_TYPES.has(file.type)) {
      showError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file && file.size > MAX_SIZE) {
      showError('Choose an image smaller than 8 MB.');
      return;
    }
    showError('');
    selectedFile = file || null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
    if (selectedFile) urlInput.value = '';
    renderPreview();
  };

  document.getElementById('choose-image').onclick = () => fileInput.click();
  fileInput.onchange = () => setFile(fileInput.files?.[0] || null);
  urlInput.addEventListener('input', () => {
    if (!selectedFile) renderPreview();
  });
  document.getElementById(clearButtonId).onclick = () => {
    setFile(null);
    fileInput.value = '';
    urlInput.value = '';
  };
  for (const eventName of ['dragenter', 'dragover']) {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      dropZone.classList.add('dragging');
    });
  }
  for (const eventName of ['dragleave', 'drop']) {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      dropZone.classList.remove('dragging');
    });
  }
  dropZone.addEventListener('drop', event => setFile(event.dataTransfer.files?.[0] || null));
  dropZone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') fileInput.click();
  });
  renderPreview();

  return {
    async getUrl() {
      return selectedFile ? (await uploadImage(selectedFile)).url : urlInput.value.trim();
    },
    refresh: renderPreview,
    dispose() {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
  };
}
