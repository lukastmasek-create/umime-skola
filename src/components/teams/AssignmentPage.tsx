"use client";

import { Fragment, useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call, errorCode, fmtDate } from "./api";
import { tfill } from "@/i18n/teams";
import { getTeamsAll, teamsAllError, type TeamsAll } from "@/i18n/teams-more";
import type { Locale } from "@/i18n/config";
import { TeamChat } from "./TeamChat";
import { Badge, Progress, SideLayout } from "./ui";
import { AudiencePicker } from "./AudiencePicker";
import { field, primaryBtn, type Audience, type Team } from "./types";
import { EdxStats, ICONS } from "./EdxStats";
import { getTeamsEdx } from "@/i18n/teams-edx";

type Meta = { id: string; title: string; description: string; maxAttempts: number | null; passPercent: number; dueAt: string | null; groupIds?: string[]; userIds?: string[] };
type PQ = { id: number; prompt: string; options: string[]; gaps: number };
type Row = { userId: string; comment: string; name: string; groupId: string | null; viewedAt: string | null; attempts: number; best: number; last: number | null; lastAt: string | null; late: boolean; status: "done" | "tried" | "viewed" | "new" };
type TQ = { prompt: string; answer: string; attempts: number; wrong: number };
type Data =
  | { role: "TEACHER"; assignment: Meta; groups: { id: string; name: string }[]; everyone: boolean; questions: TQ[]; rows: Row[] }
  | { role: "STUDENT"; assignment: Meta; questions: PQ[]; attempts: { percent: number; createdAt: string }[]; left: number | null; best: number; feedback: string };
type Result = { gainedXp?: number; correct: number; total: number; percent: number; passed: boolean; left: number | null; review: { id: number; correct: boolean; correctText: string; explanation: string }[] };

const STATUS_CLS = { done: "bg-[color-mix(in_srgb,var(--accent-green)_18%,transparent)] text-[var(--accent-green)]", tried: "bg-[color-mix(in_srgb,var(--accent-yellow)_25%,transparent)]", viewed: "bg-[var(--brand-50)] text-[var(--brand-700)]", new: "bg-[var(--surface-muted)] text-[var(--muted)]" } as const;
const statusLabel = (t: TeamsAll, s: Row["status"]) => ({ done: t.sDone, tried: t.sTried, viewed: t.sViewed, new: t.sNew })[s];
const TILE = { done: "var(--accent-green)", tried: "var(--accent-yellow)", viewed: "var(--accent-blue)", new: "var(--border-soft)" } as const;
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
    <SideLayout
      side={
        <section className="card flex flex-col gap-2 p-4" aria-label={t.discussion}>
          <h2 className="text-lg font-extrabold">{t.discussion}</h2>
          <TeamChat locale={locale} teamId={teamId} assignmentId={assignmentId} userId={team.userId} height="h-96" />
        </section>
      }
    >
      {back}
      {data.role === "TEACHER" ? null : <TaskHeader t={t} locale={locale} team={team} meta={a} count={data.questions.length} overdue={overdue} />}

      {data.role === "TEACHER" ? (
        <>
          <TeacherTools t={t} locale={locale} team={team} teamId={teamId} meta={a} onChanged={load} onDeleted={() => router.push(`/${locale}/tymy/${teamId}`)} header={(menu) => <TaskHeader t={t} locale={locale} team={team} meta={a} count={data.questions.length} overdue={overdue} actions={menu} />} />
          <Dashboard t={t} locale={locale} data={data} url={url} overdue={overdue} onRefresh={load} />
        </>
      ) : (
        <>
          {data.feedback && (
            <section className="card flex flex-col gap-1 p-4" style={{ borderLeft: "8px solid var(--accent-yellow)" }} aria-label={t.feedbackFrom}>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--muted)]">{t.feedbackFrom}</h2>
              <p className="whitespace-pre-wrap">{data.feedback}</p>
            </section>
          )}
          <Runner t={t} locale={locale} data={data} url={url} onDone={load} />
        </>
      )}

    </SideLayout>
  );
}

