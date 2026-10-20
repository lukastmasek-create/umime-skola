import type { Locale } from "./config";
import type { CategorySlug } from "@/lib/taxonomy";

const allGrades: Record<Locale, string> = {
  cs: "Všechny třídy",
  en: "All grades",
  de: "Alle Klassen",
  ru: "Все классы",
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
  }
}
