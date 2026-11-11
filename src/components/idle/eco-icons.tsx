import type { ReactNode } from "react";

/**
 * SVG ikony hry Ekonomika. Každá je kreslená na mřížce 24×24, vícebarevná,
 * s obrysem v `currentColor` (drží se světlého i tmavého motivu).
 * Klíčem je původní emoji znak (bez variačního selektoru U+FE0F), takže
 * `<Ico e="🍎" />` i `<EmojiText>` fungují nad stávajícími daty a překlady.
 */

const C = {
  red: "#ef4444", redD: "#b91c1c", green: "#22c55e", greenD: "#15803d", greenL: "#86efac",
  yellow: "#fbbf24", yellowD: "#d97706", gold: "#f59e0b", blue: "#3b82f6", blueD: "#1d4ed8", blueL: "#bfdbfe",
  sky: "#38bdf8", brown: "#a16207", brownD: "#78350f", brownL: "#d6a45a", gray: "#cbd5e1", grayD: "#64748b", grayM: "#94a3b8",
  white: "#ffffff", skin: "#fcd9b6", purple: "#a855f7", purpleD: "#7e22ce", pink: "#f472b6", orange: "#fb923c", dark: "#334155", teal: "#14b8a6",
};

// Bílý odlesk, který z plochy dělá lesklý předmět.
const sh = (d: string): ReactNode => <path d={d} stroke="#fff" strokeWidth="1.3" opacity=".85" fill="none" key={"sh" + d} />;
// Malá hvězdička (jiskra) se středem v [x, y].
const sp = (x: number, y: number, r: number, f: string): ReactNode => (
  <path key={`sp${x}${y}`} d={`M${x} ${y - r}l${r * 0.3} ${r * 0.7} ${r * 0.7} ${r * 0.3}-${r * 0.7} ${r * 0.3}-${r * 0.3} ${r * 0.7}-${r * 0.3}-${r * 0.7}-${r * 0.7}-${r * 0.3} ${r * 0.7}-${r * 0.3}z`} fill={f} strokeWidth=".8" />
);
const p = (d: string, f: string = "none"): ReactNode => <path d={d} fill={f} key={d + f} />;

