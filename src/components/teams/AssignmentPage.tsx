"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { call, errorCode, fmtDate } from "./api";
import { getTeamsText, teamsError, tfill, type TeamsText } from "@/i18n/teams";
import type { Locale } from "@/i18n/config";
import { TeamChat } from "./TeamChat";

type Meta = { id: string; title: string; description: string; maxAttempts: number | null; passPercent: number; dueAt: string | null };
type PQ = { id: number; prompt: string; options: string[]; gaps: number };
type Row = { userId: string; name: string; viewedAt: string | null; attempts: number; best: number; last: number | null; lastAt: string | null; status: "done" | "tried" | "viewed" | "new" };
type Data =
  | { role: "TEACHER"; assignment: Meta; questions: { prompt: string; answer: string }[]; rows: Row[] }
  | { role: "STUDENT"; assignment: Meta; questions: PQ[]; attempts: { percent: number; createdAt: string }[]; left: number | null; best: number };
type Result = { gainedXp?: number; correct: number; total: number; percent: number; passed: boolean; left: number | null; review: { id: number; correct: boolean; correctText: string; explanation: string }[] };

const STATUS_CLS = { done: "bg-[var(--accent-green)] text-white", tried: "bg-[var(--accent-yellow)]", viewed: "bg-[var(--brand-50)]", new: "bg-[var(--surface-muted)]" } as const;
const statusLabel = (t: TeamsText, s: Row["status"]) => ({ done: t.sDone, tried: t.sTried, viewed: t.sViewed, new: t.sNew })[s];

