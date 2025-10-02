import fs from 'fs';
import { chromium } from 'playwright';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const cookies = JSON.parse(process.env.PINTEREST_COOKIE || '[]');
const queue = JSON.parse(fs.readFileSync('data/pin_queue.json','utf8'));
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

async function ensureLogged(page){
  await page.goto('https://www.pinterest.com/');
  await page.waitForLoadState('domcontentloaded');
  const logged = await page.$('a[href*="_saved"]');
  if (!logged) throw new Error('Login required — update PINTEREST_COOKIE');
}

async function downloadImage(url){
  const r = await fetch(url);
  if (!r.ok) throw new Error('image fetch failed');
  const buf = Buffer.from(await r.arrayBuffer());
  const p = `/tmp/${uuidv4()}.jpg`;
  fs.writeFileSync(p, buf);
  return p;
}

async function postPin(page, item){
  await page.goto('https://www.pinterest.com/pin-builder/');
  await page.waitForLoadState('domcontentloaded');
  const titleSel = 'textarea[placeholder="Add a title"]';
  if (await page.$(titleSel)) await page.fill(titleSel, item.title);
  const descSel = 'textarea[placeholder="Tell everyone what your Pin is about"]';
  if (await page.$(descSel)) await page.fill(descSel, item.description || '');
  const linkSel = 'input[name="link"]';
  if (await page.$(linkSel)) await page.fill(linkSel, item.link);

  const file = await downloadImage(item.image);
  await page.setInputFiles('input[type="file"]', file);
  await page.waitForTimeout(3000);

  const publish = await page.$('button:has-text("Publish")') || await page.$('button[type="submit"]');
  if (publish) await publish.click();
  await page.waitForTimeout(3500);
  return true;
}

(async()=>{
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  try { await ensureLogged(page); }
  catch(e){ console.error('❌', e.message); process.exit(1); }

  let posted = 0;
  for (const item of queue.filter(q=>!q.posted).slice(0,2)) { // 2 пина/запуск
    try {
      await postPin(page, item);
      item.posted = true;
      posted++;
      await sleep(2000 + Math.random()*2000);
    } catch(e) {
      console.error('post error:', e.message);
      await sleep(5000);
    }
  }
  fs.writeFileSync('data/pin_queue.json', JSON.stringify(queue,null,2));
  console.log(`✅ posted: ${posted}`);
  await browser.close();
})();