function TaskHeader({ t, locale, team, meta, count, overdue, actions }: { t: TeamsAll; locale: Locale; team: Team; meta: Meta; count: number; overdue: boolean; actions?: ReactNode }) {
  const chip = "rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--muted)]";
  return (
    <header className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><Badge name={team.name} size={24} />{team.name}</p>
          <h1 className="text-3xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>{meta.title}</h1>
        </div>
        {actions}
      </div>
      {meta.description && <p className="whitespace-pre-wrap text-sm text-[var(--muted)]">{meta.description}</p>}
      <p className="flex flex-wrap items-center gap-2">
        <span className={chip}>{tfill(t.taskMeta, count, meta.passPercent)}</span>
        <span className={chip}>{meta.maxAttempts == null ? t.attUnlimited : tfill(t.attMax, meta.maxAttempts)}</span>
        {meta.dueAt && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${overdue ? "bg-[var(--danger)] text-white" : "bg-[var(--accent-yellow)] text-[#17142b]"}`}>
            {tfill(t.due, fmtDate(locale, meta.dueAt))}{overdue && ` · ${t.afterDeadline}`}
          </span>
        )}
      </p>
    </header>
  );
}

/** Úprava, kopírování do jiné třídy a smazání zadání. */
function TeacherTools({ t, locale, team, teamId, meta, onChanged, onDeleted, header }: { t: TeamsAll; locale: Locale; team: Team; teamId: string; meta: Meta; onChanged: () => void; onDeleted: () => void; header: (menu: ReactNode) => ReactNode }) {
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
  const archived = !!team.assignments.find((x) => x.id === meta.id)?.archived;

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
      {header(
        <details className="relative shrink-0">
          <summary className="btn-bouncy cursor-pointer list-none bg-[var(--surface)] px-4 py-1.5 text-sm font-bold">{t.actions}</summary>
          <div className="card absolute right-0 z-20 mt-2 flex w-56 flex-col p-1.5" role="menu">
            {([
              [t.editTask, () => setMode(mode === "edit" ? "" : "edit"), ""],
              [t.copyTask, () => setMode(mode === "copy" ? "" : "copy"), ""],
              [archived ? t.unarchive : t.archive, () => run({ action: "archiveAssignment", assignmentId: meta.id, archived: !archived }, onChanged), ""],
              [t.deleteTask, () => confirm(t.confirmDeleteTask) && run({ action: "deleteAssignment", assignmentId: meta.id }, onDeleted), "text-[var(--danger)]"],
            ] as [string, () => void, string][]).map(([label, fn, cls]) => (
              <button key={label} role="menuitem" onClick={(e) => { (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open"); fn(); }} className={`rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-[var(--surface-muted)] ${cls}`}>{label}</button>
            ))}
          </div>
        </details>,
      )}
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

function Dashboard({ t, locale, data, url, overdue, onRefresh }: { t: TeamsAll; locale: Locale; data: Extract<Data, { role: "TEACHER" }>; url: string; overdue: boolean; onRefresh: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  async function saveComment(userId: string) {
    setSaveError("");
    try {
      await call(url, { action: "feedback", userId, text: draft });
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onRefresh();
    } catch (e) {
      setSaveError(teamsAllError(t, errorCode(e)));
    }
  }
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
        <h2 className="text-lg font-extrabold">{t.overview}</h2>
        <button onClick={onRefresh} className="text-sm font-bold text-[var(--brand-600)]">{t.refresh}</button>
      </div>
      {saved && <p role="status" className="text-sm font-semibold text-[var(--accent-green)]">{t.feedbackSaved}</p>}
      {!data.everyone && <p className="text-sm text-[var(--muted)]">{tfill(t.onlyFor, data.rows.length)}</p>}
      <EdxStats
        label={t.overview}
        stats={[
          { icon: ICONS.people, value: String(data.rows.length), label: getTeamsEdx(locale).stStudents },
          { icon: ICONS.check, value: `${count("done")}/${data.rows.length}`, label: t.doneLabel },
          { icon: ICONS.star, value: String(count("tried")), label: t.statTried },
          { icon: ICONS.alert, value: String(data.rows.filter(missing).length), label: t.statMissing },
        ]}
      />
      {data.rows.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
            {(["done", "tried", "viewed"] as const).map((k) => <span key={k} style={{ width: `${(count(k) / data.rows.length) * 100}%`, background: TILE[k] }} />)}
          </div>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            {(["done", "tried", "viewed", "new"] as const).map((k) => (
              <span key={k} className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-full" style={{ background: TILE[k] }} /><b>{count(k)}</b> <span className="text-[var(--muted)]">{statusLabel(t, k)}</span></span>
            ))}
            {overdue && <span className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-full bg-[var(--danger)]" /><b className="text-[var(--danger)]">{data.rows.filter(missing).length}</b> <span className="text-[var(--muted)]">{t.sMissing}</span></span>}
          </p>
        </div>
      )}
      {data.rows.length === 0 && <p className="text-[var(--muted)]">{t.noStudents}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-[var(--border-soft)] text-xs text-[var(--muted)]"><th scope="col" className="px-4 py-3">{t.colStudent}</th><th scope="col" className="px-4 py-3">{t.colStatus}</th><th scope="col" className="px-4 py-3">{t.colAttempts}</th><th scope="col" className="px-4 py-3">{t.colBest}</th><th scope="col" className="px-4 py-3">{t.colLast}</th><th scope="col" className="px-4 py-3">{t.commentCol}</th></tr></thead>
          <tbody>
            {data.rows.map((r) => (
              <Fragment key={r.userId}>
              <tr className="border-b border-[var(--border-soft)] last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <Badge name={r.name} size={30} round />
                    <span className="flex flex-col"><b>{r.name || t.student}</b>{groupName(r.groupId) && <span className="text-xs text-[var(--muted)]">{groupName(r.groupId)}</span>}</span>
                  </span>
                </td>
                <td className="px-4 py-3" title={r.viewedAt ? `${t.colViewed}: ${fmtDate(locale, r.viewedAt)}` : undefined}>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${missing(r) ? "bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]" : STATUS_CLS[r.status]}`}>{missing(r) ? t.sMissing : statusLabel(t, r.status)}</span>
                  {r.late && <span className="ml-1 rounded-full bg-[var(--accent-yellow)] px-2 py-0.5 text-xs font-bold text-[#16132b]">{t.late}</span>}
                </td>
                <td className="px-4 py-3">{r.attempts}</td>
                <td className="px-4 py-3 font-bold">{r.attempts ? `${r.best} %` : <span className="font-normal text-[var(--muted)]">—</span>}</td>
                <td className="px-4 py-3">{r.last != null ? <span className="flex flex-col"><span>{r.last} %</span><span className="text-xs text-[var(--muted)]">{fmtDate(locale, r.lastAt)}</span></span> : <span className="text-[var(--muted)]">—</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditing(editing === r.userId ? null : r.userId); setDraft(r.comment); setSaveError(""); }} aria-expanded={editing === r.userId} className="text-left text-xs font-bold text-[var(--brand-600)]">
                    {r.comment ? <span className="line-clamp-2 max-w-48 font-normal text-[var(--foreground)]">{r.comment}</span> : t.feedbackTitle}
                  </button>
                </td>
              </tr>
              {editing === r.userId && (
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]">
                  <td colSpan={6} className="p-4">
                    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void saveComment(r.userId); }}>
                      <label className="text-sm font-semibold" htmlFor={`fb-${r.userId}`}>{t.feedbackTitle}: {r.name || t.student}</label>
                      <textarea id={`fb-${r.userId}`} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} rows={2} placeholder={t.feedbackPh} className={field} autoFocus />
                      {saveError && <p className="text-sm font-semibold text-[var(--danger)]">{saveError}</p>}
                      <span className="flex gap-3"><button className={primaryBtn}>{t.save}</button><button type="button" onClick={() => setEditing(null)} className="text-sm font-bold">{t.cancel}</button></span>
                    </form>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <details className="card p-4" open={hard.length > 0}>
        <summary className="cursor-pointer text-lg font-extrabold">{t.hardQuestions}</summary>
        {hard.length === 0 ? <p className="mt-2 text-sm text-[var(--muted)]">{t.noMistakes}</p> : (
          <ol className="mt-3 flex flex-col gap-3">
            {hard.slice(0, 10).map((q) => (
              <li key={q.i} className="text-sm">
                <p className="flex items-baseline justify-between gap-3"><span className="min-w-0">{q.i + 1}. {q.prompt.replace(/___/g, "____")}</span><b className="shrink-0">{Math.round(q.rate * 100)} %</b></p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="img" aria-label={tfill(t.wrongOf, q.wrong, q.attempts)}><div className="h-full bg-[var(--danger)]" style={{ width: `${Math.round(q.rate * 100)}%` }} /></div>
                <p className="text-xs text-[var(--muted)]">{tfill(t.wrongOf, q.wrong, q.attempts)} · {t.correctIs} <b>{q.answer}</b></p>
              </li>
            ))}
          </ol>
        )}
      </details>

      <details className="card p-4"><summary className="cursor-pointer text-lg font-extrabold">{tfill(t.qAndA, data.questions.length)}</summary>
        <ol className="mt-2 list-decimal pl-5 text-sm">{data.questions.map((q, i) => <li key={i} className="mb-1">{q.prompt} → <b>{q.answer}</b></li>)}</ol>
      </details>
    </section>
  );
}

