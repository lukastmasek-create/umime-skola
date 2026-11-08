"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call, errorCode, fmtDate } from "./api";
import { tfill } from "@/i18n/teams";
import { getTeamsAll, teamsAllError, type TeamsAll } from "@/i18n/teams-more";
import type { Locale } from "@/i18n/config";
import { TeamChat } from "./TeamChat";
import { Badge, Pill, Progress, colorOf } from "./ui";
import { AudiencePicker } from "./AudiencePicker";
import { dangerBtn, field, linkBtn, primaryBtn, type Audience, type Team } from "./types";

type Meta = { id: string; title: string; description: string; maxAttempts: number | null; passPercent: number; dueAt: string | null; groupIds?: string[]; userIds?: string[] };
type PQ = { id: number; prompt: string; options: string[]; gaps: number };
type Row = { userId: string; name: string; groupId: string | null; viewedAt: string | null; attempts: number; best: number; last: number | null; lastAt: string | null; late: boolean; status: "done" | "tried" | "viewed" | "new" };
type TQ = { prompt: string; answer: string; attempts: number; wrong: number };
type Data =
  | { role: "TEACHER"; assignment: Meta; groups: { id: string; name: string }[]; everyone: boolean; questions: TQ[]; rows: Row[] }
  | { role: "STUDENT"; assignment: Meta; questions: PQ[]; attempts: { percent: number; createdAt: string }[]; left: number | null; best: number };
type Result = { gainedXp?: number; correct: number; total: number; percent: number; passed: boolean; left: number | null; review: { id: number; correct: boolean; correctText: string; explanation: string }[] };

const STATUS_CLS = { done: "bg-[var(--accent-green)] text-white", tried: "bg-[var(--accent-yellow)]", viewed: "bg-[var(--brand-50)]", new: "bg-[var(--surface-muted)]" } as const;
const statusLabel = (t: TeamsAll, s: Row["status"]) => ({ done: t.sDone, tried: t.sTried, viewed: t.sViewed, new: t.sNew })[s];
const TILE = { done: "var(--accent-green)", tried: "var(--accent-yellow)", viewed: "var(--accent-blue)", new: "var(--border-soft)" } as const;
const ICON = { done: "✅", tried: "🔄", viewed: "👁", new: "🆕" } as const;
const isOverdue = (dueAt: string | null) => !!dueAt && new Date(dueAt).getTime() < Date.now();

