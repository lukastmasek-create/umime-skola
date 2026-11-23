// Pixel-art pozadí úvodní scény: soumrak s pixelovým přechodem nebe, hvězdy, měsíc, padající hvězda,
// mraky, ptáci, horské pásmo se sněhem, zámek (škola) s rozsvícenými okny, čtyři vrstvy kopců se
// stromy, keři, květinami, houbami, chaloupkou, lampou, světluškami, balonem a létající knihou.
// Čisté SVG (crispEdges) + CSS, žádný JS ani canvas. Vše je generované deterministicky (seed),
// takže server i klient vykreslí totéž.

import { HERO_PHASE_SCRIPT } from "@/lib/hero-phase";
import { HeroPixelClock } from "@/components/HeroPixelClock";

const W = 480;
const H = 270;

// ---------- pomocné funkce ----------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pal = Record<string, string>;

const LIT = "#ffd86b"; // rozsvícená okna a lampa mírně blikají (třída hp-lit)

// sprite = pole řádků, každý znak je barva z palety, "." je průhledné
function Sprite({
  rows,
  pal,
  x,
  y,
  flip = false,
  only,
}: {
  rows: string[];
  pal: Pal;
  x: number;
  y: number;
  flip?: boolean;
  only?: string; // vykreslí jen tuto barvu (rozsvícená okna nad ztmavenou krajinou)
}) {
  const byColor = new Map<string, string>();
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; ) {
      const ch = row[cx];
      if (ch === "." || !pal[ch]) {
        cx++;
        continue;
      }
      let e = cx;
      while (e + 1 < row.length && row[e + 1] === ch) e++;
      const len = e - cx + 1;
      const col = pal[ch];
      if (only && col !== only) {
        cx = e + 1;
        continue;
      }
      byColor.set(col, (byColor.get(col) ?? "") + `M${cx} ${ry}h${len}v1h-${len}z`);
      cx = e + 1;
    }
  });
  const w = rows[0].length;
  const tf = flip ? `translate(${x + w} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={tf}>
      {[...byColor].map(([col, d]) => (
        <path key={col} d={d} fill={col} className={col === LIT ? "hp-lit" : undefined} />
      ))}
    </g>
  );
}

// ---------- spritey ----------
const PINE = [
  "....l....",
  "...lgg...",
  "..llggg..",
  "...lggg..",
  "..llgggg.",
  ".lllggggg",
  "..llgggg.",
  ".llggggg.",
  "lllgggggg",
  "....t....",
  "....t....",
];
const ROUND = [
  "..lllll..",
  ".lllllgg.",
  "llllgggg.",
  "lllgggggg",
  "llgggggg.",
  ".gggggg..",
  "....t....",
  "....t....",
  "....t....",
];
const BUSH = ["..lll..", "lllllgg", "ggggggg"];
const FLOWER = [".p.", "pyp", ".p.", ".s."];
const MUSHROOM = [".rrr.", "rwrrr", "rrrwr", "..w..", "..w.."];
const HOUSE = [
  "...........cc..",
  ".......r...cc..",
  "......rrr..cc..",
  ".....rrrrr.cc..",
  "....rrrrrrrrr..",
  "...rrrrrrrrrrr.",
  "..rrrrrrrrrrrrr",
  "...wwwwwwwwwww.",
  "...wyywwwwdddw.",
  "...wyywwwwdddw.",
  "...wwwwwwwdddw.",
  "...wwwwwwwdddw.",
];
const CASTLE = [
  "..f.....f.....f..",
  "..b.....b.....b..",
  ".bbb...bbb...bbb.",
  ".byb...byb...byb.",
  ".bbbbbbbbbbbbbbb.",
  ".bbbbbbbbbbbbbbb.",
  ".bbbbbbboobbbbbb.",
  ".bbbbbbboobbbbbb.",
];
const LAMP = ["yyy", "yyy", ".p.", ".p.", ".p.", ".p.", ".p.", ".p.", "ppp"];
const BIRD = ["x...x", ".x.x.", "..x.."];
const BALLOON = [
  "..rrrrr..",
  ".rrwwwrr.",
  "rrrwwwrrr",
  "rrrwwwrrr",
  "rrrwwwrrr",
  ".rrwwwrr.",
  "..rrwrr..",
  "...rwr...",
  "..p...p..",
  "..p...p..",
  "...ppp...",
  "...ppp...",
];
const BOOK = [
  "bbbbbbbbb",
  "bwwwbwwwb",
  "bwlwbwlwb",
  "bwwwbwwwb",
  "bwlwbwlwb",
  ".bbbbbbb.",
];
const MOON = [
  "....mmmmm....",
  "..mmmmmmmmm..",
  ".mmmmmmmmmmm.",
  ".mmccmmmmmmm.",
  "mmmccmmmmmmmm",
  "mmmmmmmmmccmm",
  "mmmmmmmmmmccm",
  "mmmmcmmmmmmmm",
  "mmmmmmmmmmmmm",
  ".mmmmmmmmmmm.",
  ".mmmmccmmmmm.",
  "..mmmmmmmmm..",
  "....mmmmm....",
];
const SUN = [
  "......r......",
  "..r...r...r..",
  "...r.yyy.r...",
  "....yyyyy....",
  "r..yyyyyyy..r",
  "...yyyyyyy...",
  "rr.yyyyyyy.rr",
  "...yyyyyyy...",
  "r..yyyyyyy..r",
  "....yyyyy....",
  "...r.yyy.r...",
  "..r...r...r..",
  "......r......",
];
const CLOUD_A = [
  "....www........",
  "..wwwwwww.www..",
  ".wwwwwwwwwwwww.",
  "wwwwwwwwwwwwwww",
  ".lllllllllllll.",
];
const CLOUD_B = ["...www.....", ".wwwwwww.w.", "wwwwwwwwwww", ".lllllllll."];

const P_PINE_FAR: Pal = { l: "#2f8f7a", g: "#1f6a5c", t: "#2a2a3a" };
const P_PINE_MID: Pal = { l: "#4fbf6a", g: "#2a7a48", t: "#5a3a22" };
const P_PINE_NEAR: Pal = { l: "#6fe07a", g: "#2f8f4f", t: "#6b4226" };
const P_ROUND: Pal = { l: "#78e070", g: "#2f9a4f", t: "#6b4226" };
const P_ROUND_AUTUMN: Pal = { l: "#ffb347", g: "#d9742b", t: "#6b4226" };
const P_BUSH: Pal = { l: "#6fe07a", g: "#2f8f4f" };

// ---------- krajina ----------
type Hill = {
  base: number;
  amp: number;
  f1: number;
  f2: number;
  ph: number;
  top: string;
  fill: string;
  dark: string;
  dither: string;
};

const HILLS: Hill[] = [
  { base: 182, amp: 9, f1: 0.035, f2: 0.09, ph: 1.2, top: "#6b86d6", fill: "#34408a", dark: "#2c3777", dither: "#3b4a9a" },
  { base: 198, amp: 8, f1: 0.045, f2: 0.12, ph: 3.1, top: "#46b08a", fill: "#2a6a6e", dark: "#245a5e", dither: "#307a7a" },
  { base: 216, amp: 7, f1: 0.055, f2: 0.15, ph: 0.4, top: "#68d46c", fill: "#2f8f4f", dark: "#277a43", dither: "#379c58" },
  { base: 238, amp: 6, f1: 0.07, f2: 0.18, ph: 2.2, top: "#9ae85e", fill: "#3aa34f", dark: "#2f8a43", dither: "#45b25a" },
];

function heights(h: Hill) {
  return Array.from({ length: W }, (_, x) =>
    Math.round(h.base - h.amp * (0.6 * Math.sin(x * h.f1 + h.ph) + 0.4 * Math.sin(x * h.f2 + h.ph * 2))),
  );
}
const HS = HILLS.map(heights);

function HillLayer({ h, hs, seed }: { h: Hill; hs: number[]; seed: number }) {
  const r = rng(seed);
  let fill = "";
  let top = "";
  let dark = "";
  for (let x = 0; x < hs.length; ) {
    let e = x;
    while (e + 1 < hs.length && hs[e + 1] === hs[x]) e++;
    const w = e - x + 1;
    const y = hs[x];
    fill += `M${x} ${y}h${w}v${H - y}h-${w}z`;
    top += `M${x} ${y}h${w}v1h-${w}z`;
    dark += `M${x} ${y + 1}h${w}v1h-${w}z`;
    x = e + 1;
  }
  // šachovnicové "dithering" pruhy pod hranou a stébla trávy nad ní
  let dither = "";
  let blades = "";
  for (let x = 0; x < hs.length; x++) {
    const y = hs[x];
    if ((x + y) % 2 === 0) dither += `M${x} ${y + 2}h1v1h-1z`;
    if ((x * 3 + y) % 4 === 0) dither += `M${x} ${y + 4}h1v1h-1z`;
    if (r() < 0.28) blades += `M${x} ${y - 1}h1v1h-1z`;
  }
  return (
    <g>
      <path d={fill} fill={h.fill} />
      <path d={dither} fill={h.dither} />
      <path d={dark} fill={h.dark} />
      <path d={top} fill={h.top} />
      <path d={blades} fill={h.top} />
    </g>
  );
}

// stromy, keře, květiny... rozmístěné podél vrstvy kopce
function scatter(seed: number, count: number, gap: number, from = 4, to = W - 12) {
  const r = rng(seed);
  const xs: number[] = [];
  let guard = 0;
  while (xs.length < count && guard++ < 800) {
    const x = Math.round(from + r() * (to - from));
    if (xs.every((o) => Math.abs(o - x) >= gap)) xs.push(x);
  }
  return xs.sort((a, b) => a - b);
}

const at = (layer: number, x: number, hgt: number) => HS[layer][Math.min(W - 1, Math.max(0, x))] - hgt + 1;

// horské pásmo se sněhovými čepičkami
const MOUNTS = (() => {
  const base = 188;
  const amp = 44;
  const ys = Array.from({ length: W }, (_, x) => {
    const p = 1 - Math.abs(Math.sin(x * 0.028 + 0.8));
    const q = 1 - Math.abs(Math.sin(x * 0.071 + 2.1));
    return Math.round(base - amp * (0.7 * p + 0.3 * q * p));
  });
  let body = "";
  let side = "";
  let snow = "";
  let snow2 = "";
  const snowline = base - amp * 0.62;
  for (let x = 0; x < W; x++) {
    const y = ys[x];
    body += `M${x} ${y}h1v${H - y}h-1z`;
    // stín na pravých svazích
    if (x > 0 && ys[x - 1] > y - 0 && (x + y) % 3 === 0) side += `M${x} ${y + 3}h1v6h-1z`;
    if (y < snowline) {
      const d = Math.min(6, Math.round(snowline - y) + 1);
      snow += `M${x} ${y}h1v${d}h-1z`;
      snow2 += `M${x} ${y + d - 1}h1v1h-1z`;
    }
  }
  return { body, side, snow, snow2 };
})();

const STARS = (() => {
  const r = rng(7);
  return Array.from({ length: 95 }, (_, i) => ({
    x: Math.floor(r() * W),
    y: Math.floor(r() * r() * 150) + 2, // víc hvězd nahoře
    k: i % 3,
    plus: i % 13 === 0,
    warm: r() < 0.18,
    blue: r() < 0.2,
  }));
})();

const XSTARS = (() => {
  const r = rng(321);
  return Array.from({ length: 80 }, (_, i) => ({
    x: Math.floor(r() * W),
    y: Math.floor(r() * r() * 170) + 2,
    k: i % 3,
    warm: r() < 0.15,
  }));
})();

const CLOUDS = [
  { s: CLOUD_A, x: 0, y: 34, dur: 190, delay: -60, op: 0.42, sc: 1.4 },
  { s: CLOUD_B, x: 0, y: 70, dur: 150, delay: -110, op: 0.34, sc: 1.2 },
  { s: CLOUD_A, x: 0, y: 112, dur: 240, delay: -170, op: 0.3, sc: 1 },
  { s: CLOUD_B, x: 0, y: 20, dur: 130, delay: -20, op: 0.38, sc: 0.9 },
  { s: CLOUD_B, x: 0, y: 150, dur: 280, delay: -200, op: 0.22, sc: 1.1 },
];

const BIRDS = [
  { y: 52, dur: 75, delay: -10 },
  { y: 60, dur: 75, delay: -13 },
  { y: 46, dur: 75, delay: -16 },
  { y: 96, dur: 110, delay: -60 },
];

const FIREFLIES = (() => {
  const r = rng(99);
  return Array.from({ length: 22 }, () => ({
    x: Math.floor(r() * W),
    y: 200 + Math.floor(r() * 50),
    d: -(r() * 6),
    dur: 2.4 + r() * 3,
  }));
})();

// ---------- vykreslení ----------
export function HeroPixel() {
  const treesMid = scatter(11, 15, 18);
  const treesLayer3 = scatter(23, 12, 24);
  const bushes3 = scatter(31, 9, 30);
  const bushes4 = scatter(41, 8, 34);
  const flowers = scatter(53, 30, 12);
  const mushrooms = scatter(61, 5, 70);
  const bigTrees4 = scatter(71, 4, 110, 20, W - 30);
  const houseX = 268;
  const lampX = 196;
  const castleX = 232;

  const SKIES: Record<string, string[]> = {
    night: [
      "#02020c", "#03030f", "#040415", "#05061c", "#070824", "#090b2d", "#0c0f38", "#0f1443",
      "#13194e", "#171e58", "#1c2462", "#222b6b", "#293373", "#313b7a", "#3a4481", "#444e86",
      "#4e578b", "#585f90",
    ],
    dawn: [
      "#1a1a4e", "#212057", "#2a2561", "#352b6c", "#423178", "#533883", "#68408c", "#7f4894",
      "#97519a", "#b05b9c", "#c8689c", "#dd7a9a", "#ec8f98", "#f6a596", "#fbb98f", "#fecb8c",
      "#ffdb92", "#ffe8a8",
    ],
    day: [
      "#1646a8", "#194cb2", "#1d53bb", "#225bc4", "#2864cc", "#2f6ed3", "#3778d9", "#4083df",
      "#4a8ee4", "#5599e8", "#61a4ec", "#6eaff0", "#7cbaf3", "#8bc4f5", "#9acef7", "#a9d7f8",
      "#b8e0fa", "#c8e8fb",
    ],
    dusk: [
      "#070618", "#0a0922", "#0e0b2c", "#130f38", "#191344", "#201650", "#291a5c", "#331e66",
      "#41226e", "#522874", "#652e78", "#7a357a", "#913d7b", "#aa467a", "#c25179", "#d85f78",
      "#ea7276", "#f58a74",
    ],
  };
  const bandH = 11;

  return (
    <>
    <div
      aria-hidden
      data-time="dusk"
      suppressHydrationWarning
      className="hero-pixel pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
      >
        <defs>
          <filter id="hp-f-night" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.34 0 0 0 0.02  0 0.4 0 0 0.03  0 0 0.72 0 0.09  0 0 0 1 0" />
          </filter>
          <filter id="hp-f-dawn" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0.05  0 0.86 0 0 0.02  0 0 0.78 0 0  0 0 0 1 0" />
          </filter>
        </defs>

        {/* nebe po pixelových pruzích, čtyři denní doby */}
        {Object.entries(SKIES).map(([name, cols]) => (
          <g key={name} className={`hp-sky hp-sky-${name}`}>
            {cols.map((c, i) => (
              <rect key={i} x="0" y={i * bandH} width={W} height={i === cols.length - 1 ? H - i * bandH : bandH + 0.5} fill={c} />
            ))}
          </g>
        ))}

        {/* hvězdy */}
        <g className="hp-stars">
        {STARS.map((s, i) => {
          const fill = s.warm ? "#ffe9b0" : s.blue ? "#bcd6ff" : "#ffffff";
          return s.plus ? (
            <g key={i} className={`hp-star hp-star-${s.k}`} fill={fill}>
              <rect x={s.x} y={s.y - 1} width="1" height="3" />
              <rect x={s.x - 1} y={s.y} width="3" height="1" />
            </g>
          ) : (
            <rect key={i} className={`hp-star hp-star-${s.k}`} x={s.x} y={s.y} width="1" height="1" fill={fill} />
          );
        })}
        {XSTARS.map((s, i) => (
          <rect key={i} className={`hp-xstar hp-star hp-star-${s.k}`} x={s.x} y={s.y} width="1" height="1" fill={s.warm ? "#ffe9b0" : "#ffffff"} />
        ))}
        </g>

        {/* měsíc se září (kříž z obdélníků místo čtverce) */}
        <g className="hp-moon">
        <g fill="#fff4c9">
          <rect x="381" y="18" width="21" height="11" opacity="0.06" />
          <rect x="386" y="13" width="11" height="21" opacity="0.06" />
          <rect x="379" y="20" width="25" height="7" opacity="0.04" />
          <rect x="388" y="11" width="7" height="25" opacity="0.04" />
        </g>
        <Sprite rows={MOON} pal={{ m: "#fff4c9", c: "#e0cf93" }} x={385} y={17} />
        </g>

        {/* slunce: ve dne vysoko, ráno nízko nad horami */}
        <g className="hp-sun">
          <g fill="#fff0a0">
            <rect x="141" y="12" width="31" height="15" opacity="0.1" transform="translate(0 6)" />
            <rect x="148" y="6" width="17" height="33" opacity="0.1" transform="translate(0 6)" />
            <rect x="138" y="16" width="37" height="9" opacity="0.06" transform="translate(0 6)" />
          </g>
          <Sprite rows={SUN} pal={{ y: "#ffe566", r: "#ffc94d" }} x={150} y={18} />
        </g>

        {/* padající hvězda */}
        <g className="hp-shoot">
          <g transform="translate(70 22)">
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={-i * 2} y={-i} width="2" height="1" fill="#ffffff" opacity={1 - i / 9} />
            ))}
          </g>
        </g>

        {/* mraky */}
        {CLOUDS.map((c, i) => (
          <g key={i} className="hp-cloud" style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
            <g transform={`translate(${c.x} ${c.y}) scale(${c.sc})`} opacity={c.op}>
              <Sprite rows={c.s} pal={{ w: "#ffffff", l: "#c9c2ff" }} x={0} y={0} />
            </g>
          </g>
        ))}

        {/* ptáci */}
        {BIRDS.map((b, i) => (
          <g key={i} className="hp-bird" style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>
            <Sprite rows={BIRD} pal={{ x: "#1a1240" }} x={0} y={b.y} />
          </g>
        ))}

        {/* balon a létající kniha */}
        <g className="hp-bob" style={{ animationDuration: "7s" }}>
          <Sprite rows={BALLOON} pal={{ r: "#ff6b9a", w: "#ffe9f2", p: "#8a5a3a" }} x={62} y={104} />
        </g>
        <g className="hp-bob" style={{ animationDuration: "5s", animationDelay: "-2s" }}>
          <Sprite rows={BOOK} pal={{ b: "#3b5bdb", w: "#f5f0e1", l: "#b8b0a0" }} x={410} y={96} />
        </g>

        {/* záře nad horizontem */}
        <g className="hp-horizon" fill="#ff9a7a">
          <rect x="120" y="176" width="240" height="14" opacity="0.07" />
          <rect x="160" y="168" width="160" height="22" opacity="0.08" />
          <rect x="200" y="162" width="80" height="28" opacity="0.1" />
        </g>

        <g className="hp-land">
        {/* hory */}
        <path d={MOUNTS.body} fill="#2a2468" />
        <path d={MOUNTS.side} fill="#221c58" />
        <path d={MOUNTS.snow} fill="#e6e0ff" opacity="0.9" />
        <path d={MOUNTS.snow2} fill="#b9b0f0" opacity="0.9" />

        {/* vrstva 1: modré kopce se zámkem (školou) */}
        <HillLayer h={HILLS[0]} hs={HS[0]} seed={1} />
        <Sprite
          rows={CASTLE}
          pal={{ b: "#2d2a66", f: "#ff6b9a", y: LIT, o: LIT }}
          x={castleX}
          y={at(0, castleX + 8, CASTLE.length)}
        />
        {scatter(5, 7, 40).map((x) => (
          <Sprite key={x} rows={PINE} pal={P_PINE_FAR} x={x} y={at(0, x, PINE.length)} />
        ))}

        {/* vrstva 2: teal kopce, borovice v mlze */}
        <HillLayer h={HILLS[1]} hs={HS[1]} seed={2} />
        {treesMid.map((x, i) => (
          <Sprite key={x} rows={PINE} pal={P_PINE_MID} x={x} y={at(1, x, PINE.length)} flip={i % 2 === 0} />
        ))}

        {/* vrstva 3: zelené kopce, chaloupka, listnáče */}
        <HillLayer h={HILLS[2]} hs={HS[2]} seed={3} />
        {treesLayer3.map((x, i) =>
          Math.abs(x - houseX) < 22 ? null : (
            <Sprite
              key={x}
              rows={i % 3 === 0 ? PINE : ROUND}
              pal={i % 3 === 0 ? P_PINE_NEAR : i % 5 === 1 ? P_ROUND_AUTUMN : P_ROUND}
              x={x}
              y={at(2, x, i % 3 === 0 ? PINE.length : ROUND.length)}
              flip={i % 2 === 1}
            />
          ),
        )}
        <Sprite
          rows={HOUSE}
          pal={{ c: "#7a4a3a", r: "#c24a4a", w: "#b89a6a", y: LIT, d: "#6b4226" }}
          x={houseX}
          y={at(2, houseX + 7, HOUSE.length)}
        />
        {bushes3.map((x) =>
          Math.abs(x - houseX - 7) < 14 ? null : <Sprite key={x} rows={BUSH} pal={P_BUSH} x={x} y={at(2, x, BUSH.length)} />,
        )}

        {/* vrstva 4: popředí, velké stromy, lampa, květiny, houby */}
        <HillLayer h={HILLS[3]} hs={HS[3]} seed={4} />
        {bigTrees4.map((x, i) => (
          <Sprite
            key={x}
            rows={i % 2 === 0 ? ROUND : PINE}
            pal={i % 2 === 0 ? P_ROUND : P_PINE_NEAR}
            x={x}
            y={at(3, x, i % 2 === 0 ? ROUND.length : PINE.length) + 2}
            flip={i % 2 === 1}
          />
        ))}
        {bushes4.map((x) => (
          <Sprite key={x} rows={BUSH} pal={P_BUSH} x={x} y={at(3, x, BUSH.length)} />
        ))}
        <Sprite rows={LAMP} pal={{ y: LIT, p: "#3a3a5a" }} x={lampX} y={at(3, lampX, LAMP.length)} />
        {flowers.map((x, i) => {
          const pals: Pal[] = [
            { p: "#ff6b9a", y: "#ffd86b", s: "#2f8f4f" },
            { p: "#ffffff", y: "#ffd86b", s: "#2f8f4f" },
            { p: "#ffd86b", y: "#ff8a3d", s: "#2f8f4f" },
            { p: "#8ea2ff", y: "#ffffff", s: "#2f8f4f" },
          ];
          return <Sprite key={x} rows={FLOWER} pal={pals[i % pals.length]} x={x} y={at(3, x, FLOWER.length) + 1} />;
        })}
        {mushrooms.map((x) => (
          <Sprite key={x} rows={MUSHROOM} pal={{ r: "#e04b5a", w: "#f5f0e1" }} x={x} y={at(3, x, MUSHROOM.length) + 1} />
        ))}

        </g>

        {/* rozsvícená okna a lampa nad ztmavenou krajinou (v noci svítí) */}
        <g className="hp-litlayer">
          <g fill={LIT} opacity="0.12">
            <rect x={lampX - 3} y={at(3, lampX, LAMP.length) - 1} width="9" height="5" />
            <rect x={lampX - 1} y={at(3, lampX, LAMP.length) - 3} width="5" height="9" />
          </g>
          <Sprite rows={LAMP} pal={{ y: LIT }} only={LIT} x={lampX} y={at(3, lampX, LAMP.length)} />
          <Sprite rows={CASTLE} pal={{ y: LIT, o: LIT }} only={LIT} x={castleX} y={at(0, castleX + 8, CASTLE.length)} />
          <Sprite rows={HOUSE} pal={{ y: LIT }} only={LIT} x={houseX} y={at(2, houseX + 7, HOUSE.length)} />
        </g>

        {/* světlušky */}
        <g className="hp-fireflies">
        {FIREFLIES.map((f, i) => (
          <g key={i} className="hp-firefly" style={{ animationDuration: `${f.dur}s`, animationDelay: `${f.d}s` }}>
            <rect x={f.x} y={f.y} width="1" height="1" fill="#ffe98a" />
            <rect x={f.x - 1} y={f.y - 1} width="3" height="3" fill="#ffe98a" opacity="0.15" />
          </g>
        ))}
        </g>
      </svg>
      {/* jemné ztmavení za textem, aby zůstal čitelný */}
      <div className="hp-veil absolute inset-0" />
    </div>
    <script dangerouslySetInnerHTML={{ __html: HERO_PHASE_SCRIPT }} />
    <HeroPixelClock />
    </>
  );
}
