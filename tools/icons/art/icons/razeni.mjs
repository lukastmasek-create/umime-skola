// Řazení: sloupce různé výšky seřazené 1–4 jako schody s medailemi, zvýrazněný vítěz a šipka.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  const bars = [[12, 26, "#4fa3ff", "1"], [40, 42, "#35c47c", "2"], [68, 58, "#ffb02e", "3"], [96, 74, "#e5484d", "4"]];
  A.add(rc(6, 108, 116, 10, 3, A.g("#8a95bb"), 2.8));
  bars.forEach(([x, h, col, t], i) => { A.add(rc(x, 108 - h, 22, h, 5, A.g(col, 0.5, 0.42, [0, 0, 1, 0]), 3)); A.add(ln(`M${x + 5} ${108 - h + 6}V${100}`, "#fff", 0.5, 2.4)); A.add(c(x + 11, 108 - h - 2, 9.4, A.gr(i === 3 ? "#ffd24d" : "#fff", 0.3, 0.3, 0.5, 0.2), 2.4)); A.add(`<text x="${x + 11}" y="${108 - h + 1.4}" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="11" fill="${i === 3 ? "#7a4a08" : "#2a3166"}">${t}</text>`); });
  A.add(`<path d="M18 44L100 22" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="2 6" opacity=".55"/>`);
  A.add(o("M104 6L118 22L98 24Z", A.g("#ffd24d"), 2.4));
  A.add(A.spark(12, 22, 6, "#fff", "#4a8cff"));
  return { shadow: [64, 123, 56, 4.5, 0.3], sparkles: true };
}
