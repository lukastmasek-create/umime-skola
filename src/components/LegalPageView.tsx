import { getLegalPage } from "@/i18n/legal";
import type { Locale } from "@/i18n/config";
import { SketchIcon, type SketchIconKind } from "@/components/SketchIcons";
import { SketchEdge } from "@/components/SketchEdge";

// Kreslený vzhled zásad: lepené karty s černým obrysem a tvrdým stínem, barevné odznaky s ikonami
// a skicovaná čára pod nadpisem. Stejné prvky jako hlavička, patička a karty na zbytku webu.
const BADGE_COLORS = ["#ffc933", "#8fd0ff", "#7ee0b0", "#c9a8ff", "#ff8a6b"];
const HERO_ICON: Record<"privacy" | "terms" | "cookies", SketchIconKind> = {
  privacy: "shield",
  terms: "scroll",
  cookies: "star",
};

export function LegalPageView({ kind, locale }: { kind: "privacy" | "terms" | "cookies"; locale: Locale }) {
  const page = getLegalPage(kind, locale);
  return (
    <div className="legal-page mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="legal-hero">
        <span className="legal-hero-ico" aria-hidden>
          <SketchIcon kind={HERO_ICON[kind]} size={40} />
        </span>
        <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {page.title}
        </h1>
        <p className="legal-updated">{page.updated}</p>
        <p className="legal-intro">{page.intro}</p>
        <SketchEdge position="bottom" />
      </header>

      <aside className="legal-summary" aria-labelledby="legal-summary-title">
        <h2 id="legal-summary-title">{page.summaryTitle}</h2>
        <ul>
          {page.summary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>

      <nav aria-label={page.tocTitle} className="legal-toc">
        {page.sections.map((s, i) => (
          <a key={s.h} href={`#sekce-${i + 1}`} className="sketch-chip">
            {s.h}
          </a>
        ))}
      </nav>

      <div className="space-y-5">
        {page.sections.map((s, i) => (
          <section key={s.h} id={`sekce-${i + 1}`} className="legal-card">
            <div className="legal-card-head">
              <span className="legal-badge" style={{ background: BADGE_COLORS[i % BADGE_COLORS.length] }} aria-hidden>
                <SketchIcon kind={s.icon ?? "scroll"} size={22} />
              </span>
              <h2>{s.h}</h2>
              <span className="legal-num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            {s.p && <p>{s.p}</p>}
            {s.list && (
              <ul className="legal-list">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {s.table && (
              <div className="legal-table-wrap">
                <table className="legal-table">
                  <thead>
                    <tr>
                      {s.table.head.map((th) => (
                        <th key={th} scope="col">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, j) => (
                          <td key={`${row[0]}-${j}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
