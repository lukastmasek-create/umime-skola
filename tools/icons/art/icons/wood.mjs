// Dřevo: poražený kmen s letokruhy na řezu, kůrou s žilkováním, suky, drobným výhonkem a tvářičkou.
import { INK, o, c, el, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(o("M18 36Q14 36 14 44V84Q14 92 18 92H92V36Z", A.lin([[0, "#c98a52"], [0.4, "#9a6030"], [1, "#6b3f1d"]]), 3.4));
  A.add(`<path d="M22 44H88M22 56Q50 52 88 58M22 68Q50 72 88 66M22 80H88" fill="none" stroke="#3a2010" stroke-opacity=".4" stroke-width="1.6" stroke-linecap="round"/>`);
  A.add(ln("M20 42H88", "#ffd9a8", 0.55, 2.4));
  A.add(o("M30 62Q34 56 40 58Q44 62 38 66Z", A.g("#6b3f1d", 0.2, 0.4), 1.6));
  A.add(el(92, 64, 22, 28, A.gr("#f0c98a", 0.4, 0.35, 0.45, 0.3), 3.4));
  for (const [rx, ry] of [[17, 22.5], [12, 16.5], [7, 10.5]]) A.add(`<ellipse cx="92" cy="64" rx="${rx}" ry="${ry}" fill="none" stroke="#a9733a" stroke-width="1.4" stroke-opacity=".8"/>`);
  A.add(el(92, 64, 2.6, 3.6, "#8a5a2b", 0)); A.add(`<path d="M92 64L110 60M92 64L100 82" stroke="#8a5a2b" stroke-opacity=".6" stroke-width="1.2"/>`);
  A.add(face(54, 62, 0.85, "#ff9ab0"));
  A.add(`<path d="M30 92Q28 104 20 108M56 92Q58 104 66 108" fill="none" stroke="${INK}" stroke-width="0"/>`);
  A.add(`<path d="M24 36Q22 28 28 26" stroke="${INK}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M24 36Q22 28 28 26" stroke="#46c46e" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  A.add(o("M28 26Q38 14 48 22Q40 32 28 26Z", A.g("#6bd98a", 0.4, 0.4), 2.2));
  A.add(ln("M82 44Q96 40 106 50", "#fff", 0.6, 2));
  return { shadow: [64, 98, 50, 4.5, 0.3], sparkles: false };
}
