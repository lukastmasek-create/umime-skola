// Meteorit: žhavý nerovný balvan s lávovými prasklinami, kráterky a ohnivým ocasem, jiskry.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M80 54C60 34 30 24 8 10C26 34 18 54 40 74Z" fill="${A.lin([[0, "#ff5a2e"], [1, "#ffd24d", 0.0]], [1, 1, 0, 0])}" stroke="none" opacity=".9"/>`);
  A.add(`<path d="M64 56C48 44 32 38 20 30C34 46 30 58 46 70Z" fill="#ffe27a" opacity=".8"/>`);
  A.add(o("M54 52L74 40L100 46L116 68L108 98L82 112L56 104L44 80Z", A.gr("#5a4a50", 0.3, 0.25, 0.4, 0.5), 3.6));
  A.add(`<path d="M74 40L80 62L100 46M80 62L116 68M80 62L82 112M80 62L56 78M56 78L44 80" fill="none" stroke="${INK}" stroke-opacity=".45" stroke-width="1.6" stroke-linejoin="round"/>`);
  A.add(`<path d="M62 62L72 70L66 86L78 94M90 74L98 82L94 92" fill="none" stroke="#ff7a2e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M62 62L72 70L66 86L78 94M90 74L98 82L94 92" fill="none" stroke="#ffe27a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (const [x, y, r] of [[92, 58, 4.4], [66, 98, 3.6], [104, 90, 3]]) { A.add(c(x, y, r, A.g("#3a2a30", 0.1, 0.4), 1.6)); A.add(ln(`M${x - r + 1} ${y - 1}Q${x} ${y - r} ${x + r - 1} ${y - 1}`, "#fff", 0.4, 1)); }
  A.add(ln("M62 56L78 46L96 50", "#fff", 0.55, 2.4));
  A.add(A.spark(110, 22, 7, "#ffe27a", "#e8620e")); A.add(A.spark(20, 80, 5, "#ffe27a", "#e8620e"));
  return { shadow: [72, 123, 40, 4.5, 0.3], sparkles: true };
}