export function AssignmentPage({ locale, teamId, assignmentId }: { locale: Locale; teamId: string; assignmentId: string }) {
  const t = getTeamsAll(locale);
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState("");
  const url = `/api/tymy/${teamId}/zadani/${assignmentId}`;

  const load = useCallback(async () => {
    try {
      const [d, tm] = await Promise.all([call<Data>(url), call<Team>(`/api/tymy/${teamId}`)]);
      setData(d);
      setTeam(tm);
    } catch (e) {
      setError(teamsAllError(t, errorCode(e)));
    }
  }, [url, teamId, t]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const back = <Link href={`/${locale}/tymy/${teamId}`} className="text-sm font-bold text-[var(--brand-600)]">{t.backTeam}</Link>;
  if (error) return <div className="card p-6">{back}<p className="mt-2 text-[var(--muted)]">{error}</p></div>;
  if (!data || !team) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  const a = data.assignment;
  const overdue = isOverdue(a.dueAt);

  return (
    <div className="flex flex-col gap-5">
      {back}
      <header
        className="card flex flex-col gap-2 p-5"
        style={{ background: data.role === "TEACHER" ? "linear-gradient(135deg, var(--brand-50), var(--surface))" : "linear-gradient(135deg, color-mix(in srgb, var(--accent-yellow) 30%, var(--surface)), var(--surface))", borderTop: `8px solid ${colorOf(team.name)}` }}
      >
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><Badge name={team.name} size={24} />{team.name}</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{data.role === "TEACHER" ? "📝" : "🎯"} {a.title}</h1>
        {a.description && <p className="whitespace-pre-wrap rounded-xl bg-[var(--surface)] p-3 text-sm">💡 {a.description}</p>}
        <div className="flex flex-wrap gap-2">
          <Pill tone="good">🏆 {tfill(t.taskMeta, data.questions.length, a.passPercent)}</Pill>
          <Pill>🔁 {a.maxAttempts == null ? t.attUnlimited : tfill(t.attMax, a.maxAttempts)}</Pill>
          {a.dueAt && <Pill tone={overdue ? "danger" : "warn"}>📅 {tfill(t.due, fmtDate(locale, a.dueAt))}{overdue && ` (${t.afterDeadline})`}</Pill>}
        </div>
      </header>

      {data.role === "TEACHER" ? (
        <>
          <TeacherTools t={t} locale={locale} team={team} teamId={teamId} meta={a} onChanged={load} onDeleted={() => router.push(`/${locale}/tymy/${teamId}`)} />
          <Dashboard t={t} locale={locale} data={data} overdue={overdue} onRefresh={load} />
        </>
      ) : <Runner t={t} data={data} url={url} onDone={load} />}

      <section className="card flex flex-col gap-2 p-4">
        <h2 className="text-lg font-extrabold">💬 {t.discussion}</h2>
        <TeamChat locale={locale} teamId={teamId} assignmentId={assignmentId} userId={team.userId} height="h-64" />
      </section>
    </div>
  );
}

/** Úprava, kopírování do jiné třídy a smazání zadání. */
function TeacherTools({ t, locale, team, teamId, meta, onChanged, onDeleted }: { t: TeamsAll; locale: Locale; team: Team; teamId: string; meta: Meta; onChanged: () => void; onDeleted: () => void }) {
  const [mode, setMode] = useState<"" | "edit" | "copy">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ text: string; href: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const toLocalInput = (v: string | null) => (v ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
  const [f, setF] = useState({ title: meta.title, description: meta.description, passPercent: meta.passPercent, unlimited: meta.maxAttempts == null, maxAttempts: meta.maxAttempts ?? 3, dueAt: toLocalInput(meta.dueAt) });
  const [aud, setAud] = useState<Audience>({ groupIds: meta.groupIds ?? [], userIds: meta.userIds ?? [] });
  const [targetTeam, setTargetTeam] = useState("");
  const [mine, setMine] = useState<{ id: string; name: string }[]>([]);
  const students = team.members.filter((m) => m.role === "STUDENT");

  useEffect(() => {
    if (mode !== "copy" || mine.length) return;
    call<{ teams: { id: string; name: string; role: string }[] }>("/api/tymy").then((d) => setMine(d.teams.filter((x) => x.role === "TEACHER"))).catch(() => {});
  }, [mode, mine.length]);

  async function run(body: object, after: () => void) {
    setBusy(true);
    setError("");
    try {
      await call(`/api/tymy/${teamId}`, body);
      after();
    } catch (e) {
      setError(teamsAllError(t, errorCode(e)));
    } finally {
      setBusy(false);
    }
  }
  const audienceKey = (v: Audience) => JSON.stringify([[...v.groupIds].sort(), [...v.userIds].sort()]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setMode(mode === "edit" ? "" : "edit")} aria-expanded={mode === "edit"} className={linkBtn}>✏️ {t.editTask}</button>
        <button onClick={() => setMode(mode === "copy" ? "" : "copy")} aria-expanded={mode === "copy"} className={linkBtn}>📋 {t.copyTask}</button>
        <button onClick={() => confirm(t.confirmDeleteTask) && run({ action: "deleteAssignment", assignmentId: meta.id }, onDeleted)} className={dangerBtn}>🗑 {t.deleteTask}</button>
      </div>
      {notice && <p role="status" className="text-sm font-semibold text-[var(--accent-green)]">{notice.text} <Link href={notice.href} className="underline">{t.openCopy}</Link></p>}
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}

      {mode === "edit" && (
        <form
          className="card flex flex-col gap-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void run(
              {
                action: "updateAssignment", assignmentId: meta.id, title: f.title, description: f.description, passPercent: f.passPercent,
                maxAttempts: f.unlimited ? null : f.maxAttempts, dueAt: f.dueAt ? new Date(f.dueAt).toISOString() : "",
                ...(audienceKey(aud) !== audienceKey({ groupIds: meta.groupIds ?? [], userIds: meta.userIds ?? [] }) ? { audience: aud } : {}),
              },
              () => { setMode(""); onChanged(); },
            );
          }}
        >
          <h2 className="text-lg font-extrabold">{t.editTask}</h2>
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={80} aria-label={t.taskTitlePh} className={field} required />
          <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={1000} rows={2} aria-label={t.instrPh} placeholder={t.instrPh} className={field} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">{t.passLabel}<input type="number" min={0} max={100} value={f.passPercent} onChange={(e) => setF({ ...f, passPercent: Number(e.target.value) })} className={field} /></label>
            <div className="flex flex-col gap-1 text-sm font-semibold">
              {t.attemptsLabel}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1"><input type="checkbox" checked={f.unlimited} onChange={(e) => setF({ ...f, unlimited: e.target.checked })} className="size-4" /> {t.unlimited}</label>
                {!f.unlimited && <input type="number" min={1} max={20} value={f.maxAttempts} onChange={(e) => setF({ ...f, maxAttempts: Number(e.target.value) })} aria-label={t.attemptsLabel} className={`${field} w-24`} />}
              </div>
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">{t.dueLabel}<input type="datetime-local" value={f.dueAt} onChange={(e) => setF({ ...f, dueAt: e.target.value })} className={field} /></label>
          </div>
          <AudiencePicker t={t} groups={team.groups} students={students} value={aud} onChange={setAud} />
          <div className="flex gap-2">
            <button disabled={busy} className={primaryBtn}>{t.save}</button>
            <button type="button" onClick={() => setMode("")} className="px-3 text-sm font-bold">{t.cancel}</button>
          </div>
        </form>
      )}

      {mode === "copy" && (
        <form
          className="card flex flex-wrap items-center gap-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run({ action: "copyAssignment", assignmentId: meta.id, targetTeamId: targetTeam }, () => {
              setNotice({ text: t.copied, href: `/${locale}/tymy/${targetTeam}` });
              setMode("");
            });
          }}
        >
          <select value={targetTeam} onChange={(e) => setTargetTeam(e.target.value)} aria-label={t.copyTo} className={`${field} min-w-0 flex-1`} required>
            <option value="">{t.copyTo}</option>
            {mine.map((m) => <option key={m.id} value={m.id}>{m.name}{m.id === teamId ? ` (${t.thisClass})` : ""}</option>)}
          </select>
          <button disabled={busy || !targetTeam} className={primaryBtn}>{t.copyBtn}</button>
        </form>
      )}
    </section>
  );
}

