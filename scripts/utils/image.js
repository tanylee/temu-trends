import fetch from "node-fetch";

/**
 * Скачивает изображение и возвращает { base64, contentType }.
 * Бросает ошибку, если статус не 200 или не image/*.
 */
export async function fetchImageAsBase64(url) {
  const resp = await fetch(url, { redirect: "follow" });
  if (!resp.ok) throw new Error(`Image fetch failed ${resp.status}`);
  const ct = resp.headers.get("content-type") || "";
  if (!ct.startsWith("image/")) throw new Error(`Not an image: ${ct}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  return { base64: buf.toString("base64"), contentType: ct };
}
