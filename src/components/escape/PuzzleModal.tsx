"use client";

import { useState } from "react";
import type { Puzzle } from "@/lib/escape/types";
import type { EscapeText } from "@/i18n/escape";

type UI = EscapeText["ui"];

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");

export function PuzzleModal({
  puzzle,
  layout,
  ui,
  hintsShown,
  onHint,
  onSolved,
  onWrong,
  onClose,
}: {
  puzzle: Puzzle;
  layout: number[];
  ui: UI;
  hintsShown: number;
  onHint: () => void;
  onSolved: () => void;
  onWrong: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [leftPick, setLeftPick] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<Record<number, number>>({});
  const [flash, setFlash] = useState(false);

  function verdict(ok: boolean) {
    if (ok) {
      onSolved();
      return;
    }
    setFlash(true);
    window.setTimeout(() => setFlash(false), 900);
    onWrong();
  }

  function check() {
    if (puzzle.type === "code") {
      verdict(puzzle.answers.some((a) => norm(a) === norm(text)));
    } else if (puzzle.type === "choice") {
      if (choice === null) return;
      verdict(choice === puzzle.correct);
    } else if (puzzle.type === "order") {
      if (sequence.length !== puzzle.items.length) return;
      verdict(sequence.every((itemIndex, position) => itemIndex === position));
    } else {
      if (Object.keys(assigned).length !== puzzle.pairs.length) return;
      verdict(puzzle.pairs.every((_, left) => assigned[left] === left));
    }
  }

  const canCheck =
    puzzle.type === "code"
      ? text.trim().length > 0
      : puzzle.type === "choice"
        ? choice !== null
        : puzzle.type === "order"
          ? sequence.length === puzzle.items.length
          : Object.keys(assigned).length === puzzle.pairs.length;

  const chip =
    "rounded-lg border-2 border-[var(--edge)] px-3 py-2 text-left text-sm font-semibold transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      <div
        className={`card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 ${flash ? "outline outline-4 outline-[var(--danger)]" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {puzzle.title}
          </h2>
          <button onClick={onClose} className="text-sm font-semibold text-[var(--muted)] hover:underline">
            {ui.close}
          </button>
        </div>
        <p className="mb-4 text-sm text-[var(--muted)]">{puzzle.prompt}</p>

        {puzzle.type === "code" && (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canCheck && check()}
            placeholder={puzzle.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border-2 border-[var(--border-soft)] px-3 py-2 text-lg font-bold outline-none focus:border-[var(--brand-500)]"
          />
        )}

        {puzzle.type === "choice" && (
          <div className="grid gap-2">
            {puzzle.options.map((option, i) => (
              <button
                key={option}
                onClick={() => setChoice(i)}
                className={`${chip} ${choice === i ? "bg-[var(--brand-50)] outline outline-2 outline-[var(--brand-500)]" : "bg-[var(--surface)] hover:bg-[var(--surface-muted)]"}`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {puzzle.type === "order" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--faint)]">{ui.orderHint}</p>
            <ol className="flex min-h-12 flex-col gap-1.5">
              {sequence.map((itemIndex, position) => (
                <li key={itemIndex}>
                  <button
                    onClick={() => setSequence((s) => s.filter((x) => x !== itemIndex))}
                    className={`${chip} w-full bg-[var(--brand-50)]`}
                  >
                    {position + 1}. {puzzle.items[itemIndex]}
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              {layout
                .filter((itemIndex) => !sequence.includes(itemIndex))
                .map((itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => setSequence((s) => [...s, itemIndex])}
                    className={`${chip} bg-[var(--surface)] hover:bg-[var(--surface-muted)]`}
                  >
                    {puzzle.items[itemIndex]}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setSequence([])}
              className="self-start text-xs font-semibold text-[var(--muted)] hover:underline"
            >
              {ui.reset}
            </button>
          </div>
        )}

        {puzzle.type === "match" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--faint)]">{ui.matchHint}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                {puzzle.pairs.map(([left], i) => (
                  <button
                    key={left}
                    onClick={() => setLeftPick(i)}
                    className={`${chip} ${leftPick === i ? "bg-[var(--brand-50)] outline outline-2 outline-[var(--brand-500)]" : "bg-[var(--surface)]"}`}
                  >
                    {left}
                    {assigned[i] !== undefined && (
                      <span className="block text-xs font-normal text-[var(--muted)]">
                        → {puzzle.pairs[assigned[i]][1]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {layout.map((rightIndex) => (
                  <button
                    key={rightIndex}
                    onClick={() => {
                      if (leftPick === null) return;
                      setAssigned((a) => ({ ...a, [leftPick]: rightIndex }));
                      setLeftPick(null);
                    }}
                    className={`${chip} bg-[var(--surface)] hover:bg-[var(--surface-muted)]`}
                  >
                    {puzzle.pairs[rightIndex][1]}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setAssigned({});
                setLeftPick(null);
              }}
              className="self-start text-xs font-semibold text-[var(--muted)] hover:underline"
            >
              {ui.reset}
            </button>
          </div>
        )}

        {hintsShown > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5">
            {puzzle.hints.slice(0, hintsShown).map((hint) => (
              <li key={hint} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">
                💡 {hint}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={check}
            disabled={!canCheck}
            className="btn-bouncy bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ui.check}
          </button>
          <button
            onClick={onHint}
            disabled={hintsShown >= 3}
            className="btn-bouncy bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hintsShown === 0 ? ui.hint : hintsShown >= 3 ? ui.noMoreHints : ui.hintNext}
          </button>
          {flash && <span className="text-sm font-semibold text-[var(--danger)]">{ui.wrong}</span>}
        </div>
      </div>
    </div>
  );
}
