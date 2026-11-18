// Titul: zlatá medaile se zvýšenou hvězdou a vroubkovaným okrajem, stuha se šikmým pruhem a okem.
import { INK, polar, arc, starPts, shade, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M30 4H56L68 52L52 62Z", A.g("#e5484d", 0.45, 0.4), 2.8));
  A.add(o("M98 4H72L60 52L76 62Z", A.g("#3b6fe0", 0.45, 0.4), 2.8));
  A.add(ln("M36 8L55 50M92 8L72 50", "#fff", 0.45, 1.4));
  A.add(o("M52 60L64 54L76 60L64 68Z", A.g("#c9d0e8"), 2.4));
  const cx = 64, cy = 84;
  A.add(`<circle cx="${cx}" cy="${cy + 6}" r="35" fill="#8a5a08"/>`);
  A.add(c(cx, cy + 4, 35, A.g("#b8780f", 0.3, 0.5), 3));
  A.add(c(cx, cy, 35, A.gr("#ffd24d", 0.3, 0.25, 0.7, 0.45), 3));
  let t = ""; for (let i = 0; i < 56; i++) { const [a, b] = polar(cx, cy, 30.6, i * 360 / 56), [x, y] = polar(cx, cy, 33.6, i * 360 / 56); t += `M${a} ${b}L${x} ${y}`; }
  A.add(`<path d="${t}" stroke="#a5620c" stroke-opacity=".55" stroke-width=".9"/>`);
  A.add(c(cx, cy, 28, A.gr("#ffe27a", 0.35, 0.3, 0.5, 0.3), 1.6, 'stroke="#a5620c"'));
  A.add(ln(arc(cx, cy, 26.5, -10, 110), "#fff3b0", 0.85, 1.2));
  const S = starPts(cx, cy + 1, 19, 8.2), C = [cx, cy + 1];
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" transform="translate(1 2.6)" fill="#8a4f00" fill-opacity=".5"/>`);
  let f = ""; for (let i = 0; i < 10; i += 2) { const a = -90 + (i / 2) * 72; f += `<path d="M${C}L${S[i]}L${S[(i + 9) % 10]}Z" fill="${shade(a - 35, "#d98a12", "#fff1a0")}"/><path d="M${C}L${S[i]}L${S[i + 1]}Z" fill="${shade(a + 35, "#d98a12", "#fff1a0")}"/>`; }
  A.add(f);
  A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="none" stroke="${INK}" stroke-width="2.1" stroke-linejoin="round"/>`);
  A.add(ln(arc(cx, cy, 31, 205, 250), "#fff", 0.8, 2.2));
  A.add(`<circle cx="${cx}" cy="56" r="3" fill="${A.g("#ffd24d")}" stroke="${INK}" stroke-width="1.6"/>`);
  return { shadow: [64, 122, 32, 4.5, 0.32], sparkles: false };
}
