// Občanka: plastová průkazka s fotkou, údaji, čipem, hologramem státního znaku a laminovým leskem.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(6, 26, 116, 78, 12, A.lin([[0, "#9fd0ff"], [0.6, "#5aa0f0"], [1, "#2a5fc2"]], [0, 0, 1, 1]), 3.4));
  A.add(`<path d="M10 40Q40 28 70 40T118 36" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`);
  A.add(rc(14, 40, 40, 50, 6, A.g("#e8f4ff", 0.3, 0.2), 2.6));
  A.add(c(34, 58, 9.6, A.gr("#ffd9b8", 0.35, 0.3, 0.3, 0.2), 2.2)); A.add(o("M18 90Q18 72 34 72Q50 72 50 90Z", A.g("#4a63d8"), 2.2)); A.add(`<path d="M25 56Q34 46 44 56Q36 52 25 56Z" fill="#6b3f1d" stroke="${INK}" stroke-width="1.6"/>`);
  A.add(`<path d="M62 44H108M62 54H98M62 64H104" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".92"/>`);
  A.add(rc(62, 72, 24, 18, 3, A.lin([[0, "#ffe27a"], [1, "#c98a1a"]]), 2)); A.add(`<path d="M62 78H86M62 84H86M70 72V90M78 72V90" stroke="#7a4a08" stroke-opacity=".6" stroke-width="1"/>`);
  A.add(c(104, 82, 11, A.lin([[0, "#ffb0f0"], [0.33, "#9af0ff"], [0.66, "#fff3a0"], [1, "#b0ffb0"]], [0, 0, 1, 1]), 2.4));
  A.add(`<path d="M104 74l2 5 5 .4-4 3.4 1.4 5-4.4-2.8-4.4 2.8 1.4-5-4-3.4 5-.4Z" fill="#fff" fill-opacity=".8" stroke="#2a3166" stroke-width=".8"/>`);
  A.add(`<path d="M12 98H110" stroke="#1f234c" stroke-opacity=".3" stroke-width="1.6" stroke-dasharray="1 3"/>`);
  A.add(`<path d="M10 32Q50 24 112 30" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" fill="none"/>`);
  A.add(A.spark(114, 20, 6, "#fff", "#2a5fc2"));
  return { shadow: [64, 116, 52, 4.5, 0.3], sparkles: true };
}
