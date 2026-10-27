"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime } from "@/lib/classic-games";

export type AnswerResult = { id: string; correct: boolean };

// Stopky: běží, dokud je `running`.
export function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return { seconds, reset: () => setSeconds(0) };
}

export function GameFrame({
  title,
  intro,
  backHref,
  backLabel,
  stats,
  children,
}: {
  title: string;
  intro: string;
  backHref: string;
  backLabel: string;
  stats?: { label: string; value: string }[];
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href={backHref} className="text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]">
          {backLabel}
        </Link>
        <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{intro}</p>
      </div>
      {stats && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span key={s.label} className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
              {s.label}: <span className="tabular-nums">{s.value}</span>
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

// Konec hry: vyzvedne XP za aktivitu a zapíše chybné otázky do opakování (hostům se nic neuloží).
export function FinishCard({
  t,
  xp,
  seconds,
  stats,
  results,
  onAgain,
  backHref,
  children,
}: {
  t: ClassicText;
  xp: number;
  seconds: number;
  stats: { label: string; value: string }[];
  results: AnswerResult[];
  onAgain: () => void;
  backHref: string;
  children?: ReactNode;
}) {
  const [gained, setGained] = useState(0);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (xp > 0) {
      fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "game", amount: xp }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.gained > 0) setGained(data.gained);
        })
        .catch(() => {});
    }
    if (results.length > 0) {
      fetch("/api/opakovani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      }).catch(() => {});
    }
  }, [xp, results]);

  const hadMistakes = results.some((r) => !r.correct);
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.doneTitle}
      </h2>
      <div className="flex flex-wrap gap-2">
        <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
          {t.time}: <span className="tabular-nums">{formatTime(seconds)}</span>
        </span>
        {stats.map((s) => (
          <span key={s.label} className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            {s.label}: <span className="tabular-nums">{s.value}</span>
          </span>
        ))}
        {gained > 0 && (
          <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b]">
            +{gained} {t.xpLabel}
          </span>
        )}
      </div>
      {hadMistakes && <p className="text-sm text-[var(--muted)]">{t.reviewHint}</p>}
      {children}
      <div className="flex flex-wrap gap-3 pt-1">
        <button type="button" onClick={onAgain} className="btn-bouncy btn-primary btn-lg">
          {t.again}
        </button>
        <Link href={backHref} className="btn-bouncy btn-secondary btn-lg">
          {t.back}
        </Link>
      </div>
    </div>
  );
}

// Odměna za hru: základ + bonus za rychlost a čistotu, strop určuje server.
export function xpFor(base: number, mistakes: number, items: number): number {
  const accuracy = Math.max(0.3, 1 - mistakes / Math.max(1, items * 2));
  return Math.max(5, Math.round(base * accuracy));
}
