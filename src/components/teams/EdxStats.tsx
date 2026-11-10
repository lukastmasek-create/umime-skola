import type { ReactNode } from "react";

export type Stat = { icon: ReactNode; value: string; label: string };

/** Kreslí obrysovou ikonu 24×24 ze zadaných cest. */
export const StatIcon = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export const ICONS = {
  doc: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M9.5 12h5M9.5 16h5" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16.5 14.2c2.5.2 4.5 2.4 4.5 5.8" /></>,
  check: <path d="m8 12.5 3 3 5-6M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  alert: <><path d="M12 4 3 20h18z" /><path d="M12 10v4M12 17h.01" /></>,
};

/** Pruh se čtyřmi statistikami (ikona, číslo, popisek), oddělenými svislými čárami. */
export function EdxStats({ stats, label }: { stats: Stat[]; label: string }) {
  return (
    <section className="card grid grid-cols-2 gap-y-4 p-5 lg:grid-cols-4 lg:divide-x lg:divide-[var(--border-soft)]" aria-label={label}>
      {stats.map((s) => (
        <div key={s.label} className="flex min-w-0 items-center gap-3 lg:px-5 lg:first:pl-0">
          <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--muted)]"><StatIcon>{s.icon}</StatIcon></span>
          <div className="min-w-0">
            <p className="truncate text-2xl font-extrabold leading-none">{s.value}</p>
            <p className="mt-1 truncate text-xs text-[var(--muted)]">{s.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
