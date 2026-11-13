import type { ReactNode } from "react";
import type { BlockType, Category } from "@/lib/scratch/engine";

// Ručně kreslené SVG ikony ve stylu webu: tmavý obrys, ploché barevné výplně. Čistě dekorativní.
const ink = "#16132b";
const paper = "#fffaf0";
const line = { stroke: ink, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

type IconProps = { size?: number; className?: string };

function Svg({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      {children}
    </svg>
  );
}

export function CategoryIcon({ category, size = 22, className }: IconProps & { category: Category }) {
  switch (category) {
    case "events":
      return (
        <Svg size={size} className={className}>
          <path d="M5 21V3" {...line} />
          <path d="M5.5 4c3-2 5 1 8 0s4-1 5.5 0v9c-1.5 1-3 0-5.5 0s-4.5-2-8 0z" {...line} fill="#ffc933" />
        </Svg>
      );
    case "motion":
      return (
        <Svg size={size} className={className}>
          <path d="M3 13c3-5 6-1 9-5l-2-2.5M12 8l3 .5-.5 3" {...line} />
          <path d="M5 18h13" {...line} strokeDasharray="2 3" />
          <path d="M18 14l3 4-3 1" {...line} fill="#8fd0ff" />
        </Svg>
      );
    case "pen":
      return (
        <Svg size={size} className={className}>
          <path d="M4 20l1-4.5L16 4.5a2 2 0 013 3L8 18.5z" {...line} fill="#7ee0b0" />
          <path d="M14 6.5l3 3" {...line} />
          <path d="M3 21.5c3 0 5-1 9-.5" {...line} />
        </Svg>
      );
    case "control":
      return (
        <Svg size={size} className={className}>
          <path d="M19 9a7.5 7.5 0 00-13-3" {...line} />
          <path d="M5.5 3.5v3h3" {...line} />
          <path d="M5 15a7.5 7.5 0 0013 3" {...line} />
          <path d="M18.5 20.5v-3h-3" {...line} />
          <circle cx="12" cy="12" r="2" {...line} fill="#ff8a6b" />
        </Svg>
      );
    case "looks":
      return (
        <Svg size={size} className={className}>
          <path d="M4 5.5c0-1 .8-1.8 1.8-1.8h12.4c1 0 1.8.8 1.8 1.8v8.4c0 1-.8 1.8-1.8 1.8H11l-4 3.5v-3.5H5.8c-1 0-1.8-.8-1.8-1.8z" {...line} fill="#c9a8ff" />
          <path d="M8 9h8M8 12h5" {...line} />
        </Svg>
      );
    case "custom":
      return (
        <Svg size={size} className={className}>
          <path d="M4 9h4a2 2 0 114 0h4v4a2 2 0 110 4v3H4v-4a2 2 0 110-4z" {...line} fill="#ffb3d9" />
        </Svg>
      );
  }
}

export function FlagIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M5 21V3" {...line} />
      <path d="M5.5 4c3-2 5 1 8 0s4-1 5.5 0v9c-1.5 1-3 0-5.5 0s-4.5-2-8 0z" {...line} fill="#ffc933" />
    </Svg>
  );
}

export function PlayIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M7 4.5v15l12-7.5z" {...line} fill="#7ee0b0" />
    </Svg>
  );
}

export function StopIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <rect x="5" y="5" width="14" height="14" rx="2" {...line} fill="#ff8a6b" />
    </Svg>
  );
}

export function TrashIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13" {...line} />
      <path d="M10 10.5v6M14 10.5v6" {...line} />
    </Svg>
  );
}

