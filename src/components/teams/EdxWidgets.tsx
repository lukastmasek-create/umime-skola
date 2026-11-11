"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Locale } from "@/i18n/config";
import { getTeamsEdx } from "@/i18n/teams-edx";
import { getTeamsAll } from "@/i18n/teams-more";
import { tfill } from "@/i18n/teams";
import type { TeamRow, Urgent } from "./types";

const short = (s: string, n = 8) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function ArrowBtn({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} aria-label={label} className={`grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-500)] text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
    </Link>
  );
}

export function EdxProCard({ locale }: { locale: Locale }) {
  const t = getTeamsEdx(locale);
  return (
    <section className="flex items-center justify-between gap-3 rounded-3xl bg-[var(--accent-yellow)] p-5 text-[#17142b]">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">{t.proTitle} <span className="rounded-full bg-[var(--brand-500)] px-2 py-0.5 text-xs font-bold text-white">{t.proTag}</span></h2>
        <p className="mt-1 text-sm">{t.proText}</p>
      </div>
      <ArrowBtn href={`/${locale}/pro`} label={t.proTitle} />
    </section>
  );
}

/** Graf produktivity: pro každý tým kolik zadání je zadáno a kolik splněno. */
export function EdxProductivity({ locale, teams }: { locale: Locale; teams: TeamRow[] }) {
  const t = getTeamsEdx(locale);
  const mine = teams.filter((x) => x.role === "STUDENT" && x.assignments > 0);
  const total = mine.reduce((n, x) => n + x.assignments, 0);
  const done = mine.reduce((n, x) => n + x.done, 0);
  const data = mine.map((x) => ({ name: short(x.name), assigned: x.assignments, done: x.done }));
  const stat = (label: string, value: string) => (
    <div className="flex items-baseline gap-2"><span className="text-xs font-semibold text-[var(--muted)]">{label}</span><b className="text-2xl font-extrabold">{value}</b></div>
  );
  return (
    <section className="card flex h-full flex-col gap-4 p-5" aria-label={t.prodTitle}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold">{t.prodTitle}</h2>
        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">{t.prodTeams}</span>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
        {stat(t.prodTasks, `${done}/${total}`)}
        {stat(t.prodTeams, String(teams.length))}
        {stat(t.prodRate, `${total ? Math.round((done / total) * 100) : 0} %`)}
      </div>
      {data.length === 0 ? (
        <p className="grid min-h-44 flex-1 place-items-center text-sm text-[var(--muted)]">{t.prodEmpty}</p>
      ) : (
        <div className="min-h-48 w-full flex-1" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface-muted)", border: 0, borderRadius: 12, color: "var(--foreground)" }} />
              <Area type="monotone" dataKey="assigned" name={t.prodAssigned} stroke="var(--brand-600)" fill="var(--brand-500)" fillOpacity={0.18} strokeWidth={2} dot={{ r: 4, fill: "var(--brand-500)", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="done" name={t.prodDone} stroke="var(--brand-500)" fill="var(--brand-500)" fillOpacity={0.4} strokeWidth={2} dot={{ r: 4, fill: "var(--brand-500)", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

/** Celkový postup: velké procento, tříbarevný pruh a tři dlaždice. */
export function EdxProgress({ locale, teams, nextDue }: { locale: Locale; teams: TeamRow[]; nextDue?: Urgent }) {
  const t = getTeamsEdx(locale);
  const a = getTeamsAll(locale);
  const mine = teams.filter((x) => x.role === "STUDENT");
  const all = mine.reduce((n, x) => n + x.assignments, 0);
  const done = mine.reduce((n, x) => n + x.done, 0);
  const open = mine.reduce((n, x) => n + x.open, 0);
  const soon = mine.reduce((n, x) => n + x.soon, 0);
  const upcoming = Math.min(soon, open);
  const running = open - upcoming;
  const pct = all ? Math.round((done / all) * 100) : 0;
  const w = (n: number) => `${all ? (n / all) * 100 : 0}%`;
  const tile = (n: number, label: string, icon: React.ReactNode, filled = false) => (
    <div className="flex flex-col items-center gap-1 py-3">
      <span aria-hidden className={`grid size-11 place-items-center rounded-full ${filled ? "bg-[var(--brand-500)] text-white" : ""}`}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <b className="text-2xl font-extrabold">{n}</b>
      <span className="text-xs text-[var(--muted)]">{label}</span>
    </div>
  );
  return (
    <section className="card flex flex-col gap-4 p-5" aria-label={a.progressTitle}>
      <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">{a.progressTitle}</h2></div>
      <div className="flex items-center gap-4">
        <p className="text-6xl font-extrabold leading-none" style={{ fontFamily: "var(--font-heading)" }}>{pct}%</p>
        <p className="text-sm text-[var(--muted)]">{t.progSub}</p>
      </div>
      <div>
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar" aria-valuemin={0} aria-valuemax={all} aria-valuenow={done}>
          <span style={{ width: w(running), background: "var(--brand-600)" }} />
          <span style={{ width: w(upcoming), background: "var(--accent-yellow)" }} />
          <span style={{ width: w(done), background: "var(--accent-green)" }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold text-[var(--brand-600)]"><span>{t.progInProgress}</span><span>{t.progUpcoming}</span><span>{t.progDone}</span></div>
      </div>
      <div className="edx-tile grid grid-cols-3 divide-x divide-[var(--border-soft)] px-1 text-center">
        {tile(running, t.progInProgress, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)}
        {tile(upcoming, t.progUpcoming, <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>)}
        {tile(done, t.progDone, <path d="m8 12.5 3 3 5-6" />, true)}
      </div>
      {nextDue && (
        <Link href={`/${locale}/tymy/${nextDue.teamId}/zadani/${nextDue.assignmentId}`} className="flex items-center justify-between gap-3 text-sm hover:underline">
          <span className="text-[var(--muted)]">{a.summaryNext}</span>
          <b className="truncate">{nextDue.title}</b>
        </Link>
      )}
    </section>
  );
}

/** Seznam nejnaléhavějších úkolů (po termínu = vysoká, brzy končí = nízká priorita). */
export function EdxGroupTasks({ locale, urgent }: { locale: Locale; urgent: Urgent[] }) {
  const t = getTeamsEdx(locale);
  const a = getTeamsAll(locale);
  return (
    <section className="card flex flex-col gap-3 p-5" aria-label={t.groupTitle}>
      <div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">{t.groupTitle}</h2><span className="text-lg font-bold text-[var(--muted)]">{urgent.length}</span></div>
      {urgent.length === 0 && <p className="edx-tile p-4 text-sm font-semibold text-[var(--muted)]">{a.summaryNone}</p>}
      {urgent.slice(0, 3).map((u) => {
        const d = new Date(u.dueAt);
        return (
          <Link key={u.assignmentId} href={`/${locale}/tymy/${u.teamId}/zadani/${u.assignmentId}`} className="edx-tile flex flex-col gap-1 p-4 hover:ring-2 hover:ring-[var(--brand-500)]">
            <span className="flex items-start justify-between gap-2">
              <span className="text-2xl font-extrabold leading-none">{d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="text-xs font-bold">• {u.overdue ? t.prioHigh : t.prioLow}</span>
            </span>
            <span className="truncate text-sm"><b>{u.teamName}:</b> <span className="text-[var(--muted)]">{u.title}</span></span>
            <span className="text-xs text-[var(--muted)]">{tfill(a.due, d.toLocaleDateString(locale, { day: "numeric", month: "numeric" }))}</span>
          </Link>
        );
      })}
    </section>
  );
}

/** Svislé „pilulkové“ sloupce: kolik procent zadání je splněno v jednotlivých týmech, nejvyšší zvýrazněný. */
export function EdxPoints({ locale, teams }: { locale: Locale; teams: TeamRow[] }) {
  const t = getTeamsEdx(locale);
  const rows = teams.filter((x) => x.role === "STUDENT" && x.assignments > 0).slice(0, 4).map((x) => ({ name: x.name, pct: Math.round((x.done / x.assignments) * 100) }));
  const total = teams.filter((x) => x.role === "STUDENT").reduce((n, x) => n + x.assignments, 0);
  const done = teams.reduce((n, x) => n + x.done, 0);
  const top = Math.max(0, ...rows.map((r) => r.pct));
  return (
    <section className="card flex flex-col gap-4 p-5" aria-label={t.pointsTitle}>
      <div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">{t.pointsTitle}</h2><span className="text-lg font-bold text-[var(--muted)]">{done}/{total}</span></div>
      {rows.length === 0 ? <p className="text-sm text-[var(--muted)]">{t.prodEmpty}</p> : (
        <div className="flex h-40 items-end justify-around gap-2">
          {rows.map((r) => {
            const hot = r.pct === top && top > 0;
            return (
              <div key={r.name} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full max-w-14 items-end">
                  <span className={`flex w-full items-end justify-center rounded-2xl pb-1.5 text-xs font-bold ${hot ? "bg-[var(--brand-500)] text-white" : "border-2 border-[var(--brand-500)] bg-[var(--brand-50)]"}`} style={{ height: `${Math.max(r.pct, 14)}%` }}>{r.pct}%</span>
                </div>
                <span className="w-full truncate text-center text-xs text-[var(--muted)]">{r.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
