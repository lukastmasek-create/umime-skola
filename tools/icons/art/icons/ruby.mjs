// Rubín: brilantově broušený červený drahokam s tabulkou, korunou, rondistou a pavilonem, jiskry.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  const P = (pts, col, op = 1) => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${col}" fill-opacity="${op}"/>`;
  A.add(o("M14 44L34 16H94L114 44L64 116Z", A.lin([[0, "#ff6b86"], [1, "#8a1230"]], [0, 0, 1, 1]), 3.4));
  A.add(P([[34, 16], [50, 40], [30, 44], [14, 44]], "#ff9aae") + P([[34, 16], [94, 16], [78, 40], [50, 40]], "#ffd0da", .85) + P([[94, 16], [114, 44], [98, 44], [78, 40]], "#ff5a78") + P([[14, 44], [30, 44], [50, 40], [64, 116]], "#e0284a") + P([[50, 40], [78, 40], [64, 116]], "#c4163a") + P([[78, 40], [98, 44], [114, 44], [64, 116]], "#8a1230"));
  A.add(`<path d="M14 44H114M34 16L50 40L64 16L78 40L94 16M50 40L64 116L78 40M30 44L50 40M98 44L78 40" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="1.6" stroke-linejoin="round"/>`);
  A.add(`<path d="M14 44L34 16H94L114 44L64 116Z" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>`);
  A.add(`<path d="M42 22L58 22L52 34Z" fill="#fff" fill-opacity=".85"/>`); A.add(ln("M24 42L36 24", "#fff", 0.85, 2.4)); A.add(ln("M60 70L64 100", "#ff9aae", 0.4, 2));
  A.add(A.spark(112, 16, 7, "#fff", "#e0284a")); A.add(A.spark(14, 70, 5.5, "#fff", "#e0284a")); A.add(A.spark(100, 84, 5, "#fff", "#e0284a"));
  return { shadow: [64, 122, 40, 4.5, 0.3], sparkles: true };
}
