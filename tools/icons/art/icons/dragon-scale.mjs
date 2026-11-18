// Dračí šupina: velká zelená šupina se žebry, hřebenem, kovovým leskem a drobnými šupinkami na okraji, tvářička.
import { INK, o, c, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(o("M64 6C100 14 116 42 108 76C102 100 80 116 64 122C48 116 26 100 20 76C12 42 28 14 64 6Z", A.gr("#2fb06a", 0.3, 0.25, 0.55, 0.5), 3.6));
  A.add(o("M64 18C92 26 104 48 98 74C92 94 76 106 64 110C52 106 36 94 30 74C24 48 36 26 64 18Z", A.gr("#4cd88a", 0.3, 0.25, 0.5, 0.35), 2));
  A.add(`<path d="M64 18V108M64 40Q44 46 34 62M64 40Q84 46 94 62M64 64Q48 70 40 84M64 64Q80 70 88 84" fill="none" stroke="#0f6a3e" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>`);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const x = 64 + (k - (3 - r) / 2) * 16, y = 78 + r * 10; A.add(`<path d="M${x - 7} ${y}Q${x} ${y + 12} ${x + 7} ${y}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.4"/>`); }
  A.add(o("M64 6L58 -2L64 2L70 -2Z", A.g("#ffd24d"), 1.8));
  A.add(`<path d="M34 34Q46 20 62 18" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3.4" stroke-linecap="round"/>`);
  A.add(face(64, 56, 1, "#ff9ab0"));
  A.add(A.spark(108, 24, 6.5, "#fff", "#2fb06a")); A.add(A.spark(18, 96, 5, "#fff", "#2fb06a"));
  return { shadow: [64, 123, 42, 4.5, 0.3], sparkles: true };
}
