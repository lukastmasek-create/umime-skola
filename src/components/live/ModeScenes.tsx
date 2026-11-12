import type { ReactNode } from "react";
import type { LiveMode } from "@/lib/live/types";

// Scénky režimů živé hry ve stejném jazyku jako ilustrace karet na homepage (PcardScenes):
//  · viewBox 300 × 120, země na y ≈ 105, měkký stín pod každým předmětem,
//  · světlo shora zleva: světlý okraj vlevo/nahoře, tmavší strana vpravo/dole,
//  · tři tóny na předmět (základ, světlo, stín), žádné obrysy,
//  · všechno prochází filtrem Rough (nerovný okraj + tmavý obrys),
//  · jen pár pohyblivých detailů (třídy pcard-bub, pcard-wave) z globals.css.

const Shadow = ({ cx, cy, rx, ry = 2.6 }: { cx: number; cy: number; rx: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity=".3" />
);

function Rough({ id, seed }: { id: string; seed: number }) {
  return (
    <filter id={id} x="-4%" y="-6%" width="108%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feMorphology in="d" operator="dilate" radius="1.25" result="o" />
      <feFlood floodColor="#14132a" />
      <feComposite in2="o" operator="in" result="ink" />
      <feMerge>
        <feMergeNode in="ink" />
        <feMergeNode in="d" />
      </feMerge>
    </filter>
  );
}

/* ---------- Klasický kvíz: tabule s otázkou, čtyři odpovědi a stopky ---------- */
function Quiz({ p }: { p: string }) {
  const tiles = ["#e2574c", "#4c8be2", "#f2b632", "#46c08b"];
  return (
    <>
      <defs>
        <radialGradient id={`${p}-sun`}><stop offset="0" stopColor="#fff3b0" /><stop offset="1" stopColor="#ffc933" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${p}-face`} x1="0" x2="1"><stop offset="0" stopColor="#fffdf6" /><stop offset="1" stopColor="#e7dfc9" /></linearGradient>
      </defs>
      <circle cx="252" cy="24" r="30" fill={`url(#${p}-sun)`} />
      <path d="M0 96C60 86 120 100 180 92S262 86 300 92V120H0Z" fill="#ffc933" opacity=".2" />

      {/* tabule s otázkou na stojanu */}
      <Shadow cx={100} cy={105} rx={62} />
      <rect x="92" y="96" width="16" height="7" rx="2" fill="#b9ad8c" />
      <rect x="40" y="10" width="120" height="78" rx="6" fill="#3569b8" />
      <rect x="44" y="14" width="112" height="70" rx="4" fill={`url(#${p}-face)`} />
      <rect x="44" y="14" width="112" height="9" rx="3" fill="#4c8be2" />
      <rect x="50" y="16.5" width="30" height="3.4" rx="1.7" fill="#fff" opacity=".7" />
      <rect x="50" y="30" width="84" height="6" rx="3" fill="#b9ad8c" />
      <rect x="50" y="40" width="64" height="6" rx="3" fill="#cfc8b4" />
      <rect x="50" y="50" width="76" height="6" rx="3" fill="#cfc8b4" />
      <circle cx="146" cy="64" r="9" fill="#46c08b" />
      <circle cx="144" cy="61.5" r="3" fill="#fff" opacity=".5" />
      <path d="M141.5 64.2L144.6 67.2L150.4 61" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* čtyři odpovědi v barevných dlaždicích */}
      {tiles.map((c, i) => {
        const x = 30 + i * 37;
        return (
          <g key={i}>
            <Shadow cx={x + 16} cy={104} rx={15} ry={1.8} />
            <rect x={x} y="92" width="32" height="11" rx="3.4" fill={c} />
            <rect x={x} y="92" width="32" height="3.4" rx="1.7" fill="#fff" opacity=".4" />
            <rect x={x} y="100" width="32" height="3" rx="1.5" fill="#000" opacity=".16" />
            <circle cx={x + 6} cy="97.5" r="1.9" fill="#fff" opacity=".85" />
          </g>
        );
      })}

      {/* stopky s pohyblivou ručičkou */}
      <Shadow cx={246} cy={104} rx={26} />
      <rect x="238" y="14" width="16" height="7" rx="2" fill="#e2574c" />
      <rect x="244" y="20" width="4" height="6" fill="#b83d34" />
      <circle cx="246" cy="60" r="29" fill="#e2574c" />
      <circle cx="246" cy="60" r="25" fill="#f6f1e4" />
      <path d="M246 35A25 25 0 0 1 271 60H265A19 19 0 0 0 246 41Z" fill="#fff" opacity=".7" />
      <path d="M246 85A25 25 0 0 1 221 60H227A19 19 0 0 0 246 79Z" fill="#000" opacity=".1" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="245" y="39" width="2" height={i % 3 === 0 ? 4.4 : 2.6} fill="#16132b" opacity=".5" transform={`rotate(${i * 30} 246 60)`} />
      ))}
      <g transform="rotate(38 246 60)">
        <rect x="244.6" y="46" width="2.8" height="16" rx="1.4" fill="#e2574c" />
      </g>
      <circle cx="246" cy="60" r="2.8" fill="#e2574c" />
      <circle cx="214" cy="30" r="3.2" fill="#fff" className="pcard-bub" />
      <circle cx="206" cy="44" r="2.2" fill="#fff" className="pcard-bub" style={{ animationDelay: "-1.2s" }} />
    </>
  );
}

