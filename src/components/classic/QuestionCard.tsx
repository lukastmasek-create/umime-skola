"use client";

import { useEffect, useRef } from "react";
import type { Shuffled } from "@/lib/classic-games";
import { sfx } from "@/lib/game-fx";

const LETTERS = ["A", "B", "C", "D"];

// Otázka se čtyřmi možnostmi na pevné čitelné kartě. Po výběru (`picked`) se správná odpověď
// zvýrazní zeleně (✓), špatná červeně (✗), ozve se zvuk a na mobilu krátce zavibruje.
export function QuestionCard({
  q,
  picked,
  hidden = [],
  onPick,
  disabled = false,
  votes,
  streak = 0,
  note,
}: {
  q: Shuffled;
  picked: number | null;
  hidden?: number[];
  onPick: (i: number) => void;
  disabled?: boolean;
  votes?: number[];
  streak?: number;
  // Doplněk ke špatné odpovědi (třeba ztracený čas).
  note?: string;
}) {
  const revealed = picked !== null;
  const wasRevealed = useRef(false);
  useEffect(() => {
    if (revealed && !wasRevealed.current) {
      const ok = picked === q.correct;
      sfx(ok ? "correct" : "wrong");
      try {
        navigator.vibrate?.(ok ? 25 : [60, 40, 60]);
      } catch {
        /* vibrace nejsou k dispozici */
      }
    }
    wasRevealed.current = revealed;
  }, [revealed, picked, q.correct]);

  const ok = revealed && picked === q.correct;
  return (
    <div className="gq-body">
      <div className="gq-card gq-q">
        {streak >= 2 && (
          <span key={streak} className="gq-combo">
            🔥 {streak}×
          </span>
        )}
        <p>{q.prompt}</p>
        {q.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" src={q.image} alt="" className="max-h-40 w-auto max-w-full rounded-xl object-contain" />
        )}
      </div>
      <div className="gq-opts">
        {q.options.map((opt, i) => {
          const gone = hidden.includes(i);
          const state = revealed ? (i === q.correct ? "is-right" : i === picked ? "is-wrong" : "is-dim") : "";
          return (
            <button
              key={i}
              type="button"
              disabled={disabled || revealed || gone}
              onClick={() => onPick(i)}
              className={`gq-opt ${state} ${gone ? "invisible" : ""}`}
            >
              <span className="gq-key" aria-hidden>
                {LETTERS[i]}
              </span>
              <span className="relative z-10">{opt}</span>
              {votes && !revealed && (
                <span aria-hidden className="absolute inset-y-0 left-0 bg-[var(--accent-500)]/20" style={{ width: `${votes[i]}%` }} />
              )}
              {votes && !revealed && <span className="relative z-10 ml-auto text-xs tabular-nums text-[var(--muted)]">{votes[i]} %</span>}
              {revealed && i === q.correct && <span className="gq-mark" aria-label="✓">✓</span>}
              {revealed && i === picked && i !== q.correct && <span className="gq-mark" aria-label="✗">✗</span>}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className={`gq-feedback ${ok ? "ok" : "bad"}`} role="status">
          {ok ? "✓" : `✗ → ${q.options[q.correct]}${note ? ` · ${note}` : ""}`}
        </p>
      )}
    </div>
  );
}
