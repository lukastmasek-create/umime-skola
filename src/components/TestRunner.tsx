"use client";

import { DailyRecap } from "@/components/DailyChallenges";
import type { Locale } from "@/i18n/config";
import { useState } from "react";
import Link from "next/link";
import type { TestText } from "@/i18n/test";

export type TestQuestion = {
  id: string;
  prompt: string;
  answers: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

function gapParts(prompt: string) {
  return prompt.split("___");
}

function filledPrompt(question: TestQuestion) {
  const parts = gapParts(question.prompt);
  return parts.reduce((text, part, i) => text + part + (question.answers[i] ?? ""), "");
}

function isCorrect(question: TestQuestion, typed: string[] | undefined, choice: number | null | undefined) {
  if (question.answers.length > 0) {
    return question.answers.every((answer, i) => normalize(typed?.[i] ?? "") === normalize(answer));
  }
  return choice === question.correctIndex;
}

export function TestRunner({
  locale,
  title,
  t,
  questions,
  backHref,
}: {
  locale: Locale;
  title: string;
  t: TestText;
  questions: TestQuestion[];
  backHref: string;
}) {
  const [typed, setTyped] = useState<Record<string, string[]>>({});
  const [choices, setChoices] = useState<Record<string, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const correctCount = submitted
    ? questions.filter((q) => isCorrect(q, typed[q.id], choices[q.id])).length
    : 0;
  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const gradeIndex = percent >= 90 ? 0 : percent >= 75 ? 1 : percent >= 50 ? 2 : percent >= 30 ? 3 : 4;

  async function submitTest() {
    setSubmitted(true);
    const correct = questions.filter((q) => isCorrect(q, typed[q.id], choices[q.id])).length;
    if (correct <= 0) return;
    try {
      const res = await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "test", amount: correct * 5 }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.gained > 0) setXpGained(data.gained);
    } catch {
      // not logged in or offline: XP is simply not awarded
    }
  }

  function setGap(id: string, index: number, value: string) {
    setTyped((prev) => {
      const next = [...(prev[id] ?? [])];
      next[index] = value;
      return { ...prev, [id]: next };
    });
  }

  if (questions.length === 0) {
    return (
      <div className="card p-10 text-center text-[var(--muted)]">
        {t.empty}
        <div className="mt-4">
          <Link href={backHref} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
            {t.backToCourse}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h1>
        <p className="mt-1 text-xs text-[var(--faint)]">{t.strictNote}</p>
      </div>

      {submitted && (
        <div className="card flex flex-col items-center gap-1 p-6 text-center">
          <p className="text-sm text-[var(--muted)]">{t.result}</p>
          <p className="text-4xl font-bold text-[var(--brand-600)]" style={{ fontFamily: "var(--font-heading)" }}>
            {correctCount} / {questions.length}
          </p>
          <p className="text-sm">
            {t.grade}: <span className="font-bold">{gradeIndex + 1}</span> · {t.gradeNames[gradeIndex]} ({percent} %)
          </p>
          {xpGained > 0 && (
            <p className="pill mt-2 bg-[var(--accent-yellow)] px-3 py-1.5 text-sm text-[#16132b]">
              +{xpGained} XP
            </p>
          )}
        </div>
      )}
      {submitted && <DailyRecap locale={locale} refreshKey={xpGained} />}

      {questions.map((q, qi) => {
        const ok = submitted && isCorrect(q, typed[q.id], choices[q.id]);
        const parts = gapParts(q.prompt);
        const typedQuestion = q.answers.length > 0;
        return (
          <div
            key={q.id}
            className={`card flex flex-col gap-3 p-5 ${
              submitted
                ? ok
                  ? "border-[var(--accent-green)]"
                  : "border-[var(--danger)]"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">
                {t.question} {qi + 1}
              </p>
            </div>

            {typedQuestion ? (
              <p className="flex flex-wrap items-center gap-y-2 text-lg leading-10">
                {parts.map((part, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span className="whitespace-pre-wrap">{part}</span>
                    {i < parts.length - 1 && (
                      <input
                        value={typed[q.id]?.[i] ?? ""}
                        onChange={(e) => setGap(q.id, i, e.target.value)}
                        disabled={submitted}
                        maxLength={24}
                        aria-label={`${t.question} ${qi + 1}`}
                        autoComplete="off"
                        spellCheck={false}
                        style={{ width: `${Math.max(3, (q.answers[i]?.length ?? 1) + 2)}ch` }}
                        className={`mx-1 rounded-lg border-2 bg-[var(--surface)] px-1 py-0.5 text-center font-bold outline-none focus:border-[var(--brand-500)] ${
                          submitted
                            ? normalize(typed[q.id]?.[i] ?? "") === normalize(q.answers[i])
                              ? "border-[var(--accent-green)]"
                              : "border-[var(--danger)]"
                            : "border-[var(--border-soft)]"
                        }`}
                      />
                    )}
                  </span>
                ))}
              </p>
            ) : (
              <>
                <p className="text-lg">{q.prompt}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((option, oi) => (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setChoices((c) => ({ ...c, [q.id]: oi }))}
                      className={`rounded-xl border px-4 py-2 text-left text-sm font-medium ${
                        choices[q.id] === oi
                          ? "border-[var(--brand-500)] bg-[var(--brand-50)]"
                          : "border-[var(--border-soft)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}


            {submitted && (
              <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
                {!ok && (
                  <p className="mb-1">
                    <span className="font-semibold">{t.yourAnswer}:</span>{" "}
                    {typedQuestion
                      ? (typed[q.id] ?? []).join(", ") || "—"
                      : choices[q.id] != null
                        ? q.options[choices[q.id] as number]
                        : "—"}
                  </p>
                )}
                <p className="mb-1">
                  <span className="font-semibold">{t.correctAnswer}:</span>{" "}
                  {typedQuestion ? filledPrompt(q) : q.options[q.correctIndex]}
                </p>
                <p className="text-[var(--muted)]">
                  <span className="font-semibold">{t.why}:</span> {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-4">
        {!submitted ? (
          <button
            onClick={submitTest}
            className="btn-bouncy rounded-full bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
          >
            {t.check}
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="btn-bouncy rounded-full bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
          >
            {t.newTest}
          </button>
        )}
        <Link href={backHref} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
          {t.backToCourse}
        </Link>
      </div>
    </div>
  );
}
