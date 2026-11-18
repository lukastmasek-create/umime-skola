// Přírodopis: muchomůrka s puntíky, lupenovou hlízou a stonkem, mechem, mini houbičkou a berušku.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M10 112Q30 98 64 102Q98 98 118 112Q100 122 64 120Q28 122 10 112Z", A.g("#46c46e", 0.3, 0.5), 3));
  A.add(o("M50 66Q46 100 40 108H88Q82 100 78 66Z", A.g("#fff3de", 0.2, 0.3, [0, 0, 1, 0]), 3.2));
  A.add(`<path d="M52 80Q64 86 76 80M50 92Q64 98 78 92" fill="none" stroke="#c9a87a" stroke-width="1.6"/>`);
  A.add(o("M46 70Q64 78 82 70L80 62Q64 70 48 62Z", A.g("#fff"), 2.4));
  A.add(o("M8 66Q6 22 64 14Q122 22 120 66Q108 78 64 76Q20 78 8 66Z", A.g("#e5484d", 0.4, 0.45, [0, 0, 1, 0.3]), 3.4));
  A.add(`<path d="M16 68Q64 76 112 68" fill="none" stroke="#7a1d25" stroke-opacity=".4" stroke-width="2"/><path d="M30 70L34 76M48 74L50 78M64 76V80M80 74L78 78M98 70L94 76" stroke="#fff6d6" stroke-opacity=".8" stroke-width="1.4"/>`);
  for (const [x, y, rr] of [[36, 44, 8], [66, 30, 9.5], [90, 48, 7.4], [52, 58, 5.2], [100, 64, 4.4], [20, 62, 4]]) { A.add(`<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * .82}" fill="#fff6e0" stroke="#d9b8a0" stroke-width="1.2"/>`); A.add(`<ellipse cx="${x - rr * .3}" cy="${y - rr * .3}" rx="${rr * .3}" ry="${rr * .22}" fill="#fff"/>`); }
  A.add(ln("M18 52Q22 36 38 26", "#fff", 0.6, 3));
  A.add(o("M100 108Q104 96 112 98Q120 100 118 108Z", A.g("#e5484d"), 1.8)); A.add(dots([[108, 102]], 1.4, "#fff6d6")); A.add(ln("M106 108V112", INK, 1, 1.6));
  A.add(c(24, 106, 4.4, A.gr("#ff5a5a"), 1.8)); A.add(`<path d="M24 102v8" stroke="${INK}" stroke-width="1.2"/>`); A.add(dots([[22, 105], [26, 108]], .9, INK));
  A.add(A.spark(112, 28, 6, "#fff", "#e5484d"));
  return { shadow: [64, 122, 52, 4.5, 0.3], sparkles: true };
}
