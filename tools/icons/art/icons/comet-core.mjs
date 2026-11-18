// Jádro komety: ledová koule s modrými trhlinami, prachovým ocasem a jiskřícími krystaly.
import { INK, o, c, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M72 50L8 8L24 32L10 44L36 60L22 78L52 72Z" fill="${A.lin([[0, "#d8f4ff", 0], [1, "#8fd0ff", 0.95]], [0, 0, 1, 1])}" stroke="none" opacity=".92"/>`);
  A.add(`<path d="M60 56L24 28M58 64L18 56M56 70L26 74" stroke="#fff" stroke-opacity=".7" stroke-width="2.2" stroke-linecap="round"/>`);
  A.add(c(78, 72, 36, A.rad([[0, "#ffffff"], [0.4, "#d8f0ff"], [0.8, "#8fc8f4"], [1, "#4a8cd8"]], 0.32, 0.28, 0.9), 3.6));
  A.add(`<path d="M60 58L72 66L66 78M84 52L88 66L100 74M92 90L80 88L76 100" fill="none" stroke="#4a8cd8" stroke-opacity=".7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(`<path d="M54 60Q60 46 76 42" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/>`);
  A.add(face(80, 76, 0.95, "#8fa8f0"));
  A.add(dots([[100, 56], [58, 90]], 1.8, "#fff", 0.9));
  A.add(A.spark(112, 24, 7, "#fff", "#4a8cd8")); A.add(A.spark(30, 100, 5.5, "#fff", "#4a8cd8")); A.add(A.spark(100, 108, 4.5, "#fff", "#4a8cd8"));
  return { shadow: [80, 123, 36, 4.5, 0.3], sparkles: true };
}
