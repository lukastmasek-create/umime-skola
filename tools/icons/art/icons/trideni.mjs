// Třídění: dva koše s hranami a kovovým lemem (modrý a červený), padající kostky se správnými barvami.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  const bin = (x, col) => { A.add(o(`M${x} 66H${x + 48}L${x + 42} 116Q${x + 41} 120 ${x + 36} 120H${x + 12}Q${x + 7} 120 ${x + 6} 116Z`, A.g(col, 0.45, 0.42, [0, 0, 1, 0]), 3.2)); A.add(rc(x - 3, 60, 54, 10, 4, A.g(col, 0.6, 0.3), 3)); A.add(`<path d="M${x + 12} 74L${x + 15} 114M${x + 24} 74V114M${x + 36} 74L${x + 33} 114" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`); A.add(ln(`M${x + 4} 66H${x + 20}`, "#fff", 0.7, 1.6)); };
  bin(8, "#4a8cff"); bin(72, "#e5484d");
  const cube = (x, y, col, rot) => `<g transform="rotate(${rot} ${x} ${y})">` + rc(x - 9, y - 9, 18, 18, 4, A.g(col, 0.5, 0.4), 2.6) + ln(`M${x - 5} ${y - 4}H${x + 1}`, "#fff", 0.8, 1.8) + `</g>`;
  A.add(cube(32, 26, "#4a8cff", -12) + cube(96, 20, "#e5484d", 14) + cube(64, 40, "#ffd24d", 6));
  A.add(`<path d="M32 40V52M96 36V52" stroke="#1f234c" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round"/>`);
  A.add(`<path d="M30 92l4 4 8-9" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="M92 90l10 10M102 90L92 100" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>`);
  A.add(A.spark(64, 8, 6, "#fff", "#e8a21f"));
  return { shadow: [64, 123, 54, 4.5, 0.3], sparkles: true };
}
