// Ilustrace úvodní karty obchodu: kosmonaut Umíme prorazí rám karty zevnitř (kolem se sypou střepy,
// z trhliny září zlaté světlo a lítají mince). SVG je zakotvené k pravému hornímu rohu karty;
// zubatá hrana (JAG) musí sedět s clip-path `.gs-hero-card` v globals.css.
const INK = "#14132a";
const GOLD = "#ffc933";

// Hrana trhliny: [vzdálenost zprava, y od horního okraje karty]. Svg má šířku W a horní přesah TOP.
export const W = 400;
export const TOP = 110;
const JAG: [number, number][] = [
  [372, 0], [338, 24], [312, 8], [276, 52], [244, 26], [210, 78], [172, 44], [134, 100], [96, 58], [58, 112], [26, 72], [0, 124],
];
const pt = ([r, y]: [number, number]) => `${W - r},${y + TOP}`;
const EDGE = JAG.map(pt).join(" ");

// Střepy karty: [x, y, velikost, rotace, zpoždění]
const SHARDS: [number, number, number, number, number][] = [
  [330, 40, 1, 24, 0], [376, 120, 0.7, -38, 0.8], [250, 6, 0.8, 70, 1.4], [350, 190, 0.55, 12, 0.4], [116, 22, 0.6, -20, 1.9],
];

function Shard({ x, y, s, r, d }: { x: number; y: number; s: number; r: number; d: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <g className="gs-shard" style={{ animationDelay: `${-d}s` }}>
        <path d="M-22 -10 L8 -26 L30 -4 L14 22 L-14 18Z" fill="url(#sha-card)" stroke={INK} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M-22 -10 L8 -26 L30 -4" fill="none" stroke="#e8e3ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />
        <path d="M-8 -2 L10 -10 M2 6 L14 2" stroke="#ffc933" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      </g>
    </g>
  );
}

