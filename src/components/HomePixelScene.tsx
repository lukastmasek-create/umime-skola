// Pixel-art kulisy sekcí úvodní stránky ve stejném stylu jako HeroPixel:
// PixelSky = noční obloha s hranatými hvězdami, měsícem/planetou a mraky (leží pod obsahem),
// PixelGround = krajina na konci sekce (kopce, stromy, hrad, domky) a hliněný pruh jako „podlaha levelu“.
// Čisté SVG (crispEdges), deterministické (seed), takže server i klient vykreslí totéž. Bez JS.

type Pal = Record<string, string>;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Sprite({ rows, pal, x, y, flip = false, className }: { rows: string[]; pal: Pal; x: number; y: number; flip?: boolean; className?: string }) {
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
      byColor.set(pal[ch], (byColor.get(pal[ch]) ?? "") + `M${cx} ${ry}h${len}v1h-${len}z`);
      cx = e + 1;
    }
  });
  const w = rows[0].length;
  const tf = flip ? `translate(${x + w} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={tf} className={className}>
      {[...byColor].map(([col, d]) => (
        <path key={col} d={d} fill={col} className={col === "#ffd86b" ? "hps-lit" : undefined} />
      ))}
    </g>
  );
}

// ---------- spritey ----------
const PINE = ["...h...", "..hgg..", "..hggd.", ".hgggd.", ".hgggdd", "hggggdd", "...t...", "...t..."];
const ROUND = [".hhhh..", "hhhggg.", "hhgggdd", "hggggdd", ".ggddd.", "...t...", "...t..."];
const BUSH = [".hhg.", "hhggd", "ggddd"];
const FLOWER = [".p.", "pyp", ".s."];
const HOUSE = [
  "......cc..",
  "...rr.cc..",
  "..rrrrrr..",
  ".rrrrrrrr.",
  "rrrrrrrrrr",
  ".wwwwwwww.",
  ".wyywwddw.",
  ".wyywwddw.",
  ".wwwwwddw.",
];
const CASTLE = [
  "..f.........f.........f..",
  "..b.........b.........b..",
  ".bbb.......bbb.......bbb.",
  ".bbb.b.b.b.bbb.b.b.b.bbb.",
  ".byb.bbbbb.byb.bbbbb.byb.",
  ".bbbbbbbbbbbbbbbbbbbbbbb.",
  ".bbbybbbybbbbbbbybbbybbb.",
  ".bbbbbbbbbbbbbbbbbbbbbbb.",
  ".bbbbbbbbbboooobbbbbbbbb.",
  ".bbbbbbbbbboooobbbbbbbbb.",
];
const LAMP = ["yyy", ".p.", ".p.", ".p.", ".p.", "ppp"];
const MOON = [
  "..mmmm..",
  ".mmmmmm.",
  "mmccmmmm",
  "mmcmmmcm",
  "mmmmmmmm",
  "mmmmccmm",
  ".mmmmmm.",
  "..mmmm..",
];
const PLANET = [
  "....pppp....",
  "..pppppppp..",
  "rrpppqqpppp.",
  ".rrrppqqppp.",
  "..pprrrrppp.",
  "..ppppprrrr.",
  "...pppppprrr",
  "....pppp....",
];
const CLOUD = ["...www.....", ".wwwwwww...", "wwwwwwwwww.", ".ssssssssss"];
const CRYSTAL = ["..h..", ".hcc.", ".hcc.", "hhccd", "hccdd", ".cdd."];

const P_TREE: Pal = { h: "#7fe08a", g: "#2f8f4f", d: "#1f5f38", t: "#6b4226" };
const P_TREE_FAR: Pal = { h: "#4fb09a", g: "#1f6a5c", d: "#18564a", t: "#2a2a3a" };
const P_AUTUMN: Pal = { h: "#ffd37a", g: "#d9742b", d: "#a8541f", t: "#6b4226" };
const P_FLOWER_A: Pal = { p: "#ff8fd0", y: "#ffd86b", s: "#2f8f4f" };
const P_FLOWER_B: Pal = { p: "#8fd0ff", y: "#fff3b0", s: "#2f8f4f" };
const P_HOUSE: Pal = { r: "#d9534f", c: "#6b4226", w: "#efe3c8", y: "#ffd86b", d: "#6b4226" };
const P_CASTLE: Pal = { b: "#3b3f73", y: "#ffd86b", o: "#1a1833", f: "#ff8a6b" };
const P_LAMP: Pal = { y: "#ffd86b", p: "#2a2a3a" };
const P_MOON: Pal = { m: "#fff3b0", c: "#e6d88a" };
const P_PLANET: Pal = { p: "#b49cff", q: "#d8c9ff", r: "#ff8a6b" };
const P_CLOUD: Pal = { w: "#3a4686", s: "#2a3466" };
const P_CRYSTAL: Pal = { h: "#c9f2ff", c: "#5ab8ff", d: "#2f6fbf" };

// ---------- obloha ----------
type SkyProps = { seed: number; moon?: "moon" | "planet" | false; clouds?: boolean; className?: string; children?: React.ReactNode };

export function PixelSky({ seed, moon = false, clouds = true, className = "", children }: SkyProps) {
  const r = rng(seed);
  // dvě dlaždice hvězd s nesoudělnými rozměry, aby se vzor viditelně neopakoval
  const tile = (w: number, h: number, n: number) =>
    Array.from({ length: n }, () => {
      const big = r() < 0.18;
      return { x: Math.floor(r() * (w / 3)) * 3, y: Math.floor(r() * (h / 3)) * 3, s: big ? 6 : 3, c: r() < 0.2 ? "#ffd86b" : r() < 0.35 ? "#8fd0ff" : "#ffffff", blink: Math.floor(r() * 3) };
    });
  const a = tile(397, 263, 16);
  const b = tile(263, 331, 10);
  const idA = `hps-a-${seed}`;
  const idB = `hps-b-${seed}`;
  const cl = clouds ? Array.from({ length: 3 }, (_, i) => ({ top: 6 + r() * 40, left: (i * 37 + r() * 20) % 100, scale: 4 + Math.floor(r() * 3), delay: -r() * 160 })) : [];
  return (
    <div aria-hidden className={`hps-sky ${className}`}>
      <svg className="hps-stars" width="100%" height="100%" shapeRendering="crispEdges">
        <defs>
          <pattern id={idA} width="397" height="263" patternUnits="userSpaceOnUse">
            {a.map((s, i) => (
              <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s} fill={s.c} className={`hps-star hps-star-${s.blink}`} />
            ))}
          </pattern>
          <pattern id={idB} width="263" height="331" patternUnits="userSpaceOnUse">
            {b.map((s, i) => (
              <rect key={i} x={s.x} y={s.y} width={3} height={3} fill={s.c} opacity={0.6} />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${idB})`} />
        <rect width="100%" height="100%" fill={`url(#${idA})`} />
      </svg>
      {moon && (
        <svg className={`hps-moon hps-moon-${moon}`} viewBox={moon === "moon" ? "0 0 8 8" : "0 0 12 8"} shapeRendering="crispEdges">
          <Sprite rows={moon === "moon" ? MOON : PLANET} pal={moon === "moon" ? P_MOON : P_PLANET} x={0} y={0} />
        </svg>
      )}
      {cl.map((c, i) => (
        <svg
          key={i}
          className="hps-cloud"
          viewBox="0 0 11 4"
          shapeRendering="crispEdges"
          style={{ top: `${c.top}%`, left: `${c.left}%`, width: 11 * c.scale, height: 4 * c.scale, animationDelay: `${c.delay}s` }}
        >
          <Sprite rows={CLOUD} pal={P_CLOUD} x={0} y={0} />
        </svg>
      ))}
      {children}
    </div>
  );
}

