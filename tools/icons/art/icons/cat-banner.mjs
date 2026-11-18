// Vlajka: kovový stožár s kuličkou, vlající zelený prapor se zlatým lemem, hvězdou, záhyby a střapci.
import { INK, o, c, ln, polar, starPts, shade } from "../kit.mjs";
export default function (A) {
  A.add(`<ellipse cx="34" cy="116" rx="18" ry="5" fill="#000" fill-opacity=".18"/>`);
  A.add(o("M22 112Q22 106 28 106H44Q50 106 50 112V116H22Z", A.g("#8a95bb"), 2.8));
  A.add(o("M32 108V20H38V108Z", A.g("#d8def2", 0.4, 0.45, [0, 0, 1, 0]), 2.6));
  A.add(c(35, 14, 7, A.gr("#ffd24d", 0.3, 0.3), 2.6));
  const flag = "M38 20C56 12 70 30 88 22S110 20 118 24V74C108 78 98 66 86 74S56 84 38 74Z";
  A.add(`<path d="${flag}" transform="translate(0 4)" fill="#0b4a2c" fill-opacity=".4"/>`);
  A.add(o(flag, A.lin([[0, "#4ee08e"], [0.5, "#26b86a"], [1, "#12804a"]], [0, 0, 1, 0.3]), 3));
  A.add(`<path d="M38 20C56 12 70 30 88 22S110 20 118 24" fill="none" stroke="#ffd24d" stroke-width="3" stroke-linecap="round" transform="translate(0 4)"/>`);
  A.add(`<path d="M38 74C56 84 70 66 86 74S102 78 110 74" fill="none" stroke="#ffd24d" stroke-width="3" stroke-linecap="round" transform="translate(0 -4)"/>`);
  A.add(`<path d="M58 22C60 40 56 58 60 78M92 24C96 40 90 56 94 72" fill="none" stroke="#0b4a2c" stroke-opacity=".22" stroke-width="5"/>`);
  const S = starPts(78, 48, 15, 6.6, 5, -90);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="#fff6c8" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" transform="rotate(-6 78 48)"/>`);
  A.add(ln("M70 41L76 36", "#fff", 0.9, 1.2));
  A.add(ln("M44 28C52 24 60 30 68 30", "#fff", 0.55, 1.6));
  return { shadow: [60, 120, 40, 4.5, 0.3], sparkles: false };
}
