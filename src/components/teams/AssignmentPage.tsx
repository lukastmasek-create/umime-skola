"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { call, fmtDate } from "./api";
import { TeamChat } from "./TeamChat";

type Meta = { id: string; title: string; description: string; maxAttempts: number | null; passPercent: number; dueAt: string | null };
type PQ = { id: number; prompt: string; options: string[]; gaps: number };
type Row = { userId: string; name: string; viewedAt: string | null; attempts: number; best: number; last: number | null; lastAt: string | null; status: "done" | "tried" | "viewed" | "new" };
type Data =
  | { role: "TEACHER"; assignment: Meta; questions: { prompt: string; answer: string }[]; rows: Row[] }
  | { role: "STUDENT"; assignment: Meta; questions: PQ[]; attempts: { percent: number; createdAt: string }[]; left: number | null; best: number };
type Result = { correct: number; total: number; percent: number; passed: boolean; left: number | null; review: { id: number; correct: boolean; correctText: string; explanation: string }[] };

const STATUS = { done: ["Splnil", "bg-[var(--accent-green)] text-white"], tried: ["Zkoušel, nesplnil", "bg-[var(--accent-yellow)]"], viewed: ["Zobrazil, nezačal", "bg-[var(--brand-50)]"], new: ["Nezobrazil", "bg-[var(--surface-muted)]"] } as const;

