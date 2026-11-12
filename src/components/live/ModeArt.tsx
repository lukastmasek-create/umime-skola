import type { LiveMode } from "@/lib/live/types";

/** Vlastní ploché ilustrace jednotlivých režimů živé hry (SVG, bez textu, čitelné v obou motivech). */
const INK = "#16132b";
const PAPER = "#fffdf5";

function Quiz() {
  return (
    <>
      <rect x="10" y="14" width="62" height="18" rx="6" fill={PAPER} stroke={INK} strokeWidth="3" />
      <rect x="18" y="22" width="30" height="4" rx="2" fill={INK} opacity="0.5" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={10 + (i % 2) * 33} y={40 + Math.floor(i / 2) * 14} width="29" height="10" rx="4" fill={["#ff6b6b", "#4dabf7", "#ffd43b", "#51cf66"][i]} stroke={INK} strokeWidth="2" />
      ))}
      <circle cx="94" cy="50" r="20" fill={PAPER} stroke={INK} strokeWidth="3" />
      <path d="M94 50 L94 38 M94 50 L104 56" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="89" y="24" width="10" height="5" rx="2" fill={INK} />
    </>
  );
}

function Race() {
  return (
    <>
      <rect x="6" y="14" width="108" height="62" rx="8" fill="#e9f5ff" stroke={INK} strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1="6" y1={32 + i * 16} x2="114" y2={32 + i * 16} stroke={INK} strokeWidth="2" strokeDasharray="5 5" opacity="0.35" />
          <rect x={14 + i * 18} y={24 + i * 16} width="18" height="10" rx="5" fill={["#ff6b6b", "#4dabf7", "#51cf66"][i]} stroke={INK} strokeWidth="2" />
        </g>
      ))}
      <rect x="92" y="14" width="4" height="62" fill={INK} />
      <path d="M96 18 L110 24 L96 30 Z" fill="#ffd43b" stroke={INK} strokeWidth="2" />
    </>
  );
}

function Gold() {
  return (
    <>
      <path d="M22 44 Q22 24 60 24 Q98 24 98 44 Z" fill="#c77d2e" stroke={INK} strokeWidth="3" />
      <rect x="22" y="44" width="76" height="28" rx="3" fill="#a8621f" stroke={INK} strokeWidth="3" />
      <rect x="56" y="44" width="8" height="10" rx="2" fill="#ffd43b" stroke={INK} strokeWidth="2" />
      {[
        [34, 16],
        [52, 8],
        [70, 14],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="#ffd43b" stroke={INK} strokeWidth="2" />
      ))}
    </>
  );
}

function Streak() {
  return (
    <>
      <path d="M60 14 C74 30 84 40 80 58 C78 70 70 76 60 76 C48 76 40 68 40 58 C40 50 46 46 50 38 C54 46 56 50 60 52 C60 40 56 28 60 14 Z" fill="#ff922b" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M60 46 C68 54 70 60 68 66 C66 72 62 74 60 74 C56 74 52 70 52 66 C52 60 56 56 60 46 Z" fill="#ffd43b" />
      <rect x="82" y="14" width="30" height="20" rx="10" fill="#ff6b6b" stroke={INK} strokeWidth="2.5" />
      <text x="97" y="29" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">×5</text>
    </>
  );
}

function Survival() {
  const heart = "M0 8 C0 0 12 -2 14 6 C16 -2 28 0 28 8 C28 18 14 26 14 26 C14 26 0 18 0 8 Z";
  return (
    <>
      <g transform="translate(6 30) scale(1.4)">
        <path d={heart} fill="#ff6b6b" stroke={INK} strokeWidth="1.6" />
      </g>
      <g transform="translate(40 30) scale(1.4)">
        <path d={heart} fill="#ff6b6b" stroke={INK} strokeWidth="1.6" />
      </g>
      <g transform="translate(74 30) scale(1.4)" opacity="0.3">
        <path d={heart} fill="#adb5bd" stroke={INK} strokeWidth="1.6" />
      </g>
      <path d="M70 46 L76 52 L72 56 L80 62" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="14" y="70" width="92" height="8" rx="4" fill={INK} opacity="0.15" />
      <rect x="14" y="70" width="60" height="8" rx="4" fill="#51cf66" />
    </>
  );
}

function Teams() {
  return (
    <>
      <path d="M26 16 L26 62" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M26 16 L50 24 L26 32 Z" fill="#4dabf7" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M94 16 L94 62" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M94 16 L70 24 L94 32 Z" fill="#ff6b6b" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="34" cy="62" r="10" fill="#4dabf7" stroke={INK} strokeWidth="2.5" />
      <circle cx="86" cy="62" r="10" fill="#ff6b6b" stroke={INK} strokeWidth="2.5" />
      <circle cx="60" cy="54" r="12" fill="#ffd43b" stroke={INK} strokeWidth="2.5" />
      <path d="M46 74 Q60 66 74 74" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </>
  );
}

const ART: Record<LiveMode, () => React.JSX.Element> = { QUIZ: Quiz, RACE: Race, GOLD: Gold, STREAK: Streak, SURVIVAL: Survival, TEAMS: Teams };

export function ModeArt({ mode, className = "h-16 w-auto" }: { mode: LiveMode; className?: string }) {
  const Art = ART[mode];
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden focusable="false">
      <Art />
    </svg>
  );
}
