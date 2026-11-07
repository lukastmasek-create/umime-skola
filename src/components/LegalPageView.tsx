import { getLegalPage } from "@/i18n/legal";
import type { Locale } from "@/i18n/config";

export function LegalPageView({ kind, locale }: { kind: "privacy" | "terms"; locale: Locale }) {
  const page = getLegalPage(kind, locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {page.title}
      </h1>
      <p className="mb-8 text-sm text-[var(--muted)]">{page.updated}</p>
      <div className="space-y-6">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-1 text-lg font-bold">{s.h}</h2>
            <p className="text-[var(--muted)]">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
