import type { Locale } from "./config";
import type { GameKey, MetricId } from "@/lib/idle/hub";

type L4 = Record<Locale, string>;
const n = (cs: string, en: string, de: string, ru: string): L4 => ({ cs, en, de, ru });

export const HUB_TEXT = {
  title: n("Úkoly a úspěchy", "Quests and achievements", "Aufgaben und Erfolge", "Задания и достижения"),
  daily: n("Denní úkoly", "Daily quests", "Tägliche Aufgaben", "Задания на день"),
  dailyHint: n("Nové úkoly se objeví každý den. Odměnou jsou body.", "New quests appear every day. You get points as a reward.", "Jeden Tag gibt es neue Aufgaben. Als Belohnung gibt es Punkte.", "Каждый день появляются новые задания. Награда: очки."),
  achievements: n("Úspěchy", "Achievements", "Erfolge", "Достижения"),
  claim: n("Vybrat", "Claim", "Abholen", "Забрать"),
  claimed: n("Vybráno", "Claimed", "Abgeholt", "Получено"),
  points: n("bodů", "points", "Punkte", "очков"),
  loginHint: n("Přihlas se, ať se ti úkoly a úspěchy počítají.", "Sign in so your quests and achievements count.", "Melde dich an, damit deine Aufgaben und Erfolge zählen.", "Войди, чтобы задания и достижения засчитывались."),
  login: n("Přihlásit se", "Sign in", "Anmelden", "Войти"),
  error: n("Něco se nepovedlo, zkus to znovu.", "Something went wrong, try again.", "Etwas ist schiefgelaufen, versuche es noch einmal.", "Что-то пошло не так, попробуй ещё раз."),
  got: n("Získal jsi {n} bodů!", "You got {n} points!", "Du hast {n} Punkte bekommen!", "Ты получил {n} очков!"),
  showAll: n("Zobrazit všechny", "Show all", "Alle anzeigen", "Показать все"),
  showLess: n("Zobrazit méně", "Show less", "Weniger anzeigen", "Показать меньше"),
} satisfies Record<string, L4>;

export const GAME_LABEL: Record<GameKey, L4> = {
  base: n("Základna", "Base", "Basis", "База"),
  city: n("Město", "City", "Stadt", "Город"),
  farm: n("Farma", "Farm", "Farm", "Ферма"),
  pets: n("Mazlíčci", "Pets", "Haustiere", "Питомцы"),
  learn: n("Učení", "Learning", "Lernen", "Учёба"),
};

export const GAME_ICON: Record<GameKey, string> = { base: "🚀", city: "🏙️", farm: "🌾", pets: "🐾", learn: "📚" };

// Šablony úspěchů, {n} se nahradí cílem.
export const ACHIEVEMENT_TEXT: Record<MetricId, L4> = {
  baseModules: n("Postav {n} modulů na Základně", "Build {n} modules on the Base", "Baue {n} Module auf der Basis", "Построй {n} модулей на Базе"),
  baseEarned: n("Vydělej {n} kreditů na Základně", "Earn {n} credits on the Base", "Verdiene {n} Credits auf der Basis", "Заработай {n} кредитов на Базе"),
  baseShips: n("Vlastni {n} lodí", "Own {n} ships", "Besitze {n} Schiffe", "Владей {n} кораблями"),
  baseResearch: n("Vyzkoumej {n} technologií", "Research {n} technologies", "Erforsche {n} Technologien", "Изучи {n} технологий"),
  cityBuildings: n("Postav ve městě {n} budov", "Build {n} buildings in the city", "Baue {n} Gebäude in der Stadt", "Построй в городе {n} зданий"),
  cityEarned: n("Vydělej ve městě {n} mincí", "Earn {n} coins in the city", "Verdiene {n} Münzen in der Stadt", "Заработай в городе {n} монет"),
  farmLevel: n("Dosáhni na farmě úrovně {n}", "Reach farm level {n}", "Erreiche Farm-Stufe {n}", "Достигни уровня фермы {n}"),
  farmOrders: n("Splň {n} zakázek", "Complete {n} orders", "Erfülle {n} Aufträge", "Выполни {n} заказов"),
  farmEarned: n("Vydělej na farmě {n} mincí", "Earn {n} coins on the farm", "Verdiene {n} Münzen auf der Farm", "Заработай на ферме {n} монет"),
  petsOwned: n("Získej {n} mazlíčků", "Get {n} pets", "Hole dir {n} Haustiere", "Заведи {n} питомцев"),
  petLevel: n("Vychovej mazlíčka na úroveň {n}", "Raise a pet to level {n}", "Ziehe ein Haustier auf Stufe {n}", "Вырасти питомца до уровня {n}"),
  petsEarned: n("Vydělej s mazlíčky {n} mincí", "Earn {n} coins with pets", "Verdiene {n} Münzen mit Haustieren", "Заработай с питомцами {n} монет"),
  learnXp: n("Získej učením celkem {n} XP", "Earn {n} XP from learning in total", "Sammle insgesamt {n} XP durch Lernen", "Набери за учёбу {n} XP"),
  learnXpToday: n("", "", "", ""),
};

// Šablony denních úkolů (id úkolu = klíč).
export const DAILY_TEXT: Record<string, L4> = {
  learnXpToday: n("Získej dnes {n} XP učením", "Earn {n} XP from learning today", "Sammle heute {n} XP durch Lernen", "Набери сегодня {n} XP за учёбу"),
  farmEarned: n("Vydělej dnes na farmě {n} mincí", "Earn {n} coins on the farm today", "Verdiene heute {n} Münzen auf der Farm", "Заработай сегодня на ферме {n} монет"),
  cityEarned: n("Vydělej dnes ve městě {n} mincí", "Earn {n} coins in the city today", "Verdiene heute {n} Münzen in der Stadt", "Заработай сегодня в городе {n} монет"),
  baseEarned: n("Vydělej dnes na Základně {n} kreditů", "Earn {n} credits on the Base today", "Verdiene heute {n} Credits auf der Basis", "Заработай сегодня на Базе {n} кредитов"),
  petsEarned: n("Vydělej dnes s mazlíčky {n} mincí", "Earn {n} coins with pets today", "Verdiene heute {n} Münzen mit Haustieren", "Заработай сегодня с питомцами {n} монет"),
  farmOrders: n("Splň dnes {n} zakázky na farmě", "Complete {n} farm orders today", "Erfülle heute {n} Farm-Aufträge", "Выполни сегодня {n} заказа на ферме"),
  cityBuildings: n("Postav dnes ve městě {n} budovy", "Build {n} buildings in the city today", "Baue heute {n} Gebäude in der Stadt", "Построй сегодня в городе {n} здания"),
};

export function tr(text: L4, locale: Locale): string {
  return text[locale] ?? text.cs;
}

export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));
}
