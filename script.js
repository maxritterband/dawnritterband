// =============================================
//   DAWN RITTERBAND MEMORIAL — SHARED SCRIPT
// =============================================

// --- Scroll-reveal ---
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.07 }
);
revealEls.forEach(el => revealObserver.observe(el));


// --- Form submission (async, inline thank-you) ---
function setupForm(formId, message) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const box = document.createElement('div');
        box.className = 'thank-you-box';
        box.innerHTML = `
          <div class="thank-you-check">&#10003;</div>
          <p>${message}</p>
        `;
        form.replaceWith(box);
      } else {
        btn.textContent = 'Something went wrong — please try again.';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error sending — please try again.';
      btn.disabled = false;
    }
  });
}

setupForm(
  'memory-form',
  'Thank you for sharing your memory of Dawn. It means so much to the family.'
);

setupForm(
  'rsvp-form',
  'Your RSVP has been received. We look forward to seeing you on June 13th to celebrate Dawn.'
);


// --- Mark active nav link ---
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.split('#')[0] === path) {
      // don't mark the RSVP button as active
      if (!link.classList.contains('btn')) {
        link.classList.add('active');
      }
    }
  });
})();


// --- Invitation Lightbox (celebration.html) ---
(function () {
  const trigger   = document.getElementById('invitation-trigger');
  const lightbox  = document.getElementById('invitation-lightbox');
  const closeBtn  = document.getElementById('lightbox-close');
  const rsvpBtn   = document.getElementById('lightbox-rsvp-btn');

  if (!trigger || !lightbox) return;

  function openLightbox() {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openLightbox);

  closeBtn.addEventListener('click', closeLightbox);

  // Close on backdrop click (outside image/buttons)
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Escape key closes it
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // RSVP button: close lightbox then scroll to RSVP section
  rsvpBtn.addEventListener('click', function () {
    closeLightbox();
    setTimeout(function () {
      const rsvpSection = document.getElementById('rsvp');
      if (rsvpSection) {
        rsvpSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200); // small delay lets the lightbox close before scrolling
  });
})();


// --- Hamburger nav ---
(function () {
  const btn   = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  function openMenu() {
    links.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    links.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    links.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when a link is tapped
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();
