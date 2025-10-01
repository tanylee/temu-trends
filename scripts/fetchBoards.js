import fetch from "node-fetch";

const TOKEN = process.env.PINTEREST_TOKEN;
if (!TOKEN) throw new Error("Set PINTEREST_TOKEN in env");

async function listBoards() {
  let url = "https://api.pinterest.com/v5/boards";
  const all = [];
  while (url) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }});
    const j = await r.json();
    (j.items || []).forEach(b => all.push({ id: b.id, name: b.name, privacy: b.privacy }));
    url = j.bookmark ? `https://api.pinterest.com/v5/boards?bookmark=${encodeURIComponent(j.bookmark)}` : null;
  }
  return all;
}

const boards = await listBoards();
console.table(boards);