function Runner({ t, locale, data, url, onDone }: { t: TeamsAll; locale: Locale; data: Extract<Data, { role: "STUDENT" }>; url: string; onDone: () => void }) {
  // ?hrat=1 (tlačítko Hrát v seznamu zadání) začne kvíz hned, pokud zbývá pokus. Runner se vykresluje až po načtení dat v prohlížeči.
  const [started, setStarted] = useState(() => data.left !== 0 && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("hrat") === "1");
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
  const [practice, setPractice] = useState(false);

  if (result && practice) {
    const wrong = data.questions.filter((q) => !result.review[q.id].correct);
    return <Practice t={t} questions={wrong} review={result.review} onBack={() => setPractice(false)} />;
  }

  if (result) {
    return (
      <section className="card flex flex-col gap-3 p-5">
        <h2 className={`rounded-2xl p-4 text-2xl font-extrabold ${result.passed ? "bg-[var(--accent-green)] text-[#0d1f14]" : "bg-[var(--accent-yellow)] text-[#16132b]"}`}>{tfill(t.resultLine, result.correct, result.total, result.percent, result.passed ? t.passed : t.notPassed)}</h2>
        <Progress value={result.correct} max={result.total} color={result.passed ? "var(--accent-green)" : "var(--accent-yellow)"} />
        <ol className="flex flex-col gap-2">
          {data.questions.map((q) => {
            const r = result.review[q.id];
            return (
              <li key={q.id} className={`rounded-2xl bg-[var(--surface-muted)] p-4 text-sm ring-2 ${r.correct ? "ring-[var(--accent-green)]" : "ring-[var(--danger)]"}`}>
                <p className="font-semibold">{q.prompt.replace(/___/g, "____")}</p>
                {!r.correct && <p>{t.correctIs} <b>{r.correctText}</b></p>}
                {r.explanation && <p className="text-[var(--muted)]">{r.explanation}</p>}
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-[var(--muted)]">{result.gainedXp ? <b>{tfill(t.xpGained, result.gainedXp)} · </b> : null}{result.left == null ? t.unlimitedAttempts : tfill(t.leftN, result.left)}</p>
        {result.review.some((r) => !r.correct) && <button onClick={() => setPractice(true)} className="btn-bouncy self-start bg-[var(--accent-yellow)] px-5 py-2 text-sm font-bold text-[#16132b]">{t.practiceWrong}</button>}
        {(result.left == null || result.left > 0) && <button onClick={retry} className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">{t.retry}</button>}
      </section>
    );
  }

  if (!started) {
    const e = getTeamsEdx(locale);
    return (
      <section className="flex flex-col gap-4">
        <EdxStats
          label={t.tabTasks}
          stats={[
            { icon: ICONS.star, value: data.attempts.length ? `${data.best} %` : "—", label: e.dBest },
            { icon: ICONS.check, value: `${data.assignment.passPercent} %`, label: e.dPass },
            { icon: ICONS.doc, value: String(data.attempts.length), label: e.dAttempts },
            { icon: ICONS.clock, value: data.left == null ? "∞" : String(data.left), label: e.dLeft },
          ]}
        />
        <div className="card flex flex-col gap-3 p-5">
          <p className="text-sm text-[var(--muted)]">{data.attempts.length ? tfill(t.prevAttempts, data.attempts.map((a) => `${a.percent} %`).join(", "), data.best) : t.notTried}</p>
          {data.attempts.length > 0 && <Progress value={Math.min(data.best, 100)} max={Math.max(data.assignment.passPercent, 1)} color={data.best >= data.assignment.passPercent ? "var(--accent-green)" : "var(--accent-yellow)"} label={`${data.best} % / ${data.assignment.passPercent} %`} />}
          {out ? <p className="font-bold text-[var(--danger)]">{t.outOfAttempts}</p> : (
            <button onClick={() => setStarted(true)} className="btn-bouncy inline-flex items-center gap-2 self-start bg-[var(--brand-500)] px-6 py-3 text-sm font-bold text-white">
              <svg aria-hidden viewBox="0 0 24 24" className="size-4"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              {data.attempts.length ? t.next : e.play}
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      {data.left != null && <p className="text-sm font-semibold text-[var(--muted)]">{tfill(t.thisAttempt, data.left)}</p>}
      <div className="sticky top-2 z-10 rounded-xl bg-[var(--surface)] p-2">
        <Progress value={data.questions.filter((q) => { const x = answers[q.id]; return x && (x.choice != null || x.typed?.some((v) => v.trim())); }).length} max={data.questions.length} color="var(--brand-500)" label={`${data.questions.filter((q) => { const x = answers[q.id]; return x && (x.choice != null || x.typed?.some((v) => v.trim())); }).length} / ${data.questions.length}`} />
      </div>
      <ol className="flex flex-col gap-4">
        {data.questions.map((q) => (
          <li key={q.id} className="flex flex-col gap-2 rounded-2xl bg-[var(--surface-muted)] p-4">
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
                  <label key={i} className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm ${answers[q.id]?.choice === i ? "bg-[var(--brand-50)] ring-2 ring-[var(--brand-500)]" : "bg-[var(--surface)]"}`}>
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

/** Procvičení jen chybných otázek: hodnotí se v prohlížeči, do výsledků ani XP se nezapisuje. */
function Practice({ t, questions, review, onBack }: { t: TeamsAll; questions: PQ[]; review: Result["review"]; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<number, { choice?: number; typed?: string[] }>>({});
  const [checked, setChecked] = useState(false);
  const norm = (v: string) => v.trim().toLowerCase();
  const ok = (q: PQ) => {
    const a = answers[q.id];
    const truth = review[q.id].correctText;
    if (!a) return false;
    if (q.gaps > 0) return truth.split(" / ").every((ans, i) => norm(a.typed?.[i] ?? "") === norm(ans));
    return a.choice != null && norm(q.options[a.choice] ?? "") === norm(truth);
  };
  const right = questions.filter(ok).length;
  const again = () => { setAnswers({}); setChecked(false); };
  return (
    <section className="card flex flex-col gap-4 p-5">
      <h2 className="text-lg font-extrabold">{t.practiceTitle}</h2>
      <ol className="flex flex-col gap-4">
        {questions.map((q, n) => (
          <li key={q.id} className={`flex flex-col gap-2 rounded-2xl bg-[var(--surface-muted)] p-4 ${checked ? (ok(q) ? "ring-2 ring-[var(--accent-green)]" : "ring-2 ring-[var(--danger)]") : ""}`}>
            {q.gaps > 0 ? (
              <>
                <p className="font-semibold">{n + 1}. {q.prompt.replace(/___/g, "____")}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: q.gaps }, (_, g) => (
                    <input key={g} aria-label={tfill(t.fillAria, g + 1)} disabled={checked} value={answers[q.id]?.typed?.[g] ?? ""} onChange={(e) => setAnswers((p) => { const typed = [...(p[q.id]?.typed ?? Array(q.gaps).fill(""))]; typed[g] = e.target.value; return { ...p, [q.id]: { typed } }; })} className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-1.5 text-sm" />
                  ))}
                </div>
              </>
            ) : (
              <fieldset className="flex flex-col gap-1.5" disabled={checked}>
                <legend className="mb-1 font-semibold">{n + 1}. {q.prompt}</legend>
                {q.options.map((o, i) => (
                  <label key={i} className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm ${answers[q.id]?.choice === i ? "bg-[var(--brand-50)] ring-2 ring-[var(--brand-500)]" : "bg-[var(--surface)]"}`}>
                    <input type="radio" name={`p${q.id}`} checked={answers[q.id]?.choice === i} onChange={() => setAnswers((p) => ({ ...p, [q.id]: { choice: i } }))} /> {o}
                  </label>
                ))}
              </fieldset>
            )}
            {checked && !ok(q) && <p className="text-sm">{t.correctIs} <b>{review[q.id].correctText}</b></p>}
          </li>
        ))}
      </ol>
      {checked && <p className="text-lg font-extrabold">{tfill(t.practiceDone, right, questions.length)}</p>}
      <div className="flex flex-wrap gap-3">
        {!checked ? <button onClick={() => setChecked(true)} className="btn-bouncy bg-[var(--accent-green)] px-6 py-2.5 text-sm font-bold text-white">{t.practiceCheck}</button> : <button onClick={again} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">{t.practiceAgain}</button>}
        <button onClick={onBack} className="text-sm font-bold">{t.practiceBack}</button>
      </div>
    </section>
  );
}
