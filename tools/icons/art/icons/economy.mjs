// Ekonomika: sloupcový graf s mincemi a stoupající šipkou, sloupce z mincí, štítek $.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(8, 100, 112, 14, 4, A.g("#8a95bb"), 3));
  const col = [[16, 28, "#4ade80"], [44, 46, "#35c47c"], [72, 64, "#2fb06a"]];
  col.forEach(([x, h, base]) => { A.add(rc(x, 100 - h, 24, h, 4, A.g(base, 0.45, 0.4, [0, 0, 1, 0]), 3)); A.add(ln(`M${x + 5} ${100 - h + 5}V${96}`, "#fff", 0.5, 2.4)); for (let k = 0; k < Math.floor(h / 12); k++) A.add(`<path d="M${x + 4} ${96 - k * 12}H${x + 20}" stroke="${INK}" stroke-opacity=".25" stroke-width="1.2"/>`); });
  for (const [x, y, n] of [[104, 96, 3]]) for (let k = 0; k < n; k++) { A.add(el(x, y - k * 6, 12, 5, A.g("#ffd24d", 0.5, 0.4), 2.4)); A.add(`<path d="M${x - 8} ${y - k * 6 - 2}h16" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>`); }
  A.add(c(106, 62, 12, A.gr("#ffd24d", 0.3, 0.3), 2.8)); A.add(`<text x="106" y="68" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="16" fill="#8a5a08">$</text>`);
  A.add(`<path d="M14 62L42 44L62 56L96 18" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 62L42 44L62 56L96 18" fill="none" stroke="${A.lin([[0, "#7bf0b0"], [1, "#e5ff7a"]], [0, 0, 1, 0])}" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(o("M82 14H110V42Z", A.g("#e5ff7a", 0.3, 0.3), 3.2, 'transform="rotate(0)"'));
  A.add(ln("M24 58L42 48", "#fff", 0.8, 1.8));
  A.add(A.spark(20, 20, 6, "#fff", "#2fb06a"));
  return { shadow: [64, 122, 54, 4.5, 0.3], sparkles: true };
}
