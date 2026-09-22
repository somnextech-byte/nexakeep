import { t } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  // Theme Controller (light/dark)
  const THEME_KEY = 'theme';
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.dataset.theme = initialTheme;

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  };

  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    // Set initial label
    const syncToggle = () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      themeToggleBtn.setAttribute('aria-pressed', String(isDark));
      themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    };
    syncToggle();

    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
      syncToggle();
    });
  }

  // Mobile Menu
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuBtn && mobileMenu) {
    // Toggle Menu
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('active');
      menuBtn.classList.toggle('active');
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuBtn.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('active') &&
        !mobileMenu.contains(e.target) &&
        !menuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        menuBtn.classList.remove('active');
      }
    });
  }

  // Accordion
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // Close all others? Prompt doesn't specify behaves like exclusive accordion, but it's standard.
      // Let's keep multiple open support or single? Single is cleaner.
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
        const icon = i.querySelector('.icon');
        if (icon) icon.textContent = '+';
      });

      if (!isActive) {
        item.classList.add('active');
        const icon = header.querySelector('.icon');
        if (icon) icon.textContent = '-';
      }
    });
  });

  // Pricing Toggle Logic
  const billingToggle = document.getElementById('billingToggle');

  if (billingToggle) {
    billingToggle.checked = true;

    billingToggle.addEventListener('change', () => {
      const isAnnual = billingToggle.checked;
      const prices = document.querySelectorAll('.price');
      const labels = document.querySelectorAll('.toggle-label');

      if (labels.length === 2) {
        labels[0].classList.toggle('active', !isAnnual);
        labels[1].classList.toggle('active', isAnnual);
      }

      if (prices.length >= 3) {
        // Simple animation for price change
        prices.forEach(price => {
          price.style.opacity = '0';
          setTimeout(() => {
            price.style.opacity = '1';
          }, 200);
        });

        setTimeout(() => {
          if (isAnnual) {
            prices[1].innerHTML = `$239.99 <span class="period" data-i18n="period_year">${t('period_year')}</span>`;
            prices[2].innerHTML = `$599.99 <span class="period" data-i18n="period_year">${t('period_year')}</span>`;
          } else {
            prices[1].innerHTML = `$19.99 <span class="period" data-i18n="period_month">${t('period_month')}</span>`;
            prices[2].innerHTML = `$49.99 <span class="period" data-i18n="period_month">${t('period_month')}</span>`;
          }
        }, 200);
      }
    });
  }

  // Scroll Animation Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.reveal, .feature-card, .pricing-card, .hero-content, .hero-dashboard, .section-header');
  revealElements.forEach(el => el.classList.add('reveal-hidden'));
  revealElements.forEach(el => observer.observe(el));

  // Handle Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const form = e.target;
      const submitBtn = form.querySelector('button');
      const originalBtnText = submitBtn.textContent;

      // 1. Get Values
      const name = form.querySelector('#name').value;
      const phone = form.querySelector('#phone').value;
      const message = form.querySelector('#message').value;

      // 2. Prepare Google Form Data
      const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeMqvaB0ba84NQejVfxIZbp4-KgPyo03PnL0mJROzITEcio5Q/formResponse';
      const formData = new FormData();

      formData.append('entry.904147182', name);
      formData.append('entry.78130117', phone);
      formData.append('entry.869616001', message);

      // 3. Send Data (using no-cors)
      submitBtn.textContent = t('form_sending');
      submitBtn.disabled = true;

      fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      })
        .then(() => {
          // 4. Success handling
          alert(t('form_success'));
          form.reset();
        })
        .catch((error) => {
          console.error('Error:', error);
          alert(t('form_error'));
        })
        .finally(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
    });
  }
});
