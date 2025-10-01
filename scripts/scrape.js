/**
 * Temu scraper via Oxylabs Realtime | Universal
 * - Geo-targeted (US/CA/GB/FR/DE)
 * - Saves normalized results to data/products.json
 *
 * Env:
 *   OXY_USER, OXY_PASS  - Oxylabs Web Scraper API credentials
 *
 * Run:  node scripts/scrape.js
 */

import fs from "fs/promises";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const OXY_USER = process.env.OXY_USER;
const OXY_PASS = process.env.OXY_PASS;
if (!OXY_USER || !OXY_PASS) {
  console.error("❌ Set OXY_USER and OXY_PASS in env");
  process.exit(1);
}

const OXY_ENDPOINT = "https://realtime.oxylabs.io/v1/queries";

/**
 * 1) Список стартовых ссылок Temu «новинки/популярное».
 * При желании меняй на конкретные категории/ниши.
 * Совет: избегай слишком общих запросов, чтобы не получить мусор.
 */
const SEEDS = {
  US: [
    "https://www.temu.com/search_result.html?search_key=new%20arrivals",
    "https://www.temu.com/search_result.html?search_key=trending%20home",
  ],
  CA: [
    "https://www.temu.com/ca/search_result.html?search_key=new%20arrivals",
    "https://www.temu.com/ca/search_result.html?search_key=trending%20home",
  ],
  GB: [
    "https://www.temu.com/uk/search_result.html?search_key=new%20arrivals",
    "https://www.temu.com/uk/search_result.html?search_key=trending%20home",
  ],
  FR: [
    "https://www.temu.com/fr/search_result.html?search_key=nouveaut%C3%A9s",
    "https://www.temu.com/fr/search_result.html?search_key=tendances%20d%C3%A9co",
  ],
  DE: [
    "https://www.temu.com/de/search_result.html?search_key=neuheiten",
    "https://www.temu.com/de/search_result.html?search_key=trend%20home",
  ],
};

/**
 * geo_location значения, которые понимает Oxylabs
 * (ISO-коды стран). Можно указывать и города/штаты.
 */
const GEO = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
};

/**
 * Запрос к Oxylabs Universal (рендер включён).
 * Возвращает HTML страницы Temu.
 */
async function oxylabsGetHtml(url, geo) {
  const body = {
    source: "universal",
    url,
    render: true,             // включаем рендер для SPA-страниц Temu
    geo_location: geo || "United States",
    // user_agent: "desktop", // можно явно задать, по умолчанию норм
  };

  const resp = await fetch(OXY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${OXY_USER}:${OXY_PASS}`).toString("base64"),
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Oxylabs HTTP ${resp.status}: ${t}`);
  }

  const json = await resp.json();
  const result = json?.results?.[0];
  const html = result?.content || "";
  return html;
}

/**
 * Извлечь карточки товаров с поисковой страницы Temu.
 * Temu активно меняет разметку, поэтому используем:
 * - селекторы карточек
 * - резервный парс скриптов с товарами (goods_id, title, price)
 */
function parseSearchHtml(html, country) {
  const out = [];
  const $ = cheerio.load(html);

  // 1) Пытаемся по видимым карточкам
  // Карточки часто лежат в <a href="/goods.html?goods_id=...">
  $("a[href*='goods.html?goods_id=']").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    // абсолютная ссылка
    const product_url = href.startsWith("http")
      ? href
      : new URL(href, "https://www.temu.com").toString();

    // заголовок (ищем ближайшие подписи)
    const title =
      $(a).find("p,span,h3,h4,[class*='title']").first().text().trim() ||
      $(a).attr("title") ||
      "";

    // картинка
    let image =
      $(a).find("img").attr("src") || $(a).find("img").attr("data-src") || "";
    if (image && image.startsWith("//")) image = "https:" + image;
    if (image && image.startsWith("/")) image = "https://www.temu.com" + image;

    // цена
    let price =
      $(a).find("[class*='price'],[class*='Price']").first().text().trim() ||
      "";

    if (product_url) {
      out.push({
        country,
        title,
        price,
        image,
        product_url,
      });
    }
  });

  // 2) Резерв: парсим JSON из скриптов (если карточки не отрисовались)
  if (out.length < 8) {
    const scripts = $("script").map((_, s) => $(s).html() || "").get().join("\n");

    // goods_id
    const re = /"goods_id"\s*:\s*"(\d+)"/g;
    const ids = new Set();
    let m;
    while ((m = re.exec(scripts))) ids.add(m[1]);

    for (const id of ids) {
      const product_url = `https://www.temu.com/goods.html?goods_id=${id}`;
      out.push({
        country,
        title: "",
        price: "",
        image: "",
        product_url,
      });
    }
  }

  // Нормализация: фильтруем пустые, убираем дубликаты по URL
  const seen = new Set();
  const norm = [];
  for (const item of out) {
    if (!item.product_url) continue;
    const key = item.product_url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);

    norm.push({
      country: item.country,
      title: sanitize(item.title) || "New arrival",
      price: sanitize(item.price),
      image: item.image || "",
      product_url: item.product_url,
    });
  }

  return norm;
}

function sanitize(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

/**
 * Основной проход: обходим страны и их seed-URL
 */
async function run() {
  const all = [];

  for (const country of Object.keys(SEEDS)) {
    const geo = GEO[country];
    const urls = SEEDS[country];

    for (const url of urls) {
      try {
        console.log(`🌎 ${country} → ${url}`);
        const html = await oxylabsGetHtml(url, geo);
        const items = parseSearchHtml(html, country);
        console.log(`   +${items.length} items`);
        all.push(...items);
        await delay(1200); // мягкий таймаут между запросами
      } catch (e) {
        console.warn(`   ! ${country} failed: ${e.message}`);
      }
    }
  }

  // Финальная дедупликация по product_url
  const byUrl = new Map();
  for (const item of all) {
    const key = item.product_url.split("?")[0];
    if (!byUrl.has(key)) byUrl.set(key, item);
  }

  const result = Array.from(byUrl.values());

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/products.json", JSON.stringify(result, null, 2), "utf8");
  console.log(`\n✅ Saved ${result.length} products → data/products.json`);
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
