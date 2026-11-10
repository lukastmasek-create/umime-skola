"use client";

import type { ReactNode } from "react";

// Ikony záložek (24×24, obrysové).
const ICONS: Record<string, ReactNode> = {
  dashboard: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  schedule: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  teams: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M16.5 14.2c2.5.2 4.5 2.4 4.5 5.8" /></>,
  tasks: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17" /></>,
  results: <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
  groups: <><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><path d="M3 19c0-2.8 2.2-5 5-5M21 19c0-2.8-2.2-5-5-5M8 19c0-2.8 1.8-5 4-5s4 2.2 4 5" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /></>,
  people: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>,
};

export type SideItem<K extends string> = { key: K; label: string; icon: keyof typeof ICONS; badge?: number };

/** Svislé menu záložek (ikona + popisek), aktivní položka je zvýrazněná. Na úzkém displeji se zobrazí vodorovně a posouvá se. */
export function EdxSidebar<K extends string>({ items, value, onChange, label }: { items: SideItem<K>[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div role="tablist" aria-orientation="vertical" aria-label={label} className="card flex gap-1 overflow-x-auto rounded-[28px] p-2 lg:flex-col lg:overflow-visible">
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.key)}
            className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${on ? "bg-[var(--brand-50)] text-[var(--brand-700)]" : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[it.icon]}</svg>
            <span className="flex-1">{it.label}</span>
            {it.badge ? <span className="grid min-w-5 place-items-center rounded-full bg-[var(--accent-500)] px-1.5 text-xs font-extrabold text-white" aria-label={String(it.badge)}>{it.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
