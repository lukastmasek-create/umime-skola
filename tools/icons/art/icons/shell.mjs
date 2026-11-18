// Mušle: lasturový vějíř s paprsčitými žebry, růstovými liniemi, závěsem a kapkou perleti, tvářička.
import { INK, o, c, ln, dots, face, polar } from "../kit.mjs";
export default function (A) {
  A.add(o("M64 112C20 100 6 64 14 40C26 14 48 12 64 12C80 12 102 14 114 40C122 64 108 100 64 112Z", A.lin([[0, "#ffe3d8"], [0.5, "#ffa49a"], [1, "#e0607a"]], [0, 0, 1, 1]), 3.4));
  const SH = "M64 112C20 100 6 64 14 40C26 14 48 12 64 12C80 12 102 14 114 40C122 64 108 100 64 112Z";
  const clip = A.clip(`<path d="${SH}"/>`);
  A.add(`<g clip-path="${clip}">`);
  for (let i = -6; i <= 6; i++) { const x1 = 64 + i * 3.4, x2 = 64 + i * 8.8; A.add(`<path d="M${x1} 106C${x1 + i * 0.8} 76 ${x2 - i * 1.4} 40 ${x2} 20" fill="none" stroke="#c4405a" stroke-opacity="${i % 2 ? 0.5 : 0.7}" stroke-width="${i % 2 ? 1.2 : 2.2}" stroke-linecap="round"/>`); }
  for (const r of [26, 46, 66]) A.add(`<path d="M${64 - r * 0.8} ${108 - r * 1.0}Q64 ${108 - r * 1.2} ${64 + r * 0.8} ${108 - r * 1.0}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="2 3"/>`);
  A.add("</g>");
  A.add(o("M46 112Q64 102 82 112L78 122H50Z", A.g("#ffd0c0", 0.4, 0.3), 3));
  A.add(`<path d="M20 44Q30 24 54 20" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.4" stroke-linecap="round"/>`);
  A.add(face(64, 82, 0.95, "#ff4a72"));
  A.add(A.spark(110, 22, 6, "#fff", "#e0607a"));
  return { shadow: [64, 122, 46, 4.5, 0.3], sparkles: true };
}
