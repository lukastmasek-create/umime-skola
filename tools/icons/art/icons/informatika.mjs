// Informatika: notebook s kódem v okně (barevná syntaxe), kurzorem, kontrolkou a klávesnicí s trackpadem.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(20, 16, 88, 62, 7, A.g("#c9d0e8", 0.5, 0.35), 3.2));
  A.add(rc(26, 22, 76, 50, 3, A.lin([[0, "#1c2750"], [1, "#0e1430"]]), 2.4));
  A.add(`<path d="M26 22H102V30H26Z" fill="#2a3a78"/>`); A.add(dots([[32, 26], [38, 26], [44, 26]], 1.8, "#ff7a7a")); A.add(`<circle cx="38" cy="26" r="1.8" fill="#ffd24d"/><circle cx="44" cy="26" r="1.8" fill="#4ade80"/>`);
  const code = [[32, 38, [["#ff7ac6", 10], ["#8be9fd", 18], ["#f8f8f2", 8]]], [38, 46, [["#50fa7b", 14], ["#f8f8f2", 22]]], [38, 54, [["#ffb86c", 24], ["#bd93f9", 10]]], [32, 62, [["#ff7ac6", 8], ["#f8f8f2", 14]]]];
  for (const [x, y, segs] of code) { let cx = x; for (const [col, w] of segs) { A.add(`<rect x="${cx}" y="${y}" width="${w}" height="3.4" rx="1.7" fill="${col}"/>`); cx += w + 3; } }
  A.add(ln("M28 24L60 24", "#fff", 0.25, 1));
  A.add(o("M10 84H118L110 106Q108 112 102 112H26Q20 112 18 106Z", A.g("#b9c4dd", 0.5, 0.35), 3.2));
  for (let r = 0; r < 3; r++) for (let i = 0; i < 10 - (r === 2 ? 3 : 0); i++) A.add(`<rect x="${(r === 2 ? 38 : 24) + i * 8.4 - (r === 1 ? -3 : 0)}" y="${88 + r * 6.4}" width="6.2" height="4.4" rx="1" fill="#eef1ff" stroke="#6b7390" stroke-width=".8"/>`);
  A.add(rc(54, 104, 20, 5, 2, "#8a95bb", 1.2, 'opacity="0"'));
  A.add(c(64, 100, 0, "none", 0));
  A.add(dots([[104, 90]], 2, "#4ade80"));
  A.add(A.spark(112, 14, 6, "#fff", "#4a63d8"));
  return { shadow: [64, 122, 52, 4.5, 0.3], sparkles: true };
}
