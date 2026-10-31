"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EscapeText } from "@/i18n/escape";
import type { Locale } from "@/i18n/config";
import { DifficultyStars } from "./DifficultyStars";

export type EscapeCard = EscapeText["list"]["rooms"][number] & {
  difficulty: number;
  roomCount: number;
  minutes: number;
  // Nejlepší výsledek přihlášeného hráče (1–3 hvězdičky), když únikovku už dohrál.
  best?: number;
};

type Sort = "default" | "easiest" | "hardest" | "subject";
const SORTS: Sort[] = ["default", "easiest", "hardest", "subject"];
const STORAGE_KEY = "unikovky:list";
const COLORS = ["#7ee0b0", "#ffc933", "#8fd0ff", "#ff8a6b"];

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));

// Výpis únikovek s řazením podle obtížnosti nebo předmětu a filtrem podle předmětu.
export function EscapeList({ locale, t, cards }: { locale: Locale; t: EscapeText["list"]; cards: EscapeCard[] }) {
  const [sort, setSort] = useState<Sort>("default");
  const [subject, setSubject] = useState<string | null>(null);

  // Zapamatovaná volba (jen pohodlí jednoho prohlížeče, bez ní stránka funguje stejně).
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- načtení uložené volby po hydrataci
      if (saved && SORTS.includes(saved.sort)) setSort(saved.sort);
      if (saved && typeof saved.subject === "string" && cards.some((c) => c.subject === saved.subject)) setSubject(saved.subject);
    } catch {}
  }, [cards]);

  function remember(next: { sort: Sort; subject: string | null }) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  const subjects = useMemo(
    () => [...new Set(cards.map((c) => c.subject))].sort((a, b) => a.localeCompare(b, locale)),
    [cards, locale],
  );

  const visible = useMemo(() => {
    const list = cards.filter((c) => subject === null || c.subject === subject);
    const byName = (a: EscapeCard, b: EscapeCard) => a.name.localeCompare(b.name, locale);
    if (sort === "easiest") return [...list].sort((a, b) => a.difficulty - b.difficulty || byName(a, b));
    if (sort === "hardest") return [...list].sort((a, b) => b.difficulty - a.difficulty || byName(a, b));
    if (sort === "subject")
      return [...list].sort((a, b) => a.subject.localeCompare(b.subject, locale) || a.difficulty - b.difficulty || byName(a, b));
    return list;
  }, [cards, sort, subject, locale]);

  // Při řazení podle předmětu se karty seskupí pod nadpisy předmětů.
  const groups: { title: string | null; cards: EscapeCard[] }[] =
    sort === "subject"
      ? subjects
          .map((s) => ({ title: s, cards: visible.filter((c) => c.subject === s) }))
          .filter((g) => g.cards.length > 0)
      : [{ title: null, cards: visible }];

  const chip = (activeChip: boolean) =>
    `pill px-3 py-1.5 text-sm font-semibold transition-colors ${
      activeChip ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)] hover:bg-[var(--surface-muted)]"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--faint)]">{t.subjectLabel}</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.subjectLabel}>
            <button
              className={chip(subject === null)}
              aria-pressed={subject === null}
              onClick={() => {
                setSubject(null);
                remember({ sort, subject: null });
              }}
            >
              {t.allSubjects}
            </button>
            {subjects.map((s) => (
              <button
                key={s}
                className={chip(subject === s)}
                aria-pressed={subject === s}
                onClick={() => {
                  setSubject(s);
                  remember({ sort, subject: s });
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <label className="flex shrink-0 flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--faint)]">{t.sortLabel}</span>
          <select
            value={sort}
            onChange={(e) => {
              const next = e.target.value as Sort;
              setSort(next);
              remember({ sort: next, subject });
            }}
            className="rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t.sort[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="-mt-3 text-sm text-[var(--faint)]" aria-live="polite">
        {fill(t.shown, { n: visible.length })}
      </p>

      {/* Skupiny předmětů tečou vedle sebe, ať jednočlenné skupiny nenechávají prázdné řádky. */}
      <div className={sort === "subject" ? "grid items-start gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" : "contents"}>
      {groups.map((group) => (
        <section key={group.title ?? "all"} className="flex flex-col gap-3">
          {group.title && (
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {group.title}
            </h2>
          )}
          <div className={group.title ? "grid gap-5" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
            {group.cards.map((room) => {
              const color = COLORS[cards.indexOf(room) % COLORS.length];
              const level = t.levels[room.difficulty - 1];
              const content = (
                <>
                  <div
                    className="relative flex h-40 items-start justify-between overflow-hidden rounded-xl border-2 border-[var(--edge)] p-3"
                    style={{ backgroundColor: color }}
                  >
                    <div
                      aria-hidden
                      className="globe-sprite pointer-events-none absolute -bottom-3 left-1/2 h-44 w-44 -translate-x-1/2 drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]"
                      style={{ backgroundImage: `url(/home/unikovky/${room.id}.webp)` }}
                    />
                    <span className="pill relative bg-[var(--surface)] px-2.5 py-1 text-xs">{room.subject}</span>
                    {room.best ? (
                      <span className="pill relative bg-[var(--surface)] px-2.5 py-1 text-xs" title={t.best}>
                        <span className="sr-only">{t.best}: </span>
                        <span className="text-[var(--accent-yellow)]">{"★".repeat(room.best)}</span>
                        <span className="text-[var(--border-soft)]">{"★".repeat(3 - room.best)}</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="text-lg font-bold leading-snug">{room.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{room.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs font-semibold text-[var(--muted)]">
                      <span className="flex items-center gap-1.5">
                        <DifficultyStars value={room.difficulty} label={`${t.difficulty}: ${level} (${room.difficulty}/5)`} className="text-base" />
                        <span>{level}</span>
                      </span>
                      <span>🚪 {fill(t.roomsCount, { n: room.roomCount })}</span>
                      <span>⏱ {fill(t.minutes, { min: room.minutes })}</span>
                    </div>
                  </div>
                  <span className="btn-bouncy self-start bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
                    {room.available ? t.play : t.soon}
                  </span>
                </>
              );
              return room.available ? (
                <Link key={room.id} href={`/${locale}/unikovky/${room.id}`} className="card card-hover flex flex-col gap-4 p-4">
                  {content}
                </Link>
              ) : (
                <div key={room.id} className="card flex flex-col gap-4 p-4 opacity-70">
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}