export function AssignmentPage({ locale, teamId, assignmentId }: { locale: Locale; teamId: string; assignmentId: string }) {
  const t = getTeamsText(locale);
  const [data, setData] = useState<Data | null>(null);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const url = `/api/tymy/${teamId}/zadani/${assignmentId}`;

  const load = useCallback(async () => {
    try {
      setData(await call<Data>(url));
      setUserId((await call<{ userId: string }>(`/api/tymy/${teamId}`)).userId);
    } catch (e) {
      setError(teamsError(t, errorCode(e)));
    }
  }, [url, teamId, t]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const back = <Link href={`/${locale}/tymy/${teamId}`} className="text-sm font-bold text-[var(--brand-600)]">{t.backTeam}</Link>;
  if (error) return <div className="card p-6">{back}<p className="mt-2 text-[var(--muted)]">{error}</p></div>;
  if (!data) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  const a = data.assignment;

  return (
    <div className="flex flex-col gap-5">
      <div>
        {back}
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{a.title}</h1>
        {a.description && <p className="mt-1 whitespace-pre-wrap text-[var(--muted)]">{a.description}</p>}
        <p className="mt-1 text-sm text-[var(--muted)]">{tfill(t.taskMeta, data.questions.length, a.passPercent)} · {a.maxAttempts == null ? t.attUnlimited : tfill(t.attMax, a.maxAttempts)}{a.dueAt && ` · ${tfill(t.due, fmtDate(locale, a.dueAt))}`}</p>
      </div>

      {data.role === "TEACHER" ? <Dashboard t={t} locale={locale} data={data} onRefresh={load} /> : <Runner t={t} data={data} url={url} onDone={load} />}

      <section className="card flex flex-col gap-2 p-4">
        <h2 className="text-lg font-extrabold">{t.discussion}</h2>
        {userId && <TeamChat locale={locale} teamId={teamId} assignmentId={assignmentId} userId={userId} height="h-64" />}
      </section>
    </div>
  );
}

function Dashboard({ t, locale, data, onRefresh }: { t: TeamsText; locale: Locale; data: Extract<Data, { role: "TEACHER" }>; onRefresh: () => void }) {
  const count = (s: Row["status"]) => data.rows.filter((r) => r.status === s).length;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">{t.overview}</h2>
        <button onClick={onRefresh} className="text-sm font-bold text-[var(--brand-600)]">{t.refresh}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["done", "tried", "viewed", "new"] as const).map((s) => (
          <div key={s} className="card p-3 text-center"><p className="text-2xl font-extrabold">{count(s)}</p><p className="text-xs font-semibold text-[var(--muted)]">{statusLabel(t, s)}</p></div>
        ))}
      </div>
      {data.rows.length === 0 && <p className="text-[var(--muted)]">{t.noStudents}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b-2 border-[var(--border-soft)]"><th className="p-3">{t.colStudent}</th><th className="p-3">{t.colStatus}</th><th className="p-3">{t.colViewed}</th><th className="p-3">{t.colAttempts}</th><th className="p-3">{t.colBest}</th><th className="p-3">{t.colLast}</th></tr></thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.userId} className="border-b border-[var(--border-soft)] last:border-0">
                <td className="p-3 font-semibold">{r.name || t.student}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_CLS[r.status]}`}>{statusLabel(t, r.status)}</span></td>
                <td className="p-3">{r.viewedAt ? fmtDate(locale, r.viewedAt) : "—"}</td>
                <td className="p-3">{r.attempts}</td>
                <td className="p-3">{r.attempts ? `${r.best} %` : "—"}</td>
                <td className="p-3">{r.last != null ? `${r.last} % (${fmtDate(locale, r.lastAt)})` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="card p-4"><summary className="cursor-pointer font-bold">{tfill(t.qAndA, data.questions.length)}</summary>
        <ol className="mt-2 list-decimal pl-5 text-sm">{data.questions.map((q, i) => <li key={i} className="mb-1">{q.prompt} → <b>{q.answer}</b></li>)}</ol>
      </details>
    </section>
  );
}

function Runner({ t, data, url, onDone }: { t: TeamsText; data: Extract<Data, { role: "STUDENT" }>; url: string; onDone: () => void }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { choice?: number; typed?: string[] }>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const out = data.left === 0 && !started && !result;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      setResult(await call<Result>(url, { answers }));
      setStarted(false);
      onDone();
    } catch (e) {
      setError(teamsError(t, errorCode(e)));
    } finally {
      setBusy(false);
    }
  }
  const retry = () => { setAnswers({}); setResult(null); setStarted(true); };

  if (result) {
    return (
      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-2xl font-extrabold">{tfill(t.resultLine, result.correct, result.total, result.percent, result.passed ? t.passed : t.notPassed)}</h2>
        <ol className="flex flex-col gap-2">
          {data.questions.map((q) => {
            const r = result.review[q.id];
            return (
              <li key={q.id} className={`rounded-xl border-2 p-3 text-sm ${r.correct ? "border-[var(--accent-green)]" : "border-[var(--danger)]"}`}>
                <p className="font-semibold">{q.prompt.replace(/___/g, "____")}</p>
                {!r.correct && <p>{t.correctIs} <b>{r.correctText}</b></p>}
                {r.explanation && <p className="text-[var(--muted)]">{r.explanation}</p>}
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-[var(--muted)]">{result.gainedXp ? <b>{tfill(t.xpGained, result.gainedXp)} · </b> : null}{result.left == null ? t.unlimitedAttempts : tfill(t.leftN, result.left)}</p>
        {(result.left == null || result.left > 0) && <button onClick={retry} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">{t.retry}</button>}
      </section>
    );
  }

  if (!started) {
    return (
      <section className="card flex flex-col gap-3 p-5">
        <p className="text-sm">{data.attempts.length ? tfill(t.prevAttempts, data.attempts.map((a) => `${a.percent} %`).join(", "), data.best) : t.notTried}</p>
        <p className="text-sm text-[var(--muted)]">{data.left == null ? t.unlimitedAttempts : tfill(t.leftN, data.left)}</p>
        {out ? <p className="font-bold text-[var(--danger)]">{t.outOfAttempts}</p> : <button onClick={() => setStarted(true)} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">{data.attempts.length ? t.next : t.start}</button>}
      </section>
    );
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      {data.left != null && <p className="text-sm font-semibold text-[var(--muted)]">{tfill(t.thisAttempt, data.left)}</p>}
      <ol className="flex flex-col gap-4">
        {data.questions.map((q) => (
          <li key={q.id} className="flex flex-col gap-2">
            {q.gaps > 0 ? (
              <>
                <p className="font-semibold">{q.id + 1}. {q.prompt.replace(/___/g, "____")}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: q.gaps }, (_, g) => (
                    <input key={g} aria-label={tfill(t.fillAria, g + 1)} value={answers[q.id]?.typed?.[g] ?? ""} onChange={(e) => setAnswers((p) => { const typed = [...(p[q.id]?.typed ?? Array(q.gaps).fill(""))]; typed[g] = e.target.value; return { ...p, [q.id]: { typed } }; })} className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-1.5 text-sm" />
                  ))}
                </div>
              </>
            ) : (
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1 font-semibold">{q.id + 1}. {q.prompt}</legend>
                {q.options.map((o, i) => (
                  <label key={i} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm ${answers[q.id]?.choice === i ? "border-[var(--edge)] bg-[var(--brand-50)]" : "border-[var(--border-soft)]"}`}>
                    <input type="radio" name={`q${q.id}`} checked={answers[q.id]?.choice === i} onChange={() => setAnswers((p) => ({ ...p, [q.id]: { choice: i } }))} /> {o}
                  </label>
                ))}
              </fieldset>
            )}
          </li>
        ))}
      </ol>
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <button disabled={busy} onClick={submit} className="btn-bouncy self-start bg-[var(--accent-green)] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">{t.submit}</button>
    </section>
  );
}
