# Dawn Ritterband — Memorial Website

A memorial website celebrating the life of Dawn Ritterband (June 15, 1971 – February 17, 2026).

---

## Files in this repo

| File | Purpose |
|---|---|
| `index.html` | Home page — tribute, photo gallery, memory wall |
| `celebration.html` | Celebration of Life page — invitation, event details, RSVP |
| `style.css` | Shared styles for all pages |
| `script.js` | Shared scripts (scroll animations, form handling) |
| `CoL_Invitation.png` | Celebration of Life invitation graphic |
| `photos/` | Folder for adding photos to the gallery (create this folder) |

---

## GitHub Pages Setup

1. Create a new **public** GitHub repository (e.g. `celebrating-dawn`)
2. Upload all files to the repo root
3. Go to **Settings → Pages**
4. Under "Source" → `Deploy from a branch` → `main` → `/ (root)`
5. Click Save. Your site will be live at `https://yourusername.github.io/celebrating-dawn/`

**Direct RSVP link to include in emails:**
`https://yourusername.github.io/celebrating-dawn/celebration.html#rsvp`

---

## Setup: Forms via Formspree (free, works with GitHub Pages)

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create **two forms**:

   **Form 1 — Memory submissions** (on the Home page)
   - Name it: "Dawn — Memory Submissions"
   - In `index.html`, find: `action="https://formspree.io/f/YOUR_MEMORIES_FORM_ID"`
   - Replace `YOUR_MEMORIES_FORM_ID` with your form ID

   **Form 2 — RSVP** (on the Celebration page)
   - Name it: "Dawn — Celebration RSVP"
   - In `celebration.html`, find: `action="https://formspree.io/f/YOUR_RSVP_FORM_ID"`
   - Replace `YOUR_RSVP_FORM_ID` with your form ID

All submissions go to your email and are visible in your Formspree dashboard.

---

## Adding Photos to the Gallery

1. Create a `photos/` folder in your repo
2. Upload your photos there
3. In `index.html`, find the `gallery-grid` section
4. Replace each `<div class="gallery-placeholder">` with:
   ```html
   <img src="photos/filename.jpg" alt="Brief description" />
   ```
5. Add or remove tiles as needed — the grid adapts automatically

---

## Personalizing the Content

All editable sections are marked with `✏️ EDIT THIS SECTION` comments in the HTML.

**Home page (`index.html`):**
- Hero tagline (under her name)
- About Dawn paragraphs
- The 4 "stat cards" (hometown, known for, etc.)
- Memories wall — add submitted memories as `.memory-card` blocks

**Celebration page (`celebration.html`):**
- Service time (not yet filled in)
- Attire guidance
- Note to guests from the family

---

## Sending the RSVP Link

When emailing invitees, link directly to the RSVP:
```
https://yourusername.github.io/celebrating-dawn/celebration.html#rsvp
```
This lands them on the Celebration of Life page with the invitation graphic at the top,
then they scroll down to the RSVP form.

---

Made with love for Dawn.
