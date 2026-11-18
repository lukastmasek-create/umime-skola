// Kalkulačka: kovové tělo se šrouby, solární panel, LCD s číslem π, tlačítka s gravírováním, zlatý rovnítkový klíč.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(24, 14, 80, 106, 12, A.lin([[0, "#7a8bff"], [0.5, "#4a63d8"], [1, "#2b3a96"]]), 3.4));
  A.add(ln("M32 22H92", "#fff", 0.45, 2));
  A.add(dots([[31, 21], [97, 21], [31, 112], [97, 112]], 1.5, "#c9d4ff", 0.9));
  A.add(rc(32, 26, 24, 8, 2, A.lin([[0, "#3a2a1a"], [1, "#6b4a2a"]]), 1.6));
  for (let i = 0; i < 4; i++) A.add(`<rect x="${34 + i * 5.4}" y="28" width="4" height="4" fill="#2a1a0a" opacity=".7"/>`);
  A.add(rc(32, 38, 64, 28, 5, A.lin([[0, "#c9ffe6"], [1, "#8fd9b8"]]), 2.6));
  A.add(`<path d="M34 41H94" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/>`);
  A.add(`<text x="91" y="61" text-anchor="end" font-family="Onest,Arial,sans-serif" font-weight="800" font-size="20" fill="#1c6a4a">3,14</text>`);
  A.add(`<text x="37" y="47" font-family="Arial,sans-serif" font-weight="700" font-size="7" fill="#1c6a4a" opacity=".6">π</text>`);
  const keys = [["7", 0], ["8", 0], ["9", 0], ["÷", 1], ["4", 0], ["5", 0], ["6", 0], ["×", 1], ["1", 0], ["2", 0], ["3", 0], ["−", 1]];
  keys.forEach(([t, op], i) => {
    const x = 32 + (i % 4) * 16.4, y = 72 + Math.floor(i / 4) * 14;
    A.add(rc(x, y + 1.6, 14, 11, 3.2, "#8f9ab8", 1.4));
    A.add(rc(x, y, 14, 11, 3.2, op ? A.g("#ffd24d", 0.5, 0.35) : A.g("#eef1ff", 0.5, 0.3), 1.8));
    A.add(`<text x="${x + 7}" y="${y + 8.4}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="8" fill="#2a3166">${t}</text>`);
  });
  A.add(rc(32, 114, 14, 4, 2, A.g("#eef1ff"), 1.2)); 
  A.add(rc(48, 110, 48, 4, 2, "none", 0));
  A.add(A.spark(110, 18, 6, "#fff", "#4a63d8"));
  return { shadow: [64, 122, 40, 4.5, 0.32], sparkles: true };
}
