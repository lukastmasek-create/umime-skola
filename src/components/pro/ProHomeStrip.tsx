import Link from "next/link";
import { School, User, Users } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getProTabsText } from "@/i18n/pro-tabs";
import { PRO_TABS, proTabPath, type ProTab } from "@/lib/pro-tools/features";

const TAB_ICON = { pro: User, rodina: Users, skola: School } as const;
const TAB_COLOR: Record<ProTab, string> = { pro: "#ffc933", rodina: "#ff8a6b", skola: "#8fd0ff" };

// Odkazy na záložky UčímePRO na homepage (pod sekcí Kurzy / předměty).
export function ProHomeStrip({ locale }: { locale: Locale }) {
  const t = getProTabsText(locale);
  return (
    <div className="reveal pro-strip mt-10 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold sm:text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            {t.homeTitle}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.homeHint}</p>
        </div>
        <Link href={`/${locale}/platba`} className="btn-bouncy btn-primary inline-flex px-5 py-2.5 text-sm font-bold text-white">
          {locale === "cs" ? "Poskládat PRO · demo platby →" : "Build your PRO · payment demo →"}
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {PRO_TABS.map((tab, i) => {
          const TabIcon = TAB_ICON[tab];
          return (
            <Link
              key={tab}
              href={`/${locale}${proTabPath(tab)}`}
              className="pro-tile reveal reveal-stagger"
              style={{ ["--ac" as string]: TAB_COLOR[tab], ["--i" as string]: i }}
            >
              <span className="pro-tile-ic" aria-hidden>
                <TabIcon size={20} strokeWidth={2.4} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{t.tabs[tab]}</span>
                <span className="pro-tile-sub">{tab === "pro" ? t.plansLink : t.tabText[tab]}</span>
              </span>
              <span className="pro-tile-go" aria-hidden>→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
