import fs from 'fs';
import { dedupeBy } from './utils/dedupe.js';
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
const a = fs.existsSync('data/trends_scored_3m.json')?load('data/trends_scored_3m.json'):[];
const b = fs.existsSync('data/trends_scored_seasonal.json')?load('data/trends_scored_seasonal.json'):[];
const merged = dedupeBy(
  [...a.map(x=>({...x, window:'3m'})), ...b.map(x=>({...x, window:'seasonal'}))],
  x=>x.id
);
fs.writeFileSync('data/trends.json', JSON.stringify(merged,null,2));
console.log(`merged -> data/trends.json (${merged.length})`);
