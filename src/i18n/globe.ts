import type { Locale } from "./config";

export type GlobeText = {
  hint: string;
  label: string;
  /** Země (nebo místo) spojené s předmětem na globu. */
  places: Record<string, string>;
  openCourses: string;
  continueCourse: string;
  startCourse: string;
  progress: string; // {done} {total}
  noCourses: string;
  review: string; // {n}
  guest: string;
  drag: string;
};

const cs: GlobeText = {
  hint: "Roztoč globus a klikni na předmět, nebo si ho vyber ze seznamu.",
  label: "Globus předmětů",
  places: {
    cestina: "Česko",
    literatura: "Francie",
    anglictina: "Velká Británie",
    nemcina: "Německo",
    rustina: "Rusko",
    matematika: "Řecko",
    dejepis: "Itálie",
    zemepis: "Nepál",
    prirodopis: "Brazílie",
  },
  openCourses: "Všechny kurzy",
  continueCourse: "Pokračovat: {title}",
  startCourse: "Začít: {title}",
  progress: "Hotovo {done} z {total} kurzů",
  noCourses: "Kurzy tu zatím nejsou.",
  review: "{n} k opakování",
  guest: "Po přihlášení uvidíš svůj postup.",
  drag: "Táhni a otáčej",
};

const en: GlobeText = {
  hint: "Spin the globe and click a subject, or pick one from the list.",
  label: "Subject globe",
  places: {
    cestina: "Czechia",
    literatura: "France",
    anglictina: "United Kingdom",
    nemcina: "Germany",
    rustina: "Russia",
    matematika: "Greece",
    dejepis: "Italy",
    zemepis: "Nepal",
    prirodopis: "Brazil",
  },
  openCourses: "All courses",
  continueCourse: "Continue: {title}",
  startCourse: "Start: {title}",
  progress: "{done} of {total} courses done",
  noCourses: "No courses here yet.",
  review: "{n} to review",
  guest: "Sign in to see your progress.",
  drag: "Drag to rotate",
};

const de: GlobeText = {
  hint: "Dreh den Globus und klicke ein Fach an, oder wähle eines aus der Liste.",
  label: "Fächer-Globus",
  places: {
    cestina: "Tschechien",
    literatura: "Frankreich",
    anglictina: "Vereinigtes Königreich",
    nemcina: "Deutschland",
    rustina: "Russland",
    matematika: "Griechenland",
    dejepis: "Italien",
    zemepis: "Nepal",
    prirodopis: "Brasilien",
  },
  openCourses: "Alle Kurse",
  continueCourse: "Weiter: {title}",
  startCourse: "Starten: {title}",
  progress: "{done} von {total} Kursen geschafft",
  noCourses: "Hier gibt es noch keine Kurse.",
  review: "{n} zu wiederholen",
  guest: "Melde dich an, um deinen Fortschritt zu sehen.",
  drag: "Ziehen zum Drehen",
};

const ru: GlobeText = {
  hint: "Покрути глобус и нажми на предмет или выбери его из списка.",
  label: "Глобус предметов",
  places: {
    cestina: "Чехия",
    literatura: "Франция",
    anglictina: "Великобритания",
    nemcina: "Германия",
    rustina: "Россия",
    matematika: "Греция",
    dejepis: "Италия",
    zemepis: "Непал",
    prirodopis: "Бразилия",
  },
  openCourses: "Все курсы",
  continueCourse: "Продолжить: {title}",
  startCourse: "Начать: {title}",
  progress: "Пройдено курсов: {done} из {total}",
  noCourses: "Курсов пока нет.",
  review: "{n} на повторение",
  guest: "Войди, чтобы видеть свой прогресс.",
  drag: "Тяни, чтобы вращать",
};

const texts: Record<Locale, GlobeText> = { cs, en, de, ru };

export function getGlobeText(locale: Locale): GlobeText {
  return texts[locale];
}
