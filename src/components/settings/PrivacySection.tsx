"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getSettingsLookText } from "@/i18n/settings-look";
import { SettingRow } from "./ui-kit";

const LOCAL_KEYS = ["theme", "font", "fontSize", "accent", "motion", "contrast", "links", "spacing"];

// Soukromí: odkazy na zásady a smazání místních nastavení (ukládají se jen v prohlížeči).
export function PrivacySection({ locale }: { locale: Locale }) {
  const t = getSettingsLookText(locale);

  function reset() {
    try {
      LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignorovat
    }
    window.location.reload();
  }

  const link = "rounded-full bg-[var(--surface-muted)] px-4 py-2 text-sm font-medium hover:bg-[var(--brand-50)]";
  return (
    <div className="flex flex-col gap-4">
      <SettingRow title={t.privacy} hint={t.privacyHint}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/ochrana-soukromi`} className={link}>{t.privacyPolicy}</Link>
          <Link href={`/${locale}/podminky`} className={link}>{t.terms}</Link>
        </div>
      </SettingRow>
      <SettingRow title={t.resetTitle} hint={t.resetHint}>
        <button type="button" onClick={reset} className="btn-bouncy bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold">
          {t.resetBtn}
        </button>
      </SettingRow>
    </div>
  );
}
