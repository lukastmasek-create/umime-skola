// Prasklý rám úvodní karty obchodu (trhliny, zlatá záře, mince; střepy a výbuch jsou v ShopHeroStage). Kosmonauta jako sekvenci 3D snímků
// přehrává ShopHeroStage. SVG je zakotvené k pravému hornímu rohu karty; zubatá hrana (JAG) musí sedět
// s clip-path `.gs-hero-card` v globals.css.
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

      {/* trhliny ve třech stupních kolem místa nárazu hlavou (200, 122): po 1. skoku, po 2. skoku a před prorazem */}
      {[
        ["gs-web1", ["M200 122 L172 100 L160 76", "M200 122 L212 90 L206 64", "M200 122 L232 104 L244 84", "M200 122 L186 150 L170 160"]],
        ["gs-web2", ["M172 100 L140 108", "M212 90 L238 70", "M232 104 L262 112", "M186 150 L180 184 L160 196", "M160 76 L134 64", "M244 84 L270 76"]],
        ["gs-web3", ["M200 122 L226 156 L262 168 L290 160", "M140 108 L112 96 L96 74", "M206 64 L196 34 L212 10", "M270 76 L296 58", "M160 196 L130 210 L116 236", "M180 184 L200 214 L196 246"]],
      ].map(([cls, paths]) => (
        <g key={cls as string} className={`gs-web ${cls}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {(paths as string[]).map((d) => (
            <g key={d}>
              <path d={d} stroke={INK} strokeWidth="7" />
              <path d={d} stroke="#fff3b8" strokeWidth="2.6" pathLength={100} className="gs-webline" />
            </g>
          ))}
        </g>
      ))}
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

      {/* mince */}
      <Coin x={52} y={112} r={11} d={0.3} />
      <Coin x={370} y={64} r={9} d={1.1} />
      <Coin x={302} y={96} r={8} d={1.7} />
      <Coin x={30} y={196} r={8} d={0.9} />

      <Spark x={36} y={60} s={1.2} d={0} />
      <Spark x={382} y={22} s={1} d={1} />
      <Spark x={150} y={14} s={0.8} d={1.6} />
      <Spark x={330} y={170} s={0.9} d={0.6} />
    </svg>
  );
}
