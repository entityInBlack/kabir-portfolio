/* ============================================================
   Kabir Portfolio — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. Active nav link highlighting based on current page
     ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     2. Skill bar animation (intersection observer)
     ---------------------------------------------------------- */
  const skillBars = document.querySelectorAll('.skill-bar-inner');
  if (skillBars.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          target.style.width = target.dataset.width;
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => {
      bar.style.width = '0';
      observer.observe(bar);
    });
  }

  /* ----------------------------------------------------------
     3. Contact form validation & submission feedback
     ---------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = contactForm.querySelector('#name').value.trim();
      const email   = contactForm.querySelector('#email').value.trim();
      const phone   = contactForm.querySelector('#phone').value.trim();
      const address = contactForm.querySelector('#address').value.trim();
      const message = contactForm.querySelector('#message').value.trim();
      const msgEl   = document.getElementById('formMessage');

      // Check all fields filled
      if (!name || !email || !phone || !address || !message) {
        showFormMsg(msgEl, '⚠️ Please fill in all fields.', 'error');
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMsg(msgEl, '⚠️ Please enter a valid email address.', 'error');
        return;
      }

      // Validate phone — must be digits, spaces, +, -, () — min 7 digits
      const digitsOnly = phone.replace(/[^\d]/g, '');
      if (!/^[+\d\s\-().]+$/.test(phone) || digitsOnly.length < 7) {
        showFormMsg(msgEl, '⚠️ Please enter a valid phone number.', 'error');
        return;
      }

      // Validate address — at least 5 characters
      if (address.length < 5) {
        showFormMsg(msgEl, '⚠️ Please enter a complete address.', 'error');
        return;
      }

      // Simulate successful submission
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, message }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showFormMsg(msgEl, '✅ Message sent! I will get back to you soon.', 'success');
            contactForm.reset();
          } else {
            showFormMsg(msgEl, '⚠️ ' + (data.error || 'Something went wrong.'), 'error');
          }
        })
        .catch(() => {
          showFormMsg(msgEl, '⚠️ Network error. Please try again.', 'error');
        })
        .finally(() => {
          btn.textContent = 'Send Message ✈️';
          btn.disabled = false;
        });
    });
  }

  function showFormMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.style.color = type === 'success' ? '#f5a623' : '#ff6b6b';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }

  /* ----------------------------------------------------------
     4. Scroll-triggered fade-up for cards
     ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.service-card, .skill-card, .client-card, .contact-info-card, .service-detail-card, .testimonial-card, .timeline-item');
  if (fadeEls.length) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px)';
      el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
      fadeObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     5. Smooth scroll for in-page anchor links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});


  /* ----------------------------------------------------------
     6. Live date & time clock in footer
     ---------------------------------------------------------- */
  function updateClock() {
    const el = document.getElementById('live-clock');
    if (!el) return;
    const now = new Date();
    const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric',
                   hour:'2-digit', minute:'2-digit', second:'2-digit' };
    el.textContent = now.toLocaleString('en-GB', opts);
  }
  updateClock();
  setInterval(updateClock, 1000);

