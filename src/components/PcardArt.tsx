import { PcardScene } from "./PcardScenes";

// SVG výzdoba nakloněných karet kategorií na homepage: pozadí, ilustrační scénka (PcardScenes),
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
      </svg>

      {/* ilustrační scénka na spodku karty */}
      <PcardScene slug={s} />

      {/* hvězdičky třpytící se po kartě */}
      <svg className="pcard-sparks" viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
        <Star x={228} y={104} s={8} d={0} />
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
