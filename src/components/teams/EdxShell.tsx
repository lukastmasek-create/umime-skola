import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getTeamsEdx } from "@/i18n/teams-edx";
import { HeroSky } from "@/components/HeroSky";

/** Rám sekce Týmy ve stylu EducateXpert: zaoblený panel s hlavičkou a tmavým tělem na pozadí jako hero úvodní stránky. */
export function EdxShell({ locale, title, subtitle, children }: { locale: Locale; title: string; subtitle?: string; children: ReactNode }) {
  const t = getTeamsEdx(locale);
  const links = [["kurzy", t.navCourses], ["tymy", t.navTeams], ["zebricky", t.navRating], ["ucitele", t.navTeachers]] as const;
  return (
    // Pozadí stejné jako hero na úvodní stránce (mlhovina, hvězdy, kometa, loď); panel je nad lodí, ať přes obsah neletí.
    <div className="zone zone-space px-3 py-6 sm:px-8 sm:py-12">
      <HeroSky />
      <div className="edx relative z-30 mx-auto max-w-6xl overflow-hidden rounded-[32px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-[var(--brand-500)]" style={{ fontFamily: "var(--font-heading)" }}>{title}</h1>
            {subtitle && <p className="max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p>}
          </div>
          <nav className="edx-pill-nav" aria-label={title}>
            {links.map(([path, label]) => (
              <Link key={path} href={`/${locale}/${path}`} aria-current={path === "tymy" ? "page" : undefined} className={`rounded-full px-5 py-2 text-sm font-bold ${path === "tymy" ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>{label}</Link>
            ))}
          </nav>
        </header>
        <div className="bg-[var(--background)] p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