function Dashboard({ t, locale, data, overdue, onRefresh }: { t: TeamsAll; locale: Locale; data: Extract<Data, { role: "TEACHER" }>; overdue: boolean; onRefresh: () => void }) {
  const missing = (r: Row) => overdue && r.status !== "done";
  const count = (s: Row["status"]) => data.rows.filter((r) => r.status === s).length;
  const groupName = (id: string | null) => data.groups.find((g) => g.id === id)?.name;
  const hard = data.questions
    .map((q, i) => ({ ...q, i, rate: q.attempts ? q.wrong / q.attempts : 0 }))
    .filter((q) => q.attempts > 0 && q.wrong > 0)
    .sort((a, b) => b.rate - a.rate);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">📊 {t.overview}</h2>
        <button onClick={onRefresh} className="text-sm font-bold text-[var(--brand-600)]">{t.refresh}</button>
      </div>
      {!data.everyone && <p className="text-sm text-[var(--muted)]">{tfill(t.onlyFor, data.rows.length)}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(["done", "tried", "viewed", "new"] as const).map((s) => (
          <div key={s} className="card p-3 text-center" style={{ borderTop: `6px solid ${TILE[s]}` }}><p className="text-2xl font-extrabold">{ICON[s]} {count(s)}</p><p className="text-xs font-semibold text-[var(--muted)]">{statusLabel(t, s)}</p></div>
        ))}
        {overdue && <div className="card p-3 text-center" style={{ borderTop: "6px solid var(--danger)" }}><p className="text-2xl font-extrabold text-[var(--danger)]">⚠️ {data.rows.filter(missing).length}</p><p className="text-xs font-semibold text-[var(--muted)]">{t.sMissing}</p></div>}
      </div>
      {data.rows.length > 0 && <Progress value={count("done")} max={data.rows.length} color="var(--accent-green)" label={`✅ ${count("done")} / ${data.rows.length}`} />}
      {data.rows.length === 0 && <p className="text-[var(--muted)]">{t.noStudents}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b-2 border-[var(--border-soft)]"><th scope="col" className="p-3">{t.colStudent}</th><th scope="col" className="p-3">{t.colStatus}</th><th scope="col" className="p-3">{t.colViewed}</th><th scope="col" className="p-3">{t.colAttempts}</th><th scope="col" className="p-3">{t.colBest}</th><th scope="col" className="p-3">{t.colLast}</th></tr></thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.userId} className="border-b border-[var(--border-soft)] last:border-0">
                <td className="p-3 font-semibold"><span className="flex items-center gap-2"><Badge name={r.name} size={28} round />{r.name || t.student}{groupName(r.groupId) && <Pill tone="brand">{groupName(r.groupId)}</Pill>}</span></td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${missing(r) ? "bg-[var(--danger)] text-white" : STATUS_CLS[r.status]}`}>{missing(r) ? t.sMissing : statusLabel(t, r.status)}</span>
                  {r.late && <span className="ml-1 rounded-full bg-[var(--accent-yellow)] px-2 py-0.5 text-xs font-bold">{t.late}</span>}
                </td>
                <td className="p-3">{r.viewedAt ? fmtDate(locale, r.viewedAt) : "—"}</td>
                <td className="p-3">{r.attempts}</td>
                <td className="p-3">{r.attempts ? <span className="block w-24"><Progress value={r.best} max={100} color={r.best >= 50 ? "var(--accent-green)" : "var(--accent-yellow)"} label={`${r.best} %`} /></span> : "—"}</td>
                <td className="p-3">{r.last != null ? `${r.last} % (${fmtDate(locale, r.lastAt)})` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card flex flex-col gap-2 p-4" aria-label={t.hardQuestions}>
        <h3 className="text-lg font-extrabold">🔥 {t.hardQuestions}</h3>
        {hard.length === 0 ? <p className="text-sm text-[var(--muted)]">{t.noMistakes}</p> : (
          <ol className="flex flex-col gap-2">
            {hard.slice(0, 10).map((q) => (
              <li key={q.i} className="text-sm">
                <p className="flex items-baseline justify-between gap-3"><span className="min-w-0">{q.i + 1}. {q.prompt.replace(/___/g, "____")}</span><b className="shrink-0">{Math.round(q.rate * 100)} %</b></p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="img" aria-label={tfill(t.wrongOf, q.wrong, q.attempts)}><div className="h-full bg-[var(--danger)]" style={{ width: `${Math.round(q.rate * 100)}%` }} /></div>
                <p className="text-xs text-[var(--muted)]">{tfill(t.wrongOf, q.wrong, q.attempts)} · {t.correctIs} <b>{q.answer}</b></p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <details className="card p-4"><summary className="cursor-pointer font-bold">{tfill(t.qAndA, data.questions.length)}</summary>
        <ol className="mt-2 list-decimal pl-5 text-sm">{data.questions.map((q, i) => <li key={i} className="mb-1">{q.prompt} → <b>{q.answer}</b></li>)}</ol>
      </details>
    </section>
  );
}

function Runner({ t, data, url, onDone }: { t: TeamsAll; data: Extract<Data, { role: "STUDENT" }>; url: string; onDone: () => void }) {
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
      setError(teamsAllError(t, errorCode(e)));
    } finally {
      setBusy(false);
    }
  }
  const retry = () => { setAnswers({}); setResult(null); setStarted(true); };

  if (result) {
    return (
      <section className="card flex flex-col gap-3 p-5">
        <h2 className={`rounded-xl p-3 text-2xl font-extrabold ${result.passed ? "bg-[var(--accent-green)] text-white" : "bg-[var(--accent-yellow)] text-[#16132b]"}`}>{result.passed ? "🎉" : "💪"} {tfill(t.resultLine, result.correct, result.total, result.percent, result.passed ? t.passed : t.notPassed)}</h2>
        <Progress value={result.correct} max={result.total} color={result.passed ? "var(--accent-green)" : "var(--accent-yellow)"} />
        <ol className="flex flex-col gap-2">
          {data.questions.map((q) => {
            const r = result.review[q.id];
            return (
              <li key={q.id} className={`rounded-xl border-2 p-3 text-sm ${r.correct ? "border-[var(--accent-green)]" : "border-[var(--danger)]"}`}>
                <p className="font-semibold">{r.correct ? "✅" : "❌"} {q.prompt.replace(/___/g, "____")}</p>
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
        <p className="text-sm">{data.attempts.length ? "🕑 " : "🚀 "}{data.attempts.length ? tfill(t.prevAttempts, data.attempts.map((a) => `${a.percent} %`).join(", "), data.best) : t.notTried}</p>
        {data.attempts.length > 0 && <Progress value={Math.min(data.best, 100)} max={Math.max(data.assignment.passPercent, 1)} color={data.best >= data.assignment.passPercent ? "var(--accent-green)" : "var(--accent-yellow)"} label={`🏆 ${data.best} % / ${data.assignment.passPercent} %`} />}
        <p className="text-sm text-[var(--muted)]">{data.left == null ? t.unlimitedAttempts : tfill(t.leftN, data.left)}</p>
        {out ? <p className="font-bold text-[var(--danger)]">{t.outOfAttempts}</p> : <button onClick={() => setStarted(true)} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">{data.attempts.length ? t.next : t.start}</button>}
      </section>
    );
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      {data.left != null && <p className="text-sm font-semibold text-[var(--muted)]">{tfill(t.thisAttempt, data.left)}</p>}
      <div className="sticky top-2 z-10 rounded-xl bg-[var(--surface)] p-2">
        <Progress value={data.questions.filter((q) => { const x = answers[q.id]; return x && (x.choice != null || x.typed?.some((v) => v.trim())); }).length} max={data.questions.length} color="var(--brand-500)" label={`✍️ ${data.questions.filter((q) => { const x = answers[q.id]; return x && (x.choice != null || x.typed?.some((v) => v.trim())); }).length} / ${data.questions.length}`} />
      </div>
      <ol className="flex flex-col gap-4">
        {data.questions.map((q) => (
          <li key={q.id} className="flex flex-col gap-2 rounded-xl border-2 border-[var(--border-soft)] p-3">
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
