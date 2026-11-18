// Piškvorky: dřevěná tabulka 3×3 s vyřezanými čárami, červené X a modré O s leskem, vítězná čára.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(10, 12, 108, 104, 12, A.g("#e8c28a", 0.4, 0.4, [0, 0, 1, 1]), 3.4));
  A.add(`<path d="M16 28Q60 24 112 30M16 60Q60 56 112 62M16 96Q60 92 112 98" stroke="#b8864a" stroke-opacity=".35" stroke-width="1.2" fill="none"/>`);
  A.add(`<path d="M46 20V108M82 20V108M20 48H108M20 82H108" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/><path d="M46 20V108M82 20V108M20 48H108M20 82H108" stroke="#4a2c10" stroke-width="2" stroke-linecap="round" transform="translate(.8 .8)"/>`);
  const X = (x, y) => `<path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="${A.lin([[0, "#ff8a7a"], [1, "#d02a3e"]])}" stroke-width="5.6" stroke-linecap="round"/><path d="M${x - 7} ${y - 8}L${x - 2} ${y - 3}" stroke="#fff" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round"/>`;
  const O = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${A.lin([[0, "#7bc0ff"], [1, "#2a5fc2"]])}" stroke-width="5.6"/><path d="M${x - 8} ${y - 3}Q${x - 6} ${y - 8} ${x - 1} ${y - 9}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.8" stroke-linecap="round"/>`;
  A.add(X(30, 34) + O(64, 34) + X(98, 34) + O(30, 66) + X(64, 66) + O(98, 66) + O(30, 100) + X(64, 100) + X(98, 100) .replace("", ""));
  A.add(`<path d="M22 108L108 24" stroke="#ffd24d" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7" opacity="0"/>`);
  A.add(`<path d="M98 100L30 34" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" opacity="0"/>`);
  A.add(A.spark(112, 12, 6, "#fff", "#d02a3e"));
  return { shadow: [64, 122, 50, 4.5, 0.3], sparkles: true };
}
