import type { Locale } from "./config";

export type DailyQuizText = {
  nav: string;
  title: string;
  subtitle: string;
  start: string;
  guest: string;
  login: string;
  question: string; // {a} / {b}
  correct: string;
  wrong: string;
  correctWas: string;
  next: string;
  finish: string;
  score: string; // {n}
  time: string;
  rank: string; // {n}
  top: string;
  you: string;
  empty: string;
  tomorrow: string; // {t}
  gained: string; // {n}
  error: string;
  already: string;
};

const cs: DailyQuizText = {
  nav: "Denní kvíz",
  title: "Denní kvíz",
  subtitle: "Deset otázek, stejné pro všechny hráče. Rychle a přesně: nejlepší se objeví na žebříčku dne.",
  start: "Začít kvíz",
  guest: "Pro denní kvíz se přihlas, ať se tvůj výsledek zapíše do žebříčku.",
  login: "Přihlásit se",
  question: "Otázka {a} / {b}",
  correct: "Správně!",
  wrong: "Špatně",
  correctWas: "Správná odpověď",
  next: "Další otázka",
  finish: "Zobrazit výsledek",
  score: "Skóre: {n} / 10",
  time: "Čas",
  rank: "Jsi {n}. na žebříčku dne",
  top: "Žebříček dne",
  you: "ty",
  empty: "Zatím nikdo nehrál. Buď první!",
  tomorrow: "Nový kvíz bude za {t}.",
  gained: "+{n} XP",
  error: "Kvíz se nepodařilo načíst. Zkus to za chvíli.",
  already: "Dnešní kvíz už máš za sebou. Vrať se zítra!",
};
const en: DailyQuizText = {
  nav: "Daily quiz",
  title: "Daily quiz",
  subtitle: "Ten questions, the same for every player. Be quick and accurate: the best appear on today's leaderboard.",
  start: "Start the quiz",
  guest: "Log in to play so your result is saved to the leaderboard.",
  login: "Log in",
  question: "Question {a} / {b}",
  correct: "Correct!",
  wrong: "Wrong",
  correctWas: "Correct answer",
  next: "Next question",
  finish: "See result",
  score: "Score: {n} / 10",
  time: "Time",
  rank: "You are #{n} on today's board",
  top: "Today's leaderboard",
  you: "you",
  empty: "Nobody has played yet. Be the first!",
  tomorrow: "A new quiz in {t}.",
  gained: "+{n} XP",
  error: "Could not load the quiz. Try again in a moment.",
  already: "You've finished today's quiz. Come back tomorrow!",
};
const de: DailyQuizText = {
  nav: "Tages-Quiz",
  title: "Tages-Quiz",
  subtitle: "Zehn Fragen, für alle Spieler gleich. Schnell und genau: die Besten erscheinen in der Tagesrangliste.",
  start: "Quiz starten",
  guest: "Melde dich an, damit dein Ergebnis in die Rangliste kommt.",
  login: "Anmelden",
  question: "Frage {a} / {b}",
  correct: "Richtig!",
  wrong: "Falsch",
  correctWas: "Richtige Antwort",
  next: "Nächste Frage",
  finish: "Ergebnis ansehen",
  score: "Punkte: {n} / 10",
  time: "Zeit",
  rank: "Du bist Nr. {n} der Tagesrangliste",
  top: "Tagesrangliste",
  you: "du",
  empty: "Noch niemand hat gespielt. Sei der Erste!",
  tomorrow: "Neues Quiz in {t}.",
  gained: "+{n} XP",
  error: "Das Quiz konnte nicht geladen werden. Versuche es gleich noch einmal.",
  already: "Du hast das heutige Quiz schon gespielt. Komm morgen wieder!",
};
const ru: DailyQuizText = {
  nav: "Квиз дня",
  title: "Квиз дня",
  subtitle: "Десять вопросов, одинаковых для всех. Быстро и точно: лучшие попадут в рейтинг дня.",
  start: "Начать квиз",
  guest: "Войди, чтобы результат попал в рейтинг.",
  login: "Войти",
  question: "Вопрос {a} / {b}",
  correct: "Верно!",
  wrong: "Неверно",
  correctWas: "Правильный ответ",
  next: "Следующий вопрос",
  finish: "Показать результат",
  score: "Счёт: {n} / 10",
  time: "Время",
  rank: "Ты №{n} в рейтинге дня",
  top: "Рейтинг дня",
  you: "ты",
  empty: "Пока никто не играл. Будь первым!",
  tomorrow: "Новый квиз через {t}.",
  gained: "+{n} XP",
  error: "Не удалось загрузить квиз. Попробуй чуть позже.",
  already: "Квиз на сегодня уже пройден. Возвращайся завтра!",
};

const texts: Record<Locale, DailyQuizText> = { cs, en, de, ru };
export const getDailyQuizText = (locale: Locale) => texts[locale];
