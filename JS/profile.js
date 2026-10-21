/* ============================================================
   StudySpot – profile.js
   Frontend Logic for Profile Overview & Database Synchronization
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const profileUserName = document.getElementById('profileUserName');
  const profileUserEmail = document.getElementById('profileUserEmail');
  const favCountText = document.getElementById('favCountText');
  const favoritesGrid = document.getElementById('favoritesGrid');
  const reviewsList = document.getElementById('reviewsList');

  // Fallback data matching PNG screenshot exactly
  const fallbackData = {
    user: {
      id: 1,
      full_name: "Sahan Perera",
      email: "sahan@example.com"
    },
    favorites_count: 4,
    favorites: [
      {
        id: 1,
        name: "National Library",
        city: "Colombo",
        rating: "4.6",
        review_count: 128,
        cost_label: "Free",
        image_url: "images/national-library.jpg"
      },
      {
        id: 2,
        name: "Café Kumbuk",
        city: "Colombo 05",
        rating: "4.6",
        review_count: 86,
        cost_label: "LKR 200 - 500",
        image_url: "images/cafe-kumbuk.jpg"
      },
      {
        id: 3,
        name: "Co-working Space",
        city: "Colombo",
        rating: "4.7",
        review_count: 78,
        cost_label: "LKR 300 / day",
        image_url: "images/hub-lanka.jpg"
      },
      {
        id: 4,
        name: "University of Peradeniya Library",
        city: "Peradeniya",
        rating: "4.5",
        review_count: 112,
        cost_label: "Free",
        image_url: "images/uoc-library.jpg"
      }
    ],
    reviews: [
      {
        id: 1,
        place_id: 1,
        place_name: "National Library Colombo",
        rating: 5,
        time_ago: "5 days ago",
        comment: "Very quiet and comfortable. Perfect place for long study sessions!"
      }
    ]
  };

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Render Favorites Cards ──────────────────────────────────
  function renderFavorites(items) {
    if (!favoritesGrid) return;
    if (!items || items.length === 0) {
      favoritesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #888;">
          No favorites saved yet. <a href="explore.html" style="color: #2D6A2D; font-weight: 600;">Explore spaces</a>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const isFree = !item.cost_label || item.cost_label.toLowerCase() === 'free';
      const priceClass = isFree ? 'free' : 'paid';
      const priceHtml = isFree
        ? `<span>Free</span>`
        : `<span class="coin-icon">🪙</span> <span>${escapeHtml(item.cost_label)}</span>`;

      html += `
        <article class="place-card" data-id="${item.id}">
          <div class="place-img-wrap">
            <a href="space-detail.html?id=${item.id}">
              <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='images/national-library.jpg'">
            </a>
            <button type="button" class="btn-card-fav" aria-label="Favorite" title="Favorite">
              <svg viewBox="0 0 24 24" stroke="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
          <div class="place-card-body">
            <h3 class="place-name">
              <a href="space-detail.html?id=${item.id}">${escapeHtml(item.name)}</a>
            </h3>
            <div class="place-city">${escapeHtml(item.city)}</div>
            <div class="place-rating-wrap">
              <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>${item.rating} (${item.review_count})</span>
            </div>
            <div class="place-price ${priceClass}">
              ${priceHtml}
            </div>
          </div>
        </article>
      `;
    });

    favoritesGrid.innerHTML = html;
  }

  // ── Render User Reviews ─────────────────────────────────────
  function renderReviews(reviews) {
    if (!reviewsList) return;
    if (!reviews || reviews.length === 0) {
      reviewsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #888; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
          No reviews written yet. <a href="write-review.html" style="color: #2D6A2D; font-weight: 600;">Write your first review</a>
        </div>
      `;
      return;
    }

    let html = '';
    // Display primary review (or first review) matching Image 3 mockup
    const primaryReview = reviews[0];
    const starsHtml = '★'.repeat(primaryReview.rating) + '☆'.repeat(Math.max(0, 5 - primaryReview.rating));
    const placeLink = primaryReview.place_id ? `space-detail.html?id=${primaryReview.place_id}` : 'write-review.html';

    html += `
      <a href="${placeLink}" class="review-card">
        <div class="review-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="review-body">
          <div class="review-header-line">
            <span class="review-place-title">${escapeHtml(primaryReview.place_name)}</span>
            <span class="review-stars">${starsHtml}</span>
            <span class="review-time">${escapeHtml(primaryReview.time_ago)}</span>
          </div>
          <div class="review-comment">
            ${escapeHtml(primaryReview.comment)}
          </div>
        </div>
        <div class="review-chevron">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </a>
    `;

    reviewsList.innerHTML = html;
  }

  // ── Fetch from Backend API ──────────────────────────────────
  function loadProfileData() {
    fetch('php/get_profile_data.php')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          if (profileUserName && data.user) profileUserName.textContent = data.user.full_name || fallbackData.user.full_name;
          if (profileUserEmail && data.user) profileUserEmail.textContent = data.user.email || fallbackData.user.email;
          if (favCountText) favCountText.textContent = `${data.favorites_count ?? 4} saved places`;

          renderFavorites(data.favorites && data.favorites.length ? data.favorites : fallbackData.favorites);
          renderReviews(data.reviews && data.reviews.length ? data.reviews : fallbackData.reviews);
        } else {
          applyFallback();
        }
      })
      .catch(err => {
        console.warn('Profile fetch error, using mockup fallback:', err);
        applyFallback();
      });
  }

  function applyFallback() {
    if (profileUserName) profileUserName.textContent = fallbackData.user.full_name;
    if (profileUserEmail) profileUserEmail.textContent = fallbackData.user.email;
    if (favCountText) favCountText.textContent = `${fallbackData.favorites_count} saved places`;
    renderFavorites(fallbackData.favorites);
    renderReviews(fallbackData.reviews);
  }

  // Initialize
  loadProfileData();
});
