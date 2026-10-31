"use client";

import { useMemo, useState } from "react";
import { seededShuffle, type PracticeCard, type PracticeQuestion } from "@/lib/materials/practice";

// Interaktivní části výukových materiálů: mini kvíz v textu, otáčecí kartičky a procvičování na konci tématu.
export type InteractiveLabels = { check: string; right: string; wrong: string; cards: string; flip: string; practice: string; again: string; score: string };

export function QuizBlock({ question, options, answer, why, labels }: { question: string; options: string[]; answer: number; why?: string; labels: InteractiveLabels }) {
  // pořadí možností podle otázky, ať první není vždy správná
  const order = useMemo(() => seededShuffle(options.map((_, i) => i), question), [options, question]);
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-2xl border-2 border-[var(--edge)] bg-[var(--brand-50)] p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-600)]">❓ {labels.check}</p>
      <p className="mb-3 font-semibold">{question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {order.map((i) => {
          const state = picked === null ? "" : i === answer ? "mini-opt-ok" : i === picked ? "mini-opt-bad" : "opacity-60";
          return (
            <button key={i} type="button" disabled={picked !== null} onClick={() => setPicked(i)} className={`mini-opt text-left text-sm ${state}`}>
              {options[i]}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 text-sm font-semibold">
          {picked === answer ? `✅ ${labels.right}` : `❌ ${labels.wrong} ${options[answer]}`}
          {why && <span className="block font-normal text-[var(--muted)]">{why}</span>}
        </p>
      )}
    </div>
  );
}

export function CardsBlock({ items, labels }: { items: PracticeCard[]; labels: InteractiveLabels }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">🃏 {labels.cards}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map(([front, back], i) => {
          const on = open.has(i);
          return (
            <button
              key={i}
              type="button"
              aria-label={labels.flip}
              onClick={() => setOpen((s) => new Set(s.has(i) ? [...s].filter((x) => x !== i) : [...s, i]))}
              className={`min-h-[5.5rem] rounded-2xl border-2 border-[var(--edge)] p-3 text-sm font-bold shadow-[0_3px_0_var(--shadow-ink)] transition-colors ${on ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
            >
              {on ? back : front}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TopicPractice({ cards, questions, labels }: { cards: PracticeCard[]; questions: PracticeQuestion[]; labels: InteractiveLabels }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= questions.length;
  const q = questions[i];
  if (!cards.length && !questions.length) return null;
  return (
    <section className="card mt-10 flex flex-col gap-5 p-5">
      <h2 className="text-lg font-bold">🧠 {labels.practice}</h2>
      {questions.length > 0 &&
        (done ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-bold">{labels.score.replace("{a}", String(score)).replace("{b}", String(questions.length))}</p>
            <button type="button" onClick={() => (setI(0), setScore(0), setPicked(null))} className="btn-bouncy bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">
              {labels.again}
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-xs font-bold text-[var(--muted)]">
              {i + 1} / {questions.length} · ⭐ {score}
            </p>
            <p className="mb-3 font-semibold">{q.question}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, k) => {
                const state = picked === null ? "" : k === q.answer ? "mini-opt-ok" : k === picked ? "mini-opt-bad" : "opacity-60";
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={picked !== null}
                    onClick={() => {
                      setPicked(k);
                      if (k === q.answer) setScore((s) => s + 1);
                      window.setTimeout(() => {
                        setPicked(null);
                        setI((x) => x + 1);
                      }, 1100);
                    }}
                    className={`mini-opt text-left text-sm ${state}`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      {cards.length > 0 && <CardsBlock items={cards} labels={labels} />}
    </section>
  );
}
