# Moodette — Temu Trends (auto)

Stack: Oxylabs + GitHub Actions + Netlify + Pinterest (cookie-only) + Plausible.

## Secrets (GitHub → Settings → Secrets → Actions)
- NETLIFY_AUTH_TOKEN
- NETLIFY_SITE_ID
- OXYLABS_USER
- OXYLABS_PASS
- OXY_ENDPOINT (e.g. pr.oxylabs.io:7777)
- OXY_STICKY (e.g. 600)
- PINTEREST_COOKIE (JSON array of cookies)
- PLAUSIBLE_DOMAIN = temu-trends.netlify.app
- PLAUSIBLE_SCRIPT_URL = https://plausible.io/js/script.js
- TZ (optional)

## Local run
npm i && npx playwright install
npm run collect:trends
npm run map:temu
npm run build:site
npm run queue
npm run pin
