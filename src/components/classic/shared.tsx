"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime } from "@/lib/classic-games";

export type AnswerResult = { id: string; correct: boolean };
export type ReviewQuestion = { id?: string; prompt: string; options: string[]; correctIndex: number; explanation: string };

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
    <div className="fs-classic flex flex-col gap-5">
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
  questions,
  onAgain,
  backHref,
  children,
}: {
  t: ClassicText;
  xp: number;
  seconds: number;
  stats: { label: string; value: string }[];
  results: AnswerResult[];
  questions?: ReviewQuestion[];
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

  const [copied, setCopied] = useState(false);
  const hadMistakes = results.some((r) => !r.correct);
  const total = results.length;
  const right = results.filter((r) => r.correct).length;
  const pct = total ? Math.round((right / total) * 100) : 0;
  let streak = 0;
  let run = 0;
  for (const r of results) {
    run = r.correct ? run + 1 : 0;
    streak = Math.max(streak, run);
  }
  const level: 0 | 1 | 2 | 3 = pct === 100 ? 3 : pct >= 75 ? 2 : pct >= 40 ? 1 : 0;
  const byId = new Map((questions ?? []).filter((q) => q.id).map((q) => [q.id as string, q]));
  const misses: { q: ReviewQuestion; yours?: string }[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    const q = byId.get(r.id);
    if (r.correct || !q || seen.has(r.id)) continue;
    seen.add(r.id);
    misses.push({ q });
  }

  async function share() {
    const score = total ? `${right}/${total}` : String(xp) + " " + t.xpLabel;
    const text = t.end.shareText.replace("{score}", score);
    try {
      if (navigator.share) await navigator.share({ text, url: window.location.href });
      else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* sdílení zrušeno */
    }
  }
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.doneTitle}
      </h2>
      {total > 0 && (
        <div className="flex items-center gap-3" aria-label={t.end.stars[level]}>
          <div className="flex gap-1 text-3xl leading-none" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="finish-star" style={{ animationDelay: `${i * 0.18}s`, opacity: i < level ? 1 : 0.2, filter: i < level ? undefined : "grayscale(1)" }}>
                ⭐
              </span>
            ))}
          </div>
          <span className="font-bold">{t.end.stars[level]}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
          {t.time}: <span className="tabular-nums">{formatTime(seconds)}</span>
        </span>
        {stats.map((s) => (
          <span key={s.label} className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            {s.label}: <span className="tabular-nums">{s.value}</span>
          </span>
        ))}
        {total > 0 && (
          <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            {t.end.accuracy}: <span className="tabular-nums">{pct} %</span>
          </span>
        )}
        {streak > 1 && (
          <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            {t.end.streak}: <span className="tabular-nums">{streak}</span> 🔥
          </span>
        )}
        {gained > 0 && (
          <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b]">
            +{gained} {t.xpLabel}
          </span>
        )}
      </div>
      {hadMistakes && <p className="text-sm text-[var(--muted)]">{t.reviewHint}</p>}
      {misses.length > 0 && (
        <div className="w-full">
          <h3 className="mb-2 text-lg font-bold">{t.end.mistakesTitle}</h3>
          <ul className="flex flex-col gap-2">
            {misses.slice(0, 6).map(({ q }) => (
              <li key={q.id} className="rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] p-3 text-sm">
                <p className="font-bold">{q.prompt}</p>
                <p className="mt-1">
                  <span className="font-semibold text-[var(--muted)]">{t.end.correct}:</span> <span className="font-bold">{q.options[q.correctIndex]}</span>
                </p>
                {q.explanation && (
                  <p className="mt-1 text-[var(--muted)]">
                    <span className="font-semibold">{t.end.why}:</span> {q.explanation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
      <div className="flex flex-wrap gap-3 pt-1">
        <button type="button" onClick={onAgain} className="btn-bouncy btn-primary btn-lg">
          {t.again}
        </button>
        <Link href={backHref} className="btn-bouncy btn-secondary btn-lg">
          {t.back}
        </Link>
        <button type="button" onClick={share} className="btn-bouncy btn-secondary btn-lg">
          {copied ? t.end.copied : t.end.share}
        </button>
      </div>
    </div>
  );
}

// Odměna za hru: základ + bonus za rychlost a čistotu, strop určuje server.
export function xpFor(base: number, mistakes: number, items: number): number {
  const accuracy = Math.max(0.3, 1 - mistakes / Math.max(1, items * 2));
  return Math.max(5, Math.round(base * accuracy));
}
