// Žalud: lesklý žalud s šupinovitou čepičkou, stopkou a lístkem dubu, tvářička.
import { INK, o, c, el, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(o("M30 62C30 96 46 118 64 118S98 96 98 62Z", A.gr("#c98a42", 0.35, 0.28, 0.55, 0.45), 3.4));
  A.add(ln("M40 76Q42 98 54 108", "#fff", 0.55, 4)); A.add(`<path d="M64 118Q64 112 64 108" stroke="#7a4a1a" stroke-width="2.6" stroke-linecap="round"/>`);
  A.add(face(64, 86, 1));
  A.add(o("M24 66C22 38 40 24 64 24S106 38 104 66Z", A.gr("#8a5a2b", 0.3, 0.25, 0.4, 0.5), 3.4));
  for (let r = 0; r < 4; r++) for (let k = 0; k < 7 - (r % 2); k++) { const x = 34 + k * 10 + (r % 2) * 5, y = 34 + r * 9; A.add(`<path d="M${x - 5} ${y}Q${x} ${y + 9} ${x + 5} ${y}" fill="none" stroke="#3a2010" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>`); }
  A.add(ln("M32 50Q36 36 50 30", "#fff", 0.45, 3));
  A.add(o("M60 26V12Q60 6 66 6H70V12Q68 12 68 16V26Z", A.g("#7a4a1a", 0.3, 0.4), 2.6));
  A.add(o("M72 14Q92 2 104 16Q88 28 72 14Z", A.g("#6bd98a", 0.4, 0.4), 2.6)); A.add(ln("M76 14Q88 12 98 16", "#1f6a3a", 0.5, 1.4));
  return { shadow: [64, 122, 34, 4.5, 0.3], sparkles: false };
}