function Coin({ x, y, r = 11, d = 0 }: { x: number; y: number; r?: number; d?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="gs-coin" style={{ animationDelay: `${-d}s` }}>
        <circle r={r} fill="url(#sha-gold)" stroke={INK} strokeWidth="3" />
        <circle r={r - 4.4} fill="none" stroke="#fff3b8" strokeWidth="1.8" />
        <path d={`M${-r + 3} -2 A${r - 2} ${r - 2} 0 0 1 -2 ${-r + 3}`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".65" />
      </g>
    </g>
  );
}

function Spark({ x, y, s = 1, d = 0 }: { x: number; y: number; s?: number; d?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="gs-spark" style={{ animationDelay: `${-d}s` }} d="M0 -11 Q1.4 -1.4 11 0 Q1.4 1.4 0 11 Q-1.4 1.4 -11 0 Q-1.4 -1.4 0 -11Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </g>
  );
}

function Astronaut() {
  return (
    <g>
      {/* batoh */}
      <rect x="-60" y="104" width="120" height="96" rx="22" fill="url(#sha-dark)" stroke={INK} strokeWidth="4.4" />
      <rect x="-50" y="116" width="100" height="10" rx="5" fill="#4c4f9c" opacity=".7" />
      <circle cx="-42" cy="176" r="5" fill="#ff7a96" stroke={INK} strokeWidth="2" />
      <circle cx="-26" cy="176" r="5" fill="#6ee7b7" stroke={INK} strokeWidth="2" />
      {/* nohy */}
      {[-1, 1].map((k) => (
        <g key={k}>
          <path d={`M${k * 8 - 17} 250 H${k * 8 + 17} L${k * 8 + 19} 340 H${k * 8 - 19}Z`} fill="url(#sha-suit)" stroke={INK} strokeWidth="4.4" strokeLinejoin="round" />
          <rect x={k * 8 - 17} y="282" width="34" height="14" rx="6" fill="#d8d6ee" stroke={INK} strokeWidth="3" />
          <path d={`M${k * 8 - 22} 338 H${k * 8 + 22} Q${k * 8 + 26} 354 ${k * 8 + 20} 368 H${k * 8 - 20} Q${k * 8 - 26} 354 ${k * 8 - 22} 338Z`} fill="url(#sha-dark)" stroke={INK} strokeWidth="4.4" strokeLinejoin="round" />
          <path d={`M${k * 8 - 22} 349 H${k * 8 + 22}`} stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
      {/* levá ruka nahoru s mincí */}
      <path d="M-50 132 Q-86 112 -98 66" fill="none" stroke={INK} strokeWidth="36" strokeLinecap="round" />
      <path d="M-50 132 Q-86 112 -98 66" fill="none" stroke="url(#sha-suit)" strokeWidth="27" strokeLinecap="round" />
      <path d="M-70 112 Q-82 104 -88 92" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      <circle cx="-98" cy="60" r="19" fill="url(#sha-dark)" stroke={INK} strokeWidth="4.4" />
      <g className="gs-bigcoin">
        <circle cx="-98" cy="14" r="34" fill="url(#sha-gold)" stroke={INK} strokeWidth="4.6" />
        <circle cx="-98" cy="14" r="25" fill="#ffb938" stroke={INK} strokeWidth="3.4" />
        <circle cx="-98" cy="14" r="30" fill="none" stroke="#e8a020" strokeWidth="2.4" strokeDasharray="3.4 4.6" />
        <path d="M-98 -2 L-93.6 8.6 L-82 10 L-90.6 17.6 L-88 29 L-98 23 L-108 29 L-105.4 17.6 L-114 10 L-102.4 8.6Z" fill="#fff3b8" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M-120 2 A30 30 0 0 1 -104 -14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      </g>
      {/* trup */}
      <path d="M-52 112 Q-52 100 -38 100 H38 Q52 100 52 112 L46 262 Q46 276 32 276 H-32 Q-46 276 -46 262Z" fill="url(#sha-suit)" stroke={INK} strokeWidth="4.6" strokeLinejoin="round" />
      <path d="M-44 112 Q-46 180 -40 262" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" />
      <path d="M40 112 Q44 190 38 268" fill="none" stroke="#8b86c8" strokeWidth="6" strokeLinecap="round" opacity=".45" />
      <rect x="-30" y="132" width="60" height="50" rx="12" fill="url(#sha-dark)" stroke={INK} strokeWidth="3.6" />
      <rect x="-22" y="140" width="28" height="12" rx="4" fill="#6ee7b7" stroke={INK} strokeWidth="2" />
      <path d="M-19 146 h5 l3 -3 l4 6 l3 -3 h4" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="146" r="5" fill="#ff7a96" stroke={INK} strokeWidth="2" />
      <circle cx="-14" cy="168" r="4.6" fill={GOLD} stroke={INK} strokeWidth="2" />
      <circle cx="0" cy="168" r="4.6" fill="#7fd3ff" stroke={INK} strokeWidth="2" />
      <circle cx="14" cy="168" r="4.6" fill="#c3a6ff" stroke={INK} strokeWidth="2" />
      <rect x="-46" y="236" width="92" height="16" rx="7" fill="url(#sha-gold)" stroke={INK} strokeWidth="3.6" />
      <rect x="-9" y="232" width="18" height="24" rx="5" fill="#ffd24d" stroke={INK} strokeWidth="3" />
      <path d="M-38 241 H-16" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      {/* pravá ruka s drahokamem */}
      <path d="M48 128 Q84 140 96 178" fill="none" stroke={INK} strokeWidth="36" strokeLinecap="round" />
      <path d="M48 128 Q84 140 96 178" fill="none" stroke="url(#sha-suit)" strokeWidth="27" strokeLinecap="round" />
      <path d="M62 128 Q82 134 92 154" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <g className="gs-gem">
        <path d="M82 190 L92 172 H122 L132 190 L107 226Z" fill="#6ee7b7" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M82 190 H132 M92 172 L99 190 L107 226 L115 190 L122 172" fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" opacity=".5" />
        <path d="M115 190 L107 226 L132 190Z" fill="#22b987" opacity=".55" />
        <path d="M94 177 H104 L100 186 H89Z" fill="#fff" opacity=".8" />
      </g>
      <circle cx="96" cy="184" r="19" fill="url(#sha-dark)" stroke={INK} strokeWidth="4.4" />
      {/* přilba */}
      <rect x="-26" y="86" width="52" height="22" rx="9" fill="#8b86c8" stroke={INK} strokeWidth="4" />
      <path d="M-24 94 H24" stroke="#fff" strokeWidth="2.6" opacity=".4" />
      <path d="M0 6 V-22" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M0 6 V-22" stroke="#d8d6ee" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="-26" r="9" fill="#ff7a96" stroke={INK} strokeWidth="3.6" />
      <circle cx="-3" cy="-29" r="2.4" fill="#fff" opacity=".85" />
      <circle cx="0" cy="50" r="52" fill="url(#sha-helmet)" stroke={INK} strokeWidth="4.8" />
      <rect x="-60" y="38" width="14" height="30" rx="7" fill="#b9b4e6" stroke={INK} strokeWidth="3.6" />
      <rect x="46" y="38" width="14" height="30" rx="7" fill="#b9b4e6" stroke={INK} strokeWidth="3.6" />
      <path d="M-40 22 Q-30 8 -12 4" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".75" />
      <ellipse cx="0" cy="52" rx="39" ry="32" fill="url(#sha-visor)" stroke={INK} strokeWidth="4.4" />
      <path d="M-30 38 Q-22 26 -6 24" fill="none" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" opacity=".85" />
      <path d="M14 30 Q24 34 28 44" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".45" />
      <circle cx="22" cy="68" r="2.4" fill="#fff" opacity=".6" />
      <circle cx="-26" cy="64" r="1.8" fill="#fff" opacity=".6" />
      {/* veselý obličej za sklem */}
      <g className="gs-eyes">
        <path d="M-17 52 Q-11 42 -5 52" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M5 52 Q11 42 17 52" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
      </g>
      <path d="M-8 62 Q0 72 8 62" fill="#ff7a96" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <ellipse cx="-22" cy="62" rx="5" ry="3" fill="#ff8a8a" opacity=".55" />
      <ellipse cx="22" cy="62" rx="5" ry="3" fill="#ff8a8a" opacity=".55" />
    </g>
  );
}

export function ShopHeroArt() {
  return (
    <svg className="gs-hero-art" viewBox={`0 0 ${W} 520`} width={W} height={520} aria-hidden focusable="false">
      <defs>
        <linearGradient id="sha-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3680" /><stop offset="1" stopColor="#1c1936" /></linearGradient>
        <linearGradient id="sha-suit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#e4e1f7" /><stop offset="1" stopColor="#a9a4d6" /></linearGradient>
        <radialGradient id="sha-helmet" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#dcd9f3" /><stop offset="1" stopColor="#9a95cf" /></radialGradient>
        <linearGradient id="sha-visor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b3f9c" /><stop offset=".5" stopColor="#171640" /><stop offset="1" stopColor="#0b0a24" /></linearGradient>
        <linearGradient id="sha-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a4d9e" /><stop offset="1" stopColor="#1d1b45" /></linearGradient>
        <linearGradient id="sha-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe27a" /><stop offset="1" stopColor="#ffb21f" /></linearGradient>
        <radialGradient id="sha-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd24d" stopOpacity=".85" /><stop offset=".5" stopColor="#ff9d2e" stopOpacity=".28" /><stop offset="1" stopColor="#ff9d2e" stopOpacity="0" /></radialGradient>
        <linearGradient id="sha-crack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b8" /><stop offset="1" stopColor="#ffc933" stopOpacity="0" /></linearGradient>
        <filter id="sha-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        <clipPath id="sha-below"><polygon points={`${EDGE} ${W},${TOP + 124} ${W},520 0,520 0,${TOP}`} /></clipPath>
      </defs>

      {/* zlatá záře a paprsky z trhliny */}
      <circle cx="200" cy={TOP + 60} r="190" fill="url(#sha-glow)" className="gs-glow" />
      <g className="gs-rays" opacity=".5">
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d="M200 170 L188 -10 H212Z" fill="#ffd24d" opacity=".35" transform={`rotate(${i * 36} 200 170)`} />
        ))}
      </g>

      {/* hrana prasklého rámu: tmavý lem, světlý odlesk a zlatá žhavá linka */}
      <polyline points={EDGE} fill="none" stroke={INK} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={EDGE} fill="none" stroke="#e8e3ff" strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" opacity=".85" />
      <polyline points={EDGE} fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="gs-hot" transform="translate(0 6)" opacity=".9" />

      {/* trhliny do karty */}
      <g clipPath="url(#sha-below)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[
          "M28 214 L16 268 L34 300 L20 350",
          "M96 168 L78 214 L96 256 L70 306",
          "M172 154 L158 204 L180 238",
          "M276 162 L292 214 L270 252 L286 292",
          "M338 134 L322 188 L344 226",
        ].map((d) => (
          <g key={d}>
            <path d={d} stroke={INK} strokeWidth="7" />
            <path d={d} stroke="url(#sha-crack)" strokeWidth="3" className="gs-hot" />
          </g>
        ))}
      </g>

      {/* střepy a mince */}
      {SHARDS.map(([x, y, s, r, d], i) => (
        <Shard key={i} x={x} y={y} s={s} r={r} d={d} />
      ))}
      <Coin x={52} y={112} r={11} d={0.3} />
      <Coin x={370} y={64} r={9} d={1.1} />
      <Coin x={302} y={96} r={8} d={1.7} />
      <Coin x={30} y={196} r={8} d={0.9} />

      {/* kosmonaut: vylétá z trhliny */}
      <g transform={`translate(200 ${TOP - 70})`}>
        <g className="gs-astro">
          <Astronaut />
        </g>
      </g>

      {/* prach u trhliny */}
      {[[108, 128, 14], [168, 150, 11], [244, 138, 16], [306, 154, 10], [60, 150, 9]].map(([x, y, r], i) => (
        <circle key={i} className="gs-dust" cx={x} cy={y + 10} r={r} fill="#f6f1e4" fillOpacity=".55" style={{ animationDelay: `${-i * 0.7}s` }} />
      ))}
      <Spark x={36} y={60} s={1.2} d={0} />
      <Spark x={382} y={22} s={1} d={1} />
      <Spark x={150} y={14} s={0.8} d={1.6} />
      <Spark x={330} y={170} s={0.9} d={0.6} />
    </svg>
  );
}
