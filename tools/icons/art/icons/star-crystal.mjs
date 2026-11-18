// Hvězdný krystal: čtyřcípý krystal s fasetami, kosočtvercovým středem a lesklými hranami, drobné diamantky kolem.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="62" r="50" fill="#9ad4ff" fill-opacity=".24"/>`);
  const T = [64, 6], R = [118, 62], B = [64, 118], L = [10, 62], C = [64, 62], ra = [76, 50], rb = [76, 74], la = [52, 74], lb = [52, 50];
  const P = (pts, col, op = 1) => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${col}" fill-opacity="${op}"/>`;
  A.add(o("M64 6L76 50L118 62L76 74L64 118L52 74L10 62L52 50Z", A.g("#6bb0ff", 0.4, 0.4), 3.6));
  A.add(P([T, ra, C, lb], "#cfe6ff") + P([ra, R, rb, C], "#6bb0ff") + P([rb, B, la, C], "#2a5fc2") + P([la, L, lb, C], "#4a8cff"));
  A.add(P([T, ra, C], "#ffffff", .35) + P([R, rb, C], "#fff", .15) + P([B, la, C], "#0a1a5a", .25));
  A.add(`<path d="M64 6L64 118M10 62H118M52 50L76 74M76 50L52 74" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="1.6"/>`);
  A.add(`<path d="M64 6L76 50L118 62L76 74L64 118L52 74L10 62L52 50Z" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>`);
  A.add(`<path d="M64 20L68 48L58 48Z" fill="#fff" fill-opacity=".9"/>`); A.add(ln("M24 60L46 54", "#fff", 0.8, 2));
  for (const [x, y] of [[104, 22], [20, 100], [108, 104]]) A.add(o(`M${x} ${y - 7}L${x + 6} ${y}L${x} ${y + 7}L${x - 6} ${y}Z`, A.g("#9ad4ff", 0.5, 0.3), 2));
  A.add(A.spark(22, 22, 6, "#fff", "#2a5fc2")); A.add(A.spark(118, 100, 5, "#fff", "#2a5fc2"));
  return { shadow: [64, 123, 36, 4.5, 0.3], sparkles: true };
}
