import fs from 'fs';
import { chromium } from 'playwright';

const cookies = JSON.parse(process.env.PINTEREST_COOKIE || '[]');
const queue = JSON.parse(fs.readFileSync('data/pin_queue.json','utf8'));

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function postPin(page, item){
  // страница создания пина
  await page.goto('https://www.pinterest.com/pin-builder/');
  await page.waitForLoadState('domcontentloaded');

  // Заголовок
  await page.fill('textarea[placeholder="Add a title"]', item.title).catch(()=>{});
  // Описание
  const descSel = 'textarea[placeholder="Tell everyone what your Pin is about"]';
  if (await page.$(descSel)) await page.fill(descSel, item.description);

  // Ссылка
  const linkSel = 'input[name="link"]';
  if (await page.$(linkSel)) await page.fill(linkSel, item.link);

  // Изображение (URL attach через drag-n-drop сложно; откроем upload by URL через fetch и dataURL)
  // Упрощённый способ: открыть вкладку для загрузки файла не реализуем без локального файла.
  // Поэтому делаем редирект-постинг с ссылкой и без картинки как минимальный fallback.
  // TODO: заменить на upload через file chooser, если у вас есть локальные изображения.

  // Выбор доски — Pinterest обычно автоподставляет последнюю; можно оставить.

  // Публикация
  const btn = await page.$('button:has-text("Publish")');
  if (btn) await btn.click();

  await page.waitForTimeout(2500);
  return true;
}

(async()=>{
  const browser = await chromium.launch({ headless: true, args:['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  let posted = 0;
  for (const item of queue.slice(0,2)) { // безопасный старт: 2 пина за прогон
    try {
      await postPin(page, item);
      posted++;
      await sleep(3000 + Math.random()*2000);
    } catch(e) {
      console.error('post error', e.message);
      await sleep(5000);
    }
  }
  console.log(`posted: ${posted}`);
  await browser.close();
})();
