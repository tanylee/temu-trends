import fs from 'fs';
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
const a = fs.existsSync('data/trends_raw_3m.json')?load('data/trends_raw_3m.json'):[];
const b = fs.existsSync('data/trends_raw_seasonal.json')?load('data/trends_raw_seasonal.json'):[];
const score = e => {
  const { likes=0, comments=0, shares=0 } = e.engagement||{};
  return Math.min(1, likes*1e-5 + comments*1e-4 + shares*2e-4);
};
fs.writeFileSync('data/trends_scored_3m.json', JSON.stringify(a.map(x=>({...x, score:score(x)})),null,2));
fs.writeFileSync('data/trends_scored_seasonal.json', JSON.stringify(b.map(x=>({...x, score:score(x)})),null,2));
console.log('scored trends.');
