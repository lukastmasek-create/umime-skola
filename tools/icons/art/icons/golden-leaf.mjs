// Zlatý list: kovový list s žilkováním, kapkami nektaru a poškrábaným okrajem, tvářička, stopka s listem.
import { INK, o, c, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(o("M64 4C100 26 112 62 96 92C88 108 74 116 64 118C54 116 40 108 32 92C16 62 28 26 64 4Z", A.lin([[0, "#fff0a0"], [0.5, "#ffc82e"], [1, "#c98a0a"]], [0.1, 0, 0.9, 1]), 3.6));
  A.add(`<path d="M64 14V112M64 36Q48 40 38 52M64 36Q80 40 90 52M64 58Q46 62 38 76M64 58Q82 62 90 76M64 80Q52 84 46 94M64 80Q76 84 82 94" fill="none" stroke="#a5620c" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>`);
  A.add(`<path d="M64 14V112" stroke="#fff3b0" stroke-opacity=".6" stroke-width="1" transform="translate(1.4 0)"/>`);
  A.add(`<path d="M36 40Q44 20 64 10" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3.4" stroke-linecap="round"/>`);
  A.add(face(64, 72, 0.9, "#ff9a6a"));
  A.add(`<path d="M64 118V126" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>`);
  A.add(dots([[88, 66], [40, 90], [70, 98]], 1.6, "#fff6c8", 0.8));
  A.add(A.spark(110, 24, 7, "#fff", "#e8a21f")); A.add(A.spark(18, 70, 5.5, "#fff", "#e8a21f"));
  return { shadow: [64, 126, 30, 3.5, 0.3], sparkles: true };
}
