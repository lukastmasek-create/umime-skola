"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { tiltLeave, tiltMove } from "./cardTilt";
import { useReveal } from "./useReveal";

// Ilustrační ukázka přehledu výsledků ve stylu dashboardu (není to živá data).
// Po vjezdu do záběru se čísla rozpočítají a sloupce plynule dorostou jeden po druhém.
type Row = { who: string; pct: number };

// Plynulé počítání od 0 do cíle (easeOutCubic); při omezení animací skočí rovnou na hodnotu.
function useCount(to: number, run: boolean, delay = 0, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const total = prefersReducedMotion() ? 1 : dur;
    const t0 = performance.now() + delay;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / total));
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, delay, dur]);
  return v;
}


// Malé ručně kreslené SVG ikony ukázky: stejná krémová a tmavá paleta jako karty.
const INK = "#14132a";
const AVATARS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#b9a7ff", "#7ee0b0"];

function Avatar({ color }: { color: string }) {
  return (
    <svg className="rp-av" viewBox="0 0 28 28" width="28" height="28" aria-hidden focusable="false">
      <circle cx="14" cy="14" r="13" fill={color} stroke={INK} strokeWidth="1.6" />
      <circle cx="14" cy="11" r="4.4" fill="#f6f1e4" stroke={INK} strokeWidth="1.4" />
      <path d="M5.6 23.4c1.2-4.4 4.6-6 8.4-6s7.2 1.6 8.4 6" fill="#f6f1e4" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12.6" cy="10.6" r=".8" fill={INK} />
      <circle cx="15.8" cy="10.6" r=".8" fill={INK} />
    </svg>
  );
}

function StatusIcon({ full }: { full: boolean }) {
  return full ? (
    <svg className="rp-st rp-st-done" viewBox="0 0 20 20" width="18" height="18" aria-hidden focusable="false">
      <circle cx="10" cy="10" r="9" fill="#6ee7b7" stroke={INK} strokeWidth="1.5" />
      <path d="M5.6 10.4l3 3 5.8-6.4" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={100} className="rp-tick" />
    </svg>
  ) : (
    <svg className="rp-st" viewBox="0 0 20 20" width="18" height="18" aria-hidden focusable="false">
      <circle cx="10" cy="10" r="9" fill="#f6f1e4" fillOpacity=".14" stroke="#f6f1e4" strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M10 5.2V10l3.2 2" fill="none" stroke="#f6f1e4" strokeOpacity=".85" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="rp-ico" viewBox="0 0 44 44" width="44" height="44" aria-hidden focusable="false">
      <rect x="7" y="8" width="30" height="33" rx="5" fill="#b97a3e" stroke={INK} strokeWidth="2" />
      <rect x="11" y="13" width="22" height="25" rx="2.4" fill="#f6f1e4" stroke={INK} strokeWidth="1.4" />
      <rect x="15.5" y="4.6" width="13" height="8" rx="2.6" fill="#9aa1b5" stroke={INK} strokeWidth="1.8" />
      <rect x="15" y="29" width="3.6" height="6" rx="1" fill="#6ee7b7" stroke={INK} strokeWidth="1" />
      <rect x="20.2" y="24.4" width="3.6" height="10.6" rx="1" fill="#ffc933" stroke={INK} strokeWidth="1" />
      <rect x="25.4" y="19.4" width="3.6" height="15.6" rx="1" fill="#6ee7b7" stroke={INK} strokeWidth="1" />
      <path d="M15 20.4l4-3 3 2 5-4.6" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Prstenec průměru: oblouk dorůstá spolu s počítaným číslem.
function Ring({ value, run }: { value: number; run: boolean }) {
  const C = 2 * Math.PI * 27;
  return (
    <svg className="rp-ring" viewBox="0 0 72 72" width="72" height="72" aria-hidden focusable="false">
      <circle cx="36" cy="36" r="27" fill="#15162b" stroke="#f6f1e4" strokeOpacity=".18" strokeWidth="7" />
      <circle
        cx="36" cy="36" r="27" fill="none" stroke="#6ee7b7" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - (run ? value : 0) / 100)} transform="rotate(-90 36 36)" className="rp-arc"
      />
      <circle cx="36" cy="36" r="33.5" fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx="36" cy="36" r="20.5" fill="none" stroke={INK} strokeWidth="1.5" />
      <path d="M28 41l5-6 4 3.4 7-8.6" fill="none" stroke="#f6f1e4" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RowItem({ row, index, run }: { row: Row; index: number; run: boolean }) {
  const full = row.pct === 100;
  const delay = 500 + index * 170;
  const n = useCount(row.pct, run, delay, 1500);
  return (
    <li className={`rp-row${run ? " is-in" : ""}`} style={{ ["--d" as string]: `${delay - 300}ms`, ["--fc" as string]: full ? "#6ee7b7" : "#f6f1e4" }}>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <Avatar color={AVATARS[index % AVATARS.length]} />
          {row.who}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold tabular-nums text-[var(--muted)]">
          {n} %
          <StatusIcon full={full} />
        </span>
      </div>
      <span className="gcard-track block">
        <span className="gcard-fill rp-fill" style={{ width: run ? `${row.pct}%` : "0%", transitionDelay: `${delay}ms` }} />
      </span>
    </li>
  );
}

export function ResultsPreview({
  title,
  due,
  badge,
  doneLabel,
  rows,
  className = "",
}: {
  title: string;
  due: string;
  badge: string;
  doneLabel: string;
  rows: Row[];
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const heading = { fontFamily: "var(--font-heading)" };
  const avg = Math.round(rows.reduce((s, r) => s + r.pct, 0) / Math.max(rows.length, 1));
  const done = rows.filter((r) => r.pct === 100).length;
  const avgShown = useCount(avg, shown, 250, 1900);
  const doneShown = useCount(done, shown, 900, 700);
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ ["--gc" as string]: "#6ee7b7", ["--ga" as string]: "#6ee7b7" }}
      className={`gcard gcard-dark gcard-live rp-card${shown ? " is-in" : ""} p-5 sm:p-6 ${className}`}
      onPointerMove={tiltMove}
      onPointerLeave={tiltLeave}
    >
      <div className="rp-head mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardIcon />
          <div>
            <p className="gcard-title text-lg" style={heading}>{title}</p>
            <p className="gcard-sub">{due}</p>
          </div>
        </div>
        <span className="gcard-tag">{badge}</span>
      </div>
      <div className="rp-head mb-5 flex items-center gap-4" style={{ ["--d" as string]: "120ms" }}>
        <p className="gcard-big tabular-nums">{avgShown}<small>%</small></p>
        <span className="gcard-tag tabular-nums">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false" className="mr-1 inline-block align-[-2px]">
            <circle cx="8" cy="8" r="7" fill="#6ee7b7" />
            <path d="M4.6 8.2l2.4 2.4 4.4-5" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {doneShown} / {rows.length} {doneLabel}
        </span>
        <span className="ml-auto"><Ring value={avg} run={shown} /></span>
      </div>
      <ul className="space-y-3">
        {rows.map((row, i) => (
          <RowItem key={row.who} row={row} index={i} run={shown} />
        ))}
      </ul>
    </div>
  );
}
