"use client";

import { useMemo, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, shuffle, toPairs } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const PAIRS = 6;

// Stav dlaždice se nastavuje přímo ve stylu, aby přebil výchozí vzhled .card.
function tileStyle(done: boolean, picked: boolean, wrong: boolean): React.CSSProperties {
  if (done) return { borderColor: "#2ea36b", background: "rgba(126, 224, 176, 0.3)", opacity: 0.75 };
  if (wrong) return { borderColor: "#ff5d73", background: "rgba(255, 93, 115, 0.18)" };
  if (picked) return { borderColor: "var(--accent-500)", background: "rgba(124, 108, 255, 0.18)" };
  return {};
}

export function Matching({ t, questions, backHref }: { t: ClassicText; questions: GameQuestion[]; backHref: string }) {
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => toPairs(questions, PAIRS), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const right = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);

  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<{ l: number; r: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const finished = pairs.length > 0 && done.size === pairs.length;
  const { seconds, reset } = useTimer(!finished && pairs.length > 0);

  if (pairs.length < 4) return <p className="card p-6">{t.noData}</p>;

  function pickRight(r: number) {
    if (picked === null || done.has(r)) return;
    if (picked === r) {
      setDone((d) => new Set(d).add(r));
      setPicked(null);
    } else {
      setMistakes((m) => m + 1);
      setMissed((m) => new Set(m).add(picked));
      setWrong({ l: picked, r });
      window.setTimeout(() => setWrong(null), 600);
    }
  }

  function restart() {
    setRound((n) => n + 1);
    setDone(new Set());
    setPicked(null);
    setWrong(null);
    setMistakes(0);
    setMissed(new Set());
    reset();
  }

  const results: AnswerResult[] = pairs.flatMap((p, i) => (p.id ? [{ id: p.id, correct: !missed.has(i) }] : []));
  const meta = t.games.spojovani;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.solved, value: `${done.size}/${pairs.length}` },
        { label: t.mistakes, value: String(mistakes) },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, mistakes, pairs.length)}
          seconds={seconds}
          stats={[{ label: t.mistakes, value: String(mistakes) }]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--faint)]">{t.matching.questions}</p>
            {left.map((i) => (
              <button
                key={i}
                type="button"
                disabled={done.has(i)}
                onClick={() => setPicked(picked === i ? null : i)}
                className="card min-h-14 p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5"
                style={tileStyle(done.has(i), picked === i, wrong?.l === i)}
              >
                {pairs[i].prompt}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--faint)]">{t.matching.answers}</p>
            {right.map((i) => (
              <button
                key={i}
                type="button"
                disabled={done.has(i) || picked === null}
                onClick={() => pickRight(i)}
                className="card min-h-14 p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5"
                style={tileStyle(done.has(i), false, wrong?.r === i)}
              >
                {pairs[i].answer}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameFrame>
  );
}
