const CTAS = [
  "Cozy must-have ✨","Minimal & chic","Pastel vibe 💗",
  "Viral find","Cute & practical","Aesthetic pick"
];
export function makeTitle(base) {
  const cta = CTAS[Math.floor(Math.random()*CTAS.length)];
  return `${base} — ${cta}`;
}
export function makeDesc(base="Aesthetic room refresh.") { return base; }
export function makeAlt(base="Aesthetic product photo") { return base; }
