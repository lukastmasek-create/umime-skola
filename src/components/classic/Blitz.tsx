"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { shuffle, shuffleQuestion, type Shuffled } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

const PENALTY = 5;

export function Blitz({
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
  const deck = useMemo<Shuffled[]>(() => {
    // Balíček se opakuje, ať otázky nedojdou dřív než čas.
    const once = shuffle(questions);
    return [...once, ...shuffle(questions), ...shuffle(questions)].map(shuffleQuestion);
  }, [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState<"ready" | "play" | "done">("ready");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [missed, setMissed] = useState<Shuffled[]>([]);
  const [left, setLeft] = useState(total);
  const [pen, setPen] = useState(0);
  const deadline = useRef(0);
  const lock = useRef(false);

  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0) setPhase("done");
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  // Úvodní obrazovku (jak hrát, start) obstará ClassicGameInner, takže čas běží hned.
  useEffect(() => {
    if (phase !== "ready") return;
    deadline.current = Date.now() + total * 1000;
    setLeft(total); // eslint-disable-line react-hooks/set-state-in-effect
    setPhase("play");
  }, [phase, total]);

  const q = deck[index];

  const pickRef = useRef<(i: number) => void>(() => {});
  function pick(i: number) {
    if (phase !== "play" || !q || lock.current) return;
    lock.current = true;
    setPicked(i);
    const ok = i === q.correct;
    if (q.id) setResults((r) => [...r, { id: q.id as string, correct: ok }]);
    if (ok) {
      setCorrect((n) => n + 1);
      setStreak((s) => {
        const next = s + 1;
        setBest((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
      setMissed((m) => (m.some((x) => x.prompt === q.prompt) ? m : [...m, q]));
      deadline.current -= PENALTY * 1000;
      setPen((n) => n + 1);
      setLeft((l) => Math.max(0, l - PENALTY));
    }
    window.setTimeout(() => {
      setIndex((n) => n + 1);
      setPicked(null);
      lock.current = false;
    }, ok ? 350 : 900);
  }
  useEffect(() => {
    pickRef.current = pick;
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) pickRef.current(n - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (deck.length < 12) return <p className="card p-6">{t.noData}</p>;

  function restart() {
    setRound((n) => n + 1);
    setPhase("ready");
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setStreak(0);
    setBest(0);
    setResults([]);
    setMissed([]);
    setPen(0);
    setLeft(total);
    lock.current = false;
  }

  const meta = t.games.blesk;
  const pct = (left / total) * 100;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={
        phase === "ready"
          ? undefined
          : [
              { label: t.quiz.timeLeft, value: `${left} s` },
              { label: t.quiz.correctN, value: String(correct) },
              { label: t.quiz.streak, value: String(streak) },
            ]
      }
    >
      {phase === "done" ? (
        <FinishCard
          t={t}
          xp={xpFor(Math.min(30, 4 + correct * 2), pen, Math.max(1, correct + pen))}
          seconds={total}
          stats={[
            { label: t.quiz.correctN, value: String(correct) },
            { label: t.quiz.best, value: String(best) },
            { label: t.mistakes, value: String(pen) },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        >
          <p className="text-sm font-semibold">{t.quiz.timeUp}</p>
          {missed.length > 0 && (
            <ul className="flex w-full flex-col gap-2 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              {missed.slice(0, 6).map((m) => (
                <li key={m.prompt} className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="font-semibold">{m.prompt}</p>
                  <p className="text-[var(--brand-600)]">✓ {m.options[m.correct]}</p>
                </li>
              ))}
            </ul>
          )}
        </FinishCard>
      ) : (
        <div className="card flex flex-col gap-4 p-5">
          <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
            <div
              className="h-full rounded-full transition-[width] duration-200"
              style={{ width: `${pct}%`, background: pct < 25 ? "#ff5d73" : "var(--accent-500)" }}
            />
          </div>
          {q && <QuestionCard q={q} picked={picked} onPick={pick} />}
          {picked !== null && picked !== q?.correct && q && (
            <p className="text-sm font-semibold text-[#ff5d73]">
              {t.quiz.wrongAnswer} −{PENALTY} s · {t.quiz.correctWas}: {q.options[q.correct]}
            </p>
          )}
        </div>
      )}
    </GameFrame>
  );
}
