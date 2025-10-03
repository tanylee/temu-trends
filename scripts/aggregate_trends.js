// scripts/aggregate_trends.js
import fs from "fs/promises";
import path from "path";

const FILES = [
  "data/trends_raw_3m.json",
  "data/trends_raw_seasonal.json",
  "data/trends_regions.json",
];

function safeReadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** очистка и нормализация текста */
function normalize(t) {
  return t
    .toLowerCase()
    .replace(/[#']/g, "")
    .replace(/[^a-z0-9\s\-]/g, "")
    .trim();
}

(async () => {
  const all = [];
  for (const f of FILES) {
    try {
      const p = path.resolve(f);
      const data = JSON.parse(await fs.readFile(p, "utf8"));
      all.push({ name: f, data });
    } catch (e) {
      console.warn("⚠️ Нет файла", f);
    }
  }

  const freq = new Map();

  // ---------- 3-месячные ----------
  const t3 = all.find(x => x.name.includes("3m"))?.data;
  if (t3?.pinterest?.keywords) {
    for (const k of t3.pinterest.keywords) {
      const kw = normalize(k);
      if (kw) freq.set(kw, (freq.get(kw) || 0) + 3);
    }
  }
  if (t3?.tiktok?.hashtags) {
    for (const h of t3.tiktok.hashtags) {
      const kw = normalize(h);
      if (kw) freq.set(kw, (freq.get(kw) || 0) + 4);
    }
  }

  // ---------- Seasonal ----------
  const ts = all.find(x => x.name.includes("seasonal"))?.data;
  if (ts?.items) {
    for (const q of ts.items) {
      const kw = normalize(q.q);
      if (kw) freq.set(kw, (freq.get(kw) || 0) + 2);
    }
  }

  // ---------- Regions ----------
  const tr = all.find(x => x.name.includes("regions"))?.data;
  if (tr?.regions) {
    for (const r of tr.regions) {
      for (const h of r.tiktok?.hashtags || []) {
        const kw = normalize(h);
        if (kw) freq.set(kw, (freq.get(kw) || 0) + 4);
      }
      for (const k of r.pinterest?.keywords || []) {
        const kw = normalize(k);
        if (kw) freq.set(kw, (freq.get(kw) || 0) + 3);
      }
      for (const t of r.instagram?.tags || []) {
        const kw = normalize(t);
        if (kw) freq.set(kw, (freq.get(kw) || 0) + 2);
      }
    }
  }

  // ---------- Сортировка и выбор топ-50 ----------
  const sorted = Array.from(freq.entries())
    .map(([k, s]) => ({ keyword: k, score: s }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  const out = {
    generatedAt: new Date().toISOString(),
    top_trends: sorted,
  };

  await fs.writeFile("data/trends_aggregated.json", JSON.stringify(out, null, 2));
  console.log("✅ Aggregated", sorted.length, "trends saved to data/trends_aggregated.json");
})();
