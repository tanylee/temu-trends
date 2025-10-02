import fs from 'fs';
const seeds = [
  { kw: 'fall decor', season:['fall']},
  { kw: 'back to school', season:['back-to-school']},
  { kw: 'holiday candles', season:['holiday']}
];
const out = seeds.map(s=>({
  id:`seasonal:${s.kw}:${Date.now()}`,
  platform:'mixed',
  hashtags:[s.kw.replace(/\s+/g,'')],
  keywords:[s.kw],
  engagement:{ likes:90000, comments:1500, shares:1000 },
  lang:'en',
  country_signals:['US','CA','UK','DE','FR'],
  season:s.season,
  ts:Math.floor(Date.now()/1000)
}));
fs.writeFileSync('data/trends_raw_seasonal.json', JSON.stringify(out,null,2));
console.log('saved data/trends_raw_seasonal.json');
