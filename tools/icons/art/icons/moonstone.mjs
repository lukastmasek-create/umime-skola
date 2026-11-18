// Měsíční kámen: perleťová koule s modrým adulárním leskem, krystaly na zlaté objímce, jemná záře.
import { INK, o, c, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="58" r="44" fill="#9ad4ff" fill-opacity=".28"/>`);
  A.add(o("M30 100Q64 90 98 100L104 114Q64 124 24 114Z", A.g("#ffd24d", 0.45, 0.45), 3.2)); A.add(`<path d="M34 104Q64 98 94 104" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/>`);
  A.add(c(64, 58, 40, A.rad([[0, "#ffffff"], [0.45, "#e6f0ff"], [0.8, "#9ab8f0"], [1, "#6a7ad0"]], 0.32, 0.26, 0.9), 3.4));
  A.add(`<path d="M30 70Q46 40 80 36" fill="none" stroke="#7fd0ff" stroke-opacity=".7" stroke-width="10" stroke-linecap="round"/>`);
  A.add(`<path d="M36 40Q44 28 58 24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".9"/>`);
  A.add(face(64, 62, 1, "#b0a0f0"));
  A.add(dots([[88, 48], [40, 82]], 1.6, "#fff", 0.9));
  A.add(A.spark(112, 20, 7, "#fff", "#6a7ad0")); A.add(A.spark(14, 28, 5.5, "#fff", "#6a7ad0")); A.add(A.spark(118, 96, 4.5, "#fff", "#6a7ad0"));
  return { shadow: [64, 122, 44, 4.5, 0.3], sparkles: true };
}
