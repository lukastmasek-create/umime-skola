// Denní výzva: kalendářní list s kroužkovou vazbou, zlatou hvězdou dne a plamínkem série.
import { INK, o, c, rc, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  A.add(rc(14, 20, 100, 92, 10, A.g("#fffaf0", 0.2, 0.2), 3.4));
  A.add(o("M14 30Q14 20 24 20H104Q114 20 114 30V44H14Z", A.g("#e5484d", 0.4, 0.45), 3.4));
  for (const x of [34, 64, 94]) { A.add(rc(x - 3, 10, 6, 18, 3, A.g("#c9d0e8"), 2.4)); }
  A.add(ln("M20 25H108", "#fff", 0.5, 1.6));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { const x = 22 + k * 18, y = 52 + r * 19; const done = r * 5 + k < 7; A.add(rc(x, y, 14, 14, 3.4, done ? A.g("#7bf0b0", 0.4, 0.3) : "#e9ecf8", 1.8)); if (done) A.add(`<path d="M${x + 3.4} ${y + 7.4}l3 3 5-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`); }
  const S = starPts(98, 90, 12, 5.4);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#ffe27a", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  A.add(`<path d="M52 98C40 90 46 78 52 74C50 82 58 80 56 70C66 78 66 92 52 98Z" transform="translate(10 4)" fill="${A.lin([[0, "#ffb02e"], [1, "#e5484d"]])}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  A.add(A.spark(20, 10, 5.5, "#fff", "#e5484d"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
