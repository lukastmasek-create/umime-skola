import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProTabsText } from "@/i18n/pro-tabs";
import { PRO_TABS, proTabPath } from "@/lib/pro-tools/features";

// Odkazy na záložky UčímePRO na homepage (pod sekcí Kurzy / předměty).
export function ProHomeStrip({ locale }: { locale: Locale }) {
  const t = getProTabsText(locale);
  return (
    <div className="reveal mt-10 border-t border-[var(--edge)] pt-6">
      <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.homeTitle}
      </h3>
      <p className="mb-4 mt-1 text-sm text-[var(--muted)]">{t.homeHint}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {PRO_TABS.map((tab) => (
          <Link key={tab} href={`/${locale}${proTabPath(tab)}`} className="card flex items-center justify-between p-4 font-bold hover:underline">
            {t.tabs[tab]}
            <span aria-hidden className="text-[var(--accent-green)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
