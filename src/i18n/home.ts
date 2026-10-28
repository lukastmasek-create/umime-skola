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
  subjectsHint: "Devět předmětů od 1. do 9. třídy, každý s kurzy od nejsnazších po nejtěžší.",
  allCourses: "Všechny kurzy",
  featuresTitle: "Co tu najdeš",
  features: [
    { key: "courses", title: "Kurzy a testy", text: "Procvičuj po tématech a ověř se v testu jako ve škole, s vysvětlením každé odpovědi.", cta: "Prohlédnout kurzy" },
    { key: "games", title: "Hry za body", text: "Kosmičtí vetřelci, Pac-Man, Tetris i klasiky jako osmisměrka, spojování a pexeso. Za správné odpovědi sbíráš body.", cta: "Vyzkoušet" },
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
  subjectsHint: "Nine subjects from grade 1 to 9, each with courses from the easiest to the hardest.",
  allCourses: "All courses",
  featuresTitle: "What you'll find here",
  features: [
    { key: "courses", title: "Courses and tests", text: "Practise by topic and check yourself in a school-style test, with an explanation for every answer.", cta: "Browse courses" },
    { key: "games", title: "Games for points", text: "Space invaders, Pac-Man, Tetris and classics like word search, matching and memory. Right answers earn you points.", cta: "Try it" },
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
  subjectsHint: "Neun Fächer von der 1. bis zur 9. Klasse, jedes mit Kursen vom leichtesten bis zum schwersten.",
  allCourses: "Alle Kurse",
  featuresTitle: "Das findest du hier",
  features: [
    { key: "courses", title: "Kurse und Tests", text: "Übe nach Themen und teste dich wie in der Schule, mit Erklärung zu jeder Antwort.", cta: "Kurse ansehen" },
    { key: "games", title: "Spiele für Punkte", text: "Space Invaders, Pac-Man, Tetris und Klassiker wie Wortsuche, Zuordnen und Memory. Für richtige Antworten gibt es Punkte.", cta: "Ausprobieren" },
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
  subjectsHint: "Девять предметов с 1 по 9 класс, в каждом курсы от самых лёгких до самых сложных.",
  allCourses: "Все курсы",
  featuresTitle: "Что здесь есть",
  features: [
    { key: "courses", title: "Курсы и тесты", text: "Тренируйся по темам и проверяй себя в тесте как в школе, с объяснением каждого ответа.", cta: "Смотреть курсы" },
    { key: "games", title: "Игры за баллы", text: "Космические захватчики и Марио с черепахами, где нужно попадать в правильные ответы.", cta: "Попробовать" },
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
};

const texts: Record<Locale, HomeText> = { cs, en, de, ru };

export function getHomeText(locale: Locale): HomeText {
  return texts[locale];
}
