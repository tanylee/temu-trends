// scripts/utils/oxylabs_wsa.js
import fs from "fs/promises";

export async function fetchHTML(url, { geo = "United States", render = true } = {}) {
  const user = process.env.OXYLABS_USER;
  const pass = process.env.OXYLABS_PASS;
  if (!user || !pass) throw new Error("OXYLABS_USER / OXYLABS_PASS not set");

  const payload = {
    source: "universal",
    url,
    geo_location: geo,
    ...(render ? { render: "html" } : {}),
  };

  const res = await fetch("https://realtime.oxylabs.io/v1/queries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64"),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WSA HTTP ${res.status}: ${body}`);
  }

  const data = await res.json();
  const result = data?.results?.[0];
  if (!result?.content) throw new Error("WSA empty content");
  return { html: result.content, status: result.status_code, url: result.url };
}

export async function saveJSON(path, data) {
  await fs.mkdir(path.split("/").slice(0, -1).join("/"), { recursive: true });
  await fs.writeFile(path, JSON.stringify(data, null, 2), "utf8");
}
