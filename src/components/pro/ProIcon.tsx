import type { ReactNode } from "react";

// Jednobarevné SVG ikony UčímePRO (místo emoji). Barva se bere z `currentColor`.
const PATHS: Record<string, ReactNode> = {
  doucovatel: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V4.5M9.5 4.5h5" />
      <circle cx="9" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <path d="M9.5 16.5h5M2 12.5v3M22 12.5v3" />
    </>
  ),
  plan: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M13 14h3M8 17h3" />
    </>
  ),
  zkouska: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  fotka: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.3-2h5.4L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </>
  ),
  ustni: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
    </>
  ),
  "sesit-chyb": (
    <>
      <path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v14a1.5 1.5 0 0 1-1.5 1.5H6z" />
      <path d="M6 3.5v17M3.5 7H6M3.5 12H6M3.5 17H6M10 9.5l4 4M14 9.5l-4 4" />
    </>
  ),
  poznamky: (
    <>
      <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6" />
    </>
  ),
  vyslovnost: (
    <>
      <path d="M4 10v4h3.5L12 18V6L7.5 10z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  offline: (
    <>
      <path d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5" />
      <path d="M4.5 15v2.5A2 2 0 0 0 6.5 19.5h11a2 2 0 0 0 2-2V15" />
    </>
  ),
  rodina: (
    <>
      <circle cx="8" cy="8" r="2.6" />
      <circle cx="16.5" cy="9.5" r="2.1" />
      <path d="M3 19v-1.5A4.5 4.5 0 0 1 7.5 13h1A4.5 4.5 0 0 1 13 17.5V19M14.5 14a3.7 3.7 0 0 1 6.5 2.5V19" />
    </>
  ),
  souboj: (
    <>
      <path d="M5 4l9 9M4 5v3.5l1.5 1.5M19 4l-9 9M20 5v3.5L18.5 10" />
      <path d="M8 16l-3 3M16 16l3 3M7 14l3 3M17 14l-3 3" />
    </>
  ),
  prazdniny: (
    <>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M12 2.5v1.5M5.5 9H4M20 9h-1.5M7.4 4.4l1 1M16.6 4.4l-1 1M3 16c2 0 2.5 1.5 4.5 1.5S10 16 12 16s2.5 1.5 4.5 1.5S19 16 21 16M3 20c2 0 2.5 1.5 4.5 1.5S10 20 12 20s2.5 1.5 4.5 1.5S19 20 21 20" />
    </>
  ),
  skola: (
    <>
      <path d="M3 9.5 12 4l9 5.5M5 9.5V20h14V9.5M9.5 20v-5h5v5" />
      <path d="M12 4V2.5M12 2.5h2.5" />
    </>
  ),
  "skola-mezery": (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5M7.5 10.5h6" />
    </>
  ),
  "skola-soubeh": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  "skola-test": (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </>
  ),
  "skola-zadani": (
    <>
      <rect x="3" y="6" width="11" height="13" rx="2" />
      <rect x="10" y="4" width="11" height="13" rx="2" fill="currentColor" fillOpacity="0.15" />
      <path d="M6 10h5M6 13.5h3" />
    </>
  ),
  "skola-exit": (
    <>
      <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </>
  ),
  "skola-suplovani": (
    <>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </>
  ),
  "skola-schuzka": (
    <>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5z" />
    </>
  ),
  "skola-tempo": (
    <>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="M12 16l4-4.5" />
    </>
  ),
  "skola-obsah": (
    <>
      <path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5z" />
      <path d="M14 6.5l3 3" />
    </>
  ),
  "skola-dilna": (
    <>
      <rect x="3.5" y="4" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="12.5" width="7.5" height="7.5" rx="2" />
      <path d="M11 8h2.5a2.5 2.5 0 0 1 2.5 2.5v2" />
    </>
  ),
  "skola-podpora": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M5.6 5.6l3.2 3.2M15.2 15.2l3.2 3.2M18.4 5.6l-3.2 3.2M8.8 15.2l-3.2 3.2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

export type ProIconName = keyof typeof PATHS;

export function ProIcon({ name, className = "size-6" }: { name: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name] ?? PATHS.doucovatel}
    </svg>
  );
}
