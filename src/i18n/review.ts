import type { Locale } from "./config";

export type ReviewText = {
  weak: { title: string; subtitle: string; empty: string; count: string; due: string; practice: string; best: string };
  reviewNav: string;
  mapNav: string;
  reviewTitle: string;
  reviewSubtitle: string;
  loginNeeded: string;
  login: string;
  loadError: string;
  nothingDue: string;
  nothingDueHint: string;
  dueCount: string; // {n}
  question: string;
  check: string;
  next: string;
  finish: string;
  correct: string;
  wrong: string;
  correctAnswer: string;
  why: string;
  summary: string; // {n} = "a / b"
  summaryHint: string;
  again: string;
  openCourse: string;
  mapTitle: string;
  mapSubtitle: string;
  recommended: string;
  statusNew: string;
  statusStarted: string;
  statusDone: string;
  best: string; // {n} %
  reviewCta: string; // {n}
  startCourse: string;
  noCourses: string;
  progress: string; // {n} = "a / b"
};

const cs: ReviewText = {
  weak: { title: "Slabá místa", subtitle: "Tady ti to nejvíc klouže. Procvič si jen tyto otázky.", empty: "Zatím žádná slabá místa. Skvělé!", count: "{n} otázek k procvičení", due: "{n} dnes", practice: "Procvičit", best: "Nejlepší test {n} %" },
  reviewNav: "Opakování",
  mapNav: "Moje mapa",
  reviewTitle: "Opakování chyb",
  reviewSubtitle: "Otázky, ve kterých ses spletl/a, se vracejí po 1, 2, 4, 8 a 16 dnech. Když je zvládneš, zmizí.",
  loginNeeded: "Přihlas se, ať si web pamatuje tvoje chyby a naplánuje opakování.",
  login: "Přihlásit se",
  loadError: "Nepodařilo se načíst opakování.",
  nothingDue: "Dnes nemáš co opakovat 🎉",
  nothingDueHint: "Až v testu nebo hře uděláš chybu, objeví se tu k opakování.",
  dueCount: "K opakování dnes: {n}",
  question: "Otázka",
  check: "Zkontrolovat",
  next: "Další",
  finish: "Dokončit",
  correct: "Správně!",
  wrong: "Tohle bylo špatně",
  correctAnswer: "Správná odpověď",
  why: "Proč",
  summary: "Správně {n}",
  summaryHint: "Co jsi zvládl/a, se vrátí později. Co ne, uvidíš zase zítra.",
  again: "Další opakování",
  openCourse: "Otevřít kurz",
  mapTitle: "Moje mapa",
  mapSubtitle: "Tvoje cesta po kurzech. Dokončené se zbarví, další tipy najdeš nahoře.",
  recommended: "Doporučujeme jako další",
  statusNew: "Nový",
  statusStarted: "Rozpracovaný",
  statusDone: "Zvládnutý",
  best: "Nejlépe {n} %",
  reviewCta: "Opakování ({n})",
  startCourse: "Začít",
  noCourses: "Kurzy se nepodařilo načíst.",
  progress: "Zvládnuto {n} kurzů",
};

const en: ReviewText = {
  weak: { title: "Weak spots", subtitle: "These are the topics you slip on most. Practise just these questions.", empty: "No weak spots yet. Great!", count: "{n} questions to practise", due: "{n} today", practice: "Practise", best: "Best test {n} %" },
  reviewNav: "Review",
  mapNav: "My map",
  reviewTitle: "Mistake review",
  reviewSubtitle: "Questions you got wrong come back after 1, 2, 4, 8 and 16 days. Once you master them, they disappear.",
  loginNeeded: "Log in so the site remembers your mistakes and plans your review.",
  login: "Log in",
  loadError: "Could not load the review.",
  nothingDue: "Nothing to review today 🎉",
  nothingDueHint: "When you make a mistake in a test or game, it will show up here for review.",
  dueCount: "To review today: {n}",
  question: "Question",
  check: "Check",
  next: "Next",
  finish: "Finish",
  correct: "Correct!",
  wrong: "That was wrong",
  correctAnswer: "Correct answer",
  why: "Why",
  summary: "Correct {n}",
  summaryHint: "What you got right will come back later. What you did not, you will see again tomorrow.",
  again: "More review",
  openCourse: "Open course",
  mapTitle: "My map",
  mapSubtitle: "Your path through the courses. Finished ones light up, next suggestions are at the top.",
  recommended: "Recommended next",
  statusNew: "New",
  statusStarted: "In progress",
  statusDone: "Mastered",
  best: "Best {n} %",
  reviewCta: "Review ({n})",
  startCourse: "Start",
  noCourses: "Could not load the courses.",
  progress: "{n} courses mastered",
};

