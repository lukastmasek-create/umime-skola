// Mazlíčci: kočičí hlava s pruhy, ušima s vnitřkem, velkýma očima, vousky a růžovým čumáčkem, límec se zvonečkem.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M22 56L18 14L50 34Z", A.g("#ff9a3c", 0.4, 0.4), 3.2)); A.add(o("M106 56L110 14L78 34Z", A.g("#ff9a3c", 0.4, 0.4), 3.2));
  A.add(o("M26 48L24 24L42 36Z", A.g("#ffb0b8", 0.3, 0.2), 1.8)); A.add(o("M102 48L104 24L86 36Z", A.g("#ffb0b8", 0.3, 0.2), 1.8));
  A.add(el(64, 70, 46, 40, A.gr("#ffa84a", 0.35, 0.28, 0.5, 0.35), 3.4));
  A.add(`<path d="M64 30V44M50 32L52 44M78 32L76 44M20 62H30M20 74H30M108 62H98M108 74H98" stroke="#b8561c" stroke-width="3.6" stroke-linecap="round" opacity=".8"/>`);
  A.add(el(64, 84, 22, 16, A.g("#fff3de", 0.2, 0.2), 0, 'stroke="none"'));
  for (const x of [46, 82]) { A.add(el(x, 64, 11, 12, "#fff", 2.6)); A.add(el(x, 66, 6, 9, A.gr("#2fae6d", 0.4, 0.3), 1.6)); A.add(el(x, 66, 2.6, 6.4, INK, 0)); A.add(dots([[x - 2.4, 62]], 2, "#fff")); }
  A.add(o("M59 78H69L64 84Z", A.g("#ff7a9a"), 2)); A.add(`<path d="M64 84V88M64 88Q58 94 52 90M64 88Q70 94 76 90" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`);
  A.add(`<path d="M40 82L14 76M40 88L14 92M88 82L114 76M88 88L114 92" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>`);
  A.add(`<path d="M28 100Q64 120 100 100" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M28 100Q64 120 100 100" fill="none" stroke="#e5484d" stroke-width="7" stroke-linecap="round"/>`);
  A.add(c(64, 116, 6.6, A.gr("#ffd24d", 0.3, 0.3), 2.4)); A.add(`<path d="M60 116H68" stroke="#a5620c" stroke-width="1.6"/>`);
  A.add(ln("M30 50Q40 36 54 32", "#fff", 0.6, 3));
  A.add(A.spark(112, 100, 6, "#fff", "#ff9a3c"));
  return { shadow: [64, 123, 48, 4.5, 0.3], sparkles: true };
}
