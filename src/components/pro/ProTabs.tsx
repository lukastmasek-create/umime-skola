import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProTabsText } from "@/i18n/pro-tabs";
import { PRO_TABS, proTabPath, type ProTab } from "@/lib/pro-tools/features";

// Přepínač záložek Pro / Rodina / Škola (každá záložka je samostatná stránka).
export function ProTabs({ locale, active }: { locale: Locale; active: ProTab }) {
  const t = getProTabsText(locale);
  return (
    <nav aria-label="UčímePRO" className="mb-6 flex flex-wrap gap-2">
      {PRO_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={`/${locale}${proTabPath(tab)}`}
            aria-current={isActive ? "page" : undefined}
            className={`btn-bouncy btn-lg ${isActive ? "bg-[var(--brand-500)] font-bold text-white" : "btn-secondary"}`}
          >
            {t.tabs[tab]}
          </Link>
        );
      })}
    </nav>
  );
}
