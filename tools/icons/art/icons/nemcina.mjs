// Němčina: preclík s lesklou kůrkou, hrubou solí a prasklinou těsta, na dřevěném prkénku.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M10 100Q64 92 118 100L112 118Q64 126 16 118Z", A.g("#c98a52", 0.4, 0.4), 3)); A.add(ln("M20 106Q64 100 108 106", "#fff", 0.5, 1.4));
  const rope = "M30 96C14 80 14 42 38 30C54 22 62 38 64 52C66 38 74 22 90 30C114 42 114 80 98 96C82 106 70 86 64 72C58 86 46 106 30 96Z";
  A.add(`<path d="${rope}" fill="none" stroke="${INK}" stroke-width="22" stroke-linejoin="round"/>`);
  A.add(`<path d="${rope}" fill="none" stroke="${A.lin([[0, "#e8a04a"], [0.5, "#b8641c"], [1, "#7a3e10"]])}" stroke-width="16" stroke-linejoin="round"/>`);
  A.add(`<path d="${rope}" fill="none" stroke="#f6c47a" stroke-opacity=".7" stroke-width="4" stroke-linejoin="round" transform="translate(-1.2 -2)"/>`);
  A.add(`<path d="M44 30L56 42M84 30L72 42M62 60L66 72" stroke="#7a3e10" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>`);
  A.add(dots([[26, 58], [32, 78], [36, 42], [48, 28], [80, 28], [92, 42], [98, 80], [104, 60], [52, 76], [76, 78], [64, 46]], 1.8, "#fffdf5"));
  A.add(dots([[30, 66], [100, 70], [60, 34], [70, 90]], 1.3, "#fffdf5", 0.9));
  A.add(A.spark(112, 22, 6, "#fff", "#c47a2a"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
