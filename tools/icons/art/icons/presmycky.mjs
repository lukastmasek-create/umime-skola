// Přesmyčky: dvě písmenkové kostky A a B spojené kruhovými šipkami; kostky mají hrany, odlesk a tečky.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  const arrow = (d, h) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${A.lin([[0, "#ffb02e"], [1, "#e8861a"]])}" stroke-width="6.6" stroke-linecap="round"/><path d="${h}" fill="${A.g("#ffb02e", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
  A.add(arrow("M20 56Q20 22 56 18H84", "M80 8L98 18L80 28Z"));
  A.add(arrow("M108 70Q108 104 72 108H44", "M48 98L30 108L48 118Z"));
  A.add(rc(14, 54, 44, 44, 8, A.g("#ffd24d", 0.5, 0.4), 3.4) + rc(18, 58, 36, 36, 5, "none", 1.4, 'stroke="#fff" stroke-opacity=".6"') + `<path d="M14 62Q14 54 22 54H50Q58 54 58 62" fill="#fff" fill-opacity=".25"/>` + `<text x="36" y="87" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="30" fill="#7a4a08">A</text>`);
  A.add(rc(70, 30, 44, 44, 8, A.g("#4fa3ff", 0.5, 0.4), 3.4) + rc(74, 34, 36, 36, 5, "none", 1.4, 'stroke="#fff" stroke-opacity=".6"') + `<text x="92" y="63" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="30" fill="#fff">B</text>`);
  A.add(dots([[20, 94], [52, 94]], 1.6, "#a5620c", 0.6)); A.add(dots([[76, 70], [108, 70]], 1.6, "#1f46a8", 0.6));
  A.add(A.spark(112, 100, 6, "#fff", "#e8861a"));
  return { shadow: [64, 122, 44, 4.5, 0.3], sparkles: true };
}
