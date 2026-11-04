import { withFallbacks } from "./config";
import type { Locale } from "./config";
import type { CategorySlug } from "@/lib/taxonomy";

const allGrades: Record<Locale, string> = {
  ...withFallbacks({
    cs: "Všechny třídy",
    en: "All grades",
    de: "Alle Klassen",
    ru: "Все классы",
  }),
  uk: "Усі класи",
  ja: "全学年",
  es: "Todos los cursos",
  fr: "Toutes les classes",
};

export function getAllGradesLabel(locale: Locale): string {
  return allGrades[locale];
}

export function gradeLabel(locale: Locale, category: CategorySlug, n: number): string {
  const secondary = category === "stredni";
  switch (locale) {
    case "cs":
      return secondary ? `${n}. ročník` : `${n}. třída`;
    case "en":
      return secondary ? `Year ${n}` : `Grade ${n}`;
    case "de":
      return secondary ? `${n}. Jahrgang` : `${n}. Klasse`;
    case "ru":
      return secondary ? `${n} курс` : `${n} класс`;
    case "uk":
      return secondary ? `${n} курс` : `${n} клас`;
    case "ja":
      return `${n}年生`;
    case "es":
      return `${n}.º curso`;
    case "fr":
      return `${n}e année`;
  }
}
