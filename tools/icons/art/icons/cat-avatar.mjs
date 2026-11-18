// Avatar: skafandr, bílá skořepina s panely a švy, zlatě pokovený hledí s odrazem planety, anténa, límec s kontrolkami.
import { INK, arc, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M98 20L104 8", "none", 2.6));
  A.add(c(105, 7, 4.2, A.gr("#ff5a5a", 0.3, 0.3), 2));
  A.add(o("M28 98Q28 86 40 84H88Q100 86 100 98V112Q100 120 90 120H38Q28 120 28 112Z", A.g("#b9c4dd", 0.55, 0.35), 3));
  A.add(dots([[40, 104], [48, 104]], 2.6, "#4ade80"));
  A.add(dots([[56, 104]], 2.6, "#ffd24d"));
  A.add(rc(66, 98, 22, 12, 3, "#2a3166", 2));
  A.add(ln("M70 104h14", "#7cc7ff", 0.9, 1.6));
  A.add(`<ellipse cx="64" cy="52" rx="41" ry="44" fill="#6c789f"/>`);
  A.add(el(64, 50, 41, 44, A.gr("#f3f6ff", 0.3, 0.22, 0.3, 0.35), 3.2));
  A.add(ln("M64 7V24M30 28C40 22 52 20 64 20", "#8a95bb", 0.8, 1.3));
  A.add(o("M62 82H66V92H62Z", A.g("#8892b3"), 1.6));
  A.add(el(64, 52, 31, 29, A.lin([[0, "#3b4a8a"], [0.5, "#161c46"], [1, "#0a0d2a"]]), 3));
  A.add(`<path d="M42 40Q52 28 72 30" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>`);
  A.add(`<path d="M80 64Q74 72 62 74" fill="none" stroke="#5ec8ff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>`);
  A.add(c(70, 56, 8.5, A.gr("#5ec8ff", 0.3, 0.3), 1.6, 'clip-path="none"'));
  A.add(`<path d="M62 56Q70 52 78 55" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>`);
  A.add(dots([[46, 56], [52, 66], [86, 44]], 1, "#fff", 0.8));
  A.add(c(22, 52, 6, A.g("#9aa6c8"), 2.6)); A.add(c(106, 52, 6, A.g("#9aa6c8"), 2.6));
  A.add(dots([[22, 52], [106, 52]], 2, "#ffd24d"));
  return { shadow: [64, 122, 38, 4.5, 0.32], sparkles: false };
}
