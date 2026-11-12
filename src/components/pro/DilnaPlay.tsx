"use client";

import { useEffect, useState } from "react";
import type { DilnaText } from "@/i18n/dilna";
import { isMatch, type GameData } from "@/lib/pro-tools/dilna";
import { shuffle } from "@/lib/teams/logic";

/** Krátké „Špatně“ se samo schová. */
function useClearAfter<T>(value: T | null, clear: (v: null) => void, ms = 700) {
  useEffect(() => {
    if (value === null) return;
    const id = window.setTimeout(() => clear(null), ms);
    return () => window.clearTimeout(id);
  }, [value, clear, ms]);
}

/** Hra na společné obrazovce pro všechny typy. Po dohrání se restartuje podle `round`. */
export function DilnaPlay({ game, t, onExit }: { game: GameData; t: DilnaText; onExit: () => void }) {
  const [round, setRound] = useState(0);
  const restart = () => setRound((r) => r + 1);
  return (
    <section className="card grid gap-4 p-5">
      <div className="flex justify-end">
        <button type="button" onClick={onExit} className="btn-secondary px-3 py-1 text-sm font-bold">{t.backToEdit}</button>
      </div>
      {game.kind === "pairs" && <PlayPairs key={round} pairs={game.pairs} t={t} onRestart={restart} />}
      {game.kind === "order" && <PlayOrder key={round} items={game.items} t={t} onRestart={restart} />}
      {game.kind === "story" && <PlayStory key={round} steps={game.steps} t={t} onRestart={restart} />}
      {game.kind === "speak" && <PlaySpeak key={round} prompts={game.prompts} t={t} onRestart={restart} />}
    </section>
  );
}

function Finished({ t, lines, onRestart }: { t: DilnaText; lines: string[]; onRestart: () => void }) {
  return (
    <div className="grid gap-4 text-center">
      <h2 className="text-2xl font-bold">{t.finishedTitle}</h2>
      {lines.map((l) => (
        <p key={l} className="font-semibold">{l}</p>
      ))}
      <div className="flex justify-center">
        <button type="button" onClick={onRestart} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white">{t.playAgain}</button>
      </div>
    </div>
  );
}

