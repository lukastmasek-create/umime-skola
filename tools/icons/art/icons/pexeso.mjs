// Pexeso: dvě karty (jedna otočená s hvězdou, druhá rubem s ozdobným vzorem), párový lesk mezi nimi.
import { INK, o, c, rc, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  A.add(`<g transform="rotate(-12 40 70)">` + rc(14, 22, 54, 76, 8, A.lin([[0, "#9b7dff"], [1, "#4a33b8"]]), 3.2) + rc(20, 28, 42, 64, 4, "none", 1.8, 'stroke="#fff" stroke-opacity=".7"'));
  for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) A.add(`<path d="M${33 + k * 14 - 4} ${46 + i * 16}l4-5 4 5-4 5Z" fill="#fff" fill-opacity="${(i + k) % 2 ? 0.5 : 0.85}" stroke="#2a1f78" stroke-width="1"/>`);
  A.add(`</g>`.replace("</g>", ""));
  A.add("</g>".length ? "</g>" : "");
  A.add(`<g transform="rotate(10 88 62)">` + rc(60, 18, 54, 76, 8, A.lin([[0, "#fffdf5"], [1, "#e6dcc0"]]), 3.2));
  const S = starPts(87, 52, 19, 8.4);
  A.add(`<path d="${S.map((p, k) => `${k ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#ffd24d", 0.5, 0.4)}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`);
  A.add(ln("M78 44L87 36", "#fff", 0.85, 1.8)); A.add(`<path d="M68 80H106" stroke="#9aa6c8" stroke-width="2.4" stroke-linecap="round"/><path d="M72 86H100" stroke="#9aa6c8" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`);
  A.add(`<circle cx="68" cy="26" r="3" fill="#e5484d"/><circle cx="106" cy="86" r="3" fill="#4a8cff"/></g>`);
  A.add(`<path d="M52 98Q64 110 76 98" fill="none" stroke="#2fae6d" stroke-width="4" stroke-linecap="round"/><path d="M52 98Q64 110 76 98" fill="none" stroke="#7bf0b0" stroke-width="1.8" stroke-linecap="round"/>`);
  A.add(A.spark(64, 12, 6.5, "#fff", "#e8a21f"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
