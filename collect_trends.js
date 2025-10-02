import fs from 'fs';
import { newBrowserWithProxy } from './utils/oxylabs.js';
import categories from '../config/categories.json' assert { type: 'json' };

const WIN = process.argv.includes('--window=3m') ? 90 : 30;

async function collectTikTok(browser, q) {
  // Заглушка: имитация данных. Подключение к реальному поиску можно нарастить.
  await new Promise(r=>setTimeout(r, 500));
  return [{
    id: `tiktok:${q}:${Date.now()}`,
    platform: 'tiktok',
    hashtags: [q, 'temufinds'],
    keywords: [q],
    engagement: { likes: 50000, comments: 1200, shares: 600 },
    lang: 'en',
    country_signals: ['US','CA','UK','DE','FR'],
    season: [],
    ts: Math.floor(Date.now()/1000)
  }];
}

async function main(){
  const browser = await newBrowserWithProxy();
  const ctx = await browser.newContext({ viewport: { width:1280, height:900 }});
  const out = [];
  for (const [cat,keys] of Object.entries(categories)) {
    for (const k of keys) {
      const t = await collectTikTok(browser, k);
      out.push(...t.map(x=>({...x, category:cat, window:`${WIN}d`})));
    }
  }
  await browser.close();
  fs.writeFileSync('data/trends_raw_3m.json', JSON.stringify(out, null, 2));
  console.log(`saved trends_raw_3m.json (${out.length})`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
