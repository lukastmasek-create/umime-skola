import type { Locale } from "./config";
import type { SubjectValue } from "@/lib/taxonomy";

type SubjectText = {
  all: string;
  other: string;
  worldNote: string;
  labels: Record<SubjectValue, string>;
};

const texts: Record<Locale, SubjectText> = {
  cs: {
    all: "Všechny předměty",
    other: "Ostatní",
    worldNote: "Klikni na ostrov a uvidíš kurzy předmětu",
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
      FYZIKA: "Fyzika",
      CHEMIE: "Chemie",
      OBCANKA: "Občanská výchova",
      HUDEBKA: "Hudební výchova",
      FRANCOUZSTINA: "Francouzština",
    },
  },
  en: {
    all: "All subjects",
    other: "Other",
    worldNote: "Click an island to see the subject courses",
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
      FYZIKA: "Physics",
      CHEMIE: "Chemistry",
      OBCANKA: "Civics",
      HUDEBKA: "Music",
      FRANCOUZSTINA: "French",
    },
  },
  de: {
    all: "Alle Fächer",
    other: "Sonstige",
    worldNote: "Klicke auf eine Insel und sieh dir die Kurse des Fachs an",
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
      FYZIKA: "Physik",
      CHEMIE: "Chemie",
      OBCANKA: "Gesellschaftskunde",
      HUDEBKA: "Musik",
      FRANCOUZSTINA: "Französisch",
    },
  },
  ru: {
    all: "Все предметы",
    other: "Другое",
    worldNote: "Нажми на остров, чтобы увидеть курсы предмета",
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
      FYZIKA: "Физика",
      CHEMIE: "Химия",
      OBCANKA: "Обществознание",
      HUDEBKA: "Музыка",
      FRANCOUZSTINA: "Французский",
    },
  },
};

export function getSubjectText(locale: Locale): SubjectText {
  return texts[locale];
}
