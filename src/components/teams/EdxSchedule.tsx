"use client";

import { Glyph } from "./Glyph";
import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getTeamsEdx } from "@/i18n/teams-edx";
import type { Deadline } from "./types";

type Tone = "done" | "high" | "low" | "plan";
const DAY = 86400000;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const TONE_CLS: Record<Tone, string> = {
  done: "bg-[var(--surface-muted)]",
  high: "bg-[var(--brand-500)] text-white [--muted:#e4d8ff]",
  low: "bg-[var(--accent-yellow)] text-[#17142b] [--muted:#44501a]",
  plan: "bg-[var(--surface)] ring-1 ring-[var(--border-soft)]",
};

/** Rozvrh termínů: týdenní mřížka po–pá (víkend jen když tam něco je) nebo měsíční přehled, barevně podle naléhavosti. */
export function EdxSchedule({ locale, items }: { locale: Locale; items: Deadline[] }) {
  const t = getTeamsEdx(locale);
  const [now] = useState(() => new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [offset, setOffset] = useState(0);
  const [team, setTeam] = useState("all");

  const teams = Array.from(new Map(items.map((d) => [d.teamId, d.teamName])));
  const shown = items.filter((d) => team === "all" || d.teamId === team);
  const byDay = new Map<string, Deadline[]>();
  for (const d of shown) {
    const k = ymd(new Date(d.dueAt));
    byDay.set(k, [...(byDay.get(k) ?? []), d]);
  }
  const tone = (d: Deadline): Tone => {
    if (d.done) return "done";
    const diff = new Date(d.dueAt).getTime() - now.getTime();
    return diff < 0 ? "high" : diff < 2 * DAY ? "low" : "plan";
  };
  const tag = (x: Tone) => (x === "done" ? t.schDone : x === "high" ? t.prioHigh : x === "low" ? t.prioLow : t.schPlanned);
  const time = (d: Deadline) => new Date(d.dueAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const href = (d: Deadline) => `/${locale}/tymy/${d.teamId}/zadani/${d.assignmentId}`;
  const wk = (d: Date) => d.toLocaleDateString(locale, { weekday: "short" }).toUpperCase().replace(".", "");

  let head: string;
  let body: React.ReactNode;
  if (view === "week") {
    const start = addDays(mondayOf(now), offset * 7);
    const weekend = [5, 6].some((i) => (byDay.get(ymd(addDays(start, i))) ?? []).length > 0);
    const days = Array.from({ length: weekend ? 7 : 5 }, (_, i) => addDays(start, i));
    head = `${start.toLocaleDateString(locale, { day: "numeric", month: "long" })} – ${addDays(start, 6).toLocaleDateString(locale, { day: "numeric", month: "long" })}`;
    body = (
      <div className="overflow-x-auto">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(7.5rem, 1fr))` }}>
          {days.map((d) => {
            const list = (byDay.get(ymd(d)) ?? []).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
            const today = ymd(d) === ymd(now);
            return (
              <div key={ymd(d)} className="flex flex-col gap-2 rounded-3xl bg-[var(--surface-muted)] p-2">
                <p className={`rounded-2xl px-3 py-2 text-sm font-bold ${today ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)]"}`}>{wk(d)} {d.getDate()}</p>
                {list.length === 0 && <p className="rounded-2xl border border-dashed border-[var(--border-soft)] p-3 text-sm text-[var(--muted)]">• {t.schNone}</p>}
                {list.map((x) => {
                  const k = tone(x);
                  return (
                    <Link key={x.assignmentId} href={href(x)} className={`flex flex-col gap-1.5 rounded-2xl p-3 hover:-translate-y-0.5 ${TONE_CLS[k]}`} style={{ transition: "transform .14s" }}>
                      <span className="text-xs font-semibold opacity-80">• {tag(k)}</span>
                      <b className="text-base leading-tight">{x.title}</b>
                      <span className="truncate text-xs text-[var(--muted)]">{x.teamName}</span>
                      <span className="flex items-center gap-1 text-xs font-bold">⏱ {time(x)}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const start = mondayOf(first);
    const n = Math.ceil((((addDays(last, 6 - ((last.getDay() + 6) % 7))).getTime() - start.getTime()) / DAY + 1) / 7) * 7;
    const days = Array.from({ length: n }, (_, i) => addDays(start, i));
    head = first.toLocaleDateString(locale, { month: "long", year: "numeric" });
    body = (
      <div className="overflow-x-auto">
        <div className="grid min-w-[40rem] grid-cols-7 gap-1.5">
          {days.slice(0, 7).map((d) => <p key={ymd(d)} className="px-2 py-1 text-xs font-bold text-[var(--muted)]">{wk(d)}</p>)}
          {days.map((d) => {
            const list = byDay.get(ymd(d)) ?? [];
            const inMonth = d.getMonth() === first.getMonth();
            return (
              <div key={ymd(d)} className={`flex min-h-24 flex-col gap-1 rounded-2xl bg-[var(--surface-muted)] p-1.5 ${inMonth ? "" : "opacity-40"} ${ymd(d) === ymd(now) ? "ring-2 ring-[var(--brand-500)]" : ""}`}>
                <span className="px-1 text-xs font-bold text-[var(--muted)]">{d.getDate()}</span>
                {list.slice(0, 2).map((x) => (
                  <Link key={x.assignmentId} href={href(x)} title={`${x.title} · ${x.teamName}`} className={`truncate rounded-lg px-1.5 py-0.5 text-xs font-bold ${TONE_CLS[tone(x)]}`}>{x.title}</Link>
                ))}
                {list.length > 2 && <span className="px-1 text-xs text-[var(--muted)]">+{list.length - 2}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const pillBtn = "rounded-full px-4 py-2 text-sm font-bold";
  return (
    <section className="card flex flex-col gap-4 p-5" aria-label={t.schTitle}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold">{t.schTitle}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">
            <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 5h16l-6 8v6l-4-2v-4z" /></svg>
            <span className="sr-only">{t.schFilter}</span>
            <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label={t.schFilter} className="max-w-36 !border-0 bg-transparent !p-0 text-sm font-bold">
              <option value="all">{t.schAll}</option>
              {teams.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <div className="edx-pill-nav" role="group">
            {([["week", t.schWeek], ["month", t.schMonth]] as const).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={view === k} onClick={() => { setView(k); setOffset(0); }} className={`${pillBtn} ${view === k ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm font-bold">
        <button type="button" onClick={() => setOffset(offset - 1)} aria-label={t.schPrev} className="grid size-9 place-items-center rounded-full bg-[var(--surface-muted)]"><Glyph name="arrowLeft" /></button>
        <button type="button" onClick={() => setOffset(0)} className="rounded-full px-3 py-1 hover:bg-[var(--surface-muted)]" title={t.schToday}>{head}</button>
        <button type="button" onClick={() => setOffset(offset + 1)} aria-label={t.schNext} className="grid size-9 place-items-center rounded-full bg-[var(--surface-muted)]"><Glyph name="arrowRight" /></button>
      </div>
      {body}
    </section>
  );
}
