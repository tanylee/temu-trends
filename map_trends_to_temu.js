import fs from 'fs';
import slugify from 'slugify';

// Заглушка Temu: вместо реального парсинга делаем синтез карточек по ключам.
// Хуки для настоящего парсинга отмечены TODO.
const trends = JSON.parse(fs.readFileSync('data/trends.json','utf8'));

function fakeTemuCard(kw) {
  const gid = Math.floor(Math.random()*1e10).toString();
  return {
    id:`goods_${gid}`,
    title:`${kw} — aesthetic pick`,
    price: (9 + Math.random()*30).toFixed(2),
    image:`https://picsum.photos/seed/${encodeURIComponent(kw)}/600/600`,
    aff_url:`https://temu.com/goods.html?goods_id=${gid}&utm_source=pinterest`,
    categories:[slugify(kw, { lower:true })],
    countries:["US","CA","UK","DE","FR"],
    keywords:[kw],
    score: Math.random()*0.5 + 0.5
  };
}

const products = [];
for (const t of trends) {
  const kws = (t.keywords||t.hashtags||[]).slice(0,2);
  for (const kw of kws) products.push(fakeTemuCard(kw));
}
fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));
console.log(`products.json saved (${products.length})`);
