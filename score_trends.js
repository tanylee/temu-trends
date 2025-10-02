import fs from 'fs';
function score(e){ // простой скоринг
  const {likes=0,comments=0,shares=0} = e.engagement||{};
  return Math.min(1, (likes*0.00001 + comments*0.0001 + shares*0.0002));
}
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
(async()=>{
  const a = fs.existsSync('data/trends_raw_3m.json')?load('data/trends_raw_3m.json'):[];
  const b = fs.existsSync('data/trends_raw_seasonal.json')?load('data/trends_raw_seasonal.json'):[];
  const normalize = x=>({...x, score:score(x)});
  fs.writeFileSync('data/trends_scored_3m.json', JSON.stringify(a.map(normalize),null,2));
  fs.writeFileSync('data/trends_scored_seasonal.json', JSON.stringify(b.map(normalize),null,2));
  console.log('scored.');
})();
