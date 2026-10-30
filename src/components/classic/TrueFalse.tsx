"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import type { GameQuestion } from "@/i18n/game";
import { toStatements, type Statement } from "@/lib/classic-games";
import { FinishCard, GameFrame, xpFor, type AnswerResult } from "./shared";

const PENALTY = 3;
const BONUS = 3;
const BONUS_EVERY = 5;

// Pravda, nebo lež: otázka a k ní odpověď, hráč co nejrychleji rozhodne, jestli platí.
// Za sérii pěti správných rozhodnutí přibude čas, za chybu ubude.
export function TrueFalse({
  t,
  questions,
  difficulty,
  backHref,
}: {
  t: ClassicText;
  questions: GameQuestion[];
  difficulty: number;
  backHref: string;
}) {
  const total = difficulty <= 2 ? 75 : difficulty === 3 ? 60 : 45;
  const [round, setRound] = useState(0);
  // Tři zamíchané balíčky za sebou, ať tvrzení nedojdou dřív než čas.
  const deck = useMemo<Statement[]>(
    () => [...toStatements(questions, 40), ...toStatements(questions, 40), ...toStatements(questions, 40)],
    [questions, round], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(total);
  const [done, setDone] = useState(false);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; s: Statement } | null>(null);
  const [bonusPop, setBonusPop] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [misses, setMisses] = useState<Statement[]>([]);
  const deadline = useRef(0);
  const lock = useRef(false);

  useEffect(() => {
    if (done) return;
    if (deadline.current === 0) deadline.current = Date.now() + total * 1000;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0) setDone(true);
    }, 200);
    return () => window.clearInterval(id);
  }, [done, round, total]);

  const s = deck[index];

  const answerRef = useRef<(v: boolean) => void>(() => {});
  function answer(says: boolean) {
    if (done || !s || lock.current) return;
    lock.current = true;
    const ok = says === s.truth;
    if (s.id) setResults((r) => [...r, { id: s.id as string, correct: ok }]);
    setFeedback({ ok, s });
    if (ok) {
      setRight((n) => n + 1);
      const next = streak + 1;
      setStreak(next);
      setBest((b) => Math.max(b, next));
      if (next % BONUS_EVERY === 0) {
        deadline.current += BONUS * 1000;
        setBonusPop((n) => n + 1);
      }
    } else {
      setWrong((n) => n + 1);
      setStreak(0);
      setMisses((m) => (m.some((x) => x.question === s.question) ? m : [...m, s]));
      deadline.current -= PENALTY * 1000;
    }
    window.setTimeout(
      () => {
        setIndex((n) => (n + 1) % deck.length);
        setFeedback(null);
        lock.current = false;
      },
      ok ? 380 : 1500,
    );
  }
  useEffect(() => {
    answerRef.current = answer;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "p") answerRef.current(true);
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "l") answerRef.current(false);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (deck.length < 6) return <p className="card p-6">{t.noData}</p>;

  function restart() {
    setRound((n) => n + 1);
    setIndex(0);
    deadline.current = 0;
    setLeft(total);
    setDone(false);
    setRight(0);
    setWrong(0);
    setStreak(0);
    setBest(0);
    setFeedback(null);
    setResults([]);
    setMisses([]);
    lock.current = false;
  }

  const meta = t.games.pravda;
  const pct = Math.min(100, (left / total) * 100);

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.quiz.timeLeft, value: `${left} s` },
        { label: t.quiz.correctN, value: String(right) },
        { label: t.tf.combo, value: `${streak} 🔥` },
      ]}
    >
      {done ? (
        <FinishCard
          t={t}
          xp={xpFor(Math.min(32, 4 + right * 2), wrong, Math.max(1, right + wrong))}
          seconds={total}
          stats={[
            { label: t.quiz.correctN, value: String(right) },
            { label: t.mistakes, value: String(wrong) },
            { label: t.quiz.best, value: String(best) },
          ]}
          results={results}
          onAgain={restart}
          backHref={backHref}
        >
          {misses.length > 0 && (
            <ul className="flex w-full flex-col gap-2 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              {misses.slice(0, 8).map((m) => (
                <li key={m.question + m.shown} className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="font-semibold">{m.question}</p>
                  <p>
                    „{m.shown}“ → <span className="font-bold">{m.truth ? t.tf.wasTrue : t.tf.wasLie}</span>
                    {!m.truth && <span className="text-[var(--brand-600)]"> · ✓ {m.correct}</span>}
                  </p>
                  {m.explanation && <p className="mt-1 text-xs text-[var(--muted)]">{m.explanation}</p>}
                </li>
              ))}
            </ul>
          )}
        </FinishCard>
      ) : (
        <div className="card flex flex-col gap-5 p-5">
          <div className="relative h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
            <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${pct}%`, background: pct < 25 ? "#ff5d73" : "var(--accent-500)" }} />
          </div>
          {bonusPop > 0 && (
            <span key={bonusPop} className="tf-bonus self-center rounded-full bg-[var(--accent-yellow)] px-3 py-1 text-sm font-extrabold text-[#16132b]">
              +{BONUS} s ⏱️
            </span>
          )}
          {s && (
            <div
              key={index}
              className="tf-card flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl border-4 p-6 text-center transition-colors"
              style={{
                borderColor: feedback ? (feedback.ok ? "#2ea36b" : "#ff5d73") : "var(--edge)",
                background: feedback ? (feedback.ok ? "rgba(126,224,176,0.25)" : "rgba(255,93,115,0.15)") : "var(--surface-muted)",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--faint)]">{t.tf.question}</p>
              <p className="text-lg font-bold sm:text-xl" style={{ fontFamily: "var(--font-heading)" }}>
                {s.question}
              </p>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--faint)]">{t.tf.claim}</p>
              <p className="rounded-2xl bg-[var(--surface)] px-5 py-2 text-2xl font-extrabold">{s.shown}</p>
              {feedback && !feedback.ok && (
                <p className="text-sm font-semibold">
                  {feedback.s.truth ? t.tf.wasTrue : `${t.tf.wasLie} · ✓ ${feedback.s.correct}`} · −{PENALTY} s
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => answer(false)} className="btn-bouncy rounded-2xl bg-[#ff5d73] py-5 text-xl font-extrabold text-white">
              ✗ {t.tf.lie}
            </button>
            <button type="button" onClick={() => answer(true)} className="btn-bouncy rounded-2xl bg-[#22c55e] py-5 text-xl font-extrabold text-white">
              ✓ {t.tf.truth}
            </button>
          </div>
          <p className="text-center text-xs text-[var(--faint)]">⌨️ {t.tf.keys}</p>
        </div>
      )}
    </GameFrame>
  );
}
