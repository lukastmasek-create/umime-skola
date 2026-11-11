import type { ReactNode } from "react";

// Ručně stavěné ilustrační scénky pro spodek karet kategorií (viewBox 300 × 120).
// Společná pravidla, aby působily jako jedna sada:
//  · světlo shora zleva: každý předmět má světlý okraj vlevo/nahoře a tmavší stranu vpravo/dole,
//  · tři tóny na předmět (základ, světlo, stín), žádné obrysy, jen plochy a jemné přechody,
//  · všechno stojí na společné zemi (y ≈ 105) a vrhá pod sebe měkký stín,
//  · malé pohyblivé detaily (bubliny, vlajka, střela, střapec, třpyt) pro život scény.

const Shadow = ({ cx, cy, rx, ry = 2.6 }: { cx: number; cy: number; rx: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity=".3" />
);

// Kniha ze strany: desky, bloček stránek, hřbet a světlý lem.
function Book({ x, y, w, c, d, h = 12, rot = 0 }: { x: number; y: number; w: number; c: string; d: string; h?: number; rot?: number }) {
  return (
    <g transform={rot ? `rotate(${rot} ${x + w / 2} ${y + h})` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx="2.4" fill={c} />
      <rect x={x + 5} y={y + 3} width={w - 7} height={h - 6} rx="1" fill="#f6f1e4" />
      <rect x={x + 5} y={y + h - 4.4} width={w - 7} height="1.4" fill="#000" opacity=".1" />
      <path d={`M${x + 2.4} ${y}H${x + 5}V${y + h}H${x + 2.4}A2.4 2.4 0 0 1 ${x} ${y + h - 2.4}V${y + 2.4}A2.4 2.4 0 0 1 ${x + 2.4} ${y}Z`} fill={d} />
      <rect x={x + 1} y={y + 1} width={w - 2} height="1.2" rx=".6" fill="#fff" opacity=".4" />
    </g>
  );
}

// Dřevěná kostka s písmenem (lehká izometrie: přední stěna, horní a pravá).
function Block({ x, y, s = 26, f, t, r, ch }: { x: number; y: number; s?: number; f: string; t: string; r: string; ch: string }) {
  const k = 7;
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx="2.4" fill={f} />
      <polygon points={`${x + 1},${y} ${x + k + 1},${y - k} ${x + s + k - 1},${y - k} ${x + s - 1},${y}`} fill={t} />
      <polygon points={`${x + s},${y + 1} ${x + s + k},${y - k + 1} ${x + s + k},${y + s - k - 1} ${x + s},${y + s - 1}`} fill={r} />
      <text x={x + s / 2} y={y + s / 2 + 6.4} textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff" fillOpacity=".95" fontFamily="var(--font-heading), system-ui, sans-serif">
        {ch}
      </text>
    </g>
  );
}

function Zakladni(): ReactNode {
  return (
    <>
      <defs>
        <radialGradient id="sc-z-sun"><stop offset="0" stopColor="#fff3b0" /><stop offset="1" stopColor="#ffc933" stopOpacity="0" /></radialGradient>
        <linearGradient id="sc-z-pencil" x1="0" x2="1"><stop offset="0" stopColor="#ffe48a" /><stop offset=".55" stopColor="#ffc933" /><stop offset="1" stopColor="#e09a14" /></linearGradient>
        <linearGradient id="sc-z-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffc933" stopOpacity=".4" /><stop offset="1" stopColor="#ffc933" stopOpacity=".06" /></linearGradient>
      </defs>
      <circle cx="248" cy="40" r="34" fill="url(#sc-z-sun)" />
      <g className="pcard-sunrays" stroke="#ffe58a" strokeWidth="2" strokeLinecap="round" opacity=".8">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1="248" y1="18" x2="248" y2="12" transform={`rotate(${i * 36} 248 40)`} />
        ))}
      </g>
      <circle cx="248" cy="40" r="12.5" fill="#ffe58a" />
      <circle cx="244.5" cy="36.5" r="5" fill="#fff8d0" opacity=".7" />
      <path d="M0 84C46 60 92 68 134 80S214 62 300 76V120H0Z" fill="url(#sc-z-hill)" />
      <path d="M0 102C64 90 118 106 188 98S262 92 300 99V120H0Z" fill="#ffc933" opacity=".2" />
      <path d="M0 102C64 90 118 106 188 98S262 92 300 99" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1.2" />

      {/* papírová vlaštovka s čárkovanou stopou */}
      <path d="M96 58C112 62 118 40 134 36S150 30 160 22" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" className="pcard-march" />
      <g className="pcard-plane" transform="translate(162 22) rotate(-22)">
        <path d="M0 0L28 -2L10 9Z" fill="#f6f1e4" />
        <path d="M10 9L28 -2L12 17Z" fill="#cfc8b4" />
        <path d="M0 0L28 -2L8 4Z" fill="#fff" opacity=".7" />
      </g>

      {/* hromádka knih */}
      <Shadow cx={60} cy={105} rx={40} />
      <Book x={26} y={93} w={68} c="#e2574c" d="#b53b32" />
      <Book x={33} y={81} w={58} c="#4c8be2" d="#3569b8" rot={-1.5} />
      <Book x={37} y={69} w={50} c="#f2b632" d="#c98d16" rot={2} />

      {/* pastelka */}
      <Shadow cx={118} cy={106} rx={10} />
      <g transform="translate(118 104) rotate(7)">
        <rect x="-7" y="-58" width="14" height="50" fill="url(#sc-z-pencil)" />
        <rect x="1" y="-58" width="6" height="50" fill="#000" opacity=".1" />
        <line x1="0" y1="-58" x2="0" y2="-8" stroke="#b87a0c" strokeOpacity=".35" strokeWidth="1" />
        <rect x="-7" y="-9" width="14" height="6.4" fill="#b9bfcf" />
        <rect x="-7" y="-7" width="14" height="1.2" fill="#fff" opacity=".6" />
        <rect x="-7" y="-4.4" width="14" height="1" fill="#000" opacity=".15" />
        <path d="M-7 -2.6H7V1.4A3 3 0 0 1 4 4.4H-4A3 3 0 0 1 -7 1.4Z" fill="#f08aa0" />
        <path d="M-7 -58L0 -77L7 -58Z" fill="#f3d3a3" />
        <path d="M0 -77L7 -58H1Z" fill="#d8b27a" />
        <path d="M-2.8 -69.6L0 -77L2.8 -69.6Z" fill="#2a2a3a" />
      </g>

      {/* kostky s písmeny */}
      <Shadow cx={182} cy={106} rx={34} />
      <Block x={150} y={79} f="#4c8be2" t="#86b6f4" r="#3569b8" ch="A" />
      <Block x={186} y={79} f="#e2574c" t="#f58b81" r="#b83d34" ch="B" />
      <g transform="rotate(-6 176 66)">
        <Block x={166} y={53} f="#46c08b" t="#7fe2b6" r="#2e9468" ch="C" />
      </g>
    </>
  );
}

