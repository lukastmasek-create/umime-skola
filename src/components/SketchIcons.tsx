import type { CSSProperties } from "react";

// Ručně kreslené SVG ikony ve stejném stylu jako ostatní ilustrace (tmavý obrys, ploché barevné výplně).
// Čistě dekorativní (aria-hidden), bez stavu, takže jdou použít na serveru i v klientských komponentách.

const ink = "#16132b";
const C = { yellow: "#ffc933", coral: "#ff8a6b", blue: "#8fd0ff", mint: "#7ee0b0", lilac: "#c9a8ff", paper: "#f7efe0" };

export type SketchIconKind =
  | "gamepad" | "people" | "trophy" | "gear" | "mail" | "shield" | "scroll" | "camera" | "info" | "star" | "pencil" | "sparkle"
  | "town" | "courses" | "shop" | "study" | "extras" | "chevron" | "chevronUp" | "menu" | "close" | "user" | "rocket" | "home"
  | "logout" | "school" | "level" | "idcard" | "palette" | "lock" | "bolt" | "heart"
  | "code" | "chat" | "folder" | "play";

export function SketchIcon({ kind, size = 24, className, style }: { kind: SketchIconKind; size?: number; className?: string; style?: CSSProperties }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
    style,
    fill: "none",
    "aria-hidden": true,
    focusable: false as const,
  };
  const line = { stroke: ink, strokeWidth: 1.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  switch (kind) {
    case "gamepad":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M6.5 7.5h11a4.5 4.5 0 014.3 5.8l-.7 2.4a2.6 2.6 0 01-4.6.6L14.8 14H9.2l-1.7 2.3a2.6 2.6 0 01-4.6-.6l-.7-2.4A4.5 4.5 0 016.5 7.5z" fill={C.lilac} />
            <path d="M7 10.5v3M5.5 12h3" />
            <circle cx="16.2" cy="11" r=".9" fill={ink} />
            <circle cx="18.2" cy="13.2" r=".9" fill={ink} />
          </g>
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <g {...line}>
            <circle cx="9" cy="8" r="3.4" fill={C.blue} />
            <path d="M2.8 20c.4-3.6 3-5.8 6.2-5.8s5.8 2.2 6.2 5.8z" fill={C.blue} />
            <circle cx="16.4" cy="9" r="2.8" fill={C.coral} />
            <path d="M15.2 14.4c2.7-.4 5.4 1.1 6 4.6h-4.6" fill={C.coral} />
          </g>
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M7 4h10v5a5 5 0 01-10 0z" fill={C.yellow} />
            <path d="M7 6H4.5a2.5 2.5 0 000 5H7M17 6h2.5a2.5 2.5 0 010 5H17" fill="none" />
            <path d="M12 14v3.5" />
            <path d="M8 21h8l-1-3.5h-6z" fill={C.coral} />
            <path d="M10 6.5v3" fill="none" opacity=".6" />
          </g>
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <g {...line}>
            <circle cx="12" cy="12" r="8.6" fill="none" stroke={ink} strokeWidth="4.2" strokeDasharray="2.6 2.6" />
            <circle cx="12" cy="12" r="7" fill={C.mint} />
            <circle cx="12" cy="12" r="2.8" fill={C.paper} />
          </g>
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <g {...line}>
            <rect x="3" y="5.5" width="18" height="13" rx="2.5" fill={C.blue} />
            <path d="M4 7l8 6 8-6" fill="none" />
          </g>
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M12 3l7.5 2.8v5.6c0 4.4-3.1 7.8-7.5 9.6-4.4-1.8-7.5-5.2-7.5-9.6V5.8z" fill={C.mint} />
            <path d="M8.6 12.2l2.4 2.4 4.6-5" fill="none" />
          </g>
        </svg>
      );
    case "scroll":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M6 4h10.5v13.5a2.5 2.5 0 01-5 0V20H6a2 2 0 01-2-2V6a2 2 0 012-2z" fill={C.paper} />
            <path d="M9.5 8h5M9.5 11h5M9.5 14h3" fill="none" />
          </g>
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <g {...line}>
            <rect x="3" y="6.5" width="18" height="13" rx="4" fill={C.coral} />
            <circle cx="12" cy="13" r="3.6" fill={C.paper} />
            <circle cx="17.2" cy="9.3" r=".9" fill={ink} />
          </g>
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <g {...line}>
            <circle cx="12" cy="12" r="8.6" fill={C.blue} />
            <path d="M12 11v5.5" />
            <circle cx="12" cy="7.8" r=".9" fill={ink} />
          </g>
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z" fill={C.yellow} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M4 20l1.2-4.4L15.6 4.2a2 2 0 012.8 0l1.4 1.4a2 2 0 010 2.8L9.4 18.8z" fill={C.yellow} />
            <path d="M14.2 5.6l4.2 4.2" fill="none" />
            <path d="M5.2 15.6l3.2 3.2" fill="none" opacity=".5" />
          </g>
        </svg>
      );
    case "town":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M5 11l7-6.5 7 6.5v9.5H5z" fill={C.coral} />
            <path d="M9.5 20.5v-5h5v5" fill={C.paper} />
            <rect x="15.5" y="4.5" width="2.4" height="4" fill={C.paper} />
            <circle cx="12" cy="10.5" r="1.4" fill={C.yellow} />
          </g>
        </svg>
      );
    case "courses":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M12 6.5C10 5 7.4 4.6 3.5 5.2v13c3.9-.6 6.5-.2 8.5 1.3 2-1.5 4.6-1.9 8.5-1.3v-13c-3.9-.6-6.5-.2-8.5 1.3z" fill={C.blue} />
            <path d="M12 6.5v13.5" fill="none" />
            <path d="M6.5 9.5c1.6-.3 3-.1 4 .5M6.5 12.5c1.6-.3 3-.1 4 .5M13.5 10c1-.6 2.4-.8 4-.5" fill="none" opacity=".6" />
          </g>
        </svg>
      );
    case "shop":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M5 8.5h14l-1.2 11.2a1.5 1.5 0 01-1.5 1.3H7.7a1.5 1.5 0 01-1.5-1.3z" fill={C.coral} />
            <path d="M9 10.5V7a3 3 0 016 0v3.5" fill="none" />
            <circle cx="9" cy="13" r="1" fill={ink} />
            <circle cx="15" cy="13" r="1" fill={ink} />
          </g>
        </svg>
      );
    case "study":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M12 4l9 4.2-9 4.2-9-4.2z" fill={C.lilac} />
            <path d="M6.5 10.4V15c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.6" fill={C.lilac} />
            <path d="M20.5 8.2V14" fill="none" />
            <circle cx="20.5" cy="15.4" r="1.2" fill={C.yellow} />
          </g>
        </svg>
      );
    case "extras":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M5 5.5h4.2a2.1 2.1 0 114.2 0H17.6v4.2a2.1 2.1 0 110 4.2v4.6H13.4a2.1 2.1 0 10-4.2 0H5z" fill={C.yellow} />
          </g>
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="M6 9.5l6 6 6-6" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "chevronUp":
      return (
        <svg {...common}>
          <path d="M6 14.5l6-6 6 6" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4.5 7h15M4.5 12h15M4.5 17h15" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <g {...line}>
            <circle cx="12" cy="8.5" r="3.9" fill={C.yellow} />
            <path d="M4.5 20.5c.6-4 3.6-6.3 7.5-6.3s6.9 2.3 7.5 6.3z" fill={C.yellow} />
          </g>
        </svg>
      );
    case "rocket":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M14.5 3.5c3.2 0 5.7 1.2 6 6-.3 3.4-3.2 6.2-6.4 7l-3.8-3.8c.8-3.2 3.6-6.1 7.2-6.2z" fill={C.mint} />
            <path d="M9.5 9.5l-3.4.9-2.6 3 3.3.3M14.5 14.5l-.9 3.4-3 2.6-.3-3.3" fill="none" />
            <circle cx="15.2" cy="8.8" r="1.4" fill={ink} />
          </g>
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M4.5 11.2L12 4.5l7.5 6.7v8.3a.9.9 0 01-.9.9H5.4a.9.9 0 01-.9-.9z" fill={C.yellow} />
            <rect x="9.6" y="14" width="4.8" height="6.2" fill={C.paper} />
            <path d="M16.2 6.6V4.8" fill="none" />
            <path d="M2.8 11.6L12 3.4l9.2 8.2" fill="none" />
            <circle cx="12" cy="10.2" r="1.2" fill={ink} />
          </g>
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z" fill={C.lilac} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M10 4.5H5.5a1.5 1.5 0 00-1.5 1.5v12A1.5 1.5 0 005.5 19.5H10" fill={C.blue} />
            <path d="M14 8l4 4-4 4M18 12H9.5" fill="none" />
          </g>
        </svg>
      );
    case "school":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M3 9.5L12 4l9 5.5-9 5.5z" fill={C.yellow} />
            <path d="M6.5 11.8V16c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-4.2" fill={C.paper} />
            <path d="M20.5 9.5v5" fill="none" />
            <circle cx="20.5" cy="16" r="1" fill={ink} />
          </g>
        </svg>
      );
    case "level":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M3.5 20.5V16h4.5v4.5z" fill={C.blue} />
            <path d="M9.75 20.5V11.5h4.5v9z" fill={C.lilac} />
            <path d="M16 20.5V6.5h4.5v14z" fill={C.coral} />
            <path d="M3 20.5h18" fill="none" />
          </g>
        </svg>
      );
    case "idcard":
      return (
        <svg {...common}>
          <g {...line}>
            <rect x="3.5" y="5" width="17" height="14" rx="2.5" fill={C.paper} />
            <circle cx="9" cy="11" r="2.2" fill={C.mint} />
            <path d="M6.5 16.2c.6-1.3 1.4-1.9 2.5-1.9s1.9.6 2.5 1.9M14.5 10h3.5M14.5 13.5h2.5" fill="none" />
          </g>
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M12 3.5c-4.7 0-8.5 3.6-8.5 8 0 3.2 2.6 5 5 5h1.5c1 0 1.5.7 1.2 1.7-.3 1 .3 1.8 1.3 1.8 4.7 0 8-3.6 8-8.2 0-4.8-3.8-8.3-8.5-8.3z" fill={C.yellow} />
            <circle cx="7.5" cy="10.5" r="1.3" fill={C.coral} />
            <circle cx="10.5" cy="7" r="1.3" fill={C.blue} />
            <circle cx="15" cy="7.8" r="1.3" fill={C.mint} />
          </g>
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <g {...line}>
            <rect x="5" y="10.5" width="14" height="10" rx="2.2" fill={C.coral} />
            <path d="M8 10.5V8a4 4 0 018 0v2.5" fill="none" />
            <circle cx="12" cy="15.5" r="1.4" fill={ink} />
          </g>
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6z" fill={C.yellow} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0112 7.4 4.2 4.2 0 0119.5 10c0 5.5-7.5 10-7.5 10z" fill={C.coral} stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <g {...line}>
            <rect x="2.8" y="4.5" width="18.4" height="15" rx="3" fill={C.blue} />
            <path d="M10 9.5L7.2 12l2.8 2.5M14 9.5l2.8 2.5-2.8 2.5" fill="none" />
          </g>
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M4.5 5h15a1.8 1.8 0 011.8 1.8v8.4a1.8 1.8 0 01-1.8 1.8H11l-4.5 3.5V17h-2A1.8 1.8 0 012.7 15.2V6.8A1.8 1.8 0 014.5 5z" fill={C.mint} />
            <circle cx="8.2" cy="11" r=".9" fill={ink} />
            <circle cx="12" cy="11" r=".9" fill={ink} />
            <circle cx="15.8" cy="11" r=".9" fill={ink} />
          </g>
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <g {...line}>
            <path d="M3 7.2A1.7 1.7 0 014.7 5.5h4.3l2 2.3h8.3A1.7 1.7 0 0121 9.5v8.3a1.7 1.7 0 01-1.7 1.7H4.7A1.7 1.7 0 013 17.8z" fill={C.yellow} />
          </g>
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <g {...line}>
            <circle cx="12" cy="12" r="9" fill={C.coral} />
            <path d="M10 8.2l6 3.8-6 3.8z" fill={C.paper} />
          </g>
        </svg>
      );
  }
}
