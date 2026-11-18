// Angličtina: věž s hodinami (Big Ben) a řečová bublina „Hi!“ s vlaječkou.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M30 112V50L38 40H62L70 50V112Z", A.g("#e8c98a", 0.4, 0.4, [0, 0, 1, 0]), 3));
  A.add(`<path d="M40 56v52M50 56v52M60 56v52" stroke="#a9833f" stroke-opacity=".5" stroke-width="1.2"/>`);
  for (const y of [88, 100]) A.add(o(`M38 ${y}h24v8H38Z`, A.g("#d9a85a"), 1.4));
  A.add(o("M32 40H68L50 6Z", A.g("#3b6fe0", 0.4, 0.45), 3)); A.add(ln("M40 36L50 14", "#fff", 0.6, 1.6)); A.add(c(50, 5, 3, A.gr("#ffd24d"), 1.6));
  A.add(c(50, 62, 14, A.g("#fff9e0", 0.3, 0.2), 3)); A.add(c(50, 62, 11, "none", 1, 'stroke="#a9833f"'));
  A.add(ln("M50 62V54M50 62L56 66", INK, 1, 2.2)); A.add(dots([[50, 52], [50, 72], [40, 62], [60, 62]], 1.1, INK));
  A.add(rc(26, 104, 48, 10, 2, A.g("#9aa6c8"), 2.4));
  A.add(o("M68 24H116Q122 24 122 30V62Q122 68 116 68H96L86 80V68H68Q62 68 62 62V30Q62 24 68 24Z", A.g("#fff", 0.1, 0.18), 3));
  A.add(ln("M70 30H108", "#fff", 0.9, 2));
  A.add(`<text x="92" y="53" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="800" font-size="22" fill="#2a4bd8">Hi!</text>`);
  A.add(rc(92, 84, 28, 20, 3, "#fff", 2.4, 'transform="rotate(6 106 94)"'));
  A.add(`<g transform="rotate(6 106 94)"><path d="M94 86h24v16H94Z" fill="#2a4bd8"/><path d="M94 94h24M106 86v16" stroke="#fff" stroke-width="5"/><path d="M94 94h24M106 86v16" stroke="#e5484d" stroke-width="2.6"/><rect x="92" y="84" width="28" height="20" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/></g>`);
  A.add(A.spark(18, 24, 6, "#fff", "#2a4bd8"));
  return { shadow: [64, 121, 50, 5, 0.3], sparkles: true };
}
