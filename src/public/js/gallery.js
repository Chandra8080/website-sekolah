/**
 * Gallery & Lightbox Handler
 */

function initGallery() {
  const categoryFilters = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-grid-item');

  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initGallery);