/* ---------- Závod: tři auta na dráze a cílová vlajka ---------- */
function Car({ x, y, c, d }: { x: number; y: number; c: string; d: string }) {
  return (
    <g>
      <Shadow cx={x + 23} cy={y + 17} rx={22} ry={2.4} />
      <rect x={x} y={y + 6} width="46" height="12" rx="5" fill={c} />
      <rect x={x} y={y + 6} width="46" height="3" rx="1.5" fill="#fff" opacity=".45" />
      <rect x={x} y={y + 14} width="46" height="4" rx="2" fill={d} opacity=".6" />
      <path d={`M${x + 10} ${y + 6}L${x + 17} ${y}H${x + 32}L${x + 38} ${y + 6}Z`} fill={c} />
      <path d={`M${x + 13} ${y + 6}L${x + 18} ${y + 1.6}H${x + 22}V${y + 6}Z`} fill="#cfe9ff" />
      <path d={`M${x + 24} ${y + 6}V${y + 1.6}H${x + 31}L${x + 35} ${y + 6}Z`} fill="#cfe9ff" opacity=".8" />
      <circle cx={x + 11} cy={y + 18} r="4.6" fill="#2b2f6b" />
      <circle cx={x + 11} cy={y + 17} r="1.6" fill="#b9bfcf" />
      <circle cx={x + 35} cy={y + 18} r="4.6" fill="#2b2f6b" />
      <circle cx={x + 35} cy={y + 17} r="1.6" fill="#b9bfcf" />
      <rect x={x + 43} y={y + 9} width="3" height="2.4" rx="1" fill="#fff3b0" />
    </g>
  );
}

