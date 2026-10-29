"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, stripDiacritics, toScrambles } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const ROUNDS = 6;
const base = (ch: string) => stripDiacritics(ch).toLocaleUpperCase("cs");

export function Scramble({ t, questions, backHref }: { t: ClassicText; questions: GameQuestion[]; backHref: string }) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => toScrambles(questions, ROUNDS), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [index, setIndex] = useState(0);
  const [placed, setPlacedState] = useState<number[]>([]); // indexy použitých písmen v pořadí
  // Zrcadlo v refu: rychlé psaní nesmí vidět starý stav.
  const placedRef = useRef<number[]>([]);
  const setPlaced = useCallback((v: number[] | ((p: number[]) => number[])) => {
    const next = typeof v === "function" ? v(placedRef.current) : v;
    placedRef.current = next;
    setPlacedState(next);
  }, []);
  const [state, setState] = useState<"playing" | "wrong" | "right" | "revealed">("playing");
  const [wrongCount, setWrongCount] = useState(0);
  const [hints, setHints] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [mistakes, setMistakes] = useState(0);

  const item = items[index];
  const finished = items.length > 0 && index >= items.length;
  const { seconds, reset } = useTimer(items.length > 0 && !finished);

  const advance = useCallback(
    (ok: boolean) => {
      if (!item) return;
      if (item.id) setResults((r) => [...r, { id: item.id as string, correct: ok && wrongCount === 0 && hints === 0 }]);
      setIndex((i) => i + 1);
      setPlaced([]);
      setState("playing");
      setWrongCount(0);
      setHints(0);
    },
    [item, wrongCount, hints, setPlaced],
  );

  const place = useCallback(
    (tile: number) => {
      const current = placedRef.current;
      if (!item || state !== "playing" || current.includes(tile)) return;
      const next = [...current, tile];
      setPlaced(next);
      if (next.length === item.word.length) {
        const guess = next.map((k) => item.letters[k]).join("");
        // Písmena s háčky a čárkami se při shodě základního znaku tolerují (na klávesnici se čárka špatně hádá).
        if (stripDiacritics(guess) === stripDiacritics(item.word)) {
          setState("right");
          window.setTimeout(() => advance(true), 900);
        } else {
          setState("wrong");
          setWrongCount((n) => n + 1);
          setMistakes((n) => n + 1);
          window.setTimeout(() => {
            setPlaced([]);
            setState("playing");
          }, 700);
        }
      }
    },
    [item, state, advance, setPlaced],
  );

  // Psaní na klávesnici: vezme první volné písmeno stejného znaku (diakritiku nerozlišuje); Backspace vrací.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!item || state !== "playing" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        setPlaced((p) => p.slice(0, -1));
        return;
      }
      const k = base(e.key);
      if (k.length !== 1 || !/[A-Z]/.test(k)) return;
      const tile = item.letters.findIndex((l, i) => !placedRef.current.includes(i) && base(l) === k);
      if (tile >= 0) place(tile);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, state, place, setPlaced]);

  if (items.length < 3) return <p className="card p-6">{t.noData}</p>;

  function hint() {
    if (!item || state !== "playing") return;
    // Vrátí všechno a doplní další správné písmeno na jeho místo.
    const correctSoFar = placed.filter((tile, k) => item.letters[tile] === item.word[k]);
    const keep = correctSoFar.length === placed.length ? placed : [];
    const need = item.word[keep.length];
    const tile = item.letters.findIndex((l, i) => !keep.includes(i) && l === need);
    if (tile < 0) return;
    setHints((n) => n + 1);
    const next = [...keep, tile];
    setPlaced(next);
    if (next.length === item.word.length) {
      setState("right");
      window.setTimeout(() => advance(true), 900);
    }
  }

  function giveUp() {
    if (!item) return;
    setState("revealed");
    setMistakes((n) => n + 1);
  }

  function restart() {
    setRound((n) => n + 1);
    setIndex(0);
    setPlaced([]);
    setState("playing");
    setWrongCount(0);
    setHints(0);
    setResults([]);
    setMistakes(0);
    reset();
  }

  const meta = t.games.presmycky;
  const slotColor = state === "right" ? "#2ea36b" : state === "wrong" ? "#ff5d73" : "var(--edge)";

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.round, value: `${Math.min(index + 1, items.length)}/${items.length}` },
        { label: t.mistakes, value: String(mistakes) },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, mistakes + results.filter((r) => !r.correct).length, items.length * 2)}
          seconds={seconds}
          stats={[
            { label: t.solved, value: `${results.filter((r) => r.correct).length}/${items.length}` },
            { label: t.mistakes, value: String(mistakes) },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="card flex flex-col items-center gap-6 p-6">
          <p className="text-center text-lg font-semibold">{item.clue}</p>
          <div className="flex flex-wrap justify-center gap-2" aria-label={t.scramble.placeholder}>
            {[...item.word].map((_, k) => {
              const tile = placed[k];
              const shown = state === "revealed" || state === "right" ? item.word[k] : tile !== undefined ? item.letters[tile] : "";
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => state === "playing" && tile !== undefined && setPlaced((p) => p.filter((_, i) => i !== k))}
                  className="flex h-12 w-10 items-center justify-center rounded-lg border-2 text-2xl font-extrabold transition sm:h-14 sm:w-12"
                  style={{ borderColor: slotColor, background: shown ? "var(--surface-muted)" : "transparent" }}
                  aria-label={shown || "_"}
                >
                  {shown}
                </button>
              );
            })}
          </div>
          {state === "revealed" ? (
            <div className="flex flex-col items-center gap-3 text-center text-sm">
              <p className="font-bold">
                {t.scramble.revealed}: {item.word}
              </p>
              <p className="text-[var(--muted)]">{item.explanation}</p>
              <button type="button" onClick={() => advance(false)} className="btn-bouncy btn-primary px-5 py-2.5">
                {index + 1 >= items.length ? t.finish : t.nextRound}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-2">
                {item.letters.map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={placed.includes(i) || state !== "playing"}
                    onClick={() => place(i)}
                    className="flex h-12 w-10 items-center justify-center rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] text-2xl font-extrabold transition hover:-translate-y-0.5 disabled:opacity-20 sm:h-14 sm:w-12"
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setPlaced([])} disabled={placed.length === 0 || state !== "playing"} className="btn-bouncy btn-secondary px-4 py-2 text-sm">
                  {t.scramble.clear}
                </button>
                <button type="button" onClick={hint} disabled={state !== "playing"} className="btn-bouncy btn-secondary px-4 py-2 text-sm">
                  💡 {t.scramble.hint}
                </button>
                <button type="button" onClick={giveUp} disabled={state !== "playing"} className="btn-bouncy btn-secondary px-4 py-2 text-sm">
                  🏳️ {t.showAnswer}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </GameFrame>
  );
}
