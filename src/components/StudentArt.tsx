import type { ReactNode } from "react";
import type { FeatureKey } from "@/i18n/audience";

// SVG ilustrace do hlavičky karet pro žáky. Barvy se berou z karty:
// --ga je akcent karty, zbytek je jemná bílá. Animuje se přes třídy v globals.css:
//   sv-pop   = vyskočí při vjezdu karty (zpoždění z --d)
//   sv-float = při hoveru se lehce zvedne
//   sv-spin  = při hoveru se otočí
const A = "var(--ga)";
const S = "rgba(246,241,228,0.55)";
const F = "rgba(255,255,255,0.13)";
const INK = "#0b0b0f";

function Pop({ d, float, spin, children }: { d: number; float?: boolean; spin?: boolean; children: ReactNode }) {
  return (
    <g className={`sv-pop${float ? " sv-float" : ""}${spin ? " sv-spin" : ""}`} style={{ ["--d" as string]: d }}>
      {children}
    </g>
  );
}

function Sparkle({ x, y, s = 1, d }: { x: number; y: number; s?: number; d: number }) {
  return (
    <Pop d={d} float>
      <path
        d={`M${x} ${y - 7 * s} Q${x} ${y} ${x + 7 * s} ${y} Q${x} ${y} ${x} ${y + 7 * s} Q${x} ${y} ${x - 7 * s} ${y} Q${x} ${y} ${x} ${y - 7 * s}Z`}
        fill={A}
      />
    </Pop>
  );
}

