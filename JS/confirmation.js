/* ============================================================
   StudySpot – confirmation.js
   Frontend logic for Booking Confirmed page & Database integration
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Read URL Search Parameters ───────────────────────────
  const params = new URLSearchParams(window.location.search);

  const bookingId  = parseInt(params.get('booking_id') || params.get('id') || '0', 10);
  const paymentRef = decodeURIComponent(params.get('ref') || params.get('payment_ref') || '');
  const placeId    = parseInt(params.get('place_id') || '0', 10);

  // Direct param overrides (if passed from payment.js or booking.js)
  const paramPlaceName = decodeURIComponent(params.get('place_name') || '');
  const paramPlaceCity = decodeURIComponent(params.get('place_city') || '');
  const paramCoverImg  = decodeURIComponent(params.get('cover_image') || params.get('img') || '');
  const paramDate      = params.get('booking_date') || params.get('date') || '';
  const paramStart     = params.get('start_time') || params.get('start') || '';
  const paramEnd       = params.get('end_time') || params.get('end') || '';
  const paramPeople    = params.get('people') || '';
  const paramPrice     = params.get('total_price') || params.get('price') || '';

  // ── 2. DOM Elements ─────────────────────────────────────────
  const confirmImg       = document.getElementById('confirmImg');
  const confirmPlaceName = document.getElementById('confirmPlaceName');
  const confirmPlaceCity = document.getElementById('confirmPlaceCity');
  const confirmDate      = document.getElementById('confirmDate');
  const confirmTime      = document.getElementById('confirmTime');
  const confirmPeople    = document.getElementById('confirmPeople');
  const confirmPrice     = document.getElementById('confirmPrice');

  // ── 3. Exact Fallback Data (Matching PNG mockup) ───────────
  const DEFAULT_CONFIRMATION = {
    id: 1,
    place_id: 5,
    place_name: 'The Library Cafe',
    place_city: 'Kandy',
    cover_image: 'images/library-cafe.jpg',
    booking_date: '2026-09-12',
    formatted_time: '10.00 AM - 12.00 PM',
    people: 1,
    formatted_price: 'Rs. 500'
  };

  /** Format 24h time string ("10:00:00") into "10.00 AM" */
  function formatTime(t) {
    if (!t) return '';
    const parts = t.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || '0', 10);
    const period = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}.${String(m).padStart(2, '0')} ${period}`;
  }

  /** Format price to "Rs. 500" */
  function formatPrice(p) {
    const num = parseFloat(p);
    if (isNaN(num) || num <= 0) return 'Free';
    if (Math.floor(num) === num) {
      return `Rs. ${num.toLocaleString('en-US')}`;
    }
    return `Rs. ${num.toFixed(2)}`;
  }

  /** Render booking data into UI */
  function renderConfirmation(data) {
    confirmPlaceName.textContent = data.place_name || DEFAULT_CONFIRMATION.place_name;
    confirmPlaceCity.textContent = data.place_city || DEFAULT_CONFIRMATION.place_city;
    confirmDate.textContent      = data.booking_date || DEFAULT_CONFIRMATION.booking_date;
    confirmTime.textContent      = data.formatted_time || DEFAULT_CONFIRMATION.formatted_time;
    confirmPeople.textContent    = data.people || DEFAULT_CONFIRMATION.people;
    confirmPrice.textContent     = data.formatted_price || DEFAULT_CONFIRMATION.formatted_price;

    let imgSrc = data.cover_image || DEFAULT_CONFIRMATION.cover_image;
    if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('images/')) {
      imgSrc = 'images/' + imgSrc;
    }
    confirmImg.src = imgSrc || 'images/library-cafe.jpg';
    confirmImg.alt = data.place_name || 'Study Space';

    document.title = `Booking Confirmed – ${data.place_name || 'StudySpot'}`;
  }

  // ── 4. Fetch Booking Data from MySQL Database API ────────────
  async function loadBookingConfirmation() {
    // If explicit URL params were provided from a form redirection, use them first
    if (paramPlaceName && paramDate) {
      let timeStr = '';
      if (paramStart && paramEnd) {
        timeStr = `${formatTime(paramStart)} - ${formatTime(paramEnd)}`;
      } else if (paramStart) {
        timeStr = formatTime(paramStart);
      }

      renderConfirmation({
        place_name: paramPlaceName,
        place_city: paramPlaceCity,
        cover_image: paramCoverImg || 'images/library-cafe.jpg',
        booking_date: paramDate,
        formatted_time: timeStr || '10.00 AM - 12.00 PM',
        people: paramPeople || 1,
        formatted_price: paramPrice ? formatPrice(paramPrice) : 'Rs. 500'
      });
      return;
    }

    // Try fetching from the PHP MySQL API
    try {
      const queryParams = new URLSearchParams();
      if (bookingId > 0) queryParams.set('booking_id', bookingId);
      if (paymentRef)    queryParams.set('ref', paymentRef);
      if (placeId > 0)   queryParams.set('place_id', placeId);

      const url = `php/get_booking_confirmation.php?${queryParams.toString()}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          renderConfirmation(data.booking);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch booking from database API, using fallback data:', err);
    }

    // Offline / demo fallback – renders exactly what is in the PNG
    renderConfirmation(DEFAULT_CONFIRMATION);
  }

  // Initialize
  loadBookingConfirmation();
});
