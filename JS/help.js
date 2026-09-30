/* ============================================================
   StudySpot – help.js
   Frontend logic for Help & FAQ page + DB integration
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const faqListContainer = document.getElementById('faqList');
  const contactModal = document.getElementById('contactModal');
  const contactBtn = document.getElementById('contactBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const contactForm = document.getElementById('contactForm');
  const navAuthArea = document.getElementById('navAuthArea');

  // ── Render Navbar Auth ───────────────────────────────────────
  renderNavAuth();

  // ── Initial Seed / Fallback FAQs (Exact match to PNG 1) ─────
  const fallbackFaqs = [
    {
      id: 1,
      question: "How do I make a booking?",
      answer: "To make a booking, navigate to the Explore or Map page, select your preferred study space, click on the \"Book Spot\" button, select your date, time slot, and number of people, and confirm your reservation. You'll receive an instant booking reference."
    },
    {
      id: 2,
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your upcoming booking through your bookings dashboard. Cancellations made at least 2 hours before the scheduled time are completely free of charge and eligible for a full refund."
    },
    {
      id: 3,
      question: "What payment methods are available?",
      answer: "We accept Visa, MasterCard, local online bank transfers, and on-site cash payments at selected partner study spaces. For public libraries and university reading halls, no payment is required."
    },
    {
      id: 4,
      question: "Is there a refund policy?",
      answer: "Yes. If you cancel at least 2 hours prior to your scheduled booking, you will receive a 100% refund. For cancellations within 2 hours or no-shows, cancellation policies depend on the specific space."
    },
    {
      id: 5,
      question: "How do I add a place to my favorites?",
      answer: "Simply click on the heart icon on any study space card or detail page. When logged in, all your saved spaces will appear under your Favourites list for quick access anytime."
    },
    {
      id: 6,
      question: "How can I contact support?",
      answer: "You can reach our student support team via email at support@studyspot.lk or by clicking the contact card below. We are here to help and typically respond within a few hours."
    }
  ];

  // ── Load FAQs from MySQL Database ───────────────────────────
  async function loadFaqs() {
    try {
      const response = await fetch('php/get_faqs.php');
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      if (data && data.success && Array.isArray(data.faqs) && data.faqs.length > 0) {
        renderFaqItems(data.faqs);
        return;
      }
    } catch (err) {
      console.warn('Database fetch not available, loading fallback FAQs:', err);
    }
    // Fallback if PHP server is not active
    renderFaqItems(fallbackFaqs);
  }

  // ── Render FAQ DOM ──────────────────────────────────────────
  function renderFaqItems(faqs) {
    if (!faqListContainer) return;
    faqListContainer.innerHTML = faqs.map((faq, index) => `
      <div class="faq-item" id="faq-${faq.id || index}">
        <button class="faq-header" type="button" aria-expanded="false" onclick="toggleFaq(this)">
          <span class="faq-question">${escapeHtml(faq.question)}</span>
          <span class="faq-toggle-icon" aria-hidden="true">
            <!-- Custom curved eyelid / eyelash icon matching PNG 1 -->
            <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 3.5C5.5 9.5 8.5 9.5 11 3.5C13.5 9.5 16.5 9.5 20.5 3.5" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
              <line x1="4" y1="7" x2="3" y2="11" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="7.5" y1="8.5" x2="7.5" y2="12" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="14.5" y1="8.5" x2="14.5" y2="12" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="18" y1="7" x2="19" y2="11" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
        </button>
        <div class="faq-body">
          <div class="faq-answer">
            <p>${escapeHtml(faq.answer)}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Toggle Accordion ─────────────────────────────────────────
  window.toggleFaq = function(headerBtn) {
    const item = headerBtn.closest('.faq-item');
    if (!item) return;

    const isActive = item.classList.contains('active');

    // Close all other open items for neat accordion behavior
    document.querySelectorAll('.faq-item.active').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('active');
        const btn = openItem.querySelector('.faq-header');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    if (isActive) {
      item.classList.remove('active');
      headerBtn.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('active');
      headerBtn.setAttribute('aria-expanded', 'true');
    }
  };

  // ── Contact Modal Handlers ──────────────────────────────────
  if (contactBtn) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (contactModal) contactModal.classList.add('open');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (contactModal) contactModal.classList.remove('open');
    });
  }

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove('open');
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = encodeURIComponent(document.getElementById('contactSubject')?.value || 'StudySpot Inquiry');
      const message = encodeURIComponent(document.getElementById('contactMessage')?.value || '');
      const mailtoLink = `mailto:support@studyspot.lk?subject=${subject}&body=${message}`;
      window.location.href = mailtoLink;
      if (contactModal) contactModal.classList.remove('open');
      alert('Thank you! Your email client has been opened with your support inquiry.');
    });
  }

  // ── Navbar Auth Helper ──────────────────────────────────────
  function renderNavAuth() {
    if (!navAuthArea) return;
    const user = JSON.parse(localStorage.getItem('studyspot_user') || 'null');
    if (user && user.id) {
      navAuthArea.innerHTML = `
        <button class="user-avatar-btn" title="${escapeHtml(user.full_name || 'My Profile')}" aria-label="Profile" onclick="window.location='account-settings.html'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
      `;
    } else {
      navAuthArea.innerHTML = `
        <button class="user-avatar-btn" title="Sign In" aria-label="Sign In" onclick="window.location='login.html'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
      `;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Init ────────────────────────────────────────────────────
  loadFaqs();
});
