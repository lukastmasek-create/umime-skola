// Kámen: hromádka hranatých balvanů s trhlinami, mechem a drobnými oblázky, tvářička.
import { INK, o, c, el, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(o("M10 108L14 78L36 62L66 66L86 82L90 108Z", A.g("#8a95bb", 0.4, 0.45, [0, 0, 1, 1]), 3.4));
  A.add(o("M62 108L66 74L88 56L112 66L118 108Z", A.g("#6f7aa0", 0.4, 0.45, [0, 0, 1, 1]), 3.4));
  A.add(o("M30 70L36 46L60 34L84 44L90 68L66 80Z", A.g("#a7b1d0", 0.45, 0.4, [0, 0, 1, 1]), 3.4));
  A.add(`<path d="M36 46L60 52L84 44M60 52L66 80M36 46L30 70" fill="none" stroke="${INK}" stroke-opacity=".4" stroke-width="1.6" stroke-linejoin="round"/><path d="M36 46L60 34L60 52Z" fill="#fff" fill-opacity=".3"/><path d="M60 52L84 44L90 68L66 80Z" fill="#1f234c" fill-opacity=".14"/>`);
  A.add(`<path d="M20 90L30 84L34 94M96 82L102 92L112 90" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(face(60, 56, 0.9, "#ff9ab0"));
  A.add(`<path d="M30 64Q40 56 52 62Q46 68 36 68Z" fill="${A.g("#6bd98a", 0.3, 0.4)}" stroke="#1f6a3a" stroke-width="1.4"/><path d="M80 52Q90 46 98 54Q92 60 84 58Z" fill="${A.g("#6bd98a", 0.3, 0.4)}" stroke="#1f6a3a" stroke-width="1.4"/>`);
  A.add(el(100, 112, 7, 4.4, A.g("#a7b1d0"), 2.2)); A.add(el(112, 114, 5, 3.4, A.g("#8a95bb"), 2)); A.add(el(8, 114, 5, 3.4, A.g("#8a95bb"), 2));
  A.add(ln("M38 40L56 34", "#fff", 0.8, 2.4));
  return { shadow: [64, 122, 54, 4.5, 0.3], sparkles: false };
}
