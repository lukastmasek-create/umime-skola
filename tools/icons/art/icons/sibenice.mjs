// Oběšenec: dřevěná šibenice s příčnou vzpěrou, uzlem a lanem, písmenová cedulka A a kameny pod ní.
import { INK, o, c, rc, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M10 112H92L86 120H16Z", A.g("#8a5a2b", 0.4, 0.4), 3));
  A.add(o("M24 112V14H30V112Z", A.g("#c98a52", 0.45, 0.4, [0, 0, 1, 0]), 3)); A.add(o("M24 14H84V22H24Z", A.g("#c98a52", 0.5, 0.35), 3));
  A.add(o("M30 44L52 22V32L30 54Z", A.g("#b8743a"), 2.4)); A.add(dots([[27, 30], [27, 90], [56, 18]], 1.4, "#3a2010"));
  A.add(ln("M26 20V104", "#fff", 0.35, 1.4));
  A.add(`<path d="M72 22V44" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M72 22V44" stroke="#e8d0a0" stroke-width="3" stroke-linecap="round" stroke-dasharray="2.4 2"/>`);
  A.add(`<ellipse cx="72" cy="46" rx="7" ry="3.6" fill="none" stroke="${INK}" stroke-width="4.4"/><ellipse cx="72" cy="46" rx="7" ry="3.6" fill="none" stroke="#e8d0a0" stroke-width="2"/>`);
  A.add(rc(54, 52, 38, 38, 7, A.g("#fff3c8", 0.3, 0.3), 3.2, 'transform="rotate(-4 73 71)"'));
  A.add(`<text x="73" y="81" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="28" fill="#2a3166" transform="rotate(-4 73 71)">A</text>`);
  A.add(`<path d="M44 100H56M62 100H70M76 100H88" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><path d="M44 100H56M62 100H70" stroke="#fff" stroke-width="1.2" opacity=".7"/>`);
  A.add(el(100, 112, 8, 4, A.g("#9aa6c8"), 2.2)); A.add(el(110, 114, 5, 3, A.g("#8a95bb"), 2));
  A.add(A.spark(104, 36, 6, "#fff", "#e8a21f"));
  return { shadow: [56, 123, 52, 4.5, 0.3], sparkles: true };
}
