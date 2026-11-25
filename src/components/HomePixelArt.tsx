// Doplňková pixel-art grafika úvodní stránky ve stylu HomePixelScene:
// ikony k nadpisům sekcí, zvířátka chodící po krajině, ptáci, padající hvězda a táborák.
// Čisté SVG (crispEdges), pohyb jen v CSS (home-pixel.css), při omezeném pohybu stojí.
import { Sprite } from "@/components/HomePixelScene";

type Pal = Record<string, string>;

// ---------- ikony nadpisů (12 × 12) ----------
const ICONS: Record<IconKind, { rows: string[]; pal: Pal }> = {
  globe: {
    rows: [
      "....bbbb....",
      "..bbggbbbb..",
      ".bhgggbbbbb.",
      ".bhgggbbggb.",
      "bhgggbbbgggd",
      "bbbggbbbbggd",
      "bbbbbbbgbbbd",
      "bbbbbbggggbd",
      ".bgbbbbgggd.",
      ".bggbbbbbdd.",
      "..bbbbbddd..",
      "....dddd....",
    ],
    pal: { b: "#4f8cff", g: "#5fd07a", h: "#9fd0ff", d: "#2f5fbf" },
  },
  stairs: {
    rows: [
      "........f...",
      "........fff.",
      "........ffff",
      "........p...",
      "........p...",
      "......ssssss",
      "......llllll",
      "...sssssssss",
      "...lllllllll",
      "ssssssssssss",
      "llllllllllll",
      "dddddddddddd",
    ],
    pal: { f: "#ff6b6b", p: "#e6e6f0", s: "#c9c3ff", l: "#8a80d9", d: "#5a4fb0" },
  },
  board: {
    rows: [
      "wwwwwwwwwwww",
      "wkkkkkkkkkkw",
      "wkcckkkkkckw",
      "wkkkckkkcckw",
      "wkkcckkkkckw",
      "wkkkkkkkkckw",
      "wkcccckkkkkw",
      "wkkkkkkkkykw",
      "wwwwwwwwwwww",
      ".w........w.",
      ".w........w.",
      "ww........ww",
    ],
    pal: { w: "#b5763c", k: "#2f6b4a", c: "#f4f1e6", y: "#ffd56b" },
  },
  heart: {
    rows: [
      "............",
      ".rrr....rrr.",
      "rhhrr..rrrrr",
      "rhrrrrrrrrrd",
      "rrrrrrrrrrrd",
      "rrrrrrrrrrdd",
      ".rrrrrrrrdd.",
      "..rrrrrrdd..",
      "...rrrrdd...",
      "....rrdd....",
      ".....dd.....",
      "............",
    ],
    pal: { r: "#ff5d7a", h: "#ffc2cf", d: "#c23656" },
  },
  ask: {
    rows: [
      ".wwwwwwwwww.",
      "wwwwwqqwwwws",
      "wwwwqwwqwwws",
      "wwwwwwwqwwws",
      "wwwwwwqwwwws",
      "wwwwwqwwwwws",
      "wwwwwwwwwwws",
      "wwwwwqwwwwws",
      ".sssssssssss",
      "..ws........",
      ".ws.........",
      "ws..........",
    ],
    pal: { w: "#f4f1e6", q: "#3b4bd8", s: "#b9b3d6" },
  },
  pad: {
    rows: [
      "............",
      "............",
      ".oooooooooo.",
      "oowoooooorod",
      "owwwooooyobd",
      "oowoooooogod",
      "oooooooooood",
      "ooodddddoood",
      "ood......ood",
      ".d........d.",
      "............",
      "............",
    ],
    pal: { o: "#9aa3c7", d: "#5d6590", w: "#2a2f4f", r: "#ff5d7a", y: "#ffd56b", b: "#4f8cff", g: "#5fd07a" },
  },
};

export type IconKind = "globe" | "stairs" | "board" | "heart" | "ask" | "pad";

