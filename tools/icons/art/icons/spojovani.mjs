// Spojování: dva sloupce uzlů propojené barevnými křivkami (zelená správná, modrá, oranžová), kovové koncovky.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  const lines = [["M26 28C60 28 68 60 102 60", "#35c47c"], ["M26 64C60 64 68 28 102 28", "#4a8cff"], ["M26 100C60 100 68 96 102 96", "#ff9a3c"]];
  for (const [d, col] of lines) A.add(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="6.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.8" stroke-linecap="round" transform="translate(0 -1.6)"/>`);
  for (const [x, ys, cols] of [[22, [28, 64, 100], ["#35c47c", "#4a8cff", "#ff9a3c"]], [106, [28, 60, 96], ["#4a8cff", "#35c47c", "#ff9a3c"]]]) ys.forEach((y, i) => { A.add(rc(x - 12, y - 11, 24, 22, 7, A.g("#eef1ff", 0.3, 0.3), 2.8)); A.add(c(x, y, 6.4, A.gr(cols[i], 0.3, 0.3, 0.5, 0.35), 2.2)); A.add(ln(`M${x - 8} ${y - 8}H${x + 4}`, "#fff", 0.8, 1.6)); });
  A.add(A.spark(64, 14, 6, "#fff", "#4a8cff"));
  return { shadow: [64, 122, 50, 4.5, 0.3], sparkles: true };
}
