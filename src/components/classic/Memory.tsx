"use client";

import { useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, shuffle, toPairs } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

type Card = { key: string; pair: number; kind: "q" | "a"; text: string };

export function Memory({
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
  const count = difficulty >= 4 ? 8 : 6;
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => toPairs(questions, count), [questions, count, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        pairs.flatMap((p, i) => [
          { key: `q${i}`, pair: i, kind: "q" as const, text: p.prompt },
          { key: `a${i}`, pair: i, kind: "a" as const, text: p.answer },
        ]),
      ),
    [pairs],
  );
  const pairIds = useMemo(() => pairs.map((p) => p.id), [pairs]);

  const [open, setOpenState] = useState<number[]>([]);
  // Zrcadlo v refu: dvě rychlá klepnutí za sebou nesmí vidět starý stav.
  const openRef = useRef<number[]>([]);
  const setOpen = (v: number[]) => {
    openRef.current = v;
    setOpenState(v);
  };
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const locked = useRef(false);
  const total = cards.length / 2;
  const mistakes = missed.size;
  const finished = total > 0 && matched.size === total;
  const { seconds, reset } = useTimer(!finished && total > 0);

  if (total < 4) return <p className="card p-6">{t.noData}</p>;

  function flip(i: number) {
    const current = openRef.current;
    if (locked.current || current.includes(i) || matched.has(cards[i].pair) || current.length >= 2) return;
    const next = [...current, i];
    setOpen(next);
    if (next.length < 2) return;
    const [a, b] = next;
    locked.current = true;
    setMoves((m) => m + 1);
    if (cards[a].pair === cards[b].pair) {
      window.setTimeout(() => {
        setMatched((m) => new Set(m).add(cards[a].pair));
        setOpen([]);
        locked.current = false;
      }, 450);
      return;
    }
    // Pár, který už jsme viděli a zase netrefili, se počítá jako chyba (jedna za pár, ne za tah).
    const nowSeen = new Set(seen);
    const nowMissed = new Set(missed);
    for (const idx of next) {
      const p = cards[idx].pair;
      if (nowSeen.has(p)) nowMissed.add(p);
      nowSeen.add(p);
    }
    setSeen(nowSeen);
    setMissed(nowMissed);
    window.setTimeout(() => {
      setOpen([]);
      locked.current = false;
    }, 1000);
  }

  function restart() {
    setRound((n) => n + 1);
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setSeen(new Set());
    setMissed(new Set());
    locked.current = false;
    reset();
  }

  const results: AnswerResult[] = pairIds.flatMap((id, i) => (id ? [{ id, correct: !missed.has(i) }] : []));
  const meta = t.games.pexeso;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.found, value: `${matched.size}/${total}` },
        { label: t.moves, value: String(moves) },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, mistakes, total)}
          seconds={seconds}
          stats={[
            { label: t.moves, value: String(moves) },
            { label: t.mistakes, value: String(mistakes) },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          {cards.map((c, i) => {
            const faceUp = open.includes(i) || matched.has(c.pair);
            const isMatched = matched.has(c.pair);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => flip(i)}
                aria-label={faceUp ? c.text : "?"}
                className={`relative flex min-h-24 items-center justify-center rounded-xl border-2 p-2 text-center text-xs font-semibold leading-snug transition-transform duration-200 sm:min-h-28 sm:text-sm ${
                  isMatched
                    ? "border-[#2ea36b] bg-[#7ee0b0]/25 text-[var(--foreground)]"
                    : faceUp
                      ? `border-[var(--accent-500)] ${c.kind === "q" ? "bg-[#8fd0ff]/25" : "bg-[#ffc933]/25"} text-[var(--foreground)]`
                      : "border-[var(--edge)] bg-[linear-gradient(135deg,var(--accent-500),#7c6cff)] text-3xl text-white hover:-translate-y-0.5"
                }`}
              >
                {faceUp ? c.text : "?"}
              </button>
            );
          })}
        </div>
      )}
    </GameFrame>
  );
}
