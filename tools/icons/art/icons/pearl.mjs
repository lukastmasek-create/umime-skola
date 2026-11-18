// Perla: lesklá perla v otevřené lasturě s vnitřní perletí a vroubkovaným okrajem, tvářička.
import { INK, o, c, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(o("M8 76C8 106 36 122 64 122C92 122 120 106 120 76Z", A.lin([[0, "#ffd0e0"], [1, "#e07a9a"]]), 3.4));
  for (let i = -5; i <= 5; i++) A.add(`<path d="M${64 + i * 4} 120Q${64 + i * 8} 98 ${64 + i * 10.6} 80" fill="none" stroke="#a5405a" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>`);
  A.add(o("M8 76C10 44 36 24 64 24C92 24 118 44 120 76Q92 90 64 90Q36 90 8 76Z", A.lin([[0, "#fff6fa"], [0.5, "#f4d0e6"], [1, "#c9a0e6"]], [0, 0, 1, 1]), 3.4));
  A.add(`<path d="M18 74Q64 98 110 74" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><path d="M30 56Q40 38 62 34M98 52Q92 40 82 36" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>`);
  A.add(c(64, 72, 25, A.rad([[0, "#ffffff"], [0.5, "#f4e8f8"], [1, "#b0a0d8"]], 0.32, 0.28, 0.85), 3.2));
  A.add(`<path d="M44 64Q50 52 62 50" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`);
  A.add(face(64, 76, 0.9, "#ff9ab0"));
  A.add(`<path d="M40 82Q64 92 88 82" fill="none" stroke="#c9a0e6" stroke-opacity=".5" stroke-width="3"/>`);
  A.add(A.spark(108, 22, 6.5, "#fff", "#a07ae0")); A.add(A.spark(18, 30, 5, "#fff", "#a07ae0"));
  return { shadow: [64, 123, 52, 4.5, 0.3], sparkles: true };
}
