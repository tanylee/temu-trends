import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
dayjs.extend(utc); dayjs.extend(tz);

export function genSlots({ timezone, windows, count }) {
  const blocks = ['morning','lunch','evening'];
  const out = [];
  for (let i=0;i<count;i++) {
    const b = blocks[i % blocks.length];
    const [s,e] = windows[b];
    const [sh,sm]=s.split(':').map(Number);
    const [eh,em]=e.split(':').map(Number);
    const start = sh*60+sm, end=eh*60+em, span=Math.max(1,end-start);
    const m = start + Math.floor(Math.random()*span);
    out.push(
      dayjs().tz(timezone).hour(0).minute(0).second(0).add(m,'minute').toISOString()
    );
  }
  return out.sort();
}
