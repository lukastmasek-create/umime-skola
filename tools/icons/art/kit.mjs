// Sdílená sada pro kreslení ikon (viz docs/ICONS_WEBP.md): společný obrys, materiály, světlo shora zleva a obal SVG
// (stín, nálepkový obrys, pohupování, třpyt) přesně ve tvaru, který očekává tools/icons/build-webp.mjs.
export const INK = "#1f234c";   // obrys
export const LINE = 3.2;        // základní tloušťka obrysu
export const LIGHT = -135;      // světlo přichází zleva shora (úhel, 0° = doprava, -90° = nahoru)
export const CREAM = "#fffdf5"; // barva nálepkového okraje (stejná jako ve filtru stk)

const STYLE_BOB = ".bob{transform-origin:64px 110px;animation:bob 2.8s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.6deg)}50%{transform:translateY(-3.5px) rotate(1.6deg)}}";
const STYLE_TW = ".tw{transform-box:fill-box;transform-origin:center;animation:tw 1.8s ease-in-out infinite}.tw:nth-of-type(2n){animation-delay:.6s}@keyframes tw{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.55);opacity:.55}}";
const rm = (tw) => `@media (prefers-reduced-motion:reduce){.bob${tw ? ",.tw" : ""}{animation:none}}`;

const r = (n) => Math.round(n * 100) / 100;
export const rad = (d) => (d * Math.PI) / 180;
export const polar = (cx, cy, R, deg) => [r(cx + R * Math.cos(rad(deg))), r(cy + R * Math.sin(rad(deg)))];
export const pts = (a) => a.map((p) => p.join(",")).join(" ");

