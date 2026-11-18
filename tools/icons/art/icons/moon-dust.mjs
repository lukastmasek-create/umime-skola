// Měsíční prach: hromádka šedého regolitu s krátery a stopou, měsíc a hvězdy nad ní, malý kamínek.
import { INK, o, c, el, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(c(64, 22, 14, A.gr("#fff6c8", 0.35, 0.3, 0.3, 0.2), 2.8)); A.add(dots([[60, 18], [70, 26], [68, 16]], 2, "#d9d2a8", 0.8));
  A.add(o("M8 112Q20 70 64 62Q108 70 120 112Z", A.lin([[0, "#c4cad8"], [1, "#6f7894"]]), 3.4));
  for (const [x, y, rx, ry] of [[40, 90, 12, 4.4], [84, 84, 9, 3.4], [66, 100, 7, 2.8], [100, 102, 8, 3]]) { A.add(el(x, y, rx, ry, A.g("#5a6280", 0.1, 0.3), 1.8)); A.add(ln(`M${x - rx + 2} ${y - 1}Q${x} ${y - ry - 1} ${x + rx - 2} ${y - 1}`, "#fff", 0.45, 1.2)); }
  A.add(face(64, 78, 0.9, "#e08aa0"));
  A.add(`<path d="M22 108Q30 102 38 108M86 110Q94 104 104 110" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>`);
  A.add(dots([[30, 100], [50, 106], [76, 108], [96, 96], [110, 108]], 1.4, "#fff", 0.55));
  A.add(`<g transform="translate(96 60)"><path d="M0 8L4 0L12 2L14 10Z" fill="${A.g("#a3aac0")}" stroke="${INK}" stroke-width="2"/></g>`);
  A.add(A.spark(18, 36, 6, "#fff", "#6f7894")); A.add(A.spark(110, 28, 5, "#fff", "#6f7894"));
  return { shadow: [64, 123, 54, 4.5, 0.3], sparkles: true };
}
