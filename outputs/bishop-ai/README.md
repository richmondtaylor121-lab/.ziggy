# Bishop AI Website Handoff Guide

Welcome to your new static website! This site is designed using the **FORGES framework** to ensure high-performance, accessibility, and sleek B2B marketing aesthetics. It contains no heavy frameworks or build scripts, meaning it is highly portable, fast, and easy to maintain.

---

## Folder & File Directory

Your project contains the following files and folders under `outputs/bishop-ai/`:

- **`index.html`** — The Homepage and main landing page. Focuses on revenue leakage, GTM tools, and embeds the Chilipiper booking calendar.
- **`services.html`** — The Services hub detailing your Done-For-You builds, AI Team training, and Consulting services.
- **`about.html`** — Richmond Taylor's professional biography, credentials, and custom tech stack showcase.
- **`cases.html`** — Case studies structured into vertical templates (Professional Services, E-commerce, Real Estate).
- **`blog.html`** — Insights page featuring the gated **State of AI 2025** report lead magnet and a filterable articles archive.
- **`partners.html`** — Curated affiliate recommendations with referral links (Lovable, n8n, Instantly, Aimfox, Wispr Flow) and a referral program track for other agencies.
- **`faq.html`** — Accordion-style layout addressing pricing, timeline, process, and tech inquiries.
- **`contact.html`** — Split screen containing a Salesforce web-to-lead form layout and Chilipiper calendar.
- **`legal.html`** — Tabbed container for your Privacy Policy and Terms of Service.
- **`css/styles.css`** — The design system. Controls branding tokens (gold, teal, deep navy), layouts, cards, and animations.
- **`js/main.js`** — Interactivity helpers (mobile menu toggle, FAQ accordions, blog/legal tab swappers, and form validation).
- **`images/bishop_ai_logo.png`** — The Bishop AI logo image asset.
- **`robots.txt`** — Directs web crawlers and points to the sitemap location.
- **`sitemap.xml`** — Search engine directory indexing all 9 website pages.

---

## How to Work With Your Site

### 1. Previewing Locally
You do not need a developer server or console commands. 
- Double-click **`index.html`** (or any HTML file) to open and test it directly in Google Chrome, Safari, Firefox, or Edge.
- Verify links, tab switches, accordions, and mobile navigation responsive views.

### 2. Editing Copy and Wording
All text copy is placed between clear HTML semantic tags in each page. 
- Open any `.html` page in a text editor (e.g. Notepad, VS Code, or Sublime Text).
- Use `Ctrl + F` to search for the sentence or headline you wish to update and type your changes directly between the opening and closing tag (e.g., `<h2>Your New Heading</h2>`).

### 3. Connecting Contact Forms to a Backend
The forms on `contact.html`, `blog.html`, and `partners.html` are styled and pre-validated, but require a backend action URL to submit data.
- **Formspree / Netlify Forms:**
  Create a Formspree account, copy your endpoint hash, and add it to the `<form>` tag:
  ```html
  <form data-validate action="https://formspree.io/f/YOUR_ENDPOINT_HASH" method="POST">
  ```
- **Salesforce Web-to-Lead Sync:**
  To feed form data directly into Salesforce leads:
  1. Set the form tag parameters:
     ```html
     <form data-validate action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8" method="POST">
     ```
  2. Insert a hidden input inside the form containing your organization ID:
     ```html
     <input type="hidden" name="oid" value="YOUR_15_DIGIT_SALESFORCE_ORG_ID">
     ```
  3. Change field `name` attributes to match Salesforce's API names (e.g. `first_name`, `last_name`, `company`, `email`).

### 4. Adding Analytics Codes
To track visitors using Google Analytics or Plausible:
- Open each `.html` file.
- Locate the `<script>` block in the `<head>` section:
  ```html
  <!-- Analytics Script Block Placeholder -->
  ```
- Paste your tracking script snippet directly inside or replacement of this block.

### 5. Replacing Images
- Save your new images under the `images/` directory.
- Update the matching `src="..."` attribute inside the `.html` file pointing to your new filename.

---

## Publishing Your Site Live

Since this site is fully static, hosting is extremely cost-effective or free.

1. **Netlify (Drag &amp; Drop):**
   - Go to [Netlify Drop](https://app.netlify.com/drop).
   - Drag and drop your root folder containing `index.html` directly into the browser.
   - Your site will deploy instantly. Connect your custom domain `bishopai.io` in settings.

2. **GitHub Pages:**
   - Push this root directory to a GitHub repository.
   - Go to **Settings -> Pages** in your repo, choose the main branch, and click save.

3. **FTP Hosting (cPanel / Bluehost):**
   - Upload the files directly to your server's `public_html` directory using an FTP client like FileZilla.
