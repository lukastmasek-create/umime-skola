import type { ReactNode } from "react";
import type { FeatureKey } from "@/i18n/audience";
import { A, F, HI, INK, PAPER, S, SH, SOFT, Ground, Person, Pop, Sparkle } from "./artKit";

// SVG ilustrace do hlavičky karet pro žáky. Barvy se berou z karty (--ga).

const SCENES: Record<FeatureKey, () => ReactNode> = {
  // Schody k cíli s vlajkou, stopy a hvězda
  courses: () => (
    <>
      <Ground cx={150} cy={128} rx={104} />
      <path d="M62 84 Q96 60 128 66 T196 38" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
      <Pop d={0}>
        <rect x="58" y="94" width="56" height="32" rx="9" fill={F} stroke={S} strokeWidth="2" />
        <rect x="62" y="97" width="48" height="5" rx="2.5" fill={HI} />
        <text x="86" y="119" textAnchor="middle" fontSize="15" fontWeight="800" fill={S}>1</text>
      </Pop>
      <Pop d={1}>
        <rect x="119" y="72" width="56" height="54" rx="9" fill={F} stroke={S} strokeWidth="2" />
        <rect x="123" y="75" width="48" height="5" rx="2.5" fill={HI} />
        <text x="147" y="116" textAnchor="middle" fontSize="15" fontWeight="800" fill={S}>2</text>
      </Pop>
      <Pop d={2}>
        <rect x="180" y="48" width="58" height="78" rx="9" fill={A} />
        <rect x="184" y="51" width="50" height="5" rx="2.5" fill={HI} />
        <rect x="180" y="100" width="58" height="26" rx="9" fill={SH} />
        <text x="209" y="116" textAnchor="middle" fontSize="17" fontWeight="800" fill={INK}>3</text>
      </Pop>
      <Pop d={3} float>
        <path d="M209 48 V16" stroke={PAPER} strokeWidth="3" strokeLinecap="round" />
        <path d="M209 16 C219 12 227 22 240 17 V35 C227 40 219 30 209 34Z" fill={PAPER} />
        <path d="M209 25 C219 21 227 31 240 26" fill="none" stroke={A} strokeWidth="3" />
      </Pop>
      <Pop d={4} float>
        <circle cx="78" cy="70" r="6" fill={A} />
        <circle cx="76" cy="68" r="2" fill={HI} />
      </Pop>
      <Sparkle x={150} y={40} d={5} />
      <Sparkle x={262} y={60} s={0.8} d={6} />
    </>
  ),
  // Kalendář se sérií a plamenem
  daily: () => (
    <>
      <Ground cx={150} cy={134} rx={72} />
      <Pop d={0}>
        <rect x="84" y="34" width="132" height="98" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <path d="M84 50 a16 16 0 0 1 16 -16 H200 a16 16 0 0 1 16 16 V62 H84Z" fill={A} />
        <rect x="92" y="38" width="116" height="5" rx="2.5" fill={HI} />
        <rect x="104" y="48" width="40" height="6" rx="3" fill={INK} opacity="0.55" />
        <path d="M118 26 V40 M182 26 V40" stroke={PAPER} strokeWidth="6" strokeLinecap="round" />
      </Pop>
      {[0, 1, 2, 3, 4, 5, 6].map((c) => (
        <Pop key={`a${c}`} d={1 + c * 0.25}>
          {c < 5 ? (
            <>
              <circle cx={100 + c * 17} cy={80} r="6.5" fill={A} opacity="0.9" />
              <path d={`M${96.5 + c * 17} 80 l2.6 2.8 l5 -5.6`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <circle cx={100 + c * 17} cy={80} r="6.5" fill="none" stroke={SOFT} strokeWidth="2" />
          )}
        </Pop>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((c) => (
        <Pop key={`b${c}`} d={3 + c * 0.2}>
          <circle cx={100 + c * 17} cy={104} r={c === 2 ? 8.5 : 6.5} fill={c < 2 ? A : "none"} opacity={c < 2 ? 0.9 : 1} stroke={c === 2 ? PAPER : SOFT} strokeWidth={c === 2 ? 2.5 : 2} />
          {c < 2 && <path d={`M${96.5 + c * 17} 104 l2.6 2.8 l5 -5.6`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
        </Pop>
      ))}
      <Pop d={5} float>
        <g transform="translate(238 52)">
          <circle r="19" fill={SH} />
          <path d="M0 -15 C5 -7 12 -2 12 6 A12 12 0 0 1 -12 6 C-12 -1 -6 -4 0 -15Z" fill={A} />
          <path d="M0 -3 C3 1 6 3 6 8 A6 6 0 0 1 -6 8 C-6 4 -2 2 0 -3Z" fill={PAPER} />
        </g>
      </Pop>
      <Sparkle x={58} y={58} s={0.9} d={6} />
    </>
  ),
  // Sloupec mincí s klíčkem, hodiny (pasivní příjem)
  idle: () => (
    <>
      <Ground cx={130} cy={134} rx={64} />
      {[0, 1, 2, 3].map((i) => {
        const y = 112 - i * 14;
        const top = i === 3;
        return (
          <Pop key={i} d={i * 0.5}>
            <rect x="94" y={y} width="72" height="16" rx="8" fill={top ? A : F} stroke={top ? "none" : S} strokeWidth="2" />
            <rect x="100" y={y + 3} width="60" height="3.5" rx="1.75" fill={HI} />
            {!top && <path d={`M108 ${y + 11} h8 M124 ${y + 11} h8 M140 ${y + 11} h8`} stroke={SOFT} strokeWidth="2" strokeLinecap="round" />}
          </Pop>
        );
      })}
      <Pop d={2.5} float>
        <path d="M130 56 V42" stroke={A} strokeWidth="4" strokeLinecap="round" />
        <path d="M130 48 C118 48 112 40 113 31 C123 30 131 36 130 48Z" fill={A} />
        <path d="M130 44 C142 44 148 36 147 27 C137 26 129 32 130 44Z" fill={A} opacity="0.75" />
      </Pop>
      <Pop d={3} float>
        <circle cx="210" cy="64" r="26" fill={F} stroke={S} strokeWidth="2" />
        <circle cx="210" cy="64" r="21" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
        <path d="M210 64 V50 M210 64 L220 70" stroke={A} strokeWidth="4" strokeLinecap="round" />
        <circle cx="210" cy="64" r="3.5" fill={PAPER} />
      </Pop>
      <Pop d={4} float>
        <circle cx="206" cy="112" r="11" fill={A} />
        <circle cx="206" cy="112" r="7.5" fill="none" stroke={INK} strokeWidth="1.8" opacity="0.55" />
        <circle cx="203" cy="109" r="2" fill={HI} />
      </Pop>
      <Sparkle x={70} y={74} s={1.1} d={5} />
      <Sparkle x={246} y={104} s={0.8} d={6} />
    </>
  ),
  // Klíč u zámku
  escape: () => (
    <>
      <Ground cx={160} cy={134} rx={90} />
      <Pop d={0}>
        <path d="M188 76 V62 a22 22 0 0 1 44 0 V76" fill="none" stroke={S} strokeWidth="8" strokeLinecap="round" />
        <rect x="176" y="72" width="68" height="56" rx="12" fill={F} stroke={S} strokeWidth="2" />
        <rect x="181" y="76" width="58" height="5" rx="2.5" fill={HI} />
        <circle cx="210" cy="96" r="7" fill={INK} />
        <path d="M207 100 h6 l2 14 h-10z" fill={INK} />
      </Pop>
      <Pop d={1} float>
        <g transform="rotate(-24 120 90)">
          <circle cx="84" cy="90" r="25" fill="none" stroke={A} strokeWidth="10" />
          <circle cx="84" cy="90" r="25" fill="none" stroke={HI} strokeWidth="2" strokeDasharray="38 200" strokeLinecap="round" transform="rotate(-100 84 90)" />
          <circle cx="84" cy="90" r="8" fill={A} opacity="0.35" />
          <rect x="108" y="85" width="112" height="10" rx="5" fill={A} />
          <rect x="112" y="86.5" width="100" height="2.5" rx="1.25" fill={HI} />
          <rect x="182" y="95" width="10" height="20" rx="4" fill={A} />
          <rect x="200" y="95" width="10" height="13" rx="4" fill={A} />
          <path d="M126 85 v10 M136 85 v10" stroke={INK} strokeWidth="1.8" opacity="0.4" />
        </g>
      </Pop>
      <Sparkle x={60} y={40} d={3} />
      <Sparkle x={256} y={38} s={0.8} d={4} />
      <Sparkle x={150} y={36} s={0.7} d={5} />
    </>
  ),
  // Tři propojení hráči s pulzem a bublinou
  together: () => (
    <>
      <path d="M96 102 L150 58 L204 102 Z" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      <path d="M96 102 H204" stroke={SOFT} strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      <Pop d={0} float>
        <circle cx="96" cy="102" r="25" fill={F} stroke={S} strokeWidth="2" />
        <Person x={96} y={96} r={9} fill={PAPER} />
      </Pop>
      <Pop d={1} float>
        <circle cx="204" cy="102" r="25" fill={F} stroke={S} strokeWidth="2" />
        <Person x={204} y={96} r={9} fill={PAPER} />
      </Pop>
      <Pop d={2} float>
        <circle cx="150" cy="58" r="28" fill={A} />
        <circle cx="150" cy="58" r="28" fill="none" stroke={HI} strokeWidth="2" strokeDasharray="30 200" strokeLinecap="round" transform="rotate(-150 150 58)" />
        <Person x={150} y={52} r={10} fill={INK} ink={A} />
      </Pop>
      <Pop d={3} float>
        <path d="M206 40 h42 a8 8 0 0 1 8 8 v14 a8 8 0 0 1 -8 8 h-26 l-9 9 v-9 h-7 a8 8 0 0 1 -8 -8 v-14 a8 8 0 0 1 8 -8z" fill={PAPER} />
        <path d="M212 50 h28 M212 58 h18" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </Pop>
      <Sparkle x={52} y={52} s={0.9} d={4} />
    </>
  ),
  // Opakování: vějíř karet v oběžné dráze
  review: () => (
    <>
      <Ground cx={150} cy={136} rx={62} />
      <Pop d={0} spin>
        <circle cx="150" cy="80" r="52" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="3 8" strokeLinecap="round" />
        <path d="M202 80 l-8 -9 M202 80 l10 -7" stroke={A} strokeWidth="5" strokeLinecap="round" />
        <path d="M98 80 l8 9 M98 80 l-10 7" stroke={A} strokeWidth="5" strokeLinecap="round" />
      </Pop>
      <Pop d={1}>
        <rect x="118" y="52" width="60" height="52" rx="11" fill={F} stroke={S} strokeWidth="2" transform="rotate(-16 150 80)" />
      </Pop>
      <Pop d={2}>
        <rect x="118" y="52" width="60" height="52" rx="11" fill={F} stroke={S} strokeWidth="2" transform="rotate(14 150 80)" />
      </Pop>
      <Pop d={3} float>
        <rect x="118" y="52" width="60" height="52" rx="11" fill={A} />
        <rect x="123" y="56" width="50" height="5" rx="2.5" fill={HI} />
        <path d="M130 72 h30 M130 82 h20" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        <circle cx="160" cy="92" r="8" fill={PAPER} />
        <path d="M156 92 l3 3 l6 -7" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </Pop>
      <Sparkle x={236} y={44} s={0.9} d={4} />
      <Sparkle x={64} y={116} s={0.8} d={5} />
    </>
  ),
  // Dokument s obrázkem, tužka a záložka
  materials: () => (
    <>
      <Ground cx={150} cy={136} rx={66} />
      <Pop d={0} float>
        <path d="M108 30 H168 L196 58 V130 H108 Z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" />
        <path d="M168 30 V58 H196" fill={SH} stroke={S} strokeWidth="2" strokeLinejoin="round" />
        <path d="M184 30 v26 l7 -6 l7 6 v-26" fill={A} transform="translate(-34 -2)" />
      </Pop>
      <Pop d={1}><rect x="120" y="66" width="38" height="8" rx="4" fill={A} /></Pop>
      <Pop d={2}>
        <rect x="120" y="82" width="64" height="26" rx="6" fill={SH} stroke={SOFT} strokeWidth="1.5" />
        <path d="M120 108 l18 -16 l12 10 l10 -8 l24 14z" fill={A} opacity="0.75" />
        <circle cx="170" cy="91" r="4" fill={PAPER} />
      </Pop>
      <Pop d={3}><rect x="120" y="114" width="50" height="5" rx="2.5" fill={S} opacity="0.7" /></Pop>
      <Pop d={4}><rect x="120" y="122" width="34" height="5" rx="2.5" fill={S} opacity="0.5" /></Pop>
      <Pop d={5} float>
        <g transform="rotate(38 232 90)">
          <rect x="224" y="46" width="16" height="82" rx="3" fill={A} />
          <rect x="224" y="46" width="16" height="12" rx="3" fill={PAPER} />
          <rect x="227" y="60" width="3" height="64" fill={HI} />
          <path d="M224 128 l8 16 l8 -16z" fill={PAPER} />
          <path d="M229 138 l3 6 l3 -6z" fill={INK} />
        </g>
      </Pop>
      <Sparkle x={72} y={60} d={6} />
    </>
  ),
  // Profil: avatar s tváří, úroveň, odznak a XP
  profile: () => (
    <>
      <Ground cx={150} cy={136} rx={68} />
      <Pop d={0} spin>
        <circle cx="150" cy="70" r="40" fill="none" stroke={SOFT} strokeWidth="5" />
        <circle cx="150" cy="70" r="40" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round" strokeDasharray="170 252" transform="rotate(-90 150 70)" />
      </Pop>
      <Pop d={1}>
        <circle cx="150" cy="70" r="32" fill={F} />
        <circle cx="150" cy="62" r="13" fill={A} />
        <path d="M126 96 a24 22 0 0 1 48 0 a32 32 0 0 1 -48 0z" fill={A} />
        <circle cx="145" cy="60" r="1.8" fill={INK} /><circle cx="155" cy="60" r="1.8" fill={INK} />
        <path d="M145 66 q5 4 10 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <path d="M138 56 a13 11 0 0 1 24 -2 c-8 -5 -16 -4 -24 2z" fill={SH} />
      </Pop>
      <Pop d={2} float>
        <circle cx="194" cy="40" r="15" fill={PAPER} />
        <path d="M194 31 l3.2 6.2 l7 1 l-5 4.9 l1.2 6.9 l-6.4 -3.3 l-6.4 3.3 l1.2 -6.9 l-5 -4.9 l7 -1z" fill={INK} />
      </Pop>
      <Pop d={3}>
        <rect x="104" y="116" width="92" height="9" rx="4.5" fill={F} stroke={SOFT} strokeWidth="1.5" />
        <rect x="104" y="116" width="62" height="9" rx="4.5" fill={A} />
        <rect x="108" y="118" width="54" height="2.5" rx="1.25" fill={HI} />
      </Pop>
      <Pop d={4} float><rect x="90" y="46" width="22" height="14" rx="7" fill={F} stroke={S} strokeWidth="1.5" /><text x="101" y="57" textAnchor="middle" fontSize="9" fontWeight="800" fill={PAPER}>LVL</text></Pop>
      <Sparkle x={236} y={92} s={0.9} d={5} />
    </>
  ),
  // Žebříčky: pódium s avatary, korunou a konfetami
  boards: () => (
    <>
      <Ground cx={150} cy={134} rx={88} />
      <Pop d={0}>
        <rect x="76" y="92" width="50" height="40" rx="8" fill={F} stroke={S} strokeWidth="2" />
        <rect x="80" y="95" width="42" height="4" rx="2" fill={HI} />
        <text x="101" y="122" textAnchor="middle" fontSize="18" fontWeight="800" fill={S}>2</text>
      </Pop>
      <Pop d={1}>
        <rect x="124" y="68" width="52" height="64" rx="8" fill={A} />
        <rect x="128" y="71" width="44" height="4" rx="2" fill={HI} />
        <rect x="124" y="104" width="52" height="28" rx="8" fill={SH} />
        <text x="150" y="122" textAnchor="middle" fontSize="24" fontWeight="800" fill={INK}>1</text>
      </Pop>
      <Pop d={2}>
        <rect x="174" y="102" width="50" height="30" rx="8" fill={F} stroke={S} strokeWidth="2" />
        <rect x="178" y="105" width="42" height="4" rx="2" fill={HI} />
        <text x="199" y="125" textAnchor="middle" fontSize="16" fontWeight="800" fill={S}>3</text>
      </Pop>
      <Pop d={3} float><circle cx="101" cy="76" r="9" fill={PAPER} opacity="0.9" /><path d="M89 91 a12 9 0 0 1 24 0z" fill={PAPER} opacity="0.9" /></Pop>
      <Pop d={3.5} float><circle cx="199" cy="86" r="9" fill={PAPER} opacity="0.9" /><path d="M187 101 a12 9 0 0 1 24 0z" fill={PAPER} opacity="0.9" /></Pop>
      <Pop d={4} float>
        <circle cx="150" cy="50" r="10" fill={PAPER} />
        <path d="M134 36 l5 -16 l11 9 l11 -9 l5 16z" fill={PAPER} />
        <path d="M134 36 h32" stroke={A} strokeWidth="3" />
        <circle cx="139" cy="19" r="2.5" fill={A} /><circle cx="150" cy="27" r="2.5" fill={A} /><circle cx="161" cy="19" r="2.5" fill={A} />
      </Pop>
      {[[64, 50, 0, 20], [236, 56, 1, -25], [84, 32, 2, 40], [220, 32, 3, -10], [258, 96, 4, 30], [44, 96, 5, -35]].map(([x, y, n, r]) => (
        <Pop key={n} d={5 + n * 0.3}>
          <rect x={x} y={y} width="8" height="4" rx="1.5" fill={n % 2 ? PAPER : A} transform={`rotate(${r} ${x + 4} ${y + 2})`} />
        </Pop>
      ))}
    </>
  ),
  // Obchod: cenovka s prošíváním, mince a drahokam
  shop: () => (
    <>
      <Ground cx={150} cy={140} rx={78} />
      <Pop d={0}><path d="M122 58 Q90 20 66 52 T88 78" fill="none" stroke={A} strokeWidth="4" strokeLinecap="round" /></Pop>
      <Pop d={1} float>
        <path d="M108 44 H160 L212 96 Q217 101 212 106 L174 144 Q169 149 164 144 L108 90 Z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" />
        <path d="M116 52 H157 L204 99 L170 134 L116 86 Z" fill="none" stroke={SOFT} strokeWidth="1.8" strokeDasharray="4 5" strokeLinejoin="round" />
        <circle cx="128" cy="64" r="8" fill={INK} stroke={S} strokeWidth="2" />
        <path d="M118 52 H158 L176 70 H118Z" fill={HI} opacity="0.35" />
        <circle cx="166" cy="102" r="17" fill={A} />
        <circle cx="166" cy="102" r="12" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.4" />
        <path d="M166 93 v18 M157 102 h18" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </Pop>
      <Pop d={3} float>
        <g transform="translate(234 58)">
          <path d="M-14 -4 L-7 -14 H7 L14 -4 L0 14Z" fill={A} />
          <path d="M-14 -4 H14 M-7 -14 L-3 -4 L0 14 M7 -14 L3 -4" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.4" strokeLinejoin="round" />
          <path d="M-7 -14 H7 L4 -9 H-4Z" fill={HI} />
        </g>
      </Pop>
      <Pop d={4} float>
        <circle cx="68" cy="112" r="10" fill={A} />
        <circle cx="65" cy="109" r="2" fill={HI} />
      </Pop>
      <Sparkle x={248} y={104} s={0.9} d={5} />
    </>
  ),
  // Městečko (v seznamu se nepoužívá, ale typ vyžaduje všechny klíče)
  town: () => (
    <>
      <Ground cx={150} cy={130} rx={90} />
      <Pop d={0}><path d="M96 124 V84 L124 62 L152 84 V124z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" /></Pop>
      <Pop d={1}><path d="M156 124 V70 L184 48 L212 70 V124z" fill={A} /></Pop>
    </>
  ),
  // Týmy: mini přehled úkolů s lidmi
  team: () => (
    <>
      <Ground cx={150} cy={136} rx={92} />
      <Pop d={0}>
        <rect x="64" y="30" width="172" height="102" rx="16" fill={F} stroke={S} strokeWidth="2" />
        <rect x="68" y="34" width="164" height="5" rx="2.5" fill={HI} />
        <circle cx="80" cy="47" r="3" fill={A} /><circle cx="90" cy="47" r="3" fill={SOFT} /><circle cx="100" cy="47" r="3" fill={SOFT} />
      </Pop>
      {[0, 1, 2].map((i) => {
        const y = 62 + i * 24;
        const pct = [0.82, 0.55, 0.3][i];
        return (
          <Pop key={i} d={1 + i * 0.6}>
            <circle cx="86" cy={y} r="10" fill={i === 0 ? A : F} stroke={i === 0 ? "none" : S} strokeWidth="1.8" />
            <circle cx="86" cy={y - 2.5} r="3.5" fill={i === 0 ? INK : S} />
            <path d={`M79 ${y + 7} a7 5 0 0 1 14 0z`} fill={i === 0 ? INK : S} />
            <rect x="106" y={y - 5} width="108" height="10" rx="5" fill={SH} />
            <rect x="106" y={y - 5} width={108 * pct} height="10" rx="5" fill={A} opacity={1 - i * 0.22} />
            <rect x="109" y={y - 3.5} width={108 * pct - 6} height="2.5" rx="1.25" fill={HI} />
          </Pop>
        );
      })}
      <Pop d={4} float>
        <circle cx="226" cy="44" r="13" fill={PAPER} />
        <path d="M220 44 l4 4 l8 -9" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </Pop>
      <Sparkle x={48} y={70} s={0.9} d={5} />
      <Sparkle x={256} y={104} s={0.8} d={6} />
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
      <circle className="sv-halo" cx="150" cy="80" r="76" fill={A} opacity="0.14" />
      <circle cx="150" cy="80" r="94" fill="none" stroke={SOFT} strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" opacity="0.5" />
      {SCENES[kind]()}
    </svg>
  );
}
