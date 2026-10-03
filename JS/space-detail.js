/* ============================================================
   StudySpot – space-detail.js
   Frontend logic for Study Space Details page, Gallery, Reviews & Save
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Get ID from URL (defaults to 1 only when the URL has no ?id=)
  const urlParams = new URLSearchParams(window.location.search);
  let placeId = parseInt(urlParams.get('id') || '1') || 1;

  // DOM Elements
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const mainImage = document.getElementById('mainImage');
  const thumbsRow = document.getElementById('thumbsRow');
  const overviewTitle = document.getElementById('overviewTitle');
  const overviewAddress = document.getElementById('overviewAddress');
  const overviewType = document.getElementById('overviewType');
  const overviewDistance = document.getElementById('overviewDistance');
  const btnSave = document.getElementById('btnSave');
  const btnShare = document.getElementById('btnShare');
  const btnBookSpot = document.getElementById('btnBookSpot');
  const btnWriteReview = document.getElementById('btnWriteReview');

  function updateLinks() {
    if (btnBookSpot) btnBookSpot.href = `booking.html?id=${placeId}`;
    if (btnWriteReview) btnWriteReview.href = `write-review.html?id=${placeId}`;
  }
  updateLinks();

  // Spec fields
  const specHours = document.getElementById('specHours');
  const specDays = document.getElementById('specDays');
  const specWifi = document.getElementById('specWifi');
  const specWifiNote = document.getElementById('specWifiNote');
  const specNoise = document.getElementById('specNoise');
  const specNoiseNote = document.getElementById('specNoiseNote');
  const costValue = document.getElementById('costValue');
  const costNote = document.getElementById('costNote');
  const facilitiesWrap = document.getElementById('facilitiesWrap');
  const aboutText = document.getElementById('aboutText');
  const reviewsCountLabel = document.getElementById('reviewsCountLabel');
  const reviewsList = document.getElementById('reviewsList');

  // Facility Icons Map
  const facilityIcons = {
    'power outlets': `<span style="color:#ef4444;font-size:16px;">📍</span>`,
    'parking': `<span style="color:#dc2626;font-size:16px;">🚗</span>`,
    'air conditioning': `<span style="color:#06b6d4;font-size:16px;">❄️</span>`,
    'drinking water': `<span style="color:#3b82f6;font-size:16px;">💧</span>`,
    'restrooms': `<span style="color:#6b7280;font-size:16px;">🚻</span>`,
  };

  // Load Space Data
  // The page stays blank ("Loading…") until the REAL place is known, so it never shows
  // a different location first and swaps it a moment later.
  async function loadDetail() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);   // don't wait forever on a slow server
    try {
      const res = await fetch(`php/get_space_detail.php?id=${placeId}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (!data.success || !data.place) throw new Error(data.error || 'Failed to load');

      // The server may return another place if the id was not found – always follow it
      placeId = parseInt(data.place.id) || placeId;
      updateLinks();
      renderDetail(data.place, data.reviews, false);
      return;
    } catch (err) {
      console.warn('API error, using offline data for the selected place:', err);
    } finally {
      clearTimeout(timer);
    }

    // Offline fallback: the place the user selected (JS/places-data.js)
    const fb = window.StudySpotPlaces && window.StudySpotPlaces.get(placeId);
    if (fb) {
      renderDetail(fb, [], true);
    } else {
      if (overviewTitle) overviewTitle.textContent = 'Study space not available';
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Not found';
      if (mainImage) mainImage.alt = '';
    }
  }

  function renderDetail(p, reviews, offline) {
    document.title = `${p.name} – StudySpot`;

    // Breadcrumb
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = p.name;

    // Overview Card
    if (overviewTitle) overviewTitle.textContent = p.name;
    if (overviewAddress) overviewAddress.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(p.address)}`;
    if (overviewType) overviewType.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> ${escapeHtml(p.type_label || '')}`;
    if (overviewDistance) overviewDistance.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> ${escapeHtml(p.distance_text || (Number(p.distance_km).toFixed(1) + ' km from you'))}`;

    // Gallery & Thumbnails
    const gallery = (p.gallery && p.gallery.length > 0) ? p.gallery : [p.cover_image];
    const initialMain = gallery[0] || p.cover_image || 'images/placeholder.svg';
    if (mainImage) {
      mainImage.src = initialMain;
      mainImage.alt = p.name;
    }

    if (thumbsRow) {
      thumbsRow.innerHTML = gallery.slice(0, 5).map((img, idx) => `
        <div class="thumb-item ${idx === 0 ? 'active' : ''}" data-src="${img}">
          <img src="${img}" alt="Thumbnail ${idx + 1}" onerror="this.onerror=null;this.src='images/placeholder.svg'">
        </div>
      `).join('');

      thumbsRow.querySelectorAll('.thumb-item').forEach(thumb => {
        thumb.addEventListener('click', () => {
          thumbsRow.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          if (mainImage) {
            mainImage.src = thumb.dataset.src;
          }
        });
      });
    }

    // Spec Cards
    if (specHours) specHours.textContent = p.hours_label || '–';
    if (specDays) specDays.textContent = p.open_days || '';
    if (specWifi) specWifi.textContent = p.wifi_label || '–';
    if (specWifiNote) specWifiNote.textContent = p.wifi_note || '';
    if (specNoise) specNoise.textContent = p.noise_label || '–';
    if (specNoiseNote) specNoiseNote.textContent = p.noise_note || '';

    // Cost
    if (costValue) costValue.textContent = p.cost_label || '–';
    if (costNote) costNote.textContent = p.cost_note || '';

    // Facilities
    if (facilitiesWrap && p.facilities) {
      facilitiesWrap.innerHTML = p.facilities.map(fac => {
        const key = fac.toLowerCase();
        const icon = facilityIcons[key] || `<span style="font-size:16px;">✔️</span>`;
        return `
          <div class="facility-chip">
            ${icon}
            <span>${escapeHtml(fac)}</span>
          </div>`;
      }).join('');
    }

    // About
    if (aboutText && p.description) {
      aboutText.textContent = p.description;
    }

    // Reviews
    const revCount = (p.total_reviews != null) ? p.total_reviews : (reviews ? reviews.length : null);
    if (reviewsCountLabel) {
      reviewsCountLabel.textContent = (!offline && revCount != null) ? `Reviews (${revCount})` : 'Reviews';
    }

    if (reviewsList) {
      if (reviews && reviews.length > 0) {
        reviewsList.innerHTML = reviews.map(r => {
          const starsHtml = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
          return `
          <div class="review-card-item">
            <div class="review-user-row">
              <div class="review-user-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div class="review-user-info">
                <span class="review-user-name">${escapeHtml(r.user_name || 'Anonymous')}</span>
                <span class="review-stars">${starsHtml}</span>
                <span class="review-time">${escapeHtml(r.time_ago || '')}</span>
              </div>
            </div>
            <p class="review-text">${escapeHtml(r.comment)}</p>
          </div>
        `;
        }).join('');
      } else {
        reviewsList.innerHTML = `<p class="review-text" style="color:#6b7280;">${offline ? 'Reviews could not be loaded right now.' : 'No reviews yet. Be the first to write one!'
          }</p>`;
      }
    }
  }

  // ── Save / Favorite button ──────────────────────────────────
  if (btnSave) {
    let isSaved = false;
    btnSave.addEventListener('click', async () => {
      isSaved = !isSaved;
      if (isSaved) {
        btnSave.classList.add('saved');
        btnSave.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg> Saved`;
      } else {
        btnSave.classList.remove('saved');
        btnSave.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg> Save`;
      }

      // Try sending to toggle_favorite API
      try {
        const formData = new FormData();
        formData.append('place_id', placeId);
        await fetch('php/toggle_favorite.php', { method: 'POST', body: formData });
      } catch (err) {
        // silent fallback
      }
    });
  }

  // ── Share button ────────────────────────────────────────────
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href,
        }).catch(() => { });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          const original = btnShare.innerHTML;
          btnShare.innerHTML = `<span>Copied link!</span>`;
          setTimeout(() => { btnShare.innerHTML = original; }, 2000);
        }).catch(() => {
          alert('Link copied to clipboard!');
        });
      }
    });
  }

  // ── Helper ──────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialize
  loadDetail();
});
