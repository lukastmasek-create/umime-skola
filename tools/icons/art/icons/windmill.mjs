// Větrný mlýn: kamenná věž se šindelovou stříškou, čtyři lamelové vrtule, dveře, okno a mouka v pytlích.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M8 112Q64 100 120 112L112 122H16Z", A.g("#46c46e", 0.3, 0.45), 3));
  A.add(o("M40 112L48 46H80L88 112Z", A.g("#e8c9a0", 0.35, 0.4, [0, 0, 1, 0]), 3.2));
  A.add(`<path d="M46 62H82M44 78H84M42 94H86" stroke="#a98a5a" stroke-opacity=".5" stroke-width="1.4"/><path d="M54 62V78M70 62V78M60 78V94M76 78V94M50 94V108M64 94V108" stroke="#a98a5a" stroke-opacity=".4" stroke-width="1.2"/>`);
  A.add(o("M52 112V96Q52 88 60 88Q68 88 68 96V112Z", A.g("#8a5a2b", 0.3, 0.4), 2.6)); A.add(dots([[64, 100]], 1.2, "#ffd24d"));
  A.add(rc(66, 62, 12, 14, 3, A.lin([[0, "#9fe0ff"], [1, "#4a9fe0"]]), 2.2)); A.add(`<path d="M72 62V76M66 69H78" stroke="${INK}" stroke-width="1.4"/>`);
  A.add(o("M42 50L64 18L86 50Z", A.g("#c4533f", 0.4, 0.45), 3.2)); A.add(`<path d="M50 44l5 6M60 36l5 14M72 40l-5 10" stroke="#7a1d25" stroke-opacity=".5" stroke-width="1.4"/>`);
  for (let k = 0; k < 4; k++) { const a = k * 90 + 20; A.add(`<g transform="rotate(${a} 64 34)">` + o("M62 34V-6H66V34Z", A.g("#8a5a2b", 0.3, 0.4, [0, 0, 1, 0]), 2) + o("M66 0H88V24H66Z", A.g("#fff6e0", 0.2, 0.25), 2.4) + `<path d="M70 0V24M76 0V24M82 0V24M66 8H88M66 16H88" stroke="#c9996a" stroke-width="1"/></g>`); }
  A.add(c(64, 34, 6.4, A.gr("#ffd24d", 0.3, 0.3), 2.6));
  A.add(o("M92 108Q92 100 98 100H108Q112 100 112 106V112H92Z", A.g("#fff3de"), 2.4)); A.add(`<path d="M98 106h8" stroke="#c9996a" stroke-width="1.4"/>`);
  A.add(A.spark(18, 24, 6, "#fff", "#c4533f"));
  return { shadow: [64, 123, 52, 4.5, 0.3], sparkles: true };
}
