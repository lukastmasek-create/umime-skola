import type { CSSProperties } from "react";

// Ručně kreslené SVG ikony ve stejném stylu jako ostatní ilustrace (tmavý obrys, ploché barevné výplně).
// Čistě dekorativní (aria-hidden), bez stavu, takže jdou použít na serveru i v klientských komponentách.

const ink = "#16132b";
const C = { yellow: "#ffc933", coral: "#ff8a6b", blue: "#8fd0ff", mint: "#7ee0b0", lilac: "#c9a8ff", paper: "#f7efe0" };

export type SketchIconKind =
  | "gamepad" | "people" | "trophy" | "gear" | "mail" | "shield" | "scroll" | "camera" | "info" | "star" | "pencil" | "sparkle";

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
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z" fill={C.lilac} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
  }
}
