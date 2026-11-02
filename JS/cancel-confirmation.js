/* ============================================================
   StudySpot – cancel-confirmation.js
   Frontend logic for Cancellation Confirmed page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const confirmVenueImg = document.getElementById('confirmVenueImg');
  const confirmVenueName = document.getElementById('confirmVenueName');
  const confirmVenueCity = document.getElementById('confirmVenueCity');
  const confirmBookingRef = document.getElementById('confirmBookingRef');
  const confirmDate = document.getElementById('confirmDate');
  const confirmTime = document.getElementById('confirmTime');
  const confirmPeople = document.getElementById('confirmPeople');
  const confirmReason = document.getElementById('confirmReason');
  const confirmRefundVal = document.getElementById('confirmRefundVal');
  const refundStatusTitle = document.getElementById('refundStatusTitle');

  // Parse URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const bookingIdParam = urlParams.get('id') || urlParams.get('booking_id');
  const bookingId = bookingIdParam ? parseInt(bookingIdParam, 10) : 1;
  const reasonParam = urlParams.get('reason') || 'My plans changed';

  // Fallback defaults
  const fallbackData = {
    id: bookingId,
    booking_ref: '#SS-100231',
    place_name: 'Hub Lanka',
    place_city: 'Colombo 03',
    cover_image: 'images/hub-lanka.jpg',
    booking_date: '2026-10-30',
    time_slot: '02:00 PM - 04:00 PM',
    people: 2,
    total_price: 600,
    cancellation_reason: reasonParam
  };

  // ── Populate View ───────────────────────────────────────────
  function populateConfirmation(data) {
    if (!data) return;

    if (confirmVenueName) confirmVenueName.textContent = data.place_name || fallbackData.place_name;
    if (confirmVenueCity) confirmVenueCity.textContent = data.place_city || fallbackData.place_city;
    if (confirmVenueImg && data.cover_image) {
      confirmVenueImg.src = data.cover_image;
      confirmVenueImg.alt = data.place_name || 'Study Space';
    }

    if (confirmBookingRef) {
      confirmBookingRef.textContent = data.booking_ref || (data.id ? `#SS-${data.id}` : fallbackData.booking_ref);
    }

    if (confirmDate) confirmDate.textContent = data.booking_date || fallbackData.booking_date;
    if (confirmTime) confirmTime.textContent = data.time_slot || fallbackData.time_slot;
    
    if (confirmPeople) {
      const p = data.people != null ? data.people : fallbackData.people;
      confirmPeople.textContent = p + (p === 1 ? ' Person' : ' Peoples');
    }

    if (confirmReason) {
      confirmReason.textContent = data.cancellation_reason || reasonParam;
    }

    const price = data.total_price != null ? Math.round(data.total_price) : fallbackData.total_price;
    if (confirmRefundVal) confirmRefundVal.textContent = 'Rs. ' + price;
    if (refundStatusTitle) refundStatusTitle.textContent = `Full refund of Rs. ${price} initiated`;
  }

  // Check sessionStorage first
  let loadedFromSession = false;
  try {
    const sessionRecord = sessionStorage.getItem('studyspot_cancelled_booking');
    if (sessionRecord) {
      const parsed = JSON.parse(sessionRecord);
      if (parsed && (parsed.id == bookingId || !bookingId)) {
        populateConfirmation(parsed);
        loadedFromSession = true;
      }
    }
  } catch (e) {
    console.warn('SessionStorage read error:', e);
  }

  // If not in session, try DB
  if (!loadedFromSession && bookingId > 0) {
    fetch(`php/get_booking_detail.php?id=${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network error or booking not found');
        return res.json();
      })
      .then(resData => {
        if (resData && resData.success && resData.booking) {
          const b = resData.booking;
          const merged = {
            id: b.id || b.booking_id || bookingId,
            booking_ref: b.payment_ref ? `#${b.payment_ref}` : `#SS-${b.id || bookingId}`,
            place_name: b.place_name,
            place_city: b.place_city,
            cover_image: b.cover_image,
            booking_date: b.booking_date,
            time_slot: b.time_slot,
            people: b.people,
            total_price: parseFloat(b.total_price) || 0,
            cancellation_reason: reasonParam
          };
          populateConfirmation(merged);
        } else {
          populateConfirmation(fallbackData);
        }
      })
      .catch(() => {
        populateConfirmation(fallbackData);
      });
  } else if (!loadedFromSession) {
    populateConfirmation(fallbackData);
  }
});
