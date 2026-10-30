"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import type { GameQuestion } from "@/i18n/game";
import { buildCrossword, stripDiacritics, toWords, type CrossEntry } from "@/lib/classic-games";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const WORDS = [5, 6, 7, 8, 10];
const HINTS = [4, 3, 3, 2, 2];

type Dir = "across" | "down";
const key = (r: number, c: number) => `${r},${c}`;
// Písmeno se počítá i bez diakritiky (Š = S), hotová křížovka pak ukáže správný tvar.
const same = (a: string | undefined, b: string) => !!a && stripDiacritics(a).toUpperCase() === stripDiacritics(b).toUpperCase();

function cellsOf(e: CrossEntry): [number, number][] {
  return [...e.word].map((_, i) => (e.dir === "across" ? [e.row, e.col + i] : [e.row + i, e.col]));
}

// Křížovka z odpovědí kurzu: klikni na políčko nebo otázku a piš. Šipky přesouvají, Tab skočí na další slovo.
export function Crossword({
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
  const level = Math.min(5, Math.max(1, difficulty)) - 1;
  const [round, setRound] = useState(0);
  const puzzle = useMemo(() => buildCrossword(toWords(questions, WORDS[level])), [questions, level, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<{ r: number; c: number; dir: Dir } | null>(null);
  const [checked, setChecked] = useState(false);
  const [checks, setChecks] = useState(0);
  const [hints, setHints] = useState(HINTS[level]);
  const [done, setDone] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const timer = useTimer(!done);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(() => puzzle?.entries ?? [], [puzzle]);
  const active = useMemo(() => {
    if (!sel) return null;
    return (
      entries.find((e) => e.dir === sel.dir && cellsOf(e).some(([r, c]) => r === sel.r && c === sel.c)) ??
      entries.find((e) => cellsOf(e).some(([r, c]) => r === sel.r && c === sel.c)) ??
      null
    );
  }, [sel, entries]);
  const activeCells = useMemo(() => new Set(active ? cellsOf(active).map(([r, c]) => key(r, c)) : []), [active]);

  useEffect(() => {
    if (!puzzle || sel) return;
    const first = puzzle.entries[0];
    setSel({ r: first.row, c: first.col, dir: first.dir }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [puzzle, sel]);

  if (!puzzle || puzzle.entries.length < 3) return <p className="card p-6">{t.noData}</p>;
  const grid = puzzle;

  const isCell = (r: number, c: number) => r >= 0 && c >= 0 && r < grid.rows && c < grid.cols && grid.letters[r][c] !== null;
  const allFilled = () => {
    for (let r = 0; r < grid.rows; r++) for (let c = 0; c < grid.cols; c++) if (grid.letters[r][c] && !typed[key(r, c)]) return false;
    return true;
  };
  const allRight = (map: Record<string, string>) => {
    for (let r = 0; r < grid.rows; r++) for (let c = 0; c < grid.cols; c++) {
      const L = grid.letters[r][c];
      if (L && !same(map[key(r, c)], L)) return false;
    }
    return true;
  };

  function select(r: number, c: number) {
    if (!isCell(r, c) || done) return;
    // Druhé klepnutí na stejné políčko přepne směr (když tam vede i druhé slovo).
    if (sel && sel.r === r && sel.c === c) {
      const other: Dir = sel.dir === "across" ? "down" : "across";
      const has = entries.some((e) => e.dir === other && cellsOf(e).some(([rr, cc]) => rr === r && cc === c));
      setSel({ r, c, dir: has ? other : sel.dir });
    } else {
      const hasDir = entries.some((e) => e.dir === sel?.dir && cellsOf(e).some(([rr, cc]) => rr === r && cc === c));
      setSel({ r, c, dir: hasDir && sel ? sel.dir : (entries.find((e) => cellsOf(e).some(([rr, cc]) => rr === r && cc === c))?.dir ?? "across") });
    }
    inputRef.current?.focus({ preventScroll: true });
  }

  function step(dr: number, dc: number) {
    if (!sel) return;
    let r = sel.r + dr;
    let c = sel.c + dc;
    while (r >= 0 && c >= 0 && r < grid.rows && c < grid.cols) {
      if (isCell(r, c)) {
        setSel({ r, c, dir: dr !== 0 ? "down" : "across" });
        return;
      }
      r += dr;
      c += dc;
    }
  }

  function advance(back = false) {
    if (!sel || !active) return;
    const cells = cellsOf(active);
    const i = cells.findIndex(([r, c]) => r === sel.r && c === sel.c);
    const next = cells[i + (back ? -1 : 1)];
    if (next) setSel({ r: next[0], c: next[1], dir: active.dir });
  }

  function jumpEntry(delta: number) {
    if (!active) return;
    const i = entries.indexOf(active);
    const e = entries[(i + delta + entries.length) % entries.length];
    setSel({ r: e.row, c: e.col, dir: e.dir });
  }

  function write(ch: string) {
    if (!sel || done) return;
    const k = key(sel.r, sel.c);
    if (revealed.has(k)) {
      advance();
      return;
    }
    setTyped((m) => ({ ...m, [k]: ch.toLocaleUpperCase("cs") }));
    setChecked(false);
    advance();
  }

  function onKey(e: React.KeyboardEvent) {
    if (done) return;
    if (e.key === "ArrowRight") step(0, 1);
    else if (e.key === "ArrowLeft") step(0, -1);
    else if (e.key === "ArrowDown") step(1, 0);
    else if (e.key === "ArrowUp") step(-1, 0);
    else if (e.key === "Tab") jumpEntry(e.shiftKey ? -1 : 1);
    else if (e.key === "Backspace" || e.key === "Delete") {
      if (!sel) return;
      const k = key(sel.r, sel.c);
      if (typed[k] && !revealed.has(k)) setTyped((m) => ({ ...m, [k]: "" }));
      else advance(true);
      setChecked(false);
    } else if (e.key === "Enter") check();
    else if (e.key.length === 1 && /\p{L}/u.test(e.key) && !e.ctrlKey && !e.metaKey) write(e.key);
    else return;
    e.preventDefault();
  }

  function check() {
    setChecks((n) => n + 1);
    setChecked(true);
    if (allFilled() && allRight(typed)) setDone(true);
  }

  function reveal() {
    if (!sel || hints <= 0 || done) return;
    const k = key(sel.r, sel.c);
    const L = grid.letters[sel.r][sel.c] as string;
    if (same(typed[k], L) && revealed.has(k)) return;
    const next = { ...typed, [k]: L };
    setTyped(next);
    setRevealed((s) => new Set(s).add(k));
    setHints((h) => h - 1);
    if (allRight(next)) setDone(true);
    else advance();
  }

  function giveUp() {
    const full: Record<string, string> = {};
    for (let r = 0; r < grid.rows; r++) for (let c = 0; c < grid.cols; c++) if (grid.letters[r][c]) full[key(r, c)] = grid.letters[r][c] as string;
    setGaveUp(true);
    setTyped(full);
    setDone(true);
  }

  function restart() {
    setRound((n) => n + 1);
    setTyped({});
    setRevealed(new Set());
    setSel(null);
    setChecked(false);
    setChecks(0);
    setHints(HINTS[level]);
    setDone(false);
    setGaveUp(false);
    timer.reset();
  }

  const entryRight = (e: CrossEntry) => !gaveUp && cellsOf(e).every(([r, c]) => same(typed[key(r, c)], grid.letters[r][c] as string));
  const results: AnswerResult[] = entries.filter((e) => e.id).map((e) => ({ id: e.id as string, correct: entryRight(e) }));
  const solvedCount = entries.filter((e) => cellsOf(e).every(([r, c]) => same(typed[key(r, c)], grid.letters[r][c] as string))).length;
  const meta = t.games.krizovka;
  const cellPx = grid.cols > 13 ? 28 : grid.cols > 10 ? 34 : 40;
  const usedHints = HINTS[level] - hints;

  const clueList = (dir: Dir) => (
    <div>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--faint)]">{dir === "across" ? t.cross.across : t.cross.down}</h3>
      <ol className="flex flex-col gap-1.5">
        {entries
          .filter((e) => e.dir === dir)
          .map((e) => {
            const on = active === e;
            const ok = done && entryRight(e);
            return (
              <li key={`${e.dir}${e.num}`}>
                <button
                  type="button"
                  onClick={() => {
                    setSel({ r: e.row, c: e.col, dir: e.dir });
                    inputRef.current?.focus({ preventScroll: true });
                  }}
                  className={`w-full rounded-xl border-2 px-3 py-2 text-left text-sm transition ${
                    on ? "border-[var(--brand-500)] bg-[var(--brand-50)]" : "border-transparent bg-[var(--surface-muted)] hover:border-[var(--edge)]"
                  }`}
                >
                  <span className="mr-1 font-extrabold">{e.num}.</span> {e.clue} <span className="text-xs text-[var(--faint)]">({e.word.length})</span>
                  {done && <span className="ml-1">{ok ? "✅" : `→ ${e.word}`}</span>}
                </button>
              </li>
            );
          })}
      </ol>
    </div>
  );

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.solved, value: `${solvedCount}/${entries.length}` },
        { label: t.cross.hintsLeft, value: String(hints) },
      ]}
    >
      {done && (
        <FinishCard
          t={t}
          xp={gaveUp ? 5 : xpFor(10 + entries.length * 3, usedHints + Math.max(0, checks - 1), entries.length)}
          seconds={timer.seconds}
          stats={[
            { label: t.solved, value: `${results.filter((r) => r.correct).length}/${entries.length}` },
            { label: t.cross.hintsLeft, value: String(usedHints) },
          ]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        />
      )}
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <div className="card relative self-start overflow-x-auto p-3">
          <input
            ref={inputRef}
            aria-label={meta.title}
            className="absolute h-px w-px opacity-0"
            autoCapitalize="characters"
            autoComplete="off"
            onKeyDown={onKey}
            onChange={(e) => {
              const ch = e.target.value.slice(-1);
              if (ch && /\p{L}/u.test(ch)) write(ch);
              e.target.value = "";
            }}
            autoFocus
          />
          <div
            className="grid select-none"
            style={{ gridTemplateColumns: `repeat(${grid.cols}, ${cellPx}px)`, gridAutoRows: `${cellPx}px` }}
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            {grid.letters.map((row, r) =>
              row.map((L, c) => {
                if (!L) return <div key={key(r, c)} />;
                const k = key(r, c);
                const v = typed[k] ?? "";
                const isSel = sel?.r === r && sel?.c === c;
                const inWord = activeCells.has(k);
                const wrong = checked && v && !same(v, L);
                const shown = done ? L : v;
                return (
                  <button
                    key={k}
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      select(r, c);
                    }}
                    className="relative m-[1px] flex items-center justify-center rounded-md border-2 font-extrabold uppercase transition-colors"
                    style={{
                      fontSize: cellPx * 0.5,
                      borderColor: isSel ? "var(--brand-500)" : "var(--edge)",
                      background: wrong
                        ? "rgba(255,93,115,0.3)"
                        : revealed.has(k)
                          ? "rgba(255,208,80,0.35)"
                          : done
                            ? "rgba(126,224,176,0.3)"
                            : isSel
                              ? "var(--brand-100, #dcd7ff)"
                              : inWord
                                ? "var(--brand-50)"
                                : "var(--surface)",
                      color: "var(--foreground)",
                    }}
                  >
                    {grid.nums[r][c] !== null && (
                      <span className="absolute left-0.5 top-0 text-[9px] font-bold leading-none text-[var(--faint)]">{grid.nums[r][c]}</span>
                    )}
                    {shown}
                  </button>
                );
              }),
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {active && !done && (
            <p className="rounded-xl bg-[var(--brand-50)] px-4 py-3 font-bold text-[var(--brand-700)]">
              {active.num}. {active.dir === "across" ? t.cross.across : t.cross.down}: {active.clue}
            </p>
          )}
          {checked && !done && <p className="text-sm font-semibold">{allFilled() && allRight(typed) ? t.cross.allRight : t.cross.wrongCells}</p>}
          {!done && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={check} className="btn-bouncy btn-primary">
                ✔ {t.cross.check}
              </button>
              <button type="button" onClick={reveal} disabled={hints <= 0} className="btn-bouncy btn-secondary disabled:opacity-40">
                💡 {t.cross.reveal} ({hints})
              </button>
              <button type="button" onClick={giveUp} className="btn-bouncy btn-secondary">
                🏳️ {t.cross.giveUp}
              </button>
            </div>
          )}
          {clueList("across")}
          {clueList("down")}
        </div>
      </div>
    </GameFrame>
  );
}
