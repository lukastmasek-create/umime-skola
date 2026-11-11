// Výzdoba panelu „Chyby se dějí každý den“: SVG ikony, odznak brouk -> fajfka, jiskry a zem s lezoucím broučkem.
// Čistě dekorativní (aria-hidden), bez stavu, takže jde použít na serveru i v klientských komponentách.

const ink = "#14132a";

export const HANG_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0", "#c9a8ff"];

// Malé ikony pro štítky a zprávy (24x24, obrys).
export function HangIcon({ kind, size = 18 }: { kind: "search" | "pulse" | "check" | "bug" | "flag" | "bolt" | "star" | "bulb"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false };
  switch (kind) {
    case "search":
      return (<svg {...common}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l6 6" /><path d="M8 10.5l2 2 3.2-3.6" strokeWidth="1.8" /></svg>);
    case "pulse":
      return (<svg {...common}><path d="M2 12h4l2.2-6 4 12 3-9 1.6 3H22" /></svg>);
    case "check":
      return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M7.6 12.4l3 3 5.8-6.4" /></svg>);
    case "bug":
      return (<svg {...common}><ellipse cx="12" cy="14" rx="5" ry="6" /><path d="M9.5 8.5a3 3 0 015 0M12 8.5V20M7 12H3M17 12h4M7.5 17.5L4.5 20M16.5 17.5l3 2.5M8 7L6 4M16 7l2-3" /></svg>);
    case "flag":
      return (<svg {...common}><path d="M6 21V4" /><path d="M6 5h11l-2.2 4L17 13H6" /></svg>);
    case "bolt":
      return (<svg {...common}><path d="M13 2L5 13.5h6L10 22l9-12h-6.2z" /></svg>);
    case "star":
      return (<svg {...common}><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z" /></svg>);
    default:
      return (<svg {...common}><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0012 3z" /></svg>);
  }
}

// Odznak s kroužkem jako u karet: brouk se zmítá, pak ho „opraví“ a objeví se fajfka.
export function HangBadge() {
  return (
    <span className="hang-badge" aria-hidden>
      <svg className="pcard-ring" viewBox="0 0 140 140" focusable="false">
        <path d="M16 72C12 34 42 10 74 11C110 12 132 40 128 74C124 108 92 131 60 127C30 123 12 100 15 68" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M22 50C34 24 68 8 104 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
      </svg>
      <svg className="hang-badge-bug" viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <g stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 18l-7-8M42 18l7-8" fill="none" />
          <path d="M14 32H5M50 32h9M17 46l-8 7M47 46l8 7" fill="none" />
          <ellipse cx="32" cy="38" rx="14" ry="17" fill="#ff6b5e" />
          <circle cx="32" cy="20" r="8" fill="#ffb199" />
          <path d="M32 24v31" fill="none" />
        </g>
        <circle cx="26" cy="35" r="3" fill={ink} /><circle cx="38" cy="35" r="3" fill={ink} />
        <circle cx="25" cy="46" r="2.4" fill={ink} /><circle cx="39" cy="46" r="2.4" fill={ink} />
        <circle cx="29" cy="19" r="1.8" fill={ink} /><circle cx="35" cy="19" r="1.8" fill={ink} />
      </svg>
      <svg className="hang-badge-ok" viewBox="0 0 64 64" width="64" height="64" focusable="false">
        <circle cx="32" cy="32" r="24" fill="#7ee0b0" stroke={ink} strokeWidth="2.6" />
        <path d="M20 33l8 8 17-18" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// Jiskry a křížky, které blikají po pozadí.
const SPARKS: { x: string; y: string; s: number; d: string; c: string }[] = [
  { x: "46%", y: "12%", s: 16, d: "0s", c: "#ffc933" },
  { x: "92%", y: "16%", s: 12, d: "-1.1s", c: "#8fd0ff" },
  { x: "6%", y: "62%", s: 12, d: "-2.2s", c: "#7ee0b0" },
  { x: "52%", y: "58%", s: 10, d: "-0.6s", c: "#ff8a6b" },
  { x: "96%", y: "56%", s: 14, d: "-1.7s", c: "#c9a8ff" },
];
export function HangSparks() {
  return (
    <>
      {SPARKS.map((p, i) => (
        <svg key={i} className="hang-spark" style={{ left: p.x, top: p.y, width: p.s, height: p.s, color: p.c, animationDelay: p.d }} viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="currentColor" />
        </svg>
      ))}
    </>
  );
}

// Zem dole na panelu (vystřižená ilustrace jako u karet) + brouček, který přes ni leze a mění se ve fajfku.
export function HangGround() {
  return (
    <>
      <svg className="pcard-scene hang-ground" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden focusable="false">
        <path d="M0 40C60 28 120 46 200 38C280 30 340 48 420 40C490 33 550 44 600 36V90H0Z" fill="#2c2a5c" stroke="rgba(244,239,227,.7)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M0 62C80 54 160 68 260 60C360 52 460 66 600 58" fill="none" stroke="rgba(244,239,227,.14)" strokeWidth="2" strokeDasharray="6 9" strokeLinecap="round" />
      </svg>
      <span className="hang-items" aria-hidden>
        {/* tužka */}
        <svg className="hang-item hang-pencil" viewBox="0 0 90 28" width="90" height="28" focusable="false">
          <g stroke={ink} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M14 3h58v22H14z" fill="#ffc933" />
            <path d="M14 3L2 14l12 11z" fill="#f3d6a6" />
            <path d="M72 3h12a4 4 0 014 4v14a4 4 0 01-4 4H72z" fill="#ff8a6b" />
            <path d="M2 14l4-3.4v6.8z" fill={ink} />
            <path d="M26 3v22M64 3v22" fill="none" opacity=".45" />
          </g>
        </svg>
        {/* poznámkový blok s fajfkami */}
        <svg className="hang-item hang-pad" viewBox="0 0 60 70" width="46" height="54" focusable="false">
          <g stroke={ink} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
            <rect x="4" y="8" width="52" height="58" rx="6" fill="#f7efe0" />
            <rect x="18" y="2" width="24" height="12" rx="4" fill="#8fd0ff" />
            <path d="M12 26l4 4 7-8M12 40l4 4 7-8" fill="none" stroke="#2a9d6a" strokeWidth="3" />
            <path d="M29 26h20M29 40h20M14 54h30" fill="none" opacity=".5" />
          </g>
        </svg>
        {/* guma */}
        <svg className="hang-item hang-eraser" viewBox="0 0 56 30" width="52" height="28" focusable="false">
          <g stroke={ink} strokeWidth="2.2" strokeLinejoin="round">
            <path d="M6 10l10-6h34v22H16L6 20z" fill="#ff9ab3" />
            <path d="M6 10l10-6v22L6 20z" fill="#f7efe0" />
          </g>
        </svg>
      </span>
      <span className="hang-crawler" aria-hidden>
        <svg className="hang-crawler-bug" viewBox="0 0 64 40" width="48" height="30" focusable="false">
          <g className="hang-legs" stroke={ink} strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M20 26l-6 9M30 28l-2 9M42 28l2 9M52 24l6 8" />
          </g>
          <g stroke={ink} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
            <ellipse cx="30" cy="20" rx="20" ry="13" fill="#ff6b5e" />
            <circle cx="52" cy="17" r="7" fill="#ffb199" />
            <path d="M30 8v24" fill="none" />
            <path d="M56 11l5-6" fill="none" />
          </g>
          <circle cx="22" cy="17" r="2.6" fill={ink} /><circle cx="38" cy="17" r="2.6" fill={ink} /><circle cx="54" cy="16" r="1.6" fill={ink} />
        </svg>
        <svg className="hang-crawler-ok" viewBox="0 0 40 40" width="30" height="30" focusable="false">
          <circle cx="20" cy="20" r="16" fill="#7ee0b0" stroke={ink} strokeWidth="2.4" />
          <path d="M12 21l6 6 11-12" fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
}
