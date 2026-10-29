"use client";

import { useMemo, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, shuffle, shuffleQuestion } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

type Tile = { kind: "coin" | "chest" | "skull"; value: number };

const COLS = 5;
const ROWS = 4;
const TURNS = 10;
const LIVES = 3;

function makeBoard(skulls: number): Tile[] {
  const tiles: Tile[] = [
    ...Array.from({ length: 3 }, (): Tile => ({ kind: "chest", value: 50 })),
    ...Array.from({ length: skulls }, (): Tile => ({ kind: "skull", value: 0 })),
  ];
  while (tiles.length < COLS * ROWS) tiles.push({ kind: "coin", value: 5 + Math.floor(Math.random() * 3) * 5 });
  return shuffle(tiles);
}

const ICON = { coin: "🪙", chest: "🧰", skull: "💀" } as const;

export function Treasure({
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
  const [round, setRound] = useState(0);
  const deck = useMemo(() => shuffle(questions).slice(0, TURNS).map(shuffleQuestion), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const board = useMemo(() => makeBoard(difficulty >= 4 ? 5 : difficulty === 3 ? 4 : 3), [difficulty, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [turn, setTurn] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<"question" | "dig">("question");
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [lives, setLives] = useState(LIVES);
  const [gold, setGold] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [wrongs, setWrongs] = useState(0);

  const q = deck[turn];
  const over = lives <= 0 || turn >= deck.length;
  const { seconds, reset } = useTimer(deck.length >= 6 && !over);

  if (deck.length < 6) return <p className="card p-6">{t.noData}</p>;

  function answer(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.correct;
    if (q.id) setResults((r) => [...r, { id: q.id as string, correct: ok }]);
    window.setTimeout(() => {
      setPicked(null);
      if (ok) {
        setPhase("dig");
        setMsg(t.quiz.pickTile);
      } else {
        setWrongs((n) => n + 1);
        setLives((l) => l - 1);
        setMsg(`${t.quiz.wrongAnswer} · ${t.quiz.correctWas}: ${q.options[q.correct]}`);
        setTurn((n) => n + 1);
      }
    }, 1000);
  }

  function dig(k: number) {
    if (phase !== "dig" || opened.has(k)) return;
    const tile = board[k];
    setOpened((o) => new Set(o).add(k));
    if (tile.kind === "skull") {
      setLives((l) => l - 1);
      setMsg(`💀 ${t.treasure.skull}! −1`);
    } else {
      setGold((g) => g + tile.value);
      setMsg(`${ICON[tile.kind]} +${tile.value}`);
    }
    setPhase("question");
    setTurn((n) => n + 1);
  }

  function restart() {
    setRound((n) => n + 1);
    setTurn(0);
    setPicked(null);
    setPhase("question");
    setOpened(new Set());
    setLives(LIVES);
    setGold(0);
    setMsg(null);
    setResults([]);
    setWrongs(0);
    reset();
  }

  const meta = t.games.poklad;
  const chestsFound = [...opened].filter((k) => board[k].kind === "chest").length;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.treasure.gold, value: String(gold) },
        { label: t.treasure.lives, value: "❤️".repeat(Math.max(0, lives)) || "—" },
        { label: t.treasure.question, value: `${Math.min(turn + 1, deck.length)}/${deck.length}` },
      ]}
    >
      {over ? (
        <FinishCard
          t={t}
          xp={xpFor(Math.min(35, 8 + Math.round(gold / 6)), wrongs, deck.length)}
          seconds={seconds}
          stats={[
            { label: t.treasure.gold, value: String(gold) },
            { label: t.treasure.chest, value: `${chestsFound}/3` },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="card flex flex-col gap-4 p-5">
            {phase === "question" && q ? (
              <QuestionCard q={q} picked={picked} onPick={answer} />
            ) : (
              <p className="text-lg font-bold">⛏️ {t.quiz.pickTile}</p>
            )}
            {msg && (
              <p className="text-sm font-semibold text-[var(--muted)]" aria-live="polite">
                {msg}
              </p>
            )}
          </div>
          <div
            className="mx-auto grid w-full max-w-xs gap-1.5 rounded-2xl border-2 border-[var(--edge)] p-2"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, background: "linear-gradient(180deg,#f4d98b,#e0b865)" }}
          >
            {board.map((tile, k) => {
              const isOpen = opened.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={phase !== "dig" || isOpen}
                  onClick={() => dig(k)}
                  aria-label={isOpen ? t.treasure[tile.kind === "coin" ? "coin" : tile.kind] : "?"}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 text-xl transition"
                  style={{
                    borderColor: phase === "dig" && !isOpen ? "var(--accent-500)" : "rgba(0,0,0,0.25)",
                    background: isOpen ? "rgba(255,255,255,0.65)" : "linear-gradient(135deg,#8b5a2b,#6e4520)",
                    transform: phase === "dig" && !isOpen ? undefined : undefined,
                    cursor: phase === "dig" && !isOpen ? "pointer" : "default",
                  }}
                >
                  {isOpen ? ICON[tile.kind] : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameFrame>
  );
}
