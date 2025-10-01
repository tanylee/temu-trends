import fetch from "node-fetch";
import { fetchImageAsBase64 } from "./utils/image.js";

const TOKEN = process.env.PINTEREST_TOKEN;
const BOARD_ID = process.env.BOARD_ID_US || "";
if (!TOKEN) throw new Error("Set PINTEREST_TOKEN");
if (!BOARD_ID) throw new Error("Set BOARD_ID_*");

// замени на картинку товара (Temu URL лучше прогонять через base64)
const IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg";

const { base64, contentType } = await fetchImageAsBase64(IMAGE_URL);

const payload = {
  board_id: BOARD_ID,
  title: "Viral find — clean aesthetic",
  description: "Auto-posted by Moodette",
  link: "https://temu.to/k/gd1pto8322c",
  media_source: {
    source_type: "image_base64",
    content_type: contentType,     // "image/jpeg" | "image/png"
    data: base64
  }
};

const res = await fetch("https://api.pinterest.com/v5/pins", {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
const out = await res.json();
if (!res.ok) { console.error(out); throw new Error(`Pinterest ${res.status}`); }
console.log("Created Pin:", out.id);