// Malá kreslená ikona pro každý blok, stejný tah a barvy jako kategorie.
export function BlockIcon({ type, size = 18, className }: IconProps & { type: BlockType }) {
  const fillIcon = (d: string, fill: string) => <path d={d} {...line} fill={fill} />;
  let art: ReactNode;
  switch (type) {
    case "start":
      art = (
        <>
          <path d="M5 21V3" {...line} />
          <path d="M5.5 4c3-2 5 1 8 0s4-1 5.5 0v9c-1.5 1-3 0-5.5 0s-4.5-2-8 0z" {...line} fill="#ffc933" />
        </>
      );
      break;
    case "goto":
      art = (
        <>
          <circle cx="12" cy="12" r="7" {...line} fill="#8fd0ff" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" {...line} />
        </>
      );
      break;
    case "random":
      art = (
        <>
          <rect x="3" y="3" width="18" height="18" rx="3" {...line} fill="#ffc933" />
          <circle cx="8" cy="8" r="1.6" fill={ink} />
          <circle cx="12" cy="12" r="1.6" fill={ink} />
          <circle cx="16" cy="16" r="1.6" fill={ink} />
        </>
      );
      break;
    case "step":
      art = (
        <>
          <path d="M3 12h13" {...line} />
          <path d="M11 6l6 6-6 6" {...line} fill="#8fd0ff" />
        </>
      );
      break;
    case "glide":
      art = (
        <>
          <path d="M3 18c6 0 4-12 9-12s3 8 9 2" {...line} strokeDasharray="2 3" />
          <path d="M18 6l3 2-2 3" {...line} fill="#8fd0ff" />
        </>
      );
      break;
    case "turn-right":
      art = (
        <>
          <path d="M19 9a7.5 7.5 0 00-13-3" {...line} />
          <path d="M5.5 3.5v3h3" {...line} fill="#7ee0b0" />
        </>
      );
      break;
    case "turn-left":
      art = (
        <>
          <path d="M5 15a7.5 7.5 0 0013 3" {...line} />
          <path d="M18.5 20.5v-3h-3" {...line} fill="#7ee0b0" />
        </>
      );
      break;
    case "edge":
      art = (
        <>
          <path d="M19 3v18" {...line} />
          <path d="M5 6l6 4-6 4 6 4" {...line} fill="#ff8a6b" />
        </>
      );
      break;
    case "pen":
      art = (
        <>
          <path d="M4 20l1-4.5L16 4.5a2 2 0 013 3L8 18.5z" {...line} fill="#7ee0b0" />
          <path d="M14 6.5l3 3" {...line} />
        </>
      );
      break;
    case "pen-color":
      art = (
        <>
          <circle cx="12" cy="12" r="9" {...line} fill={paper} />
          <circle cx="8.5" cy="9" r="2" fill="#ff8a6b" />
          <circle cx="14.5" cy="8.5" r="2" fill="#ffc933" />
          <circle cx="15.5" cy="14.5" r="2" fill="#7ee0b0" />
          <circle cx="9" cy="15" r="2" fill="#8fd0ff" />
        </>
      );
      break;
    case "pen-size":
      art = (
        <>
          <path d="M4 7h16" {...line} strokeWidth={1.5} />
          <path d="M4 12h16" {...line} strokeWidth={4} />
          <path d="M4 17.5h16" {...line} strokeWidth={7} />
        </>
      );
      break;
    case "clear":
      art = (
        <>
          {fillIcon("M4 16l8-9 7 6-5 6H9z", "#ff8a6b")}
          <path d="M9 21h11" {...line} />
        </>
      );
      break;
    case "repeat":
      art = (
        <>
          <path d="M19 9a7.5 7.5 0 00-13-3" {...line} />
          <path d="M5.5 3.5v3h3" {...line} />
          <path d="M5 15a7.5 7.5 0 0013 3" {...line} />
          <path d="M18.5 20.5v-3h-3" {...line} />
          <circle cx="12" cy="12" r="2" {...line} fill="#ff8a6b" />
        </>
      );
      break;
    case "forever":
      art = <path d="M12 12c-3-4-8-4-8 0s5 4 8 0 8-4 8 0-5 4-8 0z" {...line} stroke={ink} fill="#c9a8ff" />;
      break;
    case "wait":
      art = (
        <>
          <path d="M7 3h10M7 21h10" {...line} />
          <path d="M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" {...line} />
          <path d="M9.5 17h5l-2.5-3z" fill="#ffc933" />
        </>
      );
      break;
    case "stop":
      art = <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" {...line} fill="#ff8a6b" />;
      break;
    case "say":
      art = (
        <>
          <path d="M4 5.5c0-1 .8-1.8 1.8-1.8h12.4c1 0 1.8.8 1.8 1.8v8.4c0 1-.8 1.8-1.8 1.8H11l-4 3.5v-3.5H5.8c-1 0-1.8-.8-1.8-1.8z" {...line} fill="#c9a8ff" />
        </>
      );
      break;
    case "set-var":
      art = (
        <>
          <rect x="4" y="6" width="16" height="12" rx="2" {...line} fill="#c9a8ff" />
          <path d="M8 12h8M14 9l3 3-3 3" {...line} />
        </>
      );
      break;
    case "define":
      art = <path d="M9 4c-2 0-2 2-2 4s-1 4-3 4c2 0 3 2 3 4s0 4 2 4M15 4c2 0 2 2 2 4s1 4 3 4c-2 0-3 2-3 4s0 4-2 4" {...line} />;
      break;
    case "call":
      art = (
        <>
          <path d="M3 12h9M9 8l4 4-4 4" {...line} />
          <rect x="14" y="6" width="7" height="12" rx="2" {...line} fill="#ffb3d9" />
        </>
      );
      break;
    default:
      art = null;
  }
  return (
    <Svg size={size} className={className}>
      {art}
    </Svg>
  );
}

// Posuvníky pro tlačítko „Přizpůsobit“.
export function SlidersIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1" {...line} />
      <circle cx="15" cy="6.5" r="2" {...line} fill="#ffc933" />
      <circle cx="9" cy="12" r="2" {...line} fill="#7ee0b0" />
      <circle cx="17" cy="17.5" r="2" {...line} fill="#c9a8ff" />
    </Svg>
  );
}

export function GripIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="9" cy="7" r="1.5" fill={ink} />
      <circle cx="15" cy="7" r="1.5" fill={ink} />
      <circle cx="9" cy="12" r="1.5" fill={ink} />
      <circle cx="15" cy="12" r="1.5" fill={ink} />
      <circle cx="9" cy="17" r="1.5" fill={ink} />
      <circle cx="15" cy="17" r="1.5" fill={ink} />
    </Svg>
  );
}

// Kočka na jevišti: kreslená, směřuje doprava (v SVG se natáčí podle směru).
export function CatSprite() {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="18" ry="11" fill="#ff8a6b" stroke={ink} strokeWidth="2" />
      <path d="M-14 6c-7-1-10-8-6-12" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M-14 6c-7-1-10-8-6-12" fill="none" stroke="#ff8a6b" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="14" cy="-4" r="11" fill="#ff8a6b" stroke={ink} strokeWidth="2" />
      <path d="M5 -13l3 -10 6 7z" fill="#ff8a6b" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 -21l6 6-7 1z" fill="#ff8a6b" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="17" cy="-6" r="2" fill={ink} />
      <circle cx="19" cy="-2" r="1.2" fill="#ffc933" />
      <path d="M22 -2.5l5-1M22 -0.5l5 .5" stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <path d="M-4 0v8M6 0v8" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="-2" cy="15" rx="3" ry="2" fill={paper} stroke={ink} strokeWidth="1.5" />
      <ellipse cx="8" cy="15" rx="3" ry="2" fill={paper} stroke={ink} strokeWidth="1.5" />
    </g>
  );
}
