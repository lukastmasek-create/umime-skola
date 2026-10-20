import type { Locale } from "./config";
import type { CategorySlug, LanguageCode } from "@/lib/taxonomy";

export type Dictionary = {
  nav: {
    login: string;
    register: string;
    shop: string;
    settings: string;
  };
  home: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    browseCourses: string;
    createAccount: string;
    pickSection: string;
    pointsTitle: string;
    pointsDesc: string;
    pointsBadge: string;
  };
  categories: Record<CategorySlug, { label: string; description: string }>;
  kurzyPage: {
    title: string;
    subtitle: string;
    openCourse: string;
  };
  category: {
    allLanguages: string;
    noCourses: string;
    noCoursesFiltered: string;
    viewLevels: string;
  };
  languages: Record<LanguageCode, string>;
  course: {
    backToCategory: string;
    levelsTitle: string;
    levelsSubtitle: string;
    level: string;
    comingSoon: string;
    locked: string;
    moreLevelsSoon: string;
    notFound: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      error: string;
    };
    register: {
      title: string;
      subtitle: string;
      name: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      genericError: string;
    };
  };
  footer: {
    rights: string;
  };
  shop: {
    title: string;
    subtitle: string;
    yourPoints: string;
    wheelTitle: string;
    wheelDesc: string;
    spinButton: string;
    spinning: string;
    spinAgainIn: string;
    loginToSpin: string;
    wonPrefix: string;
    pointsSuffix: string;
    buyTitle: string;
    buyDesc: string;
    buyButton: string;
    comingSoon: string;
    mostPopular: string;
  };
  settings: {
    title: string;
    subtitle: string;
    appearance: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    fontStyle: string;
    fontPlayful: string;
    fontClassic: string;
    fontSize: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    language: string;
    saved: string;
  };
  templates: {
    title: string;
    subtitle: string;
    pickThisOne: string;
    picked: string;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanationTitle: string;
    explanation: string;
    templateA: { name: string; tagline: string };
    templateB: { name: string; tagline: string };
    templateC: { name: string; tagline: string };
    checkAnswer: string;
    correct: string;
    incorrect: string;
    nextQuestion: string;
  };
};

