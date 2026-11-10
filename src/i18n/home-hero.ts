import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Popisky plovoucích karet v hero sekci úvodní stránky (jen ukázková data, nic z toho není živé).
export type HomeHeroText = {
  progressTitle: string;
  level: string;
  streak: string; // šablona s {n}
  streakNone: string;
  members: string; // šablona s {n}
  openTasks: string; // šablona s {n}
  noTasks: string;
  student: string;
  safeTitle: string;
  safeText: string;
  subjectsTitle: string;
  games: { farm: string; town: string; escape: string; pets: string };
  flowStart: string;
  classTitle: string;
  teacher: string;
  points: string;
};

const cs: HomeHeroText = {
  progressTitle: "Tvůj postup",
  level: "Úroveň 7",
  streak: "{n} dní v řadě",
  streakNone: "Začni sérii dnes",
  members: "{n} členů",
  openTasks: "{n} otevřených zadání",
  noTasks: "Vše splněno",
  student: "Žák",
  safeTitle: "Bez reklam",
  safeText: "Bezpečné pro děti",
  subjectsTitle: "Tvoje předměty",
  games: { farm: "Farma", town: "Město", escape: "Únikovka", pets: "Mazlíčci" },
  flowStart: "Učení hrou",
  classTitle: "Třída 5. A",
  teacher: "Učitel",
  points: "b.",
};

const en: HomeHeroText = {
  progressTitle: "Your progress",
  level: "Level 7",
  streak: "{n}-day streak",
  streakNone: "Start a streak today",
  members: "{n} members",
  openTasks: "{n} open tasks",
  noTasks: "All done",
  student: "Student",
  safeTitle: "No ads",
  safeText: "Safe for kids",
  subjectsTitle: "Your subjects",
  games: { farm: "Farm", town: "Town", escape: "Escape", pets: "Pets" },
  flowStart: "Learn by playing",
  classTitle: "Class 5A",
  teacher: "Teacher",
  points: "pts",
};

const de: HomeHeroText = {
  progressTitle: "Dein Fortschritt",
  level: "Level 7",
  streak: "{n} Tage in Folge",
  streakNone: "Starte heute eine Serie",
  members: "{n} Mitglieder",
  openTasks: "{n} offene Aufgaben",
  noTasks: "Alles erledigt",
  student: "Schüler/in",
  safeTitle: "Ohne Werbung",
  safeText: "Sicher für Kinder",
  subjectsTitle: "Deine Fächer",
  games: { farm: "Farm", town: "Stadt", escape: "Escape", pets: "Haustiere" },
  flowStart: "Spielend lernen",
  classTitle: "Klasse 5a",
  teacher: "Lehrkraft",
  points: "P.",
};

const ru: HomeHeroText = {
  progressTitle: "Твой прогресс",
  level: "Уровень 7",
  streak: "{n} дней подряд",
  streakNone: "Начни серию сегодня",
  members: "{n} участников",
  openTasks: "{n} открытых заданий",
  noTasks: "Всё выполнено",
  student: "Ученик",
  safeTitle: "Без рекламы",
  safeText: "Безопасно для детей",
  subjectsTitle: "Твои предметы",
  games: { farm: "Ферма", town: "Город", escape: "Квест", pets: "Питомцы" },
  flowStart: "Учёба в игре",
  classTitle: "Класс 5 А",
  teacher: "Учитель",
  points: "б.",
};

const all = withFallbacks({ cs, en, de, ru });

export function getHomeHeroText(locale: Locale): HomeHeroText {
  return all[locale];
}
