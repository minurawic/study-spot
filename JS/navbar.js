/* ============================================================
   StudySpot – navbar.js  (v4 – profile picture support)
   ============================================================ */

/* ── Helpers ─────────────────────────────────────────────── */
function _ssGetCached() {
  try {
    const raw = localStorage.getItem('study_user') || localStorage.getItem('studyspot_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
function _ssSetCache(user) {
  try { localStorage.setItem('study_user', JSON.stringify(user)); } catch (_) {}
}
function _ssClearCache() {
  localStorage.removeItem('study_user');
  localStorage.removeItem('studyspot_user');
}

/* ── Avatar helper — returns <img> tag or initial letter ─── */
function _ssAvatarHTML(user, size = 42, fontSize = 18) {
  if (user && user.avatar) {
    return `<img src="${user.avatar}"
      style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block;flex-shrink:0;"
      alt="Profile photo"
      onerror="this.style.display='none';this.nextSibling.style.display='flex';">
    <span style="display:none;width:${size}px;height:${size}px;border-radius:50%;
      background:#1f7a3d;color:#fff;font-size:${fontSize}px;font-weight:700;
      align-items:center;justify-content:center;flex-shrink:0;">
      ${(user.name || 'U').trim()[0].toUpperCase()}
    </span>`;
  }
  const initial = (user && user.name ? user.name : 'U').trim()[0].toUpperCase();
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;
    background:#1f7a3d;color:#fff;font-size:${fontSize}px;font-weight:700;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    ${initial}
  </span>`;
}

/* ── Public API ───────────────────────────────────────────── */
function navGoToProfile() {
  const user = _ssGetCached();
  window.location.href = user ? 'profile.html' : 'login.html';
}
function navLogout() {
  _ssClearCache();
  fetch('php/logout.php').catch(() => {});
  window.location.href = 'login.html';
}

/* ── Dropdown ─────────────────────────────────────────────── */
function _ssToggleDropdown(chip, user) {
  // Remove any existing dropdown first
  const existing = document.getElementById('_ssProfileDrop');
  if (existing) { existing.remove(); return; }

  const drop = document.createElement('div');
  drop.id = '_ssProfileDrop';
  drop.style.cssText = [
    'position:absolute', 'top:calc(100% + 10px)', 'right:0',
    'width:230px',
    'background:#fff',
    'border-radius:14px',
    'box-shadow:0 8px 30px rgba(0,0,0,0.14)',
    'border:1px solid #e5e7eb',
    'z-index:9999',
    'overflow:hidden',
    'animation:_ssDrop 0.18s ease',
    'font-family:inherit'
  ].join(';');

  drop.innerHTML = `
    <style>
      @keyframes _ssDrop {
        from { opacity:0; transform:translateY(-6px); }
        to   { opacity:1; transform:translateY(0); }
      }
      #_ssProfileDrop a, #_ssProfileDrop button {
        display:flex; align-items:center; gap:10px;
        width:100%; padding:11px 18px;
        font-size:14px; font-weight:500; color:#1a1a1a;
        text-decoration:none; background:none; border:none;
        cursor:pointer; font-family:inherit; text-align:left;
        transition:background 0.15s;
      }
      #_ssProfileDrop a:hover, #_ssProfileDrop button:hover {
        background:#f0faf3; color:#1f7a3d;
      }
      #_ssProfileDrop .drop-divider {
        height:1px; background:#f0f0f0; margin:4px 0;
      }
      #_ssProfileDrop .drop-icon {
        width:18px; height:18px; flex-shrink:0; opacity:0.65;
      }
    </style>

    <!-- User header -->
    <div style="display:flex;align-items:center;gap:12px;padding:16px 18px 12px;border-bottom:1px solid #f0f0f0;">
      <div style="display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${_ssAvatarHTML(user, 42, 18)}
      </div>
      <div style="overflow:hidden;">
        <div style="font-weight:700;font-size:15px;color:#111827;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.name || ''}</div>
        <div style="font-size:12px;color:#6b7280;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.email || ''}</div>
      </div>
    </div>

    <!-- Menu items -->
    <div style="padding:6px 0;">
      <a href="profile.html">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        Profile Overview
      </a>
      <a href="favourites.html">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        My Favorites
      </a>
      <a href="write-review.html">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        My Reviews
      </a>
      <a href="my-bookings.html">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        My Bookings
      </a>
      <a href="account-settings.html">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Account Settings
      </a>
      <a href="contact.html">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Contact Us
      </a>

      <div class="drop-divider"></div>

      <button onclick="navLogout()">
        <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logout
      </button>
    </div>
  `;

  // Position relative to chip's parent
  chip.parentElement.style.position = 'relative';
  chip.parentElement.appendChild(drop);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function _close(e) {
      if (!drop.contains(e.target) && e.target !== chip) {
        drop.remove();
        document.removeEventListener('click', _close);
      }
    });
  }, 10);
}

/* ── Navbar UI update ─────────────────────────────────────── */
function _ssUpdateNavUI(user) {
  // 1. Standard profile icon buttons — hide when logged in
  document.querySelectorAll('[aria-label="Account"], [aria-label="My Profile"], .top-user-avatar').forEach(btn => {
    if (user) {
      btn.style.display = 'none';
    } else {
      btn.style.display = '';
      btn.onclick = (e) => { e.preventDefault(); navGoToProfile(); };
      btn.setAttribute('title', 'Account');
      btn.setAttribute('aria-label', 'Account');
    }
  });

  // 2. Malika's ".btn-nav-login" Login link
  document.querySelectorAll('.btn-nav-login').forEach(link => {
    if (user) {
      link.textContent = user.name ? user.name.split(' ')[0] : 'Profile';
      link.href = 'profile.html';
      link.style.color = '#1f7a3d';
      link.style.fontWeight = '700';
    } else {
      link.textContent = 'Login';
      link.href = 'login.html';
      link.style.color = '';
      link.style.fontWeight = '';
    }
  });

  // 3. Profile chip — shows avatar photo if available, else green initial
  const navActions = document.querySelector('.nav-actions, .profile-nav-actions');
  if (!navActions) return;

  navActions.querySelector('.nav-user-chip')?.remove();
  document.getElementById('_ssProfileDrop')?.remove();

  if (user) {
    const chip = document.createElement('span');
    chip.className = 'nav-user-chip';
    chip.title = `Logged in as ${user.name}`;
    chip.setAttribute('aria-label', 'My Profile');
    chip.style.cssText = [
      'display:inline-flex', 'align-items:center', 'justify-content:center',
      'width:34px', 'height:34px', 'border-radius:50%',
      'overflow:hidden',
      'cursor:pointer', 'flex-shrink:0',
      'transition:opacity 0.2s', 'position:relative'
    ].join(';');

    if (user.avatar) {
      // Show profile picture
      chip.innerHTML = `
        <img src="${user.avatar}"
          style="width:34px;height:34px;border-radius:50%;object-fit:cover;display:block;"
          alt="Profile photo"
          onerror="this.style.display='none';this.nextSibling.style.display='flex';">
        <span style="display:none;width:34px;height:34px;border-radius:50%;
          background:#1f7a3d;color:#fff;font-size:14px;font-weight:700;
          align-items:center;justify-content:center;">
          ${(user.name || 'U').trim()[0].toUpperCase()}
        </span>`;
    } else {
      // Show green initial
      chip.style.background = '#1f7a3d';
      chip.style.color = '#fff';
      chip.style.fontSize = '14px';
      chip.style.fontWeight = '700';
      chip.style.fontFamily = 'inherit';
      chip.style.letterSpacing = '0.5px';
      chip.textContent = (user.name || 'U').trim()[0].toUpperCase();
    }

    chip.addEventListener('mouseenter', () => chip.style.opacity = '0.82');
    chip.addEventListener('mouseleave', () => chip.style.opacity = '1');
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      _ssToggleDropdown(chip, user);
    });

    navActions.appendChild(chip);
  }
}

/* ── Boot ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const cached = _ssGetCached();
  _ssUpdateNavUI(cached);

  const phpBase = (function () {
    const scripts = document.querySelectorAll('script[src*="navbar.js"]');
    if (scripts.length) {
      const src = scripts[scripts.length - 1].getAttribute('src');
      return src.replace(/JS\/navbar\.js.*$/, '') + 'php/';
    }
    return 'php/';
  })();

  fetch(phpBase + 'session_user.php', { credentials: 'same-origin', cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      if (data.logged_in && data.user) {
        _ssSetCache(data.user);
        _ssUpdateNavUI(data.user);
      } else {
        _ssClearCache();
        _ssUpdateNavUI(null);
      }
    })
    .catch(() => {});
});
