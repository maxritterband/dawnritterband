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

// RSVP form — with calendar option if attending
(function () {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  // Event details
  const EVENT = {
    title:    "Celebration of Life — Dawn Ritterband",
    location: "Whitehall Farm & Vineyard, 6672 Blenheim Road, Scottsville, VA 24590",
    details:  "A celebration of the life of Dawn Ritterband.",
    // June 13 2026 11:30 AM Eastern (UTC-4 in June)
    startUtc: "20260613T153000Z",  // 11:30 AM ET = 15:30 UTC
    endUtc:   "20260613T193000Z",  // assumes ~4 hr event
    startLocal: "20260613T113000",
    endLocal:   "20260613T153000",
  };

  function makeGoogleUrl() {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    return base
      + "&text="     + encodeURIComponent(EVENT.title)
      + "&dates="    + EVENT.startUtc + "/" + EVENT.endUtc
      + "&details="  + encodeURIComponent(EVENT.details)
      + "&location=" + encodeURIComponent(EVENT.location);
  }

  function makeIcsContent() {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "DTSTART;TZID=America/New_York:" + EVENT.startLocal,
      "DTEND;TZID=America/New_York:"   + EVENT.endLocal,
      "SUMMARY:"   + EVENT.title,
      "LOCATION:"  + EVENT.location,
      "DESCRIPTION:" + EVENT.details,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function downloadIcs() {
    const blob = new Blob([makeIcsContent()], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "dawn-ritterband-celebration.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  function buildThankYou(isAttending) {
    const box = document.createElement('div');
    box.className = 'thank-you-box';

    if (isAttending) {
      box.innerHTML = `
        <div class="thank-you-check">&#10003;</div>
        <p>Your RSVP has been received. We look forward to seeing you on June 13th to celebrate Dawn.</p>
        <div class="calendar-prompt">
          <p class="calendar-label">Add to your calendar</p>
          <div class="calendar-btns">
            <button class="cal-btn" id="cal-apple">&#128197; Apple Calendar</button>
            <a class="cal-btn" id="cal-google" href="${makeGoogleUrl()}" target="_blank" rel="noopener">&#128197; Google Calendar</a>
          </div>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="thank-you-check">&#10003;</div>
        <p>Thank you for letting us know. You will be missed, and Dawn's memory will be with you that day.</p>
      `;
    }
    return box;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const attendingVal = form.querySelector('[name="attending"]').value;
    const isAttending  = attendingVal === 'yes' || attendingVal === 'maybe';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const box = buildThankYou(isAttending);
        form.replaceWith(box);

        // Wire up Apple Calendar download after element is in DOM
        const appleBtn = document.getElementById('cal-apple');
        if (appleBtn) appleBtn.addEventListener('click', downloadIcs);
      } else {
        btn.textContent = 'Something went wrong — please try again.';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error sending — please try again.';
      btn.disabled = false;
    }
  });
})();


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


// --- Photo Gallery Lightbox ---
(function () {
  const lightbox  = document.getElementById('photo-lightbox');
  const imgEl     = document.getElementById('photo-lightbox-img');
  const closeBtn  = document.getElementById('photo-lightbox-close');
  const prevBtn   = document.getElementById('photo-prev');
  const nextBtn   = document.getElementById('photo-next');
  const counter   = document.getElementById('photo-counter');

  if (!lightbox) return;

  let photos = [];
  let current = 0;

  // Collect all gallery images on page load and after reveal
  function collectPhotos() {
    photos = Array.from(document.querySelectorAll('.gallery-grid img'));
    photos.forEach(function (img, i) {
      img.addEventListener('click', function () { open(i); });
    });
  }

  function open(index) {
    current = index;
    show();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function show() {
    const photo = photos[current];
    imgEl.src = photo.src;
    imgEl.alt = photo.alt;
    counter.textContent = (current + 1) + ' / ' + photos.length;
    // Re-trigger animation
    imgEl.style.animation = 'none';
    imgEl.offsetHeight; // reflow
    imgEl.style.animation = '';
  }

  function prev() { current = (current - 1 + photos.length) % photos.length; show(); }
  function next() { current = (current + 1) % photos.length; show(); }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Close on backdrop click
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // Wait for images to be in the DOM (they may be added by update_gallery.py)
  collectPhotos();
  // Also re-collect after scroll reveals in case grid was hidden
  document.addEventListener('scroll', function collectOnce() {
    collectPhotos();
    document.removeEventListener('scroll', collectOnce);
  }, { once: true });
})();
