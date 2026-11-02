"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDailyQuizText } from "@/i18n/daily-quiz";
import { getSubjectText } from "@/i18n/subjects";
import { SUBJECTS } from "@/lib/taxonomy";
import { notifyAccountChanged } from "@/lib/account-events";
import { QuestionCard } from "@/components/classic/QuestionCard";
import { formatTime } from "@/lib/classic-games";
import type { Locale } from "@/i18n/config";

type Q = { id: string; prompt: string; options: string[] };
type Row = { name: string; score: number; points: number; difficulty: number; seconds: number; you: boolean };
type Config = { subject: string | null; difficulty: number; timed: boolean };
type Load = {
  loggedIn: boolean;
  started: boolean;
  questions: Q[];
  answers: { id: string; choice: number; correct: boolean }[];
  finished: boolean;
  score: number;
  points: number;
  streak: number;
  bestStreak: number;
  xp: number;
  config: Config | null;
  timedSeconds: number;
  msLeft: number | null;
  seconds: number;
  msToNext: number;
  top: Row[];
  rank: number | null;
};
type Feedback = { choice: number; correct: boolean; timedOut: boolean; correctIndex: number; explanation: string; gainedXp: number; gainedPoints: number };
type Result = { score: number; points: number; xp: number; bestStreak: number; flawless: boolean; seconds: number; top: Row[]; rank: number | null };
type Local = { date: string; score: number; difficulty: number; subject: string | null; points: number };

const LOCAL_KEY = "dailyquiz-local";

function readLocal(): Local[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Local[]).filter((e) => typeof e?.score === "number").slice(0, 14) : [];
  } catch {
    return [];
  }
}

function writeLocal(entry: Local) {
  try {
    const list = [entry, ...readLocal().filter((e) => e.date !== entry.date)].slice(0, 14);
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // úložiště nemusí být dostupné
  }
}

