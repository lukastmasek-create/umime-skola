"use client";

import type { Hotspot, RoomTheme } from "@/lib/escape/types";

const INK = "#16132b";
const PROP_COLORS = ["#ffe3b0", "#c8f0c0", "#bfe3ff", "#ffc2d6", "#e3d4ff", "#fff0a8"];

// Obecná scéna pro únikovky bez vlastní kresby: pozadí podle motivu místnosti a každé
// místo k prozkoumání jako barevný předmět s ikonou. Odehrané věci dostanou fajfku.
export function RoomScene({
  theme,
  hotspots,
  solved,
  used,
  danger,
  selectedItem,
  onHotspot,
}: {
  theme: RoomTheme;
  hotspots: Hotspot[];
  solved: string[];
  used: string[];
  danger: number;
  selectedItem: string | null;
  onHotspot: (hotspot: Hotspot) => void;
}) {
  return (
    <svg viewBox="0 0 800 450" className="block h-auto w-full" role="img" aria-label={theme.title}>
      <rect x="0" y="0" width="800" height="450" fill={theme.wall} />
      {[60, 180, 300, 420, 540, 660, 780].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="385" stroke={INK} strokeOpacity="0.06" strokeWidth="2" />
      ))}
      <rect x="0" y="385" width="800" height="65" fill={theme.floor} />
      <line x1="0" y1="385" x2="800" y2="385" stroke={INK} strokeWidth="3" />
      {[100, 230, 360, 490, 620, 750].map((x) => (
        <line key={x} x1={x} y1="385" x2={x - 30} y2="450" stroke={INK} strokeOpacity="0.15" strokeWidth="2" />
      ))}
      <text x="786" y="438" textAnchor="end" fontSize="14" fontWeight="800" fill={INK} opacity="0.4" letterSpacing="3">
        {theme.title.toUpperCase()}
      </text>

      {hotspots.map((h, index) => {
        const done = h.kind === "puzzle" && solved.includes(h.puzzleId);
        const isUsed = h.kind === "use" && used.includes(h.id);
        const showPulse = !done && !isUsed && h.kind !== "examine" && h.kind !== "robot";
        const isDoor = h.id === "door";
        const fill = isDoor ? theme.accent : PROP_COLORS[index % PROP_COLORS.length];
        const cx = h.x + h.w / 2;
        const size = Math.max(28, Math.min(h.w, h.h) * 0.55);
        return (
          <g
            key={h.id}
            role="button"
            tabIndex={0}
            aria-label={h.label}
            onClick={() => onHotspot(h)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onHotspot(h)}
            className="cursor-pointer outline-none [&_rect.prop]:hover:stroke-[#ffc933] [&_rect.prop]:focus:stroke-[#ffc933]"
          >
            <title>{h.label}</title>
            <ellipse cx={cx} cy={h.y + h.h + 4} rx={h.w * 0.45} ry="6" fill={INK} opacity="0.12" />
            <rect
              className="prop"
              x={h.x}
              y={h.y}
              width={h.w}
              height={h.h}
              rx={isDoor ? 6 : 14}
              fill={fill}
              stroke={INK}
              strokeWidth="3"
              opacity={done || isUsed ? 0.78 : 1}
            />
            {isDoor && <circle cx={h.x + h.w - 18} cy={h.y + h.h / 2} r="6" fill={done ? "#3ddc97" : "#ffc933"} stroke={INK} strokeWidth="2" />}
            <text x={cx} y={h.y + h.h / 2 + size * 0.18} textAnchor="middle" fontSize={size} dominantBaseline="middle">
              {h.icon ?? "❔"}
            </text>
            <text x={cx} y={h.y + h.h - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={INK} opacity="0.75">
              {h.label}
            </text>
            {showPulse && (
              <circle cx={h.x + h.w - 10} cy={h.y + 10} r="6" fill="#ffc933" stroke={INK} strokeWidth="2">
                <animate attributeName="r" values="5;8;5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            {(done || isUsed) && (
              <text x={h.x + h.w - 10} y={h.y + 18} textAnchor="middle" fontSize="18" fill="#17a864" fontWeight="800">
                ✓
              </text>
            )}
          </g>
        );
      })}

      {danger > 40 && <rect x="0" y="0" width="800" height="450" fill="#ff2d2d" opacity={(danger - 40) / 400} pointerEvents="none" />}
      {selectedItem && <text x="14" y="438" fontSize="12" fontWeight="700" fill={INK} opacity="0.7">▶</text>}
    </svg>
  );
}
