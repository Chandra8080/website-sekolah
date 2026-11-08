/**
 * School Information System - Admin Panel JS
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar Toggle on Mobile
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < 992 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('show');
      }
    });
  }

  // 2. PPDB Doughnut Chart Initialization
  const chartCanvas = document.getElementById('ppdbStatusChart');
  if (chartCanvas && typeof Chart !== 'undefined') {
    let statusData = { pending: 0, verified: 0, accepted: 0, rejected: 0 };
    try {
      const raw = chartCanvas.getAttribute('data-status');
      if (raw) statusData = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse PPDB status data for chart:', e);
    }

    new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Menunggu', 'Terverifikasi', 'Diterima', 'Ditolak'],
        datasets: [
          {
            data: [
              statusData.pending || 0,
              statusData.verified || 0,
              statusData.accepted || 0,
              statusData.rejected || 0
            ],
            backgroundColor: [
              '#f59e0b', // warning
              '#3b82f6', // info
              '#10b981', // success
              '#ef4444'  // danger
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        cutout: '70%'
      }
    });
  }

  // 3. Color Picker Dynamic Sync
  const colorPickers = document.querySelectorAll('input[type="color"]');
  colorPickers.forEach(picker => {
    picker.addEventListener('input', (e) => {
      const textInput = picker.parentElement.querySelector('input[type="text"]');
      if (textInput) {
        textInput.value = e.target.value;
      }
    });
  });
});
