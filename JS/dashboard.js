/* ============================================================
   StudySpot – dashboard.js
   Frontend Logic for My Dashboard & Live Database Sync
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const statUpcoming = document.getElementById('statUpcoming');
  const statFavorites = document.getElementById('statFavorites');
  const statReviews = document.getElementById('statReviews');
  const bookingsListContainer = document.getElementById('upcomingBookingsList');

  // Fallback data matching PNG mockup if offline or file://
  const fallbackData = {
    upcoming_count: 2,
    favorites_count: 4,
    reviews_count: 6,
    bookings: [
      {
        id: 1,
        place_id: 9,
        place_name: "Colombo Public Library",
        display_time: "Tomorrow · 09:00 AM – 11:00 AM",
        status: "confirmed",
        status_label: "Confirmed"
      },
      {
        id: 2,
        place_id: 11,
        place_name: "Focus Coworking",
        display_time: "12 Oct · 02:00 PM – 04:00 PM",
        status: "pending",
        status_label: "Pending"
      }
    ]
  };

  // ── Render Bookings ─────────────────────────────────────────
  function renderBookings(bookings) {
    if (!bookingsListContainer) return;
    if (!bookings || bookings.length === 0) {
      bookingsListContainer.innerHTML = `
        <div style="padding: 24px 0; text-align: center; color: #888;">
          No upcoming bookings found. <a href="booking.html" style="color: #2D6A2D; font-weight: 600;">Book a spot now</a>
        </div>
      `;
      return;
    }

    let html = '';
    bookings.forEach((b, index) => {
      const isConfirmed = (b.status === 'confirmed' || b.status === 'upcoming');
      const badgeClass = isConfirmed ? 'confirmed' : 'pending';
      const badgeText = b.status_label || (isConfirmed ? 'Confirmed' : 'Pending');
      const placeUrl = b.place_id ? `space-detail.html?id=${b.place_id}` : 'explore.html';

      html += `
        <div class="booking-item">
          <div class="booking-info">
            <span class="booking-name">
              <a href="${placeUrl}">${escapeHtml(b.place_name)}</a>
            </span>
            <span class="booking-meta">${escapeHtml(b.display_time)}</span>
          </div>
          <span class="status-pill ${badgeClass}">${badgeText}</span>
        </div>
      `;

      if (index < bookings.length - 1) {
        html += `<hr class="booking-divider">`;
      }
    });

    bookingsListContainer.innerHTML = html;
  }

  // ── Escape HTML helper ──────────────────────────────────────
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Fetch from Database via PHP API ─────────────────────────
  function loadDashboardData() {
    fetch('php/get_dashboard_data.php')
      .then(res => {
        if (!res.ok) throw new Error('Network response error');
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          if (statUpcoming) statUpcoming.textContent = data.upcoming_count ?? fallbackData.upcoming_count;
          if (statFavorites) statFavorites.textContent = data.favorites_count ?? fallbackData.favorites_count;
          if (statReviews) statReviews.textContent = data.reviews_count ?? fallbackData.reviews_count;
          renderBookings(data.bookings && data.bookings.length ? data.bookings : fallbackData.bookings);
        } else {
          applyFallback();
        }
      })
      .catch(err => {
        console.warn('Database fetch failed, applying mockup fallback data:', err);
        applyFallback();
      });
  }

  function applyFallback() {
    if (statUpcoming) statUpcoming.textContent = fallbackData.upcoming_count;
    if (statFavorites) statFavorites.textContent = fallbackData.favorites_count;
    if (statReviews) statReviews.textContent = fallbackData.reviews_count;
    renderBookings(fallbackData.bookings);
  }

  // Initialize
  loadDashboardData();
});
