"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { ProfileText } from "@/i18n/profile";
import type { UnlockHint } from "@/lib/unlock-hints";

export type CollectionEntry = {
  id: string;
  name: string;
  unlocked: boolean;
  current: boolean;
  preview: ReactNode;
  // Jak věc odemknout (jen u zamčených).
  hint: UnlockHint | null;
};

type Filter = "all" | "fav" | "unlocked" | "locked";

// Mřížka věcí jednoho druhu v profilu: filtry, hvězdička oblíbených a u zamčených věcí
// napsané, jak je odemknout. Samotný výběr věci řeší rodič přes onPick.
export function ProfileCollection({
  t,
  entries,
  favorites,
  busy,
  grid,
  leading,
  onPick,
  onToggleFavorite,
}: {
  t: ProfileText;
  entries: CollectionEntry[];
  favorites: string[];
  busy: boolean;
  grid: string;
  // Volitelná první dlaždice (např. „Žádný rámeček").
  leading?: ReactNode;
  onPick: (id: string) => void;
  onToggleFavorite: (id: string, on: boolean) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const favSet = new Set(favorites);
  const counts: Record<Filter, number> = {
    all: entries.length,
    fav: entries.filter((e) => favSet.has(e.id)).length,
    unlocked: entries.filter((e) => e.unlocked).length,
    locked: entries.filter((e) => !e.unlocked).length,
  };
  const shown = entries.filter((e) => {
    if (filter === "fav") return favSet.has(e.id);
    if (filter === "unlocked") return e.unlocked;
    if (filter === "locked") return !e.unlocked;
    return true;
  });
  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: t.filterAll },
    { id: "fav", label: `★ ${t.filterFavorites}` },
    { id: "unlocked", label: t.filterUnlocked },
    { id: "locked", label: t.filterLocked },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" role="group">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            aria-pressed={filter === c.id}
            className={`pill px-3 py-1.5 text-xs font-bold ${filter === c.id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"}`}
          >
            {c.label} <span className="opacity-70">{counts[c.id]}</span>
          </button>
        ))}
      </div>

      <div className={`grid gap-4 ${grid}`}>
        {filter === "all" && leading}
        {shown.map((entry) => {
          const fav = favSet.has(entry.id);
          const outline = entry.current ? "outline outline-4 outline-offset-2 outline-[var(--brand-500)]" : "";
          const body = (
            <>
              {entry.preview}
              <span className="text-sm font-bold">{entry.name}</span>
              {entry.unlocked ? (
                <span className="text-xs text-[var(--faint)]">{entry.current ? t.selected : t.choose}</span>
              ) : (
                <span className="flex flex-col items-center gap-0.5 text-xs font-semibold text-[var(--accent-500)]">
                  <span aria-hidden>🔒</span>
                  {entry.hint?.text}
                  {entry.hint?.href && <span aria-hidden>→</span>}
                </span>
              )}
            </>
          );
          return (
            <div key={entry.id} className="relative">
              {entry.unlocked ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPick(entry.id)}
                  className={`card card-hover flex h-full w-full flex-col items-center gap-2 p-4 text-center ${outline}`}
                >
                  {body}
                </button>
              ) : entry.hint?.href ? (
                <Link href={entry.hint.href} className="card flex h-full w-full flex-col items-center gap-2 p-4 text-center opacity-85 hover:opacity-100">
                  {body}
                </Link>
              ) : (
                <div className="card flex h-full w-full cursor-help flex-col items-center gap-2 p-4 text-center opacity-85" title={entry.hint?.text}>
                  {body}
                </div>
              )}
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id, !fav)}
                aria-pressed={fav}
                aria-label={fav ? t.removeFavorite : t.addFavorite}
                title={fav ? t.removeFavorite : t.addFavorite}
                className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--edge)] text-base leading-none shadow-[0_2px_0_var(--shadow-ink)] ${fav ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"}`}
              >
                {fav ? "★" : "☆"}
              </button>
            </div>
          );
        })}
      </div>
      {shown.length === 0 && filter !== "all" && <p className="mt-3 text-sm text-[var(--muted)]">{t.emptyFilter}</p>}
    </>
  );
}
