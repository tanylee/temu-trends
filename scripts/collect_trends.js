// scripts/collect_trends.js
import { fetchHTML, saveJSON } from "./utils/oxylabs_wsa.js";
import { load } from "cheerio";

const OUT = "data/trends_raw_3m.json";

async function collectPinterestTrends() {
  // 1) Официальная страница Trends
  const { html } = await fetchHTML("https://trends.pinterest.com/", { geo: "United States" });
  const $ = load(html);

  // Берём популярные запросы/темы (вёрстка меняется — оставляем несколько селекторов)
  const keywords = new Set();
  $("a, span").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length > 2 && t.length < 60 && /^[A-Za-z0-9\s#&\-\',]+$/.test(t)) {
      keywords.add(t);
    }
  });

  // 2) Today/Popular (добавим вторую страницу, если доступна)
  try {
    const { html: today } = await fetchHTML("https://www.pinterest.com/today/", { geo: "United States" });
    const $t = load(today);
    $t("a, span").each((_, el) => {
      const t = $t(el).text().trim();
      if (t && t.length > 2 && t.length < 60 && /^[A-Za-z0-9\s#&\-\',]+$/.test(t)) {
        keywords.add(t);
      }
    });
  } catch { /* опционально, не критично */ }

  // 3) Сами pin-ссылки с /trending/ (если есть)
  const pins = [];
  $("a[href*='/pin/']").slice(0, 40).each((_, a) => {
    pins.push({ url: $(a).attr("href"), title: $(a).attr("aria-label") || $(a).text().trim() || "" });
  });

  return {
    source: "pinterest",
    window: "3m",
    keywords: Array.from(keywords).slice(0, 100),
    samplePins: pins,
    fetchedAt: new Date().toISOString(),
  };
}

async function collectTikTokTrends() {
  // Используем открытый раздел trending/tag (в некоторых регионах доступен без логина)
  const { html } = await fetchHTML("https://www.tiktok.com/tag/trending", { geo: "United States" });
  const $ = load(html);

  const videos = [];
  $("a[href*='/video/']").slice(0, 30).each((_, a) => {
    const url = $(a).attr("href");
    const text = $(a).text().replace(/\s+/g, " ").trim();
    videos.push({ url, text });
  });

  const hashtags = [];
  $("a[href^='/tag/']").slice(0, 50).each((_, a) => {
    const tag = $(a).text().trim();
    if (tag && !hashtags.includes(tag)) hashtags.push(tag);
  });

  return {
    source: "tiktok",
    window: "3m",
    videos,
    hashtags,
    fetchedAt: new Date().toISOString(),
  };
}

(async () => {
  try {
    console.log("▶ Pinterest Trends via WSA…");
    const pinterest = await collectPinterestTrends();

    console.log("▶ TikTok Trending via WSA…");
    const tiktok = await collectTikTokTrends();

    const result = {
      region: "US",
      window: "3m",
      fetchedAt: new Date().toISOString(),
      pinterest,
      tiktok,
    };

    await saveJSON(OUT, result);
    console.log(`✅ Saved ${OUT}`);
  } catch (e) {
    console.error("❌ collect_trends failed:", e);
    process.exit(1);
  }
})();
