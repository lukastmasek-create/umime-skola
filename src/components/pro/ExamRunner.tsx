"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { EXAM_MAX_POINTS, EXAM_SIZES, type ExamScore } from "@/lib/pro-tools/exam";
import { errorText, proFetch } from "./api";

type Q = { id: string; prompt: string; options: string[]; courseTitle: string };
type Review = { id: string; prompt: string; options: string[]; correctIndex: number; chosen: number | null; explanation: string; courseId: string };
type History = { date: string; subject: string; percent: number; points: number; total: number };
type Phase = "setup" | "loading" | "running" | "submitting" | "done";

const SUBJECTS = ["MATEMATIKA", "CESTINA", "ANGLICTINA"] as const;

// Zkouška nanečisto: časový limit, jedna otázka po druhé, odevzdání a odhad bodů. Chyby se zapíší do opakování.
export function ExamRunner({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [phase, setPhase] = useState<Phase>("setup");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("MATEMATIKA");
  const [size, setSize] = useState<number>(EXAM_SIZES[0]);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [error, setError] = useState("");
  const [score, setScore] = useState<ExamScore | null>(null);
  const [review, setReview] = useState<Review[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const submitted = useRef(false);

  useEffect(() => {
    void proFetch<{ history: History[] }>("/api/pro/zkouska?history=1").then((r) => r.ok && setHistory(r.data.history));
  }, []);

  const submit = useCallback(
    async (qs: Q[], ans: Record<string, number | null>, subj: string) => {
      if (submitted.current) return;
      submitted.current = true;
      setPhase("submitting");
      const body = Object.fromEntries(qs.map((q) => [q.id, ans[q.id] ?? null]));
      const r = await proFetch<{ score: ExamScore; review: Review[]; history: History[] }>("/api/pro/zkouska", { answers: body, subject: subj });
      if (!r.ok) {
        submitted.current = false;
        setError(errorText(t, r.error));
        setPhase("running");
        return;
      }
      setScore(r.data.score);
      setReview(r.data.review);
      setHistory(r.data.history);
      setPhase("done");
      // Chyby i správné odpovědi jdou do opakování, takže se zapíšou i do sešitu chyb.
      void proFetch("/api/opakovani", { results: r.data.review.map((x) => ({ id: x.id, correct: x.chosen === x.correctIndex })) });
    },
    [t],
  );

  // Odevzdání po vypršení času: časovač čte aktuální stav přes ref, aby se neobnovoval při každé odpovědi.
  const latest = useRef({ questions, answers, subject });
  useEffect(() => {
    latest.current = { questions, answers, subject };
  });

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          const l = latest.current;
          void submit(l.questions, l.answers, l.subject);
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submit]);

  async function start() {
    setError("");
    setPhase("loading");
    submitted.current = false;
    const r = await proFetch<{ questions: Q[]; minutes: number }>(`/api/pro/zkouska?predmet=${subject}&n=${size}`);
    if (!r.ok) {
      setError(errorText(t, r.error));
      setPhase("setup");
      return;
    }
    setQuestions(r.data.questions);
    setAnswers({});
    setIndex(0);
    setLeft(r.data.minutes * 60);
    setPhase("running");
  }

  const heading = { fontFamily: "var(--font-heading)" } as const;

  if (phase === "setup" || phase === "loading") {
    return (
      <div className="grid gap-5">
        <div className="card grid gap-4 p-5">
          <p className="text-sm text-[var(--muted)]">{t.examIntro}</p>
          <div>
            <p className="mb-2 text-sm font-bold">{t.examSubject}</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button key={s} type="button" onClick={() => setSubject(s)} className={`btn-bouncy px-4 py-2 text-sm font-bold ${subject === s ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
                  {t.subjects[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">{t.examSize}</p>
            <div className="flex flex-wrap gap-2">
              {EXAM_SIZES.map((n) => (
                <button key={n} type="button" onClick={() => setSize(n)} className={`btn-bouncy px-4 py-2 text-sm font-bold ${size === n ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
                  {t.examQuestions.replace("{n}", String(n))}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
          <button type="button" onClick={start} disabled={phase === "loading"} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white disabled:opacity-60">
            {phase === "loading" ? t.loading : t.examStart}
          </button>
        </div>
        {history.length > 0 && (
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-bold" style={heading}>
              {t.examHistory}
            </h2>
            <ul className="grid gap-1 text-sm">
              {history.slice().reverse().slice(0, 8).map((h, i) => (
                <li key={i} className="flex justify-between border-t border-[var(--edge)] pt-1 first:border-t-0 first:pt-0">
                  <span>
                    {h.date} · {t.subjects[h.subject as (typeof SUBJECTS)[number]] ?? h.subject}
                  </span>
                  <span className="font-bold">
                    {h.points}/{EXAM_MAX_POINTS} · {h.percent} %
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  if (phase === "done" && score) {
    const wrong = review.filter((r) => r.chosen !== r.correctIndex);
    return (
      <div className="grid gap-5">
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold text-[var(--muted)]">{t.examResult}</p>
          <p className="my-1 text-5xl font-extrabold tabular-nums" style={heading}>
            {score.points}/{EXAM_MAX_POINTS}
          </p>
          <p className="text-sm">
            {t.examCorrect.replace("{c}", String(score.correct)).replace("{n}", String(score.total)).replace("{p}", String(score.percent))}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{t.examEstimate.replace("{a}", String(score.low)).replace("{b}", String(score.high))}</p>
          <button type="button" onClick={() => setPhase("setup")} className="btn-bouncy btn-secondary btn-lg mt-4">
            {t.examAgain}
          </button>
        </div>
        {wrong.length > 0 && (
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-bold" style={heading}>
              {t.examMistakes}
            </h2>
            <ol className="grid gap-4">
              {wrong.map((r, i) => (
                <li key={r.id} className="border-t border-[var(--edge)] pt-3 first:border-t-0 first:pt-0">
                  <p className="font-semibold">
                    {i + 1}. {r.prompt}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold text-[#ff5d73]">{t.yourAnswer}: </span>
                    {r.chosen === null ? t.noAnswer : r.options[r.chosen]}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-[var(--accent-green)]">{t.correctAnswer}: </span>
                    {r.options[r.correctIndex]}
                  </p>
                  {r.explanation && <p className="mt-1 text-sm text-[var(--muted)]">{r.explanation}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    );
  }

  const q = questions[index];
  if (!q) return null;
  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, "0");
  const ss = String(Math.max(0, left % 60)).padStart(2, "0");
  const answered = Object.values(answers).filter((a) => a !== null && a !== undefined).length;

  return (
    <div className="grid gap-4">
      <div className="card flex items-center justify-between p-4 text-sm font-bold">
        <span>
          {index + 1}/{questions.length}
        </span>
        <span className={left < 60 ? "text-[#ff5d73]" : ""} aria-live="off">
          ⏱ {mm}:{ss}
        </span>
        <span className="text-[var(--muted)]">{t.examAnswered.replace("{n}", String(answered))}</span>
      </div>
      <div className="card p-5">
        <p className="mb-1 text-xs text-[var(--faint)]">{q.courseTitle}</p>
        <p className="mb-4 text-lg font-semibold">{q.prompt}</p>
        <div className="grid gap-2">
          {q.options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: a[q.id] === i ? null : i }))}
              className={`rounded-xl border-2 border-[var(--edge)] px-4 py-3 text-left text-sm font-semibold ${answers[q.id] === i ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="btn-bouncy btn-secondary btn-lg disabled:opacity-40">
          {t.back}
        </button>
        {index < questions.length - 1 ? (
          <button type="button" onClick={() => setIndex((i) => i + 1)} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
            {t.next}
          </button>
        ) : (
          <button type="button" disabled={phase === "submitting"} onClick={() => void submit(questions, answers, subject)} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white disabled:opacity-60">
            {t.examFinish}
          </button>
        )}
      </div>
    </div>
  );
}
