// Chemie: Erlenmeyerova baňka s jedovatě zelenou kapalinou, měřicími ryskami, bublinami, korkovou zátkou a výparem.
import { INK, o, c, ln, dots, el } from "../kit.mjs";
export default function (A) {
  const body = "M48 14H80V44L110 100Q116 114 102 114H26Q12 114 18 100L48 44Z";
  A.add(o(body, A.lin([[0, "#f4fbff"], [1, "#cfe8f6"]]), 3.2, 'fill-opacity=".85"'));
  const clip = A.clip(`<path d="${body}"/>`);
  A.add(`<g clip-path="${clip}"><path d="M10 78Q30 70 50 78T90 78T120 76V120H10Z" fill="${A.lin([[0, "#8aff9c"], [0.6, "#2fd37a"], [1, "#12905a"]])}"/><path d="M10 78Q30 70 50 78T90 78T120 76" fill="none" stroke="#d6ffe0" stroke-width="2.4" opacity=".9"/><path d="M20 100H110" stroke="#0b5a38" stroke-opacity=".3" stroke-width="6"/></g>`);
  A.add(dots([[50, 96], [66, 88], [78, 100], [60, 104]], 4.2, "#d6ffe0", 0.8)); A.add(dots([[50, 96], [66, 88], [78, 100], [60, 104]], 4.2, "none"));
  A.add(`<g fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.6"><circle cx="50" cy="96" r="4.2"/><circle cx="66" cy="88" r="3"/><circle cx="78" cy="100" r="3.4"/></g>`);
  A.add(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`);
  A.add(`<path d="M30 92L38 78M24 100L33 86" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>`);
  A.add(ln("M52 20V42L30 82", "#fff", 0.85, 2.6));
  A.add(o("M44 14H84V10Q84 8 82 8H46Q44 8 44 10Z", A.g("#fff"), 2.4));
  A.add(o("M52 8H76L74 -2H54Z", A.g("#c98a52", 0.4, 0.3), 2.4)); A.add(ln("M56 2h16", "#7a4f26", 0.5, 1.2));
  A.add(`<g fill="${A.lin([[0, "#d6ffe0"], [1, "#86e6a8"]])}" opacity=".8"><circle cx="86" cy="12" r="4"/><circle cx="96" cy="4" r="3"/></g>`);
  A.add(A.spark(14, 40, 6, "#fff", "#2fd37a"));
  return { shadow: [64, 122, 48, 5, 0.3], sparkles: true };
}
