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
