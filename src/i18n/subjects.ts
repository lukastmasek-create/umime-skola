import type { Locale } from "./config";
import type { SubjectValue } from "@/lib/taxonomy";

type SubjectText = {
  all: string;
  other: string;
  labels: Record<SubjectValue, string>;
};

const texts: Record<Locale, SubjectText> = {
  cs: {
    all: "Všechny předměty",
    other: "Ostatní",
    labels: {
      CESTINA: "Čeština",
      LITERATURA: "Literatura",
      ANGLICTINA: "Angličtina",
      NEMCINA: "Němčina",
      RUSTINA: "Ruština",
      MATEMATIKA: "Matematika",
      DEJEPIS: "Dějepis",
      ZEMEPIS: "Zeměpis",
      PRIRODOPIS: "Přírodopis",
    },
  },
  en: {
    all: "All subjects",
    other: "Other",
    labels: {
      CESTINA: "Czech",
      LITERATURA: "Literature",
      ANGLICTINA: "English",
      NEMCINA: "German",
      RUSTINA: "Russian",
      MATEMATIKA: "Maths",
      DEJEPIS: "History",
      ZEMEPIS: "Geography",
      PRIRODOPIS: "Biology",
    },
  },
  de: {
    all: "Alle Fächer",
    other: "Sonstige",
    labels: {
      CESTINA: "Tschechisch",
      LITERATURA: "Literatur",
      ANGLICTINA: "Englisch",
      NEMCINA: "Deutsch",
      RUSTINA: "Russisch",
      MATEMATIKA: "Mathematik",
      DEJEPIS: "Geschichte",
      ZEMEPIS: "Geografie",
      PRIRODOPIS: "Biologie",
    },
  },
  ru: {
    all: "Все предметы",
    other: "Другое",
    labels: {
      CESTINA: "Чешский",
      LITERATURA: "Литература",
      ANGLICTINA: "Английский",
      NEMCINA: "Немецкий",
      RUSTINA: "Русский",
      MATEMATIKA: "Математика",
      DEJEPIS: "История",
      ZEMEPIS: "География",
      PRIRODOPIS: "Биология",
    },
  },
};

export function getSubjectText(locale: Locale): SubjectText {
  return texts[locale];
}
