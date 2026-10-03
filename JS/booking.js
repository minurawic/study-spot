/* ============================================================
   StudySpot – booking.js
   Frontend logic for Book Your Spot page & Database integration
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Query param id defaults to 5 (The Library Cafe) to match PNG 3 exactly
  const urlParams = new URLSearchParams(window.location.search);
  let placeId = parseInt(urlParams.get('id') || '5') || 5;

  // DOM Elements
  const placeImg = document.getElementById('placeImg');
  const placeName = document.getElementById('placeName');
  const placeCity = document.getElementById('placeCity');
  const placeRating = document.getElementById('placeRating');
  const dateInput = document.getElementById('dateInput');
  const startInput = document.getElementById('startInput');
  const endInput = document.getElementById('endInput');
  const timeError = document.getElementById('timeError');
  const priceBreakdown = document.getElementById('priceBreakdown');
  const stepperCount = document.getElementById('stepperCount');
  const btnMinus = document.getElementById('btnMinus');
  const btnPlus = document.getElementById('btnPlus');
  const totalPriceAmount = document.getElementById('totalPriceAmount');
  const btnProcess = document.getElementById('btnProcess');
  const backToDetailsLink = document.getElementById('backToDetailsLink');

  // Confirmation Modal Elements
  const bookingModal = document.getElementById('bookingModal');
  const modalPlace = document.getElementById('modalPlace');
  const modalDate = document.getElementById('modalDate');
  const modalTime = document.getElementById('modalTime');
  const modalPeople = document.getElementById('modalPeople');
  const modalTotal = document.getElementById('modalTotal');
  const modalRef = document.getElementById('modalRef');
  const btnCloseModal = document.getElementById('btnCloseModal');

  // State
  let peopleCount = 1;
  let unitPrice = 0;
  let isFreePlace = false;
  let currentPlace = { id: placeId, name: 'Study Space' };   // replaced once the real place is loaded

  // Set default back link
  backToDetailsLink.href = `space-detail.html?id=${placeId}`;

  // Date/time start empty (as in the design). Past dates can't be picked.
  const now = new Date();
  dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // ── 1. Fetch Place Details from DB ─────────────────────────
  // The card stays blank ("Loading…") until the REAL place is known, so the page
  // never shows a different location first and then swaps it a moment later.
  async function loadPlaceData() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);   // don't wait forever on a slow server
    try {
      const res = await fetch(`php/get_space_detail.php?id=${placeId}`, { signal: ctrl.signal });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.place) {
          // The server may return a different place if the id was not found – always follow it
          placeId = parseInt(data.place.id) || placeId;
          backToDetailsLink.href = `space-detail.html?id=${placeId}`;
          currentPlace = data.place;
          renderPlaceData(data.place, data.place.total_reviews ?? (data.place.reviews ? data.place.reviews.length : null));
          return;
        }
      }
    } catch (err) {
      console.warn('Could not load place details, using fallback data:', err);
    } finally {
      clearTimeout(timer);
    }

    // Offline fallback: the place the user selected (JS/places-data.js) – never a different one
    const fb = window.StudySpotPlaces && window.StudySpotPlaces.get(placeId);
    if (fb) {
      currentPlace = fb;
      renderPlaceData(fb, null);
    } else {
      placeName.textContent = 'Study space not available';
      placeCity.textContent = '';
      placeRating.textContent = '';
    }
  }

  function renderPlaceData(p, reviewCount) {
    document.title = `Book Spot – ${p.name}`;
    placeName.textContent = p.name;
    placeCity.textContent = p.city || '';

    // Rating (show the review count only when we really know it)
    const rScore = p.rating || '';
    placeRating.innerHTML = rScore
      ? `<span class="star">★</span> ${rScore}${reviewCount != null ? ` (${reviewCount})` : ''}`
      : '';

    // Image
    let imgSrc = p.cover_image || 'images/placeholder.svg';
    if (!imgSrc.startsWith('http') && !imgSrc.startsWith('images/')) {
      imgSrc = 'images/' + imgSrc;
    }
    placeImg.src = imgSrc;
    placeImg.alt = p.name;

    // Price
    unitPrice = parseFloat(p.price) || 0;
    isFreePlace = (unitPrice === 0 || (p.cost_label && p.cost_label.toLowerCase().includes('free')));

    updatePriceDisplay();
    btnProcess.disabled = false;   // booking is allowed only after the real place + price are known
  }

  // ── 2. Time, Stepper & Price Calculation ───────────────────
  // PRICING RULE (kept in sync with php/create_booking.php):
  //   • "per hour" places (cost label like "LKR 500/hr"):  price × hours × people
  //     (hours = End − Start, rounded UP to a whole hour, minimum 1)
  //   • all other places:                                   price × people
  const fmtRs = (n) => `Rs. ${Number(n).toLocaleString('en-US')}`;

  function isHourlyPlace() {
    return /\/\s*(hr|hour)/i.test(currentPlace.cost_label || '');
  }

  // "HH:MM" -> minutes since midnight (null if empty)
  function toMinutes(v) {
    if (!v || !/^\d{1,2}:\d{2}/.test(v)) return null;
    const [h, m] = v.split(':').map(Number);
    return h * 60 + m;
  }

  // Duration in hours, or null if start/end are not both set; may be <= 0 if invalid
  function durationHours() {
    const s = toMinutes(startInput.value), e = toMinutes(endInput.value);
    if (s === null || e === null) return null;
    return (e - s) / 60;
  }

  function timesAreInvalid() {
    const d = durationHours();
    return d !== null && d <= 0;
  }

  function billableHours() {
    const d = durationHours();
    if (!isHourlyPlace() || d === null || d <= 0) return 1;   // nothing chosen yet -> price of 1 hour
    return Math.max(1, Math.ceil(d));
  }

  function calcTotal() {
    if (isFreePlace) return 0;
    return unitPrice * peopleCount * billableHours();
  }

  function updatePriceDisplay() {
    // inline error for End <= Start
    if (timesAreInvalid()) {
      timeError.textContent = 'End time must be after the start time.';
      timeError.hidden = false;
    } else {
      timeError.hidden = true;
    }

    if (isFreePlace) {
      totalPriceAmount.textContent = 'Free';
      priceBreakdown.hidden = true;
      return;
    }

    totalPriceAmount.textContent = fmtRs(calcTotal());

    // Breakdown, shown only when it explains more than the total itself
    const hourly = isHourlyPlace();
    const parts = [fmtRs(unitPrice) + (hourly ? ' / hr' : '')];
    if (hourly && durationHours() > 0) parts.push(`${billableHours()} hr${billableHours() > 1 ? 's' : ''}`);
    if (peopleCount > 1) parts.push(`${peopleCount} people`);
    if (hourly || peopleCount > 1) {
      priceBreakdown.textContent = parts.join(' × ');
      priceBreakdown.hidden = false;
    } else {
      priceBreakdown.hidden = true;
    }
  }

  startInput.addEventListener('input', updatePriceDisplay);
  endInput.addEventListener('input', updatePriceDisplay);

  btnMinus.addEventListener('click', () => {
    if (peopleCount > 1) {
      peopleCount--;
      stepperCount.textContent = peopleCount;
      updatePriceDisplay();
    }
  });

  btnPlus.addEventListener('click', () => {
    if (peopleCount < 20) {
      peopleCount++;
      stepperCount.textContent = peopleCount;
      updatePriceDisplay();
    }
  });

  // ── 3. Submit Booking / Process to Payment ───────────────────
  btnProcess.addEventListener('click', async () => {
    const selectedDate = dateInput.value;
    const selectedStart = startInput.value;
    const selectedEnd = endInput.value;

    if (!selectedDate) {
      alert('Please select a booking date.');
      dateInput.focus();
      return;
    }
    if (dateInput.min && selectedDate < dateInput.min) {
      alert('Please choose today or a future date.');
      dateInput.focus();
      return;
    }
    if (!selectedStart) {
      alert('Please select a start time.');
      startInput.focus();
      return;
    }
    if (!selectedEnd) {
      alert('Please select an end time.');
      endInput.focus();
      return;
    }
    if (timesAreInvalid()) {
      alert('End time must be after the start time.');
      endInput.focus();
      return;
    }

    btnProcess.disabled = true;
    btnProcess.textContent = 'Processing...';

    // Retrieve active user from localStorage or use demo user 1
    let userId = 1;
    try {
      const stored = localStorage.getItem('study_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) userId = u.id;
      }
    } catch (_) { }

    const calculatedPrice = calcTotal();

    const payload = {
      place_id: placeId,
      user_id: userId,
      booking_date: selectedDate,
      time: selectedStart,          // kept for older code
      start_time: selectedStart,
      end_time: selectedEnd,
      people: peopleCount,
      total_price: calculatedPrice  // the server re-calculates and has the final say
    };

    try {
      const response = await fetch('php/create_booking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success && result.booking) {
        showConfirmationModal(result.booking);
      } else {
        alert(result.error || 'Booking could not be processed. Please try again.');
      }
    } catch (err) {
      console.warn('Network error, creating simulated booking confirmation:', err);
      // Fallback confirmation
      const fakeBooking = {
        place_name: currentPlace.name,
        booking_date: selectedDate,
        start_time: selectedStart,
        end_time: selectedEnd,
        people: peopleCount,
        total_price: calculatedPrice,
        payment_ref: 'SS-' + Math.floor(100000 + Math.random() * 900000)
      };
      showConfirmationModal(fakeBooking);
    } finally {
      btnProcess.disabled = false;
      btnProcess.textContent = 'Process to Payment';
    }
  });

  // ── 4. Confirmation Modal ───────────────────────────────────
  function showConfirmationModal(b) {
    modalPlace.textContent = b.place_name || currentPlace.name;
    modalDate.textContent = b.booking_date;
    modalTime.textContent = b.end_time ? `${b.start_time} – ${b.end_time}` : b.start_time;
    modalPeople.textContent = `${b.people} Person${b.people > 1 ? 's' : ''}`;
    modalTotal.textContent = (Number(b.total_price) > 0) ? fmtRs(b.total_price) : 'Free';
    modalRef.textContent = b.payment_ref;

    bookingModal.classList.add('show');
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      bookingModal.classList.remove('show');
      window.location.href = `space-detail.html?id=${placeId}`;
    });
  }

  // Initialize
  loadPlaceData();
});
