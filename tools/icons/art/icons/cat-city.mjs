// Město: domek s taškovou střechou, komínem s kouřem, okny s okenicemi, dveřmi, trávníkem a plotem.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M8 100Q64 86 120 100L112 118H16Z", A.g("#46c46e", 0.3, 0.45), 3));
  A.add(ln("M14 104Q64 92 114 104", "#c9ffd8", 0.7, 1.6));
  A.add(rc(30, 52, 68, 52, 3, A.g("#ffe3b0", 0.4, 0.3, [0, 0, 1, 0]), 3));
  A.add(`<path d="M34 56h60M34 66h60M34 76h60M34 86h60M34 96h60" stroke="#c9996a" stroke-opacity=".28" stroke-width="1"/>`);
  A.add(rc(76, 22, 12, 24, 1.5, A.g("#c4533f"), 2.6)); A.add(rc(74, 20, 16, 6, 1.5, A.g("#8a8f9e"), 2.2));
  A.add(`<circle cx="84" cy="12" r="5" fill="#fff" stroke="${INK}" stroke-width="1.6" opacity=".9"/><circle cx="92" cy="5" r="3.6" fill="#fff" stroke="${INK}" stroke-width="1.4" opacity=".8"/>`);
  A.add(o("M18 56L64 18L110 56Z", A.g("#e5484d", 0.4, 0.45), 3.2));
  let t = ""; for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) t += `M${40 + r * 7 + i * 10 - 2} ${46 - r * 10}q5 6 10 0`;
  A.add(`<path d="${t}" fill="none" stroke="#7a1d25" stroke-opacity=".5" stroke-width="1.3"/>`);
  A.add(ln("M24 54L62 22", "#fff", 0.55, 1.8));
  A.add(c(64, 40, 6, A.g("#fff6c8"), 2.4)); A.add(ln("M64 34v12M58 40h12", INK, 0.7, 1.2));
  A.add(rc(36, 64, 18, 18, 2, A.lin([[0, "#9fe0ff"], [1, "#4a9fe0"]]), 2.6)); A.add(ln("M45 64v18M36 73h18", INK, 0.8, 1.6)); A.add(ln("M39 67l6 5", "#fff", 0.8, 1.4));
  A.add(rc(30, 63, 5, 20, 1, "#2e9f5a", 1.8)); A.add(rc(55, 63, 5, 20, 1, "#2e9f5a", 1.8));
  A.add(o("M70 104V74Q70 64 78 64Q86 64 86 74V104Z", A.g("#8a5a2b", 0.3, 0.4), 2.8)); A.add(dots([[82, 86]], 1.6, "#ffd24d"));
  A.add(`<path d="M90 98h22M90 106h22" stroke="${INK}" stroke-width="2"/>`);
  for (const x of [92, 100, 108]) A.add(rc(x - 1.5, 94, 3, 16, 1, A.g("#fff"), 1.4));
  A.add(dots([[26, 108], [110, 112]], 3, "#ff7a9a"));
  return { shadow: [64, 121, 50, 5, 0.3], sparkles: false };
}
