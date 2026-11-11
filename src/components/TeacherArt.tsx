import type { ReactNode } from "react";
import { ArtRough, A, F, HI, INK, PAPER, S, SH, SOFT, Ground, Person, Pop, Sparkle } from "./artKit";

// SVG ilustrace do karet na stránce pro učitele. Barvy se berou z karty (--ga).
export type TeacherArtKind =
  | "class" | "minute" | "code" | "assign" | "deadline" | "targets" | "chart"
  | "overview" | "weak" | "approve" | "chat" | "shield" | "pin";

const SCENES: Record<TeacherArtKind, () => ReactNode> = {
  // Třída: tabule s řadou žáků
  class: () => (
    <>
      <Ground cx={150} cy={134} rx={92} />
      <Pop d={0}>
        <rect x="70" y="30" width="160" height="70" rx="12" fill={F} stroke={S} strokeWidth="2" />
        <rect x="75" y="34" width="150" height="5" rx="2.5" fill={HI} />
        <path d="M86 52 h46 M86 64 h70 M86 76 h34" stroke={SOFT} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="198" cy="64" r="16" fill={A} />
        <path d="M190 64 l6 6 l11 -13" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="136" y="100" width="28" height="6" rx="3" fill={SH} />
      </Pop>
      {[0, 1, 2, 3].map((i) => (
        <Pop key={i} d={1 + i * 0.4} float>
          <g transform={`translate(${96 + i * 36} 0)`}>
            <Person x={0} y={116} r={7.5} fill={i === 1 ? A : PAPER} />
          </g>
        </Pop>
      ))}
      <Sparkle x={54} y={44} s={0.9} d={5} />
      <Sparkle x={256} y={96} s={0.8} d={6} />
    </>
  ),
  // Za minutu: stopky a nová třída
  minute: () => (
    <>
      <Ground cx={140} cy={136} rx={70} />
      <Pop d={0}>
        <rect x="132" y="26" width="26" height="9" rx="4" fill={S} />
        <path d="M145 35 V42" stroke={S} strokeWidth="4" />
        <circle cx="145" cy="84" r="44" fill={F} stroke={S} strokeWidth="2.5" />
        <circle cx="145" cy="84" r="36" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
        <path d="M145 84 L145 84" />
        <path d="M145 84 V58" stroke={PAPER} strokeWidth="4" strokeLinecap="round" />
        <path d="M145 84 L162 94" stroke={A} strokeWidth="4" strokeLinecap="round" />
        <circle cx="145" cy="84" r="5" fill={A} />
        <path d="M145 84 A36 36 0 0 1 176 102" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      </Pop>
      <Pop d={1} float>
        <rect x="196" y="56" width="62" height="46" rx="11" fill={A} />
        <rect x="200" y="60" width="54" height="5" rx="2.5" fill={HI} />
        <path d="M227 72 v18 M218 81 h18" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </Pop>
      <Sparkle x={86} y={48} d={3} />
      <Sparkle x={246} y={36} s={0.8} d={4} />
    </>
  ),
  // Kód třídy: velký kód a klíč
  code: () => (
    <>
      <Ground cx={150} cy={130} rx={86} />
      <Pop d={0} float>
        <rect x="62" y="48" width="176" height="62" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <rect x="68" y="52" width="164" height="5" rx="2.5" fill={HI} />
        <text x="150" y="92" textAnchor="middle" fontSize="34" fontWeight="800" letterSpacing="6" fill={PAPER}>A7K2</text>
      </Pop>
      <Pop d={1}>
        <rect x="76" y="34" width="56" height="20" rx="10" fill={A} />
        <text x="104" y="49" textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>#</text>
      </Pop>
      <Pop d={2} float>
        <circle cx="216" cy="46" r="15" fill={A} />
        <path d="M209 50 l7 -7 m-2 0 h7 v7" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </Pop>
      <Pop d={3}><path d="M86 124 q64 22 128 0" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" /></Pop>
      <Sparkle x={48} y={86} s={0.9} d={4} />
      <Sparkle x={256} y={100} s={0.8} d={5} />
    </>
  ),
  // Zadání: podložka se seznamem a termín
  assign: () => (
    <>
      <Ground cx={140} cy={138} rx={70} />
      <Pop d={0} float>
        <rect x="76" y="28" width="116" height="106" rx="14" fill={F} stroke={S} strokeWidth="2" />
        <rect x="116" y="20" width="36" height="16" rx="8" fill={A} />
        <rect x="82" y="32" width="104" height="5" rx="2.5" fill={HI} />
      </Pop>
      {[0, 1, 2].map((i) => (
        <Pop key={i} d={1 + i * 0.5}>
          <circle cx="98" cy={60 + i * 24} r="8" fill={i < 2 ? A : "none"} stroke={i < 2 ? "none" : SOFT} strokeWidth="2" />
          {i < 2 && <path d={`M94 ${60 + i * 24} l3 3.2 l6 -6.5`} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="114" y={57 + i * 24} width={[58, 48, 40][i]} height="6" rx="3" fill={S} opacity="0.75" />
        </Pop>
      ))}
      <Pop d={3} float>
        <circle cx="222" cy="76" r="30" fill={F} stroke={S} strokeWidth="2.5" />
        <path d="M222 76 V56 M222 76 L236 84" stroke={PAPER} strokeWidth="4" strokeLinecap="round" />
        <circle cx="222" cy="76" r="4.5" fill={A} />
        <path d="M222 46 v4 M252 76 h-4 M222 106 v-4 M192 76 h4" stroke={A} strokeWidth="3" strokeLinecap="round" />
      </Pop>
      <Sparkle x={246} y={34} s={0.9} d={5} />
    </>
  ),
  // Termín: kalendář s vlajkou u data a dlaždice kurzů
  deadline: () => (
    <>
      <Ground cx={150} cy={136} rx={88} />
      <Pop d={0}>
        <rect x="80" y="34" width="140" height="94" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <path d="M80 50 a16 16 0 0 1 16 -16 H204 a16 16 0 0 1 16 16 V60 H80Z" fill={A} />
        <path d="M112 26 V40 M188 26 V40" stroke={PAPER} strokeWidth="6" strokeLinecap="round" />
        <rect x="88" y="38" width="124" height="5" rx="2.5" fill={HI} />
      </Pop>
      {[0, 1, 2, 3, 4].map((c) => (
        <Pop key={c} d={1 + c * 0.25}>
          <circle cx={104 + c * 23} cy={82} r="6" fill="none" stroke={SOFT} strokeWidth="2" />
        </Pop>
      ))}
      {[0, 1, 2, 3, 4].map((c) => (
        <Pop key={c} d={2.2 + c * 0.25}>
          <circle cx={104 + c * 23} cy={106} r={c === 4 ? 9 : 6} fill={c === 4 ? A : "none"} stroke={c === 4 ? "none" : SOFT} strokeWidth="2" />
        </Pop>
      ))}
      <Pop d={4} float>
        <path d="M196 106 V70" stroke={PAPER} strokeWidth="3" strokeLinecap="round" />
        <path d="M196 70 L220 78 L196 86Z" fill={A} />
      </Pop>
      <Pop d={5} float>
        <rect x="236" y="48" width="34" height="26" rx="8" fill={PAPER} />
        <path d="M244 58 h18 M244 65 h11" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </Pop>
      <Sparkle x={48} y={64} s={0.9} d={6} />
    </>
  ),
  // Komu zadat: úkol míří na třídu, skupinu a jednotlivce
  targets: () => (
    <>
      <Pop d={0} float>
        <rect x="42" y="50" width="54" height="64" rx="11" fill={A} />
        <rect x="46" y="54" width="46" height="5" rx="2.5" fill={HI} />
        <path d="M54 76 h30 M54 88 h22 M54 100 h26" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </Pop>
      {[28, 80, 132].map((y, i) => (
        <Pop key={i} d={1 + i * 0.7}>
          <path d={`M98 82 C130 82 130 ${y} 160 ${y}`} fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
          <rect x="160" y={y - 17} width={[100, 74, 40][i]} height="34" rx="17" fill={F} stroke={S} strokeWidth="2" />
          {Array.from({ length: [4, 3, 1][i] }).map((_, n) => (
            <circle key={n} cx={178 + n * 22} cy={y} r="8" fill={n === 0 ? A : PAPER} opacity={n === 0 ? 1 : 0.85} />
          ))}
        </Pop>
      ))}
      <Sparkle x={120} y={50} s={0.8} d={5} />
    </>
  ),
  // Výsledky: sloupcový graf a trend
  chart: () => (
    <>
      <Ground cx={150} cy={134} rx={92} />
      <Pop d={0}>
        <rect x="58" y="28" width="184" height="102" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <rect x="63" y="32" width="174" height="5" rx="2.5" fill={HI} />
        <path d="M76 66 H224 M76 88 H224 M76 110 H224" stroke={SOFT} strokeWidth="1.5" strokeDasharray="3 6" />
      </Pop>
      {[38, 62, 48, 80, 66].map((h, i) => (
        <Pop key={i} d={1 + i * 0.5}>
          <rect x={80 + i * 30} y={118 - h} width="20" height={h} rx="6" fill={i === 3 ? A : S} opacity={i === 3 ? 1 : 0.55} />
          <rect x={83 + i * 30} y={121 - h} width="3" height={h - 6} rx="1.5" fill={HI} />
        </Pop>
      ))}
      <Pop d={4}>
        <path d="M90 76 L120 56 L150 66 L180 40 L210 52" fill="none" stroke={PAPER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {[[90, 76], [120, 56], [150, 66], [180, 40], [210, 52]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill={A} stroke={PAPER} strokeWidth="1.5" />)}
      </Pop>
      <Sparkle x={262} y={44} s={0.9} d={6} />
    </>
  ),
  // Přehled žáků: tabulka s ukazateli
  overview: () => (
    <>
      <Ground cx={150} cy={138} rx={92} />
      <Pop d={0}>
        <rect x="56" y="26" width="188" height="108" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <rect x="61" y="30" width="178" height="5" rx="2.5" fill={HI} />
        <rect x="56" y="38" width="188" height="20" fill={SH} />
        <rect x="70" y="45" width="34" height="6" rx="3" fill={S} />
        <rect x="150" y="45" width="30" height="6" rx="3" fill={S} opacity="0.6" />
      </Pop>
      {[100, 72, 44, 18].map((pct, i) => (
        <Pop key={i} d={1 + i * 0.6}>
          <circle cx="76" cy={72 + i * 16} r="6" fill={i === 0 ? A : PAPER} opacity={i === 0 ? 1 : 0.8} />
          <rect x="92" y={69 + i * 16} width="52" height="6" rx="3" fill={S} opacity="0.6" />
          <rect x="156" y={68 + i * 16} width="64" height="8" rx="4" fill={SH} />
          <rect x="156" y={68 + i * 16} width={64 * pct / 100} height="8" rx="4" fill={A} opacity={0.4 + pct / 170} />
          {pct === 100 && <path d="M228 72 l3.5 3.5 l7 -8" fill="none" stroke={A} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        </Pop>
      ))}
      <Sparkle x={262} y={58} s={0.9} d={5} />
    </>
  ),
  // Slabá místa: otázky s ukazateli a výstražný znak
  weak: () => (
    <>
      <Ground cx={150} cy={138} rx={92} />
      {[0, 1, 2].map((i) => (
        <Pop key={i} d={i * 0.6}>
          <rect x="52" y={30 + i * 34} width="196" height="28" rx="14" fill={i === 1 ? A : F} stroke={i === 1 ? "none" : S} strokeWidth="2" />
          <circle cx="70" cy={44 + i * 34} r="9" fill={i === 1 ? INK : S} opacity={i === 1 ? 0.85 : 0.7} />
          <text x="70" y={48.5 + i * 34} textAnchor="middle" fontSize="12" fontWeight="800" fill={i === 1 ? A : INK}>?</text>
          <rect x="90" y={41 + i * 34} width="66" height="6" rx="3" fill={i === 1 ? INK : S} opacity="0.55" />
          <rect x="170" y={40 + i * 34} width="60" height="8" rx="4" fill={SH} />
          <rect x="170" y={40 + i * 34} width={[48, 16, 36][i]} height="8" rx="4" fill={i === 1 ? INK : A} opacity={i === 1 ? 0.8 : 1} />
        </Pop>
      ))}
      <Pop d={2.4} float>
        <g transform="translate(252 38)">
          <path d="M0 -15 L15 11 H-15Z" fill={PAPER} stroke={PAPER} strokeWidth="4" strokeLinejoin="round" />
          <path d="M0 -6 V3" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="7" r="1.8" fill={INK} />
        </g>
      </Pop>
    </>
  ),
  // Schvalování: žádosti s tlačítky
  approve: () => (
    <>
      <Ground cx={150} cy={138} rx={90} />
      {[0, 1].map((i) => (
        <Pop key={i} d={i * 0.8} float={i === 0}>
          <rect x="52" y={34 + i * 50} width="196" height="42" rx="14" fill={F} stroke={S} strokeWidth="2" />
          <rect x="57" y={37 + i * 50} width="186" height="4" rx="2" fill={HI} />
          <Person x={76} y={50 + i * 50} r={8} fill={i === 0 ? A : PAPER} />
          <rect x="100" y={48 + i * 50} width="56" height="6" rx="3" fill={S} opacity="0.75" />
          <rect x="100" y={60 + i * 50} width="36" height="5" rx="2.5" fill={S} opacity="0.4" />
          <circle cx="198" cy={55 + i * 50} r="13" fill={A} />
          <path d={`M192 ${55 + i * 50} l4.5 4.5 l8 -9`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="226" cy={55 + i * 50} r="13" fill="none" stroke={SOFT} strokeWidth="2" />
          <path d={`M221 ${50 + i * 50} l10 10 M231 ${50 + i * 50} l-10 10`} stroke={S} strokeWidth="2.5" strokeLinecap="round" />
        </Pop>
      ))}
      <Sparkle x={262} y={104} s={0.9} d={4} />
    </>
  ),
  // Chat: dvě bubliny a psaní
  chat: () => (
    <>
      <Ground cx={150} cy={138} rx={80} />
      <Pop d={0} float>
        <path d="M60 36 h110 a14 14 0 0 1 14 14 v22 a14 14 0 0 1 -14 14 h-76 l-18 16 v-16 h-16 a14 14 0 0 1 -14 -14 v-22 a14 14 0 0 1 14 -14z" fill={F} stroke={S} strokeWidth="2" />
        <path d="M76 54 h78 M76 66 h46" stroke={S} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </Pop>
      <Pop d={1} float>
        <path d="M130 90 h110 a14 14 0 0 1 14 14 v14 a14 14 0 0 1 -14 14 h-12 v16 l-18 -16 h-80 a14 14 0 0 1 -14 -14 v-14 a14 14 0 0 1 14 -14z" fill={A} transform="translate(0 -14)" />
        <path d="M146 100 h72" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0.7" transform="translate(0 4)" />
      </Pop>
      {[0, 1, 2].map((i) => (
        <Pop key={i} d={2.5 + i * 0.3}><circle cx={74 + i * 12} cy={122} r="3.6" fill={S} opacity="0.7" /></Pop>
      ))}
      <Sparkle x={256} y={48} s={0.9} d={4} />
    </>
  ),
  // Bezpečně: štít s odškrtnutím
  shield: () => (
    <>
      <Ground cx={150} cy={138} rx={70} />
      <Pop d={0} float>
        <path d="M150 24 L212 46 V84 C212 112 186 130 150 142 C114 130 88 112 88 84 V46 Z" fill={F} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M150 34 L202 52 V84 C202 106 182 120 150 131Z" fill={SH} />
        <path d="M150 42 L196 58 V84 C196 102 176 114 150 124 C124 114 104 102 104 84 V58Z" fill={A} />
        <path d="M130 84 l14 14 l26 -30" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M112 62 L150 48" stroke={HI} strokeWidth="3" strokeLinecap="round" />
      </Pop>
      <Sparkle x={66} y={54} d={3} />
      <Sparkle x={240} y={96} s={0.9} d={4} />
      <Sparkle x={236} y={40} s={0.7} d={5} />
    </>
  ),
  // Rodičovský zámek: PIN a časový limit
  pin: () => (
    <>
      <Ground cx={140} cy={138} rx={74} />
      <Pop d={0}>
        <path d="M108 72 V58 a30 30 0 0 1 60 0 V72" fill="none" stroke={S} strokeWidth="9" strokeLinecap="round" />
        <rect x="90" y="68" width="96" height="66" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <rect x="96" y="72" width="84" height="5" rx="2.5" fill={HI} />
      </Pop>
      {[0, 1, 2, 3].map((i) => (
        <Pop key={i} d={1 + i * 0.35}>
          <circle cx={111 + i * 18} cy={102} r="5.5" fill={i < 3 ? A : "none"} stroke={i < 3 ? "none" : A} strokeWidth="2.5" />
        </Pop>
      ))}
      <Pop d={3} float>
        <circle cx="228" cy="72" r="30" fill={F} stroke={S} strokeWidth="2.5" />
        <path d="M228 72 L228 50" stroke={PAPER} strokeWidth="4" strokeLinecap="round" />
        <path d="M228 72 A22 22 0 0 1 246 84" fill="none" stroke={A} strokeWidth="7" strokeLinecap="round" />
        <circle cx="228" cy="72" r="4.5" fill={A} />
      </Pop>
      <Sparkle x={62} y={52} s={0.9} d={4} />
    </>
  ),
};

export default function TeacherArt({ kind }: { kind: TeacherArtKind }) {
  return (
    <svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet" className="gcard-art" aria-hidden="true" focusable="false">
      <defs>
        <ArtRough />
      </defs>
      <g filter="url(#sv-rough)">
        <circle className="sv-halo" cx="150" cy="80" r="70" fill={A} opacity="0.22" />
        {SCENES[kind]()}
      </g>
    </svg>
  );
}
