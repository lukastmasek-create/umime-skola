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

const uk: HomeHeroText = {
  progressTitle: "Твій прогрес",
  level: "Рівень 7",
  streak: "{n} днів поспіль",
  streakNone: "Почни серію сьогодні",
  members: "{n} учасників",
  openTasks: "{n} відкритих завдань",
  noTasks: "Усе виконано",
  student: "Учень",
  safeTitle: "Без реклами",
  safeText: "Безпечно для дітей",
  subjectsTitle: "Твої предмети",
  games: { farm: "Ферма", town: "Місто", escape: "Квест-кімната", pets: "Улюбленці" },
  flowStart: "Навчання через гру",
  classTitle: "Клас 5 А",
  teacher: "Вчитель",
  points: "б.",
};

const ja: HomeHeroText = {
  progressTitle: "あなたの進み具合",
  level: "レベル 7",
  streak: "{n} 日連続",
  streakNone: "今日から連続記録を始めよう",
  members: "メンバー {n} 人",
  openTasks: "未完了の課題 {n} 件",
  noTasks: "すべて完了",
  student: "生徒",
  safeTitle: "広告なし",
  safeText: "子どもも安心",
  subjectsTitle: "あなたの教科",
  games: { farm: "ファーム", town: "まち", escape: "脱出ゲーム", pets: "ペット" },
  flowStart: "遊びながら学ぶ",
  classTitle: "5年A組",
  teacher: "先生",
  points: "pt",
};

const es: HomeHeroText = {
  progressTitle: "Tu progreso",
  level: "Nivel 7",
  streak: "Racha de {n} días",
  streakNone: "Empieza una racha hoy",
  members: "{n} miembros",
  openTasks: "{n} tareas abiertas",
  noTasks: "Todo hecho",
  student: "Alumno",
  safeTitle: "Sin anuncios",
  safeText: "Seguro para niños",
  subjectsTitle: "Tus asignaturas",
  games: { farm: "Granja", town: "Pueblo", escape: "Escape", pets: "Mascotas" },
  flowStart: "Aprender jugando",
  classTitle: "Clase 5.º A",
  teacher: "Profesor",
  points: "pts",
};

const fr: HomeHeroText = {
  progressTitle: "Ta progression",
  level: "Niveau 7",
  streak: "Série de {n} jours",
  streakNone: "Commence une série aujourd'hui",
  members: "{n} membres",
  openTasks: "{n} consignes ouvertes",
  noTasks: "Tout est fait",
  student: "Élève",
  safeTitle: "Sans publicité",
  safeText: "Sûr pour les enfants",
  subjectsTitle: "Tes matières",
  games: { farm: "Ferme", town: "Ville", escape: "Évasion", pets: "Animaux" },
  flowStart: "Apprendre en jouant",
  classTitle: "Classe de 5e A",
  teacher: "Enseignant",
  points: "pts",
};

const all: Record<Locale, HomeHeroText> = { cs, en, de, ru, uk, ja, es, fr };

export function getHomeHeroText(locale: Locale): HomeHeroText {
  return all[locale];
}
