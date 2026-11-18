// Ocel: ozubené kolo s 12 zuby, kruhovým nákružkem, osou s drážkou na pero a čtyřmi šrouby, kartáčovaný povrch.
import { INK, o, c, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  const cx = 64, cy = 62;
  let d = "";
  for (let i = 0; i < 12; i++) { const a = i * 30; const p = [polar(cx, cy, 40, a - 9), polar(cx, cy, 52, a - 6), polar(cx, cy, 52, a + 6), polar(cx, cy, 40, a + 9)]; d += `${i ? "L" : "M"}${p[0]}L${p[1]}L${p[2]}L${p[3]}`; }
  A.add(o(d + "Z", A.gr("#c9d0e8", 0.3, 0.25, 0.55, 0.45), 3.4));
  A.add(c(cx, cy, 38, A.gr("#e8ecf6", 0.3, 0.25, 0.4, 0.35), 2.4));
  A.add(c(cx, cy, 30, "none", 1.6, 'stroke="#1f234c" stroke-opacity=".5"')); A.add(c(cx, cy, 30.8, "none", 1, 'stroke="#fff" stroke-opacity=".6" transform="translate(.6 .8)"'));
  for (let i = 0; i < 4; i++) { const [x, y] = polar(cx, cy, 22, i * 90 + 45); A.add(c(x, y, 4.2, A.gr("#9aa6c8", 0.3, 0.3), 1.8)); A.add(`<path d="M${x - 2.4} ${y}H${x + 2.4}" stroke="${INK}" stroke-width="1.2"/>`); }
  A.add(c(cx, cy, 12, "#3a4274", 3)); A.add(c(cx, cy, 9, A.gr("#6a7494", 0.3, 0.3), 0)); A.add(`<rect x="${cx - 2.4}" y="${cy - 12}" width="4.8" height="5" fill="${INK}"/>`);
  A.add(`<path d="M30 40Q40 24 60 20" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`);
  for (let i = 0; i < 18; i++) A.add(`<path d="M${30 + (i * 13) % 60} ${34 + (i * 7) % 56}h${6 + i % 5}" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>`);
  A.add(A.spark(110, 22, 6, "#fff", "#6a7494"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