const cs: Dictionary = {
  nav: {
    login: "Přihlásit se",
    register: "Registrace",
    shop: "Obchod",
    settings: "Nastavení",
  },
  home: {
    badge: "🚀 Nová platforma pro přípravu",
    titleLine1: "Připrav se na",
    titleLine2: "základku, střední, přijímačky i maturitu",
    subtitle:
      "Sbírej body za dokončené lekce, sleduj svůj postup a uč se v jazyce, který právě potřebuješ.",
    browseCourses: "Prohlédnout kurzy",
    createAccount: "Vytvořit účet",
    pickSection: "Vyber si svou sekci",
    pointsTitle: "Bodový systém",
    pointsDesc:
      "Za každou dokončenou lekci nebo cvičení získáš body. Sleduj svůj postup a odemykej další odměny, jak budou přibývat.",
    pointsBadge: "bodů",
  },
  categories: {
    zakladni: {
      label: "Základní škola",
      description: "Kurzy a procvičování pro žáky základních škol.",
    },
    stredni: {
      label: "Střední škola",
      description: "Látka a příprava pro studenty středních škol.",
    },
    prijimacky: {
      label: "Přijímačky",
      description: "Příprava na přijímací zkoušky na střední školy.",
    },
    maturita: {
      label: "Maturita",
      description: "Příprava na maturitní zkoušku ze všech předmětů.",
    },
  },
  kurzyPage: {
    title: "Kurzy",
    subtitle: "Vyber si sekci, kterou se chceš učit.",
    openCourse: "Zobrazit levely",
  },
  category: {
    allLanguages: "Všechny jazyky",
    noCourses: "V téhle sekci zatím nejsou žádné publikované kurzy.",
    noCoursesFiltered:
      "V téhle sekci zatím nejsou žádné publikované kurzy pro zvolený jazyk.",
    viewLevels: "Otevřít kurz →",
  },
  languages: { CJ: "Čeština", NJ: "Němčina", RS: "Ruština", AJ: "Angličtina" },
  course: {
    backToCategory: "Zpět na sekci",
    levelsTitle: "Levely",
    levelsSubtitle:
      "Kurz je rozdělený na levely, kterými postupně projdeš. Obsah se bude průběžně doplňovat.",
    level: "Level",
    comingSoon: "Obsah brzy přibude",
    locked: "Uzamčeno",
    moreLevelsSoon: "Další levely přibydou postupně ✨",
    notFound: "Kurz nebyl nalezen.",
  },
  auth: {
    login: {
      title: "Přihlášení",
      subtitle: "Vítej zpátky! Pokračuj tam, kde jsi skončil.",
      email: "Email",
      password: "Heslo",
      submit: "Přihlásit se",
      submitting: "Přihlašování…",
      error: "Nesprávný email nebo heslo.",
    },
    register: {
      title: "Registrace",
      subtitle: "Založ si účet a začni sbírat body hned od první lekce.",
      name: "Jméno",
      email: "Email",
      password: "Heslo",
      submit: "Vytvořit účet",
      submitting: "Vytváření účtu…",
      genericError: "Registrace se nezdařila.",
    },
  },
  footer: { rights: "Umíme" },
  shop: {
    title: "Obchod",
    subtitle: "Roztoč kolo štěstí nebo si přikup body a odemkni si odměny rychleji.",
    yourPoints: "Tvoje body",
    wheelTitle: "🎡 Kolo štěstí",
    wheelDesc: "Jednou denně zdarma zatoč a vyhraj body navíc.",
    spinButton: "Roztočit kolo",
    spinning: "Točí se…",
    spinAgainIn: "Další zatočení za",
    loginToSpin: "Pro zatočení se musíš nejdřív přihlásit.",
    wonPrefix: "Vyhrál/a jsi",
    pointsSuffix: "bodů",
    buyTitle: "💎 Dokoupit body",
    buyDesc: "Body si můžeš i koupit a použít je na odemčení odměn.",
    buyButton: "Koupit",
    comingSoon: "Platba brzy dostupná",
    mostPopular: "Nejoblíbenější",
  },
  settings: {
    title: "Nastavení",
    subtitle: "Uprav si vzhled stránky podle sebe.",
    appearance: "Vzhled",
    theme: "Motiv",
    themeLight: "Světlý",
    themeDark: "Tmavý",
    themeSystem: "Podle systému",
    fontStyle: "Styl písma",
    fontPlayful: "Hravé",
    fontClassic: "Klasické",
    fontSize: "Velikost písma",
    fontSizeSmall: "Malé",
    fontSizeMedium: "Střední",
    fontSizeLarge: "Velké",
    language: "Jazyk stránky",
    saved: "Uloženo ✓",
  },
  templates: {
    title: "Šablony cvičení",
    subtitle:
      "Vyber si, jak mají vypadat cvičení v kurzech. U každé odpovědi bude vždycky vysvětlení, proč je správná.",
    pickThisOne: "Vybrat tuto šablonu",
    picked: "Vybráno ✓",
    question: "Které město je hlavní město Francie?",
    options: ["Paříž", "Londýn", "Berlín", "Madrid"],
    correctIndex: 0,
    explanationTitle: "Proč je to správně",
    explanation:
      "Paříž je hlavní město Francie už od 12. století — sídlí tam prezident i parlament. Londýn je hlavní město Spojeného království, Berlín Německa a Madrid Španělska.",
    templateA: { name: "Šablona A — Karty", tagline: "Klasické karty s možnostmi na výběr" },
    templateB: { name: "Šablona B — Na celou obrazovku", tagline: "Jedna otázka přes celou obrazovku, jako v Duolingu" },
    templateC: { name: "Šablona C — Kompaktní seznam", tagline: "Rychlý přehledný seznam možností" },
    checkAnswer: "Zkontrolovat",
    correct: "Správně! 🎉",
    incorrect: "Zkus to znovu",
    nextQuestion: "Další otázka →",
  },
};