function Stredni(): ReactNode {
  const ticks = Array.from({ length: 11 }, (_, i) => 190 + i * 4.3);
  return (
    <>
      <defs>
        <linearGradient id="sc-s-liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fe8da" /><stop offset="1" stopColor="#1e9f94" /></linearGradient>
        <linearGradient id="sc-s-glass" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".34" /><stop offset=".5" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#fff" stopOpacity=".16" /></linearGradient>
        <linearGradient id="sc-s-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8a6b" stopOpacity=".42" /><stop offset="1" stopColor="#ff8a6b" stopOpacity=".12" /></linearGradient>
      </defs>
      <rect x="0" y="105" width="300" height="15" fill="url(#sc-s-desk)" />
      <line x1="0" y1="105.5" x2="300" y2="105.5" stroke="#fff" strokeOpacity=".32" strokeWidth="1.2" />

      {/* baňka s bublajícím roztokem */}
      <Shadow cx={60} cy={106} rx={26} />
      <path d="M54 52H66V70L82 102Q84 106 80 106H40Q36 106 38 102L54 70Z" fill="url(#sc-s-glass)" />
      <path d="M46.2 86Q54 82.6 60 86T73.8 86L82 102Q84 106 80 106H40Q36 106 38 102Z" fill="url(#sc-s-liquid)" />
      <path d="M46.2 86Q54 82.6 60 86T73.8 86" fill="none" stroke="#c9fff8" strokeWidth="1.2" strokeOpacity=".8" />
      <path d="M54 52H66V70L82 102Q84 106 80 106H40Q36 106 38 102L54 70Z" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="51" y="48.5" width="18" height="4.6" rx="2.3" fill="#fff" fillOpacity=".42" />
      <path d="M56.4 56V70.6L44.4 99" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
      <g fill="#c9fff8" fillOpacity=".85">
        <circle className="pcard-bub" cx="54" cy="84" r="2.2" />
        <circle className="pcard-bub" cx="62" cy="86" r="1.6" style={{ animationDelay: "-1.1s" }} />
        <circle className="pcard-bub" cx="58" cy="85" r="1.2" style={{ animationDelay: "-2.2s" }} />
      </g>

      {/* učebnice */}
      <Shadow cx={133} cy={106} rx={38} />
      <Book x={98} y={93} w={70} c="#4c8be2" d="#3569b8" />
      <Book x={104} y={81} w={58} c="#f2b632" d="#c98d16" rot={-2} />
      <Book x={101} y={69} w={62} c="#8f86ff" d="#675ed8" rot={1.5} />

      {/* trojúhelník s ryskami */}
      <Shadow cx={212} cy={106} rx={28} />
      <path d="M186 105H240L186 57Z M194 98H223L194 72Z" fillRule="evenodd" fill="#ffc933" fillOpacity=".28" stroke="#ffd766" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M186 57L240 105" stroke="#fff" strokeOpacity=".25" strokeWidth="1" />
      <g stroke="#ffd766" strokeWidth="1" strokeLinecap="round">
        {ticks.map((x, i) => (
          <line key={x} x1={x} y1="105" x2={x} y2={i % 2 ? 102 : 100} />
        ))}
      </g>

      {/* atom */}
      <g className="pcard-atom" fill="none" stroke="#8fd0ff" strokeWidth="1.3">
        <ellipse cx="266" cy="46" rx="22" ry="8" opacity=".8" />
        <ellipse cx="266" cy="46" rx="22" ry="8" transform="rotate(60 266 46)" opacity=".8" />
        <ellipse cx="266" cy="46" rx="22" ry="8" transform="rotate(-60 266 46)" opacity=".8" />
        <circle cx="288" cy="46" r="2.6" fill="#fff" stroke="none" />
        <circle cx="255" cy="65" r="2.6" fill="#fff" stroke="none" />
        <circle cx="255" cy="27" r="2.6" fill="#fff" stroke="none" />
      </g>
      <circle cx="266" cy="46" r="10" fill="#8fd0ff" opacity=".25" />
      <circle cx="266" cy="46" r="4.6" fill="#fff" />
    </>
  );
}

