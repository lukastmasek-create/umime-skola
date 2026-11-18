// Ruština: matrjoška s malovaným šátkem, kytkou na zástěře, rumělkami a rozdělenou na půl (spára).
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M64 10C44 10 36 26 38 40C26 52 18 74 24 96C28 112 46 120 64 120C82 120 100 112 104 96C110 74 102 52 90 40C92 26 84 10 64 10Z", A.g("#e5484d", 0.4, 0.45, [0, 0, 1, 0.2]), 3.2));
  A.add(c(64, 56, 20, A.gr("#ffe3c4", 0.35, 0.3, 0.4, 0.2), 2.8));
  A.add(o("M42 48Q42 22 64 22Q86 22 86 48Q80 40 64 40Q48 40 42 48Z", A.g("#ffd24d", 0.45, 0.4), 2.8));
  A.add(`<path d="M46 40Q64 30 82 40" fill="none" stroke="#e5484d" stroke-width="2" stroke-dasharray="1 3.6" stroke-linecap="round"/>`);
  A.add(dots([[56, 56], [72, 56]], 1.8, INK)); A.add(`<path d="M60 66Q64 69 68 66" fill="none" stroke="#c43e3e" stroke-width="2" stroke-linecap="round"/>`);
  A.add(dots([[52, 62], [76, 62]], 3.4, "#ff7a9a", 0.7));
  A.add(`<path d="M24 80Q64 86 104 80" stroke="${INK}" stroke-width="2.6" fill="none"/>`);
  A.add(o("M40 84Q64 90 88 84L92 112Q64 120 36 112Z", A.g("#fff3c8", 0.2, 0.2), 2.4));
  for (const [x, y, rr] of [[64, 100, 7], [50, 104, 4.6], [78, 104, 4.6]]) { for (let i = 0; i < 5; i++) { const a = i * 72 - 90; A.add(`<ellipse cx="${x + Math.cos(a * Math.PI / 180) * rr * .72}" cy="${y + Math.sin(a * Math.PI / 180) * rr * .72}" rx="${rr * .5}" ry="${rr * .5}" fill="#ff5a78" stroke="#7a1d3a" stroke-width="1"/>`); } A.add(c(x, y, rr * .32, "#ffd24d", 1)); }
  A.add(`<path d="M56 92Q50 86 44 90M72 92Q78 86 84 90" stroke="#2fae6d" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
  A.add(ln("M30 84Q28 100 34 108", "#fff", 0.7, 2.4)); A.add(ln("M44 24Q52 18 62 22", "#fff", 0.7, 2));
  A.add(`<path d="M26 74Q64 82 102 74" fill="none" stroke="#ffd24d" stroke-width="2.4"/>`);
  return { shadow: [64, 122, 40, 4.5, 0.3], sparkles: false };
}
