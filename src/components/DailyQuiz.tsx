"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDailyQuizText } from "@/i18n/daily-quiz";
import { notifyAccountChanged } from "@/lib/account-events";
import { QuestionCard } from "@/components/classic/QuestionCard";
import { formatTime } from "@/lib/classic-games";
import type { Locale } from "@/i18n/config";

type Q = { id: string; prompt: string; options: string[] };
type Row = { name: string; score: number; seconds: number; you: boolean };
type Load = {
  loggedIn: boolean;
  questions: Q[];
  answers: { id: string; choice: number; correct: boolean }[];
  finished: boolean;
  score: number;
  seconds: number;
  msToNext: number;
  top: Row[];
  rank: number | null;
};
type Feedback = { choice: number; correct: boolean; correctIndex: number; explanation: string };

// Denní kvíz: deset otázek dne, odpovědi ověřuje server (api/denni-kviz), na konci žebříček dne.
export function DailyQuiz({ locale }: { locale: Locale }) {
  const t = getDailyQuizText(locale);
  const [data, setData] = useState<Load | "loading" | "error">("loading");
  const [index, setIndex] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [gained, setGained] = useState(0);
  type Result = { score: number; seconds: number; top: Row[]; rank: number | null };
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState<Result | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const t0 = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/denni-kviz")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) return setData("error");
        setData(d);
        setIndex(Math.min(d.answers.length, d.questions.length - 1));
        if (d.answers.length > 0 && !d.finished) setStarted(true);
      })
      .catch(() => !cancelled && setData("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!started || result || pending) return;
    const id = window.setInterval(() => setElapsed(Math.round((performance.now() - t0.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [started, result, pending]);

  if (data === "loading") return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (data === "error") return <p className="card p-6 text-[var(--muted)]">{t.error}</p>;

  const heading = { fontFamily: "var(--font-heading)" } as const;
  const hours = Math.floor(data.msToNext / 3_600_000);
  const minutes = Math.floor((data.msToNext % 3_600_000) / 60_000);
  const left = `${hours} h ${minutes} min`;

  const board = (rows: Row[], rank: number | null) => (
    <div className="card p-5">
      <h2 className="mb-3 text-lg font-bold" style={heading}>
        🏆 {t.top}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t.empty}</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {rows.map((r, i) => (
            <li key={`${r.name}-${i}`} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${r.you ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface-muted)]"}`}>
              <span className="w-6 text-center font-extrabold">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">
                {r.name}
                {r.you ? ` (${t.you})` : ""}
              </span>
              <span className="tabular-nums">{r.score}/10</span>
              <span className="w-14 text-right tabular-nums text-xs opacity-70">{formatTime(r.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
      {rank && <p className="mt-3 text-sm font-bold">{t.rank.replace("{n}", String(rank))}</p>}
    </div>
  );

  const finishedView = (score: number, seconds: number, top: Row[], rank: number | null, got: number) => (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col items-start gap-3 p-6">
        <h2 className="text-2xl font-bold" style={heading}>
          {t.score.replace("{n}", String(score))}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            {t.time}: <span className="tabular-nums">{formatTime(seconds)}</span>
          </span>
          {got > 0 && <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b]">{t.gained.replace("{n}", String(got))}</span>}
        </div>
        <p className="text-sm text-[var(--muted)]">{t.tomorrow.replace("{t}", left)}</p>
      </div>
      {board(top, rank)}
    </div>
  );

  if (result) return finishedView(result.score, result.seconds, result.top, result.rank, gained);
  if (data.finished) return finishedView(data.score, data.seconds, data.top, data.rank, 0);

  if (!data.loggedIn) {
    return (
      <div className="flex flex-col gap-4">
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="text-[var(--muted)]">{t.guest}</p>
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
            {t.login}
          </Link>
        </div>
        {board(data.top, null)}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-4">
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="text-[var(--muted)]">{t.tomorrow.replace("{t}", left)}</p>
          <button
            type="button"
            className="btn-bouncy btn-primary btn-lg"
            onClick={() => {
              t0.current = performance.now();
              setStarted(true);
            }}
          >
            {t.start}
          </button>
        </div>
        {board(data.top, data.rank)}
      </div>
    );
  }

  const q = data.questions[index];

  async function pick(choice: number) {
    if (busy || fb || !q) return;
    setBusy(true);
    try {
      const res = await fetch("/api/denni-kviz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id, choice }) });
      const d = await res.json();
      if (!res.ok) return setData("error");
      setFb({ choice, correct: d.correct, correctIndex: d.correctIndex, explanation: d.explanation });
      if (d.finished) {
        setGained(d.gained ?? 0);
        setPending({ score: d.score, seconds: d.seconds, top: d.top, rank: d.rank });
        if (d.gained > 0) notifyAccountChanged();
      }
    } catch {
      setData("error");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setFb(null);
    setIndex((i) => i + 1);
  }

  const shown = { id: q.id, prompt: q.prompt, options: q.options, correct: fb ? fb.correctIndex : -1, explanation: "" };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
        <span>{t.question.replace("{a}", String(index + 1)).replace("{b}", String(data.questions.length))}</span>
        <span className="tabular-nums text-[var(--muted)]">⏱ {formatTime(elapsed)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
        <div className="h-full rounded-full bg-[var(--brand-500)] transition-all" style={{ width: `${((index + (fb ? 1 : 0)) / data.questions.length) * 100}%` }} />
      </div>
      <div className="card p-4">
        <QuestionCard q={shown} picked={fb ? fb.choice : null} onPick={pick} disabled={busy} />
        {fb && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="font-bold">{fb.correct ? `✅ ${t.correct}` : `❌ ${t.wrong}: ${t.correctWas}: ${q.options[fb.correctIndex]}`}</p>
            {fb.explanation && <p className="text-sm text-[var(--muted)]">{fb.explanation}</p>}
            <button type="button" onClick={pending ? () => setResult(pending) : next} className="btn-bouncy btn-primary self-start px-5 py-2 text-sm font-bold">
              {pending ? t.finish : t.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
