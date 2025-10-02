import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
dayjs.extend(utc); dayjs.extend(tz);

export function slotTimesForDay({ timezone, windows, count }) {
  // равномерно распределяем по окнам
  const blocks = Object.values(windows);
  const perBlock = Math.max(1, Math.floor(count / blocks.length));
  const out = [];
  for (const [start,end] of blocks.map(w=>[w[0],w[1]])) {
    for (let i=0;i<perBlock;i++){
      const [sh,sm]=start.split(':').map(Number);
      const [eh,em]=end.split(':').map(Number);
      const t = dayjs().tz(timezone).hour(sh).minute(sm)
        .add(Math.floor(((eh*60+em)-(sh*60+sm))*(i+1)/(perBlock+1)), 'minute');
      out.push(t);
    }
  }
  return out.sort((a,b)=>a.valueOf()-b.valueOf());
}
