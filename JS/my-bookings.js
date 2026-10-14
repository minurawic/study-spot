/* ============================================================
   StudySpot – my-bookings.js
   Frontend logic for My Bookings page & Database integration
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const bookingsList = document.getElementById('bookingsList');
  const tabUpcoming = document.getElementById('tabUpcoming');
  const tabCompleted = document.getElementById('tabCompleted');
  const tabCancelled = document.getElementById('tabCancelled');

  // Seeded fallback matching database/schema.sql
  const fallbackBookings = [
    {
      id: 1,
      place_id: 5,
      place_name: "The Library Cafe",
      place_city: "Kandy",
      cover_image: "images/library-cafe.jpg",
      booking_date: "2026-09-12",
      formatted_time: "10.00 AM - 12.00 PM",
      people: 1,
      formatted_price: "Rs. 500",
      status: "upcoming",
      payment_ref: "SS-100231"
    },
    {
      id: 2,
      place_id: 8,
      place_name: "Green Space",
      place_city: "Kandy",
      cover_image: "images/green-space.jpg",
      booking_date: "2026-09-15",
      formatted_time: "2.00 PM - 4.00 PM",
      people: 2,
      formatted_price: "Free",
      status: "upcoming",
      payment_ref: "SS-100232"
    },
    {
      id: 3,
      place_id: 2,
      place_name: "Cafe Kumbuk",
      place_city: "Colombo",
      cover_image: "images/cafe-kumbuk.jpg",
      booking_date: "2026-08-20",
      formatted_time: "9.00 AM - 11.00 AM",
      people: 1,
      formatted_price: "Rs. 350",
      status: "completed",
      payment_ref: "SS-100198"
    },
    {
      id: 4,
      place_id: 3,
      place_name: "Hub Lanka Co-working Space",
      place_city: "Colombo",
      cover_image: "images/hub-lanka.jpg",
      booking_date: "2026-08-11",
      formatted_time: "8.00 AM - 5.00 PM",
      people: 1,
      formatted_price: "Rs. 300",
      status: "completed",
      payment_ref: "SS-100177"
    },
    {
      id: 5,
      place_id: 1,
      place_name: "National Library Colombo",
      place_city: "Colombo",
      cover_image: "images/national-library.jpg",
      booking_date: "2026-07-30",
      formatted_time: "1.00 PM - 4.00 PM",
      people: 3,
      formatted_price: "Free",
      status: "completed",
      payment_ref: "SS-100120"
    },
    {
      id: 6,
      place_id: 6,
      place_name: "Mind Space",
      place_city: "Peradeniya",
      cover_image: "images/mind-space.jpg",
      booking_date: "2026-08-02",
      formatted_time: "10.00 AM - 12.00 PM",
      people: 1,
      formatted_price: "Rs. 600",
      status: "cancelled",
      payment_ref: "SS-100150"
    }
  ];

  function renderBookings() {
    bookingsList.innerHTML = '';

    const filtered = allBookings.filter(b => {
      if (currentTab === 'all') return true;
      return b.status === currentTab;
    });

    if (filtered.length === 0) {
      bookingsList.innerHTML = `
        <div class="empty-bookings-box">
          <div class="empty-bookings-title">No ${currentTab === 'all' ? '' : currentTab} bookings found</div>
          <p class="empty-bookings-sub">You don't have any bookings in this section yet.</p>
          <a href="explore.html" class="btn-explore">Find Study Spaces</a>
        </div>
      `;
      return;
    }

    filtered.forEach(b => {
      const card = document.createElement('article');
      card.className = 'booking-item-card';

      let cover = b.cover_image || 'images/library-cafe.jpg';
      if (!cover.startsWith('http') && !cover.startsWith('images/')) cover = 'images/' + cover;

      card.innerHTML = `
        <div class="booking-item-img-wrap">
          <img src="${cover}" alt="${b.place_name}" class="booking-item-img" onerror="this.src='images/placeholder.svg'" />
        </div>
        <div class="booking-item-info">
          <div class="booking-item-top">
            <h2 class="booking-place-title">
              <a href="space-detail.html?id=${b.place_id}">${b.place_name}</a>
            </h2>
            <span class="badge-status badge-${b.status}">${b.status}</span>
          </div>
          <div class="booking-place-city">${b.place_city || ''}</div>
          <div class="booking-meta-grid">
            <div class="booking-meta-item"><strong>Date:</strong> ${b.booking_date}</div>
            <div class="booking-meta-item"><strong>Time:</strong> ${b.formatted_time || ''}</div>
            <div class="booking-meta-item"><strong>People:</strong> ${b.people}</div>
            <div class="booking-meta-item"><strong>Total:</strong> ${b.formatted_price || 'Rs. ' + b.total_price}</div>
            ${b.payment_ref ? `<div class="booking-meta-item"><strong>Ref:</strong> ${b.payment_ref}</div>` : ''}
          </div>
        </div>
        <div class="booking-item-actions">
          <a href="space-detail.html?id=${b.place_id}" class="btn-view-space">View Space</a>
        </div>
      `;
      bookingsList.appendChild(card);
    });
  }

  // Filter tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      renderBookings();
    });
  });

  // Load from DB API
  async function loadBookings() {
    try {
      const res = await fetch('php/get_user_bookings.php');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bookings && data.bookings.length > 0) {
          allBookings = data.bookings;
          renderBookings();
          return;
        }
      }
    } catch (err) {
      console.warn('API error, using fallback bookings dataset:', err);
    }

    allBookings = [...fallbackBookings];
    renderBookings();
  }

  loadBookings();
});
