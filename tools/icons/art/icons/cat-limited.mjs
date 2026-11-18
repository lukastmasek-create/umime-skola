// Limitovaná edice: broušený modrý diamant s korunou, rondistou a pavilonem, visačka s přesýpacími hodinami.
import { INK, o, c, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  const top = [[24, 46], [40, 24], [88, 24], [104, 46]];
  A.add(o("M24 46L40 24H88L104 46L64 112Z", A.g("#3b7cff", 0.5, 0.5), 3.2));
  const f = (pts, col) => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${col}"/>`;
  A.add(f([[24, 46], [40, 24], [50, 46]], "#7fb4ff") + f([[40, 24], [64, 24], [50, 46]], "#b6d6ff") + f([[64, 24], [88, 24], [78, 46]], "#8fc0ff") + f([[88, 24], [104, 46], [78, 46]], "#5a92f0") + f([[40, 24], [64, 24], [64, 46], [50, 46]], "#d6e8ff") + f([[64, 24], [64, 46], [78, 46]], "#a3c8ff"));
  A.add(f([[24, 46], [50, 46], [64, 112]], "#2f62d6") + f([[50, 46], [78, 46], [64, 112]], "#3f7af0") + f([[78, 46], [104, 46], [64, 112]], "#1f46a8"));
  A.add(`<path d="M24 46H104M40 24L50 46L64 24L78 46L88 24M50 46L64 112L78 46" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-opacity=".75"/>`);
  A.add(`<path d="M24 46L40 24H88L104 46L64 112Z" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`);
  A.add(ln("M44 28L56 28M30 44L38 32", "#fff", 0.95, 2.2));
  // visačka s přesýpacími hodinami
  A.add(o("M82 78H116V108H82Z", A.g("#fff3c8", 0.3, 0.2), 2.6, `transform="rotate(8 99 93)"`));
  A.add(`<g transform="rotate(8 99 93)"><circle cx="86.5" cy="83" r="2.6" fill="#8a95bb" stroke="${INK}" stroke-width="1.4"/><path d="M92 84H106L99 93L106 102H92L99 93Z" fill="#ffd24d" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M95 84H103L99 90Z" fill="#e5484d" opacity=".7"/><path d="M92 102L99 96L106 102Z" fill="#e5484d" opacity=".85"/></g>`);
  A.add(A.spark(18, 20, 6, "#fff", "#3b7cff")); 
  return { shadow: [64, 122, 36, 4.5, 0.3], sparkles: true };
}
