import fetch from "node-fetch";

const TOKEN = process.env.PINTEREST_TOKEN;
const BOARD_ID = process.env.BOARD_ID_US || ""; // поставь нужную доску

if (!TOKEN) throw new Error("Set PINTEREST_TOKEN");
if (!BOARD_ID) throw new Error("Set BOARD_ID_*");

const payload = {
  board_id: BOARD_ID,
  title: "Trending Aesthetic Find 🌸",
  description: "Daily Temu find — pastel & cozy #temufinds #homedecor",
  link: "https://temu.to/k/gd1pto8322c",
  media_source: {
    source_type: "image_url",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"
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