function Prijimacky(): ReactNode {
  return (
    <>
      <defs>
        <linearGradient id="sc-p-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd0ff" stopOpacity=".34" /><stop offset="1" stopColor="#8fd0ff" stopOpacity=".06" /></linearGradient>
        <linearGradient id="sc-p-flag" x1="0" x2="1"><stop offset="0" stopColor="#ffd766" /><stop offset="1" stopColor="#f0a91c" /></linearGradient>
        <linearGradient id="sc-p-board" x1="0" x2="1"><stop offset="0" stopColor="#d08c4c" /><stop offset="1" stopColor="#a8693a" /></linearGradient>
      </defs>
      <path d="M0 86C50 70 100 82 150 76S250 54 300 62V120H0Z" fill="url(#sc-p-hill)" />
      <path d="M0 104C70 94 140 108 210 98S270 96 300 100V120H0Z" fill="#8fd0ff" opacity=".24" />
      <path d="M0 104C70 94 140 108 210 98S270 96 300 100" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1.2" />

      {/* cíl: vlajka na kopci a čárkovaná cesta k ní */}
      <path d="M196 76C216 76 230 56 258 46" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" className="pcard-march" />
      <Shadow cx={262} cy={64} rx={9} ry={2} />
      <line x1="262" y1="24" x2="262" y2="64" stroke="#e9e8f6" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="262" cy="22.6" r="2.6" fill="#ffd766" />
      <g className="pcard-wave">
        <path d="M263 26C272 22 278 31 291 26V43C278 48 272 39 263 43Z" fill="url(#sc-p-flag)" />
        <path d="M263 26C272 22 278 31 291 26" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
        <path d="M273 33.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6Z" fill="#fff" fillOpacity=".9" transform="translate(3 -6) scale(.8)" />
      </g>

      {/* terč na trojnožce se zabodnutým šípem */}
      <Shadow cx={68} cy={107} rx={26} />
      <g stroke="#8a5a2c" strokeWidth="3.4" strokeLinecap="round">
        <line x1="68" y1="88" x2="50" y2="107" />
        <line x1="68" y1="88" x2="86" y2="107" />
      </g>
      <line x1="68" y1="88" x2="68" y2="102" stroke="#6e4620" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="68" cy="60" r="35" fill="#23265e" />
      <circle cx="68" cy="60" r="32" fill="#f4f3ff" />
      <circle cx="68" cy="60" r="25" fill="#e2574c" />
      <circle cx="68" cy="60" r="18" fill="#f4f3ff" />
      <circle cx="68" cy="60" r="11" fill="#e2574c" />
      <circle cx="68" cy="60" r="4.6" fill="#ffc933" />
      <path d="M68 28A32 32 0 0 1 100 60A32 32 0 0 1 68 92A32 32 0 0 0 68 28Z" fill="#000" opacity=".1" transform="rotate(35 68 60)" />
      <path d="M44 47A28 28 0 0 1 60 34" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      <g transform="translate(68 60) rotate(-38)">
        <g className="pcard-thunk">
          <line x1="3" y1="0" x2="52" y2="0" stroke="#d9a066" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="3" y1="-0.9" x2="52" y2="-0.9" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" />
          <path d="M38 0L48 -5.4H51L45 0L51 5.4H48Z" fill="#e2574c" />
          <path d="M31 0L40 -4.8H42.6L37.4 0L42.6 4.8H40Z" fill="#f4f3ff" />
        </g>
      </g>

      {/* podložka s odškrtávaným seznamem */}
      <Shadow cx={166} cy={107} rx={26} />
      <g transform="translate(142 51) rotate(-5 22 29)">
        <rect width="44" height="58" rx="5" fill="url(#sc-p-board)" />
        <rect x="4" y="8" width="36" height="46" rx="2" fill="#f6f1e4" />
        <rect x="14" y="-3" width="16" height="9" rx="2.6" fill="#9aa1b5" />
        <rect x="14" y="-3" width="16" height="2.4" rx="1.2" fill="#fff" opacity=".5" />
        <circle cx="22" cy="1.6" r="1.6" fill="#5d6378" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${i * 13})`}>
            <rect x="8" y="14" width="7.4" height="7.4" rx="1.8" fill="none" stroke="#9aa0b4" strokeWidth="1.1" />
            <line x1="19" y1="17.7" x2={i === 1 ? 33 : 35} y2="17.7" stroke="#c5bfae" strokeWidth="1.8" strokeLinecap="round" />
            {i < 2 && (
              <path d="M9.4 17.6l2.2 2.4 4.4-5.6" fill="none" stroke="#25a86b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength={100} className="pcard-draw" style={{ animationDelay: `${i * 0.7}s` }} />
            )}
          </g>
        ))}
      </g>
    </>
  );
}

function Maturita(): ReactNode {
  return (
    <>
      <defs>
        <linearGradient id="sc-m-spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#7ee0b0" stopOpacity=".02" /></linearGradient>
        <linearGradient id="sc-m-cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a50b0" /><stop offset="1" stopColor="#24276a" /></linearGradient>
        <linearGradient id="sc-m-gold" x1="0" x2="1"><stop offset="0" stopColor="#ffeaa0" /><stop offset=".5" stopColor="#ffc933" /><stop offset="1" stopColor="#c98a0e" /></linearGradient>
        <linearGradient id="sc-m-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#e7dcc0" /></linearGradient>
      </defs>
      <polygon points="150,-6 82,120 218,120" fill="url(#sc-m-spot)" />
      <ellipse cx="150" cy="108" rx="146" ry="12" fill="#7ee0b0" opacity=".2" />
      <ellipse cx="150" cy="106" rx="120" ry="8" fill="#7ee0b0" opacity=".16" />

      {/* absolventská čepice se střapcem */}
      <Shadow cx={70} cy={104} rx={34} ry={3.4} />
      <path d="M48 62L70 70L92 62V82C84 92 56 92 48 82Z" fill="#1b1d4f" />
      <path d="M48 62L70 70L92 62" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1" />
      <polygon points="24,52 70,70 70,77 24,59" fill="#1b1d4a" />
      <polygon points="70,70 116,52 116,59 70,77" fill="#12143a" />
      <polygon points="70,34 116,52 70,70 24,52" fill="url(#sc-m-cap)" />
      <polygon points="70,34 116,52 70,52" fill="#fff" opacity=".07" />
      <line x1="24" y1="52" x2="70" y2="34" stroke="#fff" strokeOpacity=".4" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="70" cy="52" r="3.4" fill="url(#sc-m-gold)" />
      <path d="M70 52L106 56C113 57 116 61 116 70" fill="none" stroke="#ffc933" strokeWidth="1.8" strokeLinecap="round" />
      <g className="pcard-sway">
        <circle cx="116" cy="70.5" r="2.8" fill="url(#sc-m-gold)" />
        <path d="M113.4 73h5.2l1.8 14h-8.8Z" fill="url(#sc-m-gold)" />
        <g stroke="#a97308" strokeOpacity=".45" strokeWidth=".7">
          <line x1="114.6" y1="76" x2="113.6" y2="87" />
          <line x1="116" y1="76" x2="116" y2="87" />
          <line x1="117.4" y1="76" x2="118.4" y2="87" />
        </g>
      </g>

      {/* diplom převázaný stuhou */}
      <Shadow cx={180} cy={106} rx={38} />
      <g transform="translate(180 96) rotate(-3)">
        <rect x="-30" y="-8" width="60" height="16" fill="url(#sc-m-paper)" />
        <line x1="-30" y1="-5.5" x2="30" y2="-5.5" stroke="#fff" strokeOpacity=".8" strokeWidth="1" />
        <ellipse cx="-30" cy="0" rx="5.4" ry="8" fill="#efe6cf" />
        <path d="M-30 -5.6A3.4 5.6 0 1 1 -30 5.6" fill="none" stroke="#b9ad8c" strokeWidth="1" />
        <ellipse cx="30" cy="0" rx="5.4" ry="8" fill="#d9ceb0" />
        <path d="M30 -8A5.4 8 0 0 0 30 8" fill="none" stroke="#b9ad8c" strokeWidth="1" />
        <rect x="-6" y="-8.4" width="12" height="16.8" fill="#e2574c" />
        <rect x="-6" y="-8.4" width="3" height="16.8" fill="#f58b81" opacity=".7" />
        <path d="M-1.4 8L-7 17.4L-3 15L-0.2 18Z" fill="#b83d34" />
        <path d="M1.4 8L7 17.4L3 15L0.2 18Z" fill="#cf4a40" />
        <ellipse cx="-4.4" cy="-1" rx="5.2" ry="3" transform="rotate(-28 -4.4 -1)" fill="#f06a5e" />
        <ellipse cx="4.4" cy="-1" rx="5.2" ry="3" transform="rotate(28 4.4 -1)" fill="#d4493f" />
        <circle cx="0" cy="-0.6" r="2.4" fill="#b83d34" />
      </g>

      {/* pohár */}
      <Shadow cx={252} cy={106} rx={20} />
      <g transform="translate(252 20)">
        <path d="M-17 28C-31 28 -31 47 -15 50" fill="none" stroke="url(#sc-m-gold)" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M17 28C31 28 31 47 15 50" fill="none" stroke="#c98a0e" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M-17 28H17C17 50 8 58 0 58C-8 58 -17 50 -17 28Z" fill="url(#sc-m-gold)" />
        <ellipse cx="0" cy="28" rx="17" ry="3.6" fill="#ffeaa0" />
        <ellipse cx="0" cy="28.6" rx="13.6" ry="2.4" fill="#b87a0c" opacity=".55" />
        <path d="M-12 33C-12 44 -8 51 -3 54" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2.2" strokeLinecap="round" className="pcard-shine" />
        <path d="M0 37.4l2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.5-4.6 2.5.9-5.1-3.8-3.6 5.2-.8Z" fill="#fff" fillOpacity=".92" transform="translate(0 -2) scale(.9)" />
        <rect x="-3" y="57" width="6" height="12" fill="#c98a0e" />
        <ellipse cx="0" cy="63" rx="5.6" ry="2.6" fill="url(#sc-m-gold)" />
        <rect x="-13" y="69" width="26" height="7" rx="2" fill="url(#sc-m-gold)" />
        <rect x="-17" y="76" width="34" height="9" rx="2.4" fill="#2b2f6b" />
        <rect x="-17" y="76" width="34" height="2" rx="1" fill="#fff" opacity=".22" />
        <rect x="-8" y="79.4" width="16" height="2.6" rx="1.3" fill="#ffc933" opacity=".85" />
      </g>
    </>
  );
}

export function PcardScene({ slug }: { slug: string }) {
  return (
    <svg className="pcard-scene" viewBox="0 0 300 120" preserveAspectRatio="xMidYMax meet" aria-hidden focusable="false">
      {slug === "stredni" ? <Stredni /> : slug === "prijimacky" ? <Prijimacky /> : slug === "maturita" ? <Maturita /> : <Zakladni />}
    </svg>
  );
}