function Race({ p }: { p: string }) {
  const checks = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) checks.push(<rect key={`${r}-${c}`} x={250 + c * 6} y={50 + r * 9} width="6" height="9" fill={(r + c) % 2 ? "#16132b" : "#fff"} />);
  return (
    <>
      <defs>
        <linearGradient id={`${p}-road`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3569b8" stopOpacity=".42" /><stop offset="1" stopColor="#2b2f6b" stopOpacity=".5" /></linearGradient>
      </defs>
      {/* dráha se třemi pruhy a obrubník */}
      <rect x="0" y="54" width="300" height="50" fill={`url(#${p}-road)`} />
      <rect x="0" y="54" width="300" height="2" fill="#fff" opacity=".3" />
      {[70, 86].map((y) => (
        <line key={y} x1="0" y1={y} x2="246" y2={y} stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" strokeDasharray="10 8" />
      ))}
      <rect x="0" y="100" width="300" height="6" fill="#ff8a6b" opacity=".55" />
      <rect x="0" y="100" width="300" height="2" fill="#fff" opacity=".3" />

      {/* prach za prvním autem */}
      <circle cx="10" cy="74" r="5" fill="#fff" opacity=".45" className="pcard-bub" />
      <circle cx="2" cy="82" r="4" fill="#fff" opacity=".35" className="pcard-bub" style={{ animationDelay: "-1.1s" }} />

      <Car x={18} y={58} c="#ff8a6b" d="#c24d33" />
      <Car x={100} y={74} c="#4c8be2" d="#2b5fa8" />
      <Car x={176} y={58} c="#46c08b" d="#25805d" />

      {/* cílová čára a vlajka */}
      {checks}
      <rect x="277" y="14" width="3.4" height="90" fill="#f6f1e4" />
      <rect x="280.4" y="14" width="1.2" height="90" fill="#000" opacity=".15" />
      <g className="pcard-wave" style={{ transformOrigin: "281px 20px" }}>
        <path d="M281 14L298 20L281 26Z" fill="#ffc933" />
        <path d="M281 14L298 20H281Z" fill="#fff" opacity=".35" />
      </g>
      <Shadow cx={279} cy={104} rx={6} ry={1.8} />
    </>
  );
}

