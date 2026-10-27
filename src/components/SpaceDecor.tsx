// Ozdoby úvodní stránky z grafiky her: jeden snímek ze spritesheetu vystřižený přes CSS.

type Sheet = { file: string; cols: number };
const SHEETS: Record<string, Sheet> = {
  aliens: { file: "/game-sprites/space/mimozemstane.webp", cols: 8 },
  ship: { file: "/game-sprites/space/lod.webp", cols: 7 },
  bonus: { file: "/game-sprites/space/bonusy.webp", cols: 3 },
};

export function SpriteFrame({
  sheet,
  col,
  row,
  size,
  className = "",
  style,
}: {
  sheet: keyof typeof SHEETS;
  col: number;
  row: number;
  size: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const s = SHEETS[sheet];
  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${s.file})`,
        backgroundSize: `${s.cols * size}px auto`,
        backgroundPosition: `${-col * size}px ${-row * size}px`,
        backgroundRepeat: "no-repeat",
        filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))",
        ...style,
      }}
    />
  );
}

// Řádek v listu mimozemšťanů: kyklop 0, krab 1, chobotnice 2, ufo 3.
export const ALIEN_ROW = { kyklop: 0, krab: 1, chobotnice: 2, ufo: 3 } as const;

export function Planet({ className = "", size = 420, hue = 0 }: { className?: string; size?: number; hue?: number }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size * 0.66,
        backgroundImage: "url(/home/planeta.webp)",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: `hue-rotate(${hue}deg) drop-shadow(0 0 40px rgba(180,120,255,0.35))`,
      }}
    />
  );
}

export function Nebula({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{
        backgroundImage: "url(/game-sprites/space/pozadi_mlhovina.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: flip ? "scaleX(-1)" : undefined,
        maskImage: "linear-gradient(180deg, transparent, #000 25%, #000 75%, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, transparent, #000 25%, #000 75%, transparent)",
        opacity: 0.55,
      }}
    />
  );
}

// Vlnitý přechod mezi světy: vyplní horní okraj barvou předchozí části.
export function Wave({ fill, className = "" }: { fill: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-8 w-full sm:h-12 ${className}`}
    >
      <path
        d="M0 0H1440V22C1320 54 1190 12 1050 32 910 52 780 8 630 30 480 52 340 10 200 30 110 43 50 36 0 26Z"
        fill={fill}
      />
    </svg>
  );
}

// Hřebeny hor se sněhem na dolním okraji (render z Blenderu, spodek ladí s další částí #160a2c).
export function Mountains() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 w-full select-none sm:h-52"
      style={{ backgroundImage: "url(/home/hory.webp)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}
    />
  );
}

// Obvodové spoje pro technickou část.
export function Circuit({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      className={`pointer-events-none absolute ${className}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
      stroke="#35d0ff"
      strokeOpacity="0.4"
      strokeWidth="2"
    >
      <path d="M0 40H120L160 80H300M0 100H80L120 140H260M300 80V20H400M260 140V190" />
      <circle cx="300" cy="80" r="5" fill="#35d0ff" className="tech-blink" />
      <circle cx="260" cy="140" r="5" fill="#35d0ff" />
      <circle cx="400" cy="20" r="4" fill="#35d0ff" className="tech-blink" style={{ animationDelay: "-0.8s" }} />
      <rect x="150" y="68" width="22" height="22" rx="3" />
      <rect x="110" y="128" width="22" height="22" rx="3" />
    </svg>
  );
}

// Přírodní část: listy, houba a kapradí se houpou, motýl krouží po obloze, listy padají, světlušky svítí
// a beruška přechází po nadpisu. Vše je čistě ozdobné a vypíná se při „omezit pohyb“.
const LEAVES: { img: string; pos: string; size: number; delay: string; cls: string }[] = [
  { img: "list", pos: "left-[4%] top-10", size: 56, delay: "0s", cls: "leaf-sway" },
  { img: "kapradi", pos: "right-[3%] bottom-8", size: 80, delay: "-4s", cls: "fern-sway" },
  { img: "houba", pos: "left-[2%] bottom-8", size: 60, delay: "-1s", cls: "shroom-wobble" },
];
const FALLING: { left: string; size: number; delay: string; dur: string }[] = [
  { left: "12%", size: 34, delay: "-2s", dur: "17s" },
  { left: "31%", size: 26, delay: "-9s", dur: "21s" },
  { left: "58%", size: 30, delay: "-5s", dur: "19s" },
  { left: "74%", size: 24, delay: "-13s", dur: "23s" },
  { left: "90%", size: 32, delay: "-7s", dur: "18s" },
];
const FIREFLIES: { left: string; top: string; delay: string; dur: string }[] = [
  { left: "8%", top: "22%", delay: "0s", dur: "7s" },
  { left: "17%", top: "58%", delay: "-2s", dur: "9s" },
  { left: "27%", top: "36%", delay: "-4s", dur: "8s" },
  { left: "38%", top: "76%", delay: "-1s", dur: "10s" },
  { left: "46%", top: "18%", delay: "-5s", dur: "7s" },
  { left: "55%", top: "64%", delay: "-3s", dur: "9s" },
  { left: "63%", top: "28%", delay: "-6s", dur: "8s" },
  { left: "72%", top: "82%", delay: "-2s", dur: "11s" },
  { left: "81%", top: "46%", delay: "-7s", dur: "9s" },
  { left: "89%", top: "70%", delay: "-4s", dur: "7s" },
  { left: "94%", top: "24%", delay: "-8s", dur: "10s" },
  { left: "3%", top: "84%", delay: "-5s", dur: "8s" },
];
export function NatureDecor() {
  return (
    <>
      {LEAVES.map((l) => (
        <HomeArt key={l.img} name={l.img} size={l.size} className={`${l.cls} absolute z-0 hidden sm:block ${l.pos}`} style={{ animationDelay: l.delay }} />
      ))}
      {FALLING.map((f, i) => (
        <HomeArt
          key={i}
          name="list"
          size={f.size}
          className="leaf-fall absolute top-0 z-0 hidden sm:block"
          style={{ left: f.left, animationDelay: f.delay, animationDuration: f.dur }}
        />
      ))}
      <div aria-hidden className="butterfly-path pointer-events-none absolute left-0 top-16 z-0 hidden sm:block">
        <HomeArt name="motyl" size={64} className="butterfly-flap" />
      </div>
      <div aria-hidden className="ladybug-walk pointer-events-none absolute z-0 hidden sm:block">
        <HomeArt name="beruska" size={34} />
      </div>
      <span aria-hidden className="peek peek-a pointer-events-none absolute bottom-0 z-0 select-none">🦔</span>
      <span aria-hidden className="peek peek-b pointer-events-none absolute bottom-0 z-0 select-none">🐿️</span>
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          aria-hidden
          className="firefly pointer-events-none absolute z-0"
          style={{ left: f.left, top: f.top, animationDelay: f.delay, animationDuration: f.dur }}
        />
      ))}
    </>
  );
}

// Obrázek z public/home (3D rendery z Blenderu, viz BLENDER_DODANO.md), čistě ozdobný.
export function HomeArt({
  name,
  size,
  className = "",
  style,
}: {
  name: string;
  size: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/home/${name}.webp`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      className={`pointer-events-none select-none object-contain ${className}`}
      style={style}
    />
  );
}

// Raketa letící po vlnovce přes celou šířku.
export function Rocket({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`rocket-path pointer-events-none absolute left-0 z-0 select-none ${className}`}>
      <div className="rocket-flame" />
    </div>
  );
}
