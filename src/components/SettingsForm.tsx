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
import { ParentalSection } from "@/components/settings/ParentalSection";

type Theme = "light" | "dark" | "system";
type FontStyle = "playful" | "classic";
type FontSize = "small" | "medium" | "large";
type Section = "graphics" | "school" | "account" | "parental";
const SECTIONS: Section[] = ["graphics", "school", "account", "parental"];
const SECTION_ICON: Record<Section, string> = { graphics: "🎨", school: "🏫", account: "👤", parental: "🔒" };

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
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<Section>("graphics");
  const sectionLabels = getSettingsExtraText(locale).sections;

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

  function switchLanguage(next: Locale) {
    setLocaleCookie(next);
    const rest = pathname?.replace(/^\/(cs|en|de|ru|uk|ja|es|fr)/, "") || "";
    router.push(`/${next}${rest}`);
  }

  return (
    <div className="overflow-hidden rounded-[20px] border-2 border-[var(--edge)] bg-[var(--surface)]">
    <div className="grid md:grid-cols-[14rem_minmax(0,1fr)]">
      <nav className="flex flex-wrap gap-1.5 border-b-2 border-[var(--edge)] bg-[var(--surface-muted)] p-3 md:flex-col md:border-b-0 md:border-r-2" aria-label={dict.settings.title}>
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            aria-current={section === s ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
              section === s ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            <span aria-hidden>{SECTION_ICON[s]}</span>
            {sectionLabels[s]}
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-col gap-8 p-5 sm:p-6">
      {section === "graphics" && (
        <>
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {dict.settings.appearance}
            </h2>

            <div className="flex flex-col gap-2 border-b border-[var(--border-soft)] py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold">{dict.settings.theme}</p>
              <div className="flex flex-wrap gap-2">
                <OptionButton active={theme === "light"} onClick={() => applyTheme("light")}>
                  {dict.settings.themeLight}
                </OptionButton>
                <OptionButton active={theme === "dark"} onClick={() => applyTheme("dark")}>
                  {dict.settings.themeDark}
                </OptionButton>
                <OptionButton active={theme === "system"} onClick={() => applyTheme("system")}>
                  {dict.settings.themeSystem}
                </OptionButton>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-[var(--border-soft)] py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold">{dict.settings.fontStyle}</p>
              <div className="flex flex-wrap gap-2">
                <OptionButton active={font === "playful"} onClick={() => applyFont("playful")}>
                  {dict.settings.fontPlayful}
                </OptionButton>
                <OptionButton active={font === "classic"} onClick={() => applyFont("classic")}>
                  {dict.settings.fontClassic}
                </OptionButton>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold">{dict.settings.fontSize}</p>
              <div className="flex flex-wrap gap-2">
                <OptionButton active={fontSize === "small"} onClick={() => applyFontSize("small")}>
                  {dict.settings.fontSizeSmall}
                </OptionButton>
                <OptionButton active={fontSize === "medium"} onClick={() => applyFontSize("medium")}>
                  {dict.settings.fontSizeMedium}
                </OptionButton>
                <OptionButton active={fontSize === "large"} onClick={() => applyFontSize("large")}>
                  {dict.settings.fontSizeLarge}
                </OptionButton>
              </div>
            </div>
          </section>

          <MotionSetting locale={locale} />
        </>
      )}

      {section === "school" && <SchoolPicker locale={locale} />}

      {section === "account" && (
        <>
          <AccountSection locale={locale} />

          <section className="card p-6">
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
    </div>
  );
}
