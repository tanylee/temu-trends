import fs from "fs/promises";

export async function fetchHTML(url, { geo = "United States", render = true } = {}) {
  const user = process.env.OXYLABS_USER;
  const pass = process.env.OXYLABS_PASS;
  if (!user || !pass) throw new Error("Missing OXYLABS_USER / PASS");

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

  const json = await res.json();
  const content = json?.results?.[0]?.content;
  if (!content) throw new Error("Empty WSA response");
  return content;
}

export async function saveJSON(path, data) {
  await fs.mkdir(path.split("/").slice(0, -1).join("/"), { recursive: true });
  await fs.writeFile(path, JSON.stringify(data, null, 2), "utf8");
}
