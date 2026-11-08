/**
 * School Information System - Public JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Animated Counter for Statistics
  const counters = document.querySelectorAll('.count-up');
  if (counters.length > 0) {
    const observerOptions = {
      root: null,
      threshold: 0.3
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
          const duration = 1800; // ms
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target.toLocaleString('id-ID');
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current).toLocaleString('id-ID');
            }
          }, stepTime);

          observer.unobserve(counter);
        }
      });
    }, observerOptions);

    counters.forEach(c => counterObserver.observe(c));
  }

  // 2. Lightbox implementation for images
  window.openLightbox = function(imageUrl) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if (modal && img) {
      img.src = imageUrl;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightbox = function() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  const lightbox = document.getElementById('lightboxModal');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        window.closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeLightbox();
    }
  });
});
