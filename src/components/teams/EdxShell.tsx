import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";

/** Rám sekce Týmy ve stylu EducateXpert: zaoblený panel na fialovém pozadí s hlavičkou a šedým tělem. */
export function EdxShell({ locale, title, subtitle, children }: { locale: Locale; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-[#6a1bf0] px-3 py-6 sm:px-8 sm:py-12">
      <div className="edx mx-auto max-w-6xl overflow-hidden rounded-[32px]">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-[var(--brand-500)]" style={{ fontFamily: "var(--font-heading)" }}>{title}</h1>
            {subtitle && <p className="max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p>}
          </div>
          <nav className="edx-pill-nav" aria-label={title}>
            <Link href={`/${locale}/tymy`} className="rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">{title}</Link>
          </nav>
        </header>
        <div className="bg-[var(--background)] p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
