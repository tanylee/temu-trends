// scripts/collect_seasonal.js
import { fetchHTML, saveJSON } from "./utils/oxylabs_wsa.js";
import { load } from "cheerio";

const OUT = "data/trends_raw_seasonal.json";
const QUERIES = [
  "Halloween costumes",
  "Black Friday gifts",
  "Christmas ornaments",
  "Winter outfits",
  "New Year party",
];

async function pinterestSearch(q) {
  const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;
  const { html } = await fetchHTML(url, { geo: "United States" });
  const $ = load(html);

  const pins = [];
  $("a[href*='/pin/']").slice(0, 25).each((_, a) => {
    pins.push({ url: $(a).attr("href"), title: $(a).attr("aria-label") || $(a).text().trim() || "" });
  });

  return { q, pins, count: pins.length };
}

(async () => {
  try {
    const items = [];
    for (const q of QUERIES) {
      console.log("▶ Seasonal:", q);
      const res = await pinterestSearch(q);
      items.push(res);
    }
    await saveJSON(OUT, { items, window: "seasonal", fetchedAt: new Date().toISOString() });
    console.log(`✅ Saved ${OUT}`);
  } catch (e) {
    console.error("❌ collect_seasonal failed:", e);
    process.exit(1);
  }
})();
