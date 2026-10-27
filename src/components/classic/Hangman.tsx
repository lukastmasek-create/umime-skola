"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, stripDiacritics, toHangman } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const ROUNDS = 5;
const MAX_WRONG = 6;
const ALPHABET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

const base = (ch: string) => stripDiacritics(ch).toLocaleUpperCase("cs");
const isLetter = (ch: string) => /\p{L}/u.test(ch);

function Gallows({ wrong }: { wrong: number }) {
  const part = "stroke-[var(--foreground)]";
  return (
    <svg viewBox="0 0 120 130" className="h-40 w-36 shrink-0" fill="none" strokeWidth="4" strokeLinecap="round" aria-hidden>
      <path d="M10 124H70M30 124V12H85V28" className="stroke-[var(--faint)]" />
      {wrong > 0 && <circle cx="85" cy="40" r="12" className={part} />}
      {wrong > 1 && <path d="M85 52V84" className={part} />}
      {wrong > 2 && <path d="M85 60L68 74" className={part} />}
      {wrong > 3 && <path d="M85 60L102 74" className={part} />}
      {wrong > 4 && <path d="M85 84L70 108" className={part} />}
      {wrong > 5 && <path d="M85 84L100 108" className={part} />}
    </svg>
  );
}

export function Hangman({ t, questions, backHref }: { t: ClassicText; questions: GameQuestion[]; backHref: string }) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => toHangman(questions, ROUNDS), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [index, setIndex] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [totalWrong, setTotalWrong] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [over, setOver] = useState(false);

  const item = items[index];
  const answerLetters = item ? [...item.answer] : [];
  const wrongLetters = item ? [...guessed].filter((g) => !answerLetters.some((ch) => base(ch) === g)) : [];
  const wrong = wrongLetters.length;
  const won = !!item && answerLetters.every((ch) => !isLetter(ch) || guessed.has(base(ch)));
  const lost = wrong >= MAX_WRONG;
  const roundDone = won || lost;
  const finished = over;
  const { seconds, reset } = useTimer(items.length > 0 && !finished);

  const guess = useCallback(
    (letter: string) => {
      if (!item || roundDone || guessed.has(letter)) return;
      const next = new Set(guessed).add(letter);
      setGuessed(next);
      const wrongNow = [...next].filter((g) => !answerLetters.some((ch) => base(ch) === g)).length;
      const solvedNow = answerLetters.every((ch) => !isLetter(ch) || next.has(base(ch)));
      if (solvedNow || wrongNow >= MAX_WRONG) {
        setTotalWrong((n) => n + wrongNow);
        if (solvedNow) setSolvedCount((n) => n + 1);
        if (item.id) setResults((r) => [...r, { id: item.id as string, correct: solvedNow }]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item, roundDone, guessed],
  );

  // Fyzická klávesnice (písmena s diakritikou se berou jako základní písmeno).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = base(e.key);
      if (k.length === 1 && ALPHABET.includes(k)) guess(k);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guess]);

  if (items.length < 3) return <p className="card p-6">{t.noData}</p>;

  function next() {
    if (index + 1 >= items.length) {
      setOver(true);
      return;
    }
    setIndex((i) => i + 1);
    setGuessed(new Set());
  }

  function restart() {
    setRound((n) => n + 1);
    setIndex(0);
    setGuessed(new Set());
    setResults([]);
    setTotalWrong(0);
    setSolvedCount(0);
    setOver(false);
    reset();
  }

  const meta = t.games.sibenice;
  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.round, value: `${Math.min(index + 1, items.length)}/${items.length}` },
        { label: t.solved, value: String(solvedCount) },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, totalWrong, items.length * 3)}
          seconds={seconds}
          stats={[
            { label: t.solved, value: `${solvedCount}/${items.length}` },
            { label: t.mistakes, value: String(totalWrong) },
          ]}
          results={results}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="card flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Gallows wrong={wrong} />
            <div className="flex w-full flex-col gap-4">
              <p className="text-lg font-semibold">{item.prompt}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-3" aria-label={roundDone ? item.answer : undefined}>
                {item.answer.split(" ").map((word, wi) => (
                  <span key={wi} className="flex gap-1.5">
                    {[...word].map((ch, ci) => {
                      const shown = !isLetter(ch) || guessed.has(base(ch)) || roundDone;
                      const missedLetter = roundDone && isLetter(ch) && !guessed.has(base(ch));
                      return (
                        <span
                          key={ci}
                          className={`flex h-10 w-8 items-end justify-center border-b-4 pb-0.5 text-2xl font-extrabold sm:h-12 sm:w-9 ${
                            missedLetter ? "border-[#ff5d73] text-[#ff5d73]" : "border-[var(--foreground)]"
                          }`}
                        >
                          {shown ? ch.toLocaleUpperCase("cs") : ""}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--muted)]">
                {t.triesLeft}: <span className="font-bold tabular-nums">{MAX_WRONG - wrong}</span>
                {wrongLetters.length > 0 && <span className="ml-3 text-[#ff5d73]">{wrongLetters.join(" ")}</span>}
              </p>
            </div>
          </div>

          {roundDone ? (
            <div className="flex flex-col items-start gap-3 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              <p className="font-bold">
                {won ? `✓ ${t.rightAnswer}` : `✗ ${t.gameOver}`} — {item.answer}
              </p>
              <p className="text-[var(--muted)]">{item.explanation}</p>
              <button type="button" onClick={next} className="btn-bouncy btn-primary">
                {index + 1 >= items.length ? t.finish : t.nextRound}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-1.5">
              {ALPHABET.map((l) => {
                const used = guessed.has(l);
                const hit = used && answerLetters.some((ch) => base(ch) === l);
                return (
                  <button
                    key={l}
                    type="button"
                    disabled={used}
                    onClick={() => guess(l)}
                    className={`h-10 w-9 rounded-lg border-2 text-sm font-bold transition ${
                      used
                        ? hit
                          ? "border-[#2ea36b] bg-[#7ee0b0]/30 opacity-70"
                          : "border-[#ff5d73] bg-[#ff5d73]/15 opacity-60"
                        : "border-[var(--edge)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--accent-500)]"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </GameFrame>
  );
}
