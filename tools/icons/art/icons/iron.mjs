// Železo: šestihranný šroub se závitem, hlavou s plastickými hranami a kovovým leskem, matice vedle.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M44 58H84V106Q84 116 64 116Q44 116 44 106Z", A.lin([[0, "#e8ecf6"], [0.5, "#a3acc4"], [1, "#6a7494"]], [0, 0, 1, 0]), 3.2));
  for (let y = 66; y < 114; y += 8) A.add(`<path d="M44 ${y}L84 ${y + 6}" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/><path d="M44 ${y + 2.6}L84 ${y + 8.6}" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>`);
  A.add(`<path d="M52 60V108" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`);
  A.add(o("M30 34L44 14H84L98 34L84 56H44Z", A.lin([[0, "#d8def2"], [1, "#7a86a8"]], [0, 0, 1, 1]), 3.4));
  A.add(`<path d="M44 14L50 24H78L84 14M30 34L50 24M98 34L78 24M50 24L44 56M78 24L84 56M50 24V44H78V24" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"/><path d="M44 14H84L78 24H50Z" fill="#fff" fill-opacity=".55"/><path d="M30 34L44 14L50 24L44 56Z" fill="#fff" fill-opacity=".22"/><path d="M98 34L84 56L78 44V24Z" fill="#1f234c" fill-opacity=".18"/>`);
  A.add(`<ellipse cx="64" cy="35" rx="10" ry="8" fill="${A.lin([[0, "#6a7494"], [1, "#e8ecf6"]])}" stroke="${INK}" stroke-width="2"/>`);
  A.add(`<path d="M104 78L116 70L126 80V96L116 104L104 96Z" transform="translate(-6 0) scale(.9) translate(8 4)" fill="${A.lin([[0, "#e8ecf6"], [1, "#7a86a8"]])}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity="0"/>`);
  A.add(ln("M36 34L48 18", "#fff", 0.9, 2.4));
  A.add(A.spark(14, 40, 6, "#fff", "#7a86a8")); A.add(A.spark(112, 82, 5.5, "#fff", "#7a86a8"));
  return { shadow: [64, 123, 36, 4.5, 0.3], sparkles: true };
}