export function PixelIcon({ kind, size = 44, className = "" }: { kind: IconKind; size?: number; className?: string }) {
  const ic = ICONS[kind];
  return (
    <span aria-hidden className={`hp-ico ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges">
        <Sprite rows={ic.rows} pal={ic.pal} x={0} y={0} />
      </svg>
    </span>
  );
}

// ---------- zvířátka (dva snímky chůze, kreslená doprava) ----------
const CRITTERS: Record<CritterKind, { a: string[]; b: string[]; pal: Pal }> = {
  cat: {
    a: [
      ".........o.o",
      "o........ooo",
      "o........kok",
      ".ooooooooooo",
      ".oooooooooo.",
      ".o.o....o.o.",
      ".o.o....o.o.",
    ],
    b: [
      ".........o.o",
      "o........ooo",
      ".o.......kok",
      ".ooooooooooo",
      ".oooooooooo.",
      "..o.o..o.o..",
      ".o...o.o..o.",
    ],
    pal: { o: "#ff9d4d", k: "#1a1833" },
  },
  slime: {
    a: [
      "........",
      "........",
      "..gggg..",
      ".ghggggg",
      "gggkgkgg",
      "gggggggg",
      "dddddddd",
    ],
    b: [
      "........",
      "..gggg..",
      ".ghgggg.",
      ".ggkgkg.",
      ".gggggg.",
      "gggggggg",
      "dddddddd",
    ],
    pal: { g: "#7ee0b0", h: "#d8fff0", k: "#1a1833", d: "#3f9f7a" },
  },
  chick: {
    a: [
      "....r...",
      "...www..",
      "...wkwyy",
      "wwwwww..",
      ".wwwww..",
      "..y.y...",
      "..y.y...",
    ],
    b: [
      "....r...",
      "...www..",
      "...wkwyy",
      "wwwwww..",
      ".wwwww..",
      "...yy...",
      "..y..y..",
    ],
    pal: { w: "#fff3d6", k: "#1a1833", y: "#ffb03b", r: "#ff5d5d" },
  },
};

export type CritterKind = "cat" | "slime" | "chick";

// Vrací <g> do SVG krajiny (viewBox 480 × 64). `y` je řádek, na kterém zvířátko stojí.
// Kreslí se ve dvojnásobné velikosti (2 × 2 body krajiny na pixel), aby bylo vidět i na telefonu.
export function Critter({ kind, y, dur, delay, left = false }: { kind: CritterKind; y: number; dur: number; delay: number; left?: boolean }) {
  const c = CRITTERS[kind];
  const h = c.a.length;
  return (
    <g transform={left ? "translate(480 0) scale(-1 1)" : undefined}>
      <g className="hpc-walk" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <g className="hpc-hop" style={{ animationDelay: `${(delay % 1).toFixed(2)}s` }}>
          <g transform={`translate(0 ${y - h * 2}) scale(2)`}>
            <Sprite rows={c.a} pal={c.pal} x={0} y={0} className="hpc-f1" />
            <Sprite rows={c.b} pal={c.pal} x={0} y={0} className="hpc-f2" />
          </g>
        </g>
      </g>
    </g>
  );
}

// ---------- táborák (dva snímky plamene) ----------
const FIRE_A = ["..y..", ".yoy.", ".ooo.", "orrro", ".rrr."];
const FIRE_B = [".y...", "..yo.", ".oyo.", "ooroo", ".rrr."];
const LOGS = ["bb.bb", ".bbb.", "bb.bb"];
const P_FIRE: Pal = { y: "#fff3b0", o: "#ffb03b", r: "#ff5d3b" };
const P_LOGS: Pal = { b: "#6b4226" };

export function Campfire({ x, y }: { x: number; y: number }) {
  return (
    <g className="hpf" transform={`translate(${x} ${y - 16}) scale(2)`}>
      <rect x={-3} y={-1} width={11} height={10} fill="#ffb03b" opacity={0.18} className="hpf-glow" />
      <Sprite rows={FIRE_A} pal={P_FIRE} x={0} y={1} className="hpf-a" />
      <Sprite rows={FIRE_B} pal={P_FIRE} x={0} y={1} className="hpf-b" />
      <Sprite rows={LOGS} pal={P_LOGS} x={0} y={5} />
    </g>
  );
}

// ---------- ptáci a padající hvězda na obloze ----------
const BIRD_A = ["w...w", ".w.w.", "..w.."];
const BIRD_B = [".....", "wwkww", "..w.."];
const P_BIRD: Pal = { w: "#cfd6ff", k: "#cfd6ff" };

export function SkyBirds({ seed }: { seed: number }) {
  const birds = [0, 1].map((i) => ({ top: 12 + ((seed * 13 + i * 29) % 40), delay: -((seed * 7 + i * 17) % 30), dur: 34 + ((seed + i * 5) % 14) }));
  return (
    <>
      {birds.map((b, i) => (
        <svg
          key={i}
          className="hps-bird"
          viewBox="0 0 5 3"
          shapeRendering="crispEdges"
          style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        >
          <Sprite rows={BIRD_A} pal={P_BIRD} x={0} y={0} className="hpb-a" />
          <Sprite rows={BIRD_B} pal={P_BIRD} x={0} y={0} className="hpb-b" />
        </svg>
      ))}
    </>
  );
}

// hlava vpravo dole, ohon vlevo nahoře: hvězda letí šikmo dolů
const STREAK = ["cc..........", "..cc........", "....cc......", "......ccy...", "........wwy.", "..........ww"];

export function ShootingStar({ seed }: { seed: number }) {
  return (
    <svg
      className="hps-shoot"
      viewBox="0 0 12 6"
      shapeRendering="crispEdges"
      style={{ top: `${8 + (seed % 5) * 6}%`, left: `${20 + ((seed * 11) % 55)}%`, animationDelay: `${-(seed % 9)}s` }}
    >
      <Sprite rows={STREAK} pal={{ w: "#ffffff", y: "#fff3b0", c: "#8fd0ff" }} x={0} y={0} />
    </svg>
  );
}
