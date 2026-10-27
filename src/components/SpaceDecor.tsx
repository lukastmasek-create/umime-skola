// Ozdoby úvodní stránky z grafiky her: jeden snímek ze spritesheetu vystřižený přes CSS.
import { Butterfly3D } from "@/components/Butterfly3D";

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
    <picture
      className={`pointer-events-none block select-none ${className}`}
      style={{
        width: size,
        height: size * 0.66,
        filter: `hue-rotate(${hue}deg) drop-shadow(0 0 40px rgba(180,120,255,0.35))`,
      }}
    >
      <source media="(prefers-reduced-motion: reduce)" srcSet="/home/planeta.webp" />
      <img src="/home/anim/planeta.webp" alt="" width={size} height={size * 0.66} draggable={false} className="h-full w-full object-contain" />
    </picture>
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

// Obvodové spoje pro technickou část: po trasách putují světelné pulsy a uzly při průchodu zableskují.
const CIRCUIT_TRACKS = [
  { d: "M0 40H120L160 80H300V20H400", delay: 0, nodes: [{ x: 300, y: 80, p: 0.611 }, { x: 400, y: 20, p: 0.926 }] },
  { d: "M0 100H80L120 140H260V190", delay: -1.3, nodes: [{ x: 260, y: 140, p: 0.784 }] },
];
const CIRCUIT_PERIOD = 3.4;

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
      {CIRCUIT_TRACKS.map((t) => (
        <path key={t.d} d={t.d} />
      ))}
      <rect x="150" y="68" width="22" height="22" rx="3" />
      <rect x="110" y="128" width="22" height="22" rx="3" />
      {CIRCUIT_TRACKS.map((t) => (
        <path key={`pulse-${t.d}`} d={t.d} pathLength={100} className="circuit-pulse" style={{ animationDelay: `${t.delay}s` }} />
      ))}
      {CIRCUIT_TRACKS.flatMap((t) =>
        t.nodes.map((n) => (
          <circle
            key={`${n.x}-${n.y}`}
            cx={n.x}
            cy={n.y}
            r="5"
            fill="#35d0ff"
            stroke="none"
            className="circuit-node"
            style={{ animationDelay: `${(t.delay + (n.p - 0.7) * CIRCUIT_PERIOD).toFixed(2)}s` }}
          />
        )),
      )}
    </svg>
  );
}

// Sběrnice nad čtyřmi kartami: společná linka s pulsem a přípojka ke každé kartě (rozsvítí se při najetí).
export function TechBus({ colors }: { colors: string[] }) {
  const xs = [125, 375, 625, 875];
  return (
    <svg aria-hidden viewBox="0 0 1000 44" preserveAspectRatio="none" className="pointer-events-none relative z-10 -mb-0.5 hidden h-11 w-full lg:block">
      <path d="M0 14H1000" className="bus-line" />
      <path d="M0 14H1000" pathLength={100} className="bus-pulse" />
      {xs.map((x, i) => (
        <g key={x} style={{ ["--c" as string]: colors[i] }}>
          <path d={`M${x} 14V44`} className="bus-stub" />
          <path d={`M${x} 14V44`} pathLength={100} className="bus-stub-pulse" data-i={i} />
          <circle cx={x} cy="14" r="5" className="bus-node" data-i={i} />
        </g>
      ))}
    </svg>
  );
}

// Listy a motýli pro přírodní část (3D rendery v public/home).
const LEAVES: { img: string; pos: string; size: number; delay: string }[] = [
  { img: "list", pos: "left-[4%] top-10", size: 56, delay: "0s" },
  { img: "kapradi", pos: "right-[3%] bottom-8", size: 80, delay: "-4s" },
  { img: "houba", pos: "left-[2%] bottom-8", size: 60, delay: "-1s" },
  { img: "beruska", pos: "left-[48%] top-4", size: 40, delay: "-3s" },
];
export function NatureDecor() {
  return (
    <>
      <Butterfly3D size={110} className="butterfly-fly absolute left-[6%] top-12 z-10 hidden sm:block" />
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

// Animace z Blenderu (animované webp v public/home/anim); při vypnutých animacích se ukáže první snímek.
export function AnimArt({
  name,
  size,
  height,
  className = "",
  style,
}: {
  name: string;
  size: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <picture className={`pointer-events-none block select-none ${className}`} style={{ width: size, height: height ?? size, ...style }}>
      <source media="(prefers-reduced-motion: reduce)" srcSet={`/home/anim/${name}-still.webp`} />
      <img src={`/home/anim/${name}.webp`} alt="" width={size} height={height ?? size} draggable={false} className="h-full w-full object-contain" />
    </picture>
  );
}

// Raketa letící po vlnovce přes celou šířku (3D animace s plápolajícím plamenem).
export function Rocket({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`rocket-path pointer-events-none absolute left-0 z-0 select-none ${className}`}>
      <AnimArt name="raketa" size={72} height={90} style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))" }} />
    </div>
  );
}
