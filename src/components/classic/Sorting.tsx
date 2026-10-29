"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, toStatements, type Statement } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";

const SWIPE = 90;

type Verdict = { ok: boolean; item: Statement };

export function Sorting({
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
  const count = difficulty <= 2 ? 8 : difficulty === 3 ? 10 : 12;
  const [round, setRound] = useState(0);
  const items = useMemo(() => toStatements(questions, count), [questions, count, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [index, setIndex] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [last, setLast] = useState<Verdict | null>(null);
  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const busy = useRef(false);

  const finished = items.length > 0 && index >= items.length;
  const { seconds, reset } = useTimer(items.length > 0 && !finished);
  const item = items[index];
  const mistakes = verdicts.filter((v) => !v.ok);

  const decide = useCallback(
    (says: boolean) => {
      if (!item || busy.current) return;
      busy.current = true;
      setFly(says ? 1 : -1);
      const verdict = { ok: says === item.truth, item };
      window.setTimeout(() => {
        setVerdicts((v) => [...v, verdict]);
        setLast(verdict);
        setIndex((i) => i + 1);
        setFly(0);
        setDx(0);
        busy.current = false;
      }, 220);
    },
    [item],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") decide(true);
      else if (e.key === "ArrowLeft") decide(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide]);

  if (items.length < 4) return <p className="card p-6">{t.noData}</p>;

  function onDown(e: React.PointerEvent) {
    if (busy.current) return;
    drag.current = { x: e.clientX - dx, id: e.pointerId };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setDx(Math.max(-220, Math.min(220, e.clientX - drag.current.x)));
  }
  function onUp() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (dx > SWIPE) decide(true);
    else if (dx < -SWIPE) decide(false);
    else setDx(0);
  }

  function restart() {
    setRound((n) => n + 1);
    setIndex(0);
    setVerdicts([]);
    setLast(null);
    setDx(0);
    setFly(0);
    busy.current = false;
    reset();
  }

  const results: AnswerResult[] = verdicts.flatMap((v) => (v.item.id ? [{ id: v.item.id, correct: v.ok }] : []));
  const meta = t.games.trideni;
  const offset = fly !== 0 ? fly * 380 : dx;
  const tint = offset > 20 ? "rgba(46,163,107,0.18)" : offset < -20 ? "rgba(255,93,115,0.18)" : "transparent";

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={[
        { label: t.time, value: formatTime(seconds) },
        { label: t.solved, value: `${Math.min(index, items.length)}/${items.length}` },
        { label: t.mistakes, value: String(mistakes.length) },
      ]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(25, mistakes.length, items.length)}
          seconds={seconds}
          stats={[{ label: t.mistakes, value: String(mistakes.length) }]}
          results={results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        >
          {mistakes.length > 0 && (
            <div className="flex w-full flex-col gap-2 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              <p className="font-semibold">📚 {t.sort.review}</p>
              <ul className="flex flex-col gap-2">
                {mistakes.map((m) => (
                  <li key={m.item.question} className="rounded-lg bg-[var(--surface)] p-3">
                    <p className="font-semibold">{m.item.question}</p>
                    <p className="text-[var(--brand-600)]">✓ {m.item.correct}</p>
                    <p className="text-xs text-[var(--muted)]">{m.item.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FinishCard>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="grid w-full max-w-md grid-cols-2 text-center text-sm font-bold">
            <span className="text-[#ff5d73]">← {t.sort.wrong}</span>
            <span className="text-[#2ea36b]">{t.sort.right} →</span>
          </div>
          <div className="relative h-60 w-full max-w-md select-none sm:h-64">
            {items[index + 1] && (
              <div className="card absolute inset-0 translate-y-2 scale-[0.96] opacity-70" aria-hidden />
            )}
            <div
              role="group"
              aria-label={`${t.sort.card} ${index + 1}/${items.length}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className="card absolute inset-0 flex cursor-grab touch-pan-y flex-col justify-center gap-4 p-6 text-center active:cursor-grabbing"
              style={{
                transform: `translateX(${offset}px) rotate(${offset / 18}deg)`,
                transition: dragging ? "none" : "transform 0.22s ease, background 0.2s",
                background: tint === "transparent" ? undefined : tint,
                opacity: fly !== 0 ? 0 : 1,
              }}
            >
              <p className="text-base font-semibold sm:text-lg">{item.question}</p>
              <p className="text-xl font-extrabold text-[var(--brand-600)] sm:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
                → {item.shown}
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-md gap-3">
            <button type="button" onClick={() => decide(false)} className="btn-bouncy flex-1 rounded-2xl border-2 border-[#ff5d73] bg-[#ff5d73]/15 py-3 text-base font-bold">
              ✗ {t.sort.wrong}
            </button>
            <button type="button" onClick={() => decide(true)} className="btn-bouncy flex-1 rounded-2xl border-2 border-[#2ea36b] bg-[#7ee0b0]/30 py-3 text-base font-bold">
              ✓ {t.sort.right}
            </button>
          </div>
          <p className="text-xs text-[var(--faint)]">{t.sort.hint}</p>
          {last && (
            <div
              className="w-full max-w-md rounded-xl p-3 text-sm"
              style={{ background: last.ok ? "rgba(126,224,176,0.3)" : "rgba(255,93,115,0.15)" }}
              aria-live="polite"
            >
              {last.ok ? (
                <p className="font-semibold">✓ {t.sort.wasRight}</p>
              ) : (
                <>
                  <p className="font-semibold">
                    ✗ {t.sort.wasWrong} {t.sort.correctIs}: {last.item.correct}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{last.item.explanation}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </GameFrame>
  );
}