const en: Dictionary = {
  nav: {
    login: "Log in",
    register: "Sign up",
    shop: "Shop",
    settings: "Settings",
  },
  home: {
    badge: "🚀 A new way to prep",
    titleLine1: "Get ready for",
    titleLine2: "primary school, high school, entrance exams and finals",
    subtitle:
      "Earn points for finished lessons, track your progress, and learn in the language you need right now.",
    browseCourses: "Browse courses",
    createAccount: "Create an account",
    pickSection: "Pick your section",
    pointsTitle: "Points system",
    pointsDesc:
      "Earn points for every finished lesson or exercise. Track your progress and unlock more rewards as they roll out.",
    pointsBadge: "points",
  },
  categories: {
    zakladni: {
      label: "Primary school",
      description: "Courses and practice for primary school students.",
    },
    stredni: {
      label: "High school",
      description: "Material and prep for high school students.",
    },
    prijimacky: {
      label: "Entrance exams",
      description: "Prep for high school entrance exams.",
    },
    maturita: {
      label: "Final exams",
      description: "Prep for final exams (maturita) in every subject.",
    },
  },
  kurzyPage: {
    title: "Courses",
    subtitle: "Pick the section you want to learn.",
    openCourse: "View levels",
  },
  category: {
    allLanguages: "All languages",
    noCourses: "There are no published courses in this section yet.",
    noCoursesFiltered:
      "There are no published courses in this section for the selected language yet.",
    viewLevels: "Open course →",
  },
  languages: { CJ: "Czech", NJ: "German", RS: "Russian", AJ: "English" },
  course: {
    backToCategory: "Back to section",
    levelsTitle: "Levels",
    levelsSubtitle:
      "The course is split into levels you'll work through step by step. Content will be added gradually.",
    level: "Level",
    comingSoon: "Content coming soon",
    locked: "Locked",
    moreLevelsSoon: "More levels are coming, one at a time ✨",
    notFound: "Course not found.",
  },
  auth: {
    login: {
      title: "Log in",
      subtitle: "Welcome back! Pick up right where you left off.",
      email: "Email",
      password: "Password",
      submit: "Log in",
      submitting: "Logging in…",
      error: "Incorrect email or password.",
    },
    register: {
      title: "Sign up",
      subtitle: "Create an account and start earning points from lesson one.",
      name: "Name",
      email: "Email",
      password: "Password",
      submit: "Create account",
      submitting: "Creating account…",
      genericError: "Registration failed.",
    },
  },
  footer: { rights: "Umíme" },
  shop: {
    title: "Shop",
    subtitle: "Spin the wheel of fortune or buy extra points to unlock rewards faster.",
    yourPoints: "Your points",
    wheelTitle: "🎡 Wheel of fortune",
    wheelDesc: "Spin once a day for free and win bonus points.",
    spinButton: "Spin the wheel",
    spinning: "Spinning…",
    spinAgainIn: "Next spin in",
    loginToSpin: "Log in first to spin the wheel.",
    wonPrefix: "You won",
    pointsSuffix: "points",
    buyTitle: "💎 Buy more points",
    buyDesc: "You can also buy points and use them to unlock rewards.",
    buyButton: "Buy",
    comingSoon: "Checkout coming soon",
    mostPopular: "Most popular",
  },
  settings: {
    title: "Settings",
    subtitle: "Tune the site's look to your taste.",
    appearance: "Appearance",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    fontStyle: "Font style",
    fontPlayful: "Playful",
    fontClassic: "Classic",
    fontSize: "Font size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    language: "Site language",
    saved: "Saved ✓",
  },
  templates: {
    title: "Exercise templates",
    subtitle:
      "Pick how exercises in the courses should look. Every answer will always come with an explanation of why it's correct.",
    pickThisOne: "Pick this template",
    picked: "Picked ✓",
    question: "Which city is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctIndex: 0,
    explanationTitle: "Why this is correct",
    explanation:
      "Paris has been the capital of France since the 12th century — it's home to the president and parliament. London is the capital of the UK, Berlin of Germany, and Madrid of Spain.",
    templateA: { name: "Template A — Cards", tagline: "Classic cards with answer choices" },
    templateB: { name: "Template B — Full screen", tagline: "One question at a time, full screen, Duolingo-style" },
    templateC: { name: "Template C — Compact list", tagline: "A quick, tidy list of choices" },
    checkAnswer: "Check answer",
    correct: "Correct! 🎉",
    incorrect: "Try again",
    nextQuestion: "Next question →",
  },
};

