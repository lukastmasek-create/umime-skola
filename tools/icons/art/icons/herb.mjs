// Bylina: stonek s lístky v protilehlých párech, drobné fialové květy, nať s odleskem a kořenová hlíza.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M44 112Q64 98 84 112L78 122H50Z", A.g("#8a5a2b", 0.3, 0.45), 2.8));
  A.add(`<path d="M64 112V16" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M64 112V16" stroke="#3fae5a" stroke-width="3.4" stroke-linecap="round"/>`);
  const leaf = (x, y, rot, s = 1) => o(`M0 0C8 -10 22 -10 30 0C22 10 8 10 0 0Z`, A.g("#6bd98a", 0.4, 0.4, [0, 0, 1, 1]), 2.6, `transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"`) + `<path d="M2 0H26" stroke="#1f6a3a" stroke-opacity=".6" stroke-width="1.2" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"/>`;
  A.add(leaf(64, 96, -30, 1.3) + leaf(64, 96, -150, 1.3) + leaf(64, 74, -34, 1.2) + leaf(64, 74, -146, 1.2) + leaf(64, 52, -38, 1) + leaf(64, 52, -142, 1));
  for (const [x, y] of [[64, 16], [54, 26], [74, 26]]) { for (let i = 0; i < 5; i++) { const a = i * 72 - 90; A.add(`<ellipse cx="${x + Math.cos(a * Math.PI / 180) * 4.6}" cy="${y + Math.sin(a * Math.PI / 180) * 4.6}" rx="3.2" ry="3.2" fill="#c9a0ff" stroke="${INK}" stroke-width="1.4"/>`); } A.add(c(x, y, 2.2, "#ffd24d", 1)); }
  A.add(ln("M40 90Q46 82 56 82", "#fff", 0.6, 1.6)); A.add(ln("M70 66Q80 58 88 60", "#fff", 0.5, 1.4));
  A.add(A.spark(110, 30, 6, "#fff", "#3fae5a")); A.add(A.spark(18, 46, 5, "#fff", "#3fae5a"));
  return { shadow: [64, 123, 40, 4.5, 0.3], sparkles: true };
}
