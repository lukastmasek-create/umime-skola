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

// Planeta se otáčí a obíhá ji měsíc (animovaný 3D render z Blenderu, public/home/planeta-tocici.webp).
export function Planet({ className = "", size = 420, hue = 0 }: { className?: string; size?: number; hue?: number }) {
  return (
    <div
      aria-hidden
      className={`planet-anim pointer-events-none select-none ${className}`}
      style={{
        width: size * 1.25,
        height: size * 1.25 * (232 / 596),
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

// Hvězdy, prach a padající hvězdy ze 3D renderu v Blenderu (smyčka na černém pozadí, skládá se přes mlhovinu).
export function StarsVideo({ className = "" }: { className?: string }) {
  return (
    <video
      aria-hidden
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className={`stars-video pointer-events-none select-none object-cover ${className}`}
      style={{
        opacity: 0.4,
        maskImage: "linear-gradient(180deg, transparent, #000 18%, #000 80%, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, transparent, #000 18%, #000 80%, transparent)",
      }}
    >
      <source src="/home/hvezdy.webm" type="video/webm" />
      <source src="/home/hvezdy.mp4" type="video/mp4" />
    </video>
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
      {/* Světelné impulsy běžící po vodičích */}
      {["M0 40H120L160 80H300", "M0 100H80L120 140H260", "M300 80V20H400", "M260 140V190"].map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={100}
          className="circuit-pulse"
          style={{ animationDelay: `${-i * 1.1}s`, animationDuration: `${3.2 + i * 0.5}s` }}
        />
      ))}
      <circle cx="300" cy="80" r="5" fill="#35d0ff" className="tech-blink" />
      <circle cx="260" cy="140" r="5" fill="#35d0ff" />
      <circle cx="400" cy="20" r="4" fill="#35d0ff" className="tech-blink" style={{ animationDelay: "-0.8s" }} />
      <rect x="150" y="68" width="22" height="22" rx="3" />
      <rect x="110" y="128" width="22" height="22" rx="3" />
    </svg>
  );
}

// Listy a motýli pro přírodní část (3D rendery v public/home).
const LEAVES: { img: string; pos: string; size: number; delay: string }[] = [
  { img: "list", pos: "left-[4%] top-10", size: 56, delay: "0s" },
  { img: "motyl", pos: "right-[7%] top-8", size: 60, delay: "-2s" },
  { img: "kapradi", pos: "right-[3%] bottom-8", size: 80, delay: "-4s" },
  { img: "houba", pos: "left-[2%] bottom-8", size: 60, delay: "-1s" },
  { img: "beruska", pos: "left-[48%] top-4", size: 40, delay: "-3s" },
];
export function NatureDecor() {
  return (
    <>
      <HomeArt name="liana" size={190} className="pointer-events-none absolute bottom-28 left-[0.5%] z-0 hidden h-auto w-36 xl:block 2xl:left-[3%] 2xl:w-44" />
      <HomeArt name="liana" size={190} className="pointer-events-none absolute bottom-28 right-[0.5%] z-0 hidden h-auto w-36 -scale-x-100 xl:block 2xl:right-[3%] 2xl:w-44" />
      {LEAVES.map((l) => (
        <HomeArt key={l.img} name={l.img} size={l.size} className={`leaf-sway absolute z-0 hidden sm:block ${l.pos}`} style={{ animationDelay: l.delay }} />
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
