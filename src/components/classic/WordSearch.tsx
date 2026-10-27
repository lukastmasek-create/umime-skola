"use client";

import { useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { buildWordSearch, formatTime, toWords } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor } from "./shared";

const COLORS = ["#ffc933", "#8fd0ff", "#ff9ec7", "#7ee0b0", "#c9b8ff", "#ffb07a", "#9be37f", "#7fe3e3"];
type Cell = [number, number];

// Úsečka mezi dvěma políčky, jen když leží na řádku, sloupci nebo úhlopříčce.
function lineCells(a: Cell, b: Cell): Cell[] {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return [a];
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr);
  const sc = Math.sign(dc);
  return Array.from({ length: steps + 1 }, (_, i): Cell => [a[0] + sr * i, a[1] + sc * i]);
}

export function WordSearch({
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
  const puzzle = useMemo(() => {
    const words = toWords(questions, difficulty >= 4 ? 8 : 6);
    return words.length >= 4 ? buildWordSearch(words, difficulty) : null;
  }, [questions, difficulty, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [cur, setCur] = useState<Cell | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const dragging = useRef(false);
  const finished = !!puzzle && found.length === puzzle.placed.length;
  const { seconds, reset } = useTimer(!!puzzle && !finished);

  if (!puzzle || puzzle.placed.length < 4) return <p className="card p-6">{t.noData}</p>;
  const { grid, placed } = puzzle;
  const size = grid.length;

  const foundCells = new Map<string, string>();
  found.forEach((wi, n) => placed[wi].cells.forEach(([r, c]) => foundCells.set(`${r},${c}`, COLORS[n % COLORS.length])));
  const selection = anchor && cur ? lineCells(anchor, cur) : [];
  const selected = new Set(selection.map(([r, c]) => `${r},${c}`));

  function cellAt(x: number, y: number): Cell | null {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-cell]");
    if (!el) return null;
    const [r, c] = (el.dataset.cell ?? "").split(",").map(Number);
    return Number.isFinite(r) && Number.isFinite(c) ? [r, c] : null;
  }

  function commit(a: Cell, b: Cell) {
    const cells = lineCells(a, b);
    const text = cells.map(([r, c]) => grid[r][c]).join("");
    const reversed = [...text].reverse().join("");
    const idx = placed.findIndex((p, i) => !found.includes(i) && (p.word === text || p.word === reversed));
    if (idx >= 0 && cells.length > 1) setFound((f) => [...f, idx]);
    else if (cells.length > 1) setTries((n) => n + 1);
    setAnchor(null);
    setCur(null);
  }

  function down(e: React.PointerEvent) {
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell) return;
    if (anchor && !dragging.current) {
      commit(anchor, cell); // klepnutí na druhý konec
      return;
    }
    dragging.current = true;
    setAnchor(cell);
    setCur(cell);
  }
  function move(e: React.PointerEvent) {
    if (!dragging.current) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (cell) setCur(cell);
  }
  function up() {
    if (!dragging.current) return;
    dragging.current = false;
    if (anchor && cur && (anchor[0] !== cur[0] || anchor[1] !== cur[1])) commit(anchor, cur);
  }

  function restart() {
    setRound((n) => n + 1);
    setFound([]);
    setAnchor(null);
    setCur(null);
    setTries(0);
    reset();
  }

  const meta = t.games.osmismerka;
  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.found, value: `${found.length}/${placed.length}` },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, Math.floor(tries / 2), placed.length)}
          seconds={seconds}
          stats={[{ label: t.found, value: `${placed.length}/${placed.length}` }]}
          results={[]}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
          <div
            className="mx-auto w-full max-w-[34rem] touch-none select-none rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-2"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            style={{ display: "grid", gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gap: 2 }}
          >
            {grid.flatMap((row, r) =>
              row.map((letter, c) => {
                const key = `${r},${c}`;
                const color = foundCells.get(key);
                const isSel = selected.has(key);
                return (
                  <div
                    key={key}
                    data-cell={key}
                    className="flex aspect-square items-center justify-center rounded-md text-sm font-extrabold sm:text-base"
                    style={{
                      background: isSel ? "var(--accent-500)" : (color ?? "transparent"),
                      color: isSel ? "#fff" : color ? "#16132b" : "var(--foreground)",
                      transition: "background 0.12s",
                    }}
                  >
                    {letter}
                  </div>
                );
              }),
            )}
          </div>
          <ol className="flex flex-col gap-2 text-sm">
            {placed.map((p, i) => {
              const n = found.indexOf(i);
              const isFound = n >= 0;
              return (
                <li key={p.word} className="card flex gap-2 p-3" style={isFound ? { borderColor: COLORS[n % COLORS.length] } : undefined}>
                  <span className="font-bold tabular-nums text-[var(--faint)]">{i + 1}.</span>
                  <span className="flex-1">
                    {p.clue} <span className="text-[var(--faint)]">({p.word.length} {t.letters})</span>
                    {isFound && (
                      <span className="ml-2 rounded px-1.5 py-0.5 font-bold" style={{ background: COLORS[n % COLORS.length], color: "#16132b" }}>
                        {p.word}
                      </span>
                    )}
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
