// Odznak: stříbrno-modrý rytý medailon s rubínem a hvězdou, dvě stuhy se švem, laurový věnec.
import { INK, LINE, polar, arc, starPts, o, c, ln, dots, sh } from "../kit.mjs";
export default function (A) {
  const cx = 64, cy = 54;
  const rib1 = A.g("#e5484d", 0.5, 0.4), rib2 = A.g("#c7343e", 0.45, 0.4);
  A.add(o("M40 70L28 118L46 108L56 122L62 80Z", rib1, 2.8));
  A.add(o("M88 70L100 118L82 108L72 122L66 80Z", rib2, 2.8));
  A.add(ln("M43 80L35 108M85 80L93 108", "#fff", 0.5, 1.4));
  A.add(`<path d="M46 98l7 8M82 98l-7 8" stroke="#7a1d25" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="2 2.4" fill="none"/>`);
  // zubatý okraj medailonu (24 zubů)
  let d = "";
  for (let i = 0; i < 48; i++) { const [x, y] = polar(cx, cy, i % 2 ? 41 : 46, (i * 7.5) - 90); d += `${i ? "L" : "M"}${x} ${y}`; }
  A.add(o(d + "Z", A.gr("#c9d4f5", 0.3, 0.25), LINE));
  A.add(c(cx, cy, 38, A.gr("#4a63e8", 0.3, 0.25, 0.55, 0.5), 2.6));
  A.add(c(cx, cy, 33, "none", 1.4, `stroke-opacity=".9" stroke="#c9d4f5"`));
  // laurový věnec
  let leaves = "";
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) {
    const a = 100 + i * 17, [x, y] = polar(cx, cy, 27.5, s < 0 ? 90 + (a - 90) : 90 - (a - 90));
    const rot = (s < 0 ? a + 90 : 180 - a - 90) ;
    leaves += `<ellipse cx="${x}" cy="${y}" rx="2.1" ry="4.2" transform="rotate(${rot + 0} ${x} ${y})" fill="#6fe0a0" stroke="#17624a" stroke-width=".9"/>`;
  }
  A.add(leaves);
  // rubín uprostřed s fasetami
  A.add(c(cx, cy, 19, A.gr("#ff5a78", 0.32, 0.28, 0.65, 0.5), 2.4));
  const S = starPts(cx, cy + 0.5, 14, 6.2);
  A.add(o(S.map((p, i) => `${i ? "L" : "M"}${p}`).join("") + "Z", A.g("#fff3b0", 0.2, 0.25), 2));
  A.add(ln(`M${S[9]}L${S[0]}L${S[1]}`, "#fff", 0.9, 1.1));
  A.add(ln(arc(cx, cy, 34.5, 200, 260), "#fff", 0.8, 2.4));
  A.add(ln(arc(cx, cy, 44, 205, 245), "#fff", 0.8, 1.8));
  A.add(dots(polar(cx, cy, 36, 20).concat([]) ? [] : [], 0, "#000"));
  return { shadow: [64, 120, 34, 4.5, 0.32], sparkles: false };
}