const ICONS: Record<string, ReactNode> = {
  // ───────── Potřeby ─────────
  "🍎": (<>
    {p("M12 8c-3-2.2-7-.6-7 4 0 4.2 3 8 5.5 8 .9 0 1-.5 1.5-.5s.6.5 1.5.5c2.500 0 5.500-3.800 5.500-8 0-4.600-4-6.200-7-4z", C.red)}
    {p("M7.500 11c.4-1.500 1.500-2.300 2.700-2.500", "none")}
    {p("M12 8c0-2 .6-3.600 2.200-4.500", "none")}
    {p("M14.200 3.500c1.800-.4 3.200.4 3.600 1.700-1.600.6-3.300.3-3.600-1.700z", C.green)}
    {sh("M7.500 12.500c.1-1.900 1-3.200 2.600-3.800")}
    <path d="M14.800 4.400c.8.300 1.500.9 2 1.600" stroke={C.greenD} strokeWidth=".8" />
    {sp(20, 8, 2, C.yellow)}
  </>),
  "🥤": (<>
    {p("M6.500 8h11l-1.300 12.200a1 1 0 0 1-1 .8H8.800a1 1 0 0 1-1-.8L6.500 8z", C.blueL)}
    {p("M7 12h10l-.8 8H7.800L7 12z", C.sky)}
    {p("M5.500 8h13", "none")}
    {p("M12.500 8 14 3h3", "none")}
    <circle cx="10.500" cy="16" r=".9" fill={C.white} stroke="none" />
    <circle cx="13.500" cy="17.500" r=".7" fill={C.white} stroke="none" />
    <rect x="9" y="12" width="3" height="3" rx=".7" fill={C.white} opacity=".85" transform="rotate(-12 10.500 13.500)" />
    <rect x="12" y="14.500" width="2.800" height="2.800" rx=".7" fill={C.white} opacity=".75" transform="rotate(10 13.400 15.900)" />
    {p("M5.500 7h13a.5.5 0 0 1 .5.5V9H5V7.500a.5.5 0 0 1 .5-.5z", C.red)}
    {sh("M7.800 11.500l.5 5")}
  </>),
  "👕": (<>
    {p("M8.500 4 3 7l2 4.200 2.500-1V20h9V10.200l2.500 1L21 7l-5.500-3c-.4 1.400-1.800 2.200-3.500 2.200S8.900 5.400 8.500 4z", C.blue)}
    {p("M8.500 4c.4 1.400 1.800 2.200 3.500 2.200S15.100 5.400 15.500 4", "none")}
    {p("M7.500 14h9", C.blueD)}
    {p("M9.500 12h3.200v3.200H9.500z", C.blueD)}
    {p("M10 4.600c.5 1 1.200 1.600 2 1.600s1.500-.6 2-1.600", C.white)}
    {p("m15 11.500.6 1.200 1.300.2-1 .9.2 1.300-1.100-.6-1.100.6.2-1.300-1-.9 1.300-.2z", C.yellow)}
    {sh("M9 6.500l-.2 3")}
  </>),
  "🏠": (<>
    {p("M4.500 11 12 4l7.500 7", "none")}
    {p("M5.500 10.500V20h13v-9.500L12 4.500l-6.500 6z", C.yellow)}
    {p("M3.500 11.500 12 3.800l8.500 7.700", C.red)}
    {p("M10 20v-5.500h4V20", C.brownL)}
    {p("M16 6.500V4h2v4.200", C.brownD)}
    <rect x="7" y="12" width="3" height="3" rx=".4" fill={C.blueL} />
    <rect x="14.500" y="12" width="3" height="3" rx=".4" fill={C.blueL} />
    {p("M8.500 12v3M7 13.500h3M16 12v3M14.500 13.500h3", "none")}
    <circle cx="13.200" cy="17.500" r=".5" fill={C.brownD} stroke="none" />
    <circle cx="17.300" cy="2" r=".9" fill={C.white} stroke="none" opacity=".9" />
    <circle cx="18.700" cy="1" r=".6" fill={C.white} stroke="none" opacity=".7" />
  </>),
  "🚌": (<>
    {p("M4 5.500A1.500 1.500 0 0 1 5.500 4h13A1.500 1.500 0 0 1 20 5.500V17H4V5.500z", C.yellow)}
    {p("M5.500 7.500h13V12h-13z", C.blueL)}
    {p("M12 7.500V12", "none")}
    {p("M4 14.500h16", C.yellowD)}
    <circle cx="8" cy="17.500" r="2" fill={C.dark} />
    <circle cx="16" cy="17.500" r="2" fill={C.dark} />
    <circle cx="6.500" cy="14.300" r=".5" fill={C.white} stroke="none" />
    <circle cx="17.500" cy="14.300" r=".5" fill={C.white} stroke="none" />
    {p("M9.500 1.800h5v2.200h-5z", C.green)}
    <circle cx="3" cy="9.500" r="1" fill={C.gray} />
    {p("M12 12V17", "none")}
    {sh("M6.500 8.800l1.500 0")}
  </>),
  "🩺": (<>
    {p("M7 3.500v5a4 4 0 0 0 8 0v-5", "none")}
    {p("M6 3.500h2M14 3.500h2", "none")}
    {p("M11 12.500v2.500a4 4 0 0 0 8 0v-1", "none")}
    <circle cx="19" cy="12" r="2" fill={C.teal} />
    <circle cx="7" cy="3" r="1.100" fill={C.gray} />
    <circle cx="15" cy="3" r="1.100" fill={C.gray} />
    <circle cx="19" cy="12" r=".8" fill={C.white} stroke="none" />
  </>),
  "🎬": (<>
    {p("M4 10h16v9.500a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10z", C.dark)}
    {p("M4 10 3.200 6.200l15.800-3.200.9 3.800L4 10z", C.gray)}
    {p("M6.800 9.600 5.800 5.500M10.800 8.800 9.800 4.700M14.800 8 13.800 3.900", C.dark)}
    {p("M11 13.500v4.500l4-2.250-4-2.250z", C.yellow)}
    {sp(21, 12, 2, C.yellow)}
    {sh("M5.500 14v4.500")}
  </>),

  // ───────── Světy ─────────
  "🧰": (<>
    {p("M3.500 9h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z", C.red)}
    {p("M9 9V6.500A1.500 1.500 0 0 1 10.500 5h3A1.500 1.500 0 0 1 15 6.500V9", "none")}
    {p("M2.500 13.500h19", C.redD)}
    <rect x="10.500" y="12" width="3" height="3.500" rx=".6" fill={C.yellow} />
  </>),
  "🚀": (<>
    {p("M12 2.500c3.500 2.500 4.800 6 4.300 10.500H7.700C7.200 8.500 8.500 5 12 2.500z", C.white)}
    {p("M7.700 13 5 16.500l.5 2.500 3-1.500M16.300 13 19 16.500l-.5 2.500-3-1.500", C.red)}
    <circle cx="12" cy="9" r="1.900" fill={C.sky} />
    {p("M10 13.500c0 2.500.6 4.500 2 6.500 1.400-2 2-4 2-6.500", C.orange)}
    {p("M10.800 13.500c0 1.600.3 3 1.200 4.500.9-1.500 1.200-2.900 1.200-4.500", C.yellow)}
    {p("M9.500 5.500C10.200 4.500 11 3.700 12 2.800c1 .9 1.800 1.700 2.500 2.700z", C.red)}
    {sh("M9.800 8l.3 3.500")}
    {sp(3.500, 5, 2, C.yellow)}
    {sp(20, 4.500, 1.800, C.pink)}
    {p("M5 21l1-2M19 21l-1-2M12 22v-1.500", C.sky)}
  </>),
  "🌊": (<>
    {p("M2.500 9c1.800-2 3.400-2 5.200 0s3.400 2 5.200 0 3.400-2 5.200 0l2.400 1.500", "none")}
    {p("M2.500 9c1.800-2 3.400-2 5.200 0s3.400 2 5.200 0 3.400-2 5.200 0 2.400 1 2.400 1V20h-18V9z", C.sky)}
    {p("M2.500 14c1.800-2 3.400-2 5.200 0s3.400 2 5.200 0 3.400-2 5.200 0l1.900 1", C.blueL)}
    {p("M2.500 18c1.800-2 3.400-2 5.200 0s3.400 2 5.200 0 3.400-2 5.200 0", C.blue)}
    {p("M17 3.500v5.700l3.200-.3z", C.white)}
    {p("M14.800 9.800h5.600l-1.100 1.800h-3.400z", C.red)}
    <circle cx="5.500" cy="11.500" r=".7" fill={C.white} stroke="none" />
    <circle cx="9.500" cy="16" r=".6" fill={C.white} stroke="none" />
    <circle cx="14.500" cy="14.800" r=".7" fill={C.white} stroke="none" />
  </>),
  "🌲": (<>
    {p("M12 2.500 6.500 10h3L5.500 15.500H18.500L14.500 10h3L12 2.500z", C.greenD)}
    {p("M12 2.500 8.200 7.600 12 7.600 15.800 7.600 12 2.500z", C.green)}
    {p("M10.500 15.500h3V21h-3z", C.brown)}
    <circle cx="10" cy="12.500" r=".9" fill={C.red} stroke="none" />
    <circle cx="14.200" cy="13.500" r=".9" fill={C.yellow} stroke="none" />
    <circle cx="12" cy="9" r=".9" fill={C.sky} stroke="none" />
    {sh("M10.500 6.500l-1.500 2.500")}
  </>),
  "🏰": (<>
    {p("M3.500 21V8.500h3V10h2V8.500h1.500V10h4V8.500H15V10h2V8.500h3V21H3.500z", C.grayM)}
    {p("M3.500 8.500v-3h3v3M9.500 8.500v-3H11v3M13 8.500v-3h1.500v3M17.500 8.500v-3h3v3", C.gray)}
    {p("M9.500 21v-5a2.500 2.500 0 0 1 5 0v5h-5z", C.brownD)}
    {p("M5.800 13v1.600M18.200 13v1.600", C.dark)}
    {p("M12 5.500V2.500l3 1-3 1", C.red)}
    <rect x="5.500" y="12.500" width="1.800" height="2.800" rx=".9" fill={C.yellow} />
    <rect x="16.700" y="12.500" width="1.800" height="2.800" rx=".9" fill={C.yellow} />
    {p("M3.500 18h6M14.500 18h6M12 10v4", "none")}
  </>),
  "🪄": (<>
    {p("m4 20 11-11", "none")}
    {p("m4.700 19.300 10.600-10.600 1.600 1.600L6.300 20.900 4.700 19.300z", C.dark)}
    {p("m13.500 10.500 1-1 1.600 1.600-1 1z", C.white)}
    {p("M17.500 2.500 18.300 5 20.800 5.800 18.300 6.600 17.500 9.100 16.700 6.600 14.200 5.800 16.700 5l.8-2.500z", C.yellow)}
    {p("M20.500 11.500l.4 1.100 1.100.4-1.100.4-.4 1.100-.4-1.100-1.100-.4 1.100-.4z", C.pink)}
    {sp(5, 5, 2.300, C.sky)}
    {sp(20, 19, 1.800, C.pink)}
    {sp(11, 3, 1.300, C.yellow)}
  </>),

  // ───────── Povolání ─────────
  "📦": (<>
    {p("M3.500 8 12 4l8.500 4v9L12 21l-8.500-4V8z", C.brownL)}
    {p("M3.500 8 12 12l8.500-4M12 12v9", "none")}
    {p("M8 6l8.500 4.100v3", C.yellowD)}
    {p("m16.500 10.100 0 3.400 1.800-.9V9.300z", C.white)}
    {p("M13 15.500l3-1.400v2.600l-3 1.400z", C.white)}
    {sp(20, 4, 1.800, C.yellow)}
  </>),
  "🛒": (<>
    {p("M2.500 4h3l2.400 11h10.200l2-8H6.500", "none")}
    {p("M6.500 7h14.100l-2 8H7.900L6.500 7z", C.greenL)}
    {p("M10 7l.7 8M14 7v8M17 7l-.4 8", "none")}
    <circle cx="9.500" cy="19" r="1.600" fill={C.dark} />
    <circle cx="17" cy="19" r="1.600" fill={C.dark} />
    <circle cx="9.500" cy="4.800" r="2.200" fill={C.red} />
    {p("M9.500 2.600c.2-.7.6-1 1.100-1.100", C.green)}
    <rect x="13" y="2.800" width="3.200" height="4.200" rx=".9" fill={C.yellow} />
    <rect x="16.800" y="3.500" width="2.200" height="3.500" rx=".7" fill={C.green} />
  </>),
  "🌾": (<>
    {p("M12 21V8", "none")}
    {p("M12 8c-2-.5-2.800-2.500-2.500-4.500 2 .5 2.800 2.500 2.500 4.500zM12 8c2-.5 2.800-2.500 2.500-4.500-2 .5-2.800 2.500-2.500 4.500z", C.gold)}
    {p("M12 14c-2.500-.4-3.600-2.500-3.200-5 2.500.4 3.600 2.500 3.200 5zM12 14c2.500-.4 3.600-2.500 3.200-5-2.500.4-3.600 2.500-3.200 5z", C.yellow)}
    {p("M12 19.500c-2.500-.4-3.800-2.200-3.600-4.500 2.500.4 3.800 2.200 3.600 4.500zM12 19.500c2.500-.4 3.800-2.200 3.600-4.500-2.500.4-3.800 2.200-3.600 4.500z", C.gold)}
  </>),
  "🍳": (<>
    {p("M2.500 12.500a7.500 7.500 0 1 0 15 0c0-1-.5-1.500-1.500-1.500H4c-1 0-1.500.5-1.500 1.500z", C.dark)}
    {p("M17 12.500 22 9.500", "none")}
    <ellipse cx="10" cy="12.500" rx="5.500" ry="1.700" fill={C.white} />
    <circle cx="10" cy="12.300" r="2" fill={C.yellow} />
    {p("M7 7.500c-.8-1 .8-1.800 0-2.800M11 7.500c-.8-1 .8-1.800 0-2.800", "none")}
    {sh("M9 11.500l1 0")}
  </>),
  "🚒": (<>
    {p("M3.500 5.500h8.500M5 5.500v3M7.500 5.500v3M10 5.500v3M12 5.500v3", "none")}
    {p("M3 5.500h9v2H3z", C.gray)}
    {p("M2.500 8.500h10.500V17H2.500z", C.red)}
    {p("M13 10.500h4.500l3.500 3.800V17H13z", C.red)}
    {p("M14.500 11.800h2.600l2 2.300h-4.600z", C.blueL)}
    {p("M2.500 12.800H13", C.white)}
    {p("M14 9h2", C.blue)}
    <circle cx="7" cy="17.500" r="2.200" fill={C.dark} />
    <circle cx="17" cy="17.500" r="2.200" fill={C.dark} />
    <circle cx="7" cy="17.500" r=".8" fill={C.gray} stroke="none" />
    <circle cx="17" cy="17.500" r=".8" fill={C.gray} stroke="none" />
  </>),
  "👮": (<>
    {p("M5 20c0-4 3-6 7-6s7 2 7 6H5z", C.blueD)}
    {p("M9 14.200 12 17l3-2.800", C.white)}
    <circle cx="12" cy="10" r="3.500" fill={C.skin} />
    {p("M7.800 8.800C8 6 9.800 4.500 12 4.500s4 1.500 4.200 4.300H7.800z", C.dark)}
    {p("M6.500 8.800h11", C.dark)}
    <circle cx="12" cy="7" r="1" fill={C.yellow} stroke="none" />
  </>),
  "📚": (<>
    {p("M4 5.500A1.500 1.500 0 0 1 5.500 4h2A1.500 1.500 0 0 1 9 5.500V20H5.500A1.500 1.500 0 0 1 4 18.500v-13z", C.red)}
    {p("M9 6.500A1.500 1.500 0 0 1 10.500 5h2A1.500 1.500 0 0 1 14 6.500V20H9V6.500z", C.blue)}
    {p("m14.500 8 2-1 3.500 12-2 .8-3.500-11.800z", C.green)}
    {p("M4 9h5M9 10h5", "none")}
    {p("M6.500 4v5l1-.8 1 .8V4z", C.yellow)}
    {p("M10.500 12h2.500M10.500 14h2.500", C.white)}
  </>),
  "📰": (<>
    {p("M4 5h13v14.500H5.500A1.500 1.500 0 0 1 4 18V5z", C.white)}
    {p("M17 9h3v9a1.500 1.500 0 0 1-3 1.500", C.gray)}
    {p("M6.500 7.500h5v3h-5z", C.grayM)}
    {p("M13 7.500h2.500M13 10h2.500M6.500 13h9M6.500 15.500h9M6.500 18h6", "none")}
  </>),
  "🐾": (<>
    <ellipse cx="12" cy="16" rx="4.500" ry="3.800" fill={C.brownL} />
    <ellipse cx="5.800" cy="11" rx="1.700" ry="2.300" fill={C.brownL} transform="rotate(-20 5.800 11)" />
    <ellipse cx="9.500" cy="6.800" rx="1.700" ry="2.400" fill={C.brownL} transform="rotate(-8 9.500 6.800)" />
    <ellipse cx="14.500" cy="6.800" rx="1.700" ry="2.400" fill={C.brownL} transform="rotate(8 14.500 6.800)" />
    <ellipse cx="18.200" cy="11" rx="1.700" ry="2.300" fill={C.brownL} transform="rotate(20 18.200 11)" />
  </>),
  "📐": (<>
    {p("M4 20V4l16 16H4z", C.yellow)}
    {p("M4 14h2.500M4 10.500h1.500M4 17.500h1.500M8 20v-2.500M11.500 20v-1.500M15 20v-2.500", "none")}
    {p("M9 12.500v1.800h1.800", "none")}
  </>),
  "💻": (<>
    {p("M5.500 5h13a1 1 0 0 1 1 1v9.500h-15V6a1 1 0 0 1 1-1z", C.dark)}
    {p("M6.500 6.500h11v7.500h-11z", C.sky)}
    {p("m9 9.300-1.300 1.200L9 11.800M15 9.300l1.300 1.200L15 11.800M12.900 8.800l-1.800 3.400", C.white)}
    {p("M2.500 15.500h19l-1.400 3a1 1 0 0 1-.9.600H4.800a1 1 0 0 1-.9-.6l-1.400-3z", C.gray)}
  </>),
  "✈": (<>
    {p("M21 4c-1-1-2.500-.5-3.500.5L14 8 5 6l-1.500 1.500 7.500 4.500-3.500 3.500-3-.5L3 16.500l3.500 1 1 3.500 1.500-1.500-.5-3 3.500-3.500 4.500 7.500 1.500-1.500-2-9 3.500-3.500c1-1 1.500-2.500.5-3.500z", C.blueL)}
    {p("m14 8 4 2.500", "none")}
  </>),
  "🏦": (<>
    {p("M12 2.500 3 8v1.500h18V8l-9-5.500z", C.gray)}
    <circle cx="12" cy="6.500" r="1.300" fill={C.yellow} />
    {p("M5.500 10.500v7M9.500 10.500v7M14.500 10.500v7M18.500 10.500v7", "none")}
    {p("M5 10.500h1v7H5zM9 10.500h1v7H9zM14 10.500h1v7h-1zM18 10.500h1v7h-1z", C.white)}
    {p("M3.500 17.500h17v2h-17zM2.500 19.500h19V21h-19z", C.grayM)}
  </>),

  // ───────── Firmy ─────────
  "👟": (<>
    {p("M2.500 15.500c0-3 .5-5 1.500-7l2.500 1.500c.8 1.500 2 2.200 3.500 2.200L14 11c1 2 3 3 5.500 3.500 1.600.4 2.500 1.200 2.500 2.500v1.500H2.500v-3z", C.orange)}
    {p("M2.500 17.500h19.500v2.200H2.500z", C.white)}
    {p("M10 11.700l1-2M12.500 12l1-2", "none")}
    {p("M4 10.500c-.6 1.500-.8 3-.8 4.700", "none")}
    {p("m8 13.500.5 1 1 .1-.8.7.2 1-.9-.5-.9.5.2-1-.8-.7 1-.1z", C.white)}
    {p("M9.800 10.300l1.600 1M12 9.600l1.600 1M14 9l1.700 1.100", C.white)}
    {sh("M4.500 11.500v3")}
  </>),
  "📱": (<>
    {p("M8 2.500h8a1.500 1.500 0 0 1 1.500 1.500v16a1.500 1.500 0 0 1-1.500 1.500H8A1.500 1.500 0 0 1 6.500 20V4A1.500 1.500 0 0 1 8 2.500z", C.dark)}
    {p("M8 5h8v12.500H8z", C.sky)}
    {p("M8 5h8l-8 6.500V5z", C.blueL)}
    <circle cx="12" cy="19.500" r=".8" fill={C.gray} stroke="none" />
    {p("M10.500 3.700h3", C.grayM)}
    <rect x="8.500" y="6" width="2.200" height="2.200" rx=".6" fill={C.red} />
    <rect x="11" y="6" width="2.200" height="2.200" rx=".6" fill={C.yellow} />
    <rect x="13.500" y="6" width="2.200" height="2.200" rx=".6" fill={C.green} />
    <rect x="8.500" y="9" width="2.200" height="2.200" rx=".6" fill={C.purple} />
    <rect x="11" y="9" width="2.200" height="2.200" rx=".6" fill={C.orange} />
    <rect x="13.500" y="9" width="2.200" height="2.200" rx=".6" fill={C.pink} />
    <rect x="8.500" y="12" width="7.200" height="3.500" rx=".8" fill={C.white} opacity=".85" />
  </>),
  "🛵": (<>
    {p("M15.500 15 14 7.500h-2M14 7.500h4", "none")}
    {p("M3.500 14.500c-.3-2.800 1.200-4.500 4-4.500H12c1 0 1.600.6 1.800 1.600l.7 3.400H3.500z", C.green)}
    {p("M6.500 8.500h5.500a1 1 0 0 1 1 1V10H6.500z", C.dark)}
    {p("M14.500 15.500c.6-.2 1.500-.2 2.300 0", "none")}
    <circle cx="6" cy="17.500" r="2.500" fill={C.dark} />
    <circle cx="17.500" cy="17.500" r="2.500" fill={C.dark} />
    <circle cx="6" cy="17.500" r=".9" fill={C.gray} stroke="none" />
    <circle cx="17.500" cy="17.500" r=".9" fill={C.gray} stroke="none" />
    <circle cx="14" cy="9.500" r=".9" fill={C.yellow} stroke="none" />
    {p("M2.500 5.500h5.500V10H2.500z", C.red)}
    {p("M2.500 7.700H8", C.white)}
    {sp(20, 8, 1.800, C.yellow)}
  </>),
  "🏬": (<>
    {p("M5 8.500h14V20H5z", C.blueL)}
    {p("M3.500 8.500 5 4h14l1.500 4.500h-17z", C.red)}
    {p("M3.500 8.500a2.800 2.800 0 0 0 5.600 0 2.800 2.800 0 0 0 5.800 0 2.800 2.800 0 0 0 5.600 0", C.white)}
    {p("M9.500 20v-5.500h5V20", C.brownL)}
    {p("M6.500 12h2M15.500 12h2", "none")}
    <rect x="8" y="1.800" width="8" height="2.300" rx=".7" fill={C.yellow} />
    {p("M9.500 3h5", C.brownD)}
  </>),
  "🎮": (<>
    {p("M7 7.500h10c3 0 4.500 3 5 6.500.3 2.500-1 4-2.800 3.500-1.200-.4-2-1.500-3-2.500H7.800c-1 1-1.800 2.100-3 2.500C3 18 1.700 16.500 2 14c.5-3.500 2-6.500 5-6.500z", C.purple)}
    {p("M7 10.500v3M5.500 12h3", C.white)}
    <circle cx="15.500" cy="11" r="1" fill={C.yellow} stroke="none" />
    <circle cx="17.800" cy="13" r="1" fill={C.red} stroke="none" />
    <circle cx="13.500" cy="13" r="1" fill={C.green} stroke="none" />
  </>),
  "🧩": (<>
    {p("M4 9.500h4.200a2.300 2.300 0 1 1 4.600 0H17v4.200a2.300 2.300 0 1 1 0 4.600V20H4v-4.300a2.300 2.300 0 1 0 0-4.600V9.500z", C.teal)}
    {p("M17 9.500h3.500V13H17", C.greenL)}
    {p("M6.500 13.500v-1.500M8 18h4", C.white)}
  </>),
  "🖥": (<>
    {p("M3.500 4h17a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z", C.gray)}
    {p("M4.800 5.300h14.400v7.700H4.800z", C.dark)}
    {p("M6.500 8l2 1.500-2 1.500M10.500 11h3.500", C.greenL)}
    {p("M9.500 16 9 20h6l-.5-4M7.500 20h9", C.grayM)}
  </>),
  "🏭": (<>
    {p("M3 20.500V10l5.500 3.500V10l5.500 3.500V10l5.500 3.500V4.500h2v16H3z", C.grayM)}
    {p("M17.500 4.500h4v16h-4z", C.grayD)}
    {p("M17.500 4.500c.5-1.500 3.500-1.500 4 0", C.gray)}
    {p("M5 16h2M10.500 16h2M16 16h1", C.yellow)}
    <circle cx="19.500" cy="2.500" r="1" fill={C.gray} stroke="none" />
    <circle cx="21" cy="1.400" r=".9" fill={C.white} stroke="none" opacity=".85" />
    <circle cx="19" cy="2.200" r="1.100" fill={C.white} stroke="none" opacity=".9" />
  </>),
  "🥖": (<>
    {p("M19.800 4.200c1.600 1.600.5 4.500-2 7L9 20c-1.500 1.500-3.800 1.800-5 .6-1.300-1.200-.9-3.500.6-5l8.700-8.700c2.500-2.500 5.900-4.100 7.500-2.700z", C.brownL)}
    {p("m8 12.500 3 3M11.500 8.500l3.500 3.500M14.500 5.800l3 3", C.brownD)}
  </>),
  "🚿": (<>
    {p("M4.500 21V6.500a3 3 0 0 1 3-3H12", "none")}
    {p("M9.500 4.500h10l-2.200 4h-5.600z", C.gray)}
    {p("M10.500 7h7", C.grayM)}
    {p("M12.500 11v2.500M15 11v3.500M17.500 11v2.500M13.700 16.500V19M16.300 17v2.500", C.sky)}
    <circle cx="4.500" cy="10" r="1.100" fill={C.yellow} />
  </>),
  "🛍": (<>
    {p("M5 8h14l1.200 12.200a1 1 0 0 1-1 1.100H4.800a1 1 0 0 1-1-1.100L5 8z", C.purple)}
    {p("M8.500 10V6.500a3.500 3.500 0 0 1 7 0V10", "none")}
    {p("M5 8h14l.3 3H4.700L5 8z", C.purpleD)}
    <circle cx="8.500" cy="10" r=".8" fill={C.white} stroke="none" />
    <circle cx="15.500" cy="10" r=".8" fill={C.white} stroke="none" />
    {p("m10.500 15.500 1.300 1.300L14 14.300", C.white)}
  </>),
  "🖨": (<>
    {p("M7 3.500h8l2 2V9H7V3.500z", C.white)}
    {p("M4.500 9h15a1.500 1.500 0 0 1 1.500 1.500v6A1.500 1.500 0 0 1 19.500 18H4.500A1.500 1.500 0 0 1 3 16.500v-6A1.500 1.500 0 0 1 4.500 9z", C.grayM)}
    {p("M7 14.500h10V21H7z", C.white)}
    {p("M9 17h6M9 19h4", "none")}
    <circle cx="18" cy="11.800" r=".8" fill={C.green} stroke="none" />
  </>),
  "📺": (<>
    {p("m8 3.500 4 3.500 4-3.500", "none")}
    {p("M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z", C.dark)}
    {p("M5.500 8.700h9.500v8.600H5.500z", C.sky)}
    {p("M5.500 8.700H15l-9.500 8.600V8.700z", C.blueL)}
    <circle cx="18" cy="10.500" r=".8" fill={C.red} stroke="none" />
    <circle cx="18" cy="13.500" r=".8" fill={C.yellow} stroke="none" />
  </>),

  // ───────── Podnikání (hustle) ─────────
  "🔁": (<>
    {p("M4 11V9.500A3.500 3.500 0 0 1 7.500 6H18", "none")}
    {p("m15.500 3.500 3 2.500-3 2.500", C.green)}
    {p("M20 13v1.500a3.500 3.500 0 0 1-3.500 3.500H6", "none")}
    {p("m8.500 15.500-3 2.500 3 2.500", C.blue)}
  </>),
  "🚗": (<>
    {p("M2.500 15.500v-3c0-1 .5-1.700 1.500-1.900L6.500 10l2-3.200a1.500 1.500 0 0 1 1.300-.8h4.400a1.500 1.500 0 0 1 1.300.8l2 3.200 2.500.6c1 .2 1.500.9 1.500 1.900v3H2.500z", C.red)}
    {p("m8.500 10 1.500-2.500h4l1.500 2.500H8.500z", C.blueL)}
    <circle cx="7" cy="16" r="2.300" fill={C.dark} />
    <circle cx="17" cy="16" r="2.300" fill={C.dark} />
    <circle cx="7" cy="16" r=".8" fill={C.gray} stroke="none" />
    <circle cx="17" cy="16" r=".8" fill={C.gray} stroke="none" />
    <circle cx="4.500" cy="12.800" r=".8" fill={C.yellow} stroke="none" />
    <rect x="9.500" y="13.400" width="5" height="1.600" rx=".4" fill={C.white} />
    {sh("M6 11.500l1.800-2.800")}
    {p("M19.500 12.800l1.500.4", C.yellow)}
  </>),
  "🏚": (<>
    {p("M5 11.500V20h14v-8.500", C.brownL)}
    {p("M3.500 12 12 4.500l8.500 7.500", "none")}
    {p("M3.500 12 12 4.500l4 3.500-3 2-2.500-1.500-2.500 2.500-3-.5-1.500-.5z", C.brownD)}
    {p("M10.500 20v-4.500h3.500V20", C.dark)}
    {p("M7 14.500l2 1.500M16 14l-1.500 1.800", "none")}
    {p("M5 11.500 7 14.500", "none")}
  </>),
  "🍋": (<>
    {p("M3.500 12c0-4.500 4-8 9-8 2.500 0 4.300.8 6 .5-.5 1.500.2 3.200.2 5 0 4.500-3.500 9-9 9-3 0-6.200-2-6.200-6.500z", C.yellow)}
    {p("M18.700 4.500c1-.5 2-.2 2.500.5", C.green)}
    {p("M8 8.500c1-.8 2-1.200 3-1.200", C.white)}
    {sh("M7 12c0-2 1.200-3.500 3-4")}
    <circle cx="12" cy="14" r=".5" fill={C.yellowD} stroke="none" />
    <circle cx="15" cy="12" r=".5" fill={C.yellowD} stroke="none" />
    <circle cx="10" cy="16" r=".5" fill={C.yellowD} stroke="none" />
  </>),

  // ───────── Peníze a přehledy ─────────
  "💰": (<>
    {p("M9 3.500h6l-1.500 3h-3L9 3.500z", C.brownL)}
    {p("M10 6.500C6 8.500 4 12 4 15.500c0 3 2.200 5 8 5s8-2 8-5c0-3.500-2-7-6-9h-4z", C.gold)}
    {p("M9.500 6.500h5", "none")}
    {p("M12 10.500v8.200M14 12.200c-.5-.8-1.200-1-2-1-1.200 0-2 .6-2 1.500s.8 1.200 2 1.500 2 .7 2 1.600-.8 1.500-2 1.500c-.9 0-1.600-.3-2.100-1.100", C.brownD)}
    {sh("M6.500 14.500c0-1.800.8-3.200 2-4.200")}
    {sp(19, 6, 2.300, C.yellow)}
  </>),
  "💵": (<>
    {p("M2.500 6.500h19v11h-19z", C.greenL)}
    {p("M5 9v6M19 9v6", C.greenD)}
    <circle cx="12" cy="12" r="3.200" fill={C.green} />
    {p("M12 10v4M13.200 10.800c-.3-.4-.7-.6-1.200-.6-.7 0-1.200.4-1.200 1s.5.7 1.200.9 1.200.4 1.200 1-.5 1-1.200 1c-.5 0-.9-.2-1.200-.6", C.white)}
  </>),
  "🏆": (<>
    {p("M7 3.500h10v5.500a5 5 0 0 1-10 0V3.500z", C.gold)}
    {p("M7 5.500H4.500c0 3 1.200 4.500 3 4.800M17 5.500h2.500c0 3-1.200 4.500-3 4.800", "none")}
    {p("M12 14v3.500", "none")}
    {p("M8.500 20.500v-1.500a1.500 1.500 0 0 1 1.500-1.500h4a1.500 1.500 0 0 1 1.500 1.500v1.500h-7z", C.brownD)}
    {p("M9.500 5.500v3.500", C.yellow)}
    {p("m12 6.500.8 1.700 1.800.2-1.300 1.200.4 1.800-1.700-.9-1.700.9.4-1.800-1.300-1.200 1.800-.2z", C.white)}
    {p("M10 17.500h4", "none")}
  </>),
  "⭐": (<>
    {p("m12 2.800 2.700 5.600 6.100.8-4.500 4.300 1.100 6.100-5.400-2.900-5.400 2.900 1.100-6.100L3.200 9.200l6.100-.8L12 2.800z", C.yellow)}
    {p("m12 5.800 1.400 3-1.400.3", C.white)}
    {sp(20, 4, 1.800, C.pink)}
    {sp(4, 18, 1.500, C.sky)}
  </>),
  "⏩": (<>
    {p("M3.500 6v12l8-6-8-6z", C.blue)}
    {p("M12.500 6v12l8-6-8-6z", C.sky)}
  </>),
  "⏱": (<>
    {p("M9.500 2.500h5M12 2.500V5", "none")}
    <circle cx="12" cy="13.500" r="7.500" fill={C.white} />
    {p("M12 13.500V9M12 13.500l3 2", "none")}
    {p("M18 6l1.500-1.500", "none")}
    {p("M12 13.500 12 6a7.500 7.500 0 0 1 6.500 3.800z", C.blueL)}
  </>),
  "💼": (<>
    {p("M9 7V5.500A1.500 1.500 0 0 1 10.500 4h3A1.500 1.500 0 0 1 15 5.500V7", "none")}
    {p("M4 7h16a1.500 1.500 0 0 1 1.500 1.500V18a1.500 1.500 0 0 1-1.500 1.500H4A1.500 1.500 0 0 1 2.500 18V8.500A1.500 1.500 0 0 1 4 7z", C.brown)}
    {p("M2.500 12.500h19", C.brownD)}
    <rect x="10.500" y="11" width="3" height="3" rx=".6" fill={C.yellow} />
  </>),
  "🧾": (<>
    {p("M5.500 2.500h13V21l-2.200-1.500L14 21l-2-1.500L10 21l-2.300-1.500L5.500 21V2.500z", C.white)}
    {p("M8.500 7h7M8.500 10h7M8.500 13h4", "none")}
    {p("M13.500 15.800h2.500", C.red)}
  </>),
  "📅": (<>
    {p("M4.500 5h15a1 1 0 0 1 1 1v13.500a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", C.white)}
    {p("M3.500 6a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v3.500h-17V6z", C.red)}
    {p("M8 3v3.500M16 3v3.500", "none")}
    {p("M7 12.500h2M11 12.500h2M15 12.500h2M7 16h2M11 16h2", C.grayD)}
    <rect x="15" y="14.800" width="2.200" height="2.400" rx=".5" fill={C.blue} stroke="none" />
  </>),
  "🍞": (<>
    {p("M5 9.500C3 9 2.500 6 4.500 4.500 6 3.400 8 3.500 12 3.500s6 -.1 7.500 1c2 1.500 1.500 4.500-.5 5V19a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 19V9.500z", C.brownL)}
    {p("M5 9.500h14", C.brownD)}
    {p("M8.500 13.500h7M8.500 16.500h5", C.yellow)}
  </>),
  "🔄": (<>
    {p("M20 11.500a8 8 0 0 0-14-4.800L4 9", "none")}
    {p("M4 4.500V9h4.500", C.blue)}
    {p("M4 12.500a8 8 0 0 0 14 4.800L20 15", "none")}
    {p("M20 19.500V15h-4.500", C.green)}
  </>),
  "✖": (<>
    {p("M6 6l12 12M18 6 6 18", "none")}
    <path d="M6 6l12 12M18 6 6 18" fill="none" stroke={C.red} strokeWidth="3" />
  </>),
  "🧺": (<>
    {p("M3.500 10h17l-1.800 9.200a1.500 1.500 0 0 1-1.500 1.300H6.800a1.500 1.500 0 0 1-1.500-1.300L3.500 10z", C.brownL)}
    {p("M7 10 12 4l5 6", "none")}
    {p("M7.500 13v5M12 13v5M16.500 13v5M4.500 14.500h15M5.500 18h13", C.brownD)}
  </>),
  "🎯": (<>
    <circle cx="12" cy="12" r="9" fill={C.white} />
    <circle cx="12" cy="12" r="6.300" fill={C.red} />
    <circle cx="12" cy="12" r="3.700" fill={C.white} />
    <circle cx="12" cy="12" r="1.600" fill={C.red} />
    {p("m12 12 7-7M16.500 3.500v3h3M17.500 6.500 20 4", "none")}
  </>),
  "🎓": (<>
    {p("M12 4 1.500 9 12 14l10.500-5L12 4z", C.dark)}
    {p("M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500l-6 2.800-6-2.800z", C.grayD)}
    {p("M21 9.500v6", "none")}
    <circle cx="21" cy="16.500" r="1.100" fill={C.yellow} />
  </>),
  "💱": (<>
    <circle cx="8" cy="8" r="5.500" fill={C.gold} />
    <circle cx="16" cy="16" r="5.500" fill={C.gray} />
    {p("M8 5.500v5M9.600 6.500c-.4-.5-1-.7-1.600-.7-.9 0-1.600.5-1.600 1.200s.7.9 1.600 1.100 1.600.5 1.600 1.200-.7 1.200-1.600 1.200c-.7 0-1.300-.3-1.600-.8", C.brownD)}
    {p("m14.500 14.500 3 3M17.500 14.500l-3 3", C.dark)}
  </>),
  "🧱": (<>
    {p("M2.500 6h19v12h-19z", C.red)}
    {p("M2.500 10h19M2.500 14h19M8.800 6v4M15.200 6v4M5.600 10v4M12 10v4M18.400 10v4M8.800 14v4M15.200 14v4", C.redD)}
  </>),
  "🤒": (<>
    <circle cx="12" cy="12" r="9" fill={C.yellow} />
    {p("M7.500 9.500 10 10.300M16.500 9.500 14 10.300", "none")}
    <circle cx="8.800" cy="12.300" r=".9" fill={C.dark} stroke="none" />
    <circle cx="15.200" cy="12.300" r=".9" fill={C.dark} stroke="none" />
    {p("M9 17c1-.9 2-1.200 3.200-1.200", "none")}
    <path d="M12.500 16.300l7 3.700" stroke="currentColor" strokeWidth="3.600" />
    <path d="M12.500 16.300l7 3.700" stroke={C.white} strokeWidth="1.700" />
    <circle cx="12.500" cy="16.300" r="1.500" fill={C.red} />
  </>),
  "🏖": (<>
    {p("M2.500 20.500c3-2 6-2 9.500-.5 3.500 1.500 6.500 1.500 9.500-.5V18H2.500v2.500z", C.yellow)}
    {p("M12 19V9", "none")}
    {p("M3.500 10.500C4.500 5.500 9 3.500 12 5.500 15 3.500 19.500 5.500 20.500 10.500c-2.500-2.500-5.500-2.500-8.500-1-3-1.500-6-1.500-8.500 1z", C.red)}
    {p("M12 5.500v4", C.white)}
    <circle cx="19" cy="4" r="1.500" fill={C.yellow} stroke="none" />
  </>),
  "📉": (<>
    {p("M3.500 3.500V20.500h17", "none")}
    {p("M6 7l4.500 4.500 3-2.500L19 15", "none")}
    <path d="M6 7l4.500 4.500 3-2.500L19 15" fill="none" stroke={C.red} strokeWidth="2" />
    {p("M19 10.500V15h-4.500", C.red)}
  </>),
  "📈": (<>
    {p("M3.500 3.500V20.500h17", "none")}
    <path d="M6 15l4.500-4.500 3 2.500L19 7" fill="none" stroke={C.green} strokeWidth="2" />
    {p("M19 11.500V7h-4.500", C.green)}
  </>),
  "⚠": (<>
    {p("M12 3.500 22 20.500H2L12 3.500z", C.yellow)}
    {p("M12 10v5", "none")}
    <circle cx="12" cy="17.800" r=".9" fill={C.dark} stroke="none" />
  </>),
  "🔒": (<>
    {p("M8 10.500V7.500a4 4 0 0 1 8 0v3", "none")}
    {p("M6 10.500h12a1.500 1.500 0 0 1 1.500 1.500v7a1.500 1.500 0 0 1-1.500 1.500H6A1.500 1.500 0 0 1 4.500 19v-7A1.500 1.500 0 0 1 6 10.500z", C.gold)}
    <circle cx="12" cy="15" r="1.400" fill={C.brownD} />
    {p("M12 15.500v2.200", C.brownD)}
  </>),
  "✨": (<>
    {p("M10 3.500 12 9.500l6 2-6 2-2 6-2-6-6-2 6-2 2-6z", C.yellow)}
    {p("M19 3l.8 2.200L22 6l-2.200.8L19 9l-.8-2.200L16 6l2.200-.8L19 3z", C.pink)}
    {p("M18.500 16l.6 1.700 1.700.6-1.700.6-.6 1.700-.6-1.700-1.700-.6 1.700-.6.6-1.700z", C.sky)}
  </>),
  "🔥": (<>
    {p("M12 2.500c.5 3-1.500 4.500-3 6.500-1.300 1.700-2.500 3.500-2.500 6A5.500 5.500 0 0 0 12 21a5.500 5.500 0 0 0 5.500-6c0-2-1-3.500-2-4.500-.2 1.200-.8 2-1.700 2.500.5-3-.2-6.500-1.800-10.500z", C.orange)}
    {p("M12 12.500c.2 1.500-1.700 2.500-1.700 4.500a1.700 1.700 0 0 0 3.400 0c0-1.200-.8-2-1.200-3-.2-.5-.4-1-.5-1.500z", C.yellow)}
  </>),
  "🗞": (<>
    {p("M7 3.500h13v14.500a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.500h4V3.500z", C.white)}
    {p("M7 3.500v14.500a2 2 0 0 1-4 0V8.500h4", C.gray)}
    {p("M10 7h7.500v3H10zM10 12.500h7.500M10 15.500h5", "none")}
    {p("M10.300 7.300h7v2.400h-7z", C.blueL)}
  </>),
  "⚖": (<>
    {p("M12 3.500v16M7.500 20.500h9", "none")}
    <circle cx="12" cy="3.800" r="1.300" fill={C.gold} />
    {p("M4 7.500h16", "none")}
    {p("M4 7.500 1.800 14h4.400L4 7.500zM20 7.500 17.800 14h4.400L20 7.500z", "none")}
    {p("M1.800 14h4.400a2.200 2.200 0 0 1-4.400 0zM17.800 14h4.400a2.200 2.200 0 0 1-4.400 0z", C.gold)}
  </>),
  "🪙": (<>
    <circle cx="12" cy="12" r="9" fill={C.gold} />
    <circle cx="12" cy="12" r="6.300" fill={C.yellow} />
    {p("M12 7.500v9M14.500 9.500c-.5-.9-1.400-1.300-2.500-1.300-1.500 0-2.500.8-2.500 1.900s1 1.500 2.500 1.900 2.500.8 2.500 1.900-1 1.900-2.500 1.900c-1.200 0-2.100-.5-2.600-1.400", C.brownD)}
  </>),
  "🥇": (<>
    {p("M7.500 2.500h3.500l1 5H8.500l-1-5zM13 2.500h3.500L14 7.500h-2.500l1.500-5z", C.blue)}
    <circle cx="12" cy="14.500" r="6.500" fill={C.gold} />
    <circle cx="12" cy="14.500" r="4.500" fill={C.yellow} />
    {p("M11 12.500l1.300-1v6", C.brownD)}
  </>),
  "📜": (<>
    {p("M7.500 4h11a1.500 1.500 0 0 1 1.500 1.500V17a3 3 0 0 1-3 3H6.500", C.white)}
    {p("M7.500 4a2.500 2.500 0 0 0-2.500 2.500V17a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-1.500h-4V6.500A2.500 2.500 0 0 1 9 4", C.brownL)}
    {p("M12 8h5.500M12 11h5.500M12 14h3.500", "none")}
  </>),
  "🎉": (<>
    {p("m3 21 4.500-12.500 8 8L3 21z", C.yellow)}
    {p("m5.200 15 5 5M7.500 8.500l8 8", C.gold)}
    {p("M13 5.500l.5-2M17 9.500l2-.8M16.500 4.500l1.300-1.300M10.500 4l.4 1.700", "none")}
    <circle cx="19.500" cy="14.500" r="1" fill={C.pink} stroke="none" />
    <circle cx="14.500" cy="2.800" r="1" fill={C.sky} stroke="none" />
    <circle cx="20.500" cy="5.500" r="1" fill={C.green} stroke="none" />
  </>),
  "💥": (<>
    {p("M12 2 14 7.500 19.500 5l-2 5.500L22.500 13l-5.500 1.500 2 5.500-5.500-2.500L12 22.500l-1.500-4.500L5 20.500l2-5.500L1.500 13l5.500-2.500L5 5l5.500 2.500L12 2z", C.orange)}
    {p("M12 7l1.200 3.800 3.800-.3-2.500 3 1.800 3.500-3.800-1.800L9.500 17l.5-3.500-3-2.700L11 10 12 7z", C.yellow)}
  </>),
  "✅": (<>
    <circle cx="12" cy="12" r="9.500" fill={C.green} />
    {p("m7 12.500 3.500 3.500L17.500 9", "none")}
    <path d="m7 12.500 3.500 3.500L17.500 9" fill="none" stroke={C.white} strokeWidth="2.400" />
  </>),
  "🏗": (<>
    {p("M5 21V5.500h2.500V21z", C.yellow)}
    {p("M5 8.500l2.500 2.500M7.500 8.500 5 11M5 13.500l2.500 2.500M7.500 13.500 5 16", "none")}
    {p("M2.500 5.500h19l-1 2H2.500z", C.red)}
    {p("M3 3.500h3.500v2H3z", C.blue)}
    {p("M2.500 7.500h3.500v2.500H2.500z", C.gray)}
    {p("M17.500 7.500v4", "none")}
    {p("M15.500 11.500h4V16h-4z", C.brownL)}
    {p("M15.500 13.700h4", C.brownD)}
    {p("M3 21h9", "none")}
  </>),
  "📣": (<>
    {p("M3.500 9.500h4L16 5v14l-8.500-4.500h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z", C.red)}
    {p("M7 14.500 8.500 20h3L10.500 15.500", C.redD)}
    {p("M16 5v14", "none")}
    {p("M19 8.500c1.500 1.500 1.500 5.500 0 7M21 6.500c2.500 2.500 2.500 8.500 0 11", "none")}
  </>),
  "🔬": (<>
    {p("m9 3.500 3 .8-2.500 6.500-3-.8L9 3.500z", C.grayM)}
    {p("m8 7.500 3 .8", "none")}
    {p("M15 11a5 5 0 1 1-6.500 7.500", "none")}
    {p("M15.500 10.500a6 6 0 0 1-4.700 8.700", "none")}
    {p("M5 20.500h12", "none")}
    {p("M6 20.500v-1.200h10v1.200", C.dark)}
    {p("M9.500 12.500c.5.200 1 .5 1.500 1", C.dark)}
    <circle cx="10.500" cy="12" r="1.600" fill={C.sky} />
  </>),
  "📝": (<>
    {p("M5 3.500h11l3 3V20.500H5z", C.white)}
    {p("M16 3.500v3h3", C.gray)}
    {p("M8 9h6M8 12h8M8 15h4", "none")}
    {p("m13.500 18.800 7-7 1.800 1.800-7 7-2.500.7.700-2.500z", C.yellow)}
    {p("m19.800 13.600 1.800 1.800", C.pink)}
  </>),
  "👥": (<>
    <circle cx="9" cy="8.500" r="3.200" fill={C.skin} />
    {p("M2.500 20c0-3.800 2.800-6 6.500-6s6.500 2.200 6.500 6h-13z", C.blue)}
    <circle cx="16.800" cy="9.500" r="2.800" fill={C.skin} />
    {p("M16.500 14.200c3.200.1 5.200 2 5.200 5.800h-4.500", C.green)}
  </>),
  "✊": (<>
    {p("M7 10.500V8a1.500 1.500 0 0 1 3 0 1.500 1.500 0 0 1 3 0 1.500 1.500 0 0 1 3 0 1.500 1.500 0 0 1 3 0v7a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.500-3.600L4 13.500a1.500 1.500 0 0 1 2.500-1.500L7 12.500", C.skin)}
    {p("M10 8v4M13 8.500v3.500M16 9v3", "none")}
  </>),
  "🤝": (<>
    {p("M2 8.500h3.500v6.500H2z", C.blue)}
    {p("M18.500 8.500H22V15h-3.500z", C.green)}
    {p("M5.500 9.500 9 7.800l3 1.700 3-1.700 3.500 1.700v4.500l-4.500 4.700a2 2 0 0 1-3 0L8 15 5.500 13.500z", C.skin)}
    {p("m9 11.200 3 3M11.500 9.800l3.500 3.500M10 17l1.800 1.500", "none")}
  </>),
  "📖": (<>
    {p("M12 6.500C10 5 6.500 4.500 3 5v13c3.500-.5 7 0 9 1.500V6.500z", C.white)}
    {p("M12 6.500c2-1.500 5.500-2 9-1.500v13c-3.500-.5-7 0-9 1.500V6.500z", C.blueL)}
    {p("M5.500 8.500c2 0 4 .3 5 .8M5.500 11.500c2 0 4 .3 5 .8M13.500 9.300c1-.5 3-.8 5-.8M13.500 12.300c1-.5 3-.8 5-.8", "none")}
  </>),
  "⚙": (<>
    {p("M10.300 2.800h3.400l.5 2.300 1.700.7 2-1.300 2.400 2.400-1.300 2 .7 1.700 2.300.5v3.400l-2.300.5-.7 1.700 1.300 2-2.400 2.400-2-1.300-1.700.7-.5 2.300h-3.400l-.5-2.300-1.700-.7-2 1.300-2.400-2.400 1.300-2-.7-1.700-2.300-.5v-3.400l2.300-.5.7-1.700-1.300-2 2.400-2.400 2 1.300 1.700-.7.5-2.300z", C.grayM)}
    <circle cx="12" cy="12" r="3.300" fill={C.white} />
  </>),

  // ───────── Typografické značky ─────────
  "✓": (<path d="m5 12.500 4.500 4.500L19 7" fill="none" stroke={C.green} strokeWidth="3" />),
  "★": (<path d="m12 2.800 2.700 5.600 6.100.8-4.500 4.300 1.100 6.100-5.400-2.900-5.400 2.900 1.100-6.100L3.200 9.200l6.100-.8L12 2.800z" fill={C.yellow} />),
  "▲": (<path d="M12 6 20 17H4L12 6z" fill="currentColor" stroke="none" />),
  "▼": (<path d="M12 18 4 7h16L12 18z" fill="currentColor" stroke="none" />),
};

