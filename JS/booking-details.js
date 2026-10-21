/* ============================================================
   StudySpot – booking-details.js
   Frontend logic for single booking detail view & DB sync
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = parseInt(urlParams.get('id') || '1', 10) || 1;

  // DOM Elements
  const bookingRefBadge = document.getElementById('bookingRefBadge');
  const headerStatusBadge = document.getElementById('headerStatusBadge');
  const venueImg = document.getElementById('venueImg');
  const venueName = document.getElementById('venueName');
  const venueTypeCity = document.getElementById('venueTypeCity');
  const venueAddress = document.getElementById('venueAddress');
  const btnViewSpace = document.getElementById('btnViewSpace');

  const detailDate = document.getElementById('detailDate');
  const detailTime = document.getElementById('detailTime');
  const detailGuests = document.getElementById('detailGuests');
  const detailWifi = document.getElementById('detailWifi');
  const detailNoise = document.getElementById('detailNoise');
  const detailHours = document.getElementById('detailHours');

  const receiptRef = document.getElementById('receiptRef');
  const receiptStatus = document.getElementById('receiptStatus');
  const receiptTotal = document.getElementById('receiptTotal');
  const receiptBookedBy = document.getElementById('receiptBookedBy');
  const receiptDate = document.getElementById('receiptDate');
  const facilitiesContainer = document.getElementById('facilitiesContainer');

  const btnCancelBooking = document.getElementById('btnCancelBooking');
  const btnBookAgain = document.getElementById('btnBookAgain');
  const btnPrintTicket = document.getElementById('btnPrintTicket');
  const btnGetDirections = document.getElementById('btnGetDirections');

  // Cancel Modal Elements
  const cancelModal = document.getElementById('cancelModal');
  const btnCloseCancelModal = document.getElementById('btnCloseCancelModal');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');

  // ── Seed Fallback Records Matching MySQL Database ──────────
  const fallbackRecords = {
    1: {
      id: 1,
      booking_id: 1,
      place_id: 5,
      place_name: 'The Library Cafe',
      place_type: 'Cafe',
      place_city: 'Kandy',
      place_address: 'Peradeniya Road, Kandy',
      cover_image: 'images/library-cafe.jpg',
      rating: 4.8,
      booking_date: '2026-09-12',
      time_slot: '10.00 AM - 12.00 PM',
      people: 1,
      people_label: '1 Peoples',
      total_price: 500.00,
      status: 'upcoming',
      status_label: 'Upcoming',
      payment_ref: 'SS-100231',
      created_at: '2026-09-23 04:12:06',
      wifi: 'Free (Free Wi-Fi)',
      noise_level: 'Quiet (Calm and comfortable)',
      open_time: '08:00',
      close_time: '21:00',
      open_days: 'Monday - Sunday',
      user_name: 'Sahan Perera',
      user_email: 'sahan@example.com',
      facilities: ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms']
    },
    2: {
      id: 2,
      booking_id: 2,
      place_id: 8,
      place_name: 'Green Space',
      place_type: 'University',
      place_city: 'Kandy',
      place_address: 'University of Peradeniya, Kandy',
      cover_image: 'images/green-space.jpg',
      rating: 4.5,
      booking_date: '2026-09-15',
      time_slot: '02.00 PM - 04.00 PM',
      people: 2,
      people_label: '2 Peoples',
      total_price: 0.00,
      status: 'upcoming',
      status_label: 'Upcoming',
      payment_ref: 'SS-100232',
      created_at: '2026-09-23 04:12:06',
      wifi: 'Free (Free Wi-Fi)',
      noise_level: 'Moderate (Open air, light chatter)',
      open_time: '07:00',
      close_time: '18:00',
      open_days: 'Monday - Sunday',
      user_name: 'Sahan Perera',
      user_email: 'sahan@example.com',
      facilities: ['Power Outlets', 'Parking', 'Drinking Water', 'Restrooms']
    },
    3: {
      id: 3,
      booking_id: 3,
      place_id: 2,
      place_name: 'Cafe Kumbuk',
      place_type: 'Cafe',
      place_city: 'Colombo',
      place_address: 'Colombo 06, Sri Lanka',
      cover_image: 'images/cafe-kumbuk.jpg',
      rating: 4.5,
      booking_date: '2026-08-20',
      time_slot: '09.00 AM - 11.00 AM',
      people: 1,
      people_label: '1 Peoples',
      total_price: 350.00,
      status: 'completed',
      status_label: 'Completed',
      payment_ref: 'SS-100198',
      created_at: '2026-09-23 04:12:06',
      wifi: 'Free (Free Wi-Fi)',
      noise_level: 'Quiet (Soft background music)',
      open_time: '07:00',
      close_time: '22:00',
      open_days: 'Monday - Sunday',
      user_name: 'Sahan Perera',
      user_email: 'sahan@example.com',
      facilities: ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms']
    },
    4: {
      id: 4,
      booking_id: 4,
      place_id: 3,
      place_name: 'Hub Lanka Co-working Space',
      place_type: 'Coworking',
      place_city: 'Colombo',
      place_address: 'Colombo 03, Sri Lanka',
      cover_image: 'images/hub-lanka.jpg',
      rating: 4.5,
      booking_date: '2026-08-11',
      time_slot: '08.00 AM - 05.00 PM',
      people: 1,
      people_label: '1 Peoples',
      total_price: 300.00,
      status: 'completed',
      status_label: 'Completed',
      payment_ref: 'SS-100177',
      created_at: '2026-09-23 04:12:06',
      wifi: 'Free (High Speed Wi-Fi)',
      noise_level: 'Quiet (Quiet working floor)',
      open_time: '06:30',
      close_time: '19:00',
      open_days: 'Monday - Saturday',
      user_name: 'Sahan Perera',
      user_email: 'sahan@example.com',
      facilities: ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms']
    },
    5: {
      id: 5,
      booking_id: 5,
      place_id: 1,
      place_name: 'National Library Colombo',
      place_type: 'Library',
      place_city: 'Colombo',
      place_address: 'Colombo 07, Sri Lanka',
      cover_image: 'images/national-library.jpg',
      rating: 4.5,
      booking_date: '2026-07-30',
      time_slot: '01.00 PM - 04.00 PM',
      people: 3,
      people_label: '3 Peoples',
      total_price: 0.00,
      status: 'completed',
      status_label: 'Completed',
      payment_ref: 'SS-100120',
      created_at: '2026-09-23 04:12:06',
      wifi: 'Free (High Speed)',
      noise_level: 'Very Quiet (Perfect for deep focus)',
      open_time: '08:00',
      close_time: '20:00',
      open_days: 'Monday - Sunday',
      user_name: 'Sahan Perera',
      user_email: 'sahan@example.com',
      facilities: ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms']
    },
    6: {
      id: 6,
      booking_id: 6,
      place_id: 6,
      place_name: 'Mind Space',
      place_type: 'Coworking',
      place_city: 'Peradeniya',
      place_address: 'Peradeniya, Kandy',
      cover_image: 'images/mind-space.jpg',
      rating: 4.7,
      booking_date: '2026-08-02',
      time_slot: '10.00 AM - 12.00 PM',
      people: 1,
      people_label: '1 Peoples',
      total_price: 600.00,
      status: 'cancelled',
      status_label: 'Cancelled',
      payment_ref: 'SS-100150',
      created_at: '2026-09-23 04:12:06',
      wifi: 'Paid (Paid Wi-Fi)',
      noise_level: 'Very Quiet (Dedicated silent zone)',
      open_time: '08:00',
      close_time: '20:00',
      open_days: 'Monday - Saturday',
      user_name: 'Sahan Perera',
      user_email: 'sahan@example.com',
      facilities: ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms']
    }
  };

  let currentRecord = fallbackRecords[bookingId] || fallbackRecords[1];

  // ── Render Booking Details ──────────────────────────────────
  function renderDetails(b) {
    document.title = `Booking Details – ${b.place_name} | StudySpot`;

    if (bookingRefBadge) bookingRefBadge.textContent = `#${b.payment_ref}`;
    if (headerStatusBadge) {
      headerStatusBadge.textContent = b.status_label || (b.status.charAt(0).toUpperCase() + b.status.slice(1));
      headerStatusBadge.className = `header-status-badge ${b.status}`;
    }

    if (venueImg) {
      venueImg.src = b.cover_image;
      venueImg.alt = b.place_name;
    }
    if (venueName) venueName.textContent = b.place_name;
    if (venueTypeCity) venueTypeCity.textContent = `${b.place_type} • ${b.place_city}`;
    if (venueAddress) venueAddress.innerHTML = `<span>${b.place_address}</span>`;
    if (btnViewSpace) btnViewSpace.href = `space-detail.html?id=${b.place_id}`;

    if (detailDate) detailDate.textContent = b.booking_date;
    if (detailTime) detailTime.textContent = b.time_slot;
    if (detailGuests) detailGuests.textContent = b.people_label || `${b.people} Peoples`;
    if (detailWifi) detailWifi.textContent = b.wifi || 'Free Wi-Fi';
    if (detailNoise) detailNoise.textContent = b.noise_level || 'Quiet';
    if (detailHours) detailHours.textContent = `${b.open_time} - ${b.close_time} (${b.open_days})`;

    if (receiptRef) receiptRef.textContent = b.payment_ref;
    if (receiptStatus) {
      receiptStatus.textContent = b.status === 'cancelled' ? 'Cancelled' : 'Confirmed / Active';
      receiptStatus.style.color = b.status === 'cancelled' ? '#dc2626' : (b.status === 'completed' ? '#2563eb' : '#2D6A2D');
    }
    if (receiptTotal) {
      receiptTotal.textContent = b.total_price > 0 ? `LKR ${b.total_price.toFixed(2)}` : 'Free (No Fee)';
    }
    if (receiptBookedBy) receiptBookedBy.textContent = `${b.user_name} (${b.user_email})`;
    if (receiptDate) receiptDate.textContent = b.created_at;

    // Render Facilities Chips
    if (facilitiesContainer) {
      facilitiesContainer.innerHTML = '';
      const facs = Array.isArray(b.facilities) ? b.facilities : ['Power Outlets', 'Free Wi-Fi', 'Restrooms'];
      facs.forEach(f => {
        const chip = document.createElement('span');
        chip.className = 'facility-chip';
        chip.textContent = f.trim();
        facilitiesContainer.appendChild(chip);
      });
    }

    // Action buttons configuration
    if (btnBookAgain) {
      btnBookAgain.href = `booking.html?id=${b.place_id}`;
    }
    if (btnGetDirections) {
      btnGetDirections.href = `map.html`;
    }

    // Cancel Button visibility
    if (btnCancelBooking) {
      if (b.status === 'upcoming') {
        btnCancelBooking.style.display = 'inline-flex';
      } else {
        btnCancelBooking.style.display = 'none';
      }
    }
  }

  // ── Print Ticket ────────────────────────────────────────────
  if (btnPrintTicket) {
    btnPrintTicket.addEventListener('click', () => {
      window.print();
    });
  }

  // ── Cancel Modal & Handling ─────────────────────────────────
  if (btnCancelBooking) {
    btnCancelBooking.addEventListener('click', () => {
      if (cancelModal) cancelModal.classList.add('show');
    });
  }

  if (btnCloseCancelModal) {
    btnCloseCancelModal.addEventListener('click', () => {
      if (cancelModal) cancelModal.classList.remove('show');
    });
  }

  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', async () => {
      btnConfirmCancel.disabled = true;
      btnConfirmCancel.textContent = 'Cancelling...';

      try {
        const res = await fetch('php/cancel_booking.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: currentRecord.id })
        });
        const result = await res.json();
        if (result.success) {
          currentRecord.status = 'cancelled';
          currentRecord.status_label = 'Cancelled';
          renderDetails(currentRecord);
          if (cancelModal) cancelModal.classList.remove('show');
          alert('Booking has been cancelled successfully.');
        } else {
          alert(result.error || 'Could not cancel booking.');
        }
      } catch (err) {
        // Offline simulation
        currentRecord.status = 'cancelled';
        currentRecord.status_label = 'Cancelled';
        renderDetails(currentRecord);
        if (cancelModal) cancelModal.classList.remove('show');
        alert('Booking has been cancelled.');
      } finally {
        btnConfirmCancel.disabled = false;
        btnConfirmCancel.textContent = 'Yes, Cancel';
      }
    });
  }

  // ── Fetch Live Details from Database ────────────────────────
  async function fetchLiveDetails() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`php/get_booking_detail.php?id=${bookingId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          currentRecord = data.booking;
          renderDetails(currentRecord);
          return;
        }
      }
    } catch (_) {
      console.info('Showing booking details from offline seed record.');
    }

    renderDetails(currentRecord);
  }

  fetchLiveDetails();
});
