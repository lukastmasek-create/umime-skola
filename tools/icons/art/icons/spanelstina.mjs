// Španělština: akustická kytara s rozetou, hmatníkem, kobylkou a strunami, mušle maracas vedle.
import { INK, o, c, el, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<g transform="rotate(36 64 64)">` +
    o("M60 4H68V46H60Z", A.g("#6b3f1d", 0.3, 0.4, [0, 0, 1, 0]), 2.6) + rc(57, -4, 14, 12, 3, A.g("#3a2a1a"), 2.4) +
    dots([[60, 0], [68, 0], [60, 5], [68, 5]], 1.5, "#ffd24d") +
    `<path d="M64 8V86" stroke="#fff" stroke-opacity=".8" stroke-width=".9"/>` +
    `<path d="M60 12H68M60 20H68M60 28H68M60 36H68" stroke="#d8c8a0" stroke-width="1.2"/>` +
    o("M64 44C44 44 38 58 48 68C36 76 34 100 50 108C58 112 70 112 78 108C94 100 92 76 80 68C90 58 84 44 64 44Z", A.g("#e0883a", 0.45, 0.4, [0, 0, 1, 0.2]), 3.2) +
    c(64, 78, 9.5, "#2a1a10", 2.4) + `<circle cx="64" cy="78" r="12.5" fill="none" stroke="#fff3c8" stroke-width="1.8"/><circle cx="64" cy="78" r="14.8" fill="none" stroke="#5a3a1a" stroke-width="1.4" stroke-dasharray="2 2"/>` +
    rc(54, 94, 20, 5, 2, "#3a2a1a", 1.6) + `<path d="M64 8V96" stroke="#f6f0d8" stroke-width=".9"/>` + `<path d="M56 56Q50 66 54 72" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/></g>`);
  A.add(c(108, 86, 10, A.gr("#e5484d", 0.3, 0.3), 2.6)); A.add(`<path d="M102 84Q108 80 114 84M100 90Q108 86 116 90" stroke="#ffd24d" stroke-width="2.2" fill="none"/>`);
  A.add(o("M106 94L102 112H110L108 94Z", A.g("#c98a52"), 2.2));
  A.add(A.spark(18, 24, 6, "#fff", "#e5484d"));
  return { shadow: [64, 122, 46, 4.5, 0.3], sparkles: true };
}
