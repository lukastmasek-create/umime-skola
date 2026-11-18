// Výtvarná výchova: dřevěná paleta s otiskem palce a zářivými kapkami barev, štětec s chomáčem a kovovou objímkou.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M62 14C28 14 8 38 12 66C16 92 46 114 76 106C94 100 88 86 100 84C118 80 122 60 112 42C100 22 82 14 62 14Z", A.g("#d9a35a", 0.45, 0.4, [0, 0, 1, 1]), 3.4));
  A.add(ln("M24 38Q38 22 60 22", "#fff", 0.6, 3));
  A.add(`<ellipse cx="86" cy="82" rx="9" ry="7" fill="#a9733a" stroke="${INK}" stroke-width="2.6"/><ellipse cx="85" cy="81" rx="5.4" ry="3.6" fill="#8a5a2b" opacity=".5"/>`);
  for (const [x, y, col] of [[34, 50, "#e5484d"], [54, 36, "#ffd24d"], [80, 36, "#4a8cff"], [96, 56, "#2fd37a"], [38, 78, "#b36bff"]]) {
    A.add(`<ellipse cx="${x}" cy="${y + 2}" rx="9.4" ry="7.2" fill="#000" fill-opacity=".22"/>`);
    A.add(`<path d="M${x - 9} ${y}Q${x - 9} ${y - 8} ${x - 1} ${y - 7}Q${x + 8} ${y - 9} ${x + 9} ${y - 1}Q${x + 11} ${y + 6} ${x + 2} ${y + 7}Q${x - 8} ${y + 8} ${x - 9} ${y}Z" fill="${A.gr(col, 0.3, 0.25, 0.5, 0.3)}" stroke="${INK}" stroke-width="2.2"/>`);
    A.add(ln(`M${x - 5} ${y - 3}Q${x - 2} ${y - 5} ${x + 1} ${y - 4}`, "#fff", 0.85, 1.6));
  }
  A.add(`<g transform="rotate(38 96 90)">` + o("M92 56H100L104 108H88Z", A.g("#3a8fe0", 0.4, 0.4, [0, 0, 1, 0]), 2.6) + o("M89 92H103L104 102H88Z", A.g("#c9d0e8"), 2.2) + `<path d="M91 96h12M91 99h12" stroke="#6b7390" stroke-width=".9"/>` + o("M88 102H104Q106 118 96 126Q86 118 88 102Z", A.g("#e5484d", 0.4, 0.4), 2.6) + ln("M92 108Q92 116 95 120", "#fff", 0.6, 1.4) + `</g>`);
  A.add(A.spark(112, 14, 6, "#fff", "#e5484d"));
  return { shadow: [64, 122, 50, 4.5, 0.3], sparkles: true };
}
