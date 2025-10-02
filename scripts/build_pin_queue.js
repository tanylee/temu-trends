import fs from 'fs';
import locales from '../config/locales.json' assert { type:'json' };
import windows from '../config/schedule_windows.json' assert { type:'json' };
import boards from '../config/boards.json' assert { type:'json' };
import { makeTitle, makeDesc } from './utils/textgen.js';
import { genSlots } from './utils/timezones.js';

const target = Number((process.argv.find(x=>x.startsWith('--target='))||'').split('=')[1]||500);
const products = JSON.parse(fs.readFileSync('data/products.json','utf8'));

function pick(arr, n){
  const out = [];
  for (let i=0;i<n;i++) out.push(arr[i % arr.length]);
  return out;
}

const queue = [];
for (const [cc, meta] of Object.entries(locales)) {
  const n = Math.round(target * (meta.daily_share/100));
  const prods = pick(products, n);
  const slots = genSlots({ timezone: meta.timezone, windows: windows[cc], count: n });
  for (let i=0;i<n;i++){
    const p = prods[i];
    const board = boards[p.categories?.[0]] || 'Moodette Picks';
    queue.push({
      when: slots[i],
      country: cc,
      board,
      image: p.image,
      title: makeTitle(p.title),
      description: makeDesc(),
      link: p.aff_url,
      tags: (p.keywords||[]).slice(0,5)
    });
  }
}
fs.writeFileSync('data/pin_queue.json', JSON.stringify(queue,null,2));
console.log(`pin_queue.json generated (${queue.length})`);
