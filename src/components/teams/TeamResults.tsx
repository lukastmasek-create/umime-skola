"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { call, errorCode } from "./api";
import { teamsAllError, type TeamsAll } from "@/i18n/teams-more";
import { toCsv } from "@/lib/teams/logic";
import { buildXlsx } from "@/lib/teams/xlsx";
import type { Locale } from "@/i18n/config";
import { field, linkBtn } from "./types";
import { Badge, Pill, Progress } from "./ui";

type Cell = { status: "done" | "tried" | "viewed" | "new"; best: number; attempts: number; late: boolean; overdue: boolean };
type Overview = {
  students: { id: string; name: string | null; groupId: string | null }[];
  groups: { id: string; name: string }[];
  assignments: { id: string; title: string; passPercent: number; dueAt: string | null }[];
  cells: Record<string, Record<string, Cell>>;
};

const CLS = { done: "bg-[var(--accent-green)] text-white", tried: "bg-[var(--accent-yellow)]", viewed: "bg-[var(--brand-50)]", new: "bg-[var(--surface-muted)]" } as const;

/** Matice třída × zadání s exportem do CSV. */
export function TeamResults({ t, locale, teamId, teamName }: { t: TeamsAll; locale: Locale; teamId: string; teamName: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"name" | "done" | "missing">("name");
  const [groupF, setGroupF] = useState("");
  const [statusF, setStatusF] = useState("");

  useEffect(() => {
    let live = true;
    call<Overview>(`/api/tymy/${teamId}/prehled`).then((d) => live && setData(d)).catch((e) => live && setError(teamsAllError(t, errorCode(e))));
    return () => { live = false; };
  }, [teamId, t]);

  if (error) return <p className="card p-4 text-sm font-semibold text-[var(--danger)]">{error}</p>;
  if (!data) return <div className="card h-40 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (data.students.length === 0 || data.assignments.length === 0) return <p className="text-[var(--muted)]">{data.students.length === 0 ? t.noStudents : t.noTasksT}</p>;

  const label = (c: Cell) => ({ done: t.sDone, tried: t.sTried, viewed: t.sViewed, new: t.sNew })[c.status];
  const groupName = (id: string | null) => data.groups.find((g) => g.id === id)?.name ?? "";
  const summary = (sid: string) => {
    const mine = data.assignments.map((a) => data.cells[a.id]?.[sid]).filter((c): c is Cell => !!c);
    return { done: mine.filter((c) => c.status === "done").length, total: mine.length, missing: mine.filter((c) => c.overdue).length };
  };

  const totals = data.students.reduce((acc, st) => {
    const x = summary(st.id);
    return { done: acc.done + x.done, total: acc.total + x.total, missing: acc.missing + x.missing };
  }, { done: 0, total: 0, missing: 0 });
  const doneBy = (aid: string) => data.students.filter((st) => data.cells[aid]?.[st.id]?.status === "done").length;

  const visible = [...data.students]
    .filter((st) => !groupF || st.groupId === groupF)
    .filter((st) => !statusF || data.assignments.some((a) => data.cells[a.id]?.[st.id]?.status === statusF))
    .sort((a, b) => {
      if (sort === "done") return summary(b.id).done - summary(a.id).done || (a.name ?? "").localeCompare(b.name ?? "", locale);
      if (sort === "missing") return summary(b.id).missing - summary(a.id).missing || (a.name ?? "").localeCompare(b.name ?? "", locale);
      return (a.name ?? "").localeCompare(b.name ?? "", locale);
    });
  const trend = data.assignments.map((a) => {
    const got = data.students.map((st) => data.cells[a.id]?.[st.id]).filter((c): c is Cell => !!c && c.attempts > 0);
    return { id: a.id, title: a.title, avg: got.length ? Math.round(got.reduce((n, c) => n + c.best, 0) / got.length) : null, n: got.length };
  });

  function table(): (string | number)[][] {
    if (!data) return [];
    const head = [t.colStudent, t.colGroup, ...data.assignments.flatMap((a) => [`${a.title} (%)`, `${a.title}: ${t.colStatus}`]), t.colDoneCount, t.colMissing];
    const rows = visible.map((s) => {
      const sum = summary(s.id);
      return [
        s.name ?? "", groupName(s.groupId),
        ...data.assignments.flatMap((a) => {
          const c = data.cells[a.id]?.[s.id];
          return c ? [c.attempts ? c.best : "", c.overdue ? t.sMissing : c.status === "done" && c.late ? `${t.sDone} (${t.late})` : label(c)] : ["", t.notAssigned];
        }),
        `${sum.done}/${sum.total}`, sum.missing,
      ];
    });
    return [head, ...rows];
  }

  const fileBase = teamName.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "trida";
  function download(blob: Blob, ext: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileBase}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // BOM, aby Excel poznal UTF-8 a diakritiku.
  const exportCsv = () => download(new Blob(["\ufeff" + toCsv(table())], { type: "text/csv;charset=utf-8" }), "csv");
  const exportXlsx = () => download(new Blob([buildXlsx(table() as never, teamName) as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "xlsx");

  return (
    <section className="print-area flex flex-col gap-3">
      <h2 className="hidden text-xl font-extrabold print:block">{teamName}</h2>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">{t.matrixHint}</p>
        <span className="flex gap-4 print:hidden">
          <button onClick={exportCsv} className={linkBtn}>{t.exportCsv}</button>
          <button onClick={exportXlsx} className={linkBtn}>{t.exportXlsx}</button>
          <button onClick={() => window.print()} className={linkBtn}>{t.printPdf}</button>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="card p-3 text-center" style={{ borderTop: "6px solid var(--brand-500)" }}><p className="text-2xl font-extrabold">{data.students.length}</p><p className="text-xs font-semibold text-[var(--muted)]">{t.colStudent}</p></div>
        <div className="card p-3 text-center" style={{ borderTop: "6px solid var(--accent-blue)" }}><p className="text-2xl font-extrabold">{data.assignments.length}</p><p className="text-xs font-semibold text-[var(--muted)]">{t.tabTasks}</p></div>
        <div className="card p-3 text-center" style={{ borderTop: "6px solid var(--accent-green)" }}><p className="text-2xl font-extrabold">{totals.done}/{totals.total}</p><p className="text-xs font-semibold text-[var(--muted)]">{t.colDoneCount}</p></div>
        <div className="card p-3 text-center" style={{ borderTop: "6px solid var(--danger)" }}><p className="text-2xl font-extrabold text-[var(--danger)]">{totals.missing}</p><p className="text-xs font-semibold text-[var(--muted)]">{t.colMissing}</p></div>
      </div>
      <Progress value={totals.done} max={totals.total} color="var(--accent-green)" label={`${totals.done} / ${totals.total}`} />
      <section className="card flex flex-col gap-2 p-4" aria-label={t.chartTitle}>
        <h3 className="text-lg font-extrabold">{t.chartTitle}</h3>
        <TrendChart points={trend} />
        <p className="text-xs text-[var(--muted)]">{t.chartHint}</p>
      </section>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t.sortLabel} className={field}>
          <option value="name">{t.sortName}</option>
          <option value="done">{t.sortDone}</option>
          <option value="missing">{t.sortMissing}</option>
        </select>
        <select value={groupF} onChange={(e) => setGroupF(e.target.value)} aria-label={t.colGroup} className={field}>
          <option value="">{t.allGroups}</option>
          {data.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label={t.colStatus} className={field}>
          <option value="">{t.allStatuses}</option>
          {(["done", "tried", "viewed", "new"] as const).map((k) => <option key={k} value={k}>{({ done: t.sDone, tried: t.sTried, viewed: t.sViewed, new: t.sNew })[k]}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--border-soft)]">
              <th scope="col" className="sticky left-0 bg-[var(--surface)] p-3">{t.colStudent}</th>
              {data.assignments.map((a) => (
                <th scope="col" key={a.id} className="max-w-40 p-3"><Link href={`/${locale}/tymy/${teamId}/zadani/${a.id}`} className="line-clamp-2 text-[var(--brand-600)]">{a.title}</Link><span className="mt-1 block min-w-20"><Progress value={doneBy(a.id)} max={data.students.length} color="var(--accent-green)" /></span></th>
              ))}
              <th scope="col" className="p-3">{t.colDoneCount}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const sum = summary(s.id);
              return (
                <tr key={s.id} className="border-b border-[var(--border-soft)] last:border-0">
                  <th scope="row" className="sticky left-0 bg-[var(--surface)] p-3 text-left font-semibold"><span className="flex items-center gap-2"><Badge name={s.name} size={28} round />{s.name || t.student}{s.groupId && <Pill tone="brand">{groupName(s.groupId)}</Pill>}</span></th>
                  {data.assignments.map((a) => {
                    const c = data.cells[a.id]?.[s.id];
                    if (!c) return <td key={a.id} className="p-3 text-[var(--muted)]" title={t.notAssigned}>–</td>;
                    return (
                      <td key={a.id} className="p-2">
                        <span className={`inline-block min-w-14 rounded-lg px-2 py-1 text-center text-xs font-bold ${c.overdue ? "bg-[var(--danger)] text-white" : CLS[c.status]}`} title={c.overdue ? t.sMissing : label(c)}>
                          {c.overdue ? t.sMissing : c.attempts ? `${c.best} %` : label(c)}{c.late && c.status === "done" ? ` · ${t.late}` : ""}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-3 font-bold"><span className="flex min-w-24 flex-col gap-1">{sum.done}/{sum.total}<Progress value={sum.done} max={sum.total} color="var(--accent-green)" />{sum.missing > 0 && <span className="text-xs text-[var(--danger)]">{tfillMissing(t, sum.missing)}</span>}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const tfillMissing = (t: TeamsAll, n: number) => t.missingN.replace("{0}", String(n));

/** Průměrný nejlepší výsledek třídy po zadáních (sloupcový graf v SVG, bez knihovny). */
function TrendChart({ points }: { points: { id: string; title: string; avg: number | null; n: number }[] }) {
  const W = 600, H = 160, pad = 24;
  const step = (W - pad * 2) / Math.max(points.length, 1);
  const bw = Math.min(48, step * 0.6);
  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="h-auto w-full" role="img" aria-label={points.map((p) => `${p.title}: ${p.avg ?? "-"} %`).join(", ")}>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={pad} x2={W - 8} y1={H - (v / 100) * (H - 12)} y2={H - (v / 100) * (H - 12)} stroke="var(--border-soft)" strokeDasharray="3 4" />
          <text x={pad - 4} y={H - (v / 100) * (H - 12) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{v}</text>
        </g>
      ))}
      {points.map((p, i) => {
        const x = pad + i * step + (step - bw) / 2;
        const h = p.avg == null ? 0 : (p.avg / 100) * (H - 12);
        return (
          <g key={p.id}>
            <rect x={x} y={H - h} width={bw} height={h} rx={4} fill="var(--brand-500)"><title>{`${p.title}: ${p.avg ?? "-"} %`}</title></rect>
            {p.avg != null && <text x={x + bw / 2} y={H - h - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">{p.avg}</text>}
            <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="var(--muted)">{p.title.length > 12 ? `${p.title.slice(0, 11)}…` : p.title}</text>
          </g>
        );
      })}
    </svg>
  );
}
