import fs from 'fs';
import slugify from 'slugify';

const trends = JSON.parse(fs.readFileSync('data/trends.json','utf8'));

// Заглушка Temu: синтез карточек по ключам (позже можно заменить реальным парсером).
function synthCard(kw) {
  const gid = Math.floor(1e9 + Math.random()*1e9);
  return {
    goods_id: String(gid),
    title: `${kw} — aesthetic pick`,
    price: (9 + Math.random()*30).toFixed(2),
    image: `https://picsum.photos/seed/${encodeURIComponent(kw)}/800/800`,
    aff_url: `https://temu.com/goods.html?goods_id=${gid}&utm_source=pinterest&utm_medium=pin&utm_campaign=moodette`,
    categories: [slugify(kw, { lower:true })],
    keywords: [kw],
    countries: ["US","CA","UK","DE","FR"],
    score: Math.random()*0.5 + 0.5
  };
}

const products = [];
for (const t of trends) {
  for (const kw of (t.keywords||t.hashtags||[]).slice(0,2)) {
    products.push(synthCard(kw));
  }
}
fs.writeFileSync('data/products.json', JSON.stringify(products,null,2));
console.log(`products.json saved (${products.length})`);
