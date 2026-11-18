// Přijímačky: zkušební arch s odpověďmi, stopky s odpočtem a razítko „přijat“.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="64" r="58" fill="#ff9a3c" fill-opacity=".14"/><ellipse cx="64" cy="114" rx="46" ry="6" fill="#1b1a3a" fill-opacity=".2"/>`);
  A.add(rc(18, 14, 70, 96, 8, A.g("#fffaf0", 0.2, 0.2), 3));
  A.add(`<path d="M28 30H78M28 40H68" stroke="#9aa6c8" stroke-width="3" stroke-linecap="round"/>`);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) A.add(c(32 + k * 14, 58 + r * 13, 4.6, (r === 0 && k === 1) || (r === 1 && k === 3) || (r === 2 && k === 0) || (r === 3 && k === 2) ? A.g("#4a63d8", 0.3, 0.3) : "#fff", 1.6));
  A.add(`<g transform="translate(84 80)"><rect x="-5" y="-30" width="10" height="7" rx="2" fill="${A.g("#c9d0e8")}" stroke="${INK}" stroke-width="2.2"/><circle cx="0" cy="0" r="24" fill="${A.gr("#fff", 0.3, 0.25, 0.1, 0.2)}" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="0" r="19" fill="none" stroke="#9aa6c8" stroke-width="1.4"/><path d="M0 -17V-13M17 0H13M0 17V13M-17 0H-13" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M0 0V-12" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><path d="M0 0L9 5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle r="2.6" fill="#e5484d" stroke="${INK}" stroke-width="1.4"/><path d="M0 0V-19A19 19 0 0 1 16 9Z" fill="#e5484d" fill-opacity=".2"/><path d="M-14 -14Q-10 -18 -4 -19" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`);
  A.add(`<g transform="translate(34 92) rotate(-14)"><circle r="14" fill="${A.gr("#2fb06a", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.6"/><path d="M-6 0L-1.6 5L7 -5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  return { still: true };
}
