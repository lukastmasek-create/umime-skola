// Opakování: dvě kruhové šipky kolem papíru s odškrtnutými řádky a lupou paměti (zelená fajfka).
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  const arrow = (d, h, col) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${A.lin([[0, col[0]], [1, col[1]]])}" stroke-width="7.4" stroke-linecap="round"/><path d="${h}" fill="${A.g(col[0], 0.2, 0.3)}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
  A.add(arrow("M22 60Q22 22 62 20Q84 20 98 34", "M96 20L110 40L88 40Z", ["#ffb02e", "#e8861a"]));
  A.add(arrow("M106 66Q106 104 66 108Q44 108 30 94", "M32 108L18 88L40 88Z", ["#4fa3ff", "#2a5fc2"]));
  A.add(rc(40, 34, 48, 62, 6, A.g("#fffaf0", 0.2, 0.22), 3));
  for (let i = 0; i < 3; i++) { A.add(`<path d="M56 ${50 + i * 14}H80" stroke="#9aa6c8" stroke-width="2.8" stroke-linecap="round"/>`); A.add(`<path d="M46 ${50 + i * 14}l3 3 5-6" fill="none" stroke="#2fae6d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`); }
  A.add(c(88, 90, 14, A.gr("#35c47c", 0.3, 0.3), 3)); A.add(`<path d="M81 90l5 5 9-10" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(A.spark(14, 18, 6, "#fff", "#e8861a"));
  return { shadow: [64, 123, 46, 4.5, 0.3], sparkles: true };
}
