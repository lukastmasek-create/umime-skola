// Obchod: fialová nákupní taška se zlatou hvězdou, dvěma uchy, zesílenou hranou, švem a štítkem.
import { INK, o, c, rc, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M40 38V30Q40 8 64 8Q88 8 88 30V38" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M40 38V30Q40 8 64 8Q88 8 88 30V38" fill="none" stroke="${A.lin([[0, "#ffe27a"], [1, "#c98a1a"]])}" stroke-width="5" stroke-linecap="round"/>`);
  A.add(o("M18 40H110L118 116Q118 122 112 122H16Q10 122 10 116Z", A.lin([[0, "#b36bff"], [0.5, "#8a3fe0"], [1, "#5a22a8"]], [0, 0, 1, 0]), 3.4));
  A.add(`<path d="M18 40H110L111 52H17Z" fill="#fff" fill-opacity=".22"/><path d="M20 52H108" stroke="#2a0f5a" stroke-opacity=".4" stroke-width="2" stroke-dasharray="3 2.4"/>`);
  A.add(`<path d="M12 112H116" stroke="#2a0f5a" stroke-opacity=".35" stroke-width="2.4"/>`);
  A.add(c(40, 42, 3.2, "#fff6c8", 2)); A.add(c(88, 42, 3.2, "#fff6c8", 2));
  const S = starPts(64, 82, 23, 10);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" transform="translate(1 2.6)" fill="#2a0f5a" fill-opacity=".45"/><path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#ffe27a", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`);
  A.add(ln("M52 74L62 64", "#fff", 0.9, 2)); A.add(ln("M22 56V108", "#fff", 0.4, 3));
  A.add(`<path d="M96 52L104 66L112 52" fill="${A.g("#ffd24d")}" stroke="${INK}" stroke-width="2" stroke-linejoin="round" opacity="0"/>`);
  A.add(A.spark(18, 22, 6, "#fff", "#8a3fe0")); A.add(A.spark(112, 30, 5, "#fff", "#8a3fe0"));
  return { shadow: [64, 124, 52, 4.5, 0.3], sparkles: true };
}