const de: Dictionary = {
  nav: {
    login: "Anmelden",
    register: "Registrieren",
    shop: "Shop",
    settings: "Einstellungen",
  },
  home: {
    badge: "🚀 Eine neue Plattform zum Lernen",
    titleLine1: "Bereite dich vor auf",
    titleLine2: "Grundschule, Mittelschule, Aufnahmeprüfungen und Abitur",
    subtitle:
      "Sammle Punkte für abgeschlossene Lektionen, verfolge deinen Fortschritt und lerne in der Sprache, die du gerade brauchst.",
    browseCourses: "Kurse ansehen",
    createAccount: "Konto erstellen",
    pickSection: "Wähle deinen Bereich",
    pointsTitle: "Punktesystem",
    pointsDesc:
      "Für jede abgeschlossene Lektion oder Übung erhältst du Punkte. Verfolge deinen Fortschritt und schalte weitere Belohnungen frei.",
    pointsBadge: "Punkte",
  },
  categories: {
    zakladni: {
      label: "Grundschule",
      description: "Kurse und Übungen für Grundschüler.",
    },
    stredni: {
      label: "Mittelschule",
      description: "Lernstoff und Vorbereitung für Mittelschüler.",
    },
    prijimacky: {
      label: "Aufnahmeprüfungen",
      description: "Vorbereitung auf die Aufnahmeprüfungen weiterführender Schulen.",
    },
    maturita: {
      label: "Abitur",
      description: "Vorbereitung auf die Abiturprüfung in allen Fächern.",
    },
  },
  kurzyPage: {
    title: "Kurse",
    subtitle: "Wähle den Bereich, in dem du lernen möchtest.",
    openCourse: "Levels ansehen",
  },
  category: {
    allLanguages: "Alle Sprachen",
    noCourses: "In diesem Bereich gibt es noch keine veröffentlichten Kurse.",
    noCoursesFiltered:
      "In diesem Bereich gibt es noch keine veröffentlichten Kurse für die gewählte Sprache.",
    viewLevels: "Kurs öffnen →",
  },
  languages: { CJ: "Tschechisch", NJ: "Deutsch", RS: "Russisch", AJ: "Englisch" },
  course: {
    backToCategory: "Zurück zum Bereich",
    levelsTitle: "Levels",
    levelsSubtitle:
      "Der Kurs ist in Levels unterteilt, die du nach und nach durchgehst. Inhalte werden laufend ergänzt.",
    level: "Level",
    comingSoon: "Inhalt folgt bald",
    locked: "Gesperrt",
    moreLevelsSoon: "Weitere Levels folgen nach und nach ✨",
    notFound: "Kurs nicht gefunden.",
  },
  auth: {
    login: {
      title: "Anmelden",
      subtitle: "Willkommen zurück! Mach dort weiter, wo du aufgehört hast.",
      email: "E-Mail",
      password: "Passwort",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      error: "Falsche E-Mail oder falsches Passwort.",
    },
    register: {
      title: "Registrieren",
      subtitle: "Erstelle ein Konto und sammle Punkte schon ab der ersten Lektion.",
      name: "Name",
      email: "E-Mail",
      password: "Passwort",
      submit: "Konto erstellen",
      submitting: "Konto wird erstellt…",
      genericError: "Registrierung fehlgeschlagen.",
    },
  },
  footer: { rights: "Umíme" },
  shop: {
    title: "Shop",
    subtitle: "Dreh das Glücksrad oder kauf dir Punkte dazu, um Belohnungen schneller freizuschalten.",
    yourPoints: "Deine Punkte",
    wheelTitle: "🎡 Glücksrad",
    wheelDesc: "Einmal am Tag kostenlos drehen und Bonuspunkte gewinnen.",
    spinButton: "Rad drehen",
    spinning: "Dreht sich…",
    spinAgainIn: "Nächste Drehung in",
    loginToSpin: "Melde dich zuerst an, um das Rad zu drehen.",
    wonPrefix: "Du hast gewonnen:",
    pointsSuffix: "Punkte",
    buyTitle: "💎 Punkte kaufen",
    buyDesc: "Du kannst Punkte auch kaufen und sie zum Freischalten von Belohnungen nutzen.",
    buyButton: "Kaufen",
    comingSoon: "Bezahlung folgt bald",
    mostPopular: "Am beliebtesten",
  },
  settings: {
    title: "Einstellungen",
    subtitle: "Passe das Aussehen der Seite nach deinem Geschmack an.",
    appearance: "Erscheinungsbild",
    theme: "Modus",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "Systemeinstellung",
    fontStyle: "Schriftstil",
    fontPlayful: "Verspielt",
    fontClassic: "Klassisch",
    fontSize: "Schriftgröße",
    fontSizeSmall: "Klein",
    fontSizeMedium: "Mittel",
    fontSizeLarge: "Groß",
    language: "Sprache der Seite",
    saved: "Gespeichert ✓",
  },
  templates: {
    title: "Übungsvorlagen",
    subtitle:
      "Wähle, wie Übungen in den Kursen aussehen sollen. Zu jeder Antwort gibt es immer eine Erklärung, warum sie richtig ist.",
    pickThisOne: "Diese Vorlage wählen",
    picked: "Ausgewählt ✓",
    question: "Welche Stadt ist die Hauptstadt von Frankreich?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctIndex: 0,
    explanationTitle: "Warum das richtig ist",
    explanation:
      "Paris ist seit dem 12. Jahrhundert die Hauptstadt Frankreichs — dort sitzen Präsident und Parlament. London ist die Hauptstadt des Vereinigten Königreichs, Berlin die von Deutschland und Madrid die von Spanien.",
    templateA: { name: "Vorlage A — Karten", tagline: "Klassische Karten mit Antwortmöglichkeiten" },
    templateB: { name: "Vorlage B — Vollbild", tagline: "Eine Frage nach der anderen, im Duolingo-Stil" },
    templateC: { name: "Vorlage C — Kompakte Liste", tagline: "Eine schnelle, übersichtliche Liste" },
    checkAnswer: "Antwort prüfen",
    correct: "Richtig! 🎉",
    incorrect: "Versuch's nochmal",
    nextQuestion: "Nächste Frage →",
  },
};

