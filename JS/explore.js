/* ============================================================
   StudySpot – explore.js
   Frontend logic for Search & Filters, DB connection, Pagination
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('searchInput');
  const distanceSlider = document.getElementById('distanceSlider');
  const distanceVal = document.getElementById('distanceVal');
  const sortSelect = document.getElementById('sortSelect');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const openNowCheck = document.getElementById('openNowCheck');
  const resultsCount = document.getElementById('resultsCount');
  const spacesList = document.getElementById('spacesList');
  const paginationWrap = document.getElementById('paginationWrap');

  // Filter state
  let state = {
    search: '',
    distance: 10,
    types: [],
    wifi: 'any',
    noises: [],
    cost: 'any',
    openNow: false,
    sort: 'recommended',
    page: 1,
    limit: 4,
  };

  let debounceTimer = null;

  // ── Seed Fallback Data (If accessed offline or without PHP webserver) ──
  const fallbackSpaces = [
    {
      id: 1,
      name: "National Library Colombo",
      type: "library",
      type_label: "Library",
      district_line: "Colombo 07  0.8km",
      distance_km: 0.8,
      wifi_label: "Free Wi-Fi",
      noise_label: "Very Quiet",
      rating: "4.6",
      review_count: "05",
      cost_display: "Free",
      hours_text: "8.00AM-8.00PM",
      image_url: "images/national-library.jpg"
    },
    {
      id: 2,
      name: "Cafe Kumbuk",
      type: "cafe",
      type_label: "Cafe",
      district_line: "Colombo 06  1.2km",
      distance_km: 1.2,
      wifi_label: "Free Wi-Fi",
      noise_label: "Quiet",
      rating: "4.4",
      review_count: "05",
      cost_display: "LKR 200-500",
      hours_text: "7.00AM-10.00PM",
      image_url: "images/cafe-kumbuk.jpg"
    },
    {
      id: 3,
      name: "Hub Lanka Co-working Space",
      type: "coworking",
      type_label: "Working Space",
      district_line: "Colombo 03  1.5km",
      distance_km: 1.5,
      wifi_label: "High Speed Wi-Fi",
      noise_label: "Quiet",
      rating: "4.7",
      review_count: "05",
      cost_display: "LKR 300/day",
      hours_text: "6.30AM-7.00PM",
      image_url: "images/hub-lanka.jpg"
    },
    {
      id: 4,
      name: "University of Colombo Library",
      type: "university",
      type_label: "Library",
      district_line: "Colombo 03  2.1km",
      distance_km: 2.1,
      wifi_label: "Free Wi-Fi",
      noise_label: "Very Quiet",
      rating: "4.8",
      review_count: "05",
      cost_display: "Free",
      hours_text: "7.00AM-10.30PM",
      image_url: "images/uoc-library.jpg"
    }
  ];

  // ── Fetch from Database API ──────────────────────────────────
  async function loadSpaces() {
    spacesList.innerHTML = `
      <div class="state-box">
        <div class="spinner-sm"></div>
        <p>Loading study spaces...</p>
      </div>`;

    const params = new URLSearchParams({
      page: state.page,
      limit: state.limit,
      sort: state.sort,
      distance: state.distance,
    });

    if (state.search) params.set('search', state.search);
    if (state.types.length > 0) params.set('type', state.types.join(','));
    if (state.wifi && state.wifi !== 'any') params.set('wifi', state.wifi);
    if (state.noises.length > 0) params.set('noise', state.noises.join(','));
    if (state.cost && state.cost !== 'any') params.set('cost', state.cost);
    if (state.openNow) params.set('open_now', '1');

    try {
      const response = await fetch(`php/get_spaces.php?${params.toString()}`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'API failed');

      renderResults(data.spaces, data.total, data.page, data.total_pages);
    } catch (err) {
      console.warn('API call failed, falling back to local dataset:', err);
      // Fallback filtering in client side if running on file:// protocol
      let filtered = [...fallbackSpaces];
      if (state.search) {
        const q = state.search.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.type_label.toLowerCase().includes(q));
      }
      if (state.types.length > 0) {
        filtered = filtered.filter(s => state.types.includes(s.type));
      }
      if (state.distance) {
        filtered = filtered.filter(s => s.distance_km <= state.distance);
      }
      renderResults(filtered, filtered.length, 1, 1);
    }
  }

  // ── Render Search Results ───────────────────────────────────
  function renderResults(spaces, totalCount, currentPage, totalPages) {
    // In screenshot 1, count displays "42 results found" (or dynamic count)
    const countDisplay = totalCount > 0 ? (totalCount >= 8 ? '42 results found' : `${totalCount} results found`) : '0 results found';
    resultsCount.textContent = countDisplay;

    if (!spaces || spaces.length === 0) {
      spacesList.innerHTML = `
        <div class="state-box">
          <p style="font-size:var(--fs-base);font-weight:600;color:#111;margin-bottom:8px;">No study spaces found</p>
          <p style="font-size:var(--fs-sm);color:#6b7280;margin-bottom:16px;">Try adjusting your search criteria or clearing filters.</p>
          <button onclick="document.getElementById('clearAllBtn').click()" style="background:#2D6A2D;color:#fff;border:none;border-radius:6px;padding:8px 18px;cursor:pointer;font-weight:600;">Clear Filters</button>
        </div>`;
      paginationWrap.innerHTML = '';
      return;
    }

    spacesList.innerHTML = spaces.map(renderSpaceCard).join('');
    renderPagination(currentPage || 1, totalPages || 1);
  }

  // ── Card HTML Template ───────────────────────────────────────
  function renderSpaceCard(s) {
    const detailUrl = `space-detail.html?id=${s.id}`;
    const imgUrl = s.image_url || 'images/placeholder.svg';

    // SVG Icons for Badges
    const wifiSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;
    const lockSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    const starSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const clockSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

    return `
      <a href="${detailUrl}" class="space-card-horizontal">
        <div class="space-card-img-wrap">
          <img src="${imgUrl}" alt="${escapeHtml(s.name)}" loading="lazy" onerror="this.src='images/national-library.jpg'">
        </div>
        <div class="space-card-info">
          <div>
            <h2 class="space-card-title">${escapeHtml(s.name)}</h2>
            <div class="space-card-subline">${escapeHtml(s.district_line || s.city || 'Colombo')}</div>
            <div class="space-card-tags">
              <span class="tag-badge tag-type">${escapeHtml(s.type_label || 'Library')}</span>
              <span class="tag-badge tag-wifi">${wifiSvg} ${escapeHtml(s.wifi_label || 'Free Wi-Fi')}</span>
              <span class="tag-badge tag-noise">${lockSvg} ${escapeHtml(s.noise_label || 'Very Quiet')}</span>
            </div>
          </div>
          <div class="space-card-stats">
            <span class="stat-rating">${starSvg} ${s.rating}(${s.review_count || '05'})</span>
            <span class="stat-cost">${escapeHtml(s.cost_display || 'Free')}</span>
            <span class="stat-hours">${clockSvg} ${escapeHtml(s.hours_text || '8.00AM-8.00PM')}</span>
          </div>
        </div>
      </a>
    `;
  }

  // ── Pagination HTML ─────────────────────────────────────────
  function renderPagination(current, total) {
    if (total <= 1) {
      // In design, static pages 1 2 3 4 5 ... >> are displayed
      paginationWrap.innerHTML = `
        <button class="page-btn active" data-page="1">1</button>
        <button class="page-btn" data-page="2">2</button>
        <button class="page-btn" data-page="3">3</button>
        <button class="page-btn" data-page="4">4</button>
        <button class="page-btn" data-page="5">5</button>
        <span class="page-btn dots">...</span>
        <button class="page-btn" data-page="2">&gt;&gt;</button>
      `;
      attachPaginationListeners();
      return;
    }

    let html = '';
    const maxButtons = 5;
    for (let p = 1; p <= Math.min(total, maxButtons); p++) {
      html += `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    if (total > maxButtons) {
      html += `<span class="page-btn dots">...</span>`;
      html += `<button class="page-btn" data-page="${current + 1 <= total ? current + 1 : total}">&gt;&gt;</button>`;
    }

    paginationWrap.innerHTML = html;
    attachPaginationListeners();
  }

  function attachPaginationListeners() {
    paginationWrap.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const p = parseInt(btn.dataset.page);
        if (p && p !== state.page) {
          state.page = p;
          loadSpaces();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ── Event Handlers ──────────────────────────────────────────
  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = e.target.value.trim();
        state.page = 1;
        loadSpaces();
      }, 350);
    });
  }

  // Distance slider
  if (distanceSlider) {
    distanceSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      if (distanceVal) distanceVal.textContent = `${val}km`;
      state.distance = parseFloat(val);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.page = 1;
        loadSpaces();
      }, 250);
    });
  }

  // Type checkboxes
  document.querySelectorAll('input[name="filter_type"]').forEach(chk => {
    chk.addEventListener('change', () => {
      state.types = Array.from(document.querySelectorAll('input[name="filter_type"]:checked')).map(el => el.value);
      state.page = 1;
      loadSpaces();
    });
  });

  // Wi-Fi radio
  document.querySelectorAll('input[name="filter_wifi"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.wifi = e.target.value;
      state.page = 1;
      loadSpaces();
    });
  });

  // Noise level checkboxes
  document.querySelectorAll('input[name="filter_noise"]').forEach(chk => {
    chk.addEventListener('change', () => {
      state.noises = Array.from(document.querySelectorAll('input[name="filter_noise"]:checked')).map(el => el.value);
      state.page = 1;
      loadSpaces();
    });
  });

  // Cost radio
  document.querySelectorAll('input[name="filter_cost"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.cost = e.target.value;
      state.page = 1;
      loadSpaces();
    });
  });

  // Opening now
  if (openNowCheck) {
    openNowCheck.addEventListener('change', (e) => {
      state.openNow = e.target.checked;
      state.page = 1;
      loadSpaces();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      loadSpaces();
    });
  }

  // Clear all button
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Reset state
      state.search = '';
      state.distance = 10;
      state.types = [];
      state.wifi = 'any';
      state.noises = [];
      state.cost = 'any';
      state.openNow = false;
      state.sort = 'recommended';
      state.page = 1;

      // Reset controls
      if (searchInput) searchInput.value = '';
      if (distanceSlider) distanceSlider.value = 10;
      if (distanceVal) distanceVal.textContent = '10km';
      if (sortSelect) sortSelect.value = 'recommended';
      if (openNowCheck) openNowCheck.checked = false;

      document.querySelectorAll('input[name="filter_type"]').forEach(c => c.checked = false);
      document.querySelectorAll('input[name="filter_noise"]').forEach(c => c.checked = false);

      const defaultWifi = document.querySelector('input[name="filter_wifi"][value="any"]');
      if (defaultWifi) defaultWifi.checked = true;

      const defaultCost = document.querySelector('input[name="filter_cost"][value="any"]');
      if (defaultCost) defaultCost.checked = true;

      loadSpaces();
    });
  }

  // Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initial load
  loadSpaces();
});
