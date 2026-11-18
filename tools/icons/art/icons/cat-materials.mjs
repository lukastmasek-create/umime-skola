// Materiály: kus rudy se třemi krystaly, zlatým ingotem a nugetem.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M10 108L18 84L38 74L62 80L90 70L112 84L118 108Z", A.g("#6b7390", 0.4, 0.5), 3.2));
  A.add(`<path d="M18 84L38 74L40 90Z M62 80L90 70L84 92Z" fill="#fff" fill-opacity=".2"/><path d="M40 90L62 80L60 108H20Z" fill="#000" fill-opacity=".12"/>`);
  A.add(dots([[32, 98], [52, 96], [100, 96], [78, 104]], 1.6, "#2a3166", 0.45));
  const cry = (pts, base) => o(`M${pts.map((p) => p.join(" ")).join("L")}Z`, A.g(base, 0.6, 0.45), 2.6);
  A.add(cry([[44, 78], [50, 38], [62, 30], [70, 44], [70, 78]], "#3b9dff") + `<path d="M50 38L62 30L58 78H44Z" fill="#fff" fill-opacity=".28"/>` + ln("M52 44L52 70", "#fff", 0.8, 1.6));
  A.add(cry([[64, 78], [74, 22], [86, 14], [94, 32], [90, 78]], "#6bd6ff") + `<path d="M74 22L86 14L84 78H64Z" fill="#fff" fill-opacity=".3"/>` + ln("M78 28L78 66", "#fff", 0.85, 1.6));
  A.add(cry([[26, 80], [30, 56], [38, 52], [42, 62], [42, 80]], "#9a7bff") + ln("M32 60V74", "#fff", 0.8, 1.4));
  A.add(o("M82 108L88 94H116L120 108Z", A.g("#ffd24d", 0.5, 0.45), 2.6)); A.add(o("M88 94L92 88H112L116 94Z", A.g("#fff0a0", 0.3, 0.2), 2)); A.add(ln("M94 99H112", "#fff", 0.7, 1.6));
  A.add(o("M18 112Q14 104 22 102Q30 100 34 106Q36 114 28 116Z", A.g("#ffd24d", 0.55, 0.4), 2.4)); A.add(ln("M22 106Q26 104 29 107", "#fff", 0.85, 1.4));
  A.add(A.spark(108, 36, 7, "#fff", "#3b7cff"));
  return { shadow: [64, 121, 52, 5, 0.3], sparkles: true };
}
