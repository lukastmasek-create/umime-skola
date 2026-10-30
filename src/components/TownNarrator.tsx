"use client";

import { useEffect, useRef, useState } from "react";

// Vypravěč cut scén městečka: portrét mluvící postavy (animovaný sprite), jméno a text, který se postupně vypisuje.
// Klik nebo mezerník text dopíše, další klik pokračuje. Po dopsání se scéna sama posune dál (podle délky textu).

export type Art = { f: string; n: number; dur?: number };

/** Postupné vypisování textu. `done` je true, když je text celý; `finish` ho dopíše hned. */
export function useTypewriter(text: string, cps = 42) {
  const [shown, setShown] = useState(0);
  const [prev, setPrev] = useState(text);
  if (prev !== text) {
    setPrev(text);
    setShown(0);
  }
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setShown(text.length), 0);
      return () => window.clearTimeout(id);
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(text.length, Math.floor(((now - t0) / 1000) * cps));
      setShown((s) => Math.max(s, n));
      if (n < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, cps]);
  return { text: text.slice(0, shown), done: shown >= text.length, finish: () => setShown(text.length) };
}

/** Animovaný portrét z pásu snímků (stejné sprity jako postavy v městečku). */
export function Portrait({ art, talking, className = "" }: { art: Art; talking?: boolean; className?: string }) {
  return (
    <span aria-hidden className={`block overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[radial-gradient(circle_at_50%_35%,#fff7da,#ffd98a)] ${className}`}>
      <span className={`block h-full w-full ${talking ? "town-talk" : ""}`}>
        <span
          className="town-sprite block h-full w-full"
          style={{ transform: "scale(1.6)", transformOrigin: "50% 28%", backgroundImage: `url(${art.f.startsWith("/") ? art.f : `/home/mesto/${art.f}.webp`})`, ["--n" as string]: art.n, animationDuration: `${art.dur ?? 2}s` }}
        />
      </span>
    </span>
  );
}

export function TownNarrator({
  name,
  art,
  title,
  text,
  next,
  skip,
  onNext,
  onSkip,
}: {
  name: string;
  art: Art;
  title?: string;
  text: string;
  next: string;
  skip: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  const tw = useTypewriter(text);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  });
  // po dopsání se scéna posune sama (čas na přečtení podle délky textu)
  useEffect(() => {
    if (!tw.done) return;
    const id = window.setTimeout(() => onNextRef.current(), Math.max(1600, text.length * 40));
    return () => window.clearTimeout(id);
  }, [tw.done, text]);
  const advance = () => (tw.done ? onNext() : tw.finish());
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advanceRef.current();
      } else if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="town-panel-in pointer-events-auto absolute inset-x-2 bottom-[calc(9%+0.5rem)] z-[80] sm:inset-x-8">
      <div
        role="button"
        tabIndex={0}
        onClick={advance}
        className="mx-auto flex max-w-3xl cursor-pointer items-stretch gap-3 rounded-3xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_6px_0_var(--shadow-ink)] sm:p-4"
      >
        <div className="flex shrink-0 flex-col items-center gap-1">
          <Portrait art={art} talking={!tw.done} className="h-16 w-16 sm:h-24 sm:w-24" />
          <span className="max-w-24 text-center text-[11px] font-extrabold leading-tight">{name}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {title && <span className="mb-1 self-start rounded-full bg-[var(--brand-500)] px-2.5 py-0.5 text-xs font-extrabold text-white">{title}</span>}
          <p aria-live="polite" className="min-h-[3.2rem] flex-1 text-[clamp(14px,1.6cqw,20px)] font-bold leading-snug">
            {tw.text}
            {!tw.done && <span className="town-caret" aria-hidden />}
          </p>
          <div className="mt-1 flex items-center justify-end gap-2 text-xs font-extrabold">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              className="rounded-full px-2 py-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            >
              ⏭ {skip}
            </button>
            <span className={`rounded-full bg-[var(--surface-muted)] px-3 py-1 ${tw.done ? "town-next" : "opacity-40"}`}>{next} ▸</span>
          </div>
        </div>
      </div>
    </div>
  );
}
