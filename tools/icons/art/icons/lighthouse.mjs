// Maják: pruhovaná věž se skleněnou lucernou, galerií s zábradlím, světelnými paprsky a skálou s vlnami.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M64 26L4 4V48Z" fill="#fff6a8" fill-opacity=".55"/><path d="M64 26L124 4V48Z" fill="#fff6a8" fill-opacity=".55"/>`);
  A.add(o("M6 118Q20 96 50 98L64 90L84 98Q110 98 124 118Z", A.g("#8a95bb", 0.35, 0.5), 3.2)); A.add(`<path d="M30 112Q40 104 54 108M80 108Q96 102 108 110" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`);
  const clip = A.clip(`<path d="M46 100L52 36H76L82 100Z"/>`);
  A.add(`<g clip-path="${clip}"><rect x="40" y="30" width="48" height="74" fill="${A.lin([[0, "#fff"], [1, "#d8def2"]], [0, 0, 1, 0])}"/>` + [46, 68, 90].map((y) => `<rect x="40" y="${y - 14}" width="48" height="14" fill="#e5484d"/>`).join("") + `<rect x="40" y="30" width="48" height="74" fill="url(#${A.lin([[0, "#000", 0], [0.6, "#000", 0], [1, "#000", 0.28]], [0, 0, 1, 0]).slice(5, -1)})"/></g>`);
  A.add(`<path d="M46 100L52 36H76L82 100Z" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`);
  A.add(o("M58 100V88Q58 82 64 82Q70 82 70 88V100Z", A.g("#8a5a2b"), 2.2)); A.add(rc(60, 56, 8, 10, 3, A.lin([[0, "#fff6a8"], [1, "#ffb02e"]]), 1.8));
  A.add(rc(44, 30, 40, 7, 2, A.g("#6b7390"), 2.6)); A.add(`<path d="M46 30V24M54 30V24M62 30V24M70 30V24M78 30V24M46 24H82" stroke="${INK}" stroke-width="1.6"/>`);
  A.add(rc(52, 10, 24, 16, 3, A.lin([[0, "#fffbe0"], [1, "#ffe27a"]]), 2.6)); A.add(`<path d="M58 10V26M64 10V26M70 10V26" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2"/>`); A.add(c(64, 18, 4, "#fff", 0, 'stroke="none"'));
  A.add(o("M50 10L64 -2L78 10Z", A.g("#e5484d", 0.4, 0.4), 2.8)); A.add(c(64, -3, 2.4, A.g("#ffd24d"), 1.6));
  A.add(ln("M56 40L58 94", "#fff", 0.5, 2.4));
  A.add(A.spark(14, 70, 5.5, "#fff", "#e5484d"));
  return { shadow: [64, 123, 54, 4.5, 0.3], sparkles: true };
}
