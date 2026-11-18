// Vánoční strom: tři patra větví s lesklými koulemi, řetězem světel, hvězdou na špičce, dárky pod stromem.
import { INK, o, c, rc, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  A.add(rc(54, 96, 20, 14, 3, A.g("#8a5a2b", 0.35, 0.4, [0, 0, 1, 0]), 2.8));
  const tier = (y, w, h, base) => { A.add(o(`M${64 - w} ${y + h}L64 ${y}L${64 + w} ${y + h}Q64 ${y + h + 8} ${64 - w} ${y + h}Z`, A.g(base, 0.4, 0.45, [0, 0, 1, 0.3]), 3.2)); A.add(`<path d="M${64 - w + 4} ${y + h - 2}Q${64 - w / 2} ${y + h + 4} 64 ${y + h - 2}T${64 + w - 4} ${y + h - 2}" fill="none" stroke="#0f5b38" stroke-opacity=".45" stroke-width="1.6"/>`); A.add(ln(`M${64 - 4} ${y + 6}L${64 - w / 2 - 2} ${y + h - 6}`, "#fff", 0.4, 1.6)); };
  tier(52, 38, 50, "#1f9d63"); tier(32, 30, 40, "#2fb06a"); tier(14, 22, 32, "#46c46e");
  A.add(`<path d="M44 40Q64 52 84 36M34 66Q64 82 96 62M26 92Q64 110 102 88" fill="none" stroke="#ffd24d" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 5"/>`);
  for (const [x, y, col] of [[52, 46, "#e5484d"], [76, 56, "#4a8cff"], [44, 74, "#ffd24d"], [84, 82, "#b36bff"], [60, 90, "#e5484d"], [36, 90, "#4fd0ff"], [92, 70, "#ff9a3c"]]) { A.add(c(x, y, 5.4, A.gr(col, 0.3, 0.3, 0.6, 0.4), 2)); A.add(dots([[x - 1.6, y - 1.8]], 1.4, "#fff", 0.9)); }
  const S = starPts(64, 10, 11, 4.8);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#fff6a8", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  A.add(rc(86, 100, 18, 16, 3, A.g("#e5484d", 0.4, 0.4), 2.6)); A.add(`<path d="M95 100V116M86 108H104" stroke="#ffd24d" stroke-width="3"/>`);
  A.add(rc(22, 104, 16, 12, 3, A.g("#4a8cff", 0.4, 0.4), 2.6)); A.add(`<path d="M30 104V116M22 110H38" stroke="#fff" stroke-width="2.6"/>`);
  A.add(A.spark(16, 30, 5.5, "#fff", "#2fb06a")); A.add(A.spark(112, 40, 6, "#fff", "#2fb06a"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