/** Znak bez variačního selektoru, aby `🏠` i `🏠️` vedly ke stejné ikoně. */
const norm = (e: string) => e.replace(/️/g, "");

export function hasIcon(e: string): boolean {
  return norm(e) in ICONS;
}

// Plastický vzhled: světlý odlesk na horní/levé hraně a jemný stín dole/vpravo,
// počítané z tvaru ikony, takže funguje na všech ikonách stejně.
const GLOSS = (
  <defs>
    <filter id="eco-gloss" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation=".8" result="b" />
      <feOffset in="b" dx=".8" dy="1.1" result="hs" />
      <feComposite in="SourceAlpha" in2="hs" operator="out" result="hr" />
      <feFlood floodColor="#fff" floodOpacity=".6" result="hw" />
      <feComposite in="hw" in2="hr" operator="in" result="hl" />
      <feOffset in="b" dx="-.8" dy="-1.1" result="ss" />
      <feComposite in="SourceAlpha" in2="ss" operator="out" result="sr" />
      <feFlood floodColor="#1e1b4b" floodOpacity=".28" result="sw" />
      <feComposite in="sw" in2="sr" operator="in" result="sh" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="sh" />
        <feMergeNode in="hl" />
      </feMerge>
    </filter>
  </defs>
);

/** Jedna ikona. Neznámý znak se vykreslí jako text, takže nic nezmizí. */
export function Ico({ e, size = "1.15em", className = "" }: { e: string; size?: number | string; className?: string }) {
  const art = ICONS[norm(e)];
  if (!art) return <span aria-hidden>{e}</span>;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`eco-ico inline-block shrink-0 align-[-0.2em] ${className}`}
    >
      {GLOSS}
      <g filter="url(#eco-gloss)">{art}</g>
    </svg>
  );
}

// Pro texty z překladů: nahradí v řetězci všechny známé emoji ikonami.
const SPLIT = new RegExp(
  `(${Object.keys(ICONS)
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\uFE0F?`,
  "u",
);

export function EmojiText({ text }: { text: string }) {
  const parts = text.split(SPLIT);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Ico key={i} e={part} /> : part))}
    </>
  );
}

/** Seznam všech znaků, které mají ikonu (pro náhledy a testy). */
export const ALL: string[] = Object.keys(ICONS);
