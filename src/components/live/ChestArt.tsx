import type { ChestOutcome } from "@/lib/live/types";

// Truhly Zlaté horečky ve stejném jazyku jako scénky na homepage (papír, světlo zleva shora,
// tři tóny na předmět, filtr Rough). Každá truhla má vlastní id filtru, aby se ID nesrazila.

const Shadow = ({ cx, cy, rx, ry = 2.6 }: { cx: number; cy: number; rx: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity=".3" />
);

function Rough({ id, seed }: { id: string; seed: number }) {
  return (
    <filter id={id} x="-6%" y="-6%" width="112%" height="114%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feMorphology in="d" operator="dilate" radius="1.2" result="o" />
      <feFlood floodColor="#14132a" />
      <feComposite in2="o" operator="in" result="ink" />
      <feMerge>
        <feMergeNode in="ink" />
        <feMergeNode in="d" />
      </feMerge>
    </filter>
  );
}

// Tři barevné varianty zavřené truhly (světlý, základní a stínový tón dřeva/barvy).
const TONES = [
  { base: "#c77d2e", light: "#e9a152", dark: "#8f4f17" },
  { base: "#4c8be2", light: "#86b6f4", dark: "#2b5fa8" },
  { base: "#46c08b", light: "#7fe2b6", dark: "#25805d" },
];

function Body({ tone }: { tone: (typeof TONES)[number] }) {
  return (
    <>
      <rect x="14" y="52" width="92" height="36" rx="4" fill={tone.base} />
      <rect x="14" y="52" width="92" height="3.4" rx="1.7" fill="#fff" opacity=".35" />
      <rect x="96" y="54" width="10" height="32" rx="3" fill={tone.dark} opacity=".7" />
      <rect x="14" y="80" width="92" height="8" rx="3" fill="#000" opacity=".12" />
      {[38, 76].map((x) => (
        <rect key={x} x={x} y="52" width="7" height="36" fill="#d8cdb5" opacity=".95" />
      ))}
    </>
  );
}

function Lock() {
  return (
    <>
      <rect x="51" y="58" width="18" height="18" rx="4" fill="#ffc933" />
      <rect x="51" y="58" width="18" height="4" rx="2" fill="#fff3b0" />
      <rect x="51" y="71" width="18" height="5" rx="2.4" fill="#c98a0e" opacity=".6" />
      <circle cx="60" cy="67" r="2.6" fill="#8f4f17" />
    </>
  );
}

/** Zavřená truhla: tři varianty barev, aby se daly rozlišit na tlačítkách výběru. */
export function ChestClosed({ tone = 0, id, className }: { tone?: 0 | 1 | 2; id: string; className?: string }) {
  const t = TONES[tone];
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden focusable="false">
      <defs>
        <Rough id={`rough-${id}`} seed={tone * 4 + 5} />
      </defs>
      <g filter={`url(#rough-${id})`}>
        <Shadow cx={60} cy={92} rx={50} />
        <Body tone={t} />
        <path d="M14 54C14 22 106 22 106 54Z" fill={t.light} />
        <path d="M14 54C14 22 106 22 106 54Z" fill="#000" opacity=".08" />
        <path d="M22 46C30 30 60 26 92 34" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2.4" strokeLinecap="round" />
        <rect x="14" y="52" width="92" height="3" fill="#000" opacity=".15" />
        <Lock />
      </g>
    </svg>
  );
}

// Obsah otevřené truhly podle výsledku.
function Contents({ kind }: { kind: ChestOutcome["kind"] }) {
  if (kind === "gold") {
    return (
      <>
        <ellipse cx="60" cy="56" rx="32" ry="7" fill="#c98a0e" />
        <ellipse cx="60" cy="52" rx="30" ry="6.5" fill="#ffc933" />
        <ellipse cx="50" cy="49" rx="9" ry="3" fill="#fff3b0" opacity=".9" />
        {[
          [44, 46],
          [60, 42],
          [76, 46],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="6" ry="6" fill="#ffc933" className="pcard-bub" style={{ animationDelay: `${-i * 0.9}s` }} />
        ))}
        <path d="M28 26L30 30L34 31L30 33L28 37L26 33L22 31L26 30Z" fill="#fff" opacity=".85" />
      </>
    );
  }
  if (kind === "steal") {
    // Pytel: bílé plátno s dlouhou šňůrou a zlatem, na něm šipka „ukradeno“.
    return (
      <>
        <path d="M44 56C40 46 36 40 44 34H76C84 40 80 46 76 56Z" fill="#9b6bd6" />
        <path d="M44 56C40 46 36 40 44 34H54C48 40 46 48 48 56Z" fill="#fff" opacity=".22" />
        <path d="M50 34C50 28 70 28 70 34" fill="none" stroke="#6b43a8" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="60" cy="48" r="7" fill="#ffc933" />
        <circle cx="57.6" cy="45.4" r="2" fill="#fff3b0" opacity=".9" />
        <path d="M86 40L100 40M94 34L100 40L94 46" fill="none" stroke="#ff8a6b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }
  // Past: černá bomba s doutnákem a jiskrou.
  return (
    <>
      <circle cx="60" cy="46" r="13" fill="#16132b" />
      <circle cx="55" cy="41" r="3.4" fill="#fff" opacity=".22" />
      <rect x="58" y="30" width="5" height="6" rx="1.4" fill="#8f4f17" />
      <path d="M62 30C66 24 72 24 74 20" fill="none" stroke="#ffc933" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="75" cy="19" r="3" fill="#ff8a6b" className="pcard-bub" />
      <circle cx="82" cy="28" r="2" fill="#ffc933" className="pcard-bub" style={{ animationDelay: "-1s" }} />
    </>
  );
}

/** Jen obsah truhly (bez těla) jako malá ikona do legendy. */
export function LootIcon({ kind, id, className }: { kind: ChestOutcome["kind"]; id: string; className?: string }) {
  return (
    <svg viewBox="22 14 76 52" className={className} aria-hidden focusable="false">
      <defs>
        <Rough id={`rough-${id}`} seed={kind === "gold" ? 3 : kind === "steal" ? 9 : 13} />
      </defs>
      <g filter={`url(#rough-${id})`}>
        <Contents kind={kind} />
      </g>
    </svg>
  );
}

/** Otevřená truhla s obsahem výsledku (zlato, krádež, past). */
export function ChestOpen({ kind, id, className }: { kind: ChestOutcome["kind"]; id: string; className?: string }) {
  const tone = kind === "gold" ? TONES[0] : kind === "steal" ? TONES[1] : TONES[2];
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden focusable="false">
      <defs>
        <Rough id={`rough-${id}`} seed={kind === "gold" ? 3 : kind === "steal" ? 9 : 13} />
      </defs>
      <g filter={`url(#rough-${id})`}>
        <Shadow cx={60} cy={92} rx={50} />
        {/* víko vyklopené dozadu: je za tělem truhly a za obsahem */}
        <path d="M14 50C10 14 110 14 106 50Z" fill={tone.light} transform="translate(0 -10) rotate(-6 60 50)" />
        <path d="M18 40C30 22 90 22 102 40" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2.2" strokeLinecap="round" transform="translate(0 -10) rotate(-6 60 50)" />
        <Body tone={tone} />
        <ellipse cx="60" cy="54" rx="46" ry="6" fill="#3b1f0e" />
        <Contents kind={kind} />
      </g>
    </svg>
  );
}
