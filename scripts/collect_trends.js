import fs from 'fs';
import { newBrowserWithProxy } from './utils/oxylabs.js';
import categories from '../config/categories.json' assert { type:'json' };

const WIN = process.argv.some(a=>a.includes('--window=3m')) ? '3m' : '1m';

async function demoCollect(q){
  await new Promise(r=>setTimeout(r,150));
  return {
    id: `tt:${q}:${Date.now()}`,
    platform: 'tiktok',
    hashtags: [q.replace(/\s+/g,''), 'temufinds'],
    keywords: [q],
    engagement: { likes: 40000+Math.floor(Math.random()*20000), comments: 800, shares: 450 },
    lang: 'en',
    country_signals: ['US','CA','UK','DE','FR'],
    season: [],
    ts: Math.floor(Date.now()/1000),
    window: WIN
  };
}

(async()=>{
  const browser = await newBrowserWithProxy();
  const ctx = await browser.newContext();
  const out = [];
  for (const [cat, keys] of Object.entries(categories)) {
    for (const k of keys) {
      const item = await demoCollect(k);
      out.push({ ...item, category: cat });
    }
  }
  await browser.close();
  fs.writeFileSync('data/trends_raw_3m.json', JSON.stringify(out,null,2));
  console.log(`saved data/trends_raw_3m.json (${out.length})`);
})();
