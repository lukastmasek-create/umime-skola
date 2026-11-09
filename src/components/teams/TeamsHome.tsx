"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call, errorCode } from "./api";
import { tfill } from "@/i18n/teams";
import { getTeamsAll, teamsAllError } from "@/i18n/teams-more";
import { fmtDate } from "./api";
import type { Locale } from "@/i18n/config";
import { Badge, Pill, Progress, SideLayout, colorOf } from "./ui";

// Gradient pro progress bar postupu (fialová → zelená, jako v gamifikovaném vzhledu).
const PROGRESS_GRADIENT = "linear-gradient(90deg, var(--brand-500), var(--accent-green))";

type TeamRow = { id: string; name: string; role: string; code: string | null; members: number; assignments: number; done: number; open: number; soon: number; overdue: number };
type Urgent = { teamId: string; teamName: string; assignmentId: string; title: string; dueAt: string; overdue: boolean };
type Pending = { id: string; name: string };

export function TeamsHome({ locale }: { locale: Locale }) {
  const t = getTeamsAll(locale);
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[] | null>(null);
  const [auth, setAuth] = useState(true);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [urgent, setUrgent] = useState<Urgent[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await call<{ teams: TeamRow[]; pending: Pending[]; urgent: Urgent[] }>("/api/tymy");
      setTeams(d.teams);
      setPending(d.pending);
      setUrgent(d.urgent);
    } catch (e) {
      if (errorCode(e) === "login-required") setAuth(false);
      else setError(teamsAllError(t, errorCode(e)));
      setTeams([]);
    }
  }, [t]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  // Odkaz pozvánky (?kod=ABC123) předvyplní kód pro připojení.
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("kod");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (k) setCode(k.toUpperCase().slice(0, 12));
  }, []);

  async function act(body: object) {
    setError("");
    setNotice("");
    try {
      const { id, pending: waiting } = await call<{ id: string; pending?: boolean }>("/api/tymy", body);
      if (waiting) {
        // Učitel má připojování se schvalováním: žák zůstane na seznamu a čeká.
        setCode("");
        setNotice(t.requestSent);
        await load();
        return;
      }
      router.push(`/${locale}/tymy/${id}`);
    } catch (e) {
      setError(teamsAllError(t, errorCode(e)));
    }
  }

  // Souhrn v levém sloupci: nesplněná zadání žáka napříč týmy a nejbližší termín (API je řadí podle data).
  const openSum = (teams ?? []).reduce((n, tm) => n + (tm.role === "STUDENT" ? tm.open : 0), 0);
  const nextDue = urgent[0];

  if (!auth)
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="text-[var(--muted)]">{t.loginNeeded}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">{t.login}</Link>
      </div>
    );

  return (
    <SideLayout
      side={
        <>
          <section aria-label={t.progressTitle} className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <div className="card flex flex-col gap-1 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.summaryTeams}</p>
              <p className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{teams?.length ?? 0}</p>
            </div>
            <div className="card flex flex-col gap-1 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.summaryOpen}</p>
              <p className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{openSum}</p>
            </div>
            <div className="card flex min-w-0 flex-col gap-1 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.summaryNext}</p>
              {nextDue ? (
                <Link href={`/${locale}/tymy/${nextDue.teamId}/zadani/${nextDue.assignmentId}`} className="flex min-w-0 flex-col hover:underline">
                  <span className="truncate text-sm font-bold">{nextDue.title}</span>
                  <span className="text-xs text-[var(--muted)]">{fmtDate(locale, nextDue.dueAt)}</span>
                </Link>
              ) : (
                <span className="text-sm font-semibold text-[var(--muted)]">{t.summaryNone}</span>
              )}
            </div>
          </section>
          <form className="card flex flex-col gap-3 p-5" onSubmit={(e) => { e.preventDefault(); void act({ action: "create", name, asTeacher: teacher }); }}>
            <h2 className="text-lg font-extrabold">{t.createTitle}</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={t.namePh} aria-label={t.namePh} className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={teacher} onChange={(e) => setTeacher(e.target.checked)} className="size-4" />
              {t.iAmTeacher}
            </label>
            <button className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">{t.create}</button>
          </form>
          <form className="card flex flex-col gap-3 p-5" onSubmit={(e) => { e.preventDefault(); void act({ action: "join", code }); }}>
            <h2 className="text-lg font-extrabold">{t.joinTitle}</h2>
            <p className="text-sm text-[var(--muted)]">{t.joinHint}</p>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder={t.codePh} aria-label={t.codePh} className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm uppercase tracking-widest" />
            <button className="btn-bouncy self-start bg-[var(--accent-green)] px-5 py-2 text-sm font-bold text-white">{t.join}</button>
          </form>
        </>
      }
    >
      {error && <p role="alert" className="card p-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      {notice && <p role="status" className="card p-3 text-sm font-semibold text-[var(--accent-green)]">{notice}</p>}
      {urgent.length > 0 && (
        <section className="card flex flex-col gap-2 border-2 border-[var(--accent-yellow)] p-4" aria-label={t.urgentTitle}>
          <h2 className="text-lg font-extrabold">{t.urgentTitle}</h2>
          <ul className="divide-y divide-[var(--border-soft)]">
            {urgent.map((u) => (
              <li key={u.assignmentId}>
                <Link href={`/${locale}/tymy/${u.teamId}/zadani/${u.assignmentId}`} className="flex flex-wrap items-center justify-between gap-2 py-2 hover:underline">
                  <span className="min-w-0 truncate"><b>{u.title}</b> <span className="text-sm text-[var(--muted)]">· {u.teamName}</span></span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.overdue ? "bg-[var(--danger)] text-white" : "bg-[var(--accent-yellow)]"}`}>{u.overdue ? `${t.afterDeadline} · ` : ""}{tfill(t.due, fmtDate(locale, u.dueAt))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">{t.myTeams}</h2>
        {teams === null && <div className="card h-24 animate-pulse bg-[var(--surface-muted)]" aria-hidden />}
        {teams?.length === 0 && pending.length === 0 && <p className="text-[var(--muted)]">{t.noTeams}</p>}
        {pending.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
            <span><b>{p.name}</b> <span className="text-sm text-[var(--muted)]">· {t.waitingApproval}</span></span>
            <button onClick={async () => { await call("/api/tymy", { action: "cancelRequest", teamId: p.id }).catch(() => {}); await load(); }} className="text-xs font-bold text-[var(--danger)]">{t.cancelRequest}</button>
          </div>
        ))}
        <ul className="grid gap-3 sm:grid-cols-2">
          {teams?.map((tm) => (
            <li key={tm.id}>
              <Link href={`/${locale}/tymy/${tm.id}`} className="card flex h-full items-start gap-3 p-4 hover:-translate-y-0.5" style={{ borderTop: `6px solid ${colorOf(tm.name)}` }}>
                <Badge name={tm.name} size={52} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-center justify-between gap-2">
                    <b className="truncate text-lg">{tm.name}</b>
                    <Pill tone={tm.role === "TEACHER" ? "brand" : "good"}>{tm.role === "TEACHER" ? `${t.teacher}` : `${t.student}`}</Pill>
                  </span>
                  <span className="text-sm text-[var(--muted)]">{tfill(t.teamStats, tm.members, tm.assignments)}{tm.role === "STUDENT" && tm.open > 0 ? tfill(t.teamOpen, tm.open) : ""}</span>
                  {(tm.overdue > 0 || tm.soon > 0) && (
                    <span className="flex flex-wrap gap-1.5">
                      {tm.overdue > 0 && <Pill tone="danger">{tfill(t.overdueN, tm.overdue)}</Pill>}
                      {tm.soon > 0 && <Pill tone="warn">{tfill(t.soonN, tm.soon)}</Pill>}
                    </span>
                  )}
                  {tm.role === "STUDENT" && tm.assignments > 0 && (
                    <Progress value={tm.done} max={tm.assignments} color={PROGRESS_GRADIENT} label={tfill(t.summaryDone, tm.done, tm.assignments)} />
                  )}
                  {tm.code && <span className="text-xs text-[var(--muted)]">{t.code}: <b className="tracking-widest">{tm.code}</b></span>}
                  <span className="mt-auto pt-1 text-sm font-bold text-[var(--brand-600)]">{t.openTeam} →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SideLayout>
  );
}
