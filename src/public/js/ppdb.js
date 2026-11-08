/**
 * PPDB Online Form Validation & Helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ppdbRegisterForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      const phoneInput = form.querySelector('input[name="parentPhone"]');
      if (phoneInput) {
        const val = phoneInput.value.trim().replace(/[^0-9]/g, '');
        if (val.length < 9 || val.length > 15) {
          e.preventDefault();
          alert('Harap masukkan nomor telepon atau WhatsApp yang valid (9 - 15 digit angka).');
          phoneInput.focus();
          return false;
        }
      }

      const fileInput = form.querySelector('input[name="document"]');
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          e.preventDefault();
          alert('Ukuran berkas melebihi batas maksimal 10MB. Harap kompresi terlebih dahulu.');
          fileInput.value = '';
          return false;
        }
      }
    });
  }
});