// Denní kvíz: výběr tématu a obtížnosti (1–5), deset otázek, volitelně na čas. Odpovědi ověřuje server (api/denni-kviz),
// za správné jsou XP a body, série bezchybných odpovědí dává bonus, na konci žebříček dne.
export function DailyQuiz({ locale }: { locale: Locale }) {
  const t = getDailyQuizText(locale);
  const labels = getSubjectText(locale).labels;
  const [data, setData] = useState<Load | "loading" | "error">("loading");
  const [index, setIndex] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [timed, setTimed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState<Result | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [local, setLocal] = useState<Local[]>([]);
  const t0 = useRef(0);
  const deadline = useRef(0);
  const timeoutFired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/denni-kviz")
      .then((r) => r.json())
      .then((d: Load & { error?: string }) => {
        if (cancelled) return;
        if (d.error) return setData("error");
        setData(d);
        setLocal(readLocal());
        if (d.started && !d.finished) {
          setIndex(Math.min(d.answers.length, d.questions.length - 1));
          setScore(d.score);
          setStreak(d.streak);
          setPoints(d.points);
          t0.current = performance.now() - d.seconds * 1000;
          if (d.msLeft !== null) deadline.current = performance.now() + d.msLeft;
        }
      })
      .catch(() => !cancelled && setData("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const playing = typeof data === "object" && data.loggedIn && data.started && !data.finished && !result;
  const timedRun = typeof data === "object" && !!data.config?.timed;

  useEffect(() => {
    if (!playing || pending) return;
    const id = window.setInterval(() => {
      setElapsed(Math.round((performance.now() - t0.current) / 1000));
      if (timedRun && !fb) setMsLeft(Math.max(0, deadline.current - performance.now()));
    }, 200);
    return () => window.clearInterval(id);
  }, [playing, pending, timedRun, fb]);

  const answer = useCallback(
    async (choice: number) => {
      if (typeof data !== "object") return;
      const q = data.questions[index];
      if (busy || fb || !q) return;
      setBusy(true);
      try {
        const res = await fetch("/api/denni-kviz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id, choice }) });
        const d = await res.json();
        if (!res.ok) return setData("error");
        setFb({ choice, correct: d.correct, timedOut: d.timedOut, correctIndex: d.correctIndex, explanation: d.explanation, gainedXp: d.gainedXp, gainedPoints: d.gainedPoints });
        setScore(d.score);
        setStreak(d.streak);
        setPoints(d.totalPoints);
        if (d.finished) {
          setPending({ score: d.score, points: d.totalPoints, xp: d.totalXp, bestStreak: d.bestStreak, flawless: d.flawless, seconds: d.seconds, top: d.top, rank: d.rank });
          writeLocal({ date: new Date().toISOString().slice(0, 10), score: d.score, difficulty: data.config?.difficulty ?? 3, subject: data.config?.subject ?? null, points: d.totalPoints });
          setLocal(readLocal());
        }
        if (d.gainedXp > 0 || d.gainedPoints > 0) notifyAccountChanged();
      } catch {
        setData("error");
      } finally {
        setBusy(false);
      }
    },
    [data, index, busy, fb],
  );

  // Časový režim: po vypršení limitu se odešle prázdná odpověď.
  useEffect(() => {
    if (!playing || !timedRun || fb || busy || pending || msLeft === null) return;
    if (msLeft <= 0 && !timeoutFired.current) {
      timeoutFired.current = true;
      void answer(-1);
    }
  }, [msLeft, playing, timedRun, fb, busy, pending, answer]);

  if (data === "loading") return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (data === "error") return <p className="card p-6 text-[var(--muted)]">{t.error}</p>;

  const heading = { fontFamily: "var(--font-heading)" } as const;
  const hours = Math.floor(data.msToNext / 3_600_000);
  const minutes = Math.floor((data.msToNext % 3_600_000) / 60_000);
  const left = `${hours} h ${minutes} min`;
  const subjectName = (value: string | null) => (value ? labels[value as keyof typeof labels] : t.allTopics);

  async function start() {
    if (starting) return;
    setStarting(true);
    setSetupError("");
    try {
      const res = await fetch("/api/denni-kviz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", subject, difficulty, timed }) });
      const d = await res.json();
      if (!res.ok) {
        setSetupError(d.error === "not-enough" ? t.notEnough : t.error);
        return;
      }
      t0.current = performance.now();
      deadline.current = performance.now() + (d.msLeft ?? 0);
      timeoutFired.current = false;
      setMsLeft(d.msLeft);
      setIndex(0);
      setScore(0);
      setStreak(0);
      setPoints(0);
      setData((cur) => (typeof cur === "object" ? { ...cur, started: true, questions: d.questions, config: d.config, timedSeconds: d.timedSeconds, answers: [] } : cur));
    } catch {
      setSetupError(t.error);
    } finally {
      setStarting(false);
    }
  }

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

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
              <span className="hidden text-xs tracking-tighter opacity-70 sm:inline" title={t.difficulty}>
                {stars(r.difficulty)}
              </span>
              <span className="tabular-nums">{r.score}/10</span>
              <span className="w-16 text-right font-extrabold tabular-nums">
                {r.points} <span className="text-[10px] font-semibold opacity-70">{t.pointsShort}</span>
              </span>
              <span className="w-14 text-right tabular-nums text-xs opacity-70">{formatTime(r.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
      {rank && <p className="mt-3 text-sm font-bold">{t.rank.replace("{n}", String(rank))}</p>}
    </div>
  );

  const localPanel = (
    <div className="card p-5">
      <h2 className="mb-3 text-lg font-bold" style={heading}>
        📊 {t.localTitle}
      </h2>
      {local.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t.localEmpty}</p>
      ) : (
        <>
          <p className="mb-2 text-sm font-bold">{t.localBest.replace("{n}", String(Math.max(...local.map((e) => e.score))))}</p>
          <ul className="flex flex-wrap gap-2">
            {local.slice(0, 7).map((e) => (
              <li key={e.date} className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold" title={`${subjectName(e.subject)} · ${stars(e.difficulty)}`}>
                {e.date.slice(5).replace("-", ". ")}. · <span className="font-extrabold tabular-nums">{e.score}/10</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const finishedView = (r: Result, showGain: boolean) => (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col items-start gap-3 p-6">
        <h2 className="text-2xl font-bold" style={heading}>
          {t.score.replace("{n}", String(r.score))}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            {t.time}: <span className="tabular-nums">{formatTime(r.seconds)}</span>
          </span>
          <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">{t.bestStreak.replace("{n}", String(r.bestStreak))}</span>
          <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">{t.points.replace("{n}", String(r.points))}</span>
          {showGain && r.xp > 0 && <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b]">{t.gained.replace("{n}", String(r.xp))}</span>}
        </div>
        {r.flawless && <p className="text-sm font-bold">🌟 {t.flawless}</p>}
        <p className="text-sm text-[var(--muted)]">{t.tomorrow.replace("{t}", left)}</p>
      </div>
      {board(r.top, r.rank)}
      {localPanel}
    </div>
  );

  if (result) return finishedView(result, true);
  if (data.finished) {
    return finishedView({ score: data.score, points: data.points, xp: data.xp, bestStreak: data.bestStreak, flawless: data.score === 10, seconds: data.seconds, top: data.top, rank: data.rank }, true);
  }

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

  if (!data.started) {
    return (
      <div className="flex flex-col gap-4">
        <div className="card flex flex-col gap-5 p-6">
          <h2 className="text-xl font-bold" style={heading}>
            {t.setupTitle}
          </h2>

          <fieldset>
            <legend className="mb-2 text-sm font-bold">{t.topic}</legend>
            <div className="flex flex-wrap gap-2">
              {[{ value: null as string | null, emoji: "🎲" }, ...SUBJECTS].map((s) => {
                const active = subject === s.value;
                return (
                  <button
                    key={s.value ?? "all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSubject(s.value)}
                    className={`pill px-3 py-1.5 text-sm font-semibold transition ${active ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] hover:-translate-y-0.5"}`}
                  >
                    {s.emoji} {subjectName(s.value)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-bold">
              {t.difficulty}: {t.levels[difficulty - 1]}
            </legend>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={difficulty === n}
                  aria-label={`${n} – ${t.levels[n - 1]}`}
                  onClick={() => setDifficulty(n)}
                  className={`pill min-w-14 px-3 py-1.5 text-sm font-bold transition ${difficulty === n ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface-muted)] hover:-translate-y-0.5"}`}
                >
                  {n} ★
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="h-5 w-5" />
            <span>
              ⏱ {t.timedLabel} <span className="font-normal text-[var(--muted)]">({t.timedHint.replace("{s}", String(data.timedSeconds))})</span>
            </span>
          </label>

          {setupError && <p className="text-sm font-bold text-[#ff5d73]">{setupError}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-bouncy btn-primary btn-lg" onClick={start} disabled={starting}>
              {starting ? t.starting : t.start}
            </button>
            <p className="text-sm text-[var(--muted)]">{t.tomorrow.replace("{t}", left)}</p>
          </div>
        </div>
        {board(data.top, data.rank)}
        {localPanel}
      </div>
    );
  }

  const q = data.questions[index];
  if (!q) return <p className="card p-6 text-[var(--muted)]">{t.error}</p>;

  function next() {
    setFb(null);
    setIndex((i) => i + 1);
    timeoutFired.current = false;
    if (timedRun) {
      deadline.current = performance.now() + data.timedSeconds * 1000;
      setMsLeft(data.timedSeconds * 1000);
    }
  }

  const total = data.questions.length;
  const limitMs = data.timedSeconds * 1000;
  const shown = { id: q.id, prompt: q.prompt, options: q.options, correct: fb ? fb.correctIndex : -1, explanation: "" };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
        <span>{t.question.replace("{a}", String(index + 1)).replace("{b}", String(total))}</span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 tabular-nums">✅ {t.scoreNow.replace("{n}", String(score))}</span>
          {streak >= 2 && <span className="pill bg-[var(--accent-yellow)] px-2.5 py-1 text-[#16132b]">{t.streak.replace("{n}", String(streak))}</span>}
          <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 tabular-nums">
            {points} {t.pointsShort}
          </span>
          <span className="tabular-nums text-[var(--muted)]">⏱ {formatTime(elapsed)}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
        <div className="h-full rounded-full bg-[var(--brand-500)] transition-all" style={{ width: `${((index + (fb ? 1 : 0)) / total) * 100}%` }} />
      </div>
      {timedRun && (
        <div className="flex items-center gap-2" aria-label={t.timedLabel}>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
            <div
              className="h-full rounded-full transition-[width] duration-200"
              style={{ width: `${fb ? 0 : Math.min(100, ((msLeft ?? limitMs) / limitMs) * 100)}%`, background: (msLeft ?? limitMs) < 5000 ? "#ff5d73" : "var(--accent-500)" }}
            />
          </div>
          <span className="w-8 text-right text-sm font-bold tabular-nums">{fb ? "" : Math.ceil((msLeft ?? limitMs) / 1000)}</span>
        </div>
      )}
      <div className="card p-4">
        <QuestionCard q={shown} picked={fb && fb.choice >= 0 ? fb.choice : fb ? 99 : null} onPick={answer} disabled={busy} />
        {fb && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="font-bold">
              {fb.correct ? `✅ ${t.correct}` : `❌ ${fb.timedOut ? t.timeUp : t.wrong}: ${t.correctWas}: ${q.options[fb.correctIndex]}`}
              {(fb.gainedPoints > 0 || fb.gainedXp > 0) && (
                <span className="ml-2 text-sm text-[var(--muted)]">
                  {t.points.replace("{n}", String(fb.gainedPoints))} · {t.gained.replace("{n}", String(fb.gainedXp))}
                </span>
              )}
            </p>
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
