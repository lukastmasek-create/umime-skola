"use client";

import { useEffect, useState } from "react";
import { getGameMode, setGameMode, type GameMode } from "@/lib/scene3d";
import { useRouter, usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale-cookie";
import { SchoolPicker } from "@/components/SchoolPicker";

type Theme = "light" | "dark" | "system";
type FontStyle = "playful" | "classic";
type FontSize = "small" | "medium" | "large";

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

const GAME_TEXT: Record<Locale, { title: string; hint: string; mode3d: string; mode2d: string }> = {
  cs: { title: "Hry", hint: "Vzhled her u kurzů. 3D se nemusí hodit pro starší telefony.", mode3d: "3D (výchozí)", mode2d: "Klasické 2D" },
  en: { title: "Games", hint: "How the course games look. 3D may be slow on older phones.", mode3d: "3D (default)", mode2d: "Classic 2D" },
  de: { title: "Spiele", hint: "Aussehen der Kursspiele. 3D kann auf älteren Handys langsam sein.", mode3d: "3D (Standard)", mode2d: "Klassisch 2D" },
  ru: { title: "Игры", hint: "Вид игр в курсах. 3D может тормозить на старых телефонах.", mode3d: "3D (по умолчанию)", mode2d: "Классика 2D" },
};

export function SettingsForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState<Theme>("system");
  const [font, setFont] = useState<FontStyle>("playful");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [saved, setSaved] = useState(false);
  const [gameMode, setGameModeState] = useState<GameMode>("3d");

  useEffect(() => {
    // Hydrating from localStorage after mount — server has no access to it,
    // so this can only happen once the client takes over.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
      const storedFont = localStorage.getItem("font");
      if (storedFont === "classic") setFont("classic");
      setGameModeState(getGameMode());
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
    const rest = pathname?.replace(/^\/(cs|en|de|ru)/, "") || "";
    router.push(`/${next}${rest}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.settings.appearance}
        </h2>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-[var(--muted)]">{dict.settings.theme}</p>
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

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-[var(--muted)]">{dict.settings.fontStyle}</p>
          <div className="flex flex-wrap gap-2">
            <OptionButton active={font === "playful"} onClick={() => applyFont("playful")}>
              {dict.settings.fontPlayful}
            </OptionButton>
            <OptionButton active={font === "classic"} onClick={() => applyFont("classic")}>
              {dict.settings.fontClassic}
            </OptionButton>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[var(--muted)]">{dict.settings.fontSize}</p>
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

      <section className="card p-6">
        <h2 className="mb-1 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {GAME_TEXT[locale].title}
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">{GAME_TEXT[locale].hint}</p>
        <div className="flex flex-wrap gap-2">
          {(["3d", "2d"] as const).map((m) => (
            <OptionButton
              key={m}
              active={gameMode === m}
              onClick={() => {
                setGameModeState(m);
                setGameMode(m);
                flashSaved();
              }}
            >
              {m === "3d" ? GAME_TEXT[locale].mode3d : GAME_TEXT[locale].mode2d}
            </OptionButton>
          ))}
        </div>
      </section>

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

      <SchoolPicker locale={locale} />

      <p
        className={`text-sm font-medium text-[var(--brand-600)] transition-opacity ${
          saved ? "opacity-100" : "opacity-0"
        }`}
      >
        {dict.settings.saved}
      </p>
    </div>
  );
}
