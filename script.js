// =============================================
//   DAWN RITTERBAND MEMORIAL — SCRIPT
// =============================================


// --- Scroll reveal ---
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// --- Airtable config ---
// Values are loaded from config.js (not tracked by git)
const AIRTABLE_TABLE   = 'Memories';
const AIRTABLE_URL     = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`;
const AIRTABLE_HEADERS = {
  'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
};


// --- Load and display approved memories ---
(function () {
  const display  = document.getElementById('memories-display');
  const list     = document.getElementById('memories-list');
  const loading  = document.getElementById('memories-loading');
  const empty    = document.getElementById('memories-empty');
  if (!list) return;

  async function loadMemories() {
    try {
      // Only fetch records where "Show on Site" is checked
      const params = new URLSearchParams({
        filterByFormula: '{Show on Site}=1',
        sort: '[{"field":"Name","direction":"asc"}]'
      });
      const res  = await fetch(`${AIRTABLE_URL}?${params}`, { headers: AIRTABLE_HEADERS });
      const data = await res.json();

      loading.style.display = 'none';

      if (!data.records || data.records.length === 0) {
        empty.style.display = 'block';
        return;
      }

      display.style.display = 'block';
      list.innerHTML = data.records.map(r => {
        const f        = r.fields;
        const name     = f['Name']     || 'Anonymous';
        const relation = f['Relation'] || '';
        const memory   = f['Memory']   || '';
        return `
          <div class="memory-card">
            <p class="memory-quote">"${memory}"</p>
            <div class="memory-attribution">
              <span class="memory-name">${name}</span>
              ${relation ? `<span class="memory-relation"> &mdash; ${relation}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');

    } catch (err) {
      loading.style.display = 'none';
      console.error('Could not load memories:', err);
    }
  }

  loadMemories();
})();


// --- Memory form — submits directly to Airtable ---
(function () {
  const form = document.getElementById('memory-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const name     = document.getElementById('mem-name').value.trim();
    const relation = document.getElementById('mem-relation').value.trim();
    const memory   = document.getElementById('mem-text').value.trim();

    try {
      const res = await fetch(AIRTABLE_URL, {
        method: 'POST',
        headers: AIRTABLE_HEADERS,
        body: JSON.stringify({
          records: [{
            fields: {
              'Name':        name,
              'Relation':    relation,
              'Memory':      memory,
              'Show on Site': false   // hidden until you approve it in Airtable
            }
          }]
        })
      });

      if (res.ok) {
        const box = document.createElement('div');
        box.className = 'thank-you-box';
        box.innerHTML = `
          <div class="thank-you-check">&#10003;</div>
          <p>Thank you for sharing your memory of Dawn. It means so much to the family.</p>
        `;
        form.replaceWith(box);
      } else {
        const err = await res.json();
        console.error('Airtable error:', err);
        btn.textContent = 'Something went wrong — please try again.';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error sending — please try again.';
      btn.disabled = false;
    }
  });
})();


// --- RSVP form ---
(function () {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const EVENT = {
    title:      "Celebration of Life — Dawn Ritterband",
    location:   "6672 Blenheim Road, Scottsville, VA 24590",
    details:    "A celebration of the life of Dawn Ritterband.",
    startUtc:   "20260613T153000Z",
    endUtc:     "20260613T193000Z",
    startLocal: "20260613T113000",
    endLocal:   "20260613T153000",
  };

  function makeGoogleUrl() {
    return "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + "&text="     + encodeURIComponent(EVENT.title)
      + "&dates="    + EVENT.startUtc + "/" + EVENT.endUtc
      + "&details="  + encodeURIComponent(EVENT.details)
      + "&location=" + encodeURIComponent(EVENT.location);
  }

  function downloadIcs() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "DTSTART;TZID=America/New_York:" + EVENT.startLocal,
      "DTEND;TZID=America/New_York:"   + EVENT.endLocal,
      "SUMMARY:"     + EVENT.title,
      "LOCATION:"    + EVENT.location.replace(/,/g, "\\,"),
      "DESCRIPTION:" + EVENT.details,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a   = Object.assign(document.createElement("a"), { href: url, download: "dawn-ritterband-celebration.ics" });
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
            <button class="cal-btn" id="cal-apple">Apple Calendar</button>
            <a class="cal-btn" id="cal-google" href="${makeGoogleUrl()}" target="_blank" rel="noopener">Google Calendar</a>
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

    const attending   = form.querySelector('[name="attending"]').value;
    const isAttending = attending === 'yes' || attending === 'maybe';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const box = buildThankYou(isAttending);
        form.replaceWith(box);
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


// --- Active nav link ---
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.split('#')[0] === page && !link.classList.contains('btn')) {
      link.classList.add('active');
    }
  });
})();


// --- Hamburger nav ---
(function () {
  const btn   = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  const openMenu  = () => { links.classList.add('open');    btn.classList.add('open');    btn.setAttribute('aria-expanded', 'true');  document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { links.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

  btn.addEventListener('click', () => links.classList.contains('open') ? closeMenu() : openMenu());
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();


// --- Invitation lightbox (celebration.html) ---
(function () {
  const trigger  = document.getElementById('invitation-trigger');
  const lightbox = document.getElementById('invitation-lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const rsvpBtn  = document.getElementById('lightbox-rsvp-btn');
  if (!trigger || !lightbox) return;

  const open  = () => { lightbox.classList.add('open');    document.body.style.overflow = 'hidden'; };
  const close = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  rsvpBtn.addEventListener('click', () => {
    close();
    setTimeout(() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }), 200);
  });
})();


// --- Photo gallery lightbox ---
(function () {
  const lightbox = document.getElementById('photo-lightbox');
  const imgEl    = document.getElementById('photo-lightbox-img');
  const closeBtn = document.getElementById('photo-lightbox-close');
  const prevBtn  = document.getElementById('photo-prev');
  const nextBtn  = document.getElementById('photo-next');
  const counter  = document.getElementById('photo-counter');
  if (!lightbox) return;

  let photos = [], current = 0;

  function collectPhotos() {
    photos = Array.from(document.querySelectorAll('.gallery-grid img'));
    photos.forEach((img, i) => img.addEventListener('click', () => openPhoto(i)));
  }

  function openPhoto(index) {
    current = index;
    showPhoto();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePhoto() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPhoto() {
    imgEl.src = photos[current].src;
    imgEl.alt = photos[current].alt;
    counter.textContent = (current + 1) + ' / ' + photos.length;
    imgEl.style.animation = 'none';
    imgEl.offsetHeight;
    imgEl.style.animation = '';
  }

  const prev = () => { current = (current - 1 + photos.length) % photos.length; showPhoto(); };
  const next = () => { current = (current + 1) % photos.length; showPhoto(); };

  closeBtn.addEventListener('click', closePhoto);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closePhoto(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closePhoto();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  collectPhotos();
  document.addEventListener('scroll', collectPhotos, { once: true });
})();


// --- Auto-open lightbox if loaded via /rsvp redirect ---
(function () {
  if (new URLSearchParams(window.location.search).get('rsvp') === '1') {
    window.addEventListener('load', () => document.getElementById('invitation-trigger')?.click());
  }
})();
