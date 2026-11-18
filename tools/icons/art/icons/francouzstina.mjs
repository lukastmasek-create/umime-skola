// Francouzština: máslový croissant s vrstvami těsta a lesklou kůrkou, na modro-bílo-červené stuze.
import { INK, o, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M8 104H120V116H8Z", A.lin([[0, "#3b6fe0"], [0.33, "#3b6fe0"], [0.34, "#fff"], [0.66, "#fff"], [0.67, "#e5484d"], [1, "#e5484d"]], [0, 0, 1, 0]), 2.8));
  const seg = (d, base, w = 3) => o(d, A.g(base, 0.5, 0.38), w);
  A.add(seg("M10 94Q6 82 18 76L32 72L34 96Z", "#d98f3c")); A.add(seg("M118 94Q122 82 110 76L96 72L94 96Z", "#d98f3c"));
  A.add(seg("M26 100Q18 80 34 64L50 56L52 98Z", "#e8a04a")); A.add(seg("M102 100Q110 80 94 64L78 56L76 98Z", "#e8a04a"));
  A.add(seg("M42 100Q36 76 52 56Q64 44 76 56Q92 76 86 100Z", "#f0b25a"));
  A.add(`<path d="M44 90Q56 82 70 86M46 76Q60 68 76 74M52 64Q64 58 74 64" fill="none" stroke="#a5580f" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>`);
  A.add(`<path d="M20 90Q20 82 28 78M104 90Q108 82 100 78M36 90Q36 78 42 72M92 90Q92 78 86 72" fill="none" stroke="#a5580f" stroke-opacity=".5" stroke-width="1.8" stroke-linecap="round"/>`);
  A.add(ln("M50 62Q62 50 76 62", "#fff3c8", 0.8, 2.6)); A.add(ln("M30 76Q24 84 22 92", "#fff3c8", 0.55, 2));
  A.add(dots([[60, 70], [66, 78], [56, 80]], 1.1, "#fff3c8", 0.7));
  A.add(A.spark(104, 40, 6, "#fff", "#e5484d"));
  return { shadow: [64, 122, 54, 5, 0.3], sparkles: true };
}
