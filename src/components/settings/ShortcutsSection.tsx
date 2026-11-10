import type { Locale } from "@/i18n/config";
import { getSettingsLookText } from "@/i18n/settings-look";
import { SettingRow } from "./ui-kit";

// Přehled zkratek z GlobalShortcuts (G + písmeno).
export function ShortcutsSection({ locale }: { locale: Locale }) {
  const t = getSettingsLookText(locale);
  const rows: [string, string][] = [
    ["H", t.scHome], ["K", t.scCourses], ["D", t.scQuiz], ["Z", t.scBoards], ["O", t.scShop], ["N", t.scSettings],
  ];
  return (
    <SettingRow title={t.shortcuts} hint={t.shortcutsHint}>
      <p className="mb-3 text-sm text-[var(--muted)]">{t.shortcutsHow}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map(([k, label]) => (
          <li key={k} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-medium">
            {label}
            <span className="flex items-center gap-1.5">
              <kbd className="rounded-md border border-[var(--field-border)] bg-[var(--surface)] px-2 py-0.5 text-xs font-bold">G</kbd>
              <kbd className="rounded-md border border-[var(--field-border)] bg-[var(--surface)] px-2 py-0.5 text-xs font-bold">{k}</kbd>
            </span>
          </li>
        ))}
      </ul>
    </SettingRow>
  );
}
