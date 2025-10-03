// scripts/post_pinterest_pins.js
import fs from "fs";
import fetch from "node-fetch";

const COOKIE = JSON.parse(process.env.PINTEREST_COOKIE || "[]");
const BOARD_ID = process.env.PINTEREST_BOARD_ID || "";
const HEADERS = {
  "Content-Type": "application/json",
  "x-app-version": "1.0",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  Cookie: COOKIE.map(c => `${c.name}=${c.value}`).join("; "),
};

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function createPin(pin) {
  const res = await fetch("https://www.pinterest.com/resource/PinResource/create/", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      options: {
        board_id: BOARD_ID,
        description: pin.description,
        link: pin.link,
        image_url: pin.image_url,
      },
      context: {},
    }),
  });
  const json = await res.json();
  if (!json?.resource_response?.data?.id) {
    console.error("❌ Ошибка публикации:", json);
  } else {
    console.log("✅ Pin создан:", json.resource_response.data.id);
  }
}

async function main() {
  if (!BOARD_ID) throw new Error("⚠️ Не указан PINTEREST_BOARD_ID");
  console.log("🎯 Начинаем постинг пинов...");

  const trends = JSON.parse(fs.readFileSync("data/trends_aggregated.json", "utf8"));
  const products = JSON.parse(fs.readFileSync("data/products.json", "utf8"));
  const pins = [];

  for (const t of trends.top_trends.slice(0, 50)) {
    const match = products.find(p =>
      p.title?.toLowerCase().includes(t.keyword) ||
      p.description?.toLowerCase().includes(t.keyword)
    );
    if (match) {
      pins.push({
        description: `${t.keyword} • ${match.title}`,
        link: match.link,
        image_url: match.image,
      });
    }
  }

  const limit = 500;
  const toPost = pins.slice(0, limit);
  for (const [i, pin] of toPost.entries()) {
    console.log(`📌 ${i + 1}/${toPost.length}: ${pin.description}`);
    await createPin(pin);
    await delay(60000); // пауза 1 минута между постами
  }
  console.log("🚀 Все пины опубликованы!");
}

main().catch(console.error);
