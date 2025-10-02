import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');

// --- settings ---
const DOMAIN = process.env.PLAUSIBLE_DOMAIN || 'temu-trends.netlify.app';
const PLAUSIBLE = process.env.PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js';
const TITLE = 'Moodette — Temu Trends';
const DESC  = 'Curated trending & aesthetic finds for US, CA, UK, FR, DE. Auto-post to Pinterest with affiliate links.';

const COUNTRY_PAGES = [
  { slug: 'us-finds', label: 'US Finds', desc: 'Trending & Aesthetic Must-Haves', cc: 'US' },
  { slug: 'ca-finds', label: 'CA Finds', desc: 'Cozy & Viral Essentials', cc: 'CA' },
  { slug: 'uk-finds', label: 'UK Finds', desc: 'Minimal & Chic Picks', cc: 'UK' },
  { slug: 'fr-finds', label: 'FR Finds', desc: 'Pastel & Parisian Vibes', cc: 'FR' },
  { slug: 'de-finds', label: 'DE Finds', desc: 'Clean & Functional Style', cc: 'DE' }
];

// --- helpers ---
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive:true }); }
function readJSON(p, fallback){ try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return fallback; } }

function card(p){
  const safeTitle = (p.title || 'Aesthetic pick').replace(/</g,'&lt;');
  return `
  <article class="card">
    <img src="${p.image}" alt="Aesthetic ${safeTitle}" loading="lazy" width="600" height="600"/>
    <h3>${safeTitle}</h3>
    <p>$${Number(p.price||0).toFixed(2)}</p>
    <a class="button" href="${p.aff_url}" data-pla="Outbound Click">Get it on TEMU</a>
  </article>`;
}

function pageShell({title, body, extraHeader=''}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${DESC}">
<link rel="stylesheet" href="/styles.css" />
<script defer data-domain="${DOMAIN}" src="${PLAUSIBLE}"></script>
<link rel="icon" href="https://www.temu.com/favicon.ico" type="image/x-icon" />
</head>
<body>
<header>
  <h1>${TITLE}</h1>
  <p>${DESC}</p>
</header>
${extraHeader}
<main id="grid">
${body}
</main>
<footer>
  <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a>
  <br/><br/><small>© ${new Date().getFullYear()} Moodette — curated by AI automation</small>
</footer>
</body>
</html>`;
}

function indexCategories() {
  return `
<section class="category-grid">
  ${COUNTRY_PAGES.map(c => `
  <div class="category-card" onclick="location.href='/${c.slug}.html'">
    <h3>${c.label}</h3>
    <p>${c.desc}</p>
  </div>`).join('')}
</section>`;
}

// --- run ---
ensureDir(pub);
const products = readJSON(path.join(root, 'data', 'products.json'), []);

//
// 1) Главная: категории + последние 24 товара
//
const latest = products.slice(0, 24).map(card).join('\n');
const indexHTML = pageShell({
  title: TITLE,
  body: `${latest}`,
  extraHeader: indexCategories()
});
fs.writeFileSync(path.join(pub, 'index.html'), indexHTML);
console.log('✓ public/index.html updated');

//
// 2) Страницы стран
//
for (const page of COUNTRY_PAGES) {
  const list = products.filter(p => (p.countries||[]).includes(page.cc)).slice(0, 60);
  const body = list.length ? list.map(card).join('\n') : `<p style="text-align:center;color:#777">No items yet for ${page.label} — check back soon.</p>`;
  const html = pageShell({
    title: `${page.label} — ${TITLE}`,
    body
  });
  fs.writeFileSync(path.join(pub, `${page.slug}.html`), html);
  console.log(`✓ public/${page.slug}.html (${list.length})`);
}