const de: ReviewText = {
  weak: { title: "Schwachstellen", subtitle: "Hier rutschst du am häufigsten aus. Übe nur diese Fragen.", empty: "Noch keine Schwachstellen. Super!", count: "{n} Fragen zum Üben", due: "{n} heute", practice: "Üben", best: "Bester Test {n} %" },
  reviewNav: "Wiederholen",
  mapNav: "Meine Karte",
  reviewTitle: "Fehler wiederholen",
  reviewSubtitle: "Fragen, die du falsch hattest, kommen nach 1, 2, 4, 8 und 16 Tagen zurück. Wenn du sie beherrschst, verschwinden sie.",
  loginNeeded: "Melde dich an, damit sich die Seite deine Fehler merkt und die Wiederholung plant.",
  login: "Anmelden",
  loadError: "Die Wiederholung konnte nicht geladen werden.",
  nothingDue: "Heute gibt es nichts zu wiederholen 🎉",
  nothingDueHint: "Wenn du in einem Test oder Spiel einen Fehler machst, erscheint er hier zur Wiederholung.",
  dueCount: "Heute zu wiederholen: {n}",
  question: "Frage",
  check: "Prüfen",
  next: "Weiter",
  finish: "Fertig",
  correct: "Richtig!",
  wrong: "Das war falsch",
  correctAnswer: "Richtige Antwort",
  why: "Warum",
  summary: "Richtig {n}",
  summaryHint: "Was du richtig hattest, kommt später wieder. Den Rest siehst du morgen erneut.",
  again: "Weiter wiederholen",
  openCourse: "Kurs öffnen",
  mapTitle: "Meine Karte",
  mapSubtitle: "Dein Weg durch die Kurse. Abgeschlossene leuchten auf, die nächsten Tipps stehen oben.",
  recommended: "Als Nächstes empfohlen",
  statusNew: "Neu",
  statusStarted: "In Arbeit",
  statusDone: "Gemeistert",
  best: "Bestwert {n} %",
  reviewCta: "Wiederholen ({n})",
  startCourse: "Starten",
  noCourses: "Die Kurse konnten nicht geladen werden.",
  progress: "{n} Kurse gemeistert",
};

const ru: ReviewText = {
  weak: { title: "Слабые места", subtitle: "Здесь ты чаще всего ошибаешься. Потренируй только эти вопросы.", empty: "Слабых мест пока нет. Отлично!", count: "{n} вопросов для тренировки", due: "{n} сегодня", practice: "Тренироваться", best: "Лучший тест {n} %" },
  reviewNav: "Повторение",
  mapNav: "Моя карта",
  reviewTitle: "Повторение ошибок",
  reviewSubtitle: "Вопросы, в которых ты ошибся, возвращаются через 1, 2, 4, 8 и 16 дней. Когда освоишь их, они исчезнут.",
  loginNeeded: "Войди, чтобы сайт запомнил твои ошибки и спланировал повторение.",
  login: "Войти",
  loadError: "Не удалось загрузить повторение.",
  nothingDue: "Сегодня повторять нечего 🎉",
  nothingDueHint: "Когда ты ошибёшься в тесте или игре, вопрос появится здесь для повторения.",
  dueCount: "Повторить сегодня: {n}",
  question: "Вопрос",
  check: "Проверить",
  next: "Дальше",
  finish: "Завершить",
  correct: "Верно!",
  wrong: "Это неверно",
  correctAnswer: "Правильный ответ",
  why: "Почему",
  summary: "Верно {n}",
  summaryHint: "То, что получилось, вернётся позже. Остальное увидишь завтра снова.",
  again: "Ещё повторение",
  openCourse: "Открыть курс",
  mapTitle: "Моя карта",
  mapSubtitle: "Твой путь по курсам. Пройденные загораются, следующие советы наверху.",
  recommended: "Рекомендуем дальше",
  statusNew: "Новый",
  statusStarted: "В процессе",
  statusDone: "Освоен",
  best: "Лучший результат {n} %",
  reviewCta: "Повторение ({n})",
  startCourse: "Начать",
  noCourses: "Не удалось загрузить курсы.",
  progress: "Освоено курсов: {n}",
};

const texts: Record<Locale, ReviewText> = { cs, en, de, ru };
export const getReviewText = (locale: Locale) => texts[locale];
