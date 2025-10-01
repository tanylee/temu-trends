import fs from "fs/promises";
import fetch from "node-fetch";
import { fetchImageAsBase64 } from "./utils/image.js";

const TOKEN = process.env.PINTEREST_TOKEN;
if (!TOKEN) throw new Error("Set PINTEREST_TOKEN");

const BOARD_MAP = {
  US: process.env.BOARD_ID_US,
  CA: process.env.BOARD_ID_CA,
  UK: process.env.BOARD_ID_UK,
  FR: process.env.BOARD_ID_FR,
  DE: process.env.BOARD_ID_DE
};

const rows = JSON.parse(await fs.readFile("data/products.sample.json", "utf8"));

for (const item of rows) {
  const board_id = BOARD_MAP[item.country];
  if (!board_id) { console.warn(`Skip ${item.title}: no board for ${item.country}`); continue; }

  // надёжнее всегда делать base64 (Temu часто блочит прямые ссылки)
  const { base64, contentType } = await fetchImageAsBase64(item.image);

  const payload = {
    board_id,
    title: item.title,
    description: item.description,
    link: item.link,
    media_source: {
      source_type: "image_base64",
      content_type: contentType,
      data: base64
    }
  };

  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const out = await res.json();
  if (!res.ok) { console.error(out); }
  else { console.log(`OK → ${item.country}: ${out.id}`); }
}
