import fs from 'fs';
const seasonalSeeds = [
  {kw:'fall decor', season:['fall']},
  {kw:'back to school', season:['back-to-school']},
  {kw:'holiday candles', season:['holiday']}
];
(async()=>{
  const out = seasonalSeeds.map(s=>({
    id:`seasonal:${s.kw}:${Date.now()}`,
    platform:'mix',
    hashtags:[s.kw.replace(/\s+/g,'')],
    keywords:[s.kw],
    engagement:{likes:80000,comments:1500,shares:900},
    lang:'en',
    country_signals:['US','CA','UK','DE','FR'],
    season:s.season,
    ts:Math.floor(Date.now()/1000)
  }));
  fs.writeFileSync('data/trends_raw_seasonal.json', JSON.stringify(out,null,2));
  console.log('saved trends_raw_seasonal.json');
})();
