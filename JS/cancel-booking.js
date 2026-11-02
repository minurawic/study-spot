/* ============================================================
   StudySpot – cancel-booking.js
   Frontend logic for Cancel Booking flow with live DB connection
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const venueImg = document.getElementById('venueImg');
  const venueName = document.getElementById('venueName');
  const venueCity = document.getElementById('venueCity');
  const bookingDate = document.getElementById('bookingDate');
  const bookingTime = document.getElementById('bookingTime');
  const bookingPeople = document.getElementById('bookingPeople');
  const bookingPrice = document.getElementById('bookingPrice');
  const refundTitle = document.getElementById('refundTitle');
  const refundDesc = document.getElementById('refundDesc');
  const otherReasonWrap = document.getElementById('otherReasonWrap');
  const otherReasonText = document.getElementById('otherReasonText');
  const btnConfirmCancellation = document.getElementById('btnConfirmCancellation');
  const btnKeepBooking = document.getElementById('btnKeepBooking');
  const reasonOptions = document.querySelectorAll('.reason-option');

  // Parse URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const bookingIdParam = urlParams.get('id') || urlParams.get('booking_id');
  const bookingId = bookingIdParam ? parseInt(bookingIdParam, 10) : 0;

  // Fallback data matching PNG mockup if offline or no DB record
  const fallbackBooking = {
    id: bookingId || 1,
    booking_ref: '#SS-100231',
    place_name: 'Hub Lanka',
    place_city: 'Colombo 03',
    cover_image: 'images/hub-lanka.jpg',
    booking_date: '2026-10-30',
    time_slot: '02:00 PM - 04:00 PM',
    people: 2,
    total_price: 600,
    status: 'upcoming'
  };

  let activeBooking = Object.assign({}, fallbackBooking);

  // ── Populate View with Booking Data ─────────────────────────
  function populateView(b) {
    if (!b) return;

    if (venueName) venueName.textContent = b.place_name || fallbackBooking.place_name;
    if (venueCity) venueCity.textContent = b.place_city || fallbackBooking.place_city;

    if (venueImg && b.cover_image) {
      venueImg.src = b.cover_image;
      venueImg.alt = b.place_name || 'Study Space';
    }

    if (bookingDate) bookingDate.textContent = b.booking_date || fallbackBooking.booking_date;
    if (bookingTime) bookingTime.textContent = b.time_slot || fallbackBooking.time_slot;
    if (bookingPeople) bookingPeople.textContent = b.people != null ? b.people : fallbackBooking.people;

    const formattedPrice = b.total_price != null ? Math.round(b.total_price) : fallbackBooking.total_price;
    if (bookingPrice) bookingPrice.textContent = 'Rs. ' + formattedPrice;
    if (refundTitle) refundTitle.textContent = 'Full refund: Rs. ' + formattedPrice;
  }

  // Initial population from fallback/mockup
  populateView(activeBooking);

  // ── Fetch Booking Detail from Database (if ID given) ────────
  if (bookingId > 0) {
    fetch(`php/get_booking_detail.php?id=${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network error or booking not found');
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.booking) {
          const b = data.booking;
          activeBooking = {
            id: b.id || b.booking_id || bookingId,
            booking_ref: b.payment_ref ? `#${b.payment_ref}` : `#SS-${b.id || bookingId}`,
            place_name: b.place_name,
            place_city: b.place_city,
            cover_image: b.cover_image,
            booking_date: b.booking_date,
            time_slot: b.time_slot,
            people: b.people,
            total_price: parseFloat(b.total_price) || 0,
            status: b.status
          };
          populateView(activeBooking);
        }
      })
      .catch(err => {
        console.warn('Using mockup fallback data (DB offline or local file):', err.message);
      });
  }

  // ── Reason Selection Radio Group Interaction ─────────────────
  reasonOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      reasonOptions.forEach(o => {
        o.classList.remove('selected');
        const r = o.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });

      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const val = opt.getAttribute('data-value');
      if (val === 'Other') {
        if (otherReasonWrap) {
          otherReasonWrap.classList.add('show');
          if (otherReasonText) otherReasonText.focus();
        }
      } else {
        if (otherReasonWrap) otherReasonWrap.classList.remove('show');
      }
    });
  });

  // ── Keep Booking Button ──────────────────────────────────────
  if (btnKeepBooking) {
    btnKeepBooking.addEventListener('click', (e) => {
      e.preventDefault();
      if (bookingId > 0) {
        window.location.href = `booking-details.html?id=${bookingId}`;
      } else {
        window.location.href = 'my-bookings.html';
      }
    });
  }

  // ── Confirm Cancellation Execution ──────────────────────────
  if (btnConfirmCancellation) {
    btnConfirmCancellation.addEventListener('click', async () => {
      // Get selected reason
      const selectedOption = document.querySelector('.reason-option.selected');
      let reason = selectedOption ? selectedOption.getAttribute('data-value') : 'My plans changed';
      if (reason === 'Other' && otherReasonText && otherReasonText.value.trim()) {
        reason = `Other: ${otherReasonText.value.trim()}`;
      }

      btnConfirmCancellation.disabled = true;
      btnConfirmCancellation.textContent = 'Processing Cancellation...';

      const payload = {
        booking_id: activeBooking.id,
        id: activeBooking.id,
        reason: reason
      };

      try {
        // Send cancellation request to backend API
        const response = await fetch('php/cancel_booking.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Cancellation result:', result);
      } catch (err) {
        console.warn('Backend request failed or running without local PHP server:', err.message);
      }

      // Persist cancellation info in sessionStorage for confirmation page
      activeBooking.status = 'cancelled';
      activeBooking.cancellation_reason = reason;
      sessionStorage.setItem('studyspot_cancelled_booking', JSON.stringify(activeBooking));

      // Also update any localStorage bookings if present
      try {
        const localBookings = JSON.parse(localStorage.getItem('studyspot_bookings') || '[]');
        const idx = localBookings.findIndex(b => b.id === activeBooking.id);
        if (idx !== -1) {
          localBookings[idx].status = 'cancelled';
          localBookings[idx].cancellation_reason = reason;
          localStorage.setItem('studyspot_bookings', JSON.stringify(localBookings));
        }
      } catch (e) {
        // ignore
      }

      // Redirect to Cancellation Success Confirmation page
      const targetUrl = `cancel-confirmation.html?id=${encodeURIComponent(activeBooking.id)}&reason=${encodeURIComponent(reason)}`;
      window.location.href = targetUrl;
    });
  }
});
