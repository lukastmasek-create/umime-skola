// Bingo: karta s mřížkou čísel a razítky, tombolový míček s číslem a zlatým proužkem.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(12, 14, 76, 94, 8, A.g("#fff9e8", 0.2, 0.22, [0, 0, 1, 1]), 3.2));
  A.add(rc(18, 20, 64, 16, 4, A.g("#e5484d", 0.4, 0.4), 2.4));
  "BINGO".split("").forEach((ch, i) => A.add(`<text x="${27 + i * 12}" y="33" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="12" fill="#fff">${ch}</text>`));
  const nums = [[7, 21, 38, 52, 67], [12, 28, 41, 55, 70]];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) {
    const x = 18 + k * 12.8, y = 42 + r * 19, hit = (r + k) % 3 === 0 && !(r === 1 && k === 2);
    A.add(rc(x, y, 11.4, 16.4, 2.4, hit ? A.g("#ffd24d", 0.5, 0.3) : "#fff", 1.8));
    if (r === 1 && k === 2) { A.add(`<path d="M${x + 5.7} ${y + 3}l2.4 4.8 5.2.8-3.8 3.6.9 5.2-4.7-2.5-4.7 2.5.9-5.2-3.8-3.6 5.2-.8Z" transform="translate(-0.2 -0.4) scale(.8) translate(1.4 1.2)" fill="#ffd24d" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`); continue; }
    A.add(`<text x="${x + 5.7}" y="${y + 11.6}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="8.4" fill="#2a3166">${[3, 17, 34, 52, 68, 9, 22, 0, 49, 61, 14, 30, 44, 57, 75][r * 5 + k]}</text>`);
    if (hit) A.add(c(x + 5.7, y + 8.2, 6.2, "none", 1.6, 'stroke="#e5484d"'));
  }
  A.add(c(96, 82, 22, A.gr("#e5484d", 0.3, 0.25, 0.55, 0.45), 3.2));
  A.add(`<path d="M76 76Q96 70 116 76" fill="none" stroke="#fff6d6" stroke-width="4"/>`);
  A.add(c(96, 82, 11, A.g("#fff9e8", 0.1, 0.12), 2)); A.add(`<text x="96" y="88" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="15" fill="#2a3166">23</text>`);
  A.add(ln("M84 68Q90 62 100 62", "#fff", 0.8, 2.6));
  A.add(A.spark(112, 30, 6, "#fff", "#e5484d"));
  return { shadow: [64, 122, 50, 4.5, 0.3], sparkles: true };
}
