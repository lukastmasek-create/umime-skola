import { withFallbacks } from "./config";
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
    why: { title: string; text: string };
    problem: { title: string; text: string };
    teamTitle: string;
    team: { name: string; role: string; bio: string }[];
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
    { key: "games", title: "Hry, které nikdy nekončí", text: "Stav si farmu, město a základnu a starej se o mazlíčky. Body za učení v nich pracují dál.", cta: "Zahrát si" },
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
    why: {
      title: "Proč to děláme",
      text: "Věříme, že se děti učí nejlépe, když je to baví a když vidí, že jejich úsilí má smysl. Chceme, aby procvičování bylo něco, na co se těší, a ne úkol, kterému se chtějí vyhnout.",
    },
    problem: {
      title: "Co řešíme",
      text: "Učivo se upevní hlavně procvičováním, ale běžná cvičení bývají nudná a bez zpětné vazby. Spojujeme kurzy, testy s vysvětlením každé odpovědi a hry, za které se sbírají body, aby učení dávalo smysl a bavilo.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Tým",
    team: [
      { name: "Natálie Majerová", role: "Marketing Manažer", bio: "Stará se o marketing a o to, aby se web dostal k dětem, rodičům a učitelům." },
      { name: "Lukáš Tomášek", role: "Hlavní Developer", bio: "Vede vývoj platformy, od kurzů a her po účty a žebříčky." },
      { name: "Lukáš Záhorský", role: "Inovátor", bio: "Přichází s novými nápady na hry a způsoby učení." },
      { name: "Ondra Vrba", role: "Tester / programátor", bio: "Testuje kurzy, hry a únikovky, aby všechno fungovalo tak, jak má." },
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
    { key: "games", title: "Games that never end", text: "Build a farm, a city and a base and look after pets. The points you earn from learning keep working for you.", cta: "Play" },
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
    why: {
      title: "Why we do it",
      text: "We believe children learn best when it's fun and when they see their effort pays off. We want practice to be something kids look forward to, not a chore they avoid.",
    },
    problem: {
      title: "What we're solving",
      text: "Practice is what makes knowledge stick, but ordinary exercises are often boring and give no feedback. We combine courses, tests with an explanation for every answer and games that earn points, so learning makes sense and is enjoyable.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Team",
    team: [
      { name: "Natálie Majerová", role: "Marketing Manager", bio: "Looks after marketing and makes sure the site reaches kids, parents and teachers." },
      { name: "Lukáš Tomášek", role: "Lead Developer", bio: "Leads the platform's development, from courses and games to accounts and leaderboards." },
      { name: "Lukáš Záhorský", role: "Innovator", bio: "Brings new ideas for games and ways of learning." },
      { name: "Ondra Vrba", role: "Tester / Programmer", bio: "Tests courses, games and escape rooms so that everything works as it should." },
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
    { key: "games", title: "Spiele, die nie enden", text: "Baue eine Farm, eine Stadt und eine Basis und kümmere dich um Haustiere. Deine Lernpunkte arbeiten dort weiter für dich.", cta: "Spielen" },
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
    why: {
      title: "Warum wir das machen",
      text: "Wir glauben, dass Kinder am besten lernen, wenn es Spaß macht und sie sehen, dass sich ihr Einsatz lohnt. Üben soll etwas sein, auf das man sich freut, und keine Pflicht, der man aus dem Weg geht.",
    },
    problem: {
      title: "Was wir lösen",
      text: "Üben festigt das Wissen, aber gewöhnliche Aufgaben sind oft langweilig und geben kein Feedback. Wir verbinden Kurse, Tests mit Erklärung zu jeder Antwort und Spiele, für die es Punkte gibt, damit Lernen Sinn ergibt und Freude macht.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Team",
    team: [
      { name: "Natálie Majerová", role: "Marketing-Managerin", bio: "Kümmert sich um Marketing und darum, dass die Seite Kinder, Eltern und Lehrkräfte erreicht." },
      { name: "Lukáš Tomášek", role: "Hauptentwickler", bio: "Leitet die Entwicklung der Plattform, von Kursen und Spielen bis zu Konten und Ranglisten." },
      { name: "Lukáš Záhorský", role: "Innovator", bio: "Bringt neue Ideen für Spiele und Lernweisen ein." },
      { name: "Ondra Vrba", role: "Tester / Programmierer", bio: "Testet Kurse, Spiele und Escape Rooms, damit alles so funktioniert, wie es soll." },
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
    { key: "games", title: "Игры, которые не кончаются", text: "Строй ферму, город и базу и заботься о питомцах. Баллы за учёбу продолжают работать на тебя.", cta: "Играть" },
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
    why: {
      title: "Зачем мы это делаем",
      text: "Мы верим, что дети лучше всего учатся, когда это интересно и когда видно, что усилия окупаются. Мы хотим, чтобы тренировка была тем, чего ждут, а не обязанностью, от которой хочется уйти.",
    },
    problem: {
      title: "Какую проблему решаем",
      text: "Тренировка закрепляет знания, но обычные упражнения часто скучны и не дают обратной связи. Мы соединяем курсы, тесты с объяснением каждого ответа и игры, за которые начисляются баллы, чтобы учиться было понятно и интересно.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Команда",
    team: [
      { name: "Natálie Majerová", role: "Маркетинг-менеджер", bio: "Отвечает за маркетинг и за то, чтобы сайт дошёл до детей, родителей и учителей." },
      { name: "Lukáš Tomášek", role: "Главный разработчик", bio: "Руководит разработкой платформы: от курсов и игр до аккаунтов и рейтингов." },
      { name: "Lukáš Záhorský", role: "Инноватор", bio: "Приносит новые идеи для игр и способов обучения." },
      { name: "Ondra Vrba", role: "Тестировщик / программист", bio: "Тестирует курсы, игры и квесты, чтобы всё работало как надо." },
    ],
  },
};

const uk: HomeText = {
  more: "Ще",
  menu: "Меню",
  closeMenu: "Закрити меню",
  learn: "Навчання",
  play: "Ігри та спільнота",
  groups: { courses: "Курси", settings: "Налаштування", games: "Ігри", shop: "Магазин", study: "Навчання", extras: "Додатково", together: "Грати разом", boards: "Таблиці лідерів" },
  languages: "Мови",
  index: "Колекція карток",
  subjectsTitle: "Обери предмет",
  subjectsHint: "Чотирнадцять предметів від 1 до 9 класу, у кожному курси від найлегших до найскладніших.",
  allCourses: "Усі курси",
  featuresTitle: "Що тут є",
  features: [
    { key: "courses", title: "Курси та тести", text: "Тренуйся за темами і перевір себе шкільним тестом, до кожної відповіді є пояснення.", cta: "Переглянути курси" },
    { key: "games", title: "Ігри, що не закінчуються", text: "Будуй ферму, місто і базу та доглядай за улюбленцями. Бали за навчання працюють на тебе далі.", cta: "Грати" },
    { key: "escape", title: "Квести-втечі", text: "Розв'язуй головоломки, знаходь предмети і втеч з лабораторії, поки не закінчився час.", cta: "Увійти" },
    { key: "boards", title: "Таблиці лідерів", text: "Порівнюй себе з однокласниками, своєю школою та іншими школами по країні.", cta: "Таблиці лідерів" },
  ],
  stepsTitle: "Як це працює",
  steps: [
    { title: "Обери курс", text: "За предметом і класом. Кожен курс має п'ять рівнів складності." },
    { title: "Тренуйся, граючи", text: "Отримуй бали за правильні відповіді та відкривай покращення." },
    { title: "Прокачуйся", text: "Здобувай досвід, рівні, нові аватари та звання." },
  ],
  progressTitle: "Твій прогрес",
  progressGuest: "Зареєструйся безкоштовно, щоб зберегти бали, рівні та час у квестах-втечах.",
  progressLevel: "Рівень",
  progressNext: "До наступного рівня: {n} XP",
  progressPoints: "Бали",
  continueLearning: "Продовжити навчання",
  openProfile: "Відкрити профіль",
  about: {
    title: "Про нас",
    lead: "Učíme se hrou (Вчимося грою) — освітній сайт для учнів 1–9 класів. Ми вважаємо, що найкраще вчаться тоді, коли це приносить задоволення, тому поєднуємо практику з іграми, балами та невеликими завданнями, а до кожної відповіді є пояснення.",
    points: [
      { title: "Що ми робимо", text: "Створюємо курси і тести для чотирнадцяти предметів 1–9 класів, у кожному п'ять рівнів складності." },
      { title: "Чому через гру", text: "Правильні відповіді приносять бали, відкривають покращення і піднімають на новий рівень. Навчання схоже на гру, а не на обов'язок." },
      { title: "Для кого це", text: "Для учнів, батьків і вчителів. Реєстрація безкоштовна, а твої бали, рівні та час у квестах-втечах зберігаються в обліковому записі." },
    ],
    contact: "Напиши нам",
    why: {
      title: "Навіщо ми це робимо",
      text: "Ми вважаємо, що діти найкраще вчаться, коли це цікаво і коли бачать, що їхні зусилля мають результат. Хочемо, щоб практика була тим, чого діти чекають, а не тим, чого уникають.",
    },
    problem: {
      title: "Яку проблему розв'язуємо",
      text: "Практика закріплює знання, але звичайні вправи часто нудні і не дають зворотного зв'язку. Ми поєднуємо курси, тести з поясненням до кожної відповіді та ігри, за які нараховуються бали, щоб навчання було зрозумілим і приємним.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Команда",
    team: [
      { name: "Natálie Majerová", role: "Маркетинг-менеджерка", bio: "Відповідає за маркетинг і стежить, щоб сайт доходив до дітей, батьків і вчителів." },
      { name: "Lukáš Tomášek", role: "Головний розробник", bio: "Керує розвитком платформи: від курсів і ігор до облікових записів і таблиць лідерів." },
      { name: "Lukáš Záhorský", role: "Інноватор", bio: "Приносить нові ідеї для ігор і способів навчання." },
      { name: "Ondra Vrba", role: "Тестувальник / програміст", bio: "Тестує курси, ігри та квести-втечі, щоб усе працювало як слід." },
    ],
  },
};

const ja: HomeText = {
  more: "もっと",
  menu: "メニュー",
  closeMenu: "メニューを閉じる",
  learn: "学習",
  play: "ゲームとコミュニティ",
  groups: { courses: "コース", settings: "設定", games: "ゲーム", shop: "ショップ", study: "学習", extras: "その他", together: "みんなで遊ぶ", boards: "ランキング" },
  languages: "言語",
  index: "カードコレクション",
  subjectsTitle: "教科を選ぶ",
  subjectsHint: "小学1年生から中学3年生までの14教科。それぞれ、やさしい順から難しい順までのコースがあります。",
  allCourses: "すべてのコース",
  featuresTitle: "ここでできること",
  features: [
    { key: "courses", title: "コースとテスト", text: "テーマごとに練習して、学校のようなテストで力試し。どの答えにも解説がつきます。", cta: "コースを見る" },
    { key: "games", title: "終わらないゲーム", text: "農場、街、基地をつくって、ペットのお世話をしよう。勉強で得たポイントがずっと働いてくれます。", cta: "遊ぶ" },
    { key: "escape", title: "脱出ルーム", text: "パズルを解き、アイテムを見つけて、時間内に研究所から脱出しよう。", cta: "入る" },
    { key: "boards", title: "ランキング", text: "クラスメイトや自分の学校、全国の他の学校と比べてみよう。", cta: "ランキングを見る" },
  ],
  stepsTitle: "使い方",
  steps: [
    { title: "コースを選ぶ", text: "教科と学年で選べます。どのコースにも5つの難易度があります。" },
    { title: "ゲームで練習", text: "正解するとポイントがたまり、パワーアップを解放できます。" },
    { title: "レベルアップ", text: "経験値（XP）をためて、レベル、新しいアバターや称号を手に入れよう。" },
  ],
  progressTitle: "あなたの進み具合",
  progressGuest: "無料登録すると、ポイント、レベル、脱出ルームの記録が保存されます。",
  progressLevel: "レベル",
  progressNext: "次のレベルまであと {n} XP",
  progressPoints: "ポイント",
  continueLearning: "学習を続ける",
  openProfile: "プロフィールを開く",
  about: {
    title: "私たちについて",
    lead: "Učíme se hrou（「遊びながら学ぼう」）は、小学1年生から中学3年生までの子どもたちのための学習サイトです。楽しいときこそ人はよく学べると考えているので、練習にゲーム、ポイント、小さなチャレンジを組み合わせ、どの答えにも解説をつけています。",
    points: [
      { title: "私たちの取り組み", text: "小学1年生から中学3年生までの14教科について、5つの難易度を持つコースとテストを作っています。" },
      { title: "なぜ遊びながら？", text: "正解するとポイントがたまり、パワーアップを解放したり、レベルが上がったりします。勉強が作業ではなく、ゲームのように感じられます。" },
      { title: "対象", text: "子どもたち、保護者、先生方。登録は無料で、ポイント、レベル、脱出ルームの記録はアカウントに保存されます。" },
    ],
    contact: "お問い合わせ",
    why: {
      title: "私たちがこれをする理由",
      text: "子どもたちは、楽しく、努力が報われると感じられるときに一番よく学べると考えています。練習を、いやいややるものではなく、楽しみにできるものにしたいのです。",
    },
    problem: {
      title: "私たちが解決したいこと",
      text: "練習は知識を定着させますが、ふつうの練習問題は退屈で、フィードバックもないことが多いものです。コース、どの答えにも解説があるテスト、ポイントがたまるゲームを組み合わせ、学びを納得でき、楽しいものにしています。",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "チーム",
    team: [
      { name: "Natálie Majerová", role: "マーケティング担当", bio: "マーケティングを担当し、子どもたち、保護者、先生方にサイトが届くよう取り組んでいます。" },
      { name: "Lukáš Tomášek", role: "リード開発者", bio: "コースやゲームからアカウントやランキングまで、プラットフォームの開発を率いています。" },
      { name: "Lukáš Záhorský", role: "イノベーター", bio: "ゲームや学びの方法に関する新しいアイデアを出しています。" },
      { name: "Ondra Vrba", role: "テスター／プログラマー", bio: "コース、ゲーム、脱出ルームをテストし、すべてが正しく動くようにしています。" },
    ],
  },
};

const es: HomeText = {
  more: "Más",
  menu: "Menú",
  closeMenu: "Cerrar menú",
  learn: "Aprender",
  play: "Juegos y comunidad",
  groups: { courses: "Cursos", settings: "Ajustes", games: "Juegos", shop: "Tienda", study: "Estudiar", extras: "Extras", together: "Jugar juntos", boards: "Clasificaciones" },
  languages: "Idiomas",
  index: "Colección de cartas",
  subjectsTitle: "Elige una asignatura",
  subjectsHint: "Catorce asignaturas de 1.º a 9.º curso, cada una con cursos desde los más fáciles hasta los más difíciles.",
  allCourses: "Todos los cursos",
  featuresTitle: "Lo que encontrarás aquí",
  features: [
    { key: "courses", title: "Cursos y pruebas", text: "Practica por temas y ponte a prueba con un examen de estilo escolar, con una explicación para cada respuesta.", cta: "Ver cursos" },
    { key: "games", title: "Juegos que nunca terminan", text: "Construye una granja, una ciudad y una base y cuida de tus mascotas. Los puntos que ganas estudiando siguen trabajando para ti.", cta: "Jugar" },
    { key: "escape", title: "Escape rooms", text: "Resuelve acertijos, encuentra objetos y escapa del laboratorio antes de que se acabe el tiempo.", cta: "Entrar" },
    { key: "boards", title: "Clasificaciones", text: "Compárate con tus compañeros, tu colegio y otros colegios de todo el país.", cta: "Clasificaciones" },
  ],
  stepsTitle: "Cómo funciona",
  steps: [
    { title: "Elige un curso", text: "Por asignatura y curso. Cada curso tiene cinco niveles de dificultad." },
    { title: "Practica jugando", text: "Gana puntos por las respuestas correctas y desbloquea mejoras." },
    { title: "Sube de nivel", text: "Consigue XP, niveles, nuevos avatares y títulos." },
  ],
  progressTitle: "Tu progreso",
  progressGuest: "Regístrate gratis para conservar tus puntos, niveles y tiempos de los escape rooms.",
  progressLevel: "Nivel",
  progressNext: "{n} XP para el siguiente nivel",
  progressPoints: "Puntos",
  continueLearning: "Seguir aprendiendo",
  openProfile: "Abrir perfil",
  about: {
    title: "Sobre nosotros",
    lead: "Učíme se hrou («Aprendemos jugando») es una web educativa para alumnos de 1.º a 9.º curso. Creemos que se aprende mejor cuando se disfruta, así que combinamos la práctica con juegos, puntos y pequeños retos, y cada respuesta viene con una explicación.",
    points: [
      { title: "Qué hacemos", text: "Creamos cursos y pruebas para catorce asignaturas de 1.º a 9.º curso, cada una con cinco niveles de dificultad." },
      { title: "Por qué jugando", text: "Las respuestas correctas dan puntos, desbloquean mejoras y te hacen subir de nivel. Aprender se siente como un juego, no como una obligación." },
      { title: "Para quién es", text: "Para alumnos, familias y docentes. El registro es gratuito, y tus puntos, niveles y tiempos de los escape rooms se guardan en tu cuenta." },
    ],
    contact: "Escríbenos",
    why: {
      title: "Por qué lo hacemos",
      text: "Creemos que los niños aprenden mejor cuando es divertido y cuando ven que su esfuerzo da frutos. Queremos que la práctica sea algo que los niños esperen con ganas, no una tarea que evitan.",
    },
    problem: {
      title: "Qué problema resolvemos",
      text: "La práctica es lo que hace que el conocimiento se quede, pero los ejercicios habituales suelen ser aburridos y no dan ningún feedback. Combinamos cursos, pruebas con explicación para cada respuesta y juegos que dan puntos, para que aprender tenga sentido y sea agradable.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Equipo",
    team: [
      { name: "Natálie Majerová", role: "Responsable de marketing", bio: "Se ocupa del marketing y de que la web llegue a niños, familias y docentes." },
      { name: "Lukáš Tomášek", role: "Desarrollador principal", bio: "Dirige el desarrollo de la plataforma, desde los cursos y juegos hasta las cuentas y las clasificaciones." },
      { name: "Lukáš Záhorský", role: "Innovador", bio: "Aporta ideas nuevas para los juegos y las formas de aprender." },
      { name: "Ondra Vrba", role: "Tester / programador", bio: "Prueba cursos, juegos y escape rooms para que todo funcione como debe." },
    ],
  },
};

const fr: HomeText = {
  more: "Plus",
  menu: "Menu",
  closeMenu: "Fermer le menu",
  learn: "Apprendre",
  play: "Jeux et communauté",
  groups: { courses: "Cours", settings: "Réglages", games: "Jeux", shop: "Boutique", study: "Étude", extras: "Extras", together: "Jouer ensemble", boards: "Classements" },
  languages: "Langues",
  index: "Collection de cartes",
  subjectsTitle: "Choisis une matière",
  subjectsHint: "Quatorze matières de la 1re à la 9e année, chacune avec des cours du plus facile au plus difficile.",
  allCourses: "Tous les cours",
  featuresTitle: "Ce que tu trouveras ici",
  features: [
    { key: "courses", title: "Cours et tests", text: "Entraîne-toi par thème et teste-toi avec un contrôle façon école, avec une explication pour chaque réponse.", cta: "Parcourir les cours" },
    { key: "games", title: "Des jeux qui ne finissent jamais", text: "Construis une ferme, une ville et une base et occupe-toi de tes animaux. Les points gagnés en apprenant continuent de travailler pour toi.", cta: "Jouer" },
    { key: "escape", title: "Escape rooms", text: "Résous des énigmes, trouve des objets et échappe-toi du laboratoire avant la fin du temps.", cta: "Entrer" },
    { key: "boards", title: "Classements", text: "Compare-toi à tes camarades, à ton école et à d'autres écoles du pays.", cta: "Classements" },
  ],
  stepsTitle: "Comment ça marche",
  steps: [
    { title: "Choisis un cours", text: "Par matière et par année. Chaque cours a cinq niveaux de difficulté." },
    { title: "Entraîne-toi en jouant", text: "Gagne des points pour les bonnes réponses et débloque des améliorations." },
    { title: "Monte de niveau", text: "Gagne de l'XP, des niveaux, de nouveaux avatars et des titres." },
  ],
  progressTitle: "Tes progrès",
  progressGuest: "Inscris-toi gratuitement pour garder tes points, tes niveaux et tes temps dans les escape rooms.",
  progressLevel: "Niveau",
  progressNext: "{n} XP avant le niveau suivant",
  progressPoints: "Points",
  continueLearning: "Continuer à apprendre",
  openProfile: "Ouvrir le profil",
  about: {
    title: "À propos de nous",
    lead: "Učíme se hrou (« On apprend en jouant ») est un site éducatif pour les élèves de la 1re à la 9e année. Nous pensons qu'on apprend mieux quand on y prend plaisir : nous associons donc l'entraînement aux jeux, aux points et à de petits défis, et chaque réponse est accompagnée d'une explication.",
    points: [
      { title: "Ce que nous faisons", text: "Nous créons des cours et des tests pour quatorze matières de la 1re à la 9e année, chacune avec cinq niveaux de difficulté." },
      { title: "Pourquoi en jouant", text: "Les bonnes réponses rapportent des points, débloquent des améliorations et font monter de niveau. Apprendre ressemble à un jeu, pas à une corvée." },
      { title: "À qui ça s'adresse", text: "Aux élèves, aux parents et aux enseignants. L'inscription est gratuite, et tes points, tes niveaux et tes temps dans les escape rooms sont enregistrés sur ton compte." },
    ],
    contact: "Écris-nous",
    why: {
      title: "Pourquoi nous le faisons",
      text: "Nous pensons que les enfants apprennent mieux quand c'est amusant et quand ils voient que leurs efforts portent leurs fruits. Nous voulons que l'entraînement soit quelque chose qu'ils attendent avec impatience, et non une corvée qu'ils évitent.",
    },
    problem: {
      title: "Le problème que nous résolvons",
      text: "L'entraînement est ce qui fixe les connaissances, mais les exercices ordinaires sont souvent ennuyeux et ne donnent aucun retour. Nous combinons des cours, des tests avec une explication pour chaque réponse et des jeux qui rapportent des points, pour que l'apprentissage ait du sens et soit agréable.",
    },
    email: "ucime.se.hrou@seznam.cz",
    teamTitle: "Équipe",
    team: [
      { name: "Natálie Majerová", role: "Responsable marketing", bio: "Elle s'occupe du marketing et veille à ce que le site atteigne les enfants, les parents et les enseignants." },
      { name: "Lukáš Tomášek", role: "Développeur principal", bio: "Il dirige le développement de la plateforme, des cours et jeux jusqu'aux comptes et aux classements." },
      { name: "Lukáš Záhorský", role: "Innovateur", bio: "Il apporte de nouvelles idées pour les jeux et les façons d'apprendre." },
      { name: "Ondra Vrba", role: "Testeur / programmeur", bio: "Il teste les cours, les jeux et les escape rooms pour que tout fonctionne comme prévu." },
    ],
  },
};

const texts: Record<Locale, HomeText> = {
  ...withFallbacks({ cs, en, de, ru }),
  uk,
  ja,
  es,
  fr,
};

export function getHomeText(locale: Locale): HomeText {
  return texts[locale];
}
