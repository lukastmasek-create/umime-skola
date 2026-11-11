import type { ReactNode } from "react";

// SVG výzdoba nakloněných karet kategorií na homepage: motiv na pozadí podle kategorie,
// běžící světelný rámeček, hvězdičky, rotující prstenec kolem ikony a washi páska.
// Vše je čisté SVG bez klientského JS; pohyb řeší CSS (.pcard-*) a vypíná se při reduced-motion.

type Slug = "zakladni" | "stredni" | "prijimacky" | "maturita";

const Star = ({ x, y, s, d }: { x: number; y: number; s: number; d: number }) => (
  <path
    className="pcard-spark"
    style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}
    d={`M${x} ${y - s}C${x + s * 0.12} ${y - s * 0.12} ${x + s * 0.12} ${y - s * 0.12} ${x + s} ${y}C${x + s * 0.12} ${y + s * 0.12} ${x + s * 0.12} ${y + s * 0.12} ${x} ${y + s}C${x - s * 0.12} ${y + s * 0.12} ${x - s * 0.12} ${y + s * 0.12} ${x - s} ${y}C${x - s * 0.12} ${y - s * 0.12} ${x - s * 0.12} ${y - s * 0.12} ${x} ${y - s}Z`}
    fill="currentColor"
  />
);

// Větvička vavřínu: oblouk a lístky po obou stranách.
function Laurel({ flip }: { flip?: boolean }) {
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    const x = 36 + Math.sin(t * 1.5) * 34 - t * 6;
    const y = 112 - t * 100;
    const a = -30 - t * 40;
    return (
      <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
        <ellipse cx="-9" cy="0" rx="9" ry="3.6" fill="currentColor" opacity={0.55 - t * 0.2} />
        <ellipse cx="9" cy="-2" rx="9" ry="3.6" fill="currentColor" opacity={0.4 - t * 0.15} />
      </g>
    );
  });
  return (
    <g transform={flip ? "translate(300 0) scale(-1 1)" : undefined}>
      <path d="M34 118C60 96 74 56 62 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      {leaves}
    </g>
  );
}

function Motif({ slug }: { slug: Slug }): ReactNode {
  switch (slug) {
    case "zakladni":
      return (
        <>
          {/* kopečky a vycházející slunce */}
          <circle cx="232" cy="262" r="46" fill="url(#pa-sun-zakladni)" />
          <path d="M-10 318C50 270 110 300 170 276S260 262 320 290V360H-10Z" fill="currentColor" opacity=".16" />
          <path d="M-10 336C60 300 120 330 190 306S270 300 320 318V360H-10Z" fill="currentColor" opacity=".22" />
          {/* stavebnicové kostky */}
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity=".75">
            <rect x="22" y="262" width="26" height="26" rx="5" transform="rotate(-8 35 275)" />
            <rect x="52" y="266" width="26" height="26" rx="5" transform="rotate(6 65 279)" />
            <rect x="36" y="238" width="26" height="26" rx="5" transform="rotate(-3 49 251)" />
          </g>
          <text x="40" y="260" fontSize="14" fontWeight="800" fill="currentColor" opacity=".8" transform="rotate(-3 49 251)" fontFamily="var(--font-heading)">A</text>
        </>
      );
    case "stredni":
      return (
        <>
          {/* osy s parabolou */}
          <g fill="none" stroke="currentColor" strokeLinecap="round" opacity=".75">
            <path d="M200 316V196M170 290H290" strokeWidth="1.4" opacity=".6" />
            <path d="M176 214C200 330 232 330 262 206" strokeWidth="2.2" className="pcard-draw" pathLength={100} />
            {[216, 232, 248, 264, 280].map((x) => (
              <path key={x} d={`M${x} 286v8`} strokeWidth="1.2" opacity=".6" />
            ))}
          </g>
          {/* atom */}
          <g fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".6" transform="translate(52 276)">
            <ellipse rx="34" ry="12" />
            <ellipse rx="34" ry="12" transform="rotate(60)" />
            <ellipse rx="34" ry="12" transform="rotate(-60)" />
            <circle r="4.5" fill="currentColor" stroke="none" />
          </g>
        </>
      );
    case "prijimacky":
      return (
        <>
          {/* terč se šípem */}
          <g fill="none" stroke="currentColor" opacity=".75" transform="translate(236 262)">
            <circle r="44" strokeWidth="1.4" opacity=".5" />
            <circle r="30" strokeWidth="1.6" opacity=".7" />
            <circle r="16" strokeWidth="1.8" />
            <circle r="4.5" fill="currentColor" stroke="none" />
            <path d="M0 0L-34 -32" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M-34 -32l-3 11M-34 -32l11 -3M-27 -25l-3 9M-27 -25l9 -3" strokeWidth="1.8" strokeLinecap="round" />
          </g>
          {/* odškrtnutý seznam */}
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".7">
            <path d="M24 262l6 6 12-13" className="pcard-draw" pathLength={100} />
            <path d="M52 262h44" opacity=".5" />
            <path d="M24 288l6 6 12-13" className="pcard-draw" pathLength={100} style={{ animationDelay: ".6s" }} />
            <path d="M52 288h30" opacity=".5" />
          </g>
        </>
      );
    default:
      return (
        <>
          {/* vavřínový věnec */}
          <g color="currentColor" opacity=".8" transform="translate(30 220) scale(.85)">
            <Laurel />
          </g>
          <g color="currentColor" opacity=".8" transform="translate(-34 220) scale(.85)">
            <Laurel flip />
          </g>
          {/* absolventská čepice */}
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity=".8" transform="translate(150 292)">
            <path d="M0 -20L36 -6 0 8 -36 -6Z" fill="currentColor" fillOpacity=".18" />
            <path d="M-20 2v14c10 8 30 8 40 0V2" />
            <path d="M36 -6v22" strokeLinecap="round" />
          </g>
        </>
      );
  }
}

