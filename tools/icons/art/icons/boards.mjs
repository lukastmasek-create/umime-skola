// Žebříčky: zlatý pohár s uchy, gravírovanou hvězdou, podstavcem a destičkou, stuhou a odleskem.
import { INK, o, c, rc, el, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M34 24H22Q14 24 14 34Q14 52 38 56M94 24H106Q114 24 114 34Q114 52 90 56" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M34 24H22Q14 24 14 34Q14 52 38 56M94 24H106Q114 24 114 34Q114 52 90 56" fill="none" stroke="${A.lin([[0, "#ffe27a"], [1, "#c98a1a"]])}" stroke-width="5" stroke-linecap="round"/>`);
  A.add(o("M32 10H96V44Q96 72 64 78Q32 72 32 44Z", A.g("#ffd24d", 0.5, 0.45, [0, 0, 1, 0]), 3.4));
  A.add(el(64, 10, 32, 6, A.g("#ffe27a"), 3)); A.add(el(64, 10, 26, 3.4, "#a5620c", 0, 'opacity=".6"'));
  const S = starPts(64, 40, 15, 6.6);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" transform="translate(1 2)" fill="#8a4f00" fill-opacity=".45"/><path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#fff6c0", 0.2, 0.3)}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  A.add(ln("M38 18Q36 36 44 54", "#fff", 0.85, 3.4)); A.add(ln("M40 14L40 14", "#fff", 0.9, 3));
  A.add(`<path d="M32 50Q64 64 96 50" fill="none" stroke="#a5620c" stroke-opacity=".4" stroke-width="2"/>`);
  A.add(o("M56 76H72L74 92H54Z", A.g("#e0a21f", 0.4, 0.4, [0, 0, 1, 0]), 2.8)); A.add(el(64, 92, 12, 3, A.g("#ffd24d"), 2.2));
  A.add(rc(32, 96, 64, 12, 3, A.g("#5b6fd8", 0.4, 0.4), 3)); A.add(rc(24, 106, 80, 12, 3, A.g("#3b4fb8", 0.35, 0.45), 3));
  A.add(rc(52, 98, 24, 8, 1.6, A.g("#ffe27a"), 1.6)); A.add(`<path d="M56 102h16" stroke="#a5620c" stroke-width="1.4" stroke-linecap="round"/>`);
  A.add(dots([[30, 112], [98, 112]], 1.8, "#9ab0ff"));
  A.add(A.spark(112, 14, 6.5, "#fff", "#e8a21f")); A.add(A.spark(14, 70, 5, "#fff", "#e8a21f"));
  return { shadow: [64, 122, 46, 5, 0.3], sparkles: true };
}
