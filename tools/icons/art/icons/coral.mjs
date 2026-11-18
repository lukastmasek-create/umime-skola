// Korál: větvený červený korál s polypy a prstencovými strukturami na písčité základně s mušlí.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M12 112Q64 98 116 112L108 120H20Z", A.g("#e8c98a", 0.4, 0.35), 3));
  A.add(dots([[30, 112], [52, 114], [84, 113], [100, 115]], 1.4, "#b8955a", 0.6));
  const br = "M64 112V86M64 86Q54 70 40 58M64 86Q72 66 88 54M40 58Q30 46 36 30M40 58Q50 44 48 28M88 54Q98 44 94 28M88 54Q78 40 80 24M64 86V50Q64 38 60 24";
  A.add(`<path d="${br}" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="${br}" fill="none" stroke="${A.lin([[0, "#ff8a9a"], [0.6, "#e5484d"], [1, "#a5233a"]], [0, 0, 1, 0])}" stroke-width="10.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(`<path d="${br}" fill="none" stroke="#ffc9d0" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2.6 -1)"/>`);
  for (const [x, y] of [[36, 30], [48, 28], [94, 28], [80, 24], [60, 24]]) { A.add(c(x, y, 5, A.gr("#ffd0d8", 0.3, 0.3), 2)); A.add(c(x, y, 1.6, "#a5233a", 0)); }
  A.add(dots([[64, 100], [52, 66], [78, 62], [64, 70], [42, 50], [90, 46]], 1.6, "#ffc9d0", 0.8));
  A.add(`<g transform="translate(96 108)"><path d="M0 0Q-8 -10 0 -14Q8 -10 0 0Z" fill="${A.g("#ffd9b8")}" stroke="${INK}" stroke-width="2"/><path d="M0 0V-13M-3 -2L-5 -10M3 -2L5 -10" stroke="#c98a62" stroke-width="1"/></g>`);
  A.add(A.spark(16, 40, 6, "#fff", "#e5484d"));
  return { shadow: [64, 123, 46, 4.5, 0.3], sparkles: true };
}
