import type { Locale } from "@/i18n/config";
import { getProTabsText } from "@/i18n/pro-tabs";
import { getProToolsText } from "@/i18n/pro-tools";
import { featuresForTab, type ProTab } from "@/lib/pro-tools/features";
import { SpaceShell } from "@/components/SpaceShell";
import { ProTabs } from "@/components/pro/ProTabs";
import { ProToolPile } from "@/components/pro/ProToolPile";

// Obsah samostatné stránky záložky Rodina nebo Škola.
export function ProTabView({ locale, tab }: { locale: Locale; tab: Exclude<ProTab, "pro"> }) {
  const t = getProTabsText(locale);
  const tools = getProToolsText(locale);
  return (
    <SpaceShell title={t.tabs[tab]} subtitle={t.tabText[tab]} wide>
      <ProTabs locale={locale} active={tab} />
      <ProToolPile locale={locale} slugs={featuresForTab(tab)} />
      <p className="mt-6 text-sm text-[var(--muted)]">{tools.toolsHint}</p>
    </SpaceShell>
  );
}