function PlayPairs({ pairs, t, onRestart }: { pairs: { left: string; right: string }[]; t: DilnaText; onRestart: () => void }) {
  const [lefts] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [rights] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  useClearAfter(wrongAt, setWrongAt);

  function pickRight(j: number) {
    if (sel === null || done.includes(j)) return;
    if (isMatch(sel, j)) setDone((d) => [...d, j]);
    else {
      setMistakes((m) => m + 1);
      setWrongAt(j);
    }
    setSel(null);
  }

  if (done.length === pairs.length) return <Finished t={t} lines={[`${t.mistakes}: ${mistakes}`]} onRestart={onRestart} />;

  return (
    <>
      <p className="text-sm font-semibold">{sel === null ? t.pickLeft : t.pickRight} · {done.length}/{pairs.length} · {t.mistakes}: {mistakes}</p>
      <p className="text-sm text-[var(--muted)]">{t.playHint}</p>
      {wrongAt !== null && <p role="status" className="text-sm font-bold">{t.wrong}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          {lefts.map((i) => (
            <button key={`l${i}`} type="button" aria-pressed={sel === i} disabled={done.includes(i)} onClick={() => setSel(i)}
              className={`rounded-xl border-2 p-4 text-left text-lg font-bold ${done.includes(i) ? "opacity-30" : ""} ${sel === i ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white" : "border-[var(--line)]"}`}>
              {pairs[i].left}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {rights.map((j) => (
            <button key={`r${j}`} type="button" disabled={done.includes(j) || sel === null} onClick={() => pickRight(j)}
              className={`rounded-xl border-2 p-4 text-left text-lg font-bold ${done.includes(j) ? "border-[var(--brand-500)] opacity-40" : ""} ${wrongAt === j ? "border-red-500" : "border-[var(--line)]"}`}>
              {pairs[j].right}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function PlayOrder({ items, t, onRestart }: { items: string[]; t: DilnaText; onRestart: () => void }) {
  const [cards] = useState(() => shuffle(items.map((_, i) => i)));
  const [next, setNext] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  useClearAfter(wrongAt, setWrongAt);

  function pick(i: number) {
    if (i === next) setNext((n) => n + 1);
    else {
      setMistakes((m) => m + 1);
      setWrongAt(i);
    }
  }

  if (next === items.length) return <Finished t={t} lines={[`${t.mistakes}: ${mistakes}`]} onRestart={onRestart} />;

  return (
    <>
      <p className="text-sm font-semibold">{t.pickNext} · {next}/{items.length} · {t.mistakes}: {mistakes}</p>
      <p className="text-sm text-[var(--muted)]">{t.orderHint}</p>
      {wrongAt !== null && <p role="status" className="text-sm font-bold">{t.wrong}</p>}
      <div className="grid gap-2">
        {cards.map((i) => (
          <button key={i} type="button" disabled={i < next} onClick={() => pick(i)}
            className={`rounded-xl border-2 p-4 text-left text-lg font-bold ${i < next ? "border-[var(--brand-500)] opacity-40" : ""} ${wrongAt === i ? "border-red-500" : "border-[var(--line)]"}`}>
            {items[i]}
          </button>
        ))}
      </div>
    </>
  );
}

function PlayStory({ steps, t, onRestart }: { steps: { clue: string; question: string; options: string[]; correctIndex: number }[]; t: DilnaText; onRestart: () => void }) {
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  useClearAfter(wrongAt, setWrongAt);

  if (step === steps.length) return <Finished t={t} lines={[`${t.mistakes}: ${mistakes}`]} onRestart={onRestart} />;
  const s = steps[step];

  function pick(k: number) {
    if (solved) return;
    if (k === s.correctIndex) setSolved(true);
    else {
      setMistakes((m) => m + 1);
      setWrongAt(k);
    }
  }

  function next() {
    setStep((x) => x + 1);
    setSolved(false);
    setWrongAt(null);
  }

  return (
    <>
      <p className="text-sm font-semibold">{step + 1}/{steps.length} · {t.mistakes}: {mistakes}</p>
      <p className="text-sm text-[var(--muted)]">{t.storyHint}</p>
      <blockquote className="rounded-xl bg-[var(--surface)] p-4 text-lg">{s.clue}</blockquote>
      <p className="text-lg font-bold">{s.question}</p>
      <div className="grid gap-2">
        {s.options.map((o, k) => (
          <button key={k} type="button" disabled={solved} onClick={() => pick(k)}
            className={`rounded-xl border-2 p-4 text-left text-lg font-bold ${solved && k === s.correctIndex ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white" : ""} ${wrongAt === k ? "border-red-500" : "border-[var(--line)]"}`}>
            {o}
          </button>
        ))}
      </div>
      {wrongAt !== null && <p role="status" className="text-sm font-bold">{t.wrong}</p>}
      {solved && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-bold">{t.rightAnswer}</p>
          <button type="button" onClick={next} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white">
            {step + 1 === steps.length ? t.finishedTitle : t.nextStep}
          </button>
        </div>
      )}
    </>
  );
}

function PlaySpeak({ prompts, t, onRestart }: { prompts: { prompt: string; model: string }[]; t: DilnaText; onRestart: () => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [shown, setShown] = useState(false);

  if (i === prompts.length) return <Finished t={t} lines={[`${score} ${t.scoreOf} ${prompts.length}`]} onRestart={onRestart} />;
  const p = prompts[i];

  function mark(ok: boolean) {
    if (ok) setScore((x) => x + 1);
    setI((x) => x + 1);
    setShown(false);
  }

  return (
    <>
      <p className="text-sm font-semibold">{i + 1}/{prompts.length}</p>
      <p className="text-sm text-[var(--muted)]">{t.speakHint}</p>
      <p className="text-2xl font-bold">{p.prompt}</p>
      {shown ? (
        p.model ? <p className="rounded-xl bg-[var(--surface)] p-4">{p.model}</p> : null
      ) : (
        <button type="button" onClick={() => setShown(true)} className="btn-secondary w-fit px-4 py-2 font-bold">{t.showAnswer}</button>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => mark(true)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white">{t.markRight}</button>
        <button type="button" onClick={() => mark(false)} className="btn-secondary px-4 py-2 font-bold">{t.markWrong}</button>
      </div>
    </>
  );
}
