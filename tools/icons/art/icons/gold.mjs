// Zlato: pyramida ze tří zlatých slitků s razítkem a vroubkem, nugety kolem a odlesky.
import { INK, o, c, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  const bar = (x, y, w, s = 1) => { A.add(o(`M${x} ${y + 22}L${x + 8} ${y}H${x + w - 8}L${x + w} ${y + 22}Z`, A.lin([[0, "#fff0a0"], [0.5, "#ffc82e"], [1, "#c98a0a"]]), 3.2)); A.add(o(`M${x + 8} ${y}H${x + w - 8}L${x + w - 14} ${y + 8}H${x + 14}Z`, A.g("#fff6c0", 0.2, 0.2), 1.8)); A.add(`<path d="M${x + 18} ${y + 13}H${x + w - 18}" stroke="#a5620c" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>`); A.add(ln(`M${x + 14} ${y + 5}H${x + w - 20}`, "#fff", 0.8, 1.6)); const S = starPts(x + w / 2, y + 14.4, 3.6, 1.5); A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="#a5620c" fill-opacity=".7"/>`); };
  bar(12, 90, 52); bar(64, 90, 52); bar(38, 66, 52); 
  A.add(o("M44 64L52 44H76L84 64Z", A.lin([[0, "#fff0a0"], [0.5, "#ffc82e"], [1, "#c98a0a"]]), 3.2)); A.add(`<path d="M52 44H76L72 52H56Z" fill="#fff6c0"/>`);
  A.add(o("M52 44L56 28Q64 24 72 28L76 44Z", A.lin([[0, "#fff0a0"], [0.5, "#ffc82e"], [1, "#c98a0a"]]), 3)); A.add(`<path d="M58 34Q64 31 70 34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`);
  for (const [x, y, r] of [[18, 112, 6], [108, 112, 7]]) { A.add(o(`M${x - r} ${y}Q${x - r} ${y - r} ${x} ${y - r - 2}Q${x + r} ${y - r} ${x + r} ${y}Q${x} ${y + 3} ${x - r} ${y}Z`, A.gr("#ffc82e", 0.3, 0.3), 2.4)); A.add(ln(`M${x - 3} ${y - 4}Q${x} ${y - 6} ${x + 2} ${y - 5}`, "#fff", 0.9, 1.4)); }
  A.add(A.spark(110, 40, 7, "#fff", "#e8a21f")); A.add(A.spark(18, 50, 5.5, "#fff", "#e8a21f"));
  return { shadow: [64, 122, 54, 4.5, 0.3], sparkles: true };
}
