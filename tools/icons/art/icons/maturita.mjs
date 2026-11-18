// Maturita: zlatá rozeta s hvězdou, dvojitým věncem, stuhami a absolventskými čepicemi.
import { INK, o, c, rc, ln, dots, polar, starPts } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="64" r="58" fill="#ffd24d" fill-opacity=".14"/><ellipse cx="64" cy="118" rx="40" ry="5" fill="#1b1a3a" fill-opacity=".2"/>`);
  A.add(o("M44 74L32 122L50 112L58 124L66 80Z", A.g("#e5484d", 0.4, 0.4), 2.6)); A.add(o("M84 74L96 122L78 112L70 124L62 80Z", A.g("#3b6fe0", 0.4, 0.4), 2.6));
  let d = ""; for (let i = 0; i < 48; i++) { const [x, y] = polar(64, 52, i % 2 ? 40 : 46, i * 7.5); d += `${i ? "L" : "M"}${x} ${y}`; }
  A.add(o(d + "Z", A.gr("#ffd24d", 0.3, 0.25, 0.6, 0.4), 3));
  A.add(c(64, 52, 36, A.gr("#ffe27a", 0.3, 0.25, 0.5, 0.3), 2.2, 'stroke="#a5620c"'));
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const a = 90 + s * (20 + i * 16), [x, y] = polar(64, 52, 30, a); A.add(`<ellipse cx="${x}" cy="${y}" rx="2" ry="4" transform="rotate(${a + 90} ${x} ${y})" fill="#6fe0a0" stroke="#17624a" stroke-width=".9"/>`); }
  const S = starPts(64, 52, 17, 7.4);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" transform="translate(1 2)" fill="#8a4f00" fill-opacity=".45"/><path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="${A.g("#fff0a0", 0.3, 0.3)}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  const cap = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-12 2L0 -4L12 2L0 8Z" fill="${A.g("#2a3166", 0.4, 0.3)}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M-6 6V12Q0 15 6 12V6" fill="#1f234c" stroke="${INK}" stroke-width="1.6"/><path d="M10 3V11" stroke="#ffd24d" stroke-width="1.8"/></g>`;
  A.add(cap(14, 14, -14) + cap(114, 14, 14));
  A.add(ln("M32 30Q40 18 56 14", "#fff", 0.7, 2.6));
  return { still: true };
}
