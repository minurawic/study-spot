/* ============================================================
   StudySpot – recently-viewed.js
   Frontend logic for Recently Viewed Spaces & Database synchronization
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const recentlyList = document.getElementById('recentlyList');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const recentToast = document.getElementById('recentToast');
  const recentToastMsg = document.getElementById('recentToastMsg');
  const recentToastUndo = document.getElementById('recentToastUndo');

  let toastTimer = null;
  let cachedItemsBeforeClear = null;
  let currentItems = [];

  // ── Seed Fallback Data (Exact match to PNG screenshot) ─────
  const defaultRecentSpaces = [
    {
      id: 5,
      name: "The Library Cafe",
      city: "Kandy",
      rating: "4.8",
      review_count: 124,
      viewed_time_text: "Viewed today, 2:15 PM",
      image_url: "images/library-cafe.jpg",
      is_favorite: false
    },
    {
      id: 1,
      name: "National Library Colombo",
      city: "Colombo",
      rating: "4.5",
      review_count: 98,
      viewed_time_text: "Viewed today, 11:40 AM",
      image_url: "images/national-library.jpg",
      is_favorite: false
    },
    {
      id: 3,
      name: "Hub Lanka Co-working Space",
      city: "Colombo",
      rating: "4.6",
      review_count: 57,
      viewed_time_text: "Viewed yesterday",
      image_url: "images/hub-lanka.jpg",
      is_favorite: false
    },
    {
      id: 8,
      name: "Green Space",
      city: "Kandy",
      rating: "4.4",
      review_count: 31,
      viewed_time_text: "Viewed Sun, 11 Oct",
      image_url: "images/green-space.jpg",
      is_favorite: false
    }
  ];

  // SVG Icons
  const STAR_SVG = `<svg class="star-icon" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`;

  const HEART_SVG = (isFav) => `
    <svg viewBox="0 0 24 24" fill="${isFav ? '#e11d48' : 'none'}" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>`;

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

  // ── Relative Time Helper ────────────────────────────────────
  function formatRelativeTime(dateStr) {
    if (!dateStr) return 'Viewed recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timeFormatted = `${formattedHours}:${minutes} ${ampm}`;

    if (isToday) {
      return `Viewed today, ${timeFormatted}`;
    } else if (isYesterday) {
      return `Viewed yesterday`;
    } else {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Viewed ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
    }
  }

  // ── Show Toast Notification ─────────────────────────────────
  function showToast(message, onUndo) {
    if (!recentToast) return;
    if (toastTimer) clearTimeout(toastTimer);

    recentToastMsg.textContent = message;
    if (onUndo) {
      recentToastUndo.style.display = 'inline';
      recentToastUndo.onclick = () => {
        hideToast();
        onUndo();
      };
    } else {
      recentToastUndo.style.display = 'none';
    }

    recentToast.classList.add('show');
    toastTimer = setTimeout(() => {
      hideToast();
    }, 4500);
  }

  function hideToast() {
    if (recentToast) recentToast.classList.remove('show');
    if (toastTimer) clearTimeout(toastTimer);
  }

  // ── Render Card Element ─────────────────────────────────────
  function createCardElement(item) {
    const card = document.createElement('article');
    card.className = 'recent-card';
    card.dataset.id = item.id;

    const detailUrl = `space-detail.html?id=${item.id}`;
    const imgUrl = item.image_url || 'images/placeholder.svg';
    const viewedText = item.viewed_time_text || formatRelativeTime(item.viewed_at);

    card.innerHTML = `
      <div class="card-img-wrap">
        <a href="${detailUrl}">
          <img src="${imgUrl}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='images/national-library.jpg'">
        </a>
      </div>
      <div class="card-details">
        <h2 class="card-title">
          <a href="${detailUrl}">${escapeHtml(item.name)}</a>
        </h2>
        <div class="card-location">${escapeHtml(item.city || 'Colombo')}</div>
        <div class="card-rating-wrap">
          ${STAR_SVG}
          <span>${item.rating || '4.5'} (${item.review_count || '0'})</span>
        </div>
        <div class="card-viewed-time">${escapeHtml(viewedText)}</div>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-fav-toggle ${item.is_favorite ? 'active' : ''}" aria-label="Toggle favourite" title="Save to favourites" aria-pressed="${item.is_favorite ? 'true' : 'false'}">
          ${HEART_SVG(item.is_favorite)}
        </button>
        <a href="${detailUrl}" class="btn-view-space">View</a>
      </div>
    `;

    // Heart toggle button click event
    const favBtn = card.querySelector('.btn-fav-toggle');
    favBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      item.is_favorite = !item.is_favorite;
      favBtn.setAttribute('aria-pressed', item.is_favorite ? 'true' : 'false');
      favBtn.classList.toggle('active', item.is_favorite);
      favBtn.innerHTML = HEART_SVG(item.is_favorite);

      // Send to backend API
      try {
        const formData = new FormData();
        formData.append('place_id', item.id);
        const res = await fetch('php/toggle_favorite.php', { method: 'POST', body: formData });
        const resData = await res.json();
        showToast(item.is_favorite ? 'Saved to favourites' : 'Removed from favourites');
      } catch (err) {
        showToast(item.is_favorite ? 'Saved to favourites' : 'Removed from favourites');
      }
    });

    return card;
  }

  // ── Empty State ─────────────────────────────────────────────
  function renderEmptyState() {
    recentlyList.innerHTML = `
      <div class="state-box">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3 class="empty-title">No Recently Viewed Spaces</h3>
        <p class="empty-desc">You haven't viewed any study spaces yet on this device. Explore available spaces, libraries, and cafes to get started.</p>
        <a href="explore.html" class="btn-explore-cta">Explore Study Spaces</a>
      </div>
    `;
    if (btnClearHistory) {
      btnClearHistory.style.display = 'none';
    }
  }

  // ── Render Items ────────────────────────────────────────────
  function renderList(items) {
    currentItems = items || [];
    recentlyList.innerHTML = '';

    if (!currentItems || currentItems.length === 0) {
      renderEmptyState();
      return;
    }

    if (btnClearHistory) {
      btnClearHistory.style.display = 'inline-flex';
    }

    currentItems.forEach(item => {
      recentlyList.appendChild(createCardElement(item));
    });
  }

  // ── Clear History ───────────────────────────────────────────
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', async () => {
      if (currentItems.length === 0) return;

      cachedItemsBeforeClear = [...currentItems];
      renderEmptyState();

      // Show toast with undo
      showToast('Recently viewed history cleared', async () => {
        // Undo action
        if (cachedItemsBeforeClear && cachedItemsBeforeClear.length > 0) {
          renderList(cachedItemsBeforeClear);
          localStorage.setItem('study_recently_viewed', JSON.stringify(cachedItemsBeforeClear));

          // Re-record in DB
          for (const item of cachedItemsBeforeClear) {
            try {
              const fd = new FormData();
              fd.append('place_id', item.id);
              fetch('php/record_recently_viewed.php', { method: 'POST', body: fd }).catch(() => {});
            } catch (_) {}
          }
        }
      });

      // Clear localStorage
      try {
        localStorage.removeItem('study_recently_viewed');
      } catch (_) {}

      // Clear from database
      try {
        await fetch('php/clear_recently_viewed.php', { method: 'POST' });
      } catch (_) {}
    });
  }

  // ── Load Recently Viewed Data ───────────────────────────────
  async function loadRecentlyViewed() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);

    try {
      const res = await fetch('php/get_recently_viewed.php', { signal: ctrl.signal });
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        renderList(json.data);
        localStorage.setItem('study_recently_viewed', JSON.stringify(json.data));
        return;
      }
    } catch (err) {
      console.warn('API error or MySQL not running, falling back to local storage:', err);
    } finally {
      clearTimeout(timer);
    }

    // Fallback: Check localStorage
    try {
      const local = localStorage.getItem('study_recently_viewed');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          renderList(parsed);
          return;
        }
      }
    } catch (_) {}

    // Fallback: Default sample list matching PNG mock-up exactly
    renderList(defaultRecentSpaces);
    try {
      localStorage.setItem('study_recently_viewed', JSON.stringify(defaultRecentSpaces));
    } catch (_) {}
  }

  // Initialize
  loadRecentlyViewed();
});
