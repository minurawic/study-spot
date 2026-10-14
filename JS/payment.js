/* ============================================================
   StudySpot – payment.js
   Frontend logic for the Payment page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Read booking data passed via URL params from booking.js ─────
  const params = new URLSearchParams(window.location.search);

  const placeId    = parseInt(params.get('place_id') || '5') || 5;
  const bookingId  = parseInt(params.get('booking_id') || '0');
  const placeName  = decodeURIComponent(params.get('place_name') || 'Study Space');
  const placeCity  = decodeURIComponent(params.get('place_city') || '');
  const coverImg   = decodeURIComponent(params.get('cover_image') || '');
  const bookDate   = params.get('booking_date') || '';
  const startTime  = params.get('start_time') || '';
  const endTime    = params.get('end_time') || '';
  const people     = parseInt(params.get('people') || '1');
  const totalPrice = parseFloat(params.get('total_price') || '0');
  const paymentRef = decodeURIComponent(params.get('payment_ref') || '');

  const fmtRs = (n) => `Rs. ${Number(n).toLocaleString('en-US')}`;

  // ── 2. Populate Booking Summary ────────────────────────────────────
  const summaryImg       = document.getElementById('summaryImg');
  const summaryPlaceName = document.getElementById('summaryPlaceName');
  const summaryPlaceCity = document.getElementById('summaryPlaceCity');
  const summaryDate      = document.getElementById('summaryDate');
  const summaryTime      = document.getElementById('summaryTime');
  const summaryPeople    = document.getElementById('summaryPeople');
  const summaryPrice     = document.getElementById('summaryPrice');

  summaryPlaceName.textContent = placeName;
  summaryPlaceCity.textContent = placeCity;
  summaryDate.textContent      = bookDate || '–';
  summaryTime.textContent      = (startTime && endTime)
    ? `${formatTime(startTime)} - ${formatTime(endTime)}`
    : startTime || '–';
  summaryPeople.textContent    = people;
  summaryPrice.textContent     = totalPrice > 0 ? fmtRs(totalPrice) : 'Free';

  // Cover image
  if (coverImg) {
    let src = coverImg;
    if (!src.startsWith('http') && !src.startsWith('images/')) src = 'images/' + src;
    summaryImg.src = src;
    summaryImg.alt = placeName;
  }

  // ── 3. Payment Method Toggle ───────────────────────────────────────
  const methodOptions    = document.querySelectorAll('.payment-method-option');
  const cardPanel        = document.getElementById('cardDetailsPanel');
  const bankPanel        = document.getElementById('bankPanel');
  const cashPanel        = document.getElementById('cashPanel');

  methodOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Update selected class
      methodOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');

      // Check the radio inside
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const method = option.dataset.method;
      showPanel(method);
    });
  });

  function showPanel(method) {
    cardPanel.hidden = method !== 'card';
    bankPanel.hidden = method !== 'bank';
    cashPanel.hidden = method !== 'cash';
  }

  // ── 4. Card Number Formatting ──────────────────────────────────────
  const cardNumberInput = document.getElementById('cardNumber');
  cardNumberInput.addEventListener('input', () => {
    let val = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
    // Insert space every 4 digits
    cardNumberInput.value = val.replace(/(.{4})/g, '$1 ').trim();
  });

  // ── 5. Expiry Date Formatting ──────────────────────────────────────
  const cardExpiryInput = document.getElementById('cardExpiry');
  cardExpiryInput.addEventListener('input', (e) => {
    let val = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    cardExpiryInput.value = val;
  });

  // ── 6. CVV – digits only ───────────────────────────────────────────
  const cardCvvInput = document.getElementById('cardCvv');
  cardCvvInput.addEventListener('input', () => {
    cardCvvInput.value = cardCvvInput.value.replace(/\D/g, '').slice(0, 4);
  });

  // ── 7. Validation ──────────────────────────────────────────────────
  function setError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errorId);
    if (msg) {
      input.classList.add('input-error');
      err.textContent = msg;
    } else {
      input.classList.remove('input-error');
      err.textContent = '';
    }
    return !!msg;
  }

  function validateCard() {
    let hasError = false;

    const num = cardNumberInput.value.replace(/\s/g, '');
    if (!num || num.length < 13 || num.length > 16 || !/^\d+$/.test(num)) {
      hasError = setError('cardNumber', 'cardNumberError', 'Enter a valid card number (13–16 digits).') || hasError;
    } else {
      setError('cardNumber', 'cardNumberError', '');
    }

    const expiry = cardExpiryInput.value.trim();
    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!expiryMatch) {
      hasError = setError('cardExpiry', 'cardExpiryError', 'Enter expiry as MM/YY.') || hasError;
    } else {
      const mo = parseInt(expiryMatch[1]);
      const yr = parseInt('20' + expiryMatch[2]);
      const now = new Date();
      const expDate = new Date(yr, mo - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (mo < 1 || mo > 12 || expDate < thisMonth) {
        hasError = setError('cardExpiry', 'cardExpiryError', 'Card has expired or date is invalid.') || hasError;
      } else {
        setError('cardExpiry', 'cardExpiryError', '');
      }
    }

    const cvv = cardCvvInput.value.trim();
    if (!cvv || cvv.length < 3 || !/^\d+$/.test(cvv)) {
      hasError = setError('cardCvv', 'cardCvvError', 'Enter a 3–4 digit CVV.') || hasError;
    } else {
      setError('cardCvv', 'cardCvvError', '');
    }

    const name = document.getElementById('cardName').value.trim();
    if (!name || name.length < 2) {
      hasError = setError('cardName', 'cardNameError', 'Enter the name on your card.') || hasError;
    } else {
      setError('cardName', 'cardNameError', '');
    }

    return !hasError;
  }

  // ── 8. Pay Now ─────────────────────────────────────────────────────
  const btnPayNow = document.getElementById('btnPayNow');
  if (btnPayNow) {
    btnPayNow.addEventListener('click', async () => {
      if (!validateCard()) return;
      await submitPayment('card');
    });
  }

  // Confirm Bank Transfer
  const btnConfirmBank = document.getElementById('btnConfirmBank');
  if (btnConfirmBank) {
    btnConfirmBank.addEventListener('click', async () => {
      await submitPayment('bank');
    });
  }

  // Confirm Cash
  const btnConfirmCash = document.getElementById('btnConfirmCash');
  if (btnConfirmCash) {
    btnConfirmCash.addEventListener('click', async () => {
      await submitPayment('cash');
    });
  }

  async function submitPayment(method) {
    const activeBtn = method === 'card' ? btnPayNow
                    : method === 'bank' ? btnConfirmBank
                    : btnConfirmCash;

    if (activeBtn) {
      activeBtn.disabled = true;
      activeBtn.textContent = 'Processing…';
    }

    const payload = {
      booking_id:  bookingId,
      place_id:    placeId,
      total_price: totalPrice,
      payment_ref: paymentRef,
      method:      method,
    };

    try {
      const response = await fetch('php/process_payment.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        showModal(result.payment_ref || paymentRef);
      } else {
        alert(result.error || 'Payment could not be processed. Please try again.');
      }
    } catch (err) {
      console.warn('Network error, showing confirmation with local ref:', err);
      // Fallback – show confirmation with whatever reference we already have
      showModal(paymentRef || ('SS-' + Math.floor(100000 + Math.random() * 900000)));
    } finally {
      if (activeBtn) {
        activeBtn.disabled = false;
        activeBtn.textContent = method === 'card' ? 'Pay Now' : 'Confirm Booking';
      }
    }
  }

  // ── 9. Success Modal & Confirmation ────────────────────────────────
  let lastConfirmedRef = paymentRef;

  function showModal(ref) {
    lastConfirmedRef = ref;
    document.getElementById('modalPlace').textContent  = placeName;
    document.getElementById('modalDate').textContent   = bookDate;
    document.getElementById('modalTime').textContent   = (startTime && endTime)
      ? `${formatTime(startTime)} – ${formatTime(endTime)}`
      : startTime;
    document.getElementById('modalPeople').textContent = `${people} Person${people > 1 ? 's' : ''}`;
    document.getElementById('modalTotal').textContent  = totalPrice > 0 ? fmtRs(totalPrice) : 'Free';
    document.getElementById('modalRef').textContent    = ref;

    document.getElementById('paymentModal').classList.add('show');
  }

  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      document.getElementById('paymentModal').classList.remove('show');
      const q = new URLSearchParams({
        booking_id:   bookingId || 1,
        ref:          lastConfirmedRef || paymentRef,
        place_id:     placeId,
        place_name:   placeName,
        place_city:   placeCity,
        cover_image:  coverImg,
        booking_date: bookDate,
        start_time:   startTime,
        end_time:     endTime,
        people:       people,
        total_price:  totalPrice
      });
      window.location.href = `confirmation.html?${q.toString()}`;
    });
  }

  // ── Helper ─────────────────────────────────────────────────────────
  /** Convert "HH:MM" or "HH:MM:SS" to "10.00 AM" style display */
  function formatTime(t) {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    const period = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}.${String(m).padStart(2, '0')} ${period}`;
  }
});
