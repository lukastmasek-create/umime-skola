"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { call, errorCode } from "./api";
import { teamsAllError, type TeamsAll } from "@/i18n/teams-more";
import { toCsv } from "@/lib/teams/logic";
import type { Locale } from "@/i18n/config";
import { linkBtn } from "./types";

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

  function exportCsv() {
    if (!data) return;
    const head = [t.colStudent, t.colGroup, ...data.assignments.flatMap((a) => [`${a.title} (%)`, `${a.title}: ${t.colStatus}`]), t.colDoneCount, t.colMissing];
    const rows = data.students.map((s) => {
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
    // BOM, aby Excel poznal UTF-8 a diakritiku.
    const blob = new Blob(["﻿" + toCsv([head, ...rows])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${teamName.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "trida"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">{t.matrixHint}</p>
        <button onClick={exportCsv} className={linkBtn}>{t.exportCsv}</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--border-soft)]">
              <th scope="col" className="sticky left-0 bg-[var(--surface)] p-3">{t.colStudent}</th>
              {data.assignments.map((a) => (
                <th scope="col" key={a.id} className="max-w-40 p-3"><Link href={`/${locale}/tymy/${teamId}/zadani/${a.id}`} className="line-clamp-2 text-[var(--brand-600)]">{a.title}</Link></th>
              ))}
              <th scope="col" className="p-3">{t.colDoneCount}</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => {
              const sum = summary(s.id);
              return (
                <tr key={s.id} className="border-b border-[var(--border-soft)] last:border-0">
                  <th scope="row" className="sticky left-0 bg-[var(--surface)] p-3 text-left font-semibold">{s.name || t.student}{s.groupId && <span className="ml-2 text-xs font-normal text-[var(--muted)]">{groupName(s.groupId)}</span>}</th>
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
                  <td className="p-3 font-bold">{sum.done}/{sum.total}{sum.missing > 0 && <span className="ml-2 text-xs text-[var(--danger)]">{tfillMissing(t, sum.missing)}</span>}</td>
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
