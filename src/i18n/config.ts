export const locales = ["cs", "en", "de", "ru", "uk", "ja", "es", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "cs";

export const localeNames: Record<Locale, string> = {
  cs: "Čeština",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  uk: "Українська",
  ja: "日本語",
  es: "Español",
  fr: "Français",
};

export const localeFlags: Record<Locale, string> = {
  cs: "🇨🇿",
  en: "🇬🇧",
  de: "🇩🇪",
  ru: "🇷🇺",
  uk: "🇺🇦",
  ja: "🇯🇵",
  es: "🇪🇸",
  fr: "🇫🇷",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Jazyky, pro které zatím nejsou přeložené všechny texty: chybějící klíče se berou z angličtiny.
export const fallbackLocale: Locale = "en";

// Doplní chybějící jazyky z angličtiny. Používá se u překladových tabulek, které mají cs/en/de/ru.
type CoreLocale = "cs" | "en" | "de" | "ru";
export function withFallbacks<T>(t: Record<CoreLocale, T>): Record<Locale, T> {
  return { ...t, uk: t.en, ja: t.en, es: t.en, fr: t.en };
}
