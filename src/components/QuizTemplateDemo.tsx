"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

type Variant = "cards" | "fullscreen" | "list";

export function QuizTemplateDemo({
  variant,
  dict,
  selected: isSelectedTemplate,
  onPick,
}: {
  variant: Variant;
  dict: Dictionary;
  selected: boolean;
  onPick: () => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const { question, options, correctIndex, explanationTitle, explanation } = dict.templates;
  const isCorrect = choice === correctIndex;

  function reset() {
    setChoice(null);
    setChecked(false);
  }

  function optionClasses(i: number) {
    const base =
      variant === "list"
        ? "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors"
        : "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors";

    if (!checked) {
      return `${base} ${
        choice === i
          ? "border-[var(--brand-500)] bg-[var(--brand-50)]"
          : "border-[var(--border-soft)] bg-[var(--surface)] hover:border-[var(--brand-100)]"
      }`;
    }
    if (i === correctIndex) {
      return `${base} border-[var(--accent-green)] bg-[color-mix(in_srgb,var(--accent-green)_14%,var(--surface))]`;
    }
    if (i === choice) {
      return `${base} border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))]`;
    }
    return `${base} border-[var(--border-soft)] bg-[var(--surface)] opacity-60`;
  }

  const letters = ["A", "B", "C", "D"];

  return (
    <div
      className={`card flex flex-col gap-4 p-6 ${
        variant === "fullscreen" ? "gradient-hero !rounded-2xl border-2" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">
          {dict.templates[variant === "cards" ? "templateA" : variant === "fullscreen" ? "templateB" : "templateC"].name}
        </p>
        <button
          onClick={onPick}
          className={`btn-bouncy pill px-3 py-1.5 text-xs font-semibold ${
            isSelectedTemplate
              ? "bg-[var(--accent-green)] text-white"
              : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"
          }`}
        >
          {isSelectedTemplate ? dict.templates.picked : dict.templates.pickThisOne}
        </button>
      </div>

      <p className="text-xs text-[var(--faint)]">
        {dict.templates[variant === "cards" ? "templateA" : variant === "fullscreen" ? "templateB" : "templateC"].tagline}
      </p>

      <h3
        className={`font-bold ${variant === "fullscreen" ? "text-xl text-center" : "text-base"}`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {question}
      </h3>

      <div
        className={
          variant === "cards"
            ? "grid grid-cols-2 gap-3"
            : variant === "fullscreen"
              ? "flex flex-col gap-2 mx-auto w-full max-w-sm"
              : "flex flex-col gap-2"
        }
      >
        {options.map((option, i) => (
          <button
            key={option}
            onClick={() => !checked && setChoice(i)}
            className={optionClasses(i)}
          >
            {variant === "list" && (
              <span className="pill h-6 w-6 items-center justify-center bg-[var(--surface-muted)] text-xs font-bold">
                {letters[i]}
              </span>
            )}
            {option}
          </button>
        ))}
      </div>

      <div className={variant === "fullscreen" ? "mx-auto w-full max-w-sm" : ""}>
        {!checked ? (
          <button
            onClick={() => choice !== null && setChecked(true)}
            disabled={choice === null}
            className="btn-bouncy w-full rounded-full bg-[var(--brand-500)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {dict.templates.checkAnswer}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p
              className={`pill px-3 py-1.5 text-sm font-semibold ${
                isCorrect
                  ? "bg-[color-mix(in_srgb,var(--accent-green)_16%,white)] text-[color-mix(in_srgb,var(--accent-green)_65%,black)]"
                  : "bg-[color-mix(in_srgb,var(--danger)_14%,white)] text-[var(--danger)]"
              }`}
            >
              {isCorrect ? dict.templates.correct : dict.templates.incorrect}
            </p>
            <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
              <p className="mb-1 font-semibold text-[var(--foreground)]">💡 {explanationTitle}</p>
              {explanation}
            </div>
            <button
              onClick={reset}
              className="btn-bouncy self-start text-sm font-semibold text-[var(--brand-600)] hover:underline"
            >
              {dict.templates.nextQuestion}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