// ---------- krajina ----------
const W = 480;
const H = 64;

function ridge(seed: number, base: number, amp: number, f: number) {
  const r = rng(seed);
  const ph = r() * 6.28;
  const ys: number[] = [];
  for (let x = 0; x < W; x++) {
    const raw = base + amp * Math.sin(x * f + ph) + amp * 0.4 * Math.sin(x * f * 2.7 + ph * 1.7);
    ys.push(Math.round(raw / 2) * 2);
  }
  return ys;
}

function ridgePath(ys: number[], bottom: number) {
  let d = `M0 ${bottom}`;
  ys.forEach((y, x) => (d += `V${y}H${x + 1}`));
  return `${d}V${bottom}Z`;
}

export type GroundKind = "forest" | "mountains" | "meadow" | "castle" | "town";

// children = další <g> vrstvy (zvířátka, táborák) nad hlínou, souřadnice ve viewBoxu 480 × 64; hlína začíná na y = 50.
type GroundProps = { kind: GroundKind; seed: number; className?: string; children?: React.ReactNode };

const SOIL_TOP = 50;

export function PixelGround({ kind, seed, className = "", children }: GroundProps) {
  const r = rng(seed * 7 + 3);
  const far = ridge(seed, kind === "mountains" ? 24 : 30, kind === "mountains" ? 15 : 8, kind === "mountains" ? 0.05 : 0.028);
  const mid = ridge(seed + 11, 39, 5, 0.04);
  const front = ridge(seed + 23, 46, 2.5, 0.07);

  // sníh na vrcholcích hor
  let snow = "";
  if (kind === "mountains") far.forEach((y, x) => y < 18 && (snow += `M${x} ${y}h1v${Math.max(2, 18 - y)}h-1z`));

  // stébla a šachovnice na přední vrstvě
  let grass = "";
  let dither = "";
  front.forEach((y, x) => {
    if ((x * 7) % 5 === 0) grass += `M${x} ${y - 1}h1v1h-1z`;
    if ((x + y) % 2 === 0) dither += `M${x} ${y + 2}h1v1h-1z`;
  });

  // kameny a kořínky v hlíně
  let stones = "";
  let stonesDark = "";
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * W);
    const y = SOIL_TOP + 3 + Math.floor(r() * (H - SOIL_TOP - 4));
    const w = 1 + Math.floor(r() * 3);
    if (r() < 0.55) stones += `M${x} ${y}h${w}v1h-${w}z`;
    else stonesDark += `M${x} ${y}h${w}v1h-${w}z`;
  }

  const props: React.ReactNode[] = [];
  const onMid = (x: number) => mid[Math.max(0, Math.min(W - 1, x))];
  const onFront = (x: number) => front[Math.max(0, Math.min(W - 1, x))];
  if (kind === "forest") {
    for (let x = 4; x < W - 8; x += 9 + Math.floor(r() * 10)) {
      const sp = r() < 0.6 ? PINE : ROUND;
      props.push(<Sprite key={`f${x}`} rows={sp} pal={r() < 0.15 ? P_AUTUMN : P_TREE} x={x} y={onFront(x + 3) - sp.length + 1} flip={r() < 0.5} />);
    }
  }
  if (kind === "mountains" || kind === "meadow" || kind === "town" || kind === "castle") {
    for (let x = 6; x < W - 8; x += 22 + Math.floor(r() * 30)) {
      props.push(<Sprite key={`t${x}`} rows={PINE} pal={P_TREE_FAR} x={x} y={onMid(x + 3) - PINE.length + 1} />);
    }
  }
  if (kind === "castle") {
    props.push(<Sprite key="castle" rows={CASTLE} pal={P_CASTLE} x={W / 2 - 12} y={onMid(W / 2) - CASTLE.length + 1} />);
  }
  if (kind === "town") {
    [70, 150, 310, 395].forEach((x, i) => props.push(<Sprite key={`h${x}`} rows={HOUSE} pal={P_HOUSE} x={x} y={onFront(x + 5) - HOUSE.length + 1} flip={i % 2 === 1} />));
    [110, 250, 360].forEach((x) => props.push(<Sprite key={`l${x}`} rows={LAMP} pal={P_LAMP} x={x} y={onFront(x + 1) - LAMP.length + 1} />));
  }
  if (kind !== "forest") {
    for (let x = 3; x < W - 6; x += 11 + Math.floor(r() * 16)) {
      const roll = r();
      if (roll < 0.45) props.push(<Sprite key={`b${x}`} rows={BUSH} pal={P_TREE} x={x} y={onFront(x + 2) - BUSH.length + 1} />);
      else if (roll < 0.8) props.push(<Sprite key={`fl${x}`} rows={FLOWER} pal={roll < 0.62 ? P_FLOWER_A : P_FLOWER_B} x={x} y={onFront(x + 1) - FLOWER.length + 1} />);
    }
  }
  if (kind === "meadow") {
    [90, 260, 420].forEach((x) => props.push(<Sprite key={`c${x}`} rows={CRYSTAL} pal={P_CRYSTAL} x={x} y={SOIL_TOP + 4} />));
  }

  return (
    <div aria-hidden className={`hps-ground hps-ground-${kind} ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
        <path d={ridgePath(far, H)} fill={kind === "mountains" ? "#3b4a9a" : "#2a3c6e"} />
        {snow && <path d={snow} fill="#e8f0ff" />}
        <path d={ridgePath(mid, H)} fill="#245a5e" />
        {props}
        <path d={ridgePath(front, H)} fill="#2f8f4f" />
        <path d={front.map((y, x) => `M${x} ${y}h1v1h-1z`).join("")} fill="#9ae85e" />
        <path d={grass} fill="#9ae85e" />
        <path d={dither} fill="#379c58" />
        <rect x="0" y={SOIL_TOP} width={W} height={H - SOIL_TOP} fill="#6b4226" />
        <rect x="0" y={SOIL_TOP} width={W} height="2" fill="#1f6a3a" />
        <path d={stones} fill="#8a5a2b" />
        <path d={stonesDark} fill="#4a2c18" />
        {children}
      </svg>
    </div>
  );
}

// Hliněný pruh na začátku sekce: navazuje na trávu hrdiny nahoře.
export function PixelSoil({ seed }: { seed: number }) {
  const r = rng(seed);
  let stones = "";
  let dark = "";
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(r() * W);
    const y = 2 + Math.floor(r() * 9);
    const w = 1 + Math.floor(r() * 3);
    if (r() < 0.55) stones += `M${x} ${y}h${w}v1h-${w}z`;
    else dark += `M${x} ${y}h${w}v1h-${w}z`;
  }
  return (
    <div aria-hidden className="hps-soil">
      <svg viewBox={`0 0 ${W} 12`} preserveAspectRatio="xMidYMin slice" shapeRendering="crispEdges">
        <rect width={W} height="12" fill="#6b4226" />
        <rect width={W} height="1" fill="#195a30" />
        <path d={stones} fill="#8a5a2b" />
        <path d={dark} fill="#4a2c18" />
        <rect y="11" width={W} height="1" fill="#2a1a10" />
      </svg>
    </div>
  );
}

// Přechod mezi sekcemi: hlína z předchozí krajiny pokračuje, dole se nerovně „odlamuje“
// (krápníky, drobky a občas krystal) a rozpadá do oblohy další sekce. Pozadí je průhledné.
const SEAM_H = 14;
export function PixelSeam({ seed, className = "" }: { seed: number; className?: string }) {
  const r = rng(seed * 13 + 5);
  let soil = "";
  let rim = "";
  let crumbs = "";
  let crumbsFar = "";
  let stones = "";
  let gems = "";
  for (let x = 0; x < W; ) {
    const w = 2 + Math.floor(r() * 3);
    const long = r() < 0.12;
    const d = Math.min(SEAM_H - 4, 4 + Math.floor(r() * 3) + (long ? 2 + Math.floor(r() * 4) : 0));
    soil += `M${x} 0h${w}v${d}h-${w}z`;
    rim += `M${x} ${d}h${w}v1h-${w}z`;
    if (long && r() < 0.35) gems += `M${x + Math.floor(w / 2)} ${d - 2}h1v1h-1z`;
    for (let i = 0; i < w; i++) {
      if (r() < 0.32) crumbs += `M${x + i} ${d + 2}h1v1h-1z`;
      if (r() < 0.12) crumbsFar += `M${x + i} ${d + 4 + Math.floor(r() * 3)}h1v1h-1z`;
    }
    x += w;
  }
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * 3);
    const w = 1 + Math.floor(r() * 3);
    stones += `M${x} ${y}h${w}v1h-${w}z`;
  }
  return (
    <div aria-hidden className={`hps-seam ${className}`}>
      <svg viewBox={`0 0 ${W} ${SEAM_H}`} preserveAspectRatio="xMidYMin slice" shapeRendering="crispEdges">
        <path d={soil} fill="#6b4226" />
        <path d={stones} fill="#8a5a2b" />
        <path d={rim} fill="#4a2c18" />
        <path d={crumbs} fill="#4a2c18" />
        <path d={crumbsFar} fill="#3a2414" opacity={0.7} />
        <path d={gems} fill="#8fd0ff" className="hps-gem" />
      </svg>
    </div>
  );
}
