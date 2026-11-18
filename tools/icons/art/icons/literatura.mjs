// Literatura: stoh knih s vazbami, hřbetními pásy a zlacením, záložka a brk s kalamářem.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  const book = (y, w, x, base, band) => {
    A.add(rc(x, y, w, 20, 4, A.g(base, 0.45, 0.4), 3));
    A.add(`<path d="M${x + w - 6} ${y + 4}H${x + w - 3}V${y + 16}H${x + w - 6}Z" fill="#fff6d6" stroke="${INK}" stroke-width="1.2"/>`);
    A.add(`<rect x="${x + 8}" y="${y}" width="5" height="20" fill="${band}" stroke="${INK}" stroke-width="1.6"/><rect x="${x + w - 20}" y="${y}" width="5" height="20" fill="${band}" stroke="${INK}" stroke-width="1.6"/>`);
    A.add(`<path d="M${x + 18} ${y + 7}H${x + w - 24}M${x + 18} ${y + 13}H${x + w - 30}" stroke="#ffd24d" stroke-width="2" stroke-linecap="round"/>`);
    A.add(ln(`M${x + 4} ${y + 4}H${x + w - 4}`, "#fff", 0.5, 1.4));
  };
  book(92, 92, 14, "#2a4bd8", "#ffd24d"); book(70, 84, 22, "#e5484d", "#fff6d6"); book(48, 78, 18, "#2fae6d", "#ffd24d");
  A.add(o("M92 100h6v14h-6Z", A.g("#ffd24d"), 1.6));
  A.add(`<path d="M60 112L66 122L72 112Z" fill="#e5484d" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`);
  A.add(o("M62 40L100 4Q108 -2 112 4Q114 12 106 20L74 50Z", A.g("#f4f6ff", 0.2, 0.22), 2.8));
  A.add(`<path d="M104 8L78 42M100 14L76 44M108 14L84 44" stroke="#9aa6c8" stroke-width="1" opacity=".7"/>`);
  A.add(o("M62 40L74 50L66 56Z", A.g("#ffd24d"), 2));
  A.add(A.spark(28, 34, 6, "#fff", "#2a4bd8"));
  return { shadow: [64, 122, 50, 5, 0.3], sparkles: true };
}
