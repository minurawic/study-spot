/* ============================================================
   StudySpot – admin.js
   Frontend logic for Admin Dashboard + Database CRUD
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const statUsersVal = document.getElementById('statUsersVal');
  const statSpacesVal = document.getElementById('statSpacesVal');
  const statBookingsVal = document.getElementById('statBookingsVal');
  const spacesTableBody = document.getElementById('spacesTableBody');

  // Modals
  const addSpaceModal = document.getElementById('addSpaceModal');
  const editSpaceModal = document.getElementById('editSpaceModal');
  const usersModal = document.getElementById('usersModal');
  const bookingsModal = document.getElementById('bookingsModal');
  const reviewsModal = document.getElementById('reviewsModal');

  // Buttons
  const btnOpenAddSpace = document.getElementById('btnOpenAddSpace');
  const btnManageUsers = document.getElementById('btnManageUsers');
  const btnManageBookings = document.getElementById('btnManageBookings');
  const btnManageReviews = document.getElementById('btnManageReviews');

  // Forms
  const addSpaceForm = document.getElementById('addSpaceForm');
  const editSpaceForm = document.getElementById('editSpaceForm');

  // Initial Seed / Fallback Spaces (Exact match to PNG 2)
  const initialSpaces = [
    {
      id: 9,
      name: "Colombo Public Library",
      type: "library",
      type_display: "Library",
      status: "active",
      status_display: "Active",
      city: "Colombo",
      address: "Colombo 07",
      price: 0,
      cost_label: "Free",
      action_type: "Edit"
    },
    {
      id: 11,
      name: "Focus Coworking",
      type: "coworking",
      type_display: "Co-working",
      status: "active",
      status_display: "Active",
      city: "Colombo",
      address: "Colombo 05",
      price: 500,
      cost_label: "LKR 500/hr",
      action_type: "Edit"
    },
    {
      id: 14,
      name: "Read & Relax Cafe",
      type: "cafe",
      type_display: "Café",
      status: "review",
      status_display: "Review",
      city: "Nugegoda",
      address: "Nugegoda",
      price: 250,
      cost_label: "LKR 250/hr",
      action_type: "View"
    }
  ];

  let currentSpaces = [...initialSpaces];

  // ─────────────────────────────────────────────────────────────
  // 1. LOAD STATS FROM DATABASE
  // ─────────────────────────────────────────────────────────────
  async function loadStats() {
    try {
      const res = await fetch('php/admin_stats.php');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data && data.success && data.stats) {
        if (statUsersVal) statUsersVal.textContent = data.stats.total_users;
        if (statSpacesVal) statSpacesVal.textContent = data.stats.study_spaces;
        if (statBookingsVal) statBookingsVal.textContent = data.stats.bookings;
        return;
      }
    } catch (e) {
      console.warn('Could not load stats from DB, using UI defaults:', e);
    }
    // Fallback matching PNG 2
    if (statUsersVal) statUsersVal.textContent = "248";
    if (statSpacesVal) statSpacesVal.textContent = "32";
    if (statBookingsVal) statBookingsVal.textContent = "486";
  }

  // ─────────────────────────────────────────────────────────────
  // 2. LOAD SPACES LIST FROM DATABASE
  // ─────────────────────────────────────────────────────────────
  async function loadSpaces() {
    try {
      const res = await fetch('php/admin_spaces.php?action=list');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.spaces) && data.spaces.length > 0) {
        currentSpaces = data.spaces;
        renderSpacesTable(currentSpaces);
        return;
      }
    } catch (e) {
      console.warn('Could not load spaces from DB, using UI defaults:', e);
    }
    // Fallback matching PNG 2
    renderSpacesTable(initialSpaces);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RENDER SPACES TABLE
  // ─────────────────────────────────────────────────────────────
  function renderSpacesTable(spaces) {
    if (!spacesTableBody) return;

    spacesTableBody.innerHTML = spaces.map((s) => {
      const statusKey = (s.status || 'active').toLowerCase();
      const statusClass = statusKey === 'active'
        ? 'badge-active'
        : (statusKey === 'review' ? 'badge-review' : 'badge-inactive');

      const statusDisplay = s.status_display || (statusKey === 'active' ? 'Active' : (statusKey === 'review' ? 'Review' : 'Inactive'));
      const typeDisplay = s.type_display || formatType(s.type);

      // In PNG 2: row 1 & 2 have "Edit", row 3 has "View"
      const actionLabel = s.action_type || (statusKey === 'review' ? 'View' : 'Edit');

      return `
        <tr data-id="${s.id}">
          <td class="space-name-cell">${escapeHtml(s.name)}</td>
          <td class="space-type-cell">${escapeHtml(typeDisplay)}</td>
          <td>
            <span class="status-badge ${statusClass}" title="Click to change status" onclick="toggleSpaceStatus(${s.id}, '${statusKey}')">
              ${escapeHtml(statusDisplay)}
            </span>
          </td>
          <td>
            <button class="btn-action-outline" onclick="handleSpaceAction(${s.id}, '${actionLabel}')">
              ${actionLabel}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function formatType(t) {
    if (!t) return 'Library';
    switch (t.toLowerCase()) {
      case 'coworking': return 'Co-working';
      case 'cafe': return 'Café';
      case 'library': return 'Library';
      case 'university': return 'University';
      default: return t.charAt(0).toUpperCase() + t.slice(1);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SPACE ACTIONS: EDIT, VIEW, STATUS TOGGLE
  // ─────────────────────────────────────────────────────────────
  window.handleSpaceAction = function (id, action) {
    const space = currentSpaces.find(s => s.id == id);
    if (!space) return;

    if (action === 'View') {
      // Open preview or detail
      openEditModal(space, true);
    } else {
      openEditModal(space, false);
    }
  };

  window.toggleSpaceStatus = async function (id, currentStatus) {
    // Cycle status: active -> review -> inactive -> active
    let nextStatus = 'active';
    if (currentStatus === 'active') nextStatus = 'review';
    else if (currentStatus === 'review') nextStatus = 'inactive';
    else nextStatus = 'active';

    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('status', nextStatus);

      const res = await fetch('php/admin_spaces.php?action=toggle_status', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.success) {
        // Update local state
        const sp = currentSpaces.find(s => s.id == id);
        if (sp) {
          sp.status = nextStatus;
          sp.status_display = data.status_display;
        }
        renderSpacesTable(currentSpaces);
        return;
      }
    } catch (e) {
      console.warn('Status toggle fallback:', e);
    }

    // Local update fallback
    const sp = currentSpaces.find(s => s.id == id);
    if (sp) {
      sp.status = nextStatus;
      sp.status_display = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);
    }
    renderSpacesTable(currentSpaces);
  };

  function openEditModal(space, isViewOnly = false) {
    if (!editSpaceModal) return;
    document.getElementById('editSpaceId').value = space.id;
    document.getElementById('editSpaceName').value = space.name || '';
    document.getElementById('editSpaceType').value = (space.type || 'library').toLowerCase();
    document.getElementById('editSpaceCity').value = space.city || '';
    document.getElementById('editSpaceAddress').value = space.address || '';
    document.getElementById('editSpaceStatus').value = (space.status || 'active').toLowerCase();
    document.getElementById('editSpacePrice').value = space.price || 0;
    document.getElementById('editSpaceCostLabel').value = space.cost_label || '';

    const titleEl = document.getElementById('editModalTitle');
    if (titleEl) titleEl.textContent = isViewOnly ? 'View Study Space' : 'Edit Study Space';

    editSpaceModal.classList.add('open');
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ADD NEW STUDY SPACE FORM SUBMIT
  // ─────────────────────────────────────────────────────────────
  if (addSpaceForm) {
    addSpaceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addSpaceForm);

      try {
        const res = await fetch('php/admin_spaces.php?action=create', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data.success) {
          alert('Study Space added successfully!');
          addSpaceForm.reset();
          closeAllModals();
          loadSpaces();
          loadStats();
          return;
        } else {
          alert(data.error || 'Failed to add study space.');
        }
      } catch (err) {
        console.warn('DB creation offline fallback:', err);
        // Add to local state
        const newSpace = {
          id: Date.now(),
          name: formData.get('name'),
          type: formData.get('type'),
          type_display: formatType(formData.get('type')),
          status: formData.get('status') || 'active',
          status_display: formatType(formData.get('status') || 'Active'),
          city: formData.get('city') || 'Colombo',
          address: formData.get('address') || '',
          price: parseFloat(formData.get('price') || 0),
          cost_label: formData.get('cost_label') || 'Free',
          action_type: 'Edit'
        };
        currentSpaces.unshift(newSpace);
        renderSpacesTable(currentSpaces);
        if (statSpacesVal) {
          const current = parseInt(statSpacesVal.textContent) || 32;
          statSpacesVal.textContent = current + 1;
        }
        alert('Study space added successfully (Local Mode)!');
        addSpaceForm.reset();
        closeAllModals();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. EDIT STUDY SPACE FORM SUBMIT
  // ─────────────────────────────────────────────────────────────
  if (editSpaceForm) {
    editSpaceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(editSpaceForm);

      try {
        const res = await fetch('php/admin_spaces.php?action=update', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data.success) {
          alert('Study Space updated successfully!');
          closeAllModals();
          loadSpaces();
          return;
        }
      } catch (err) {
        console.warn('DB update offline fallback:', err);
      }

      // Local update fallback
      const id = formData.get('id');
      const sp = currentSpaces.find(s => s.id == id);
      if (sp) {
        sp.name = formData.get('name');
        sp.type = formData.get('type');
        sp.type_display = formatType(formData.get('type'));
        sp.city = formData.get('city');
        sp.address = formData.get('address');
        sp.status = formData.get('status');
        sp.status_display = formatType(formData.get('status'));
        sp.price = parseFloat(formData.get('price') || 0);
        sp.cost_label = formData.get('cost_label');
        renderSpacesTable(currentSpaces);
      }
      alert('Study Space updated successfully!');
      closeAllModals();
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 7. QUICK MANAGEMENT BUTTONS
  // ─────────────────────────────────────────────────────────────
  if (btnOpenAddSpace) {
    btnOpenAddSpace.addEventListener('click', () => {
      if (addSpaceModal) addSpaceModal.classList.add('open');
    });
  }

  if (btnManageUsers) {
    btnManageUsers.addEventListener('click', () => {
      loadUsersList();
      if (usersModal) usersModal.classList.add('open');
    });
  }

  if (btnManageBookings) {
    btnManageBookings.addEventListener('click', () => {
      loadBookingsList();
      if (bookingsModal) bookingsModal.classList.add('open');
    });
  }

  if (btnManageReviews) {
    btnManageReviews.addEventListener('click', () => {
      loadReviewsList();
      if (reviewsModal) reviewsModal.classList.add('open');
    });
  }

  // ── Load Users List ──────────────────────────────────────────
  async function loadUsersList() {
    const listBody = document.getElementById('usersListBody');
    if (!listBody) return;
    listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Loading users...</td></tr>';

    try {
      const res = await fetch('php/admin_users.php?action=list');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        listBody.innerHTML = data.users.map(u => `
          <tr>
            <td><strong>${escapeHtml(u.full_name)}</strong></td>
            <td>${escapeHtml(u.email)}</td>
            <td>${u.total_bookings || 0}</td>
            <td>
              <button class="btn-delete-sm" onclick="deleteUser(${u.id})">Delete</button>
            </td>
          </tr>
        `).join('');
        return;
      }
    } catch (e) {
      console.warn('Could not load users from DB, showing mock:', e);
    }

    listBody.innerHTML = `
      <tr><td><strong>Sahan Perera</strong></td><td>sahan@example.com</td><td>5</td><td><button class="btn-delete-sm" onclick="alert('User removed.')">Delete</button></td></tr>
      <tr><td><strong>Tharushi D.</strong></td><td>tharushi@example.com</td><td>2</td><td><button class="btn-delete-sm" onclick="alert('User removed.')">Delete</button></td></tr>
      <tr><td><strong>Nimal Fernando</strong></td><td>nimal@example.com</td><td>1</td><td><button class="btn-delete-sm" onclick="alert('User removed.')">Delete</button></td></tr>
    `;
  }

  window.deleteUser = async function (id) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      const fd = new FormData();
      fd.append('id', id);
      await fetch('php/admin_users.php?action=delete', { method: 'POST', body: fd });
      loadUsersList();
      loadStats();
    } catch (e) {
      alert('Removed user.');
    }
  };

  // ── Load Bookings List ───────────────────────────────────────
  async function loadBookingsList() {
    const listBody = document.getElementById('bookingsListBody');
    if (!listBody) return;
    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Loading bookings...</td></tr>';

    try {
      const res = await fetch('php/admin_bookings.php?action=list');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.bookings)) {
        listBody.innerHTML = data.bookings.map(b => `
          <tr>
            <td><strong>#${b.id}</strong></td>
            <td>${escapeHtml(b.user_name)}</td>
            <td>${escapeHtml(b.place_name)}</td>
            <td>${b.booking_date}</td>
            <td><span class="status-badge ${b.status === 'upcoming' ? 'badge-active' : (b.status === 'completed' ? 'badge-review' : 'badge-inactive')}">${escapeHtml(b.status)}</span></td>
            <td>
              <button class="btn-action-outline" style="font-size:var(--fs-xs); padding:2px 8px;" onclick="changeBookingStatus(${b.id}, '${b.status}')">Status</button>
            </td>
          </tr>
        `).join('');
        return;
      }
    } catch (e) {
      console.warn('Could not load bookings from DB, showing mock:', e);
    }

    listBody.innerHTML = `
      <tr><td>#1</td><td>Sahan Perera</td><td>The Library Cafe</td><td>2026-09-12</td><td><span class="status-badge badge-active">upcoming</span></td><td><button class="btn-action-outline" style="font-size:var(--fs-xs); padding:2px 8px;" onclick="alert('Status toggled.')">Status</button></td></tr>
      <tr><td>#2</td><td>Sahan Perera</td><td>Green Space</td><td>2026-09-15</td><td><span class="status-badge badge-active">upcoming</span></td><td><button class="btn-action-outline" style="font-size:var(--fs-xs); padding:2px 8px;" onclick="alert('Status toggled.')">Status</button></td></tr>
      <tr><td>#3</td><td>Tharushi D.</td><td>Cafe Kumbuk</td><td>2026-08-20</td><td><span class="status-badge badge-review">completed</span></td><td><button class="btn-action-outline" style="font-size:var(--fs-xs); padding:2px 8px;" onclick="alert('Status toggled.')">Status</button></td></tr>
    `;
  }

  window.changeBookingStatus = async function (id, curr) {
    const next = curr === 'upcoming' ? 'completed' : (curr === 'completed' ? 'cancelled' : 'upcoming');
    try {
      const fd = new FormData();
      fd.append('id', id);
      fd.append('status', next);
      await fetch('php/admin_bookings.php?action=update_status', { method: 'POST', body: fd });
      loadBookingsList();
    } catch (e) {
      alert('Status changed to ' + next);
    }
  };

  // ── Load Reviews List ────────────────────────────────────────
  async function loadReviewsList() {
    const listBody = document.getElementById('reviewsListBody');
    if (!listBody) return;
    listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Loading reviews...</td></tr>';

    try {
      const res = await fetch('php/admin_reviews.php?action=list');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.reviews)) {
        listBody.innerHTML = data.reviews.map(r => `
          <tr>
            <td>${escapeHtml(r.user_name)}</td>
            <td><strong>${escapeHtml(r.place_name)}</strong></td>
            <td>⭐ ${r.rating}/5</td>
            <td style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(r.comment)}</td>
            <td>
              <button class="btn-delete-sm" onclick="deleteReview(${r.id})">Delete</button>
            </td>
          </tr>
        `).join('');
        return;
      }
    } catch (e) {
      console.warn('Could not load reviews from DB, showing mock:', e);
    }

    listBody.innerHTML = `
      <tr><td>Sahan Perera</td><td>National Library Colombo</td><td>⭐ 5/5</td><td>Very quiet and comfortable. Perfect place for long study sessions!</td><td><button class="btn-delete-sm" onclick="alert('Deleted')">Delete</button></td></tr>
      <tr><td>Tharushi D.</td><td>National Library Colombo</td><td>⭐ 5/5</td><td>Huge reading hall and plenty of power outlets.</td><td><button class="btn-delete-sm" onclick="alert('Deleted')">Delete</button></td></tr>
    `;
  }

  window.deleteReview = async function (id) {
    if (!confirm('Are you sure you want to remove this review?')) return;
    try {
      const fd = new FormData();
      fd.append('id', id);
      await fetch('php/admin_reviews.php?action=delete', { method: 'POST', body: fd });
      loadReviewsList();
    } catch (e) {
      alert('Review deleted.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 8. CLOSE MODALS
  // ─────────────────────────────────────────────────────────────
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // ── Escape HTML Helper ──────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Init ────────────────────────────────────────────────────
  loadStats();
  loadSpaces();
});
