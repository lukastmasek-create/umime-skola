"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getTeamsEdx } from "@/i18n/teams-edx";
import { getTeamsAll } from "@/i18n/teams-more";
import { tfill } from "@/i18n/teams";
import { fmtDate } from "./api";
import { Pill } from "./ui";
import type { Assignment } from "./types";
import { EdxStats, StatIcon as Icon, type Stat } from "./EdxStats";

const ICON_DOC = <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M9.5 12h5M9.5 16h5" /></>;
const ICON_PLAY = <path d="M8 5v14l11-7z" fill="currentColor" />;

type Props = { locale: Locale; teamId: string; teacher: boolean; active: Assignment[]; visible: Assignment[]; students: number; isDone: (a: Assignment) => boolean };

/** Zadání v týmu: pruh se statistikami, seznam zadání s výsledkem a tlačítkem Hrát a detail vybraného zadání. */
export function EdxAssignments({ locale, teamId, teacher, active, visible, students, isDone }: Props) {
  const t = getTeamsAll(locale);
  const e = getTeamsEdx(locale);
  const [sel, setSel] = useState<string | null>(null);
  const cur = visible.find((a) => a.id === sel) ?? visible[0];

  const sumDone = active.reduce((n, a) => n + (a.done ?? 0), 0);
  const sumTotal = active.reduce((n, a) => n + (a.students ?? 0), 0);
  const passedN = active.filter(isDone).length;
  const tried = active.filter((a) => (a.used ?? 0) > 0);
  const avg = tried.length ? Math.round(tried.reduce((n, a) => n + Math.min(a.best ?? 0, 100), 0) / tried.length) : 0;
  const stats: Stat[] = teacher
    ? [
        { icon: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 9a2.4 2.4 0 1 0 0-.1M16.5 14.2c2.5.2 4.5 2.4 4.5 5.8" /></>, value: String(students), label: e.stStudents },
        { icon: ICON_DOC, value: String(active.length), label: e.stTasks },
        { icon: <path d="m8 12.5 3 3 5-6M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />, value: `${sumDone}/${sumTotal}`, label: t.filterDone },
        { icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, value: String(Math.max(0, sumTotal - sumDone)), label: e.stWaiting },
      ]
    : [
        { icon: ICON_DOC, value: String(active.length), label: e.stTasks },
        { icon: <path d="m8 12.5 3 3 5-6M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />, value: `${passedN}/${active.length}`, label: t.filterDone },
        { icon: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />, value: `${avg} %`, label: e.stAvg },
        { icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, value: String(active.length - passedN), label: e.stWaiting },
      ];

  const canPlay = (a: Assignment) => !teacher && !a.archived && (a.maxAttempts == null || (a.used ?? 0) < a.maxAttempts);
  const play = (a: Assignment, big = false) =>
    canPlay(a) && (
      <Link
        href={`/${locale}/tymy/${teamId}/zadani/${a.id}?hrat=1`}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-500)] font-bold text-white hover:brightness-110 ${big ? "justify-center px-5 py-2.5 text-sm" : "px-3.5 py-2 text-xs"}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-3.5">{ICON_PLAY}</svg>
        {e.play}
      </Link>
    );
  const value = (a: Assignment) => (teacher ? `${a.done ?? 0}/${a.students ?? 0}` : (a.used ?? 0) > 0 ? `${a.best ?? 0} %` : "—");
  const frac = (a: Assignment) => (teacher ? ((a.students ?? 0) > 0 ? (a.done ?? 0) / (a.students ?? 1) : 0) : Math.min((a.best ?? 0) / 100, 1));

  const dot = (c: string) => <span aria-hidden className="size-2 rounded-full" style={{ background: c }} />;
  const line = (c: string | null, label: string, v: ReactNode) => (
    <div key={label} className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-[var(--muted)]">{c && dot(c)}{label}</span>
      <b>{v}</b>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <EdxStats stats={stats} label={e.stTasks} />

      {visible.length > 0 && cur && (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="card flex flex-col gap-3 p-5" aria-label={e.listTitle}>
            <div>
              <h2 className="text-xl font-extrabold">{e.listTitle}</h2>
              <p className="text-sm text-[var(--muted)]">{e.listSub}</p>
            </div>
            <ul className="flex flex-col divide-y divide-[var(--border-soft)]">
              {visible.map((a) => (
                <li key={a.id} className={`flex items-center gap-2 py-3 ${cur.id === a.id ? "rounded-2xl bg-[var(--surface-muted)] px-2" : "px-2"}`}>
                  <button type="button" onClick={() => setSel(a.id)} aria-pressed={cur.id === a.id} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--border-soft)]"><Icon>{ICON_DOC}</Icon></span>
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{a.title}</b>
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {tfill(t.taskMeta, a.questions, a.passPercent)}{a.dueAt ? ` · ${tfill(t.due, fmtDate(locale, a.dueAt))}` : ""}
                      </span>
                    </span>
                    <span aria-hidden className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--surface-muted)] ring-1 ring-[var(--border-soft)] 2xl:block">
                      <span className="block h-full rounded-full bg-[var(--brand-500)]" style={{ width: `${Math.round(frac(a) * 100)}%` }} />
                    </span>
                    <b className="w-14 shrink-0 text-right text-sm">{value(a)}</b>
                  </button>
                  {play(a)}
                </li>
              ))}
            </ul>
          </section>

          <aside className="card flex flex-col gap-4 p-5 xl:sticky xl:top-24" aria-label={cur.title}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-extrabold leading-tight">{cur.title}</h3>
              {teacher && (cur.students ?? 0) - (cur.done ?? 0) > 0 && <Pill tone="danger">{tfill(e.missing, (cur.students ?? 0) - (cur.done ?? 0))}</Pill>}
              {!teacher && cur.due === "overdue" && !isDone(cur) && <Pill tone="danger">{t.afterDeadline}</Pill>}
              {!teacher && cur.due === "soon" && !isDone(cur) && <Pill tone="warn">{t.dueSoon}</Pill>}
              {!teacher && isDone(cur) && <Pill tone="good">{t.sDone}</Pill>}
            </div>
            {cur.description && <p className="text-sm text-[var(--muted)]">{cur.description}</p>}
            {teacher ? (
              <>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
                  {(() => {
                    const n = Math.max(cur.students ?? 0, 1);
                    const done = cur.done ?? 0;
                    const viewed = Math.max((cur.viewed ?? 0) - done, 0);
                    return <><span style={{ width: `${(done / n) * 100}%`, background: "var(--accent-green)" }} /><span style={{ width: `${(viewed / n) * 100}%`, background: "var(--accent-yellow)" }} /></>;
                  })()}
                </div>
                <div className="flex flex-col gap-2.5">
                  {line("var(--accent-green)", t.sDone, cur.done ?? 0)}
                  {line("var(--accent-yellow)", t.sViewed, Math.max((cur.viewed ?? 0) - (cur.done ?? 0), 0))}
                  {line("var(--border-soft)", t.sNew, Math.max((cur.students ?? 0) - (cur.viewed ?? 0), 0))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                {line(null, e.dBest, `${cur.best ?? 0} %`)}
                {line(null, e.dAttempts, `${cur.used ?? 0}${cur.maxAttempts != null ? ` / ${cur.maxAttempts}` : ""}`)}
                {cur.maxAttempts != null && line(null, e.dLeft, Math.max(0, cur.maxAttempts - (cur.used ?? 0)))}
                {line(null, e.dDue, cur.dueAt ? fmtDate(locale, cur.dueAt) : e.noDue)}
              </div>
            )}
            <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-4">
              {play(cur, true)}
              <Link href={`/${locale}/tymy/${teamId}/zadani/${cur.id}`} className="rounded-full border border-[var(--field-border)] px-5 py-2.5 text-center text-sm font-bold hover:bg-[var(--surface-muted)]">{e.openTask}</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
