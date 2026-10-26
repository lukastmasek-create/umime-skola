import type { Locale } from "./config";
import type { QuestId } from "@/lib/gamify";

export type DailyText = {
  title: string;
  streak: string; // {n}
  streakBest: string; // {n}
  streakIdle: string;
  streakToday: string;
  quests: string;
  questNames: Record<QuestId, string>;
  claim: string;
  claimed: string;
  bonus: string; // {n}
  milestones: string;
  days: string; // {n}
  achievements: string;
  guest: string;
  error: string;
  achievementNames: Record<string, string>;
};

const cs: DailyText = {
  title: "Denní výzvy",
  streak: "Série {n} dní",
  streakBest: "Rekord: {n}",
  streakIdle: "Dnes ještě nic. Procvičuj a udrž sérii!",
  streakToday: "Dnešek máš splněný, skvělé!",
  quests: "Dnešní úkoly",
  questNames: {
    learn: "Získej 30 XP v testech a hrách",
    test: "Dokonči test",
    escape: "Vyřeš únikovku",
    idle: "Zahraj si stálou hru (Mazlíčci, Město, Základna)",
  },
  claim: "Vyzvednout",
  claimed: "Vyzvednuto",
  bonus: "+{n} XP",
  milestones: "Milníky série",
  days: "{n} dní",
  achievements: "Úspěchy",
  guest: "Přihlas se a sbírej denní série, výzvy a úspěchy.",
  error: "Výzvy se nepodařilo načíst.",
  achievementNames: {
    "first-test": "První test",
    "tests-10": "10 testů",
    "first-game": "První hra",
    "games-10": "10 her",
    "first-escape": "První únikovka",
    "escape-all": "Všech 6 únikovek",
    "streak-7": "Série 7 dní",
    "streak-30": "Série 30 dní",
    "level-5": "Úroveň 5",
    "level-10": "Úroveň 10",
  },
};

const en: DailyText = {
  title: "Daily challenges",
  streak: "{n}-day streak",
  streakBest: "Best: {n}",
  streakIdle: "Nothing yet today. Practise to keep your streak!",
  streakToday: "Today is done, great job!",
  quests: "Today's quests",
  questNames: {
    learn: "Earn 30 XP in tests and games",
    test: "Finish a test",
    escape: "Solve an escape room",
    idle: "Play an idle game (Pets, City, Base)",
  },
  claim: "Claim",
  claimed: "Claimed",
  bonus: "+{n} XP",
  milestones: "Streak milestones",
  days: "{n} days",
  achievements: "Achievements",
  guest: "Log in to collect streaks, daily challenges and achievements.",
  error: "Could not load the challenges.",
  achievementNames: {
    "first-test": "First test",
    "tests-10": "10 tests",
    "first-game": "First game",
    "games-10": "10 games",
    "first-escape": "First escape room",
    "escape-all": "All 6 escape rooms",
    "streak-7": "7-day streak",
    "streak-30": "30-day streak",
    "level-5": "Level 5",
    "level-10": "Level 10",
  },
};

const de: DailyText = {
  title: "Tägliche Aufgaben",
  streak: "{n} Tage in Folge",
  streakBest: "Rekord: {n}",
  streakIdle: "Heute noch nichts. Übe, um deine Serie zu halten!",
  streakToday: "Heute geschafft, super!",
  quests: "Heutige Aufgaben",
  questNames: {
    learn: "Sammle 30 XP in Tests und Spielen",
    test: "Schließe einen Test ab",
    escape: "Löse einen Escape Room",
    idle: "Spiele ein Dauerspiel (Haustiere, Stadt, Basis)",
  },
  claim: "Abholen",
  claimed: "Abgeholt",
  bonus: "+{n} XP",
  milestones: "Serien-Meilensteine",
  days: "{n} Tage",
  achievements: "Erfolge",
  guest: "Melde dich an, um Serien, Aufgaben und Erfolge zu sammeln.",
  error: "Die Aufgaben konnten nicht geladen werden.",
  achievementNames: {
    "first-test": "Erster Test",
    "tests-10": "10 Tests",
    "first-game": "Erstes Spiel",
    "games-10": "10 Spiele",
    "first-escape": "Erster Escape Room",
    "escape-all": "Alle 6 Escape Rooms",
    "streak-7": "7 Tage in Folge",
    "streak-30": "30 Tage in Folge",
    "level-5": "Stufe 5",
    "level-10": "Stufe 10",
  },
};

const ru: DailyText = {
  title: "Ежедневные задания",
  streak: "Серия: {n} дн.",
  streakBest: "Рекорд: {n}",
  streakIdle: "Сегодня пока ничего. Занимайся, чтобы сохранить серию!",
  streakToday: "На сегодня всё выполнено, отлично!",
  quests: "Задания на сегодня",
  questNames: {
    learn: "Набери 30 XP в тестах и играх",
    test: "Пройди тест",
    escape: "Пройди квест-комнату",
    idle: "Поиграй в долгую игру (Питомцы, Город, База)",
  },
  claim: "Забрать",
  claimed: "Получено",
  bonus: "+{n} XP",
  milestones: "Этапы серии",
  days: "{n} дн.",
  achievements: "Достижения",
  guest: "Войди, чтобы собирать серии, задания и достижения.",
  error: "Не удалось загрузить задания.",
  achievementNames: {
    "first-test": "Первый тест",
    "tests-10": "10 тестов",
    "first-game": "Первая игра",
    "games-10": "10 игр",
    "first-escape": "Первая квест-комната",
    "escape-all": "Все 6 квест-комнат",
    "streak-7": "Серия 7 дней",
    "streak-30": "Серия 30 дней",
    "level-5": "Уровень 5",
    "level-10": "Уровень 10",
  },
};

const texts: Record<Locale, DailyText> = { cs, en, de, ru };

export function getDailyText(locale: Locale): DailyText {
  return texts[locale];
}
