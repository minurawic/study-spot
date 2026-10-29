/* ============================================================
   StudySpot – payment-failed.js
   Frontend logic for Payment Failed page & Database integration
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Read URL Search Parameters ───────────────────────────
  const params = new URLSearchParams(window.location.search);

  const bookingId  = parseInt(params.get('booking_id') || params.get('id') || '0', 10);
  const paymentRef = decodeURIComponent(params.get('ref') || params.get('payment_ref') || '');
  const placeId    = parseInt(params.get('place_id') || '0', 10);

  // Direct param overrides (if redirected directly from payment.js or booking.js)
  const paramPlaceName = decodeURIComponent(params.get('place_name') || '');
  const paramPlaceCity = decodeURIComponent(params.get('place_city') || '');
  const paramCoverImg  = decodeURIComponent(params.get('cover_image') || params.get('img') || '');
  const paramDate      = params.get('booking_date') || params.get('date') || '';
  const paramStart     = params.get('start_time') || params.get('start') || '';
  const paramEnd       = params.get('end_time') || params.get('end') || '';
  const paramPeople    = params.get('people') || '';
  const paramPrice     = params.get('total_price') || params.get('price') || '';
  const paramReason    = decodeURIComponent(params.get('reason') || 'Card declined by bank.');
  const paramDesc      = decodeURIComponent(params.get('desc') || 'Please check your card details or try another payment method. You have not been charged.');

  // ── 2. DOM Elements ─────────────────────────────────────────
  const failedImg       = document.getElementById('failedImg');
  const failedPlaceName = document.getElementById('failedPlaceName');
  const failedPlaceCity = document.getElementById('failedPlaceCity');
  const failedDate      = document.getElementById('failedDate');
  const failedTime      = document.getElementById('failedTime');
  const failedPeople    = document.getElementById('failedPeople');
  const failedPrice     = document.getElementById('failedPrice');
  const failedReason    = document.getElementById('failedReason');
  const failedDesc      = document.getElementById('failedDesc');
  const btnTryAgain     = document.getElementById('btnTryAgain');
  const btnBackBooking  = document.getElementById('btnBackBooking');

  // ── 3. Exact Fallback Data (Matching PNG mockup) ───────────
  const DEFAULT_FAILED_DATA = {
    id: 1,
    place_id: 5,
    place_name: 'The Library Cafe',
    place_city: 'Kandy',
    cover_image: 'images/library-cafe.jpg',
    booking_date: '2026-09-12',
    start_time: '10:00:00',
    end_time: '12:00:00',
    formatted_time: '10.00 AM - 12.00 PM',
    people: 1,
    total_price: 500,
    formatted_price: 'Rs. 500',
    payment_ref: 'SS-100231',
    reason: 'Card declined by bank.',
    description: 'Please check your card details or try another payment method. You have not been charged.'
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

  /** Set up button URLs with booking state for retry */
  function setupButtons(data) {
    const effectivePlaceId = data.place_id || DEFAULT_FAILED_DATA.place_id;

    // Try Again -> Takes the user back to payment.html with booking params
    const paymentParams = new URLSearchParams({
      booking_id:   data.id || DEFAULT_FAILED_DATA.id,
      place_id:     effectivePlaceId,
      place_name:   data.place_name || DEFAULT_FAILED_DATA.place_name,
      place_city:   data.place_city || DEFAULT_FAILED_DATA.place_city,
      cover_image:  data.cover_image || DEFAULT_FAILED_DATA.cover_image,
      booking_date: data.booking_date || DEFAULT_FAILED_DATA.booking_date,
      start_time:   data.start_time || DEFAULT_FAILED_DATA.start_time,
      end_time:     data.end_time || DEFAULT_FAILED_DATA.end_time,
      people:       data.people || DEFAULT_FAILED_DATA.people,
      total_price:  data.total_price != null ? data.total_price : DEFAULT_FAILED_DATA.total_price,
      payment_ref:  data.payment_ref || DEFAULT_FAILED_DATA.payment_ref
    });

    btnTryAgain.href = `payment.html?${paymentParams.toString()}`;

    // Back to Booking -> Takes the user to booking page for that space
    btnBackBooking.href = `booking.html?id=${effectivePlaceId}`;
  }

  /** Render booking failure data into UI */
  function renderFailedPage(data) {
    failedPlaceName.textContent = data.place_name || DEFAULT_FAILED_DATA.place_name;
    failedPlaceCity.textContent = data.place_city || DEFAULT_FAILED_DATA.place_city;
    failedDate.textContent      = data.booking_date || DEFAULT_FAILED_DATA.booking_date;
    failedTime.textContent      = data.formatted_time || DEFAULT_FAILED_DATA.formatted_time;
    failedPeople.textContent    = data.people || DEFAULT_FAILED_DATA.people;
    failedPrice.textContent     = data.formatted_price || DEFAULT_FAILED_DATA.formatted_price;

    failedReason.textContent    = data.reason || paramReason || DEFAULT_FAILED_DATA.reason;
    failedDesc.textContent      = data.description || paramDesc || DEFAULT_FAILED_DATA.description;

    let imgSrc = data.cover_image || DEFAULT_FAILED_DATA.cover_image;
    if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('images/')) {
      imgSrc = 'images/' + imgSrc;
    }
    failedImg.src = imgSrc || 'images/library-cafe.jpg';
    failedImg.alt = data.place_name || 'Study Space';

    document.title = `Payment Failed – ${data.place_name || 'StudySpot'}`;

    setupButtons(data);
  }

  // ── 4. Fetch Booking Data from MySQL Database API ────────────
  async function loadPaymentFailedData() {
    // If explicit URL params were provided from a form redirection, use them first
    if (paramPlaceName && paramDate) {
      let timeStr = '';
      if (paramStart && paramEnd) {
        timeStr = `${formatTime(paramStart)} - ${formatTime(paramEnd)}`;
      } else if (paramStart) {
        timeStr = formatTime(paramStart);
      }

      const localData = {
        id: bookingId || DEFAULT_FAILED_DATA.id,
        place_id: placeId || DEFAULT_FAILED_DATA.place_id,
        place_name: paramPlaceName,
        place_city: paramPlaceCity,
        cover_image: paramCoverImg || 'images/library-cafe.jpg',
        booking_date: paramDate,
        start_time: paramStart,
        end_time: paramEnd,
        formatted_time: timeStr || DEFAULT_FAILED_DATA.formatted_time,
        people: paramPeople || 1,
        total_price: paramPrice ? parseFloat(paramPrice) : DEFAULT_FAILED_DATA.total_price,
        formatted_price: paramPrice ? formatPrice(paramPrice) : DEFAULT_FAILED_DATA.formatted_price,
        payment_ref: paymentRef || DEFAULT_FAILED_DATA.payment_ref,
        reason: paramReason,
        description: paramDesc
      };

      renderFailedPage(localData);
      return;
    }

    // Try fetching from the PHP MySQL API
    try {
      const queryParams = new URLSearchParams();
      if (bookingId > 0) queryParams.set('booking_id', bookingId);
      if (paymentRef)    queryParams.set('ref', paymentRef);
      if (placeId > 0)   queryParams.set('place_id', placeId);
      if (paramReason)   queryParams.set('reason', paramReason);
      if (paramDesc)     queryParams.set('desc', paramDesc);

      const url = `php/get_payment_failed.php?${queryParams.toString()}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          renderFailedPage(data.data);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch booking from database API, using fallback data:', err);
    }

    // Offline / demo fallback – renders exactly what is in the PNG
    renderFailedPage(DEFAULT_FAILED_DATA);
  }

  // Initialize
  loadPaymentFailedData();
});
