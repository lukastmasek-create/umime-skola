// Obří kolo: ocelová A-konstrukce, kolo s paprsky a čtyřmi barevnými gondolami, osa, světla po obvodu.
import { INK, o, c, rc, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M30 118L64 58L98 118" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 118L64 58L98 118" fill="none" stroke="${A.lin([[0, "#d8def2"], [1, "#8a95bb"]], [0, 0, 1, 0])}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(`<path d="M44 92H84" stroke="${INK}" stroke-width="3.4"/>`);
  const cx = 64, cy = 56, R = 44;
  A.add(c(cx, cy, R, "none", 7.6, 'stroke="#1f234c"')); A.add(c(cx, cy, R, "none", 4, 'stroke="#ffd0d8"')); A.add(c(cx, cy, R - 10, "none", 3, `stroke="#1f234c"`)); A.add(c(cx, cy, R - 10, "none", 1.4, 'stroke="#fff"'));
  for (let i = 0; i < 8; i++) { const [x, y] = polar(cx, cy, R, i * 45); A.add(`<path d="M${cx} ${cy}L${x} ${y}" stroke="${INK}" stroke-width="4.4"/><path d="M${cx} ${cy}L${x} ${y}" stroke="#e8ecff" stroke-width="2"/>`); }
  const cols = ["#e5484d", "#ffd24d", "#35c47c", "#4a8cff", "#b36bff", "#ff9a3c", "#e5484d", "#4fd0ff"];
  for (let i = 0; i < 8; i++) { const [x, y] = polar(cx, cy, R, i * 45 + 22.5); A.add(`<path d="M${x} ${y}V${y + 5}" stroke="${INK}" stroke-width="1.6"/>`); A.add(o(`M${x - 7} ${y + 5}H${x + 7}L${x + 5} ${y + 14}Q${x} ${y + 16} ${x - 5} ${y + 14}Z`, A.g(cols[i], 0.5, 0.4), 2.2)); A.add(`<path d="M${x - 5} ${y + 8}H${x + 5}" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>`); }
  for (let i = 0; i < 16; i++) { const [x, y] = polar(cx, cy, R, i * 22.5); A.add(`<circle cx="${x}" cy="${y}" r="1.7" fill="#fff6a8"/>`); }
  A.add(c(cx, cy, 8, A.gr("#ffd24d", 0.3, 0.3), 3)); A.add(c(cx, cy, 2.6, "#e5484d", 1.2));
  A.add(rc(18, 116, 92, 7, 3, A.g("#8a95bb"), 2.6));
  A.add(A.spark(14, 18, 6, "#fff", "#e5484d")); A.add(A.spark(114, 12, 5, "#fff", "#e5484d"));
  return { shadow: [64, 124, 52, 4.5, 0.3], sparkles: true };
}
