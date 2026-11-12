// Ikony formuláře zakládání hry: detailnější než SketchIcons, ve stejném jazyku
// (tmavý obrys, ploché tóny s odleskem zleva shora). viewBox 48, aria-hidden.

const INK = "#16132b";
const PAPER = "#f6f1e4";
const STROKE = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

type Props = { size?: number; className?: string };

function Svg({ size = 32, className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden focusable="false">
      {children}
    </svg>
  );
}

/** Lupa: čočka s odleskem, pevná rukojeť a jiskra. */
export function SearchGlyph(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="20" cy="20" r="12" fill="#8fd0ff" {...STROKE} />
      <circle cx="20" cy="20" r="7.5" fill="#cfe9ff" opacity=".55" />
      <path d="M13.5 16.5a7.5 7.5 0 0 1 5-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".95" />
      <path d="M29.5 29.5L40 40" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M29.5 29.5L40 40" stroke="#4c8be2" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 8v5M35.5 10.5h5" stroke="#ffc933" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/** Kurz: tři knihy na sobě, stránky ze strany a záložka. */
export function CourseGlyph(p: Props) {
  return (
    <Svg {...p}>
      {/* spodní kniha */}
      <rect x="7" y="32" width="32" height="8" rx="2.5" fill="#e2574c" {...STROKE} />
      <rect x="10" y="34" width="25" height="3" rx="1.5" fill={PAPER} />
      {/* prostřední */}
      <rect x="10" y="22" width="30" height="8" rx="2.5" fill="#ffc933" {...STROKE} />
      <rect x="13" y="24.5" width="23" height="3" rx="1.5" fill={PAPER} />
      {/* horní, otevřená trochu */}
      <rect x="6" y="11" width="28" height="8" rx="2.5" fill="#7ee0b0" {...STROKE} />
      <rect x="9" y="13.5" width="21" height="3" rx="1.5" fill={PAPER} />
      {/* záložka */}
      <path d="M33 28v12l-3-2.5L27 40V28" fill="#ff8a6b" {...STROKE} />
      <path d="M11 9.6h22" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

/** Moje sady: balíček kartiček s otazníkem a zaškrtnutou kartou navrchu. */
export function SetGlyph(p: Props) {
  return (
    <Svg {...p}>
      <rect x="8" y="14" width="22" height="26" rx="3.5" fill="#c9a8ff" transform="rotate(-8 19 27)" {...STROKE} />
      <rect x="13" y="11" width="22" height="26" rx="3.5" fill="#b592f5" transform="rotate(-2 24 24)" {...STROKE} />
      <rect x="18" y="8" width="22" height="26" rx="3.5" fill={PAPER} {...STROKE} />
      <path d="M26 16.5a3.6 3.6 0 1 1 3.6 3.6c-1.2 0-1.6 1.2-1.6 2.2v.7" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="28" cy="27.5" r="1.4" fill={INK} />
      <path d="M23 13h10" stroke={INK} strokeOpacity=".25" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M32 36.5l3 3 5.5-6" fill="none" stroke="#46c08b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Obtížnost: tři sloupce stoupající do hvězdy. */
export function DifficultyGlyph(p: Props) {
  return (
    <Svg {...p}>
      <rect x="7" y="30" width="8" height="11" rx="2" fill="#46c08b" {...STROKE} />
      <rect x="19" y="23" width="8" height="18" rx="2" fill="#ffc933" {...STROKE} />
      <rect x="31" y="15" width="8" height="26" rx="2" fill="#ff8a6b" {...STROKE} />
      <rect x="8.6" y="31.5" width="2.2" height="6" rx="1" fill="#fff" opacity=".5" />
      <rect x="20.6" y="24.5" width="2.2" height="11" rx="1" fill="#fff" opacity=".5" />
      <rect x="32.6" y="16.5" width="2.2" height="16" rx="1" fill="#fff" opacity=".5" />
      <path
        d="M35 4l1.9 3.9 4.3.6-3.1 3 .7 4.3L35 13.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"
        fill="#fff3b0"
        {...STROKE}
        strokeWidth="1.8"
      />
    </Svg>
  );
}

/** Počet otázek: seznam s očíslovanými řádky a tužka. */
export function CountGlyph(p: Props) {
  return (
    <Svg {...p}>
      <rect x="7" y="9" width="28" height="32" rx="4" fill={PAPER} {...STROKE} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="14" cy={18 + i * 7.5} r="2.6" fill={["#e2574c", "#4c8be2", "#46c08b"][i]} {...STROKE} strokeWidth="1.5" />
          <path d={`M19.5 ${18 + i * 7.5}H29`} stroke={INK} strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <g transform="rotate(35 37 33)">
        <rect x="34.5" y="19" width="5" height="19" rx="1.2" fill="#ffc933" {...STROKE} strokeWidth="1.8" />
        <rect x="34.5" y="15.5" width="5" height="4" rx="1" fill="#ff8a6b" {...STROKE} strokeWidth="1.8" />
        <path d="M34.5 38l2.5 5 2.5-5z" fill="#f6d9b0" {...STROKE} strokeWidth="1.6" />
      </g>
    </Svg>
  );
}
