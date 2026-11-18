// Křížovka: mřížka s černými poli a písmeny, očíslované pole, tužka v rohu.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(10, 12, 92, 96, 7, A.g("#fffaf0", 0.2, 0.2), 3.4));
  const L = [["K", "O", "#", "T"], ["#", "L", "I", "#"], ["A", "E", "R", "#"], ["#", "#", "L", "A"]];
  const sz = 20;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const x = 16 + k * sz, y = 18 + r * (sz - 1.4), t = L[r][k];
    if (t === "#") A.add(`<rect x="${x}" y="${y}" width="${sz}" height="${sz - 1.4}" fill="${A.lin([[0, "#3a4274"], [1, "#1f234c"]])}" stroke="${INK}" stroke-width="1.4"/>`);
    else { A.add(`<rect x="${x}" y="${y}" width="${sz}" height="${sz - 1.4}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`); A.add(`<text x="${x + sz / 2}" y="${y + 15}" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="800" font-size="13" fill="#2a3166">${t}</text>`); } }
  A.add(`<text x="19" y="26" font-family="Arial,sans-serif" font-weight="700" font-size="6" fill="#e5484d">1</text><text x="59" y="26" font-family="Arial,sans-serif" font-weight="700" font-size="6" fill="#e5484d">2</text><text x="19" y="64" font-family="Arial,sans-serif" font-weight="700" font-size="6" fill="#e5484d">3</text>`);
  A.add(`<rect x="16" y="18" width="80" height="75" fill="none" stroke="${INK}" stroke-width="2.4"/>`);
  A.add(`<g transform="translate(-14 2) rotate(40 100 90)">` + o("M96 54H108V112H96Z", A.g("#ffd24d", 0.5, 0.35, [0, 0, 1, 0]), 2.8) + o("M96 112L102 126L108 112Z", A.g("#f3d6b0"), 2.4) + o("M96 46Q96 40 102 40Q108 40 108 46V54H96Z", A.g("#ff7a9a"), 2.6) + `</g>`);
  A.add(ln("M14 16H96", "#fff", 0.6, 1.4));
  A.add(A.spark(112, 20, 6, "#fff", "#2a4bd8"));
  return { shadow: [60, 123, 46, 4.5, 0.3], sparkles: true };
}
