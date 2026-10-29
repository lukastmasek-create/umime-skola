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
  zoomIn: string;
  zoomOut: string;
  resetView: string;
};

const cs: GlobeText = {
  hint: "Roztoč globus a klikni na předmět, nebo si ho vyber ze seznamu.",
  label: "Globus předmětů",
  places: {
    cestina: "Česko",
    literatura: "Irsko",
    anglictina: "Velká Británie",
    nemcina: "Německo",
    rustina: "Rusko",
    matematika: "Řecko",
    dejepis: "Itálie",
    zemepis: "Nepál",
    prirodopis: "Brazílie",
    fyzika: "USA",
    chemie: "Čína",
    obcanka: "Indie",
    hudebka: "Austrálie",
    francouzstina: "Francie",
  },
  openCourses: "Všechny kurzy",
  continueCourse: "Pokračovat: {title}",
  startCourse: "Začít: {title}",
  progress: "Hotovo {done} z {total} kurzů",
  noCourses: "Kurzy tu zatím nejsou.",
  review: "{n} k opakování",
  guest: "Po přihlášení uvidíš svůj postup.",
  drag: "Táhni a otáčej, kolečko nebo ± přiblíží",
  zoomIn: "Přiblížit",
  zoomOut: "Oddálit",
  resetView: "Obnovit pohled (dvojklik)",
};

const en: GlobeText = {
  hint: "Spin the globe and click a subject, or pick one from the list.",
  label: "Subject globe",
  places: {
    cestina: "Czechia",
    literatura: "Ireland",
    anglictina: "United Kingdom",
    nemcina: "Germany",
    rustina: "Russia",
    matematika: "Greece",
    dejepis: "Italy",
    zemepis: "Nepal",
    prirodopis: "Brazil",
    fyzika: "USA",
    chemie: "China",
    obcanka: "India",
    hudebka: "Australia",
    francouzstina: "France",
  },
  openCourses: "All courses",
  continueCourse: "Continue: {title}",
  startCourse: "Start: {title}",
  progress: "{done} of {total} courses done",
  noCourses: "No courses here yet.",
  review: "{n} to review",
  guest: "Sign in to see your progress.",
  drag: "Drag to rotate, wheel or ± to zoom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetView: "Reset view (double click)",
};

const de: GlobeText = {
  hint: "Dreh den Globus und klicke ein Fach an, oder wähle eines aus der Liste.",
  label: "Fächer-Globus",
  places: {
    cestina: "Tschechien",
    literatura: "Irland",
    anglictina: "Vereinigtes Königreich",
    nemcina: "Deutschland",
    rustina: "Russland",
    matematika: "Griechenland",
    dejepis: "Italien",
    zemepis: "Nepal",
    prirodopis: "Brasilien",
    fyzika: "USA",
    chemie: "China",
    obcanka: "Indien",
    hudebka: "Australien",
    francouzstina: "Frankreich",
  },
  openCourses: "Alle Kurse",
  continueCourse: "Weiter: {title}",
  startCourse: "Starten: {title}",
  progress: "{done} von {total} Kursen geschafft",
  noCourses: "Hier gibt es noch keine Kurse.",
  review: "{n} zu wiederholen",
  guest: "Melde dich an, um deinen Fortschritt zu sehen.",
  drag: "Ziehen zum Drehen, Rad oder ± zum Zoomen",
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  resetView: "Ansicht zurücksetzen (Doppelklick)",
};

const ru: GlobeText = {
  hint: "Покрути глобус и нажми на предмет или выбери его из списка.",
  label: "Глобус предметов",
  places: {
    cestina: "Чехия",
    literatura: "Ирландия",
    anglictina: "Великобритания",
    nemcina: "Германия",
    rustina: "Россия",
    matematika: "Греция",
    dejepis: "Италия",
    zemepis: "Непал",
    prirodopis: "Бразилия",
    fyzika: "США",
    chemie: "Китай",
    obcanka: "Индия",
    hudebka: "Австралия",
    francouzstina: "Франция",
  },
  openCourses: "Все курсы",
  continueCourse: "Продолжить: {title}",
  startCourse: "Начать: {title}",
  progress: "Пройдено курсов: {done} из {total}",
  noCourses: "Курсов пока нет.",
  review: "{n} на повторение",
  guest: "Войди, чтобы видеть свой прогресс.",
  drag: "Тяни, чтобы вращать, колесо или ± — масштаб",
  zoomIn: "Приблизить",
  zoomOut: "Отдалить",
  resetView: "Сбросить вид (двойной щелчок)",
};

const texts: Record<Locale, GlobeText> = { cs, en, de, ru };

export function getGlobeText(locale: Locale): GlobeText {
  return texts[locale];
}
