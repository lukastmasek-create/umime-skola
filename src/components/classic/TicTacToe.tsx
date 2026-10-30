"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import type { GameQuestion } from "@/i18n/game";
import { shuffle, shuffleQuestion, type Shuffled } from "@/lib/classic-games";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

type Mark = "X" | "O" | null;
type Phase = "pick" | "question" | "bot" | "over";

// Velikost pole a kolik v řadě vyhrává podle obtížnosti; `slip` je šance, že počítač zahraje náhodně.
const BOARDS = [
  { size: 3, win: 3, slip: 0.45 },
  { size: 3, win: 3, slip: 0.25 },
  { size: 5, win: 4, slip: 0.15 },
  { size: 5, win: 4, slip: 0.05 },
  { size: 7, win: 5, slip: 0 },
];
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

function lineAt(board: Mark[], size: number, win: number, idx: number): number[] | null {
  const who = board[idx];
  if (!who) return null;
  const r = Math.floor(idx / size);
  const c = idx % size;
  for (const [dr, dc] of DIRS) {
    const cells = [idx];
    for (const s of [1, -1]) {
      let rr = r + dr * s;
      let cc = c + dc * s;
      while (rr >= 0 && cc >= 0 && rr < size && cc < size && board[rr * size + cc] === who) {
        cells.push(rr * size + cc);
        rr += dr * s;
        cc += dc * s;
      }
    }
    if (cells.length >= win) return cells;
  }
  return null;
}

