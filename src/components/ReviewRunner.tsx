"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fill } from "@/i18n/profile";
import { getReviewText } from "@/i18n/review";
import { DailyRecap } from "@/components/DailyChallenges";
import type { Locale } from "@/i18n/config";

type Question = {
  id: string;
  prompt: string;
  answers: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
  courseTitle: string;
  courseHref: string;
};

type Load = { state: "loading" } | { state: "guest" } | { state: "error" } | { state: "ready"; due: number; questions: Question[] };

const normalize = (value: string) => value.trim().toLowerCase();

// Opakování otázek, které hráč dřív zkazil: po jedné, s okamžitou kontrolou.
export function ReviewRunner({ locale }: { locale: Locale }) {
  const t = getReviewText(locale);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [xp, setXp] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/opakovani")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.loggedIn === false) setLoad({ state: "guest" });
        else if (d.error) setLoad({ state: "error" });
        else setLoad({ state: "ready", due: d.due, questions: d.questions });
      })
      .catch(() => !cancelled && setLoad({ state: "error" }));
    return () => {
      cancelled = true;
    };
  }, [round]);

  function restart() {
    setLoad({ state: "loading" });
    setIndex(0);
    setTyped([]);
    setChoice(null);
    setChecked(null);
    setResults([]);
    setFinished(false);
    setXp(0);
    setRound((r) => r + 1);
  }

  const heading = { fontFamily: "var(--font-heading)" } as const;

  if (load.state === "loading") return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (load.state === "error") return <p className="card p-6 text-[var(--muted)]">{t.loadError}</p>;
  if (load.state === "guest") {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="text-[var(--muted)]">{t.loginNeeded}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
          {t.login}
        </Link>
      </div>
    );
  }

  const { questions, due } = load;
  if (questions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-xl font-bold" style={heading}>
          {t.nothingDue}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">{t.nothingDueHint}</p>
      </div>
    );
  }

  async function finish(all: { id: string; correct: boolean }[]) {
    setFinished(true);
    const correct = all.filter((r) => r.correct).length;
    try {
      await fetch("/api/opakovani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: all }),
      });
      if (correct > 0) {
        const res = await fetch("/api/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "test", amount: correct * 5 }),
        });
        const data = await res.json();
        if (res.ok && data.gained > 0) setXp(data.gained);
      }
    } catch {
      // bez spojení se výsledek jen neuloží
    }
  }

  if (finished) {
    const correct = results.filter((r) => r.correct).length;
    return (
      <div className="flex flex-col gap-4">
        <div className="card flex flex-col items-center gap-1 p-6 text-center">
          <p className="text-4xl font-bold text-[var(--brand-600)]" style={heading}>
            {fill(t.summary, `${correct} / ${results.length}`)}
          </p>
          <p className="text-sm text-[var(--muted)]">{t.summaryHint}</p>
          {xp > 0 && <p className="pill mt-2 bg-[var(--accent-yellow)] px-3 py-1.5 text-sm text-[#16132b]">+{xp} XP</p>}
        </div>
        <DailyRecap locale={locale} refreshKey={xp} />
        {due > questions.length && (
          <button onClick={restart} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
            {t.again}
          </button>
        )}
      </div>
    );
  }

  const q = questions[index];
  const gaps = q.prompt.split("___");
  const isTyped = q.answers.length > 0;
  const answered = checked !== null;
  const last = index + 1 >= questions.length;

  function check() {
    const ok = isTyped
      ? q.answers.every((a, i) => normalize(typed[i] ?? "") === normalize(a))
      : choice === q.correctIndex;
    setChecked(ok);
    setResults((r) => [...r, { id: q.id, correct: ok }]);
  }

  function next() {
    if (last) {
      finish(results);
      return;
    }
    setIndex(index + 1);
    setTyped([]);
    setChoice(null);
    setChecked(null);
  }

  return (
    <div className="card flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">
        <span>
          {t.question} {index + 1} / {questions.length}
        </span>
        <span className="text-[var(--muted)] normal-case">{fill(t.dueCount, due)}</span>
      </div>
      <p className="text-xs text-[var(--muted)]">{q.courseTitle}</p>

      {isTyped ? (
        <p className="flex flex-wrap items-center gap-y-2 text-lg leading-10">
          {gaps.map((part, i) => (
            <span key={i} className="inline-flex items-center">
              <span className="whitespace-pre-wrap">{part}</span>
              {i < gaps.length - 1 && (
                <input
                  value={typed[i] ?? ""}
                  onChange={(e) =>
                    setTyped((prev) => {
                      const nextTyped = [...prev];
                      nextTyped[i] = e.target.value;
                      return nextTyped;
                    })
                  }
                  disabled={answered}
                  maxLength={24}
                  aria-label={`${t.question} ${index + 1}`}
                  autoComplete="off"
                  spellCheck={false}
                  style={{ width: `${Math.max(3, (q.answers[i]?.length ?? 1) + 2)}ch` }}
                  className="mx-1 rounded-lg border-2 border-[var(--border-soft)] bg-[var(--surface)] px-1 py-0.5 text-center font-bold outline-none focus:border-[var(--brand-500)]"
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
                disabled={answered}
                onClick={() => setChoice(oi)}
                className={`rounded-xl border px-4 py-2 text-left text-sm font-medium ${
                  answered && oi === q.correctIndex
                    ? "border-[var(--accent-green)] bg-[var(--surface-muted)]"
                    : choice === oi
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

      {answered && (
        <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
          <p className="mb-1 font-bold">{checked ? `✅ ${t.correct}` : `❌ ${t.wrong}`}</p>
          <p className="mb-1">
            <span className="font-semibold">{t.correctAnswer}:</span>{" "}
            {isTyped ? gaps.reduce((text, part, i) => text + part + (q.answers[i] ?? ""), "") : q.options[q.correctIndex]}
          </p>
          <p className="text-[var(--muted)]">
            <span className="font-semibold">{t.why}:</span> {q.explanation}
          </p>
          <Link href={`/${locale}/kurzy/${q.courseHref}`} className="mt-2 inline-block text-xs font-semibold text-[var(--brand-600)] hover:underline">
            {t.openCourse}
          </Link>
        </div>
      )}

      <div>
        {!answered ? (
          <button
            onClick={check}
            disabled={isTyped ? q.answers.some((_, i) => !(typed[i] ?? "").trim()) : choice === null}
            className="btn-bouncy bg-[var(--brand-500)] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {t.check}
          </button>
        ) : (
          <button onClick={next} className="btn-bouncy bg-[var(--brand-500)] px-6 py-2.5 text-sm font-bold text-white">
            {last ? t.finish : t.next}
          </button>
        )}
      </div>
    </div>
  );
}
