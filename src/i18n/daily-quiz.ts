import { withFallbacks } from "./config";
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
  setupTitle: string;
  topic: string;
  allTopics: string;
  difficulty: string;
  levels: string[]; // názvy obtížností 1–5
  timedLabel: string;
  timedHint: string; // {s}
  timeUp: string;
  points: string; // {n}
  pointsShort: string;
  streak: string; // {n}
  bestStreak: string; // {n}
  flawless: string;
  scoreNow: string; // {n}
  localTitle: string;
  localEmpty: string;
  localBest: string; // {n}
  notEnough: string;
  starting: string;
  teaserWaiting: string;
  teaserContinue: string;
  teaserDone: string; // {n} {p}
  teaserPlay: string;
  teaserOpen: string;
};

const cs: DailyQuizText = {
  nav: "Denní kvíz",
  title: "Denní kvíz",
  subtitle: "Deset otázek podle tvého výběru tématu a obtížnosti. Sbírej body a XP, drž sérii správných odpovědí a vyšplhej na žebříček dne.",
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
  setupTitle: "Nastav si dnešní kvíz",
  topic: "Téma",
  allTopics: "Mix všech témat",
  difficulty: "Obtížnost",
  levels: ["Snadná", "Lehčí", "Střední", "Těžší", "Expert"],
  timedLabel: "Časový režim",
  timedHint: "{s} s na otázku, body ×1,5",
  timeUp: "Čas vypršel",
  points: "+{n} b.",
  pointsShort: "body",
  streak: "🔥 Série {n}",
  bestStreak: "Nejdelší série: {n}",
  flawless: "Bezchybné kolo! Bonus 10 bodů a 10 XP.",
  scoreNow: "{n} / 10",
  localTitle: "Tvoje výsledky v tomto zařízení",
  localEmpty: "Zatím tu nic nemáš. Zahraj si první kvíz!",
  localBest: "Nejlepší: {n} / 10",
  notEnough: "Pro tuto kombinaci tématu a obtížnosti není dost otázek. Zkus jiné téma.",
  starting: "Připravuji otázky…",
  teaserWaiting: "Dnešní kvíz čeká: 10 otázek, vyber si téma a obtížnost.",
  teaserContinue: "Máš rozehráno, dohraj to!",
  teaserDone: "Dnes máš {n} / 10 a {p} bodů. Nový kvíz za {t}.",
  teaserPlay: "Hrát",
  teaserOpen: "Žebříček",
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
  setupTitle: "Set up today's quiz",
  topic: "Topic",
  allTopics: "Mix of all topics",
  difficulty: "Difficulty",
  levels: ["Easy", "Easier", "Medium", "Harder", "Expert"],
  timedLabel: "Timed mode",
  timedHint: "{s} s per question, points ×1.5",
  timeUp: "Time's up",
  points: "+{n} pts",
  pointsShort: "points",
  streak: "🔥 Streak {n}",
  bestStreak: "Longest streak: {n}",
  flawless: "Flawless round! Bonus 10 points and 10 XP.",
  scoreNow: "{n} / 10",
  localTitle: "Your results on this device",
  localEmpty: "Nothing here yet. Play your first quiz!",
  localBest: "Best: {n} / 10",
  notEnough: "Not enough questions for this topic and difficulty. Try another topic.",
  starting: "Preparing questions…",
  teaserWaiting: "Today's quiz is waiting: 10 questions, pick a topic and difficulty.",
  teaserContinue: "You have one in progress, finish it!",
  teaserDone: "Today: {n} / 10 and {p} points. New quiz in {t}.",
  teaserPlay: "Play",
  teaserOpen: "Leaderboard",
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
  setupTitle: "Stelle dein Tages-Quiz ein",
  topic: "Thema",
  allTopics: "Mix aller Themen",
  difficulty: "Schwierigkeit",
  levels: ["Leicht", "Eher leicht", "Mittel", "Schwerer", "Experte"],
  timedLabel: "Zeitmodus",
  timedHint: "{s} s pro Frage, Punkte ×1,5",
  timeUp: "Zeit abgelaufen",
  points: "+{n} P.",
  pointsShort: "Punkte",
  streak: "🔥 Serie {n}",
  bestStreak: "Längste Serie: {n}",
  flawless: "Fehlerfreie Runde! Bonus 10 Punkte und 10 XP.",
  scoreNow: "{n} / 10",
  localTitle: "Deine Ergebnisse auf diesem Gerät",
  localEmpty: "Noch nichts da. Spiele dein erstes Quiz!",
  localBest: "Bestwert: {n} / 10",
  notEnough: "Für dieses Thema und diese Schwierigkeit gibt es nicht genug Fragen. Probiere ein anderes Thema.",
  starting: "Fragen werden vorbereitet…",
  teaserWaiting: "Das heutige Quiz wartet: 10 Fragen, wähle Thema und Schwierigkeit.",
  teaserContinue: "Du hast eins begonnen, spiel es zu Ende!",
  teaserDone: "Heute: {n} / 10 und {p} Punkte. Neues Quiz in {t}.",
  teaserPlay: "Spielen",
  teaserOpen: "Rangliste",
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
  setupTitle: "Настрой квиз на сегодня",
  topic: "Тема",
  allTopics: "Микс всех тем",
  difficulty: "Сложность",
  levels: ["Легко", "Проще", "Средне", "Сложнее", "Эксперт"],
  timedLabel: "Режим на время",
  timedHint: "{s} с на вопрос, очки ×1,5",
  timeUp: "Время вышло",
  points: "+{n} очк.",
  pointsShort: "очки",
  streak: "🔥 Серия {n}",
  bestStreak: "Лучшая серия: {n}",
  flawless: "Безупречный раунд! Бонус 10 очков и 10 XP.",
  scoreNow: "{n} / 10",
  localTitle: "Твои результаты на этом устройстве",
  localEmpty: "Пока пусто. Сыграй первый квиз!",
  localBest: "Лучший: {n} / 10",
  notEnough: "Для этой темы и сложности мало вопросов. Попробуй другую тему.",
  starting: "Готовлю вопросы…",
  teaserWaiting: "Квиз дня ждёт: 10 вопросов, выбери тему и сложность.",
  teaserContinue: "Квиз начат, доиграй его!",
  teaserDone: "Сегодня: {n} / 10 и {p} очков. Новый квиз через {t}.",
  teaserPlay: "Играть",
  teaserOpen: "Рейтинг",
};

const texts: Record<Locale, DailyQuizText> = withFallbacks({ cs, en, de, ru });
export const getDailyQuizText = (locale: Locale) => texts[locale];
