// Rámeček: vyřezávaný zlatý rám s rohovými ornamenty, vnitřní lištou a malbou hor a slunce.
import { INK, o, c, rc, ln, dots, arc } from "../kit.mjs";
export default function (A) {
  A.add(rc(14, 20, 100, 92, 8, A.lin([[0, "#ffe27a"], [0.5, "#e0a21f"], [1, "#9a5f0a"]]), 3.2));
  A.add(rc(20, 26, 88, 80, 5, A.lin([[0, "#9a5f0a"], [1, "#ffd24d"]]), 1.8));
  A.add(`<defs/>`);
  const clip = A.clip(`<rect x="27" y="33" width="74" height="66" rx="2"/>`);
  A.add(`<g clip-path="${clip}"><rect x="27" y="33" width="74" height="66" fill="${A.lin([[0, "#7bd0ff"], [0.7, "#ffe9b0"], [1, "#ffc58a"]])}"/>` +
    `<circle cx="82" cy="52" r="9" fill="#fff6c8"/><circle cx="82" cy="52" r="13" fill="#fff6c8" opacity=".35"/>` +
    `<path d="M27 86L48 56L62 76L76 62L101 90V99H27Z" fill="${A.g("#5b6fd8", 0.3, 0.4)}"/><path d="M48 56L54 64L50 66L46 62Z" fill="#fff" opacity=".85"/>` +
    `<path d="M27 92Q50 80 70 90T101 88V99H27Z" fill="${A.g("#3fbf78", 0.3, 0.45)}"/><path d="M27 33H101V99H27Z" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/></g>`);
  A.add(`<rect x="27" y="33" width="74" height="66" rx="2" fill="none" stroke="${INK}" stroke-width="2.2"/>`);
  for (const [x, y] of [[22, 28], [106, 28], [22, 104], [106, 104]]) { A.add(c(x, y, 6.6, A.gr("#ffd24d", 0.3, 0.3), 2.2)); A.add(c(x, y, 2.4, "#e5484d", 1.2)); A.add(ln(`M${x - 4} ${y - 3}Q${x - 2} ${y - 5} ${x} ${y - 5}`, "#fff", 0.8, 1)); }
  A.add(dots([[64, 22], [64, 110], [16, 66], [112, 66]], 1.8, "#fff3b0"));
  A.add(ln("M30 24H98M16 40V94", "#fff", 0.6, 1.6));
  return { shadow: [64, 122, 44, 4.5, 0.3], sparkles: false };
}
