"use client";

import { useId, useState, type PointerEvent } from "react";

export type ChartPoint = { t: number; v: number };

type Props = {
  // Body seřazené podle času. Osa X jde od `from` do `to`, osa Y se přizpůsobí datům.
  points: ChartPoint[];
  from: number;
  to: number;
  label: string;
  format: (v: number) => string;
  // Kratší popisky na ose Y (aby se vešly do levého okraje). Výchozí je `format`.
  axisFormat?: (v: number) => string;
  // Popis času u kurzoru (např. „před 2 hod 15 min“).
  timeLabel: (t: number) => string;
  leftLabel: string;
  rightLabel: string;
  // Vodorovná čárkovaná linka, třeba nákupní cena držby.
  reference?: { v: number; label: string };
  color?: string;
};

const W = 320;
const H = 170;
const PAD = { l: 58, r: 10, t: 10, b: 20 };
const GRID_STEPS = 4;

export function PriceChart({ points, from, to, label, format, axisFormat, timeLabel, leftLabel, rightLabel, reference, color }: Props) {
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return null;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const span = to > from ? to - from : 1;

  // Rozsah osy Y: dat i referenční linka, s malou rezervou nahoře a dole.
  const vals = points.map((p) => p.v).concat(reference ? [reference.v] : []);
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const pad = (hi - lo) * 0.08 || hi * 0.05 || 1;
  lo -= pad;
  hi += pad;

  const X = (t: number) => PAD.l + Math.min(1, Math.max(0, (t - from) / span)) * innerW;
  const Y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * innerH;
  const coords = points.map((p) => [X(p.t), Y(p.v)] as const);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const base = PAD.t + innerH;
  const area = `${coords[0][0].toFixed(1)},${base} ${line} ${coords[coords.length - 1][0].toFixed(1)},${base}`;
  const grid = Array.from({ length: GRID_STEPS + 1 }, (_, k) => {
    const v = lo + ((hi - lo) * k) / GRID_STEPS;
    return { v, y: Y(v) };
  });

  const last = points[points.length - 1];
  const up = last.v >= points[0].v;
  const stroke = color ?? (up ? "var(--accent-green)" : "var(--danger)");
  const gradId = `pc-${uid}`;
  const cur = hover !== null ? points[hover] : null;

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width <= 0) return;
    const xv = ((e.clientX - r.left) / r.width) * W;
    const t = from + ((xv - PAD.l) / innerW) * span;
    let best = 0;
    let bestD = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.t - t);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHover(best);
  };

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={label}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((g, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={g.y} y2={g.y} stroke="var(--edge)" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray={i === 0 ? undefined : "2 3"} />
            <text x={PAD.l - 5} y={g.y + 3} textAnchor="end" fontSize="9" fill="var(--muted)">
              {(axisFormat ?? format)(g.v)}
            </text>
          </g>
        ))}

        <polygon points={area} fill={`url(#${gradId})`} />
        <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {reference && (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(reference.v)} y2={Y(reference.v)} stroke="var(--accent-yellow)" strokeWidth="1.2" strokeDasharray="4 3" />
            <text x={W - PAD.r} y={Y(reference.v) - 3} textAnchor="end" fontSize="9" fill="var(--accent-yellow)">
              {reference.label}
            </text>
          </g>
        )}

        <text x={PAD.l} y={H - 5} fontSize="9" fill="var(--muted)">
          {leftLabel}
        </text>
        <text x={W - PAD.r} y={H - 5} textAnchor="end" fontSize="9" fill="var(--muted)">
          {rightLabel}
        </text>

        {cur && hover !== null && (
          <g pointerEvents="none">
            <line x1={coords[hover][0]} x2={coords[hover][0]} y1={PAD.t} y2={base} stroke="var(--muted)" strokeWidth="0.8" />
            <circle cx={coords[hover][0]} cy={coords[hover][1]} r="3.2" fill={stroke} stroke="var(--surface)" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      <p className="flex flex-wrap justify-between gap-x-3 text-xs text-[var(--muted)]" aria-live="off">
        <span>
          <b className="text-[var(--foreground)]">{format(cur ? cur.v : last.v)}</b>
        </span>
        <span>{cur ? timeLabel(cur.t) : rightLabel}</span>
      </p>
    </div>
  );
}
