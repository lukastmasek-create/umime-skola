// Společně: tři postavy v různých barvách s tvářemi a rukama v objetí, srdce nad nimi.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  const person = (x, y, s, body, hair, skin) => { A.add(o(`M${x - 22 * s} ${y + 40 * s}Q${x - 22 * s} ${y + 6 * s} ${x} ${y + 6 * s}Q${x + 22 * s} ${y + 6 * s} ${x + 22 * s} ${y + 40 * s}Z`, A.g(body, 0.45, 0.4, [0, 0, 1, 0]), 3)); A.add(c(x, y - 8 * s, 15 * s, A.gr(skin, 0.35, 0.3, 0.3, 0.2), 3)); A.add(`<path d="M${x - 15 * s} ${y - 10 * s}Q${x - 14 * s} ${y - 26 * s} ${x} ${y - 24 * s}Q${x + 14 * s} ${y - 26 * s} ${x + 15 * s} ${y - 10 * s}Q${x + 6 * s} ${y - 18 * s} ${x - 15 * s} ${y - 10 * s}Z" fill="${hair}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`); A.add(dots([[x - 5 * s, y - 8 * s], [x + 5 * s, y - 8 * s]], 1.8 * s, INK)); A.add(`<path d="M${x - 4 * s} ${y - 1 * s}Q${x} ${y + 3 * s} ${x + 4 * s} ${y - 1 * s}" fill="none" stroke="#c43e3e" stroke-width="2" stroke-linecap="round"/>`); A.add(dots([[x - 9 * s, y - 2 * s], [x + 9 * s, y - 2 * s]], 2.4 * s, "#ff7a9a", 0.6)); };
  person(30, 56, 0.86, "#e5484d", "#6b3f1d", "#ffd9b8"); person(98, 56, 0.86, "#2fae6d", "#1f234c", "#c98a62"); person(64, 48, 1, "#ffd24d", "#e8a21f", "#ffe3c4");
  A.add(`<path d="M52 96Q64 106 76 96M18 98Q30 104 44 98M84 98Q98 104 110 98" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity="0"/>`);
  A.add(o("M64 14C58 6 46 10 50 20C52 26 60 30 64 34C68 30 76 26 78 20C82 10 70 6 64 14Z", A.gr("#ff5a78", 0.3, 0.3), 2.6, 'transform="translate(0 -6) scale(.9) translate(7 2)"'));
  A.add(A.spark(14, 24, 5.5, "#fff", "#e5484d"));
  return { shadow: [64, 116, 50, 4.5, 0.3], sparkles: true };
}