export function PcardArt({ slug }: { slug: string }) {
  const s = (["zakladni", "stredni", "prijimacky", "maturita"].includes(slug) ? slug : "zakladni") as Slug;
  const id = `pa-${s}`;
  return (
    <>
      {/* pozadí: mřížka teček, zář a motiv kategorie */}
      <svg className="pcard-back" viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
        <defs>
          <pattern id={`${id}-dots`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="currentColor" />
          </pattern>
          <radialGradient id={`${id}-glow`} cx="85%" cy="95%" r="70%">
            <stop offset="0" stopColor="currentColor" stopOpacity=".38" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id.replace("pa-", "pa-sun-")}>
            <stop offset="0" stopColor="currentColor" stopOpacity=".5" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset=".35" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`${id}-mask`}>
            <rect width="300" height="340" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
        <rect width="300" height="340" fill={`url(#${id}-dots)`} opacity=".16" mask={`url(#${id}-mask)`} />
        <rect width="300" height="340" fill={`url(#${id}-glow)`} />
        <g className="pcard-motif">
          <Motif slug={s} />
        </g>
      </svg>

      {/* hvězdičky třpytící se po kartě */}
      <svg className="pcard-sparks" viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
        <Star x={252} y={46} s={9} d={0} />
        <Star x={42} y={128} s={6} d={1.1} />
        <Star x={268} y={140} s={5} d={2.2} />
        <Star x={74} y={44} s={4} d={0.6} />
        <Star x={216} y={96} s={3.5} d={1.7} />
      </svg>

      {/* rámeček s koloběžkou světla */}
      <svg className="pcard-frame" aria-hidden focusable="false">
        <defs>
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset=".5" stopColor="currentColor" />
            <stop offset="1" stopColor="#fff" stopOpacity=".2" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" rx="27" ry="27" pathLength={100} className="pcard-frame-run" stroke={`url(#${id}-edge)`} />
      </svg>
    </>
  );
}

// Prstenec kolem ikony: tečkovaná kružnice a oblouk, které se točí, plus dvě obíhající jiskry.
export function PcardRing() {
  return (
    <svg className="pcard-ring" viewBox="0 0 140 140" aria-hidden focusable="false">
      <circle cx="70" cy="70" r="64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 7" strokeLinecap="round" opacity=".7" className="pcard-ring-a" />
      <circle cx="70" cy="70" r="58" fill="none" stroke="currentColor" strokeWidth="2.2" strokeDasharray="38 330" strokeLinecap="round" className="pcard-ring-b" />
      <g className="pcard-orbit">
        <circle cx="70" cy="6" r="3.4" fill="#fff" />
        <circle cx="70" cy="6" r="7" fill="currentColor" opacity=".25" />
      </g>
    </svg>
  );
}

// Lepicí páska nahoře na kartě, aby nakloněná karta vypadala jako připíchnutá na nástěnce.
export function PcardTape() {
  return (
    <svg className="pcard-tape" viewBox="0 0 96 28" aria-hidden focusable="false">
      <polygon
        points="4,0 92,0 95,3.5 92,7 95,10.5 92,14 95,17.5 92,21 95,24.5 92,28 4,28 1,24.5 4,21 1,17.5 4,14 1,10.5 4,7 1,3.5"
        fill="currentColor" fillOpacity=".6" stroke="#fff" strokeOpacity=".4" strokeWidth=".8" strokeLinejoin="round"
      />
      <path d="M10 8h76M10 14h76M10 20h76" stroke="#fff" strokeOpacity=".22" strokeWidth="1.2" strokeDasharray="6 5" />
    </svg>
  );
}
