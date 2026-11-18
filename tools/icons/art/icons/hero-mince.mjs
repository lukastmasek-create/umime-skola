// Mince s hvězdou: ražená hrana s vroubkováním, zapuštěná tvář, stupňovité rytí, plastická fasetová hvězda.
import { INK, LINE, polar, arc, starPts, shade, mix } from "../kit.mjs";

export default function (A) {
  const cx = 64, cy = 55, R = 44, T = 10; // střed, poloměr, tloušťka hrany
  const edge = A.lin([[0, "#d9951f"], [0.55, "#b8700f"], [1, "#7c470a"]]);
  const rim = A.rad([[0, "#fff2a8"], [0.35, "#ffd24d"], [0.8, "#eaa326"], [1, "#c97f12"]], 0.3, 0.25, 0.95);
  const face = A.rad([[0, "#ffe98a"], [0.55, "#ffcb42"], [1, "#f0a823"]], 0.35, 0.3, 0.85);
  const inner = A.rad([[0.6, "#8a4f00", 0], [1, "#8a4f00", 0.42]], 0.42, 0.38, 0.7);

  // 1) hrana (tloušťka mince) s vroubkováním
  A.add(`<circle cx="${cx}" cy="${cy + T}" r="${R}" fill="${edge}" stroke="${INK}" stroke-width="${LINE}"/>`);
  let ribs = "";
  for (let a = 8; a <= 172; a += 5.5) {
    const [x, y] = polar(cx, cy, R - 1, a);
    ribs += `M${x} ${y}V${(y + T + 0.2).toFixed(2)}`;
  }
  A.add(`<path d="${ribs}" stroke="#6b3d07" stroke-opacity=".5" stroke-width="1" fill="none"/>`);
  A.add(`<path d="${arc(cx, cy + T, R - 1.2, 25, 75)}" stroke="#ffe08a" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round" fill="none"/>`);
  // 2) okraj líce
  A.add(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${rim}" stroke="${INK}" stroke-width="${LINE}"/>`);
  // 3) vroubkování okrajového kroužku
  let tick = "";
  for (let i = 0; i < 64; i++) { const a = (i * 360) / 64; const [x0, y0] = polar(cx, cy, 38.6, a), [x1, y1] = polar(cx, cy, 42.2, a); tick += `M${x0} ${y0}L${x1} ${y1}`; }
  A.add(`<path d="${tick}" stroke="#a9660d" stroke-opacity=".45" stroke-width=".9" fill="none"/>`);
  A.add(`<path d="${arc(cx, cy, 41.6, 195, 265)}" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round" fill="none"/>`);
  // 4) zapuštěný stupeň: tmavý žlábek nahoře vlevo, světlý lem dole vpravo
  A.add(`<circle cx="${cx}" cy="${cy}" r="37" fill="${face}" stroke="#a5620c" stroke-width="1.8"/>`);
  A.add(`<path d="${arc(cx, cy, 35.4, -10, 115)}" stroke="#fff3b0" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round" fill="none"/>`);
  A.add(`<circle cx="${cx}" cy="${cy}" r="36" fill="${inner}"/>`);
  // 5) rytá značení: 20 paprsků a tenký kroužek
  let marks = "";
  for (let i = 0; i < 20; i++) { const a = (i * 18) - 90; const [x0, y0] = polar(cx, cy, i % 2 ? 31.2 : 30, a), [x1, y1] = polar(cx, cy, 33.4, a); marks += `M${x0} ${y0}L${x1} ${y1}`; }
  A.add(`<path d="${marks}" stroke="#b8700f" stroke-opacity=".8" stroke-width="1.3" stroke-linecap="round" fill="none"/>`);
  A.add(`<circle cx="${cx}" cy="${cy}" r="28.6" fill="none" stroke="#c98a18" stroke-width="1.1"/>`);
  A.add(`<circle cx="${cx}" cy="${cy + 0.9}" r="28.6" fill="none" stroke="#fff0a0" stroke-opacity=".55" stroke-width=".8"/>`);
  // 6) plastická hvězda: stín, fasety podle světla, obrys, odlesk
  const S = starPts(cx, cy + 1.4, 24, 11);
  const C = [cx, cy + 1.4];
  const full = S.map((p, i) => `${i ? "L" : "M"}${p.join(" ")}`).join("") + "Z";
  A.add(`<path d="${full}" transform="translate(1.2 3)" fill="#8a4f00" fill-opacity=".5"/>`);
  let facets = "";
  for (let i = 0; i < 10; i += 2) {
    const tip = S[i], l = S[(i + 9) % 10], rr = S[(i + 1) % 10];
    const ang = -90 + (i / 2) * 72;
    const cl = shade(ang - 35, "#d98a12", "#fff1a0"), cr = shade(ang + 35, "#d98a12", "#fff1a0");
    facets += `<path d="M${C} L${tip} L${l}Z" fill="${cl}"/><path d="M${C} L${tip} L${rr}Z" fill="${cr}"/>`;
  }
  A.add(facets);
  A.add(`<path d="${full}" fill="none" stroke="${INK}" stroke-width="2.1" stroke-linejoin="round"/>`);
  let seams = "";
  for (let i = 0; i < 10; i += 2) seams += `M${C} L${S[i]}`;
  for (let i = 1; i < 10; i += 2) seams += `M${C} L${S[i]}`;
  A.add(`<path d="${seams}" stroke="#a5620c" stroke-opacity=".55" stroke-width=".9" fill="none" stroke-linecap="round"/>`);
  A.add(`<path d="M${S[9]}L${S[0]}L${S[1]}" transform="translate(-0.2 0.6)" fill="none" stroke="#fffbe0" stroke-opacity=".85" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`);
  // 7) lesk a lehké ohmatání
  A.add(`<path d="${arc(cx, cy, 32.5, 205, 250)}" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" stroke-linecap="round" fill="none"/>`);
  A.add(`<path d="${arc(cx, cy, 32.5, 256, 266)}" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" stroke-linecap="round" fill="none"/>`);
  A.add(`<path d="M91 36.5l2 2.6M96 44.5l1 1.8M33 78l-1.8-2.8" stroke="#fff" stroke-opacity=".65" stroke-width="1.3" stroke-linecap="round" fill="none"/>`);
  return { shadow: [64, 118, 40, 5, 0.35], sparkles: false };
}
