// Pryskyřice: kapka zlaté smoly stékající z kmene, vnitřní lom světla, malý list a prasklá kůra.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M16 104V80Q16 72 24 72H104Q112 72 112 80V104Z", A.g("#8a5a2b", 0.3, 0.45, [0, 0, 1, 0]), 3.4)); A.add(`<path d="M26 74L28 100M44 74L42 102M62 74L64 100M80 74L78 102M98 74L100 100" stroke="#3a2010" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>`);
  A.add(`<path d="M12 104H116L110 116H18Z" fill="${A.g("#6b3f1d", 0.3, 0.4)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`);
  A.add(o("M64 72C60 58 36 42 36 26C36 12 48 6 64 6C80 6 92 12 92 26C92 42 68 58 64 72Z", A.lin([[0, "#ffe9a0"], [0.4, "#ffb02e"], [1, "#c4660f"]], [0.2, 0, 0.8, 1]), 3.4));
  A.add(`<path d="M64 62C62 52 46 42 46 28" fill="none" stroke="#c4660f" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`);
  A.add(`<ellipse cx="52" cy="22" rx="6" ry="10" transform="rotate(20 52 22)" fill="#fff" fill-opacity=".75"/>`);
  A.add(dots([[72, 30], [66, 44], [78, 22]], 2.6, "#fff6c8", 0.7)); A.add(dots([[70, 18]], 1.4, "#fff"));
  A.add(`<path d="M30 92Q32 100 36 96Q38 104 42 100" fill="${A.g("#ffb02e")}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`);
  A.add(`<g transform="translate(96 62) rotate(24)"><path d="M0 0Q10 -14 22 -6Q16 8 0 0Z" fill="${A.g("#6bd98a", 0.4, 0.4)}" stroke="${INK}" stroke-width="2"/><path d="M2 -1Q10 -6 18 -4" stroke="#1f6a3a" stroke-width="1.2"/></g>`);
  A.add(A.spark(14, 40, 6, "#fff", "#e8861a")); A.add(A.spark(112, 18, 5, "#fff", "#e8861a"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
