// Kolotoč: pruhovaná střecha s praporky, zlatý střed s lampičkami, kovový pól s koníkem a podstavec.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(el(64, 104, 52, 13, A.g("#d9a35a", 0.4, 0.4), 3.2)); A.add(el(64, 100, 46, 9, A.g("#ffe3b0", 0.3, 0.3), 2)); 
  A.add(`<path d="M20 104Q64 120 108 104" stroke="#a9733a" stroke-width="1.6" fill="none"/>`); A.add(dots([[26, 108], [44, 114], [64, 117], [84, 114], [102, 108]], 2.2, "#ffd24d"));
  for (const x of [34, 94]) A.add(o(`M${x - 2} 48H${x + 2}V98H${x - 2}Z`, A.g("#ffd24d", 0.5, 0.4, [0, 0, 1, 0]), 2));
  A.add(o("M60 40H68V100H60Z", A.g("#fff", 0.1, 0.3, [0, 0, 1, 0]), 2.6));
  A.add(`<g transform="translate(64 78)"><path d="M-14 8Q-14 -6 0 -10Q10 -12 12 -4L16 -8L16 4Q18 10 10 10L8 22H4L2 12H-6L-8 22H-12L-12 10Z" fill="${A.g("#f6f4ee", 0.2, 0.25)}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M-4 -10Q-10 -2 -6 6" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><circle cx="10" cy="-3" r="1.2" fill="${INK}"/></g>`);
  A.add(o("M6 48L64 14L122 48Z", A.lin([[0, "#ff7a8a"], [1, "#d02a3e"]]), 3.2));
  A.add(`<path d="M64 14L34 48M64 14L50 48M64 14L78 48M64 14L94 48" stroke="#fff" stroke-width="7" opacity=".9" clip-path="none"/>`);
  A.add(`<path d="M6 48L64 14L122 48Z" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`);
  A.add(`<path d="M6 48Q14 56 22 48Q30 56 38 48Q46 56 54 48Q62 56 70 48Q78 56 86 48Q94 56 102 48Q110 56 122 48" fill="${A.g("#ffd24d")}" stroke="${INK}" stroke-width="2.4"/>`);
  A.add(ln("M24 42L58 22", "#fff", 0.6, 2));
  A.add(`<path d="M64 14V2" stroke="${INK}" stroke-width="2.6"/><path d="M64 2L78 6L64 10Z" fill="#4a8cff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`);
  A.add(dots([[22, 52], [50, 54], [78, 54], [106, 52]], 2, "#fff6c8"));
  A.add(A.spark(112, 22, 6, "#fff", "#d02a3e"));
  return { shadow: [64, 122, 54, 5, 0.3], sparkles: true };
}
