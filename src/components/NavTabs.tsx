"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCommunityText } from "@/i18n/community";
import { getIdleText } from "@/i18n/idle";
import { getEscapeText } from "@/i18n/escape";
import type { Locale } from "@/i18n/config";

export function NavTabs({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const community = getCommunityText(locale);

  const tabs = [
    ...CATEGORIES.map((cat) => ({
      key: cat.slug,
      href: `/${locale}/kurzy/${cat.slug}`,
      label: dict.categories[cat.slug].label,
    })),
    { key: "unikovky", href: `/${locale}/unikovky`, label: getEscapeText(locale).nav },
    { key: "stale-hry", href: `/${locale}/stale-hry`, label: getIdleText(locale).nav },
    {
      key: "uzivatelsky-obchod",
      href: `/${locale}/uzivatelsky-obchod`,
      label: community.navMarketplace,
    },
    { key: "zebricky", href: `/${locale}/zebricky`, label: community.navLeaderboards },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {tabs.map((tab, i) => {
        const isActive = pathname?.startsWith(tab.href);
        return (
          <span key={tab.key} className="flex items-center gap-1.5">
            {i === CATEGORIES.length && (
              <span aria-hidden className="mx-1 h-5 w-0.5 rounded bg-[var(--border-soft)]" />
            )}
            <Link
              href={tab.href}
              className={`whitespace-nowrap rounded-lg border-2 px-3.5 py-1.5 text-sm font-semibold ${
                isActive
                  ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--edge)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
