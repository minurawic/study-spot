/* ============================================================
   StudySpot – favourites.js
   Frontend logic for My Favourites page & Database synchronization
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const favouritesList = document.getElementById('favouritesList');
  const favToast = document.getElementById('favToast');
  const favToastMsg = document.getElementById('favToastMsg');
  const favToastUndo = document.getElementById('favToastUndo');

  let toastTimer = null;
  let lastRemovedItem = null;
  let lastRemovedElement = null;
  let lastRemovedIndex = -1;

  // ── Seed Fallback Data (Matching PNG screenshot if offline or file://) ──
  const fallbackFavourites = [
    {
      id: 5,
      name: "The Library Cafe",
      city: "Kandy",
      rating: "4.8",
      review_count: 124,
      image_url: "images/library-cafe.jpg"
    },
    {
      id: 6,
      name: "Mind Space",
      city: "Peradeniya",
      rating: "4.7",
      review_count: 74,
      image_url: "images/mind-space.jpg"
    },
    {
      id: 7,
      name: "Book Haven",
      city: "Kandy",
      rating: "4.5",
      review_count: 44,
      image_url: "images/book-haven.jpg"
    }
  ];

  let currentItems = [];

  // SVG Icons
  const STAR_SVG = `<svg class="star-icon" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`;

  const HEART_FILLED_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

  // ── Show Toast Notification ─────────────────────────────────
  function showToast(message, onUndo) {
    if (!favToast) return;
    if (toastTimer) clearTimeout(toastTimer);

    favToastMsg.textContent = message;
    if (onUndo) {
      favToastUndo.style.display = 'inline';
      favToastUndo.onclick = () => {
        hideToast();
        onUndo();
      };
    } else {
      favToastUndo.style.display = 'none';
    }

    favToast.classList.add('show');
    toastTimer = setTimeout(() => {
      hideToast();
    }, 4500);
  }

  function hideToast() {
    if (favToast) favToast.classList.remove('show');
    if (toastTimer) clearTimeout(toastTimer);
  }

  // ── Render Favorite Card ────────────────────────────────────
  function createCardElement(item) {
    const card = document.createElement('article');
    card.className = 'favourite-card';
    card.dataset.id = item.id;

    const detailUrl = `space-detail.html?id=${item.id}`;
    const imgUrl = item.image_url || 'images/placeholder.svg';

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
        <div class="card-location">${escapeHtml(item.city || 'Kandy')}</div>
        <div class="card-rating-wrap">
          ${STAR_SVG}
          <span>${item.rating || '4.5'} (${item.review_count || '0'})</span>
        </div>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-fav-toggle" aria-label="Remove from favourites" title="Remove from favourites">
          ${HEART_FILLED_SVG}
        </button>
        <a href="${detailUrl}" class="btn-view-space">View</a>
      </div>
    `;

    // Heart toggle button click event
    const favBtn = card.querySelector('.btn-fav-toggle');
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      removeFavourite(item, card);
    });

    return card;
  }

  // ── Empty State ─────────────────────────────────────────────
  function renderEmptyState() {
    favouritesList.innerHTML = `
      <div class="state-box">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 class="empty-title">No Favourites Yet</h3>
        <p class="empty-desc">You haven't added any study spaces to your favourites. Browse our spaces and tap the heart icon to save your preferred spots here.</p>
        <a href="explore.html" class="btn-explore-cta">Explore Study Spaces</a>
      </div>
    `;
  }

  // ── Remove Favorite with Animation and DB Sync ──────────────
  async function removeFavourite(item, cardElement) {
    const itemIndex = currentItems.findIndex(i => i.id === item.id);
    lastRemovedItem = item;
    lastRemovedElement = cardElement;
    lastRemovedIndex = itemIndex;

    // Smooth exit animation
    cardElement.classList.add('removing');

    // Remove from in-memory list
    if (itemIndex > -1) {
      currentItems.splice(itemIndex, 1);
    }

    // After animation, remove element from DOM
    setTimeout(() => {
      if (cardElement.parentNode) {
        cardElement.parentNode.removeChild(cardElement);
      }
      if (currentItems.length === 0) {
        renderEmptyState();
      }
    }, 300);

    // Call API to remove from database
    try {
      const formData = new FormData();
      formData.append('place_id', item.id);
      const res = await fetch('php/toggle_favorite.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      console.log('Toggle favorite response:', data);
    } catch (err) {
      console.warn('Could not sync removal with database (running offline?):', err);
    }

    // Show undo toast
    showToast(`Removed "${item.name}" from favourites`, () => {
      undoRemove();
    });
  }

  // ── Undo Removal ────────────────────────────────────────────
  async function undoRemove() {
    if (!lastRemovedItem) return;

    const itemToRestore = lastRemovedItem;
    const restoredCard = createCardElement(itemToRestore);

    // Restore into array
    if (lastRemovedIndex >= 0 && lastRemovedIndex <= currentItems.length) {
      currentItems.splice(lastRemovedIndex, 0, itemToRestore);
    } else {
      currentItems.push(itemToRestore);
    }

    // If empty state was showing, clear it first
    if (favouritesList.querySelector('.state-box')) {
      favouritesList.innerHTML = '';
    }

    // Insert back into DOM
    const cards = favouritesList.querySelectorAll('.favourite-card');
    if (cards.length > lastRemovedIndex && cards[lastRemovedIndex]) {
      favouritesList.insertBefore(restoredCard, cards[lastRemovedIndex]);
    } else {
      favouritesList.appendChild(restoredCard);
    }

    // Call API to re-add to database
    try {
      const formData = new FormData();
      formData.append('place_id', itemToRestore.id);
      await fetch('php/toggle_favorite.php', {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.warn('Could not sync undo with database:', err);
    }

    showToast(`Restored "${itemToRestore.name}"`);
    lastRemovedItem = null;
    lastRemovedElement = null;
    lastRemovedIndex = -1;
  }

  // ── Load Favorites from MySQL Database API ──────────────────
  async function loadFavourites() {
    favouritesList.innerHTML = `
      <div class="state-box">
        <div class="state-spinner"></div>
        <p style="color:var(--text-muted);font-weight:500;">Loading your favourite spaces...</p>
      </div>
    `;

    try {
      const res = await fetch('php/get_favorites.php');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'API response failed');

      currentItems = data.favorites || [];

      renderFavourites(currentItems);
    } catch (err) {
      console.warn('Loading from MySQL API failed, falling back to local dataset:', err);
      // Offline fallback
      currentItems = [...fallbackFavourites];
      renderFavourites(currentItems);
    }
  }

  // ── Render Favorites Array ──────────────────────────────────
  function renderFavourites(items) {
    favouritesList.innerHTML = '';

    if (!items || items.length === 0) {
      renderEmptyState();
      return;
    }

    items.forEach(item => {
      const card = createCardElement(item);
      favouritesList.appendChild(card);
    });
  }

  // Initialize
  loadFavourites();
});