const SCENES: Record<FeatureKey, () => ReactNode> = {
  // Schody k cíli s vlajkou
  courses: () => (
    <>
      <Pop d={0}><rect x="58" y="92" width="58" height="32" rx="9" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={1}><rect x="121" y="70" width="58" height="54" rx="9" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={2}><rect x="184" y="46" width="58" height="78" rx="9" fill={A} /></Pop>
      <Pop d={3} float>
        <path d="M213 46 V22" stroke={S} strokeWidth="3" strokeLinecap="round" />
        <path d="M213 22 l24 8 l-24 8z" fill="#f6f1e4" />
      </Pop>
      <Sparkle x={86} y={56} d={4} />
    </>
  ),
  // Kalendář s dnešním dnem
  daily: () => (
    <>
      <Pop d={0}>
        <rect x="92" y="36" width="116" height="90" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <path d="M92 62 H208" stroke={S} strokeWidth="2" />
        <path d="M124 28 V44 M176 28 V44" stroke={A} strokeWidth="6" strokeLinecap="round" />
      </Pop>
      {[0, 1, 2, 3].map((c) => (
        <Pop key={`a${c}`} d={1 + c * 0.4}><circle cx={118 + c * 21} cy={82} r="5" fill={S} opacity="0.7" /></Pop>
      ))}
      {[0, 1, 2].map((c) => (
        <Pop key={`b${c}`} d={2.6 + c * 0.4}><circle cx={118 + c * 21} cy={104} r="5" fill={S} opacity="0.7" /></Pop>
      ))}
      <Pop d={4} float>
        <circle cx="181" cy="104" r="11" fill={A} />
        <path d="M175 104 l4 4 l8 -9" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Pop>
    </>
  ),
  // Mince a jiskry (stálé hry = pasivní příjem)
  idle: () => (
    <>
      <Pop d={0}><rect x="112" y="102" width="76" height="16" rx="8" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={1}><rect x="116" y="84" width="68" height="16" rx="8" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={2} float>
        <rect x="120" y="66" width="60" height="16" rx="8" fill={A} />
        <path d="M150 70 v8 M146 74 h8" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </Pop>
      <Sparkle x={92} y={60} s={1.1} d={3} />
      <Sparkle x={214} y={80} d={4} />
      <Sparkle x={196} y={42} s={0.8} d={5} />
    </>
  ),
  // Klíč
  escape: () => (
    <>
      <Pop d={0} float>
        <circle cx="106" cy="80" r="24" fill="none" stroke={A} strokeWidth="9" />
        <rect x="128" y="75" width="106" height="10" rx="5" fill={A} />
        <rect x="196" y="85" width="9" height="18" rx="4" fill={A} />
        <rect x="214" y="85" width="9" height="12" rx="4" fill={A} />
      </Pop>
      <Pop d={2}><circle cx="106" cy="80" r="7" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Sparkle x={150} y={44} d={3} />
      <Sparkle x={236} y={52} s={0.8} d={4} />
    </>
  ),
  // Tři propojení hráči
  together: () => (
    <>
      <path d="M104 98 L150 62 L196 98 Z" fill="none" stroke={S} strokeWidth="2" strokeDasharray="4 6" />
      <Pop d={0} float><circle cx="104" cy="98" r="19" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={1} float><circle cx="196" cy="98" r="19" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={2} float><circle cx="150" cy="62" r="21" fill={A} /></Pop>
      <Pop d={3}><circle cx="150" cy="58" r="6" fill={INK} /><path d="M139 72 a11 8 0 0 1 22 0z" fill={INK} /></Pop>
    </>
  ),
  // Opakování = karta v kruhu
  review: () => (
    <>
      <Pop d={0} spin>
        <circle cx="150" cy="80" r="42" fill="none" stroke={S} strokeWidth="2" strokeDasharray="6 8" />
        <path d="M192 80 l-7 -9 M192 80 l9 -8" stroke={A} strokeWidth="5" strokeLinecap="round" />
      </Pop>
      <Pop d={1} float>
        <rect x="124" y="58" width="52" height="44" rx="10" fill={A} transform="rotate(-6 150 80)" />
        <path d="M136 76 h28 M136 88 h18" stroke={INK} strokeWidth="4" strokeLinecap="round" transform="rotate(-6 150 80)" />
      </Pop>
      <Sparkle x={218} y={46} s={0.8} d={3} />
    </>
  ),
  // Dokument s řádky
  materials: () => (
    <>
      <Pop d={0} float>
        <path d="M114 34 H168 L190 56 V126 H114 Z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" />
        <path d="M168 34 V56 H190" fill="none" stroke={S} strokeWidth="2" strokeLinejoin="round" />
      </Pop>
      <Pop d={1}><rect x="126" y="68" width="32" height="7" rx="3.5" fill={A} /></Pop>
      <Pop d={2}><rect x="126" y="84" width="52" height="6" rx="3" fill={S} opacity="0.7" /></Pop>
      <Pop d={3}><rect x="126" y="98" width="44" height="6" rx="3" fill={S} opacity="0.7" /></Pop>
      <Pop d={4}><rect x="126" y="112" width="30" height="6" rx="3" fill={S} opacity="0.7" /></Pop>
      <Sparkle x={218} y={70} d={5} />
    </>
  ),
  // Profil: avatar s odznakem
  profile: () => (
    <>
      <Pop d={0}><path d="M108 128 a42 38 0 0 1 84 0z" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={1} float><circle cx="150" cy="72" r="22" fill={A} /></Pop>
      <Pop d={2} float>
        <circle cx="196" cy="54" r="14" fill="#f6f1e4" />
        <path d="M196 46 l2.6 5.4 l5.9 .8 l-4.3 4.1 l1 5.9 l-5.2 -2.8 l-5.2 2.8 l1 -5.9 l-4.3 -4.1 l5.9 -.8z" fill={INK} />
      </Pop>
    </>
  ),
  // Žebříčky: pódium s korunou
  boards: () => (
    <>
      <Pop d={0}><rect x="82" y="88" width="46" height="36" rx="8" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={1}><rect x="127" y="64" width="46" height="60" rx="8" fill={A} /></Pop>
      <Pop d={2}><rect x="172" y="100" width="46" height="24" rx="8" fill={F} stroke={S} strokeWidth="2" /></Pop>
      <Pop d={3} float><path d="M133 56 l5 -17 l12 9 l12 -9 l5 17z" fill="#f6f1e4" /></Pop>
      <Pop d={2}><text x="150" y="105" textAnchor="middle" fontSize="22" fontWeight="800" fill={INK}>1</text></Pop>
    </>
  ),
  // Obchod: cenovka s mincí
  shop: () => (
    <>
      <Pop d={0}><path d="M118 62 Q90 30 72 52" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round" /></Pop>
      <Pop d={1} float>
        <path
          d="M112 48 H158 L204 94 Q208 99 204 104 L168 140 Q163 144 158 140 L112 94 Z"
          fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round"
        />
        <circle cx="130" cy="66" r="7" fill={INK} stroke={S} strokeWidth="2" />
        <circle cx="164" cy="98" r="15" fill={A} />
        <path d="M164 90 v16 M156 98 h16" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </Pop>
      <Sparkle x={216} y={56} d={3} />
      <Sparkle x={86} y={104} s={0.8} d={4} />
    </>
  ),
  // Městečko: domky (v seznamu se nepoužívá, ale typ vyžaduje všechny klíče)
  town: () => (
    <>
      <Pop d={0}><path d="M96 124 V84 L124 62 L152 84 V124z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" /></Pop>
      <Pop d={1}><path d="M156 124 V70 L184 48 L212 70 V124z" fill={A} /></Pop>
    </>
  ),
  // Týmy: mřížka členů
  team: () => (
    <>
      {[0, 1, 2].map((c) => (
        <Pop key={`t${c}`} d={c * 0.5}>
          <rect x={90 + c * 46} y="48" width="38" height="38" rx="11" fill={c === 1 ? A : F} stroke={c === 1 ? "none" : S} strokeWidth="2" />
        </Pop>
      ))}
      {[0, 1, 2].map((c) => (
        <Pop key={`b${c}`} d={1.5 + c * 0.5} float>
          <rect x={90 + c * 46} y="92" width="38" height="38" rx="11" fill={c === 2 ? A : F} stroke={c === 2 ? "none" : S} strokeWidth="2" />
        </Pop>
      ))}
    </>
  ),
};

export default function StudentArt({ kind }: { kind: FeatureKey }) {
  return (
    <svg
      viewBox="0 0 300 160"
      preserveAspectRatio="xMidYMid meet"
      className="gcard-art"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="sv-halo" cx="150" cy="80" r="74" fill={A} opacity="0.14" />
      {SCENES[kind]()}
    </svg>
  );
}
