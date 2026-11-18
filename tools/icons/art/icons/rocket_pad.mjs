// Raketová rampa: raketa s okénkem, křídly, pruhy a plamenem na startovacím stolu s věží a světly.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M52 110C44 96 48 90 64 82C80 90 84 96 76 110Z" fill="${A.lin([[0, "#fff6a8"], [0.5, "#ffb02e"], [1, "#e5484d"]])}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" opacity=".95"/>`);
  A.add(o("M92 54H100V108H92Z", A.g("#8a95bb", 0.35, 0.4, [0, 0, 1, 0]), 2.4)); A.add(`<path d="M92 66H84M92 82H84M92 98H84" stroke="${INK}" stroke-width="2.4"/>`); A.add(c(96, 50, 3, "#e5484d", 1.6));
  A.add(o("M44 82L30 98L44 100Z", A.g("#e5484d", 0.4, 0.4), 2.8)); A.add(o("M84 82L98 98L84 100Z", A.g("#c43e3e", 0.4, 0.4), 2.8));
  A.add(o("M64 6C80 20 82 50 80 84H48C46 50 48 20 64 6Z", A.lin([[0, "#ffffff"], [0.45, "#e8ecff"], [1, "#9aa6c8"]], [0, 0, 1, 0]), 3.4));
  A.add(`<path d="M64 6C74 16 78 30 79 44H49C50 30 54 16 64 6Z" fill="${A.g("#e5484d", 0.4, 0.4)}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  A.add(`<path d="M48 64H80M48 76H80" stroke="#4a63d8" stroke-width="4"/>`);
  A.add(c(64, 54, 11, "#9aa6c8", 3)); A.add(c(64, 54, 8, A.gr("#4fa3ff", 0.3, 0.3, 0.5, 0.4), 1.8)); A.add(`<path d="M58 50Q60 46 65 46" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`);
  A.add(o("M52 84H76L72 92H56Z", A.g("#6b7390"), 2.4));
  A.add(o("M30 108H98L108 118H20Z", A.g("#8a95bb", 0.4, 0.45), 3)); A.add(`<path d="M32 112H96" stroke="#ffd24d" stroke-width="2" stroke-dasharray="6 4"/>`);
  A.add(ln("M56 12Q50 34 52 62", "#fff", 0.8, 3));
  A.add(`<circle cx="108" cy="90" r="0"/>`);
  A.add(A.spark(18, 30, 6, "#fff", "#4a63d8")); A.add(A.spark(110, 22, 5, "#fff", "#4a63d8"));
  return { shadow: [64, 124, 50, 4.5, 0.3], sparkles: true };
}
