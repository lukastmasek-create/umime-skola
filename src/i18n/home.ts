import type { Locale } from "./config";

export type HomeText = {
  menu: string;
  more: string;
  closeMenu: string;
  learn: string;
  play: string;
  groups: { courses: string; settings: string; games: string; shop: string; study: string; extras: string; together: string; boards: string };
  languages: string;
  index: string;
  subjectsTitle: string;
  subjectsHint: string;
  allCourses: string;
  featuresTitle: string;
  features: { key: "courses" | "games" | "escape" | "boards"; title: string; text: string; cta: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  progressTitle: string;
  progressGuest: string;
  progressLevel: string;
  progressNext: string;
  progressPoints: string;
  continueLearning: string;
  openProfile: string;
  about: {
    title: string;
    lead: string;
    points: { title: string; text: string }[];
    contact: string;
    email: string;
    teamTitle: string;
    team: { name: string; role: string }[];
  };
};

const cs: HomeText = {
  more: "Více",
  menu: "Menu",
  closeMenu: "Zavřít menu",
  learn: "Učení",
  play: "Hry a komunita",
  groups: { courses: "Kurzy", settings: "Nastavení", games: "Hry", shop: "Obchod", study: "Učivo", extras: "Přídavky", together: "Společné hry", boards: "Žebříčky" },
  languages: "Jazyky",
  index: "Sbírka karet",
  subjectsTitle: "Vyber si předmět",
  subjectsHint: "Čtrnáct předmětů od 1. do 9. třídy, každý s kurzy od nejsnazších po nejtěžší.",
  allCourses: "Všechny kurzy",
  featuresTitle: "Co tu najdeš",
  features: [
    { key: "courses", title: "Kurzy a testy", text: "Procvičuj po tématech a ověř se v testu jako ve škole, s vysvětlením každé odpovědi.", cta: "Prohlédnout kurzy" },
    { key: "games", title: "Hry za body", text: "Obrana galaxie, Labyrint duchů, Pád bloků i klasiky jako křížovka, osmisměrka a pexeso. Za správné odpovědi sbíráš body.", cta: "Vyzkoušet" },
    { key: "escape", title: "Únikovky", text: "Vyřeš hádanky, najdi předměty a uteč z laboratoře dřív, než dojde čas.", cta: "Do únikovky" },
    { key: "boards", title: "Žebříčky", text: "Porovnej se spolužáky, svou školou i ostatními školami v celé zemi.", cta: "Žebříčky" },
  ],
  stepsTitle: "Jak to funguje",
  steps: [
    { title: "Vyber kurz", text: "Podle předmětu a ročníku. Každý kurz má pět úrovní obtížnosti." },
    { title: "Procvičuj hrou", text: "Za správné odpovědi sbíráš body a odemykáš vylepšení." },
    { title: "Rosteš", text: "Získáváš XP, úrovně, nové avatary a tituly." },
  ],
  progressTitle: "Tvůj postup",
  progressGuest: "Zaregistruj se zdarma a ukládej si body, úrovně a časy v únikovkách.",
  progressLevel: "Úroveň",
  progressNext: "Do další úrovně zbývá {n} XP",
  progressPoints: "Body",
  continueLearning: "Pokračovat v učení",
  openProfile: "Otevřít profil",
  about: {
    title: "O nás",
    lead: "Učíme se hrou je vzdělávací web pro žáky 1. až 9. třídy. Věříme, že se člověk nejlépe učí tehdy, když ho to baví. Proto procvičování spojujeme s hrami, body a malými výzvami a ke každé odpovědi máš vysvětlení.",
    points: [
      { title: "Co děláme", text: "Připravujeme kurzy a testy ke čtrnácti předmětům od 1. do 9. třídy, každý s pěti úrovněmi obtížnosti." },
      { title: "Proč hrou", text: "Za správné odpovědi získáš body, odemkneš vylepšení a postoupíš o úroveň výš. Učení tak připomíná hru, ne úkol." },
      { title: "Pro koho", text: "Pro žáky, rodiče i učitele. Registrace je zdarma a body, úrovně i časy v únikovkách si uložíš na svůj účet." },
    ],
    contact: "Napiš nám",
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Tým",
    team: [
      { name: "Natálie Majerová", role: "Marketing Manažer" },
      { name: "Lukáš Tomášek", role: "Hlavní Developer" },
      { name: "Lukáš Záhorský", role: "Inovátor" },
    ],
  },
};

const en: HomeText = {
  more: "More",
  menu: "Menu",
  closeMenu: "Close menu",
  learn: "Learn",
  play: "Games and community",
  groups: { courses: "Courses", settings: "Settings", games: "Games", shop: "Shop", study: "Study", extras: "Extras", together: "Play together", boards: "Leaderboards" },
  languages: "Languages",
  index: "Card collection",
  subjectsTitle: "Pick a subject",
  subjectsHint: "Fourteen subjects from grade 1 to 9, each with courses from the easiest to the hardest.",
  allCourses: "All courses",
  featuresTitle: "What you'll find here",
  features: [
    { key: "courses", title: "Courses and tests", text: "Practise by topic and check yourself in a school-style test, with an explanation for every answer.", cta: "Browse courses" },
    { key: "games", title: "Games for points", text: "Galaxy Defence, Ghost Labyrinth, Falling Blocks and classics like crosswords, word search and memory. Right answers earn you points.", cta: "Try it" },
    { key: "escape", title: "Escape rooms", text: "Solve puzzles, find items and escape the lab before time runs out.", cta: "Enter" },
    { key: "boards", title: "Leaderboards", text: "Compare yourself with classmates, your school and other schools across the country.", cta: "Leaderboards" },
  ],
  stepsTitle: "How it works",
  steps: [
    { title: "Pick a course", text: "By subject and grade. Every course has five difficulty levels." },
    { title: "Practise by playing", text: "Earn points for correct answers and unlock upgrades." },
    { title: "Level up", text: "Gain XP, levels, new avatars and titles." },
  ],
  progressTitle: "Your progress",
  progressGuest: "Sign up for free to keep your points, levels and escape room times.",
  progressLevel: "Level",
  progressNext: "{n} XP to the next level",
  progressPoints: "Points",
  continueLearning: "Keep learning",
  openProfile: "Open profile",
  about: {
    title: "About us",
    lead: "Učíme se hrou (Let's learn through play) is an educational website for pupils in grades 1 to 9. We believe people learn best when they enjoy it, so we combine practice with games, points and small challenges, and every answer comes with an explanation.",
    points: [
      { title: "What we do", text: "We create courses and tests for fourteen subjects from grade 1 to 9, each with five difficulty levels." },
      { title: "Why through play", text: "Correct answers earn points, unlock upgrades and move you up a level. Learning feels like a game, not a chore." },
      { title: "Who it's for", text: "Pupils, parents and teachers. Registration is free, and your points, levels and escape room times are saved to your account." },
    ],
    contact: "Write to us",
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Team",
    team: [
      { name: "Natálie Majerová", role: "Marketing Manager" },
      { name: "Lukáš Tomášek", role: "Lead Developer" },
      { name: "Lukáš Záhorský", role: "Innovator" },
    ],
  },
};

const de: HomeText = {
  more: "Mehr",
  menu: "Menü",
  closeMenu: "Menü schließen",
  learn: "Lernen",
  play: "Spiele und Community",
  groups: { courses: "Kurse", settings: "Einstellungen", games: "Spiele", shop: "Shop", study: "Lernstoff", extras: "Extras", together: "Gemeinsam spielen", boards: "Ranglisten" },
  languages: "Sprachen",
  index: "Kartensammlung",
  subjectsTitle: "Wähle ein Fach",
  subjectsHint: "Vierzehn Fächer von der 1. bis zur 9. Klasse, jedes mit Kursen vom leichtesten bis zum schwersten.",
  allCourses: "Alle Kurse",
  featuresTitle: "Das findest du hier",
  features: [
    { key: "courses", title: "Kurse und Tests", text: "Übe nach Themen und teste dich wie in der Schule, mit Erklärung zu jeder Antwort.", cta: "Kurse ansehen" },
    { key: "games", title: "Spiele für Punkte", text: "Galaxie-Abwehr, Geisterlabyrinth, Fallende Blöcke und Klassiker wie Kreuzworträtsel, Wortsuche und Memory. Für richtige Antworten gibt es Punkte.", cta: "Ausprobieren" },
    { key: "escape", title: "Escape Rooms", text: "Löse Rätsel, finde Gegenstände und entkomme dem Labor, bevor die Zeit abläuft.", cta: "Zum Escape Room" },
    { key: "boards", title: "Bestenlisten", text: "Vergleiche dich mit Mitschülern, deiner Schule und anderen Schulen im ganzen Land.", cta: "Bestenlisten" },
  ],
  stepsTitle: "So funktioniert's",
  steps: [
    { title: "Kurs wählen", text: "Nach Fach und Klasse. Jeder Kurs hat fünf Schwierigkeitsstufen." },
    { title: "Spielend üben", text: "Für richtige Antworten gibt es Punkte und Verbesserungen." },
    { title: "Aufsteigen", text: "Sammle XP, Level, neue Avatare und Titel." },
  ],
  progressTitle: "Dein Fortschritt",
  progressGuest: "Registriere dich kostenlos und behalte Punkte, Level und Escape-Room-Zeiten.",
  progressLevel: "Level",
  progressNext: "Noch {n} XP bis zum nächsten Level",
  progressPoints: "Punkte",
  continueLearning: "Weiterlernen",
  openProfile: "Profil öffnen",
  about: {
    title: "Über uns",
    lead: "Učíme se hrou (Lernen durch Spielen) ist eine Lernplattform für Schülerinnen und Schüler der 1. bis 9. Klasse. Wir glauben, dass man am besten lernt, wenn es Spaß macht. Deshalb verbinden wir Üben mit Spielen, Punkten und kleinen Herausforderungen, und zu jeder Antwort gibt es eine Erklärung.",
    points: [
      { title: "Was wir machen", text: "Wir erstellen Kurse und Tests zu vierzehn Fächern von der 1. bis zur 9. Klasse, jeweils mit fünf Schwierigkeitsstufen." },
      { title: "Warum spielerisch", text: "Richtige Antworten bringen Punkte, schalten Verbesserungen frei und lassen dich aufsteigen. Lernen fühlt sich wie ein Spiel an, nicht wie eine Pflicht." },
      { title: "Für wen", text: "Für Schülerinnen und Schüler, Eltern und Lehrkräfte. Die Registrierung ist kostenlos, und Punkte, Level und Zeiten aus den Escape Rooms werden in deinem Konto gespeichert." },
    ],
    contact: "Schreib uns",
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Team",
    team: [
      { name: "Natálie Majerová", role: "Marketing-Managerin" },
      { name: "Lukáš Tomášek", role: "Hauptentwickler" },
      { name: "Lukáš Záhorský", role: "Innovator" },
    ],
  },
};

const ru: HomeText = {
  more: "Ещё",
  menu: "Меню",
  closeMenu: "Закрыть меню",
  learn: "Обучение",
  play: "Игры и сообщество",
  groups: { courses: "Курсы", settings: "Настройки", games: "Игры", shop: "Магазин", study: "Материал", extras: "Бонусы", together: "Играть вместе", boards: "Рейтинги" },
  languages: "Языки",
  index: "Коллекция карточек",
  subjectsTitle: "Выбери предмет",
  subjectsHint: "Четырнадцать предметов с 1 по 9 класс, в каждом курсы от самых лёгких до самых сложных.",
  allCourses: "Все курсы",
  featuresTitle: "Что здесь есть",
  features: [
    { key: "courses", title: "Курсы и тесты", text: "Тренируйся по темам и проверяй себя в тесте как в школе, с объяснением каждого ответа.", cta: "Смотреть курсы" },
    { key: "games", title: "Игры за баллы", text: "Защита галактики, Лабиринт призраков, Падающие блоки и классика: кроссворд, филворд и мемори. За верные ответы — баллы.", cta: "Попробовать" },
    { key: "escape", title: "Квесты", text: "Решай загадки, ищи предметы и выбирайся из лаборатории, пока не вышло время.", cta: "В квест" },
    { key: "boards", title: "Рейтинги", text: "Сравнивай себя с одноклассниками, своей школой и другими школами страны.", cta: "Рейтинги" },
  ],
  stepsTitle: "Как это работает",
  steps: [
    { title: "Выбери курс", text: "По предмету и классу. В каждом курсе пять уровней сложности." },
    { title: "Учись играя", text: "За правильные ответы получай баллы и открывай улучшения." },
    { title: "Расти", text: "Получай XP, уровни, новые аватары и звания." },
  ],
  progressTitle: "Твой прогресс",
  progressGuest: "Зарегистрируйся бесплатно и сохраняй баллы, уровни и время в квестах.",
  progressLevel: "Уровень",
  progressNext: "До следующего уровня осталось {n} XP",
  progressPoints: "Баллы",
  continueLearning: "Продолжить обучение",
  openProfile: "Открыть профиль",
  about: {
    title: "О нас",
    lead: "Učíme se hrou («Учимся играя») — образовательный сайт для учеников с 1 по 9 класс. Мы считаем, что лучше всего учиться тогда, когда это интересно. Поэтому мы сочетаем тренировку с играми, баллами и небольшими заданиями, а к каждому ответу есть объяснение.",
    points: [
      { title: "Что мы делаем", text: "Создаём курсы и тесты по четырнадцати предметам с 1 по 9 класс, в каждом пять уровней сложности." },
      { title: "Почему через игру", text: "Верные ответы приносят баллы, открывают улучшения и помогают подниматься на уровень выше. Учёба становится похожа на игру, а не на обязанность." },
      { title: "Для кого", text: "Для учеников, родителей и учителей. Регистрация бесплатна, а баллы, уровни и время в квестах сохраняются в твоём аккаунте." },
    ],
    contact: "Напиши нам",
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Команда",
    team: [
      { name: "Natálie Majerová", role: "Маркетинг-менеджер" },
      { name: "Lukáš Tomášek", role: "Главный разработчик" },
      { name: "Lukáš Záhorský", role: "Инноватор" },
    ],
  },
};

const texts: Record<Locale, HomeText> = { cs, en, de, ru };

export function getHomeText(locale: Locale): HomeText {
  return texts[locale];
}
