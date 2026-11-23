"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EscapeText } from "@/i18n/escape";
import type { Locale } from "@/i18n/config";
import { PxIcon, PxRow } from "@/components/pixel/PixelKit";
import { PxScene } from "@/components/pixel/PixelScene";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="px-box flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--px-dim)]">{t.subjectLabel}</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.subjectLabel}>
            <button
              className="px-chip"
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
                className="px-chip"
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
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--px-dim)]">{t.sortLabel}</span>
          <select
            value={sort}
            onChange={(e) => {
              const next = e.target.value as Sort;
              setSort(next);
              remember({ sort: next, subject });
            }}
            className="px-select"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t.sort[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="-mt-3 text-sm text-[var(--px-dim)]" aria-live="polite">
        {fill(t.shown, { n: visible.length })}
      </p>

      {/* Skupiny předmětů tečou vedle sebe, ať jednočlenné skupiny nenechávají prázdné řádky. */}
      <div className={sort === "subject" ? "grid items-start gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" : "contents"}>
      {groups.map((group) => (
        <section key={group.title ?? "all"} className="flex flex-col gap-3">
          {group.title && (
            <h2 className="px-title text-xl">
              {group.title}
            </h2>
          )}
          <div className={group.title ? "grid gap-5" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
            {group.cards.map((room) => {
              const color = COLORS[cards.indexOf(room) % COLORS.length];
              const level = t.levels[room.difficulty - 1];
              const content = (
                <>
                  <div className="relative flex h-40 items-start justify-between overflow-hidden p-3" style={{ backgroundColor: color }}>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-3" style={{ background: "linear-gradient(#4cc16b 0 6px, #8a5a2b 6px)" }} />
                    <PxScene id={room.id} className="absolute -bottom-0 left-1/2 h-[8rem] w-[12rem] -translate-x-1/2" />
                    <span className="px-pill relative">{room.subject}</span>
                    {room.best ? (
                      <span className="px-pill relative" title={t.best}>
                        <span className="sr-only">{t.best}: </span>
                        <PxRow icon="star" value={room.best} max={3} label={`${t.best}: ${room.best}/3`} />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-4">
                    <h3 className="px-card-title !p-0 !text-left !text-xl">{room.name}</h3>
                    <p className="text-sm text-[var(--px-dim)]">{room.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs font-semibold text-[var(--px-dim)]">
                      <span className="flex items-center gap-1.5">
                        <PxRow icon="sword" value={room.difficulty} max={5} label={`${t.difficulty}: ${level} (${room.difficulty}/5)`} />
                        <span>{level}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PxIcon name="door" scale={2} /> {fill(t.roomsCount, { n: room.roomCount })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PxIcon name="hourglass" scale={2} /> {fill(t.minutes, { min: room.minutes })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-btn ${room.available ? "px-btn-green" : ""} ml-3 self-start`} aria-hidden>
                    {room.available ? `▶ ${t.play}` : t.soon}
                  </span>
                </>
              );
              return room.available ? (
                <Link key={room.id} href={`/${locale}/unikovky/${room.id}`} className="px-box px-box-hover gap-4 pb-3 focus-visible:outline-none">
                  {content}
                </Link>
              ) : (
                <div key={room.id} className="px-box px-hatch gap-4 pb-3 opacity-70">
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
