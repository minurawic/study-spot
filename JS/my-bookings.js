/* ============================================================
   StudySpot – my-bookings.js
   Frontend logic for My Bookings page & Database synchronization
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const bookingsList = document.getElementById('bookingsList');
  const tabUpcoming = document.getElementById('tabUpcoming');
  const tabCompleted = document.getElementById('tabCompleted');
  const tabCancelled = document.getElementById('tabCancelled');

  const countUpcoming = document.getElementById('countUpcoming');
  const countCompleted = document.getElementById('countCompleted');
  const countCancelled = document.getElementById('countCancelled');

  // SVG Icons matching PNG mockup
  const CALENDAR_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`;

  const PERSON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>`;

  // ── Seed Fallback Data (Matches uploaded PNG screenshot & database exactly) ──
  const fallbackBookings = {
    upcoming: [
      {
        id: 1,
        place_id: 5,
        place_name: 'The Library Cafe',
        place_city: 'Kandy',
        booking_date: '2026-09-12',
        time_slot: '10.00 AM - 12.00 PM',
        people: 1,
        people_label: '1 Peoples',
        status: 'upcoming',
        status_label: 'Upcoming',
        cover_image: 'images/library-cafe.jpg'
      },
      {
        id: 2,
        place_id: 8,
        place_name: 'Green Space',
        place_city: 'Kandy',
        booking_date: '2026-09-15',
        time_slot: '02.00 PM - 04.00 PM',
        people: 2,
        people_label: '2 Peoples',
        status: 'upcoming',
        status_label: 'Upcoming',
        cover_image: 'images/green-space.jpg'
      }
    ],
    completed: [
      {
        id: 3,
        place_id: 2,
        place_name: 'Cafe Kumbuk',
        place_city: 'Colombo',
        booking_date: '2026-08-20',
        time_slot: '09.00 AM - 11.00 AM',
        people: 1,
        people_label: '1 Peoples',
        status: 'completed',
        status_label: 'Completed',
        cover_image: 'images/cafe-kumbuk.jpg'
      },
      {
        id: 4,
        place_id: 3,
        place_name: 'Hub Lanka Co-working Space',
        place_city: 'Colombo',
        booking_date: '2026-08-11',
        time_slot: '08.00 AM - 05.00 PM',
        people: 1,
        people_label: '1 Peoples',
        status: 'completed',
        status_label: 'Completed',
        cover_image: 'images/hub-lanka.jpg'
      },
      {
        id: 5,
        place_id: 1,
        place_name: 'National Library Colombo',
        place_city: 'Colombo',
        booking_date: '2026-07-30',
        time_slot: '01.00 PM - 04.00 PM',
        people: 3,
        people_label: '3 Peoples',
        status: 'completed',
        status_label: 'Completed',
        cover_image: 'images/national-library.jpg'
      }
    ],
    cancelled: [
      {
        id: 6,
        place_id: 6,
        place_name: 'Mind Space',
        place_city: 'Peradeniya',
        booking_date: '2026-08-02',
        time_slot: '10.00 AM - 12.00 PM',
        people: 1,
        people_label: '1 Peoples',
        status: 'cancelled',
        status_label: 'Cancelled',
        cover_image: 'images/mind-space.jpg'
      }
    ]
  };

  let activeTab = 'upcoming';
  let bookingsData = fallbackBookings;

  // Read URL query param ?tab=... if provided
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (['upcoming', 'completed', 'cancelled'].includes(requestedTab)) {
    activeTab = requestedTab;
  }

  // ── HTML Escaping ──────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Render Booking Card ─────────────────────────────────────
  function createBookingCard(item) {
    const card = document.createElement('article');
    card.className = 'booking-card';
    card.dataset.id = item.id;

    const detailUrl = `booking-details.html?id=${item.id}`;
    const spaceUrl = `space-detail.html?id=${item.place_id}`;
    const statusClass = item.status === 'upcoming' ? 'upcoming' : (item.status === 'completed' ? 'completed' : 'cancelled');
    const statusLabel = item.status_label || (item.status.charAt(0).toUpperCase() + item.status.slice(1));
    const peopleText = item.people_label || `${item.people} Peoples`;

    card.innerHTML = `
      <div class="card-main-content">
        <div class="card-img-wrap">
          <a href="${detailUrl}">
            <img src="${escapeHtml(item.cover_image)}" alt="${escapeHtml(item.place_name)}" loading="lazy" onerror="this.onerror=null; this.src='images/national-library.jpg';" />
          </a>
        </div>
        <div class="card-info">
          <h2 class="card-title">
            <a href="${detailUrl}">${escapeHtml(item.place_name)}</a>
          </h2>
          <div class="card-location">${escapeHtml(item.place_city)}</div>
          <div class="card-meta-row" style="margin-bottom: 6px;">
            ${CALENDAR_SVG}
            <span>${escapeHtml(item.booking_date)}&nbsp;&nbsp;${escapeHtml(item.time_slot)}</span>
          </div>
          <div class="card-meta-row">
            ${PERSON_SVG}
            <span>${escapeHtml(peopleText)}</span>
          </div>
        </div>
      </div>
      <div class="card-actions-col">
        <div class="status-badge ${statusClass}">${escapeHtml(statusLabel)}</div>
        <a href="${detailUrl}" class="btn-view-details">View Details</a>
      </div>
    `;

    return card;
  }

  // ── Render List for Active Tab ──────────────────────────────
  function renderBookings() {
    bookingsList.innerHTML = '';
    const list = bookingsData[activeTab] || [];

    // Update counts in tab buttons
    if (countUpcoming) countUpcoming.textContent = `(${bookingsData.upcoming ? bookingsData.upcoming.length : 0})`;
    if (countCompleted) countCompleted.textContent = `(${bookingsData.completed ? bookingsData.completed.length : 0})`;
    if (countCancelled) countCancelled.textContent = `(${bookingsData.cancelled ? bookingsData.cancelled.length : 0})`;

    // Update Active Tab Styling
    [tabUpcoming, tabCompleted, tabCancelled].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    if (activeTab === 'upcoming' && tabUpcoming) tabUpcoming.classList.add('active');
    if (activeTab === 'completed' && tabCompleted) tabCompleted.classList.add('active');
    if (activeTab === 'cancelled' && tabCancelled) tabCancelled.classList.add('active');

    if (list.length === 0) {
      const tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      bookingsList.innerHTML = `
        <div class="bookings-empty-state">
          <div class="empty-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3 class="empty-title">No ${tabTitle} Bookings</h3>
          <p class="empty-desc">You don't have any ${activeTab} reservations at the moment. Find your perfect study spot and reserve a seat now.</p>
          <a href="explore.html" class="btn-explore-now">Explore Study Spaces</a>
        </div>
      `;
      return;
    }

    list.forEach(item => {
      bookingsList.appendChild(createBookingCard(item));
    });
  }

  // ── Tab Click Handlers ──────────────────────────────────────
  if (tabUpcoming) {
    tabUpcoming.addEventListener('click', () => {
      activeTab = 'upcoming';
      renderBookings();
    });
  }
  if (tabCompleted) {
    tabCompleted.addEventListener('click', () => {
      activeTab = 'completed';
      renderBookings();
    });
  }
  if (tabCancelled) {
    tabCancelled.addEventListener('click', () => {
      activeTab = 'cancelled';
      renderBookings();
    });
  }

  // ── Fetch Live Bookings From MySQL Database ─────────────────
  async function fetchLiveBookings() {
    let userId = 1;
    try {
      const stored = localStorage.getItem('study_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) userId = u.id;
      }
    } catch (_) {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`php/get_user_bookings.php?user_id=${userId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bookings) {
          bookingsData = data.bookings;
          renderBookings();
          return;
        }
      }
    } catch (e) {
      console.info('Loaded offline seed bookings matching PNG & database.');
    }

    // Render fallback data
    renderBookings();
  }

  // Initial load
  fetchLiveBookings();
});
