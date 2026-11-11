"use client";

import { Glyph } from "./Glyph";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { call } from "./api";
import { getTeamsOverviewText } from "@/i18n/teams-overview";
import type { Locale } from "@/i18n/config";
import { Badge, Progress } from "./ui";

type Cell = { status: "done" | "tried" | "viewed" | "new"; best: number; attempts: number; late: boolean; overdue: boolean };
type Overview = {
  students: { id: string; name: string | null; groupId: string | null }[];
  assignments: { id: string; title: string; passPercent: number; dueAt: string | null }[];
  cells: Record<string, Record<string, Cell>>;
};
type Row = {
  key: string;
  teamId: string;
  teamName: string;
  name: string;
  done: number;
  total: number;
  avg: number | null;
  overdue: number;
  level: "ok" | "watch" | "risk";
  items: { id: string; title: string; cell: Cell }[];
};
type Sort = "name" | "progress" | "score";

const GRADIENT = "linear-gradient(90deg, var(--brand-500), var(--accent-green))";
const LEVEL_CLS = { ok: "bg-[var(--accent-green)] text-white", watch: "bg-[var(--accent-yellow)] text-[#16132b]", risk: "bg-[var(--danger)] text-white" } as const;

/** Souhrn pro učitele: čísla přes všechny jeho týmy, tabulka žáků s filtry a řazením a detail žáka. */
export function TeacherOverview({ locale, teams }: { locale: Locale; teams: { id: string; name: string }[] }) {
  const t = getTeamsOverviewText(locale);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [failed, setFailed] = useState(false);
  const [team, setTeam] = useState("all");
  const [sort, setSort] = useState<Sort>("name");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Row | null>(null);
  const teamKey = teams.map((x) => x.id).join(",");

  useEffect(() => {
    let live = true;
    Promise.all(teams.map((tm) => call<Overview>(`/api/tymy/${tm.id}/prehled`).then((d) => ({ tm, d })).catch(() => null)))
      .then((res) => {
        if (!live) return;
        const ok = res.filter((x): x is { tm: { id: string; name: string }; d: Overview } => x !== null);
        if (ok.length === 0 && teams.length > 0) setFailed(true);
        let assignmentsSum = 0;
        const out: Row[] = [];
        for (const { tm, d } of ok) {
          assignmentsSum += d.assignments.length;
          for (const s of d.students) {
            const items = d.assignments.flatMap((a) => {
              const cell = d.cells[a.id]?.[s.id];
              return cell ? [{ id: a.id, title: a.title, cell }] : [];
            });
            const tried = items.filter((i) => i.cell.attempts > 0);
            const avg = tried.length ? Math.round(tried.reduce((n, i) => n + i.cell.best, 0) / tried.length) : null;
            const done = items.filter((i) => i.cell.status === "done").length;
            const overdue = items.filter((i) => i.cell.overdue).length;
            const level: Row["level"] = overdue > 0 || (avg !== null && avg < 50) ? "risk" : items.length > 0 && done / items.length < 0.5 ? "watch" : "ok";
            out.push({ key: `${tm.id}:${s.id}`, teamId: tm.id, teamName: tm.name, name: s.name ?? "?", done, total: items.length, avg, overdue, level, items });
          }
        }
        setTotalAssignments(assignmentsSum);
        setRows(out);
      });
    return () => {
      live = false;
    };
    // teams se mění jen při změně seznamu týmů
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const stats = useMemo(() => {
    const all = rows ?? [];
    const done = all.reduce((n, r) => n + r.done, 0);
    const total = all.reduce((n, r) => n + r.total, 0);
    const scored = all.filter((r) => r.avg !== null);
    const avg = scored.length ? Math.round(scored.reduce((n, r) => n + (r.avg ?? 0), 0) / scored.length) : null;
    return { students: all.length, done, total, avg, late: all.reduce((n, r) => n + r.overdue, 0) };
  }, [rows]);

  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase(locale);
    const pct = (r: Row) => (r.total ? r.done / r.total : 0);
    return (rows ?? [])
      .filter((r) => (team === "all" ? true : team === "risk" ? r.level === "risk" : r.teamId === team))
      .filter((r) => !needle || r.name.toLocaleLowerCase(locale).includes(needle))
      .sort((a, b) => (sort === "progress" ? pct(b) - pct(a) : sort === "score" ? (b.avg ?? -1) - (a.avg ?? -1) : 0) || a.name.localeCompare(b.name, locale));
  }, [rows, team, q, sort, locale]);

  if (failed) return <p role="alert" className="card p-4 text-sm font-semibold text-[var(--danger)]">{t.failed}</p>;
  if (rows === null) return <div className="card h-40 animate-pulse bg-[var(--surface-muted)]" aria-label={t.loading} />;
  if (rows.length === 0) return (
    <section className="card p-5" aria-label={t.title}>
      <h2 className="text-lg font-extrabold">{t.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{t.empty}</p>
    </section>
  );

  const kpis = [
    { label: t.kpi.students, value: <NumberFlow value={stats.students} />, sub: t.hello },
    { label: t.kpi.done, value: <NumberFlow value={stats.done} />, sub: t.kpi.ofTotal.replace("{n}", String(stats.total || totalAssignments)) },
    { label: t.kpi.avg, value: stats.avg === null ? "–" : <NumberFlow value={stats.avg} suffix=" %" />, sub: stats.avg === null ? t.kpi.noAvg : "" },
    { label: t.kpi.late, value: <NumberFlow value={stats.late} />, sub: "" },
  ];
  const levelLabel = (l: Row["level"]) => t.status[l];
  const cellLabel = (c: Cell) => t.cell[c.status];
  const sortBtn = (id: Sort, label: string) => (
    <button type="button" onClick={() => setSort(id)} aria-pressed={sort === id} className={`font-bold ${sort === id ? "text-[var(--brand-600)]" : ""}`}>
      {label}{sort === id ? " ▼" : ""}
    </button>
  );

  return (
    <section className="flex flex-col gap-4" aria-label={t.title}>
      <h2 className="text-xl font-extrabold">{t.title}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card flex flex-col gap-1 p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">{k.label}</p>
            <p className="text-3xl font-extrabold leading-none tabular-nums" style={{ fontFamily: "var(--font-heading)" }}>{k.value}</p>
            {k.sub && <p className="text-xs text-[var(--muted)]">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-extrabold">{t.table.title}</h3>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.table.title}>
            {[{ id: "all", label: t.table.all }, ...(teams.length > 1 ? teams.map((x) => ({ id: x.id, label: x.name })) : []), { id: "risk", label: t.table.risk }].map((f) => (
              <button key={f.id} type="button" aria-pressed={team === f.id} onClick={() => setTeam(f.id)} className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${team === f.id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder={t.table.search} aria-label={t.table.search} className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="text-xs text-[var(--muted)]">
                <th className="py-2 pr-2">{sortBtn("name", t.table.student)}</th>
                <th className="py-2 pr-2 font-semibold">{t.table.team}</th>
                <th className="py-2 pr-2">{sortBtn("progress", t.table.progress)}</th>
                <th className="py-2 pr-2">{sortBtn("score", t.table.score)}</th>
                <th className="py-2 font-semibold">{t.table.status}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.key} className="cursor-pointer border-t border-[var(--border-soft)] hover:bg-[var(--surface-muted)]" onClick={() => setOpen(r)}>
                  <td className="py-2 pr-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(r); }} className="flex items-center gap-2 text-left font-bold">
                      <Badge name={r.name} size={30} round />{r.name}
                    </button>
                  </td>
                  <td className="py-2 pr-2 text-[var(--muted)]">{r.teamName}</td>
                  <td className="w-40 py-2 pr-2"><Progress value={r.done} max={r.total} color={GRADIENT} label={`${r.done}/${r.total}`} /></td>
                  <td className="py-2 pr-2 font-semibold tabular-nums">{r.avg === null ? "–" : `${r.avg} %`}</td>
                  <td className="py-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${LEVEL_CLS[r.level]}`}>{levelLabel(r.level)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setOpen(null)}>
          <aside role="dialog" aria-modal="true" aria-label={t.detail.title} onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto bg-[var(--surface)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Badge name={open.name} size={44} round />
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">{open.name}</p>
                  <p className="truncate text-sm text-[var(--muted)]">{open.teamName}</p>
                </div>
              </div>
              <button type="button" autoFocus onClick={() => setOpen(null)} aria-label={t.detail.close} className="btn-bouncy size-9 shrink-0 bg-[var(--surface)] text-lg font-bold">×</button>
            </div>
            <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${LEVEL_CLS[open.level]}`}>{levelLabel(open.level)}</span>
            <h3 className="font-extrabold">{t.detail.assignments}</h3>
            {open.items.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t.detail.none}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--border-soft)]">
                {open.items.map((i) => (
                  <li key={i.id} className="flex flex-col gap-0.5 py-2.5">
                    <Link href={`/${locale}/tymy/${open.teamId}/zadani/${i.id}`} className="font-bold hover:underline">{i.title}</Link>
                    <span className="text-xs text-[var(--muted)]">
                      {cellLabel(i.cell)}
                      {i.cell.attempts > 0 ? ` · ${t.detail.best} ${i.cell.best} % · ${i.cell.attempts} ${t.detail.attempts}` : ""}
                      {i.cell.late ? ` · ${t.detail.late}` : ""}
                      {i.cell.overdue ? ` · ${t.detail.overdue}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/${locale}/tymy/${open.teamId}`} className="btn-bouncy mt-auto inline-flex items-center justify-center gap-1.5 bg-[var(--brand-500)] px-4 py-2.5 text-center text-sm font-bold text-white">{t.detail.open} <Glyph name="arrowRight" /></Link>
          </aside>
        </div>
      )}
    </section>
  );
}
