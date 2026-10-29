"use client";

import { useMemo, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, shuffle, shuffleQuestion, type Shuffled } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000];
const SAFE = [3, 6]; // jistý bod po 3. a 6. správně zodpovězené otázce

// Hlas publika: správná odpověď má obvykle převahu, na těžších otázkách menší.
function audience(q: Shuffled, level: number, hidden: number[]): number[] {
  const strength = Math.max(0.35, 0.85 - level * 0.05);
  const live = q.options.map((_, i) => i).filter((i) => !hidden.includes(i));
  const raw = live.map((i) => (i === q.correct ? strength : (1 - strength) * Math.random() + 0.02));
  const total = raw.reduce((a, b) => a + b, 0);
  const votes = q.options.map(() => 0);
  live.forEach((i, k) => {
    votes[i] = Math.round((raw[k] / total) * 100);
  });
  return votes;
}

export function Millionaire({
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
  const steps = difficulty <= 2 ? 8 : 10;
  const ladder = LADDER.slice(LADDER.length - steps);
  const safe = SAFE;
  const [round, setRound] = useState(0);
  const deck = useMemo(() => shuffle(questions).map(shuffleQuestion), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [level, setLevel] = useState(0);
  const [offset, setOffset] = useState(0); // kolik otázek z balíčku už padlo (kvůli přeskočení)
  const [picked, setPicked] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [votes, setVotes] = useState<number[] | undefined>();
  const [used, setUsed] = useState({ fifty: false, aud: false, skip: false });
  const [end, setEnd] = useState<null | { kind: "lost" | "won" | "took"; points: number }>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);

  const q = deck[level + offset];
  const { seconds, reset } = useTimer(deck.length > steps && !end);

  if (deck.length < steps + 1) return <p className="card p-6">{t.noData}</p>;

  const pointsNow = level > 0 ? ladder[level - 1] : 0;
  const lastSafe = [...safe].reverse().find((s) => s <= level);
  const safePoints = lastSafe ? ladder[lastSafe - 1] : 0;

  function record(correct: boolean) {
    if (q?.id) setResults((r) => [...r, { id: q.id as string, correct }]);
  }

  function pick(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.correct;
    record(ok);
    window.setTimeout(() => {
      if (!ok) {
        setEnd({ kind: "lost", points: safePoints });
        return;
      }
      if (level + 1 >= steps) {
        setEnd({ kind: "won", points: ladder[steps - 1] });
        return;
      }
      setLevel((l) => l + 1);
      setPicked(null);
      setHidden([]);
      setVotes(undefined);
    }, 1200);
  }

  function fifty() {
    if (used.fifty || picked !== null || !q) return;
    const wrong = q.options.map((_, i) => i).filter((i) => i !== q.correct);
    setHidden(shuffle(wrong).slice(0, 2));
    setVotes(undefined);
    setUsed((u) => ({ ...u, fifty: true }));
  }
  function ask() {
    if (used.aud || picked !== null || !q) return;
    setVotes(audience(q, level, hidden));
    setUsed((u) => ({ ...u, aud: true }));
  }
  function skip() {
    if (used.skip || picked !== null) return;
    setOffset((o) => o + 1);
    setHidden([]);
    setVotes(undefined);
    setUsed((u) => ({ ...u, skip: true }));
  }

  function restart() {
    setRound((n) => n + 1);
    setLevel(0);
    setOffset(0);
    setPicked(null);
    setHidden([]);
    setVotes(undefined);
    setUsed({ fifty: false, aud: false, skip: false });
    setEnd(null);
    setResults([]);
    reset();
  }

  const meta = t.games.milionar;
  const reachedPoints = end?.points ?? 0;
  const mistakes = results.filter((r) => !r.correct).length;
  const cleared = end?.kind === "won" ? steps : level;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.mil.question, value: `${Math.min(level + 1, steps)}/${steps}` },
        { label: t.quiz.score, value: `${end ? end.points : pointsNow} ${t.mil.points}` },
      ]}
    >
      {end ? (
        <FinishCard
          t={t}
          xp={xpFor(30, mistakes * 2, Math.max(1, cleared || 1))}
          seconds={seconds}
          stats={[
            { label: t.mil.reached, value: `${cleared}/${steps}` },
            { label: end.kind === "won" ? t.mil.won : t.mil.takeHome, value: `${reachedPoints} ${t.mil.points}` },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        >
          {end.kind === "lost" && q && (
            <div className="w-full rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              <p className="font-semibold">
                {t.mil.lost} {reachedPoints} {t.mil.points}
              </p>
              <p className="mt-1">
                {q.prompt} → <span className="font-bold text-[var(--brand-600)]">{q.options[q.correct]}</span>
              </p>
              <p className="text-xs text-[var(--muted)]">{q.explanation}</p>
            </div>
          )}
        </FinishCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_12rem]">
          <div className="card flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={fifty} disabled={used.fifty || picked !== null} className="btn-bouncy rounded-full border-2 border-[var(--edge)] px-3 py-1.5 text-sm font-bold disabled:opacity-40">
                {t.mil.fifty}
              </button>
              <button type="button" onClick={ask} disabled={used.aud || picked !== null} className="btn-bouncy rounded-full border-2 border-[var(--edge)] px-3 py-1.5 text-sm font-bold disabled:opacity-40">
                👥 {t.mil.audience}
              </button>
              <button type="button" onClick={skip} disabled={used.skip || picked !== null} className="btn-bouncy rounded-full border-2 border-[var(--edge)] px-3 py-1.5 text-sm font-bold disabled:opacity-40">
                ⏭ {t.mil.skip}
              </button>
              {level > 0 && (
                <button
                  type="button"
                  onClick={() => setEnd({ kind: "took", points: pointsNow })}
                  disabled={picked !== null}
                  className="btn-bouncy ml-auto rounded-full bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b] disabled:opacity-40"
                >
                  💰 {t.mil.take} ({pointsNow})
                </button>
              )}
            </div>
            {q && <QuestionCard q={q} picked={picked} hidden={hidden} onPick={pick} votes={votes} />}
          </div>
          <ol className="flex flex-col-reverse gap-1 text-sm">
            {ladder.map((amount, i) => {
              const isNow = i === level;
              const isSafe = safe.includes(i + 1);
              return (
                <li
                  key={amount}
                  className="flex items-center justify-between rounded-lg border-2 px-3 py-1 font-bold tabular-nums"
                  style={{
                    borderColor: isNow ? "var(--accent-500)" : "transparent",
                    background: isNow ? "var(--accent-500)" : i < level ? "rgba(126,224,176,0.3)" : "var(--surface-muted)",
                    color: isNow ? "#fff" : undefined,
                  }}
                >
                  <span>{i + 1}</span>
                  <span>
                    {amount}
                    {isSafe && <span title={t.mil.safe}> 🔒</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </GameFrame>
  );
}
