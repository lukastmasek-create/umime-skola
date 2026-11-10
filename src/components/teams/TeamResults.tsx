"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { call, errorCode } from "./api";
import { teamsAllError, type TeamsAll } from "@/i18n/teams-more";
import { toCsv } from "@/lib/teams/logic";
import { buildXlsx } from "@/lib/teams/xlsx";
import type { Locale } from "@/i18n/config";
import { field } from "./types";
import { Badge } from "./ui";
import { getTeamsEdx } from "@/i18n/teams-edx";

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
  const [pill, setPill] = useState<"all" | "ok" | "mid" | "out">("all");
  const [q, setQ] = useState("");
  const e = getTeamsEdx(locale);

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

  // Stav žáka: chybí = má zadání po termínu, splněno = má hotová všechna, jinak rozpracováno.
  const state = (sid: string): "ok" | "mid" | "out" => {
    const x = summary(sid);
    return x.missing > 0 ? "out" : x.total > 0 && x.done === x.total ? "ok" : "mid";
  };
  const avgOf = (sid: string) => {
    const got = data.assignments.map((a) => data.cells[a.id]?.[sid]).filter((c): c is Cell => !!c && c.attempts > 0);
    return got.length ? Math.round(got.reduce((n, c) => n + c.best, 0) / got.length) : null;
  };
  const passOf = (sid: string) => {
    const mine = data.assignments.filter((a) => data.cells[a.id]?.[sid]);
    return mine.length ? Math.round(mine.reduce((n, a) => n + a.passPercent, 0) / mine.length) : 0;
  };
  const counts = { all: data.students.length, ok: 0, mid: 0, out: 0 };
  for (const st of data.students) counts[state(st.id)]++;
  // Rozpad všech buněk žák × zadání pro prstencový graf.
  const split = { done: 0, tried: 0, waiting: 0, missing: 0 };
  for (const a of data.assignments) for (const st of data.students) {
    const c = data.cells[a.id]?.[st.id];
    if (!c) continue;
    if (c.status === "done") split.done++;
    else if (c.overdue) split.missing++;
    else if (c.status === "tried") split.tried++;
    else split.waiting++;
  }
  const byGroup = [...data.groups.map((g) => ({ id: g.id, name: g.name })), { id: "", name: e.rNoGroup }]
    .map((g) => {
      const ids = data.students.filter((st) => (st.groupId ?? "") === g.id).map((st) => st.id);
      const sums = ids.map(summary);
      const total = sums.reduce((n, x) => n + x.total, 0);
      return { name: g.name, pct: total ? Math.round((sums.reduce((n, x) => n + x.done, 0) / total) * 100) : 0, n: ids.length };
    })
    .filter((g) => g.n > 0);
  const doneBy = (aid: string) => data.students.filter((st) => data.cells[aid]?.[st.id]?.status === "done").length;

  const visible = [...data.students]
    .filter((st) => !groupF || st.groupId === groupF)
    .filter((st) => pill === "all" || state(st.id) === pill)
    .filter((st) => !q.trim() || (st.name ?? "").toLowerCase().includes(q.trim().toLowerCase()))
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

  const scored = trend.filter((x) => x.avg != null);
  const overallAvg = scored.length ? Math.round(scored.reduce((n, x) => n + (x.avg ?? 0), 0) / scored.length) : null;
  const donut = [
    { key: "done", v: split.done, c: "var(--accent-green)", label: e.rDone },
    { key: "tried", v: split.tried, c: "var(--accent-yellow)", label: e.rTried },
    { key: "waiting", v: split.waiting, c: "var(--border-soft)", label: e.rWaiting },
    { key: "missing", v: split.missing, c: "var(--danger)", label: e.rMissing },
  ];
  const donutTotal = donut.reduce((n, d) => n + d.v, 0);
  const chip = { ok: "bg-[color-mix(in_srgb,var(--accent-green)_18%,transparent)] text-[var(--accent-green)]", mid: "bg-[color-mix(in_srgb,var(--accent-yellow)_22%,transparent)] text-[var(--foreground)]", out: "bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]" } as const;
  const chipLabel = { ok: e.rDone, mid: e.rMid, out: e.rMissing } as const;
  return (
    <section className="print-area flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{t.tabResults}</h2>
          <p className="text-sm text-[var(--muted)]">{teamName} · {new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}{overallAvg != null && <> · {e.rAvg}: <b className="text-[var(--foreground)]">{overallAvg} %</b></>}</p>
        </div>
        <details className="relative print:hidden">
          <summary className="btn-bouncy cursor-pointer list-none bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">Export</summary>
          <div className="card absolute right-0 z-20 mt-2 flex w-52 flex-col p-1.5" role="menu">
            {([[t.exportCsv, exportCsv], [t.exportXlsx, exportXlsx], [t.printPdf, () => window.print()]] as [string, () => void][]).map(([label, fn]) => (
              <button key={label} role="menuitem" onClick={(ev) => { (ev.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open"); fn(); }} className="rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-[var(--surface-muted)]">{label}</button>
            ))}
          </div>
        </details>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card flex flex-col gap-3 p-5" aria-label={e.rDonut}>
          <h3 className="text-sm font-bold text-[var(--muted)]">{e.rDonut}</h3>
          <div className="relative mx-auto size-40">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={donut.map((d) => `${d.label}: ${d.v}`).join(", ")}>
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--surface-muted)" strokeWidth="14" />
              {(() => {
                let off = 0;
                const C = 2 * Math.PI * 48;
                return donut.filter((d) => d.v > 0).map((d) => {
                  const len = (d.v / donutTotal) * C;
                  const el = <circle key={d.key} cx="60" cy="60" r="48" fill="none" stroke={d.c} strokeWidth="14" strokeDasharray={`${Math.max(len - 2, 0)} ${C}`} strokeDashoffset={-off} />;
                  off += len;
                  return el;
                });
              })()}
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <span className="text-4xl font-extrabold leading-none">{donutTotal}</span>
              <span className="mt-1 text-[10px] text-[var(--muted)]">{e.rDonutSub}</span>
            </div>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
            {donut.map((d) => <li key={d.key} className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ background: d.c }} />{d.label} <b className="text-[var(--foreground)]">{d.v}</b></li>)}
          </ul>
        </section>

        <section className="card flex flex-col gap-3 p-5" aria-label={e.rRadar}>
          <h3 className="text-sm font-bold text-[var(--muted)]">{e.rRadar}</h3>
          {trend.length >= 3 ? <Radar points={trend} /> : <TrendChart points={trend} />}
        </section>

        <section className="card flex flex-col gap-4 p-5" aria-label={e.rBars}>
          <h3 className="text-sm font-bold text-[var(--muted)]">{e.rBars}</h3>
          {byGroup.slice(0, 4).map((g) => (
            <div key={g.name} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between text-sm"><b className="truncate">{g.name}</b><span className="text-xs text-[var(--muted)]">{g.pct}%</span></div>
              <div className="grid grid-cols-10 gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={g.pct}>
                {Array.from({ length: 10 }, (_, i) => <span key={i} className={`h-2 rounded-sm ${g.pct > i * 10 ? "bg-[var(--brand-500)]" : "bg-[var(--surface-muted)]"}`} />)}
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {([["all", e.rAll], ["ok", e.rDone], ["mid", e.rMid], ["out", e.rMissing]] as const).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={pill === k} onClick={() => setPill(k)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${pill === k ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{label} <span className="opacity-70">{counts[k]}</span></button>
        ))}
        <select value={sort} onChange={(ev) => setSort(ev.target.value as typeof sort)} aria-label={t.sortLabel} className={`${field} ml-auto`}>
          <option value="name">{t.sortName}</option>
          <option value="done">{t.sortDone}</option>
          <option value="missing">{t.sortMissing}</option>
        </select>
        {data.groups.length > 0 && (
          <select value={groupF} onChange={(ev) => setGroupF(ev.target.value)} aria-label={t.colGroup} className={field}>
            <option value="">{t.allGroups}</option>
            {data.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
        <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder={e.rSearch} aria-label={e.rSearch} className={`${field} w-48`} />
      </div>

      <section className="card p-2 sm:p-4" aria-label={t.colStudent}>
        <div className="hidden grid-cols-[minmax(0,1.4fr)_5rem_minmax(0,2fr)_7.5rem] gap-4 px-3 pb-2 text-xs text-[var(--muted)] md:grid">
          <span>{t.colStudent}</span><span className="text-right">{e.rColValue}</span><span>{e.rColRange}</span><span className="text-center">{e.rColStatus}</span>
        </div>
        <ul className="divide-y divide-[var(--border-soft)]">
          {visible.map((s) => {
            const sum = summary(s.id);
            const avg = avgOf(s.id);
            const pass = passOf(s.id);
            const st = state(s.id);
            return (
              <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3 py-3 md:grid-cols-[minmax(0,1.4fr)_5rem_minmax(0,2fr)_7.5rem]">
                <span className="flex min-w-0 items-center gap-2.5">
                  <Badge name={s.name} size={30} round />
                  <span className="flex min-w-0 flex-col text-sm font-semibold"><span className="truncate">{s.name || t.student}</span>{s.groupId && <span className="truncate text-xs font-normal text-[var(--muted)]">{groupName(s.groupId)}</span>}</span>
                </span>
                <span className="hidden text-right text-sm md:block"><b>{sum.done}</b><span className="text-xs text-[var(--muted)]">/{sum.total}</span></span>
                <span className="relative hidden h-5 items-center md:flex" role="img" aria-label={avg == null ? e.rNoData : `${e.rAvg} ${avg} %, ${pass} %`}>
                  <span className="absolute inset-x-0 h-0.5 rounded bg-[var(--border-soft)]" />
                  <span className="absolute h-0.5 rounded bg-[var(--accent-green)] opacity-70" style={{ left: `${pass}%`, right: 0 }} />
                  {avg != null && <span className="absolute size-3 -translate-x-1/2 rounded-full border-2 border-[var(--surface)]" style={{ left: `${Math.min(avg, 100)}%`, background: avg >= pass ? "var(--accent-green)" : "var(--accent-yellow)" }} title={`${avg} %`} />}
                  <span className="absolute -bottom-3 left-0 text-[10px] text-[var(--muted)]">0</span>
                  <span className="absolute -bottom-3 text-[10px] text-[var(--muted)]" style={{ left: `${pass}%` }}>{pass}</span>
                  <span className="absolute -bottom-3 right-0 text-[10px] text-[var(--muted)]">100</span>
                </span>
                <span className="justify-self-end md:justify-self-center"><span className={`inline-block rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${chip[st]}`}>{chipLabel[st]}</span></span>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-[var(--muted)]">{e.rNoData}</li>}
        </ul>
      </section>

      <h3 className="text-lg font-extrabold">{e.rMatrix}</h3>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--border-soft)]">
              <th scope="col" className="sticky left-0 bg-[var(--surface)] px-4 py-3 text-xs uppercase tracking-wide text-[var(--muted)]">{t.colStudent}</th>
              {data.assignments.map((a) => (
                <th scope="col" key={a.id} className="max-w-40 px-3 py-3">
                  <Link href={`/${locale}/tymy/${teamId}/zadani/${a.id}`} className="line-clamp-2 text-[var(--brand-600)]">{a.title}</Link>
                  <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">{doneBy(a.id)}/{data.students.length}</span>
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-xs uppercase tracking-wide text-[var(--muted)]">{t.colDoneCount}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const sum = summary(s.id);
              return (
                <tr key={s.id} className="border-b border-[var(--border-soft)] last:border-0">
                  <th scope="row" className="sticky left-0 bg-[var(--surface)] px-4 py-3 text-left font-semibold">
                    <span className="flex items-center gap-2.5">
                      <Badge name={s.name} size={30} round />
                      <span className="flex flex-col">{s.name || t.student}{s.groupId && <span className="text-xs font-normal text-[var(--muted)]">{groupName(s.groupId)}</span>}</span>
                    </span>
                  </th>
                  {data.assignments.map((a) => {
                    const c = data.cells[a.id]?.[s.id];
                    if (!c) return <td key={a.id} className="px-3 py-3 text-[var(--muted)]" title={t.notAssigned}>–</td>;
                    const strong = c.overdue || c.attempts > 0;
                    return (
                      <td key={a.id} className="px-3 py-3">
                        <span className={`inline-block min-w-14 rounded-lg px-2 py-1 text-center text-xs font-bold ${c.overdue ? "bg-[var(--danger)] text-white" : strong ? CLS[c.status] : "font-normal text-[var(--muted)]"}`} title={c.overdue ? t.sMissing : label(c)}>
                          {c.overdue ? t.sMissing : c.attempts ? `${c.best} %` : label(c)}{c.late && c.status === "done" ? ` · ${t.late}` : ""}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 font-bold">{sum.done}/{sum.total}{sum.missing > 0 && <span className="block text-xs font-normal text-[var(--danger)]">{tfillMissing(t, sum.missing)}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--muted)]">{t.matrixHint}</p>
    </section>
  );
}

const tfillMissing = (t: TeamsAll, n: number) => t.missingN.replace("{0}", String(n));

/** Paprskový graf: průměrný nejlepší výsledek třídy v každém zadání (osy = zadání). */
function Radar({ points }: { points: { id: string; title: string; avg: number | null }[] }) {
  const S = 220, c = S / 2, R = 70;
  const n = points.length;
  const at = (i: number, r: number) => [c + r * Math.sin((2 * Math.PI * i) / n), c - r * Math.cos((2 * Math.PI * i) / n)] as const;
  const ring = (f: number) => points.map((_, i) => at(i, R * f).join(",")).join(" ");
  const shape = points.map((p, i) => at(i, (R * (p.avg ?? 0)) / 100).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto h-auto w-full max-w-60" role="img" aria-label={points.map((p) => `${p.title}: ${p.avg ?? "-"} %`).join(", ")}>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={ring(f)} fill="none" stroke="var(--border-soft)" />)}
      {points.map((_, i) => <line key={i} x1={c} y1={c} x2={at(i, R)[0]} y2={at(i, R)[1]} stroke="var(--border-soft)" />)}
      <polygon points={shape} fill="var(--brand-500)" fillOpacity={0.3} stroke="var(--brand-500)" strokeWidth="2" />
      {points.map((p, i) => {
        const [x, y] = at(i, R + 14);
        const label = p.title.length > 11 ? `${p.title.slice(0, 10)}…` : p.title;
        return <text key={p.id} x={x} y={y} textAnchor={Math.abs(x - c) < 4 ? "middle" : x > c ? "start" : "end"} dominantBaseline="middle" fontSize="8" fill="var(--muted)">{label}</text>;
      })}
    </svg>
  );
}

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
