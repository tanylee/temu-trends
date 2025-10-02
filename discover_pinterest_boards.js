import fs from 'fs';
import { chromium } from 'playwright';

const cookies = JSON.parse(process.env.PINTEREST_COOKIE || '[]');

(async()=>{
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  await page.goto('https://www.pinterest.com/your_profile_name/_saved/');
  await page.waitForTimeout(3000);
  const names = await page.$$eval('a[data-test-id="board-card-link"]', els =>
    els.map(a => a.textContent.trim()).filter(Boolean));
  const out = {};
  names.forEach(n=> out[n.toLowerCase().replace(/\s+/g,'-')] = n);
  if (Object.keys(out).length) {
    fs.writeFileSync('config/boards.json', JSON.stringify(out,null,2));
    console.log('boards.json updated');
  } else {
    console.log('no boards found (update URL or login)');
  }
  await browser.close();
})();
