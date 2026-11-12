"use client";

import { headingStyle } from "./ui";

// Řádek nastavení jako karta (stejný vzhled jako karty na úvodní stránce): nadpis + popisek vlevo, ovládací prvek vpravo.
export function SettingRow({ title, hint, control, children }: { title: string; hint?: string; control?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold" style={headingStyle}>{title}</h3>
          {hint && <p className="mt-0.5 text-sm text-[var(--faint)]">{hint}</p>}
        </div>
        {control && <div className="shrink-0">{control}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[var(--brand-500)]" : "bg-[var(--field-border)]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

// Karta s náhledem a „radio“ kolečkem pod ním.
export function PreviewCard({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-colors ${active ? "border-[var(--brand-500)]" : "border-[var(--border-soft)] hover:border-[var(--edge)]"}`}
    >
      <div className="p-3">{children}</div>
      <div className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium ${active ? "bg-[var(--brand-50)] text-[var(--brand-600)]" : "text-[var(--foreground)]"}`}>
        <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white" : "border-[var(--field-border)]"}`}>
          {active && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M2.5 6.5l2.2 2.2L9.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        {label}
      </div>
    </button>
  );
}

// Miniatura okna aplikace pro náhled motivu.
export function ThemeMini({ mode }: { mode: "light" | "dark" | "split" }) {
  const pane = (dark: boolean) => (
    <div className={`flex h-full flex-1 gap-1.5 p-1.5 ${dark ? "bg-[#2b3340]" : "bg-[#f6f6fb]"}`}>
      <div className={`w-1/5 rounded-sm ${dark ? "bg-[#3a4352]" : "bg-[#e7e8f2]"}`} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className={`h-2 w-1/2 rounded-sm ${dark ? "bg-[#3a4352]" : "bg-[#e7e8f2]"}`} />
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`rounded-sm ${dark ? "bg-[#3a4352]" : "bg-[#e7e8f2]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div className="flex h-24 overflow-hidden rounded-lg border border-black/10" aria-hidden>
      {mode === "light" && pane(false)}
      {mode === "dark" && pane(true)}
      {mode === "split" && (
        <>
          {pane(false)}
          {pane(true)}
        </>
      )}
    </div>
  );
}

// Miniatura tabulky/seznamu pro náhled hustoty písma apod.
export function SegmentedPills<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${value === o.id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
