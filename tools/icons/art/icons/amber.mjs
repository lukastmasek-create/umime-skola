// Jantar: hranatý broušený kus jantaru s uvězněným komárem, bublinkami a vnitřním žárem.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M16 50L40 16L88 12L116 44L100 104L48 112L20 90Z", A.lin([[0, "#ffd46a"], [0.5, "#ff9a1a"], [1, "#b8560a"]], [0, 0, 1, 1]), 3.4));
  const f = (pts, col, op = 1) => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${col}" fill-opacity="${op}"/>`;
  A.add(f([[16, 50], [40, 16], [52, 48]], "#ffe9a0", .8) + f([[40, 16], [88, 12], [76, 44], [52, 48]], "#ffc24d", .6) + f([[88, 12], [116, 44], [76, 44]], "#e8861a", .5) + f([[52, 48], [76, 44], [100, 104], [48, 112]], "#c4660f", .25) + f([[16, 50], [52, 48], [48, 112], [20, 90]], "#ffb02e", .4));
  A.add(`<path d="M16 50L52 48L40 16M52 48L76 44L88 12M76 44L116 44M52 48L48 112M76 44L100 104" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="1.6" stroke-linejoin="round"/>`);
  A.add(`<path d="M16 50L40 16L88 12L116 44L100 104L48 112L20 90Z" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>`);
  A.add(`<g transform="translate(58 66) rotate(-16)"><ellipse cx="0" cy="0" rx="9" ry="3.2" fill="#3a1f06"/><circle cx="-11" cy="0" r="3.2" fill="#3a1f06"/><path d="M-3 -2L-12 -16Q-4 -18 2 -4ZM2 -2L8 -16Q14 -12 6 -2Z" fill="#fff" fill-opacity=".7" stroke="#6b3f1d" stroke-width="1"/><path d="M-2 3L-6 12M2 3L2 12M5 3L10 11" stroke="#3a1f06" stroke-width="1.2"/><path d="M-14 0L-20 -2" stroke="#3a1f06" stroke-width="1"/></g>`);
  A.add(dots([[30, 70], [84, 86], [90, 30], [72, 98]], 2, "#fff6c8", 0.7));
  A.add(ln("M24 54L42 24", "#fff", 0.9, 3)); A.add(ln("M94 92L88 104", "#fff", 0.4, 2));
  A.add(A.spark(112, 100, 6, "#fff", "#e8861a"));
  return { shadow: [64, 122, 44, 4.5, 0.3], sparkles: true };
}
