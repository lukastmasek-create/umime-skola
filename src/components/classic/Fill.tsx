"use client";

import { useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, normalizeAnswer, shuffle, toGaps, type Gap } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const ROWS = 6;
const MAX_TRIES = 2;

type RowState = { done: boolean; ok: boolean; wrong: number; value: string; revealed: boolean };
const fresh = (): RowState => ({ done: false, ok: false, wrong: 0, value: "", revealed: false });

export function Fill({
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
  const typing = difficulty >= 3;
  const [round, setRound] = useState(0);
  const data = useMemo(() => {
    const { gaps, extras } = toGaps(questions, ROWS, typing ? 26 : 34);
    return { gaps, bank: shuffle([...gaps.map((g) => g.answer), ...(typing ? [] : extras)]) };
  }, [questions, typing, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const { gaps, bank } = data;

  const [rows, setRows] = useState<RowState[]>(() => gaps.map(fresh));
  const [rowsFor, setRowsFor] = useState(gaps);
  if (rowsFor !== gaps) {
    // nová hra: stav se přepočítá hned při vykreslení, ne v efektu
    setRowsFor(gaps);
    setRows(gaps.map(fresh));
  }
  const [chip, setChip] = useState<number | null>(null);
  const [usedChips, setUsedChips] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState<number | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const finished = gaps.length > 0 && rows.length === gaps.length && rows.every((r) => r.done);
  const { seconds, reset } = useTimer(gaps.length > 0 && !finished);
  const mistakes = rows.reduce((n, r) => n + r.wrong, 0);

  if (gaps.length < 4) return <p className="card p-6">{t.noData}</p>;

  function mark(i: number, patch: Partial<RowState>) {
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  }

  function fail(i: number, wrongNow: number) {
    setFlash(i);
    window.setTimeout(() => setFlash((f) => (f === i ? null : f)), 500);
    if (typing && wrongNow >= MAX_TRIES) mark(i, { wrong: wrongNow, done: true, ok: false, revealed: true });
    else mark(i, { wrong: wrongNow });
  }

  function tryChip(i: number, chipIndex: number) {
    if (rows[i].done) return;
    if (normalizeAnswer(bank[chipIndex]) === normalizeAnswer(gaps[i].answer)) {
      mark(i, { done: true, ok: true, value: bank[chipIndex] });
      setUsedChips((u) => new Set(u).add(chipIndex));
      setChip(null);
    } else {
      fail(i, rows[i].wrong + 1);
    }
  }

  function checkTyped(i: number) {
    const r = rows[i];
    if (r.done || r.value.trim() === "") return;
    if (normalizeAnswer(r.value) === normalizeAnswer(gaps[i].answer)) mark(i, { done: true, ok: true });
    else fail(i, r.wrong + 1);
  }

  function restart() {
    setRound((n) => n + 1);
    setChip(null);
    setUsedChips(new Set());
    setFlash(null);
    reset();
  }

  const results: AnswerResult[] = gaps.flatMap((g, i) => (g.id && rows[i] ? [{ id: g.id, correct: rows[i].wrong === 0 }] : []));
  const meta = t.games.doplnovani;
  const solved = rows.filter((r) => r.done).length;

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.solved, value: `${solved}/${gaps.length}` },
        { label: t.mistakes, value: String(mistakes) },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, mistakes, gaps.length)}
          seconds={seconds}
          stats={[{ label: t.mistakes, value: String(mistakes) }]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {!typing && (
            <div className="card sticky top-2 z-10 flex flex-col gap-2 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--faint)]">
                {t.fill.bank} <span className="font-normal normal-case tracking-normal">· {t.fill.pickWord}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {bank.map((word, k) => (
                  <button
                    key={`${word}-${k}`}
                    type="button"
                    disabled={usedChips.has(k)}
                    onClick={() => setChip(chip === k ? null : k)}
                    className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
                      usedChips.has(k)
                        ? "border-transparent opacity-25"
                        : chip === k
                          ? "border-[var(--accent-500)] bg-[var(--accent-500)] text-white"
                          : "border-[var(--edge)] bg-[var(--surface)] hover:-translate-y-0.5"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ol className="flex flex-col gap-3">
            {gaps.map((g: Gap, i) => {
              const r = rows[i] ?? fresh();
              const bad = flash === i;
              return (
                <li key={g.id ?? i} className="card flex flex-col gap-2 p-4" style={bad ? { borderColor: "#ff5d73" } : r.done ? { borderColor: r.ok ? "#2ea36b" : "#ff5d73" } : undefined}>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-base">
                    <span className="font-bold tabular-nums text-[var(--faint)]">{i + 1}.</span>
                    {g.before && <span>{g.before}</span>}
                    {typing ? (
                      <span className="inline-flex items-center gap-2">
                        <input
                          ref={(el) => {
                            inputs.current[i] = el;
                          }}
                          value={r.done ? (r.revealed ? g.answer : r.value) : r.value}
                          disabled={r.done}
                          onChange={(e) => mark(i, { value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") checkTyped(i);
                          }}
                          placeholder={t.fill.placeholder}
                          aria-label={`${i + 1}`}
                          size={Math.max(8, Math.min(g.answer.length + 2, 26))}
                          className="rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1 font-bold outline-none focus:border-[var(--accent-500)]"
                          style={bad ? { borderColor: "#ff5d73" } : r.done ? { borderColor: r.ok ? "#2ea36b" : "#ff5d73" } : undefined}
                        />
                        {!r.done && (
                          <button type="button" onClick={() => checkTyped(i)} className="btn-bouncy rounded-full bg-[var(--accent-500)] px-3 py-1.5 text-xs font-bold text-white">
                            {t.fill.check}
                          </button>
                        )}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={r.done}
                        onClick={() => chip !== null && tryChip(i, chip)}
                        className="min-w-24 rounded-lg border-2 border-dashed px-3 py-1 font-bold transition"
                        style={
                          r.done
                            ? { borderStyle: "solid", borderColor: "#2ea36b", background: "rgba(126,224,176,0.3)" }
                            : bad
                              ? { borderColor: "#ff5d73", background: "rgba(255,93,115,0.15)" }
                              : { borderColor: chip !== null ? "var(--accent-500)" : "var(--faint)" }
                        }
                      >
                        {r.done ? r.value : " "}
                      </button>
                    )}
                    {g.after && <span>{g.after}</span>}
                  </div>
                  {typing && !r.done && r.wrong > 0 && (
                    <p className="text-xs text-[#ff5d73]">
                      {t.fill.attemptsLeft}: {MAX_TRIES - r.wrong}
                    </p>
                  )}
                  {r.done && (
                    <p className="text-xs text-[var(--muted)]">
                      {r.ok ? `✓ ${t.fill.correctIs}.` : `✗ ${t.fill.revealed}: ${g.answer}.`} {g.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </GameFrame>
  );
}
