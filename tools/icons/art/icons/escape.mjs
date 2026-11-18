// Únik: visací zámek s mosazným tělem, otvorem na klíč s hlubokým stínem, kruhovou klíčovou dírkou a klíčem.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M34 54V36Q34 12 62 12Q90 12 90 36V54" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M34 54V36Q34 12 62 12Q90 12 90 36V54" fill="none" stroke="${A.lin([[0, "#f0f3ff"], [1, "#8a95bb"]], [0, 0, 1, 0])}" stroke-width="8" stroke-linecap="round"/>`);
  A.add(`<path d="M42 40Q44 22 62 20" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`);
  A.add(rc(20, 52, 84, 62, 12, A.lin([[0, "#ffe27a"], [0.5, "#e8a21f"], [1, "#a5620c"]]), 3.4));
  A.add(rc(26, 58, 72, 50, 8, "none", 1.6, 'stroke="#fff3b0" stroke-opacity=".6"'));
  A.add(dots([[30, 62], [94, 62], [30, 104], [94, 104]], 2.2, "#7a4a08")); A.add(dots([[29.4, 61.4], [93.4, 61.4]], .8, "#fff3b0"));
  A.add(c(62, 78, 11, "#3a1f06", 2.6)); A.add(o("M57 84L62 98L67 84Z", "#3a1f06", 2)); A.add(c(62, 78, 11, "none", 1.4, 'stroke="#fff3b0" stroke-opacity=".5" transform="translate(0 .8)"'));
  A.add(ln("M28 66V100", "#fff", 0.55, 3));
  A.add(`<g transform="translate(78 94) rotate(-34)">` + c(0, 0, 9, "none", 4.6, 'stroke="#1f234c"') + c(0, 0, 9, "none", 2.4, `stroke="#d8def2"`) + o("M8 -3H44V3H8Z", A.g("#d8def2", 0.4, 0.45, [0, 0, 0, 1]), 2.4) + o("M34 3H40V12H34ZM42 3H46V10H42Z", A.g("#d8def2"), 2) + `</g>`);
  A.add(A.spark(112, 24, 6, "#fff", "#e8a21f"));
  return { shadow: [60, 122, 46, 4.5, 0.3], sparkles: true };
}
