// Radnice: sloupová budova s tympanonem, hodinovou věžičkou, schody, vlajkou a dveřmi s oblouky.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(8, 108, 112, 10, 3, A.g("#c9d0e8"), 2.8)); A.add(rc(14, 102, 100, 8, 2, A.g("#d8def2"), 2.6));
  A.add(rc(16, 52, 96, 50, 3, A.g("#f3e6c8", 0.35, 0.3, [0, 0, 1, 0]), 3.2));
  A.add(o("M10 54L64 28L118 54Z", A.g("#e8d4a8", 0.4, 0.3), 3.2)); A.add(`<path d="M24 52L64 33L104 52Z" fill="${A.g("#b9c4dd", 0.4, 0.3)}" stroke="${INK}" stroke-width="1.8"/>`); A.add(c(64, 45, 4.4, A.gr("#ffd24d"), 1.8));
  for (const x of [22, 40, 76, 94]) { A.add(rc(x - 4, 54, 8, 48, 2, A.g("#fff", 0.1, 0.3, [0, 0, 1, 0]), 2.4)); A.add(rc(x - 6, 52, 12, 4, 1, A.g("#e8d4a8"), 1.6)); A.add(rc(x - 6, 99, 12, 4, 1, A.g("#e8d4a8"), 1.6)); }
  A.add(o("M52 102V74Q52 64 64 64Q76 64 76 74V102Z", A.g("#6b3f1d", 0.3, 0.4), 2.8)); A.add(`<path d="M64 64V102M54 84H74" stroke="#2a1a0a" stroke-opacity=".5" stroke-width="1.4"/>`); A.add(dots([[60, 88], [68, 88]], 1.2, "#ffd24d"));
  A.add(rc(50, 8, 28, 22, 3, A.g("#f3e6c8", 0.35, 0.3), 3)); A.add(o("M46 10L64 -2L82 10Z", A.g("#3a8fe0", 0.4, 0.4), 2.8));
  A.add(c(64, 19, 8, "#fff", 2.4)); A.add(`<path d="M64 19V13M64 19L68 21" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`);
  A.add(`<path d="M64 -2V-12" stroke="${INK}" stroke-width="2.2"/><path d="M64 -12L76 -9L64 -5Z" fill="#e5484d" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`);
  A.add(rc(22, 62, 12, 14, 6, A.lin([[0, "#9fe0ff"], [1, "#4a9fe0"]]), 0)); A.add(rc(94, 62, 12, 14, 6, A.lin([[0, "#9fe0ff"], [1, "#4a9fe0"]]), 0));
  A.add(A.spark(16, 22, 6, "#fff", "#3a8fe0"));
  return { shadow: [64, 123, 56, 4.5, 0.3], sparkles: true };
}