export function AssignmentPage({ locale, teamId, assignmentId }: { locale: string; teamId: string; assignmentId: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const url = `/api/tymy/${teamId}/zadani/${assignmentId}`;

  const load = useCallback(async () => {
    try {
      setData(await call<Data>(url));
      setUserId((await call<{ userId: string }>(`/api/tymy/${teamId}`)).userId);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [url, teamId]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const back = <Link href={`/${locale}/tymy/${teamId}`} className="text-sm font-bold text-[var(--brand-600)]">← Zpět do týmu</Link>;
  if (error) return <div className="card p-6">{back}<p className="mt-2 text-[var(--muted)]">{error}</p></div>;
  if (!data) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  const a = data.assignment;

  return (
    <div className="flex flex-col gap-5">
      <div>
        {back}
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{a.title}</h1>
        {a.description && <p className="mt-1 whitespace-pre-wrap text-[var(--muted)]">{a.description}</p>}
        <p className="mt-1 text-sm text-[var(--muted)]">Splněno od {a.passPercent} % · {a.maxAttempts == null ? "neomezeně pokusů" : `max. ${a.maxAttempts} pokusů`}{a.dueAt && ` · termín ${fmtDate(a.dueAt)}`}</p>
      </div>

      {data.role === "TEACHER" ? <Dashboard data={data} onRefresh={load} /> : <Runner data={data} url={url} onDone={load} />}

      <section className="card flex flex-col gap-2 p-4">
        <h2 className="text-lg font-extrabold">Diskuse k zadání</h2>
        {userId && <TeamChat teamId={teamId} assignmentId={assignmentId} userId={userId} height="h-64" />}
      </section>
    </div>
  );
}

function Dashboard({ data, onRefresh }: { data: Extract<Data, { role: "TEACHER" }>; onRefresh: () => void }) {
  const count = (s: Row["status"]) => data.rows.filter((r) => r.status === s).length;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">Přehled třídy</h2>
        <button onClick={onRefresh} className="text-sm font-bold text-[var(--brand-600)]">Obnovit</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["done", "tried", "viewed", "new"] as const).map((s) => (
          <div key={s} className="card p-3 text-center"><p className="text-2xl font-extrabold">{count(s)}</p><p className="text-xs font-semibold text-[var(--muted)]">{STATUS[s][0]}</p></div>
        ))}
      </div>
      {data.rows.length === 0 && <p className="text-[var(--muted)]">V týmu zatím nejsou žádní žáci. Přidej je v záložce Lidé.</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b-2 border-[var(--border-soft)]"><th className="p-3">Žák</th><th className="p-3">Stav</th><th className="p-3">Zobrazeno</th><th className="p-3">Pokusů</th><th className="p-3">Nejlépe</th><th className="p-3">Poslední</th></tr></thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.userId} className="border-b border-[var(--border-soft)] last:border-0">
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</span></td>
                <td className="p-3">{r.viewedAt ? fmtDate(r.viewedAt) : "—"}</td>
                <td className="p-3">{r.attempts}</td>
                <td className="p-3">{r.attempts ? `${r.best} %` : "—"}</td>
                <td className="p-3">{r.last != null ? `${r.last} % (${fmtDate(r.lastAt)})` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="card p-4"><summary className="cursor-pointer font-bold">Otázky a správné odpovědi ({data.questions.length})</summary>
        <ol className="mt-2 list-decimal pl-5 text-sm">{data.questions.map((q, i) => <li key={i} className="mb-1">{q.prompt} → <b>{q.answer}</b></li>)}</ol>
      </details>
    </section>
  );
}

function Runner({ data, url, onDone }: { data: Extract<Data, { role: "STUDENT" }>; url: string; onDone: () => void }) {
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
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const retry = () => { setAnswers({}); setResult(null); setStarted(true); };

  if (result) {
    return (
      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-2xl font-extrabold">{result.correct} / {result.total} ({result.percent} %) – {result.passed ? "splněno 🎉" : "zatím nesplněno"}</h2>
        <ol className="flex flex-col gap-2">
          {data.questions.map((q) => {
            const r = result.review[q.id];
            return (
              <li key={q.id} className={`rounded-xl border-2 p-3 text-sm ${r.correct ? "border-[var(--accent-green)]" : "border-[var(--danger)]"}`}>
                <p className="font-semibold">{q.prompt.replace(/___/g, "____")}</p>
                {!r.correct && <p>Správně: <b>{r.correctText}</b></p>}
                {r.explanation && <p className="text-[var(--muted)]">{r.explanation}</p>}
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-[var(--muted)]">{result.left == null ? "Pokusů máš neomezeně." : `Zbývá pokusů: ${result.left}`}</p>
        {(result.left == null || result.left > 0) && <button onClick={retry} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">Zkusit znovu</button>}
      </section>
    );
  }

  if (!started) {
    return (
      <section className="card flex flex-col gap-3 p-5">
        <p className="text-sm">{data.attempts.length ? `Dosavadní pokusy: ${data.attempts.map((a) => `${a.percent} %`).join(", ")} (nejlépe ${data.best} %)` : "Zatím jsi to nezkoušel/a."}</p>
        <p className="text-sm text-[var(--muted)]">{data.left == null ? "Pokusů máš neomezeně." : `Zbývá pokusů: ${data.left}`}</p>
        {out ? <p className="font-bold text-[var(--danger)]">Všechny pokusy jsi vyčerpal/a.</p> : <button onClick={() => setStarted(true)} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">{data.attempts.length ? "Další pokus" : "Začít"}</button>}
      </section>
    );
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      {data.left != null && <p className="text-sm font-semibold text-[var(--muted)]">Tohle je jeden z tvých pokusů (zbývá {data.left}).</p>}
      <ol className="flex flex-col gap-4">
        {data.questions.map((q) => (
          <li key={q.id} className="flex flex-col gap-2">
            {q.gaps > 0 ? (
              <>
                <p className="font-semibold">{q.id + 1}. {q.prompt.replace(/___/g, "____")}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: q.gaps }, (_, g) => (
                    <input key={g} aria-label={`Doplň ${g + 1}`} value={answers[q.id]?.typed?.[g] ?? ""} onChange={(e) => setAnswers((p) => { const typed = [...(p[q.id]?.typed ?? Array(q.gaps).fill(""))]; typed[g] = e.target.value; return { ...p, [q.id]: { typed } }; })} className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-1.5 text-sm" />
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
      <button disabled={busy} onClick={submit} className="btn-bouncy self-start bg-[var(--accent-green)] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">Odevzdat</button>
    </section>
  );
}
