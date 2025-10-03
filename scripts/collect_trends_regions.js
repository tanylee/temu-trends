import { fetchHTML, saveJSON } from "./utils/oxylabs_wsa.js";
import { load } from "cheerio";

const OUT = "data/trends_regions.json";
const COUNTRIES = [
  { code: "US", geo: "United States" },
  { code: "CA", geo: "Canada" },
  { code: "DE", geo: "Germany" },
  { code: "FR", geo: "France" },
  { code: "UK", geo: "United Kingdom" },
];

// ---------- TikTok Creative Center ----------
async function fetchTikTokCenter(region) {
  const url = `https://ads.tiktok.com/business/creativecenter/hashtag/${region.toLowerCase()}`;
  const html = await fetchHTML(url, { geo: region });
  const $ = load(html);

  const hashtags = [];
  $("a[href*='/hashtag/']").slice(0, 30).each((_, a) => {
    const tag = $(a).text().replace("#", "").trim();
    if (tag && !hashtags.includes(tag)) hashtags.push(tag);
  });

  const songs = [];
  $("a[href*='/music/']").slice(0, 20).each((_, a) => {
    const song = $(a).text().trim();
    if (song) songs.push(song);
  });

  return { region, hashtags, songs, source: "tiktok_center" };
}

// ---------- Pinterest Trends ----------
async function fetchPinterest(region) {
  const url = "https://www.pinterest.com/trending/";
  const html = await fetchHTML(url, { geo: region });
  const $ = load(html);
  const keywords = [];
  $("a, span").each((_, el) => {
    const t = $(el).text().trim();
    if (t && /^[A-Za-zÀ-ÿ0-9\s#&\-',]+$/.test(t)) keywords.push(t);
  });
  return { region, keywords: Array.from(new Set(keywords)).slice(0, 80), source: "pinterest" };
}

// ---------- Instagram Explore ----------
async function fetchInstagram(region) {
  const url = "https://www.instagram.com/explore/";
  const html = await fetchHTML(url, { geo: region, render: true });
  const $ = load(html);

  const tags = [];
  $("a[href*='/explore/tags/']").slice(0, 25).each((_, a) => {
    const tag = $(a).attr("href").split("/explore/tags/")[1]?.replace("/", "");
    if (tag) tags.push(tag);
  });
  return { region, tags, source: "instagram_explore" };
}

// ---------- Orchestration ----------
(async () => {
  const result = { fetchedAt: new Date().toISOString(), regions: [] };

  for (const c of COUNTRIES) {
    console.log(`▶ ${c.code} TikTok Creative Center`);
    const tt = await fetchTikTokCenter(c.code);

    console.log(`▶ ${c.code} Pinterest Trends`);
    const pt = await fetchPinterest(c.geo);

    console.log(`▶ ${c.code} Instagram Explore`);
    const ig = await fetchInstagram(c.geo);

    result.regions.push({
      country: c.code,
      tiktok: tt,
      pinterest: pt,
      instagram: ig,
    });
  }

  await saveJSON(OUT, result);
  console.log(`✅ Saved ${OUT}`);
})();