/** Mísí #rrggbb barvy (t 0–1). */
export function mix(a, b, t) {
  const x6 = (c) => (c.length === 4 ? "#" + [...c.slice(1)].map((ch) => ch + ch).join("") : c);
  const h = (c) => { const k = x6(c); return [1, 3, 5].map((i) => parseInt(k.slice(i, i + 2), 16)); };
  const [A, B] = [h(a), h(b)];
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
/** Osvětlení plochy s normálou v úhlu `deg` mezi tmavou a světlou barvou (světlo z LIGHT). */
export function shade(deg, dark, light) {
  const k = (Math.cos(rad(deg - LIGHT)) + 1) / 2;
  return mix(dark, light, k);
}

/** Hvězda: n cípů, vnější R, vnitřní ri; vrací pole bodů [tip, valley, tip, valley...]. */
export function starPts(cx, cy, R, ri, n = 5, rot = -90) {
  const out = [];
  for (let i = 0; i < n * 2; i++) out.push(polar(cx, cy, i % 2 ? ri : R, rot + (i * 180) / n));
  return out;
}
/** Zaoblený mnohoúhelník / cesta přes body s kvadratickými rohy (poloměr k). */
export function roundPoly(p, k = 3) {
  const n = p.length, f = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const t = Math.min(d, L / 2) / L; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n];
    const s = f(b, a, k), e = f(b, c, k);
    d += `${i ? "L" : "M"}${r(s[0])} ${r(s[1])}Q${b[0]} ${b[1]} ${r(e[0])} ${r(e[1])}`;
  }
  return d + "Z";
}
/** Obloukový tah kružnice od úhlu a0 do a1 (stupně). */
export function arc(cx, cy, R, a0, a1) {
  const [x0, y0] = polar(cx, cy, R, a0), [x1, y1] = polar(cx, cy, R, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
  return `M${x0} ${y0}A${R} ${R} 0 ${large} ${sweep} ${x1} ${y1}`;
}

export class Art {
  constructor(prefix = "a") { this.defs = []; this.n = 0; this.parts = []; this.p = prefix; }
  id() { return `${this.p}${this.n++}`; }
  /** Lineární přechod; vrací `url(#id)`. dir = [x1,y1,x2,y2] v 0–1 (výchozí shora dolů). */
  lin(stops, dir = [0, 0, 0, 1]) {
    const id = this.id();
    this.defs.push(`<linearGradient id="${id}" x1="${dir[0]}" y1="${dir[1]}" x2="${dir[2]}" y2="${dir[3]}">${this.stops(stops)}</linearGradient>`);
    return `url(#${id})`;
  }
  /** Radiální přechod se světlým bodem (fx, fy) v 0–1. */
  rad(stops, fx = 0.35, fy = 0.3, rr = 0.75) {
    const id = this.id();
    this.defs.push(`<radialGradient id="${id}" cx="${fx}" cy="${fy}" r="${rr}" fx="${fx}" fy="${fy}">${this.stops(stops)}</radialGradient>`);
    return `url(#${id})`;
  }
  stops(s) { return s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join(""); }
  clip(shape) { const id = this.id(); this.defs.push(`<clipPath id="${id}">${shape}</clipPath>`); return `url(#${id})`; }
  add(s) { this.parts.push(s); return this; }
  /** Třpytka (4cípá) s třídou tw; střed (x,y), poloměr s. */
  spark(x, y, s, fill = "#fff", stroke = INK) {
    const q = s * 0.14;
    return `<path class="tw" d="M${x} ${y - s}Q${x + q} ${y - q} ${x + s} ${y}Q${x + q} ${y + q} ${x} ${y + s}Q${x - q} ${y + q} ${x - s} ${y}Q${x - q} ${y - q} ${x} ${y - s}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
}

/** Celé SVG ikony. shadow = [cx, cy, rx, ry, alfa]. `sparkles` = zda tělo obsahuje prvky .tw. */
export function toSvg(art, { shadow = [64, 120, 40, 5, 0.35], sparkles = false, still = false } = {}) {
  // still: statická ikona (sekce škol) bez pohupování a nálepkového obrysu, viewBox 0 0 128 128.
  if (still) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256"><defs>${art.defs.join("")}</defs>${art.parts.join("")}</svg>`;
  const [cx, cy, rx, ry, a] = shadow;
  const style = STYLE_BOB + (sparkles ? STYLE_TW : "") + rm(sparkles);
  const defs =
    `<radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity="${a}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>` +
    `<filter id="stk" filterUnits="userSpaceOnUse" x="-4" y="-4" width="136" height="136"><feMorphology in="SourceAlpha" operator="dilate" radius="3.2" result="d"/><feFlood flood-color="${CREAM}"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    art.defs.join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 136 136" width="256" height="256"><defs>${defs}</defs><style>${style}</style><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sh)"/><g class="bob"><g filter="url(#stk)">${art.parts.join("")}</g></g></svg>`;
}

// ---- zkratky pro kreslení -------------------------------------------------------------------------------
/** Cesta s obrysem. */
export const o = (d, fill, w = LINE, x = "") => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${x ? " " + x : ""}/>`;
export const c = (cx, cy, rr, fill, w = LINE, x = "") => `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${fill}" stroke="${INK}" stroke-width="${w}"${x ? " " + x : ""}/>`;
export const rc = (x, y, w, h, rx, fill, sw = LINE, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${extra ? " " + extra : ""}/>`;
export const el = (cx, cy, rx, ry, fill, sw = LINE, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${extra ? " " + extra : ""}/>`;
/** Odlesk / jemná čára bez výplně. */
export const ln = (d, col = "#fff", op = 0.7, w = 2) => `<path d="${d}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const dots = (list, rr, col, op = 1) => list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}" fill-opacity="${op}"/>`).join("");
export const sh = (d, op = 0.28, col = "#000") => `<path d="${d}" fill="${col}" fill-opacity="${op}"/>`;
/** Materiálový přechod z jedné barvy (světlo nahoře, stín dole). */
Art.prototype.g = function (base, lo = 0.55, hi = 0.38, dir) { return this.lin([[0, mix(base, "#ffffff", lo)], [0.5, base], [1, mix(base, "#000000", hi)]], dir); };
Art.prototype.gr = function (base, fx = 0.33, fy = 0.28, lo = 0.6, hi = 0.4) { return this.rad([[0, mix(base, "#ffffff", lo)], [0.55, base], [1, mix(base, "#000000", hi)]], fx, fy, 0.85); };

/** Malý roztomilý obličej (oči s odlesky, úsměv, tváře) se středem (x,y) a měřítkem s. */
export const face = (x, y, s = 1, cheek = "#ff7a9a") =>
  `<g><circle cx="${x - 7 * s}" cy="${y}" r="${2.3 * s}" fill="${INK}"/><circle cx="${x + 7 * s}" cy="${y}" r="${2.3 * s}" fill="${INK}"/><circle cx="${x - 7.8 * s}" cy="${y - 0.9 * s}" r="${0.8 * s}" fill="#fff"/><circle cx="${x + 6.2 * s}" cy="${y - 0.9 * s}" r="${0.8 * s}" fill="#fff"/><path d="M${x - 3.4 * s} ${y + 4 * s}Q${x} ${y + 7.4 * s} ${x + 3.4 * s} ${y + 4 * s}" fill="none" stroke="${INK}" stroke-width="${1.6 * s}" stroke-linecap="round"/><ellipse cx="${x - 12 * s}" cy="${y + 4.4 * s}" rx="${3.4 * s}" ry="${2.2 * s}" fill="${cheek}" fill-opacity=".7"/><ellipse cx="${x + 12 * s}" cy="${y + 4.4 * s}" rx="${3.4 * s}" ry="${2.2 * s}" fill="${cheek}" fill-opacity=".7"/></g>`;
