// Pravda / nepravda: zelená karta s fajfkou a červená s křížkem, překrývající se, každá s lesklou hranou a rohem.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<g transform="rotate(10 82 66)">` + rc(52, 22, 56, 80, 10, A.lin([[0, "#ff8a8a"], [1, "#c43e3e"]]), 3.4) + rc(56, 26, 48, 72, 6, "none", 1.4, 'stroke="#fff" stroke-opacity=".6"') + `<path d="M70 44L90 64M90 44L70 64" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M70 44L90 64M90 44L70 64" stroke="#fff" stroke-width="6.4" stroke-linecap="round"/><path d="M62 30h14" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/><path d="M62 92h40" stroke="#7a1d25" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/></g>`);
  A.add(`<g transform="rotate(-10 46 66)">` + rc(18, 24, 56, 80, 10, A.lin([[0, "#7bf0b0"], [1, "#1f9d63"]]), 3.4) + rc(22, 28, 48, 72, 6, "none", 1.4, 'stroke="#fff" stroke-opacity=".6"') + `<path d="M31 62L42 74L62 48" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 62L42 74L62 48" fill="none" stroke="#fff" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 32h14" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/><path d="M28 94h40" stroke="#0f5b38" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/></g>`);
  A.add(A.spark(110, 16, 6, "#fff", "#1f9d63"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
