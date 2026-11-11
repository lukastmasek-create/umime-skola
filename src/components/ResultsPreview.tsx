"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { PcardRing, PcardTape } from "./PcardArt";
import { useReveal } from "./useReveal";

// Ilustrační ukázka třídy jako dětský závod (není to živá data): každý žák je zvířátko,
// které po vjezdu do záběru doběhne k cílové vlajce podle splnění úkolu.
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


const INK = "#14132a";
const CREAM = "#f6f1e4";

// Zvířátka pro žáky: ploché tvary, tmavý obrys, červené tváře.
function Critter({ kind }: { kind: number }) {
  const eyes = (
    <>
      <circle cx="15" cy="23" r="2.2" fill={INK} />
      <circle cx="29" cy="23" r="2.2" fill={INK} />
      <circle cx="15.8" cy="22.2" r=".7" fill="#fff" />
      <circle cx="29.8" cy="22.2" r=".7" fill="#fff" />
      <circle cx="10.5" cy="28" r="2.6" fill="#ff8a8a" opacity=".6" />
      <circle cx="33.5" cy="28" r="2.6" fill="#ff8a8a" opacity=".6" />
      <path d="M19.5 27.5q2.5 3 5 0" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    </>
  );
  const sw = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 44 44" width="46" height="46" aria-hidden focusable="false" className="rp-critter">
      {kind === 0 && ( // kočka
        <>
          <path d="M7 20 L9 5 L19 12Z M37 20 L35 5 L25 12Z" fill="#ffb347" {...sw} />
          <path d="M10 15 L11 9 L15 12Z M34 15 L33 9 L29 12Z" fill="#ff8a8a" />
          <ellipse cx="22" cy="26" rx="16" ry="13.5" fill="#ffb347" {...sw} />
          <path d="M16 14 v4 M22 13 v5 M28 14 v4" stroke="#e08a1e" strokeWidth="2" strokeLinecap="round" />
          <path d="M20.5 25.2h3l-1.5 1.8z" fill="#ff6b8a" />
          {eyes}
        </>
      )}
      {kind === 1 && ( // liška
        <>
          <path d="M6 22 L8 4 L20 13Z M38 22 L36 4 L24 13Z" fill="#ff7a45" {...sw} />
          <path d="M10 15 L11 9 L15 12Z M34 15 L33 9 L29 12Z" fill={INK} />
          <path d="M6 24 Q22 8 38 24 Q36 40 22 41 Q8 40 6 24Z" fill="#ff7a45" {...sw} />
          <path d="M12 30 Q22 44 32 30 Q22 33 12 30Z" fill={CREAM} />
          {eyes}
          <circle cx="22" cy="27" r="1.7" fill={INK} />
        </>
      )}
      {kind === 2 && ( // sova
        <>
          <path d="M8 18 L7 5 L18 10Z M36 18 L37 5 L26 10Z" fill="#a68bff" {...sw} />
          <ellipse cx="22" cy="26" rx="16" ry="14" fill="#a68bff" {...sw} />
          <circle cx="15" cy="22" r="6.4" fill={CREAM} {...sw} strokeWidth="1.6" />
          <circle cx="29" cy="22" r="6.4" fill={CREAM} {...sw} strokeWidth="1.6" />
          <circle cx="15" cy="22.5" r="2.6" fill={INK} />
          <circle cx="29" cy="22.5" r="2.6" fill={INK} />
          <path d="M22 26 l-3 3.4 h6z" fill="#ffc933" {...sw} strokeWidth="1.4" />
          <path d="M14 36q8 3 16 0" fill="none" stroke="#7e63e0" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {kind === 3 && ( // zajíc
        <>
          <ellipse cx="14" cy="9" rx="4.2" ry="9" fill="#9bd7ff" {...sw} />
          <ellipse cx="30" cy="9" rx="4.2" ry="9" fill="#9bd7ff" {...sw} />
          <ellipse cx="14" cy="10" rx="1.8" ry="5.4" fill="#ff8a8a" />
          <ellipse cx="30" cy="10" rx="1.8" ry="5.4" fill="#ff8a8a" />
          <ellipse cx="22" cy="28" rx="15" ry="13" fill="#9bd7ff" {...sw} />
          {eyes}
        </>
      )}
    </svg>
  );
}

const Star = ({ size = 18, color = "#ffc933" }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden focusable="false">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" fill={color} stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9.6 8.4l1.2-2.2" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function Flag() {
  return (
    <svg className="rp-flag" viewBox="0 0 34 44" width="30" height="40" aria-hidden focusable="false">
      <path d="M7 41V4" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M7 41V4" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
      <g className="rp-flag-cloth">
        <path d="M8 5 Q18 1 22 6 T32 7 V21 Q26 25 21 21 T8 22Z" fill="#6ee7b7" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M15 11l2 4 4.4.6-3.2 3 .8 4.3-4-2.1" fill="none" />
        <circle cx="19" cy="14" r="3" fill={CREAM} stroke={INK} strokeWidth="1.2" />
      </g>
      <ellipse cx="7" cy="42" rx="6" ry="2" fill="#000" opacity=".3" />
    </svg>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg className={`rp-cloud ${className}`} viewBox="0 0 64 28" aria-hidden focusable="false">
      <path d="M12 26a9 9 0 0 1-1-17.9A12 12 0 0 1 33 5a10 10 0 0 1 17 5 8.5 8.5 0 0 1-1 16z" fill={CREAM} fillOpacity=".92" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Clipboard() {
  return (
    <svg className="rp-ico" viewBox="0 0 44 44" width="44" height="44" aria-hidden focusable="false">
      <rect x="7" y="8" width="30" height="33" rx="5" fill="#b97a3e" stroke={INK} strokeWidth="2" />
      <rect x="11" y="13" width="22" height="25" rx="2.4" fill={CREAM} stroke={INK} strokeWidth="1.4" />
      <rect x="15.5" y="4.6" width="13" height="8" rx="2.6" fill="#9aa1b5" stroke={INK} strokeWidth="1.8" />
      <rect x="15" y="29" width="3.6" height="6" rx="1" fill="#6ee7b7" stroke={INK} strokeWidth="1" />
      <rect x="20.2" y="24.4" width="3.6" height="10.6" rx="1" fill="#ffc933" stroke={INK} strokeWidth="1" />
      <rect x="25.4" y="19.4" width="3.6" height="15.6" rx="1" fill="#6ee7b7" stroke={INK} strokeWidth="1" />
    </svg>
  );
}

function Trophy() {
  return (
    <svg className="rp-trophy" viewBox="0 0 48 48" width="52" height="52" aria-hidden focusable="false">
      <path d="M14 8h20v12a10 10 0 0 1-20 0z" fill="#ffc933" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 12H7q0 9 8 10M34 12h7q0 9-8 10" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 32h8l1 6H19z" fill="#e0a010" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="14" y="38" width="20" height="6" rx="2.5" fill="#b97a3e" stroke={INK} strokeWidth="2" />
      <path d="M18 12v8" stroke="#fff" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 13l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill={CREAM} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function Confetti() {
  const bits = [
    ["#ff8a6b", 10, 0], ["#ffc933", 30, 0.3], ["#8fd0ff", 50, 0.6], ["#b9a7ff", 70, 0.15], ["#6ee7b7", 88, 0.45],
  ] as const;
  return (
    <span className="rp-confetti" aria-hidden>
      {bits.map(([c, x, d]) => (
        <i key={x} style={{ background: c, left: `${x}%`, animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

function Lane({ row, index, run }: { row: Row; index: number; run: boolean }) {
  const full = row.pct === 100;
  const delay = 500 + index * 220;
  const n = useCount(row.pct, run, delay, 1700);
  return (
    <li
      className={`rp-lane${run ? " is-in" : ""}${full ? " is-full" : ""}`}
      style={{ ["--p" as string]: run ? row.pct : 0, ["--d" as string]: `${delay}ms`, ["--i" as string]: index }}
    >
      <div className="rp-who">
        <b>{row.who}</b>
        <span className="tabular-nums">{n} %</span>
      </div>
      <div className="rp-road">
        <span className="rp-dash" />
        <span className="rp-trail" />
        <div className="rp-runner">
          <span className="rp-hop"><Critter kind={index % 4} /></span>
          {full && (
            <span className="rp-win">
              <Star size={20} />
              <Confetti />
            </span>
          )}
        </div>
        <span className="rp-goal"><Flag /></span>
      </div>
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
      style={{ ["--ac" as string]: "#6ee7b7" }}
      className={`rp-card rp-paper rp-race${shown ? " is-in" : ""} ${className}`}
    >
      <PcardTape />
      <Cloud className="rp-cloud-a" />
      <Cloud className="rp-cloud-b" />
      <div className="rp-top">
        <div className="rp-headline">
          <span className="rp-iconwrap">
            <PcardRing />
            <Clipboard />
          </span>
          <div>
            <p className="rp-title" style={heading}>{title}</p>
            <p className="rp-sub">{due}</p>
          </div>
        </div>
        <span className="rp-tag">{badge}</span>
      </div>
      <div className="rp-body">
        <div className="rp-stats">
          <div className="rp-stat rp-stat-a">
            <Star size={34} />
            <p className="rp-big tabular-nums" style={heading}>{avgShown}<small>%</small></p>
          </div>
          <div className="rp-stat rp-stat-b">
            <Trophy />
            <p className="rp-big tabular-nums" style={heading}>{doneShown}<small>/{rows.length}</small></p>
            <p className="rp-sub">{doneLabel}</p>
          </div>
        </div>
        <ul className="rp-lanes">
          {rows.map((row, i) => (
            <Lane key={row.who} row={row} index={i} run={shown} />
          ))}
        </ul>
      </div>
    </div>
  );
}
