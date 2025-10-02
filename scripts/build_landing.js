import fs from 'fs';
const products = fs.existsSync('data/products.json')
  ? JSON.parse(fs.readFileSync('data/products.json','utf8')) : [];

function card(p){
  return `
  <article class="card">
    <img src="${p.image}" alt="Aesthetic ${p.title}" loading="lazy" width="600" height="600"/>
    <h3>${p.title}</h3>
    <p>$${p.price}</p>
    <a class="temu" href="${p.aff_url}" data-pla="Outbound Click">Get it on TEMU</a>
  </article>`;
}
const grid = products.slice(0,60).map(card).join('\n');

let html = fs.readFileSync('public/index.html','utf8');
html = html.replace('<!--__GRID__-->', grid);
fs.writeFileSync('public/index.html', html);
console.log('landing built.');
