import fs from 'fs';
import fetch from 'node-fetch';

const products = JSON.parse(fs.readFileSync('data/products.json','utf8'));
const ok = [];
for (const p of products) {
  try {
    const r = await fetch(p.image, { method:'HEAD' });
    if (r.ok) ok.push(p);
  } catch {}
}
fs.writeFileSync('data/products.json', JSON.stringify(ok,null,2));
console.log(`validated products: ${ok.length}`);
