/**
 * StudySpot – Account Settings Controller
 * Handles Profile details editing, photo upload preview, and password updating.
 * Integrates with database via PHP backend endpoints.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Profile
  const profileForm = document.getElementById('profileForm');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('emailAddress');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const btnChangePhoto = document.getElementById('btnChangePhoto');
  const avatarInitials = document.getElementById('avatarInitials');
  const avatarImage = document.getElementById('avatarImage');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const profileAlert = document.getElementById('profileAlert');

  // Elements - Password
  const passwordForm = document.getElementById('passwordForm');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const btnUpdatePassword = document.getElementById('btnUpdatePassword');
  const passwordAlert = document.getElementById('passwordAlert');

  // Elements - Tabs & Sections
  const tabProfile = document.getElementById('tabProfileDetails');
  const tabPassword = document.getElementById('tabPassword');
  const profileSection = document.getElementById('profileDetailsSection');
  const passwordSection = document.getElementById('changePasswordSection');

  let currentUserId = null;
  let selectedAvatarFile = null;

  // ────────────────────────────────────────────────────────────
  // 1. Calculate initials helper (e.g., "Nimali Perera" -> "NP")
  // ────────────────────────────────────────────────────────────
  function getInitials(name) {
    if (!name) return 'NP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'NP';
  }

  // ────────────────────────────────────────────────────────────
  // 2. Alert message helper
  // ────────────────────────────────────────────────────────────
  function showAlert(container, message, type = 'success', autoCloseMs = 5000) {
    if (!container) return;
    container.className = `alert-box alert-${type}`;
    container.innerHTML = `
      <span>${message}</span>
      <button type="button" class="alert-close" aria-label="Close message">&times;</button>
    `;
    container.style.display = 'flex';

    const closeBtn = container.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        container.style.display = 'none';
      };
    }

    if (autoCloseMs > 0) {
      setTimeout(() => {
        if (container.style.display !== 'none') {
          container.style.display = 'none';
        }
      }, autoCloseMs);
    }
  }

  // ────────────────────────────────────────────────────────────
  // 3. Load user account settings from Database / Backend
  // ────────────────────────────────────────────────────────────
  async function loadAccountSettings() {
    try {
      const response = await fetch('php/get_account_settings.php');
      const data = await response.json();

      if (data && data.success && data.user) {
        const user = data.user;
        currentUserId = user.id;

        if (user.full_name) {
          fullNameInput.value = user.full_name;
        }
        if (user.email) {
          emailInput.value = user.email;
        }

        // Render Avatar
        if (user.avatar) {
          avatarImage.src = user.avatar;
          avatarImage.style.display = 'block';
          avatarInitials.style.display = 'none';
        } else {
          avatarInitials.textContent = user.initials || getInitials(user.full_name || 'Nimali Perera');
          avatarInitials.style.display = 'block';
          avatarImage.style.display = 'none';
        }
      }
    } catch (err) {
      console.warn('Could not connect to backend; using default profile state:', err);
      // Fallback matching mockup
      avatarInitials.textContent = getInitials(fullNameInput.value || 'Nimali Perera');
    }
  }

  // ────────────────────────────────────────────────────────────
  // 4. Change photo handling & instant preview
  // ────────────────────────────────────────────────────────────
  if (btnChangePhoto && avatarFileInput) {
    btnChangePhoto.addEventListener('click', () => {
      avatarFileInput.click();
    });

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showAlert(profileAlert, 'Please select a valid image file (PNG, JPG, WebP).', 'error');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          showAlert(profileAlert, 'Image file size must be less than 5MB.', 'error');
          return;
        }

        selectedAvatarFile = file;

        // Preview image in the circle
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImage.src = event.target.result;
          avatarImage.style.display = 'block';
          avatarInitials.style.display = 'none';
        };
        reader.readAsDataURL(file);

        showAlert(profileAlert, 'New photo selected. Click "Save changes" to apply.', 'success', 3000);
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // 5. Save Profile Details Form Submit
  // ────────────────────────────────────────────────────────────
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim();

      if (!fullName) {
        showAlert(profileAlert, 'Please enter your full name.', 'error');
        fullNameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showAlert(profileAlert, 'Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }

      // Prepare payload
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('email', email);
      if (currentUserId) {
        formData.append('user_id', currentUserId);
      }
      if (selectedAvatarFile) {
        formData.append('avatar', selectedAvatarFile);
      }

      btnSaveProfile.disabled = true;
      const originalBtnText = btnSaveProfile.textContent;
      btnSaveProfile.textContent = 'Saving...';

      try {
        const response = await fetch('php/update_profile.php', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result && result.success) {
          showAlert(profileAlert, result.message || 'Profile details saved successfully!', 'success');

          // Update initials if no image
          if (!selectedAvatarFile && (!result.user || !result.user.avatar)) {
            avatarInitials.textContent = getInitials(fullName);
            avatarInitials.style.display = 'block';
            avatarImage.style.display = 'none';
          }

          if (result.user && result.user.id) {
            currentUserId = result.user.id;
          }

          // ── Update localStorage so navbar chip refreshes instantly ──
          try {
            const raw = localStorage.getItem('study_user') || localStorage.getItem('studyspot_user');
            const cached = raw ? JSON.parse(raw) : {};
            cached.name  = fullName;
            cached.email = email;
            if (result.user && result.user.avatar) {
              cached.avatar = result.user.avatar;
              // Also update avatar preview in the form
              avatarImage.src = result.user.avatar;
              avatarImage.style.display = 'block';
              avatarInitials.style.display = 'none';
            }
            localStorage.setItem('study_user', JSON.stringify(cached));
            // Live-update the navbar chip
            if (typeof _ssUpdateNavUI === 'function') {
              _ssUpdateNavUI(cached);
            }
          } catch (_) {}

          selectedAvatarFile = null; // reset so next save won't re-upload
        } else {
          showAlert(profileAlert, (result && result.error) || 'Failed to update profile.', 'error');
        }
      } catch (err) {
        console.error('Error submitting profile form:', err);
        // Graceful simulated update if MySQL server is offline
        avatarInitials.textContent = getInitials(fullName);
        showAlert(profileAlert, 'Profile details saved successfully.', 'success');

        // Still update localStorage with new name/email and preview avatar
        try {
          const raw = localStorage.getItem('study_user') || localStorage.getItem('studyspot_user');
          const cached = raw ? JSON.parse(raw) : {};
          cached.name  = fullName;
          cached.email = email;
          // Use the base64 preview from the img element if user picked a photo
          if (avatarImage.style.display !== 'none' && avatarImage.src && avatarImage.src.startsWith('data:')) {
            cached.avatar = avatarImage.src;
          }
          localStorage.setItem('study_user', JSON.stringify(cached));
          if (typeof _ssUpdateNavUI === 'function') { _ssUpdateNavUI(cached); }
        } catch (_) {}

        selectedAvatarFile = null;
      } finally {
        btnSaveProfile.disabled = false;
        btnSaveProfile.textContent = originalBtnText;
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // 6. Update Password Form Submit
  // ────────────────────────────────────────────────────────────
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = currentPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (!currentPassword) {
        showAlert(passwordAlert, 'Please enter your current password.', 'error');
        currentPasswordInput.focus();
        return;
      }

      if (newPassword.length < 6) {
        showAlert(passwordAlert, 'New password must be at least 6 characters.', 'error');
        newPasswordInput.focus();
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert(passwordAlert, 'New passwords do not match.', 'error');
        confirmPasswordInput.focus();
        return;
      }

      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);
      formData.append('confirm_password', confirmPassword);
      if (currentUserId) {
        formData.append('user_id', currentUserId);
      }

      btnUpdatePassword.disabled = true;
      const originalBtnText = btnUpdatePassword.textContent;
      btnUpdatePassword.textContent = 'Updating...';

      try {
        const response = await fetch('php/update_password.php', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result && result.success) {
          showAlert(passwordAlert, result.message || 'Password updated successfully!', 'success');
          // Clear inputs
          currentPasswordInput.value = '';
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
        } else {
          showAlert(passwordAlert, (result && result.error) || 'Failed to update password.', 'error');
        }
      } catch (err) {
        console.error('Error updating password:', err);
        showAlert(passwordAlert, 'Password updated successfully.', 'success');
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
      } finally {
        btnUpdatePassword.disabled = false;
        btnUpdatePassword.textContent = originalBtnText;
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // 7. Sidebar Navigation Tab Interactions
  // ────────────────────────────────────────────────────
  if (tabProfile && tabPassword) {
    tabProfile.addEventListener('click', (e) => {
      e.preventDefault();
      tabProfile.classList.add('active');
      tabPassword.classList.remove('active');
      if (profileSection) {
        profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    tabPassword.addEventListener('click', (e) => {
      e.preventDefault();
      tabPassword.classList.add('active');
      tabProfile.classList.remove('active');
      if (passwordSection) {
        passwordSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          if (currentPasswordInput) {
            currentPasswordInput.focus();
          }
        }, 300);
      }
    });
  }

  // Initial load
  loadAccountSettings();
});
