"use client";

import type { Shuffled } from "@/lib/classic-games";

const LETTERS = ["A", "B", "C", "D"];

// Otázka se čtyřmi možnostmi. Po výběru (`picked`) se správná odpověď zvýrazní zeleně a špatná červeně.
export function QuestionCard({
  q,
  picked,
  hidden = [],
  onPick,
  disabled = false,
  votes,
}: {
  q: Shuffled;
  picked: number | null;
  hidden?: number[];
  onPick: (i: number) => void;
  disabled?: boolean;
  votes?: number[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-bold sm:text-xl" style={{ fontFamily: "var(--font-heading)" }}>
        {q.prompt}
      </p>
      {q.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={q.image} alt="" className="max-h-56 w-auto max-w-full self-start rounded-xl border border-[var(--border)] object-contain" />
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const gone = hidden.includes(i);
          const revealed = picked !== null;
          const style: React.CSSProperties = revealed
            ? i === q.correct
              ? { borderColor: "#2ea36b", background: "rgba(126,224,176,0.35)" }
              : i === picked
                ? { borderColor: "#ff5d73", background: "rgba(255,93,115,0.18)" }
                : { opacity: 0.55 }
            : {};
          return (
            <button
              key={i}
              type="button"
              disabled={disabled || revealed || gone}
              onClick={() => onPick(i)}
              className={`card relative flex min-h-14 items-center gap-3 overflow-hidden p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 sm:text-base ${gone ? "invisible" : ""}`}
              style={style}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-extrabold">
                {LETTERS[i]}
              </span>
              <span className="relative z-10">{opt}</span>
              {votes && !revealed && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--accent-500)]/20"
                  style={{ width: `${votes[i]}%` }}
                />
              )}
              {votes && !revealed && <span className="relative z-10 ml-auto text-xs tabular-nums text-[var(--muted)]">{votes[i]} %</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