// Tah počítače: vyhrát, zablokovat, jinak políčko s nejlepším potenciálem řad (vlastních i soupeřových).
function botMove(board: Mark[], size: number, win: number, slip: number): number {
  const empty = board.map((m, i) => (m ? -1 : i)).filter((i) => i >= 0);
  if (Math.random() < slip) return empty[Math.floor(Math.random() * empty.length)];
  for (const who of ["O", "X"] as const) {
    for (const i of empty) {
      const b = [...board];
      b[i] = who;
      if (lineAt(b, size, win, i)) return i;
    }
  }
  let best = empty[0];
  let bestScore = -Infinity;
  for (const i of empty) {
    const r = Math.floor(i / size);
    const c = i % size;
    let score = -Math.hypot(r - (size - 1) / 2, c - (size - 1) / 2) * 0.3 + Math.random() * 0.2;
    for (const who of ["O", "X"] as const) {
      for (const [dr, dc] of DIRS) {
        let run = 0;
        let open = 0;
        for (const s of [1, -1]) {
          let rr = r + dr * s;
          let cc = c + dc * s;
          while (rr >= 0 && cc >= 0 && rr < size && cc < size && board[rr * size + cc] === who) {
            run++;
            rr += dr * s;
            cc += dc * s;
          }
          if (rr >= 0 && cc >= 0 && rr < size && cc < size && !board[rr * size + cc]) open++;
        }
        const w = run * run * (open + 1);
        score += who === "O" ? w * 1.1 : w;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

// Kvízové piškvorky proti počítači: políčko patří hráči jen za správnou odpověď, špatná odpověď tah ztratí.
export function TicTacToe({
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
  const cfg = BOARDS[Math.min(5, Math.max(1, difficulty)) - 1];
  const { size, win } = cfg;
  const [round, setRound] = useState(0);
  const deck = useMemo<Shuffled[]>(() => [...shuffle(questions), ...shuffle(questions), ...shuffle(questions)].map(shuffleQuestion), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [board, setBoard] = useState<Mark[]>(() => Array(size * size).fill(null));
  const [phase, setPhase] = useState<Phase>("pick");
  const [cell, setCell] = useState<number | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[]>([]);
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [score, setScore] = useState({ you: 0, bot: 0 });
  const timer = useTimer(phase !== "over");
  const boardRef = useRef(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const q = deck[qi % Math.max(1, deck.length)];

  function settle(next: Mark[], idx: number): boolean {
    const line = lineAt(next, size, win, idx);
    if (line) {
      setWinLine(line);
      setWinner(next[idx] as "X" | "O");
      setScore((s) => (next[idx] === "X" ? { ...s, you: s.you + 1 } : { ...s, bot: s.bot + 1 }));
      setPhase("over");
      return true;
    }
    if (next.every(Boolean)) {
      setWinner("draw");
      setPhase("over");
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (phase !== "bot") return;
    const id = window.setTimeout(() => {
      const b = boardRef.current;
      const i = botMove(b, size, win, cfg.slip);
      const next = [...b];
      next[i] = "O";
      setBoard(next);
      if (!settle(next, i)) setPhase("pick");
    }, 700);
    return () => window.clearTimeout(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (deck.length < 8) return <p className="card p-6">{t.noData}</p>;

  function choose(i: number) {
    if (phase !== "pick" || board[i]) return;
    setCell(i);
    setPicked(null);
    setNote(null);
    setPhase("question");
  }

  function answer(i: number) {
    if (phase !== "question" || cell === null || picked !== null) return;
    setPicked(i);
    const ok = i === q.correct;
    if (q.id) setResults((r) => [...r, { id: q.id as string, correct: ok }]);
    setNote(ok ? t.ttt.won : t.ttt.lost);
    window.setTimeout(
      () => {
        setQi((n) => n + 1);
        setPicked(null);
        if (ok) {
          const next = [...boardRef.current];
          next[cell] = "X";
          setBoard(next);
          setCell(null);
          if (settle(next, cell)) return;
        } else setCell(null);
        setPhase("bot");
      },
      ok ? 700 : 2200,
    );
  }

  function restart() {
    setRound((n) => n + 1);
    setQi(0);
    setResults([]);
    timer.reset();
    setBoard(Array(size * size).fill(null));
    setWinLine([]);
    setWinner(null);
    setNote(null);
    setCell(null);
    setPhase("pick");
  }

  const meta = t.games.piskvorky;
  const wrongCount = results.filter((r) => !r.correct).length;
  const px = size === 3 ? 96 : size === 5 ? 64 : 48;
  const won = winner === "X";

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.ttt.you, value: `❌ ${score.you}` },
        { label: t.ttt.bot, value: `⭕ ${score.bot}` },
        { label: t.ttt.inRow.replace("{n}", String(win)), value: `${size}×${size}` },
      ]}
    >
      {phase === "over" && (
        <FinishCard
          t={t}
          xp={xpFor(won ? 20 + size * 2 : winner === "draw" ? 12 : 6, wrongCount, Math.max(1, results.length))}
          seconds={timer.seconds}
          stats={[{ label: t.quiz.correctN, value: `${results.length - wrongCount}/${results.length}` }]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        >
          <p className="text-xl font-bold">{winner === "X" ? t.ttt.win : winner === "O" ? t.ttt.lose : t.ttt.draw}</p>
        </FinishCard>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[auto_1fr]">
        <div className="card self-start p-3">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${size}, ${px}px)` }}>
            {board.map((m, i) => {
              const hot = winLine.includes(i);
              const chosen = cell === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={phase !== "pick" || !!m}
                  aria-label={`${Math.floor(i / size) + 1}/${(i % size) + 1}`}
                  className={`ttt-cell flex items-center justify-center rounded-xl border-2 font-extrabold transition ${!m && phase === "pick" ? "hover:-translate-y-0.5 hover:border-[var(--brand-500)]" : ""}`}
                  style={{
                    height: px,
                    fontSize: px * 0.55,
                    borderColor: chosen ? "var(--brand-500)" : hot ? "#ffb020" : "var(--edge)",
                    background: hot ? "rgba(255,176,32,0.3)" : chosen ? "var(--brand-50)" : "var(--surface-muted)",
                    color: m === "X" ? "#7c6cff" : "#ff5d73",
                  }}
                >
                  {m === "X" ? "✕" : m === "O" ? "◯" : chosen ? "?" : ""}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-[var(--surface-muted)] px-4 py-3 font-bold">
            {phase === "pick" ? `👆 ${t.ttt.pick}` : phase === "question" ? `❓ ${t.ttt.answer}` : phase === "bot" ? `🤖 ${t.ttt.botTurn}` : winner === "X" ? t.ttt.win : winner === "O" ? t.ttt.lose : t.ttt.draw}
          </p>
          {phase === "question" && q && (
            <div className="card p-5">
              <QuestionCard q={q} picked={picked} onPick={answer} />
              {note && (
                <p className={`mt-3 text-sm font-semibold ${picked === q.correct ? "text-[#2ea36b]" : "text-[#ff5d73]"}`}>
                  {note}
                  {picked !== q.correct && q.explanation ? ` ${q.explanation}` : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </GameFrame>
  );
}
