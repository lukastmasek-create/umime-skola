// Milionář: zlatý žebřík výhry s kovovými příčkami a hvězdou, studiové světlo a jiskry na modrém pódiu.
import { INK, o, c, rc, el, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  A.add(el(64, 104, 54, 13, A.g("#3b4fb8", 0.4, 0.4), 3.2)); A.add(el(64, 100, 46, 9, A.g("#5b6fd8", 0.4, 0.3), 2)); A.add(dots([[24, 106], [44, 112], [84, 112], [104, 106]], 2.2, "#ffd24d"));
  for (let i = 0; i < 5; i++) { const w = 32 + i * 9, y = 92 - i * 16; A.add(rc(64 - w / 2, y, w, 13, 4, A.g(i === 4 ? "#ffd24d" : "#6b4de0", 0.45, 0.4), 2.8)); A.add(ln(`M${64 - w / 2 + 6} ${y + 4}H${64 + w / 2 - 6}`, "#fff", 0.5, 1.4)); A.add(`<text x="64" y="${y + 10.4}" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="9" fill="${i === 4 ? "#7a4a08" : "#fff"}">${["100", "1K", "10K", "100K", "1M"][i]}</text>`); }
  const S = starPts(64, 8, 9, 4);
  A.add(`<path d="${S.map((p, k) => `${k ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#fff6a8", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  A.add(`<path d="M30 100L18 62M98 100L110 62" stroke="#ffd24d" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"/>`);
  A.add(A.spark(14, 40, 6, "#fff", "#e8a21f")); A.add(A.spark(114, 30, 7, "#fff", "#e8a21f"));
  return { shadow: [64, 124, 54, 4.5, 0.3], sparkles: true };
}
