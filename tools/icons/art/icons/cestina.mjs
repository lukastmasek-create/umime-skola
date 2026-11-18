// Čeština: sešit s kroužkovou vazbou, písmeny Aa s háčkem a podtržením, červené pero.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(rc(24, 14, 74, 100, 8, A.lin([[0, "#c43e3e"], [1, "#8c2424"]]), 3.2));
  A.add(rc(30, 14, 68, 100, 6, A.g("#fffaf0", 0.2, 0.18, [0, 0, 1, 0]), 3));
  A.add(`<path d="M38 44H90M38 56H90M38 68H90M38 80H90M38 92H90" stroke="#8fb4ff" stroke-width="1.2"/><path d="M44 20V108" stroke="#ff9aa8" stroke-width="1.3"/>`);
  for (let i = 0; i < 6; i++) A.add(rc(18, 22 + i * 15, 18, 6, 3, A.g("#c9d0e8"), 2));
  A.add(`<text x="68" y="52" text-anchor="middle" font-family="Georgia,Onest,serif" font-weight="800" font-size="30" fill="#c43e3e">Aa</text>`);
  A.add(`<path d="M52 24l4-5 4 5" fill="none" stroke="#c43e3e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -0)"/>`);
  A.add(`<path d="M50 60Q64 66 90 58" fill="none" stroke="#c43e3e" stroke-width="2" stroke-linecap="round"/>`);
  A.add(`<path d="M50 84Q60 80 66 84T78 84T90 82" fill="none" stroke="#2a4bd8" stroke-width="2" stroke-linecap="round" opacity=".8"/>`);
  A.add(o("M78 112L100 32L110 36L92 116Z", A.g("#ffd24d", 0.5, 0.35), 2.8));
  A.add(o("M78 112L74 122L86 116Z", A.g("#f3d6b0"), 2)); A.add(`<path d="M74 122L76 118L80 119Z" fill="${INK}"/>`);
  A.add(o("M100 32L110 36L112 28Q108 22 102 26Z", A.g("#ff7a9a"), 2.4)); A.add(ln("M96 48L90 100", "#fff", 0.7, 1.6));
  return { shadow: [64, 123, 46, 4.5, 0.3], sparkles: false };
}
