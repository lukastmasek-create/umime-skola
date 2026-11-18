// Hudební nauka: dvojitá osminová nota s trámcem, hlavami s leskem, houslový klíč na notové osnově, jiskry.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  for (const y of [34, 44, 54, 64, 74]) A.add(`<path d="M10 ${y}H118" stroke="${INK}" stroke-width="1.6" opacity=".55"/>`);
  A.add(o("M16 28Q8 50 18 66Q26 80 24 94Q22 106 12 104", "none", 7));
  A.add(`<path d="M30 76Q22 62 28 52Q32 42 34 34Q32 28 28 28Q22 34 26 46Q22 60 30 70" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" opacity=".0"/>`);
  A.add(o("M50 28L100 16V84L50 96Z", A.lin([[0, "#9a7bff"], [1, "#4a33b8"]], [0, 0, 1, 0]), 3));
  A.add(o("M50 44L100 32V44L50 56Z", A.lin([[0, "#c9b6ff"], [1, "#6b4de0"]]), 2.6));
  A.add(o("M50 28H58V98H50ZM92 16H100V86H92Z", A.g("#3a2a8a", 0.3, 0.3, [0, 0, 1, 0]), 2.4));
  for (const [x, y] of [[44, 98], [86, 88]]) { A.add(el(x, y, 13, 10, A.gr("#6b4de0", 0.3, 0.25), 3, `transform="rotate(-22 ${x} ${y})"`)); A.add(ln(`M${x - 8} ${y - 2}Q${x - 4} ${y - 8} ${x + 2} ${y - 7}`, "#fff", 0.8, 2)); }
  A.add(ln("M56 32L96 22", "#fff", 0.5, 2));
  A.add(`<path d="M24 20C14 20 12 36 22 44C32 54 30 68 22 70C14 72 10 62 18 60" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" transform="translate(-4 -4)"/>`);
  A.add(`<path d="M24 20C14 20 12 36 22 44C32 54 30 68 22 70C14 72 10 62 18 60" fill="none" stroke="#ffd24d" stroke-width="2.4" stroke-linecap="round" transform="translate(-4 -4)"/>`);
  A.add(A.spark(110, 14, 6, "#fff", "#6b4de0")); A.add(A.spark(112, 100, 4.5, "#fff", "#6b4de0"));
  return { shadow: [64, 122, 46, 4.5, 0.3], sparkles: true };
}