/* ---------- Zlatá horečka: otevřená truhla, zlato a jeden drahokam ---------- */
function Gold({ p }: { p: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${p}-coin`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff3b0" /><stop offset=".6" stopColor="#ffc933" /><stop offset="1" stopColor="#c98a0e" /></radialGradient>
        <linearGradient id={`${p}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c77d2e" /><stop offset="1" stopColor="#8f4f17" /></linearGradient>
        <linearGradient id={`${p}-lid`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d88c3a" /><stop offset="1" stopColor="#a8621f" /></linearGradient>
      </defs>
      <path d="M0 98C60 90 130 104 200 96S270 90 300 98V120H0Z" fill="#ffc933" opacity=".16" />

      {/* zlato rozsypané vpředu */}
      <Shadow cx={44} cy={104} rx={24} />
      <ellipse cx="44" cy="100" rx="18" ry="5" fill="#c98a0e" />
      <rect x="26" y="96" width="36" height="4" fill="#c98a0e" />
      <ellipse cx="44" cy="96" rx="18" ry="5" fill={`url(#${p}-coin)`} />
      <ellipse cx="44" cy="91" rx="16" ry="4.5" fill="#c98a0e" />
      <ellipse cx="44" cy="86" rx="14" ry="4" fill={`url(#${p}-coin)`} />

      {/* truhla: vnitřek, tělo a víko */}
      <Shadow cx={152} cy={104} rx={66} />
      <path d="M92 66C92 30 210 30 210 66Z" fill={`url(#${p}-lid)`} />
      <path d="M96 56C104 40 200 40 206 56" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 66H210V70H92Z" fill="#6b3d12" />
      <ellipse cx="152" cy="66" rx="58" ry="9" fill="#3b1f0e" />
      <ellipse cx="140" cy="62" rx="26" ry="5" fill="#ffc933" />
      <ellipse cx="152" cy="59" rx="18" ry="4" fill="#ffe58a" />
      <rect x="92" y="70" width="118" height="30" rx="3" fill={`url(#${p}-wood)`} />
      <rect x="92" y="70" width="118" height="3" fill="#fff" opacity=".25" />
      {[108, 124, 180, 196].map((x) => (
        <rect key={x} x={x} y="70" width="2" height="30" fill="#5a2e0c" opacity=".45" />
      ))}
      <rect x="92" y="78" width="118" height="3.2" fill="#d8cdb5" />
      <rect x="92" y="92" width="118" height="3.2" fill="#d8cdb5" />
      <rect x="142" y="76" width="20" height="18" rx="3" fill="#ffc933" />
      <rect x="142" y="76" width="20" height="3" rx="1.5" fill="#fff3b0" />
      <circle cx="152" cy="86" r="2.8" fill="#8f4f17" />

      {/* létající mince */}
      {[
        [186, 40, 0],
        [212, 22, -1.4],
        [166, 20, -2.6],
        [236, 46, -0.6],
      ].map(([x, y, d], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6.5" ry="6.5" fill={`url(#${p}-coin)`} className="pcard-bub" style={{ animationDelay: `${d}s` }} />
      ))}

      {/* modrý drahokam */}
      <Shadow cx={262} cy={104} rx={14} ry={2} />
      <polygon points="262,80 272,92 262,104 252,92" fill="#8fd0ff" />
      <polygon points="262,80 272,92 262,92" fill="#fff" opacity=".5" />
      <polygon points="262,92 272,92 262,104" fill="#4c8be2" />
    </>
  );
}

/* ---------- Série: schodiště bloků s rostoucím násobkem a plamen ---------- */
function Streak({ p }: { p: string }) {
  const steps = [
    { x: 24, h: 16, c: "#8fd0ff", d: "#4c8be2" },
    { x: 68, h: 28, c: "#7ee0b0", d: "#46c08b" },
    { x: 112, h: 40, c: "#ffc933", d: "#e09a14" },
    { x: 156, h: 52, c: "#ff8a6b", d: "#e2574c" },
    { x: 200, h: 64, c: "#e2574c", d: "#b83d34" },
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${p}-flame`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffc933" /><stop offset="1" stopColor="#ff922b" /></linearGradient>
      </defs>
      <path d="M0 100C70 94 150 104 300 98V120H0Z" fill="#ff8a6b" opacity=".18" />

      {steps.map((s, i) => (
        <g key={i}>
          <Shadow cx={s.x + 22} cy={104} rx={23} />
          <rect x={s.x} y={105 - s.h} width="44" height={s.h} rx="3" fill={s.c} />
          <rect x={s.x} y={105 - s.h} width="44" height="3" rx="1.5" fill="#fff" opacity=".5" />
          <rect x={s.x + 44} y={105 - s.h + 2} width="5" height={s.h - 2} fill={s.d} />
          <rect x={s.x} y={101} width="44" height="4" fill="#000" opacity=".12" />
          <text x={s.x + 22} y={105 - s.h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fillOpacity=".92" fontFamily="var(--font-heading), system-ui, sans-serif">
            ×{i + 1}
          </text>
        </g>
      ))}

      {/* plamen na nejvyšším schodu */}
      <path d="M222 41C208 33 209 22 216 15C214 25 219 29 222 26C223 15 227 10 230 4C236 12 238 24 236 31C238 27 240 23 240 18C247 26 246 37 238 41Z" fill="#ff922b" />
      <path d="M221 41C214 35 214 27 219 22C219 29 223 31 225 29C226 22 228 18 230 14C234 21 234 30 231 35C233 33 234 30 234 27C239 33 238 39 233 41Z" fill={`url(#${p}-flame)`} />
      <path d="M226 39C223 35 224 31 227 28C227 33 229 34 230 33C231 30 232 28 232 26C235 30 235 35 232 39Z" fill="#fff3b0" />

      {/* odznak s násobkem */}
      <g transform="translate(34 18) rotate(-4)">
        <rect x="0" y="0" width="46" height="20" rx="10" fill="#e2574c" />
        <rect x="0" y="0" width="46" height="5" rx="2.5" fill="#fff" opacity=".35" />
        <text x="23" y="14.6" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#fff" fontFamily="var(--font-heading), system-ui, sans-serif">
          ×5
        </text>
      </g>

      {/* jiskry */}
      <circle cx="270" cy="30" r="2.4" fill="#fff3b0" className="pcard-bub" />
      <circle cx="282" cy="52" r="1.8" fill="#fff3b0" className="pcard-bub" style={{ animationDelay: "-1.4s" }} />
    </>
  );
}

/* ---------- Poslední přeživší: tři srdce, jedno zlomené, a ukazatel životů ---------- */
function Survival({ p }: { p: string }) {
  const heart = "M0 8 C0 0 12 -2 14 6 C16 -2 28 0 28 8 C28 18 14 26 14 26 C14 26 0 18 0 8 Z";
  const at = (x: number, y: number, s: number) => `translate(${x - 14 * s} ${y - 13 * s}) scale(${s})`;
  return (
    <>
      <defs>
        <linearGradient id={`${p}-bar`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7ee0b0" /><stop offset="1" stopColor="#2e9468" /></linearGradient>
        <linearGradient id={`${p}-heart`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8a8a" /><stop offset="1" stopColor="#e2574c" /></linearGradient>
      </defs>
      <path d="M0 100C90 92 210 104 300 96V120H0Z" fill="#ff8a6b" opacity=".16" />

      {/* stojánek */}
      <Shadow cx={150} cy={104} rx={80} />
      <rect x="66" y="96" width="168" height="9" rx="4" fill="#b9ad8c" />
      <rect x="66" y="96" width="168" height="2.4" rx="1.2" fill="#fff" opacity=".4" />

      {/* srdce */}
      <g transform={at(78, 62, 1.7)}>
        <path d={heart} fill={`url(#${p}-heart)`} />
        <ellipse cx="6" cy="6" rx="2.6" ry="1.6" fill="#fff" opacity=".5" />
      </g>
      <g transform={at(150, 52, 2.2)}>
        <path d={heart} fill={`url(#${p}-heart)`} />
        <ellipse cx="6" cy="6" rx="2.6" ry="1.6" fill="#fff" opacity=".5" />
      </g>
      <g transform={at(222, 62, 1.7)} opacity=".55">
        <path d={heart} fill="#adb5bd" />
        <path d="M14 8L11 13L16 17L12 24" fill="none" stroke="#16132b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </g>

      {/* ukazatel životů */}
      <rect x="90" y="82" width="120" height="8" rx="4" fill="#d9d1bb" />
      <rect x="90" y="82" width="80" height="8" rx="4" fill={`url(#${p}-bar)`} />
      <rect x="92" y="83" width="76" height="2" rx="1" fill="#fff" opacity=".45" />

      {/* štít a jiskry */}
      <path d="M38 40L56 46V62C56 74 46 80 38 84C30 80 20 74 20 62V46Z" fill="#c9a8ff" />
      <path d="M38 40L56 46V62C56 74 46 80 38 84V40Z" fill="#000" opacity=".1" />
      <path d="M38 52L40 57H45L41 60L42.5 65L38 62L33.5 65L35 60L31 57H36Z" fill="#fff" opacity=".9" />
      <rect x="250" y="30" width="3" height="3" fill="#fff3b0" className="pcard-bub" />
      <rect x="262" y="48" width="2.4" height="2.4" fill="#fff3b0" className="pcard-bub" style={{ animationDelay: "-1.6s" }} />
    </>
  );
}

/* ---------- Týmy: dva praporky, tři hráči za každý tým a zlatý pohár ---------- */
function Person({ x, y, c, s }: { x: number; y: number; c: string; s: string }) {
  return (
    <g>
      <rect x={x - 12} y={y + 12} width="24" height="20" rx="8" fill={c} />
      <rect x={x - 12} y={y + 12} width="24" height="3" rx="1.5" fill="#fff" opacity=".35" />
      <circle cx={x} cy={y} r="8.5" fill={s} />
      <circle cx={x - 2.6} cy={y - 2.6} r="2.2" fill="#fff" opacity=".45" />
    </g>
  );
}

function Teams({ p }: { p: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-cup`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset=".5" stopColor="#ffc933" /><stop offset="1" stopColor="#c98a0e" /></linearGradient>
      </defs>
      <path d="M0 98C70 88 230 108 300 94V120H0Z" fill="#7ee0b0" opacity=".2" />

      {/* praporky */}
      <rect x="48" y="16" width="3" height="86" fill="#f6f1e4" />
      <rect x="51" y="16" width="1.2" height="86" fill="#000" opacity=".15" />
      <path d="M51 18L80 26L51 36Z" fill="#4c8be2" />
      <path d="M51 18L80 26H51Z" fill="#fff" opacity=".3" />
      <rect x="248" y="16" width="3" height="86" fill="#f6f1e4" />
      <rect x="251" y="16" width="1.2" height="86" fill="#000" opacity=".15" />
      <path d="M248 18L219 26L248 36Z" fill="#ff6b6b" />
      <path d="M248 18L219 26H248Z" fill="#fff" opacity=".3" />

      {/* modrý tým */}
      <Shadow cx={90} cy={104} rx={34} />
      <Person x={68} y={60} c="#4c8be2" s="#f4c28a" />
      <Person x={88} y={66} c="#2b5fa8" s="#e9b27a" />
      <Person x={110} y={60} c="#4c8be2" s="#f4c28a" />

      {/* koralový tým */}
      <Shadow cx={210} cy={104} rx={34} />
      <Person x={190} y={60} c="#e2574c" s="#f4c28a" />
      <Person x={212} y={66} c="#b83d34" s="#e9b27a" />
      <Person x={232} y={60} c="#e2574c" s="#f4c28a" />

      {/* zlatý pohár uprostřed */}
      <Shadow cx={150} cy={104} rx={18} ry={2.4} />
      <path d="M132 58C124 58 124 72 136 76" fill="none" stroke="#c98a0e" strokeWidth="3" strokeLinecap="round" />
      <path d="M168 58C176 58 176 72 164 76" fill="none" stroke="#c98a0e" strokeWidth="3" strokeLinecap="round" />
      <path d="M130 50H170C170 72 162 82 150 82C138 82 130 72 130 50Z" fill={`url(#${p}-cup)`} />
      <rect x="146" y="82" width="8" height="12" fill="#c98a0e" />
      <rect x="138" y="93" width="24" height="7" rx="2" fill={`url(#${p}-cup)`} />
      <path d="M140 56C140 66 142 72 146 76" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
      <path d="M150 58L152.2 63L157.4 63.6L153.4 67L154.6 72L150 69.2L145.4 72L146.6 67L142.6 63.6L147.8 63Z" fill="#fff" opacity=".85" />
    </>
  );
}

const SCENES: Record<LiveMode, { seed: number; body: (p: string) => ReactNode }> = {
  QUIZ: { seed: 5, body: (p) => <Quiz p={p} /> },
  RACE: { seed: 7, body: (p) => <Race p={p} /> },
  GOLD: { seed: 3, body: (p) => <Gold p={p} /> },
  STREAK: { seed: 11, body: (p) => <Streak p={p} /> },
  SURVIVAL: { seed: 9, body: (p) => <Survival p={p} /> },
  TEAMS: { seed: 13, body: (p) => <Teams p={p} /> },
};

/** Ilustrace režimu na spodku papírové karty (stejná tvorba jako scénky kategorií na homepage). */
export function ModeScene({ mode }: { mode: LiveMode }) {
  const id = `lm-${mode.toLowerCase()}`;
  const scene = SCENES[mode];
  return (
    <svg className="pcard-scene" viewBox="0 0 300 120" preserveAspectRatio="xMidYMax meet" aria-hidden focusable="false">
      <defs>
        <Rough id={`rough-${id}`} seed={scene.seed} />
      </defs>
      <g filter={`url(#rough-${id})`}>{scene.body(id)}</g>
    </svg>
  );
}
