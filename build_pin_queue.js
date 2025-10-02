import fs from 'fs';
import dayjs from 'dayjs';
import locales from '../config/locales.json' assert { type:'json' };
import windows from '../config/schedule_windows.json' assert { type:'json' };
import boards from '../config/boards.json' assert { type:'json' };
import { makeTitle, makeDesc, makeAlt } from './utils/textgen.js';

const target = Number((process.argv.find(x=>x.startsWith('--target='))||'').split('=')[1]||500);
const products = JSON.parse(fs.readFileSync('data/products.json','utf8'));

function pick(arr,n){ const out=[]; for(let i=0;i<n;i++) out.push(arr[(i)%arr.length]); return out; }

const queue = [];
for (const [cc, meta] of Object.entries(locales)) {
  const n = Math.round(target * (meta.daily_share/100));
  const prods = pick(products, n);
  const [m1,m2] = windows[cc].morning.map(x=>Number(x.split(':')[0]));
  const [l1,l2] = windows[cc].lunch.map(x=>Number(x.split(':')[0]));
  const [e1,e2] = windows[cc].evening.map(x=>Number(x.split(':')[0]));
  const hours = [...Array(n)].map((_,i)=>{
    if (i%3===0) return m1 + Math.floor(Math.random()*(m2-m1||1));
    if (i%3===1) return l1 + Math.floor(Math.random()*(l2-l1||1));
    return e1 + Math.floor(Math.random()*(e2-e1||1));
  });
  for (let i=0;i<n;i++){
    const p = prods[i];
    const board = boards[p.categories?.[0]] || 'Moodette Picks';
    const when = dayjs().hour(hours[i]).minute(Math.floor(Math.random()*59)).second(0).toISOString();
    queue.push({
      when, country: cc, board,
      image: p.image,
      title: makeTitle(p.title),
      description: makeDesc(),
      link: p.aff_url,
      tags: p.keywords?.slice(0,5)||[]
    });
  }
}
fs.writeFileSync('data/pin_queue.json', JSON.stringify(queue, null, 2));
console.log(`pin_queue.json generated (${queue.length})`);
