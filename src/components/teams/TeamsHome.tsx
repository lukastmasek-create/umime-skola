"use client";

import { Glyph } from "./Glyph";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call, errorCode } from "./api";
import { tfill } from "@/i18n/teams";
import { getTeamsAll, teamsAllError } from "@/i18n/teams-more";
import type { Locale } from "@/i18n/config";
import { Badge, Pill, Progress, ProgressToast } from "./ui";
import { EdxAssistant } from "./EdxAssistant";
import { EdxGroupTasks, EdxPoints, EdxProCard, EdxProductivity, EdxProgress } from "./EdxWidgets";
import { EdxSchedule } from "./EdxSchedule";
import { EdxSidebar } from "./EdxSidebar";
import { getTeamsEdx } from "@/i18n/teams-edx";
import type { Deadline, TeamRow, Urgent } from "./types";

type Pending = { id: string; name: string };
import { TeacherOverview } from "./TeacherOverview";

// Gradient pro progress bar postupu (fialová → zelená, jako v gamifikovaném vzhledu).
const PROGRESS_GRADIENT = "linear-gradient(90deg, var(--brand-500), var(--accent-green))";


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
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"dashboard" | "schedule" | "teams">("dashboard");
  const e = getTeamsEdx(locale);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await call<{ teams: TeamRow[]; pending: Pending[]; urgent: Urgent[]; deadlines: Deadline[] }>("/api/tymy");
      setDeadlines(d.deadlines ?? []);
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
    if (k) { setCode(k.toUpperCase().slice(0, 12)); setTab("teams"); }
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

  const nextDue = urgent[0];
  const teachingTeams = (teams ?? []).filter((tm) => tm.role === "TEACHER").map((tm) => ({ id: tm.id, name: tm.name }));

  if (!auth)
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="text-[var(--muted)]">{t.loginNeeded}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">{t.login}</Link>
      </div>
    );

  const dashboard = teams && (
    <>
      <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-5">
          <EdxAssistant locale={locale} teams={teams} urgent={urgent} />
          <EdxProCard locale={locale} />
        </div>
        <EdxProductivity locale={locale} teams={teams} />
      </div>
      <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        <EdxProgress locale={locale} teams={teams} nextDue={nextDue} />
        <EdxGroupTasks locale={locale} urgent={urgent} />
        <EdxPoints locale={locale} teams={teams} />
      </div>
      {/* Učitelský přehled jen tomu, kdo je alespoň v jednom týmu učitelem */}
      {teachingTeams.length > 0 && <TeacherOverview locale={locale} teams={teachingTeams} />}
    </>
  );

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside className="lg:sticky lg:top-24">
        <EdxSidebar
          label={t.title}
          value={tab}
          onChange={setTab}
          items={[
            { key: "dashboard", label: e.navDashboard, icon: "dashboard" },
            { key: "schedule", label: e.navSchedule, icon: "schedule" },
            { key: "teams", label: e.navTeams, icon: "teams", badge: pending.length },
          ]}
        />
      </aside>
      <div className="flex min-w-0 flex-col gap-5">
      {error && <p role="alert" className="card p-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      {notice && <ProgressToast key={notice} message={notice} onDone={() => setNotice("")} closeLabel={t.closeToast} />}
      {teams === null && <div className="card h-64 animate-pulse bg-[var(--surface-muted)]" aria-hidden />}
      {teams && tab === "dashboard" && dashboard}
      {teams && tab === "schedule" && <EdxSchedule locale={locale} items={deadlines} />}
      {tab === "teams" && (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-extrabold">{t.myTeams}</h2>
          {teams?.length === 0 && pending.length === 0 && <p className="text-[var(--muted)]">{t.noTeams}</p>}
          {pending.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
              <span><b>{p.name}</b> <span className="text-sm text-[var(--muted)]">· {t.waitingApproval}</span></span>
              <button onClick={async () => { await call("/api/tymy", { action: "cancelRequest", teamId: p.id }).catch(() => {}); await load(); }} className="text-xs font-bold text-[var(--danger)]">{t.cancelRequest}</button>
            </div>
          ))}
          <ul className="grid gap-3 sm:grid-cols-2">
            {teams?.map((tm) => {
              // Barva karty podle naléhavosti (jako priorita v rozvrhu): fialová = po termínu, limetková = brzy končí.
              const tone = tm.overdue > 0 ? "high" : tm.soon > 0 ? "low" : "plain";
              const toneCls = { high: "!bg-[var(--brand-500)] text-white [--foreground:#fff] [--muted:#e4d8ff]", low: "!bg-[var(--accent-yellow)] text-[#17142b] [--foreground:#17142b] [--muted:#44501a]", plain: "" }[tone];
              return (
                <li key={tm.id}>
                  <Link href={`/${locale}/tymy/${tm.id}`} className={`card flex h-full items-start gap-3 p-4 hover:-translate-y-0.5 ${toneCls}`}>
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
                        <Progress value={tm.done} max={tm.assignments} color={tone === "high" ? "var(--accent-yellow)" : tone === "low" ? "var(--brand-500)" : PROGRESS_GRADIENT} label={tfill(t.summaryDone, tm.done, tm.assignments)} />
                      )}
                      {tm.code && <span className="text-xs text-[var(--muted)]">{t.code}: <b className="tracking-widest">{tm.code}</b></span>}
                      <span className={`mt-auto inline-flex items-center gap-1 pt-1 text-sm font-bold ${tone === "plain" ? "text-[var(--brand-600)]" : ""}`}>{t.openTeam} <Glyph name="arrowRight" /></span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        <div className="flex flex-col gap-5">
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
            <button className="btn-bouncy self-start bg-[var(--accent-yellow)] px-5 py-2 text-sm font-bold text-[#17142b]">{t.join}</button>
          </form>
        </div>
      </div>
      )}
      </div>
    </div>
  );
}
