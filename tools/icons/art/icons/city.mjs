// Město: skyline s věžáky, okny v rastru, anténami, mostem a zářícím měsícem; různé materiály fasád.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(c(98, 22, 11, A.gr("#fff6c8", 0.35, 0.3, 0.3, 0.1), 2.4)); A.add(c(103, 19, 8, "#fff6c8", 0, 'stroke="none" opacity="0"'));
  const bld = (x, y, w, h, base, win) => {
    A.add(rc(x, y, w, h, 2.4, A.g(base, 0.35, 0.4, [0, 0, 1, 0]), 3));
    for (let r = 0; r < Math.floor((h - 8) / 11); r++) for (let k = 0; k < Math.floor((w - 4) / 8); k++) A.add(`<rect x="${x + 4 + k * 8}" y="${y + 6 + r * 11}" width="4.6" height="6.4" rx="1" fill="${(r + k * 2) % 4 === 0 ? "#fff6a8" : win}" stroke="${INK}" stroke-width=".8" opacity=".95"/>`);
    A.add(ln(`M${x + 3} ${y + 3}H${x + w - 3}`, "#fff", 0.4, 1.4));
  };
  A.add(`<path d="M42 40V28M82 24V12" stroke="${INK}" stroke-width="3"/><circle cx="42" cy="27" r="2.6" fill="#e5484d" stroke="${INK}" stroke-width="1.4"/><circle cx="82" cy="11" r="2.6" fill="#e5484d" stroke="${INK}" stroke-width="1.4"/>`);
  bld(10, 62, 26, 52, "#e5484d", "#ffe3b0"); bld(36, 40, 24, 74, "#6b4de0", "#9fe0ff"); bld(60, 24, 24, 90, "#2a4bd8", "#9fe0ff"); bld(84, 52, 20, 62, "#2fae6d", "#d9ffe0"); bld(104, 70, 16, 44, "#ff9a3c", "#ffe3b0");
  A.add(rc(6, 112, 118, 8, 3, A.g("#8a95bb"), 2.8)); A.add(`<path d="M14 116H114" stroke="#fff6a8" stroke-width="1.4" stroke-dasharray="5 4"/>`);
  A.add(A.spark(18, 36, 5.5, "#fff", "#6b4de0"));
  return { shadow: [64, 124, 56, 4.5, 0.3], sparkles: true };
}
