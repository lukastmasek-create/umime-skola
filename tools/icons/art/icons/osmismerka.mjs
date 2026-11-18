// Osmisměrka: mřížka písmen s vyznačeným diagonálním slovem (zlatá kapsle) a lupou.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(8, 12, 98, 98, 8, A.g("#fffaf0", 0.2, 0.2), 3.4));
  A.add(`<path d="M20 22L92 94" stroke="${INK}" stroke-width="20" stroke-opacity=".9" stroke-linecap="round"/><path d="M20 22L92 94" stroke="${A.lin([[0, "#ffe27a"], [1, "#ffb02e"]])}" stroke-width="15" stroke-linecap="round" />`);
  const L = "OSMIZATYQELKNRUF".split("");
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) A.add(`<text x="${24 + k * 22}" y="${36 + r * 22}" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="800" font-size="15" fill="#2a3166">${L[r * 4 + k]}</text>`);
  for (let i = 0; i < 4; i++) A.add(`<text x="${24 + i * 22}" y="${36 + i * 22}" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="15" fill="#2a3166">${"OSMZ"[i]}</text>`);
  A.add(`<g transform="translate(88 86)">` + o("M10 14L26 30", "none", 9) + `<path d="M10 14L26 30" stroke="${A.lin([[0, "#c98a52"], [1, "#6b3f1d"]])}" stroke-width="5" stroke-linecap="round"/>` + c(0, 0, 16, "#bfe6ff", 3, 'fill-opacity=".35"') + c(0, 0, 16, A.lin([[0, "#ffffff"], [1, "#4a9fe0"]], [0, 0, 1, 1]), 0, 'fill-opacity=".25" stroke="none"') + `<circle r="12.5" fill="none" stroke="#ffd24d" stroke-width="2.4"/><path d="M-8 -6Q-4 -10 2 -10" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`);
  A.add(A.spark(112, 22, 6, "#fff", "#e8a21f"));
  return { shadow: [60, 123, 48, 4.5, 0.3], sparkles: true };
}
