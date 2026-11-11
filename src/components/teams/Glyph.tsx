import type { ReactNode } from "react";

// Sdílené SVG ikony týmů (nahrazují textové znaky ← → ↑ ↓ ✕ a emoji). Dědí barvu z `currentColor`.
const PATHS = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  dice: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" /><circle cx="9" cy="15" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /></>,
  grip: <><circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="6" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="18" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" /></>,
  party: <><path d="m4 20 4.5-12 7.5 7.5z" /><path d="M14 4v2M19 9h2M17.5 5.5l1.2-1.2M10 4.5h.01M20 14h.01" /></>,
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof PATHS;

export function Glyph({ name, className = "size-[1.1em]" }: { name: GlyphName; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`inline-block shrink-0 align-[-0.15em] ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
