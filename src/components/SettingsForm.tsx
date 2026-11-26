"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale-cookie";
import { SchoolPicker } from "@/components/SchoolPicker";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import { MotionSetting } from "@/components/settings/MotionSetting";
import { AccountSection } from "@/components/settings/AccountSection";
import { AccessibilitySection } from "@/components/settings/AccessibilitySection";
import { ShortcutsSection } from "@/components/settings/ShortcutsSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { PlanSection } from "@/components/settings/PlanSection";
import { PrivacySection } from "@/components/settings/PrivacySection";
import { ParentalSection } from "@/components/settings/ParentalSection";
import { PreviewCard, SegmentedPills, SettingRow, ThemeMini } from "@/components/settings/ui-kit";
import { getSettingsLookText } from "@/i18n/settings-look";
import { ACCENT_PRESETS, DEFAULT_ACCENT, applyAccent, normalizeHex } from "@/lib/accent";

type Theme = "light" | "dark" | "system";
type FontStyle = "playful" | "classic";
type FontSize = "small" | "medium" | "large";
type Section = "graphics" | "a11y" | "shortcuts" | "notify" | "plan" | "privacy" | "school" | "account" | "parental";
const SECTIONS: Section[] = ["graphics", "a11y", "shortcuts", "notify", "plan", "privacy", "school", "account", "parental"];

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-bouncy rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--brand-500)] text-white"
          : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"
      }`}
    >
      {children}
    </button>
  );
}

export function SettingsForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState<Theme>("system");
  const [font, setFont] = useState<FontStyle>("playful");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [accent, setAccent] = useState<string | null>(null);
  const [accentInput, setAccentInput] = useState(DEFAULT_ACCENT.slice(1));
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<Section>("graphics");
  const look = getSettingsLookText(locale);
  const sectionLabels = { ...getSettingsExtraText(locale).sections, a11y: look.a11y, shortcuts: look.shortcuts, notify: look.notify, plan: look.plan, privacy: look.privacy };

  useEffect(() => {
    // Hydrating from localStorage after mount — server has no access to it,
    // so this can only happen once the client takes over.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
      const storedFont = localStorage.getItem("font");
      if (storedFont === "classic") setFont("classic");
      const storedSize = localStorage.getItem("fontSize");
      if (storedSize === "small" || storedSize === "large") setFontSize(storedSize);
      const storedAccent = localStorage.getItem("accent");
      if (storedAccent && /^#[0-9a-f]{6}$/.test(storedAccent)) {
        setAccent(storedAccent);
        setAccentInput(storedAccent.slice(1));
      }
    } catch {
      // localStorage may be unavailable (private mode) — defaults stay.
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function flashSaved() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  function applyTheme(next: Theme) {
    setTheme(next);
    try {
      if (next === "system") {
        localStorage.removeItem("theme");
        document.documentElement.removeAttribute("data-theme");
      } else {
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
      }
    } catch {
      // ignore
    }
    flashSaved();
  }

  function applyFont(next: FontStyle) {
    setFont(next);
    try {
      if (next === "playful") {
        localStorage.removeItem("font");
        document.documentElement.removeAttribute("data-font");
      } else {
        localStorage.setItem("font", next);
        document.documentElement.setAttribute("data-font", next);
      }
    } catch {
      // ignore
    }
    flashSaved();
  }

  function applyFontSize(next: FontSize) {
    setFontSize(next);
    try {
      if (next === "medium") {
        localStorage.removeItem("fontSize");
        document.documentElement.removeAttribute("data-font-size");
      } else {
        localStorage.setItem("fontSize", next);
        document.documentElement.setAttribute("data-font-size", next);
      }
    } catch {
      // ignore
    }
    flashSaved();
  }

  function applyAccentColor(hex: string | null) {
    setAccent(hex);
    if (hex) setAccentInput(hex.slice(1));
    try {
      if (hex) localStorage.setItem("accent", hex);
      else localStorage.removeItem("accent");
    } catch {
      // ignore
    }
    applyAccent(hex);
    flashSaved();
  }

  function switchLanguage(next: Locale) {
    setLocaleCookie(next);
    const rest = pathname?.replace(/^\/(cs|en|de|ru|uk|ja|es|fr)/, "") || "";
    router.push(`/${next}${rest}`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-8">
      <nav className="flex flex-wrap gap-1.5 md:flex-col md:self-start md:gap-2" aria-label={dict.settings.title}>
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            aria-current={section === s ? "page" : undefined}
            className={`btn-bouncy flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-colors ${
              section === s
                ? "border-[var(--accent-500)] bg-[var(--brand-50)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted)] hover:border-[var(--border-soft)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {sectionLabels[s]}
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-col gap-4">
      {section === "graphics" && (
        <div className="flex flex-col gap-4">
          <SettingRow title={look.themes} hint={look.themesHint}>
            <div role="radiogroup" aria-label={look.themes} className="grid gap-3 sm:grid-cols-3">
              <PreviewCard active={theme === "light"} onClick={() => applyTheme("light")} label={dict.settings.themeLight}>
                <ThemeMini mode="light" />
              </PreviewCard>
              <PreviewCard active={theme === "dark"} onClick={() => applyTheme("dark")} label={dict.settings.themeDark}>
                <ThemeMini mode="dark" />
              </PreviewCard>
              <PreviewCard active={theme === "system"} onClick={() => applyTheme("system")} label={dict.settings.themeSystem}>
                <ThemeMini mode="split" />
              </PreviewCard>
            </div>
          </SettingRow>

          <SettingRow
            title={look.accent}
            hint={look.accentHint}
            control={
              <div className="flex items-center gap-2.5">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    aria-pressed={accent === c}
                    onClick={() => applyAccentColor(c)}
                    className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${accent === c ? "ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--surface)]" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            }
          >
            <div className="flex items-center justify-end gap-2.5">
              <span className="text-xs text-[var(--faint)]">{look.customColor}</span>
              <label className="flex items-center gap-1 rounded-lg border border-[var(--field-border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium">
                #
                <input
                  value={accentInput}
                  maxLength={6}
                  inputMode="text"
                  aria-label={look.customColor}
                  onChange={(e) => {
                    setAccentInput(e.target.value.replace(/[^0-9a-fA-F]/g, ""));
                    const hex = normalizeHex(e.target.value);
                    if (hex && e.target.value.replace(/^#/, "").length === 6) applyAccentColor(hex);
                  }}
                  className="w-16 bg-transparent uppercase outline-none"
                />
              </label>
              <button
                type="button"
                aria-label={look.customColor}
                onClick={() => applyAccentColor(normalizeHex(accentInput) ?? DEFAULT_ACCENT)}
                className="h-6 w-6 rounded-full ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--surface)]"
                style={{ background: normalizeHex(accentInput) ?? DEFAULT_ACCENT }}
              />
              {accent && (
                <button type="button" onClick={() => applyAccentColor(null)} className="text-xs font-medium text-[var(--brand-600)] underline">
                  ✕
                </button>
              )}
            </div>
          </SettingRow>

          <MotionSetting locale={locale} />

          <SettingRow title={dict.settings.fontStyle} hint={look.fontStyleHint}>
            <SegmentedPills
              value={font}
              onChange={applyFont}
              options={[
                { id: "playful", label: dict.settings.fontPlayful },
                { id: "classic", label: dict.settings.fontClassic },
              ]}
            />
          </SettingRow>

          <SettingRow title={dict.settings.fontSize} hint={look.fontSizeHint}>
            <SegmentedPills
              value={fontSize}
              onChange={applyFontSize}
              options={[
                { id: "small", label: dict.settings.fontSizeSmall },
                { id: "medium", label: dict.settings.fontSizeMedium },
                { id: "large", label: dict.settings.fontSizeLarge },
              ]}
            />
          </SettingRow>
        </div>
      )}

      {section === "a11y" && <AccessibilitySection locale={locale} onChange={flashSaved} />}

      {section === "shortcuts" && <ShortcutsSection locale={locale} />}

      {section === "notify" && <NotificationsSection locale={locale} onSaved={flashSaved} />}

      {section === "plan" && <PlanSection locale={locale} />}

      {section === "privacy" && <PrivacySection locale={locale} />}

      {section === "school" && <SchoolPicker locale={locale} />}

      {section === "account" && (
        <>
          <AccountSection locale={locale} />

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {dict.settings.language}
            </h2>
            <div className="flex flex-wrap gap-2">
              {locales.map((l) => (
                <OptionButton key={l} active={l === locale} onClick={() => switchLanguage(l)}>
                  {localeFlags[l]} {localeNames[l]}
                </OptionButton>
              ))}
            </div>
          </section>
        </>
      )}

      {section === "parental" && <ParentalSection locale={locale} />}

      <p
        role="status"
        className={`text-sm font-medium text-[var(--brand-600)] transition-opacity ${
          saved ? "opacity-100" : "opacity-0"
        }`}
      >
        {dict.settings.saved}
      </p>
      </div>
    </div>
  );
}