const ru: Dictionary = {
  nav: {
    login: "Войти",
    register: "Регистрация",
    shop: "Магазин",
    settings: "Настройки",
  },
  home: {
    badge: "🚀 Новая платформа для подготовки",
    titleLine1: "Готовься к",
    titleLine2: "начальной, средней школе, вступительным экзаменам и выпускным",
    subtitle:
      "Получай баллы за пройденные уроки, следи за прогрессом и учись на том языке, который нужен именно сейчас.",
    browseCourses: "Посмотреть курсы",
    createAccount: "Создать аккаунт",
    pickSection: "Выбери свой раздел",
    pointsTitle: "Система баллов",
    pointsDesc:
      "За каждый пройденный урок или упражнение ты получаешь баллы. Следи за прогрессом и открывай новые награды по мере их появления.",
    pointsBadge: "баллов",
  },
  categories: {
    zakladni: {
      label: "Начальная школа",
      description: "Курсы и упражнения для учеников начальной школы.",
    },
    stredni: {
      label: "Средняя школа",
      description: "Материал и подготовка для учеников средней школы.",
    },
    prijimacky: {
      label: "Вступительные экзамены",
      description: "Подготовка к вступительным экзаменам в среднюю школу.",
    },
    maturita: {
      label: "Выпускные экзамены",
      description: "Подготовка к выпускным экзаменам по всем предметам.",
    },
  },
  kurzyPage: {
    title: "Курсы",
    subtitle: "Выбери раздел, который хочешь изучать.",
    openCourse: "Смотреть уровни",
  },
  category: {
    allLanguages: "Все языки",
    noCourses: "В этом разделе пока нет опубликованных курсов.",
    noCoursesFiltered:
      "В этом разделе пока нет опубликованных курсов для выбранного языка.",
    viewLevels: "Открыть курс →",
  },
  languages: { CJ: "Чешский", NJ: "Немецкий", RS: "Русский", AJ: "Английский" },
  course: {
    backToCategory: "Назад к разделу",
    levelsTitle: "Уровни",
    levelsSubtitle:
      "Курс разделён на уровни, которые ты проходишь по порядку. Контент будет добавляться постепенно.",
    level: "Уровень",
    comingSoon: "Контент скоро появится",
    locked: "Заблокировано",
    moreLevelsSoon: "Новые уровни будут добавляться постепенно ✨",
    notFound: "Курс не найден.",
  },
  auth: {
    login: {
      title: "Вход",
      subtitle: "С возвращением! Продолжи с того места, где остановился.",
      email: "Email",
      password: "Пароль",
      submit: "Войти",
      submitting: "Выполняется вход…",
      error: "Неверный email или пароль.",
    },
    register: {
      title: "Регистрация",
      subtitle: "Создай аккаунт и начни получать баллы с первого урока.",
      name: "Имя",
      email: "Email",
      password: "Пароль",
      submit: "Создать аккаунт",
      submitting: "Создание аккаунта…",
      genericError: "Регистрация не удалась.",
    },
  },
  footer: { rights: "Umíme" },
  shop: {
    title: "Магазин",
    subtitle: "Крути колесо фортуны или покупай баллы, чтобы быстрее открывать награды.",
    yourPoints: "Твои баллы",
    wheelTitle: "🎡 Колесо фортуны",
    wheelDesc: "Крути раз в день бесплатно и выигрывай бонусные баллы.",
    spinButton: "Крутить колесо",
    spinning: "Крутится…",
    spinAgainIn: "Следующее вращение через",
    loginToSpin: "Сначала войди в аккаунт, чтобы крутить колесо.",
    wonPrefix: "Ты выиграл(а)",
    pointsSuffix: "баллов",
    buyTitle: "💎 Купить баллы",
    buyDesc: "Баллы можно также купить и использовать для открытия наград.",
    buyButton: "Купить",
    comingSoon: "Оплата скоро появится",
    mostPopular: "Самый популярный",
  },
  settings: {
    title: "Настройки",
    subtitle: "Настрой внешний вид сайта под себя.",
    appearance: "Внешний вид",
    theme: "Тема",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    themeSystem: "Как в системе",
    fontStyle: "Стиль шрифта",
    fontPlayful: "Игривый",
    fontClassic: "Классический",
    fontSize: "Размер шрифта",
    fontSizeSmall: "Маленький",
    fontSizeMedium: "Средний",
    fontSizeLarge: "Крупный",
    language: "Язык сайта",
    saved: "Сохранено ✓",
  },
  templates: {
    title: "Шаблоны упражнений",
    subtitle:
      "Выбери, как должны выглядеть упражнения в курсах. К каждому ответу всегда будет объяснение, почему он правильный.",
    pickThisOne: "Выбрать этот шаблон",
    picked: "Выбрано ✓",
    question: "Какой город является столицей Франции?",
    options: ["Париж", "Лондон", "Берлин", "Мадрид"],
    correctIndex: 0,
    explanationTitle: "Почему это правильно",
    explanation:
      "Париж является столицей Франции с XII века — там находятся резиденция президента и парламент. Лондон — столица Великобритании, Берлин — Германии, а Мадрид — Испании.",
    templateA: { name: "Шаблон A — Карточки", tagline: "Классические карточки с вариантами ответа" },
    templateB: { name: "Шаблон B — На весь экран", tagline: "По одному вопросу на весь экран, как в Duolingo" },
    templateC: { name: "Шаблон C — Компактный список", tagline: "Быстрый и аккуратный список вариантов" },
    checkAnswer: "Проверить ответ",
    correct: "Правильно! 🎉",
    incorrect: "Попробуй ещё раз",
    nextQuestion: "Следующий вопрос →",
  },
};

const dictionaries: Record<Locale, Dictionary> = { cs, en, de, ru };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
