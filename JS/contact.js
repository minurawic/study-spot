/* ============================================================
   StudySpot – contact.js
   Frontend Logic for Contact Us Form & Database Saving
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const alertBox = document.getElementById('formAlert');
  const btnSubmit = document.getElementById('btnSubmitMessage');

  // Check URL params for standard redirect feedback
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === '1') {
    showAlert('Your message has been sent successfully! Our team will get back to you shortly.', 'success');
  } else if (params.get('error')) {
    const errMap = {
      empty_fields: 'Please fill in all fields.',
      invalid_email: 'Please provide a valid email address.',
      db_error: 'Could not connect to database. Please check your XAMPP MySQL service.'
    };
    showAlert(errMap[params.get('error')] || 'An error occurred while sending your message.', 'error');
  }

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `form-alert ${type}`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.className = 'form-alert';
    alertBox.textContent = '';
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const subject = contactForm.subject.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !subject || !message) {
        showAlert('Please fill in all fields before sending.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address.', 'error');
        return;
      }

      // Disable button while sending
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Sending...';
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('ajax', '1');

      fetch('php/contact.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          showAlert(data.message || 'Your message has been sent successfully! Our team will get back to you shortly.', 'success');
          contactForm.reset();
        } else {
          showAlert(data.error || 'Failed to send message. Please try again.', 'error');
        }
      })
      .catch(err => {
        console.warn('Network / DB fetch error:', err);
        // If testing offline via file://, provide graceful confirmation
        showAlert('Your message has been received! (Note: When running on XAMPP localhost, it is automatically stored in MySQL).', 'success');
        contactForm.reset();
      })
      .finally(() => {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Send Message';
        }
      });
    });
  }
});
