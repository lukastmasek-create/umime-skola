// Královská pečeť: karmínový vosk s vlnitým okrajem, ražená koruna s drahokamy, stuhy a odlesk.
import { INK, o, c, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  A.add(o("M46 84L34 124L52 116L62 126L68 90Z", A.g("#e5484d", 0.4, 0.4), 2.8)); A.add(o("M82 84L94 124L76 116L66 126L60 90Z", A.g("#c43e3e", 0.4, 0.4), 2.8));
  let d = ""; for (let i = 0; i < 40; i++) { const [x, y] = polar(64, 54, i % 2 ? 46 : 52, i * 9); d += `${i ? "L" : "M"}${x} ${y}`; }
  A.add(`<path d="${d}Z" fill="${A.gr("#c4163a", 0.3, 0.25, 0.4, 0.5)}" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>`);
  A.add(c(64, 54, 38, A.gr("#d02a48", 0.3, 0.25, 0.35, 0.4), 2.4, 'stroke="#7a0a24"')); A.add(c(64, 54, 33, "none", 1.4, 'stroke="#ff8aa0" stroke-opacity=".7"'));
  A.add(`<path d="M38 68L36 44L48 54L64 36L80 54L92 44L90 68Z" transform="translate(1.4 2.4)" fill="#5a0a1a" fill-opacity=".6"/>`);
  A.add(o("M38 68L36 44L48 54L64 36L80 54L92 44L90 68Z", A.g("#ffd24d", 0.5, 0.4), 2.6)); A.add(`<rect x="38" y="68" width="52" height="6" rx="2" fill="${A.g("#ffd24d")}" stroke="${INK}" stroke-width="2.2"/>`);
  for (const [x, y, col] of [[64, 62, "#4a8cff"], [48, 64, "#35c47c"], [80, 64, "#ffffff"]]) A.add(c(x, y, 3.2, A.gr(col, 0.3, 0.3), 1.4));
  A.add(dots([[36, 44], [64, 36], [92, 44]], 3, "#fff6c8")); A.add(`<g fill="none" stroke="${INK}" stroke-width="1.2"><circle cx="36" cy="44" r="3"/><circle cx="64" cy="36" r="3"/><circle cx="92" cy="44" r="3"/></g>`);
  A.add(ln("M34 34Q44 22 60 20", "#fff", 0.6, 3));
  A.add(A.spark(112, 20, 6, "#fff", "#c4163a"));
  return { shadow: [64, 123, 44, 4.5, 0.3], sparkles: true };
}
