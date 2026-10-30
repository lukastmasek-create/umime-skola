"use client";

import { useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import type { GameQuestion } from "@/i18n/game";
import { shuffle, toPairs, type Pair } from "@/lib/classic-games";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const SIZES = [3, 3, 4, 4, 5];
const LIVES = 3;

type Cell = { pair: Pair; state: "open" | "hit" | "missed" };

function buildCard(questions: GameQuestion[], difficulty: number): Cell[] {
  const pairs = toPairs(questions, 25).filter((p) => p.answer.length <= 24);
  let size = SIZES[Math.min(5, Math.max(1, difficulty)) - 1];
  while (size > 3 && pairs.length < size * size) size--;
  return pairs.length >= size * size ? pairs.slice(0, size * size).map((pair) => ({ pair, state: "open" })) : [];
}

function lines(size: number): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < size; i++) {
    out.push(Array.from({ length: size }, (_, k) => i * size + k));
    out.push(Array.from({ length: size }, (_, k) => k * size + i));
  }
  out.push(Array.from({ length: size }, (_, k) => k * size + k));
  out.push(Array.from({ length: size }, (_, k) => k * size + (size - 1 - k)));
  return out;
}

// Bingo: na kartě jsou odpovědi, hráč k vylosované otázce najde tu správnou. Řada, sloupec nebo
// úhlopříčka = BINGO. Tři chyby hru ukončí, plná karta je vítězství.
export function Bingo({
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
  const [cells, setCells] = useState<Cell[]>(() => buildCard(questions, difficulty));
  // Velikost karty se odvodí z počtu políček (při málu krátkých odpovědí je karta menší).
  const size = Math.round(Math.sqrt(cells.length));
  const [order, setOrder] = useState<number[]>(() => shuffle(cells.map((_, i) => i)));
  const [turn, setTurn] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [flash, setFlash] = useState<{ idx: number; ok: boolean } | null>(null);
  const [reveal, setReveal] = useState<number | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [bingoPop, setBingoPop] = useState(0);
  const [busy, setBusy] = useState(false);

  const all = lines(size);
  const done = lives <= 0 || turn >= order.length;
  const timer = useTimer(!done);
  const doneLines = all.filter((l) => l.every((i) => cells[i]?.state === "hit"));
  const current = cells[order[turn]];

  if (cells.length < 9) return <p className="card p-6">{t.noData}</p>;

  function pick(idx: number) {
    if (done || busy || cells[idx].state !== "open") return;
    const target = order[turn];
    const ok = idx === target;
    const id = cells[target].pair.id;
    if (id) setResults((r) => [...r, { id, correct: ok }]);
    setFlash({ idx, ok });
    setBusy(true);
    if (!ok) {
      setLives((n) => n - 1);
      setReveal(target);
    }
    const before = all.filter((l) => l.every((i) => cells[i].state === "hit")).length;
    const next = cells.map((c, i) => (i === target ? { ...c, state: ok ? ("hit" as const) : ("missed" as const) } : c));
    const after = all.filter((l) => l.every((i) => next[i].state === "hit")).length;
    window.setTimeout(
      () => {
        setCells(next);
        if (after > before) setBingoPop((n) => n + 1);
        setFlash(null);
        setReveal(null);
        setTurn((n) => n + 1);
        setBusy(false);
      },
      ok ? 450 : 1800,
    );
  }

  function restart() {
    const nextCells = buildCard(questions, difficulty);
    setCells(nextCells);
    setOrder(shuffle(nextCells.map((_, i) => i)));
    setTurn(0);
    setLives(LIVES);
    setResults([]);
    setBingoPop(0);
    setFlash(null);
    setReveal(null);
    setBusy(false);
    timer.reset();
  }

  const meta = t.games.bingo;
  const hits = cells.filter((c) => c.state === "hit").length;
  const wrong = results.filter((r) => !r.correct).length;
  const full = hits === cells.length;
  const px = size === 3 ? 150 : size === 4 ? 124 : 104;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.bingo.lives, value: "❤️".repeat(Math.max(0, lives)) || "💀" },
        { label: t.bingo.lines, value: String(doneLines.length) },
        { label: t.quiz.correctN, value: `${hits}/${cells.length}` },
      ]}
    >
      {done && (
        <FinishCard
          t={t}
          xp={xpFor(8 + hits * 2 + doneLines.length * 5, wrong, cells.length)}
          seconds={timer.seconds}
          stats={[
            { label: t.bingo.lines, value: String(doneLines.length) },
            { label: t.mistakes, value: String(wrong) },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        >
          {full && <p className="text-xl font-bold">{t.bingo.full}</p>}
        </FinishCard>
      )}
      {!done && current && (
        <div className="card flex flex-col gap-1 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--faint)]">{t.bingo.find}</p>
          <p className="text-lg font-bold sm:text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            {current.pair.prompt}
          </p>
          {reveal !== null && (
            <p className="mt-1 text-sm font-semibold text-[#ff5d73]">
              {t.bingo.wrong} ✓ {cells[reveal].pair.answer}
              {cells[reveal].pair.explanation ? ` · ${cells[reveal].pair.explanation}` : ""}
            </p>
          )}
        </div>
      )}
      <div className="relative self-center">
        {bingoPop > 0 && !done && (
          <span key={bingoPop} className="bingo-pop pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-5xl font-black text-[#ffb020] drop-shadow-lg">
            {t.bingo.bingo}
          </span>
        )}
        <div className="card grid gap-2 p-3" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, ${px}px))` }}>
          {cells.map((c, i) => {
            const inLine = doneLines.some((l) => l.includes(i));
            const f = flash?.idx === i ? flash : null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={done || c.state !== "open"}
                className="flex aspect-square items-center justify-center rounded-2xl border-2 p-2 text-center text-sm font-bold leading-tight transition hover:-translate-y-0.5 sm:text-base"
                style={{
                  borderColor: f ? (f.ok ? "#2ea36b" : "#ff5d73") : reveal === i ? "#2ea36b" : inLine ? "#ffb020" : "var(--edge)",
                  background:
                    c.state === "hit"
                      ? inLine
                        ? "rgba(255,176,32,0.35)"
                        : "rgba(126,224,176,0.35)"
                      : c.state === "missed"
                        ? "rgba(255,93,115,0.12)"
                        : f && !f.ok
                          ? "rgba(255,93,115,0.25)"
                          : "var(--surface-muted)",
                  opacity: c.state === "missed" ? 0.55 : 1,
                }}
              >
                <span className="relative">
                  {c.pair.answer}
                  {c.state === "hit" && <span className="absolute -right-3 -top-3 text-lg">✅</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
