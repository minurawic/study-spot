/* ============================================================
   StudySpot – main.js
   Handles: error messages, password toggles, form validation
   ============================================================ */

/* ── SVG Icons ──────────────────────────────────────────────── */
const ICON_EYE_OPEN = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  <circle cx="12" cy="12" r="3"></circle>
</svg>`;

const ICON_EYE_CLOSED = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
  <line x1="1" y1="1" x2="23" y2="23"></line>
</svg>`;

/* ── Error Code → Human-Readable Message Map ────────────────── */
const ERROR_MESSAGES = {
  invalid:          'Invalid email or password. Please try again.',
  validation:       'Please fill in all fields correctly.',
  email_exists:     'This email is already registered. Please login.',
  password_mismatch:'Passwords do not match. Please try again.',
  server_error:     'Something went wrong. Please try again later.',
};

/* ── Error Banner ────────────────────────────────────────────── */
function initErrorMessage() {
  const params    = new URLSearchParams(window.location.search);
  const errorCode = params.get('error');

  if (!errorCode) return;

  const banner = document.getElementById('errorMessage');
  if (!banner) return;

  const message = ERROR_MESSAGES[errorCode] || 'An unexpected error occurred.';
  banner.textContent = message;
  banner.classList.add('show');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    banner.classList.remove('show');
  }, 5000);
}

/* ── Password Toggle ─────────────────────────────────────────── */
/**
 * Call this from the toggle button's onclick attribute.
 * @param {HTMLButtonElement} btn - The toggle button element.
 */
function togglePassword(btn) {
  const wrapper = btn.closest('.password-wrapper');
  if (!wrapper) return;

  const input = wrapper.querySelector('.form-input');
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type       = isPassword ? 'text' : 'password';
  btn.innerHTML    = isPassword ? ICON_EYE_OPEN : ICON_EYE_CLOSED;
  btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
}

/* ── Form Validation Feedback ────────────────────────────────── */
function initFormValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach((form) => {
    const requiredInputs = form.querySelectorAll('input[required]');

    // On submit: highlight empty required fields
    form.addEventListener('submit', (e) => {
      let hasEmpty = false;

      requiredInputs.forEach((input) => {
        if (!input.value.trim()) {
          input.classList.add('input-error');
          hasEmpty = true;
        }
      });

      if (hasEmpty) {
        e.preventDefault();

        // Show inline error banner if present
        const banner = document.getElementById('errorMessage');
        if (banner) {
          banner.textContent = ERROR_MESSAGES['validation'];
          banner.classList.add('show');
        }
      }
    });

    // Remove error highlight when user types
    requiredInputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          input.classList.remove('input-error');
        }
      });
    });
  });
}

/* ── Bootstrap ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initErrorMessage();
  initFormValidation();
});
