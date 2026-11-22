"use client";

import { useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, normalizeAnswer, shuffle, toGaps, type Gap } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { sfx } from "@/lib/game-fx";
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
  const [cur, setCur] = useState(0);
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

  function buzz(ok: boolean) {
    sfx(ok ? "correct" : "wrong");
    try {
      navigator.vibrate?.(ok ? 25 : [60, 40, 60]);
    } catch {
      /* bez vibrací */
    }
  }

  function fail(i: number, wrongNow: number) {
    buzz(false);
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
      buzz(true);
    } else {
      fail(i, rows[i].wrong + 1);
    }
  }

  function checkTyped(i: number) {
    const r = rows[i];
    if (r.done || r.value.trim() === "") return;
    if (normalizeAnswer(r.value) === normalizeAnswer(gaps[i].answer)) {
      mark(i, { done: true, ok: true });
      buzz(true);
    } else fail(i, r.wrong + 1);
  }

  function restart() {
    setRound((n) => n + 1);
    setCur(0);
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
        <div className="gq-body">
          <div className="flex justify-center gap-2" aria-hidden>
            {gaps.map((_, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full border-2"
                style={{
                  borderColor: i === cur ? "#ffc933" : "var(--gq-edge)",
                  background: rows[i]?.done ? (rows[i].ok ? "var(--gq-ok)" : "var(--gq-bad)") : i === cur ? "#ffc933" : "transparent",
                }}
              />
            ))}
          </div>
          {(() => {
            const i = Math.min(cur, gaps.length - 1);
            const g: Gap = gaps[i];
            const r = rows[i] ?? fresh();
            const bad = flash === i;
            const lastOne = i >= gaps.length - 1;
            return (
              <>
                <div
                  className="gq-card gq-q"
                  style={{ borderColor: bad ? "var(--gq-bad)" : r.done ? (r.ok ? "var(--gq-ok)" : "var(--gq-bad)") : undefined }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--faint)]">
                    {i + 1}/{gaps.length}
                  </p>
                  <p>
                    {g.before && <span>{g.before} </span>}
                    <span
                      className="inline-block min-w-24 rounded-xl border-4 border-dashed px-3 py-0.5 align-middle"
                      style={{
                        borderColor: r.done ? (r.ok ? "var(--gq-ok)" : "var(--gq-bad)") : bad ? "var(--gq-bad)" : "#ffc933",
                        borderStyle: r.done ? "solid" : "dashed",
                        background: r.done ? "rgba(255,255,255,0.1)" : "transparent",
                      }}
                    >
                      {r.done ? (r.revealed ? g.answer : r.value || g.answer) : "\u00a0"}
                    </span>
                    {g.after && <span> {g.after}</span>}
                  </p>
                </div>
                {!r.done &&
                  (typing ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        ref={(el) => {
                          inputs.current[i] = el;
                        }}
                        autoFocus
                        value={r.value}
                        onChange={(e) => mark(i, { value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") checkTyped(i);
                        }}
                        placeholder={t.fill.placeholder}
                        aria-label={`${i + 1}`}
                        className="min-h-16 flex-1 rounded-2xl border-[3px] border-[var(--gq-edge)] bg-[var(--gq-bg)] px-4 text-xl font-bold outline-none focus:border-[#ffc933]"
                        style={bad ? { borderColor: "var(--gq-bad)" } : undefined}
                      />
                      <button type="button" onClick={() => checkTyped(i)} className="arena-btn" style={{ minHeight: 64 }}>
                        ✔ {t.fill.check}
                      </button>
                    </div>
                  ) : (
                    <div className="gq-opts">
                      {bank.map((word, k) => (
                        <button
                          key={`${word}-${k}`}
                          type="button"
                          disabled={usedChips.has(k)}
                          onClick={() => tryChip(i, k)}
                          className={`gq-opt justify-center text-center ${usedChips.has(k) ? "is-dim" : ""}`}
                          style={usedChips.has(k) ? { visibility: "hidden" } : undefined}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  ))}
                {typing && !r.done && r.wrong > 0 && (
                  <p className="gq-feedback bad">
                    {t.fill.attemptsLeft}: {MAX_TRIES - r.wrong}
                  </p>
                )}
                {!typing && !r.done && r.wrong > 0 && <p className="gq-feedback bad">✗</p>}
                {r.done && (
                  <>
                    <p className={`gq-feedback ${r.ok ? "ok" : "bad"}`} role="status">
                      {r.ok ? `✓ ${t.fill.correctIs}.` : `✗ ${t.fill.revealed}: ${g.answer}.`} {g.explanation}
                    </p>
                    {!lastOne && (
                      <button type="button" autoFocus onClick={() => setCur(i + 1)} className="arena-btn self-center" style={{ minHeight: 56 }}>
                        {"→"}
                      </button>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </GameFrame>
  );
}
