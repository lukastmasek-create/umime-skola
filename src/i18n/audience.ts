// Texty stránek „Pro učitele“ (/ucitele) a „Pro žáky“ (/zaci) ve všech jazycích webu.
import type { Locale } from "./config";

export const FEATURE_KEYS = [
  "daily",
  "courses",
  "idle",
  "escape",
  "together",
  "town",
  "team",
  "review",
  "materials",
  "boards",
  "shop",
  "profile",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

type Item = { title: string; text: string };

export type AudiencePagesText = {
  teachers: {
    nav: string;
    title: string;
    subtitle: string;
    points: Item[];
    stepsTitle: string;
    steps: Item[];
    cta: string;
    ctaHint: string;
    studentsLink: string;
    homeLink: string;
    featuresTitle: string;
    features: Item[];
    previewBadge: string;
    previewTitle: string;
    previewDue: string;
    previewCaption: string;
    faqTitle: string;
    faq: { q: string; a: string }[];
  };
  students: {
    nav: string;
    title: string;
    subtitle: string;
    cardsTitle: string;
    features: Record<FeatureKey, Item>;
    cta: string;
    ctaHint: string;
    teachersLink: string;
  };
};

const cs: AudiencePagesText = {
  teachers: {
    nav: "Pro učitele",
    title: "Pro učitele",
    subtitle: "Procvičování pro celou třídu na jednom místě. Zdarma, bez reklam a s dětským zámkem.",
    points: [
      { title: "Založ třídu za minutu", text: "Žáci se připojí kódem třídy. Přijetí schvaluješ ty, takže se k tobě nedostane nikdo cizí." },
      { title: "Zadej úkol s termínem", text: "Vyber kurz nebo test, nastav termín a komu úkol patří: celé třídě, nebo jen skupině." },
      { title: "Sleduj výsledky", text: "Přehled ukazuje, kdo úkol splnil, jak mu šel a které otázky dělají třídě potíže." },
      { title: "Bezpečné pro děti", text: "Bez reklam, s rodičovským zámkem. Registrace i všechny funkce pro učitele jsou zdarma." },
    ],
    stepsTitle: "Jak to funguje",
    steps: [
      { title: "Založ třídu", text: "V sekci Týmy založ třídu a dostaneš kód, který žáci zadají při připojení." },
      { title: "Zadej úkol", text: "Vyber kurz nebo test, nastav termín a rozhodni, pro koho úkol je." },
      { title: "Sleduj výsledky", text: "Uvidíš, kdo úkol otevřel, kdo ho splnil a kolikrát to zkoušel." },
    ],
    cta: "Založit třídu zdarma",
    ctaHint: "Stačí se zaregistrovat a v sekci Týmy vytvořit třídu.",
    studentsLink: "Jsi žák? Podívej se, co na webu najdeš →",
    homeLink: "Víc o funkcích pro učitele →",
    featuresTitle: "Co v aplikaci najdeš",
    features: [
      { title: "Třídy s kódem", text: "Každá třída má vlastní kód. Stačí ho žákům sdělit a připojí se sami." },
      { title: "Schvalování žáků", text: "Můžeš zvolit, zda se žáci připojí hned, až po tvém schválení, nebo zda je třída zavřená." },
      { title: "Úkoly pro třídu, skupinu i žáka", text: "Zadání může dostat celá třída, jedna skupina nebo jednotlivec, každé s vlastním termínem." },
      { title: "Přehled výsledků", text: "Vidíš, kdo úkol otevřel, kdo ho splnil a u kterých otázek se třída zasekává." },
      { title: "Chat třídy", text: "Krátké zprávy přímo v týmu, aby se dalo rychle domluvit." },
      { title: "Rodičovský zámek", text: "Rodiče nastaví PIN, denní limit času a mohou zakázat nákupy nebo společné hraní." },
    ],
    previewBadge: "Ukázka",
    previewTitle: "Zlomky, 5. třída",
    previewDue: "Termín: pátek",
    previewCaption: "Ilustrační ukázka, ne živá data.",
    faqTitle: "Časté dotazy",
    faq: [
      { q: "Je to opravdu zdarma?", a: "Ano. Registrace, třídy i úkoly jsou zdarma a bez reklam." },
      { q: "Potřebují žáci účet?", a: "Hrát a učit se mohou i bez účtu. Pro připojení do třídy se ale musí přihlásit, aby se jejich postup uložil." },
      { q: "Můžu přijmout jen některé žáky?", a: "Ano. Když zapneš schvalování, každou žádost uvidíš a přijmeš ji sám." },
      { q: "Jak funguje rodičovský zámek?", a: "Rodiče nastaví PIN a denní limit času a mohou zakázat nákupy v obchodě i společné hraní." },
    ],
  },
  students: {
    nav: "Pro žáky",
    title: "Pro žáky",
    subtitle: "Všechno, co tu na webu najdeš. Učení je tu hra, tak si vyber, na co máš zrovna chuť.",
    cardsTitle: "Co tu na tebe čeká",
    features: {
      courses: { title: "Kurzy", text: "Učivo podle předmětů a ročníků. Každý kurz má lekce, hry a testy, které ukážou, co už umíš." },
      daily: { title: "Denní kvíz", text: "Každý den nový krátký kvíz. Dej si ho na rozehřátí, zabere jen pár minut." },
      idle: { title: "Stálé hry", text: "Farma, Město, Základna, Ekonomika a Mazlíčci. Běží i tehdy, když zrovna nehraješ." },
      escape: { title: "Únikovky", text: "Logické hádanky v místnostech. Vyřeš úkoly a zkus, jestli dokážeš uniknout." },
      together: { title: "Hrát spolu", text: "Kvíz a závody pro celou třídu. Založ hru a kamarádi se připojí kódem." },
      review: { title: "Mapa a opakování", text: "Mapa ukáže, co už umíš. Opakování ti připomene, na co se snadno zapomíná." },
      materials: { title: "Materiály", text: "Výukové texty a přehledy, ke kterým se můžeš kdykoli vrátit." },
      profile: { title: "Profil a odměny", text: "Tvůj účet, XP, sbírka odemčených věcí a tvoje jméno i avatar." },
      boards: { title: "Žebříčky", text: "Kde jsi mezi ostatními? Žebříčky, parta a liga." },
      shop: { title: "Obchod", text: "Utrať body za věci do profilu a her. Na tržišti můžeš obchodovat s ostatními hráči." },
      town: { title: "Město", text: "Vlastní městečko s postavičkami, které pro tebe mají úkoly." },
      team: { title: "Třída a tým", text: "Připoj se kódem od učitele, plň zadání a piš si v chatu týmu." },
    },
    cta: "Začít hrát",
    ctaHint: "Hrát a učit se můžeš i bez účtu. Přihlášení ti uloží postup.",
    teachersLink: "Jsi učitel? Podívej se, co pro tebe máme →",
  },
};

const en: AudiencePagesText = {
  teachers: {
    nav: "For teachers",
    title: "For teachers",
    subtitle: "Practice for the whole class in one place. Free, no ads, with a child-safe lock.",
    points: [
      { title: "Create a class in a minute", text: "Pupils join with a class code. You approve every request, so no outsiders get in." },
      { title: "Assign a task with a deadline", text: "Pick a course or test, set the deadline and who it is for: the whole class or just a group." },
      { title: "Track the results", text: "The overview shows who completed the task, how it went and which questions the class struggles with." },
      { title: "Safe for children", text: "No ads, with a parental lock. Registration and all teacher features are free." },
    ],
    stepsTitle: "How it works",
    steps: [
      { title: "Create a class", text: "In the Teams section, create a class. You get a code that pupils enter when they join." },
      { title: "Assign a task", text: "Pick a course or test, set a deadline and decide who the task is for." },
      { title: "Track the results", text: "See who opened the task, who completed it and how many attempts it took." },
    ],
    cta: "Create a class for free",
    ctaHint: "Just sign up and create a class in the Teams section.",
    studentsLink: "Are you a pupil? See what you'll find here →",
    homeLink: "More about features for teachers →",
    featuresTitle: "What's inside",
    features: [
      { title: "Classes with a code", text: "Every class gets its own code. Share it with pupils and they join by themselves." },
      { title: "Approve pupils", text: "Choose whether pupils join straight away, only after you approve them, or whether the class is closed." },
      { title: "Tasks for a class, group or pupil", text: "Give a task to the whole class, one group or a single pupil, each with its own deadline." },
      { title: "Overview of results", text: "See who opened the task, who completed it and which questions the class struggles with." },
      { title: "Class chat", text: "Short messages right inside the team, so you can sort things out quickly." },
      { title: "Parental lock", text: "Parents set a PIN and a daily time limit, and can block shop purchases or playing together." },
    ],
    previewBadge: "Example",
    previewTitle: "Fractions, grade 5",
    previewDue: "Due: Friday",
    previewCaption: "Illustrative example, not live data.",
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Is it really free?", a: "Yes. Registration, classes and tasks are free, with no ads." },
      { q: "Do pupils need an account?", a: "They can play and learn without one. To join a class they need to sign in, so their progress is saved." },
      { q: "Can I accept only some pupils?", a: "Yes. If you turn on approval, you see each request and accept it yourself." },
      { q: "How does the parental lock work?", a: "Parents set a PIN and a daily time limit, and can block shop purchases and playing together." },
    ],
  },
  students: {
    nav: "For students",
    title: "For students",
    subtitle: "Everything the site has for you. Learning here is a game, so pick whatever you fancy right now.",
    cardsTitle: "What's waiting for you",
    features: {
      courses: { title: "Courses", text: "Lessons by subject and grade. Every course has lessons, games and tests that show what you already know." },
      daily: { title: "Daily quiz", text: "A fresh short quiz every day. Warm up with it, it only takes a few minutes." },
      idle: { title: "Idle games", text: "Farm, Town, Base, Economy and Pets. They keep running even when you're not playing." },
      escape: { title: "Escape rooms", text: "Logic puzzles in rooms. Solve the tasks and see if you can get out." },
      together: { title: "Play together", text: "Quizzes and races for the whole class. Start a game and your friends join with a code." },
      review: { title: "Map and review", text: "The map shows what you already know. Review reminds you of what you tend to forget." },
      materials: { title: "Materials", text: "Study texts and overviews you can come back to any time." },
      profile: { title: "Profile and rewards", text: "Your account, XP, a collection of unlocked items, and your name and avatar." },
      boards: { title: "Leaderboards", text: "Where do you stand? Leaderboards, your group and the league." },
      shop: { title: "Shop", text: "Spend points on items for your profile and games. At the market you can trade with other players." },
      town: { title: "Town", text: "Your own little town with characters who have tasks for you." },
      team: { title: "Class and team", text: "Join with your teacher's code, complete assignments and chat with your team." },
    },
    cta: "Start playing",
    ctaHint: "You can play and learn without an account. Signing in saves your progress.",
    teachersLink: "Are you a teacher? See what we have for you →",
  },
};

const de: AudiencePagesText = {
  teachers: {
    nav: "Für Lehrkräfte",
    title: "Für Lehrkräfte",
    subtitle: "Üben für die ganze Klasse an einem Ort. Kostenlos, ohne Werbung und mit Kindersicherung.",
    points: [
      { title: "Klasse in einer Minute", text: "Schüler treten mit dem Klassencode bei. Du bestätigst jede Anfrage, es kommt also niemand Fremdes hinein." },
      { title: "Aufgabe mit Frist", text: "Wähle einen Kurs oder Test, setze die Frist und lege fest, für wen er gilt: die ganze Klasse oder nur eine Gruppe." },
      { title: "Ergebnisse verfolgen", text: "Die Übersicht zeigt, wer die Aufgabe erledigt hat, wie es lief und welche Fragen der Klasse Probleme machen." },
      { title: "Sicher für Kinder", text: "Keine Werbung, mit Kindersicherung. Registrierung und alle Lehrerfunktionen sind kostenlos." },
    ],
    stepsTitle: "So funktioniert's",
    steps: [
      { title: "Klasse anlegen", text: "Lege im Bereich Teams eine Klasse an. Du bekommst einen Code, mit dem sich die Schüler anmelden." },
      { title: "Aufgabe stellen", text: "Wähle einen Kurs oder Test, setze eine Frist und lege fest, für wen die Aufgabe ist." },
      { title: "Ergebnisse ansehen", text: "Du siehst, wer die Aufgabe geöffnet, wer sie erledigt und wie oft er es versucht hat." },
    ],
    cta: "Klasse kostenlos anlegen",
    ctaHint: "Einfach registrieren und im Bereich Teams eine Klasse erstellen.",
    studentsLink: "Bist du Schüler? Hier findest du alles →",
    homeLink: "Mehr zu den Funktionen für Lehrkräfte →",
    featuresTitle: "Was drin steckt",
    features: [
      { title: "Klassen mit Code", text: "Jede Klasse hat einen eigenen Code. Teile ihn mit den Schülern, dann treten sie selbst bei." },
      { title: "Schüler bestätigen", text: "Lege fest, ob Schüler sofort beitreten, erst nach deiner Bestätigung, oder ob die Klasse geschlossen ist." },
      { title: "Aufgaben für Klasse, Gruppe oder einzelne Schüler", text: "Gib eine Aufgabe der ganzen Klasse, einer Gruppe oder einem einzelnen Schüler, jeweils mit eigener Frist." },
      { title: "Übersicht der Ergebnisse", text: "Sieh, wer die Aufgabe geöffnet und wer sie erledigt hat und bei welchen Fragen die Klasse hängt." },
      { title: "Klassenchat", text: "Kurze Nachrichten direkt im Team, damit ihr schnell etwas klären könnt." },
      { title: "Kindersicherung", text: "Eltern legen eine PIN und ein tägliches Zeitlimit fest und können Einkäufe im Shop oder gemeinsames Spielen sperren." },
    ],
    previewBadge: "Beispiel",
    previewTitle: "Brüche, 5. Klasse",
    previewDue: "Frist: Freitag",
    previewCaption: "Illustratives Beispiel, keine Live-Daten.",
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Ist das wirklich kostenlos?", a: "Ja. Registrierung, Klassen und Aufgaben sind kostenlos und werbefrei." },
      { q: "Brauchen Schüler ein Konto?", a: "Spielen und lernen können sie auch ohne Konto. Für den Beitritt zur Klasse müssen sie sich anmelden, damit ihr Fortschritt gespeichert wird." },
      { q: "Kann ich nur einige Schüler aufnehmen?", a: "Ja. Wenn du die Bestätigung einschaltest, siehst du jede Anfrage und kannst sie selbst annehmen." },
      { q: "Wie funktioniert die Kindersicherung?", a: "Eltern legen eine PIN und ein tägliches Zeitlimit fest und können Einkäufe im Shop und gemeinsames Spielen sperren." },
    ],
  },
  students: {
    nav: "Für Schüler",
    title: "Für Schüler",
    subtitle: "Alles, was du hier findest. Lernen ist hier ein Spiel, also such dir einfach aus, worauf du Lust hast.",
    cardsTitle: "Das wartet auf dich",
    features: {
      courses: { title: "Kurse", text: "Lernstoff nach Fächern und Klassenstufen. Jeder Kurs hat Lektionen, Spiele und Tests, die dir zeigen, was du schon kannst." },
      daily: { title: "Tägliches Quiz", text: "Jeden Tag ein neues kurzes Quiz. Zum Warmwerden, dauert nur ein paar Minuten." },
      idle: { title: "Idle-Spiele", text: "Farm, Stadt, Basis, Wirtschaft und Haustiere. Sie laufen weiter, auch wenn du gerade nicht spielst." },
      escape: { title: "Escape-Räume", text: "Logikrätsel in Räumen. Löse die Aufgaben und schau, ob du entkommst." },
      together: { title: "Gemeinsam spielen", text: "Quiz und Wettrennen für die ganze Klasse. Starte ein Spiel, deine Freunde treten mit einem Code bei." },
      review: { title: "Karte und Wiederholung", text: "Die Karte zeigt, was du schon kannst. Die Wiederholung erinnert dich an das, was man leicht vergisst." },
      materials: { title: "Materialien", text: "Lerntexte und Übersichten, zu denen du jederzeit zurückkehren kannst." },
      profile: { title: "Profil und Belohnungen", text: "Dein Konto, XP, eine Sammlung freigeschalteter Dinge sowie dein Name und Avatar." },
      boards: { title: "Ranglisten", text: "Wo stehst du? Ranglisten, deine Gruppe und die Liga." },
      shop: { title: "Shop", text: "Gib Punkte für Dinge für dein Profil und deine Spiele aus. Auf dem Marktplatz kannst du mit anderen Spielern handeln." },
      town: { title: "Stadt", text: "Dein eigenes Städtchen mit Figuren, die Aufgaben für dich haben." },
      team: { title: "Klasse und Team", text: "Tritt mit dem Code deiner Lehrkraft bei, erledige Aufgaben und chatte mit deinem Team." },
    },
    cta: "Jetzt spielen",
    ctaHint: "Du kannst auch ohne Konto spielen und lernen. Mit Anmeldung wird dein Fortschritt gespeichert.",
    teachersLink: "Bist du Lehrkraft? Hier siehst du, was wir für dich haben →",
  },
};

const ru: AudiencePagesText = {
  teachers: {
    nav: "Для учителей",
    title: "Для учителей",
    subtitle: "Тренировка для всего класса в одном месте. Бесплатно, без рекламы и с детской защитой.",
    points: [
      { title: "Класс за минуту", text: "Ученики входят по коду класса. Каждую заявку подтверждаете вы, так что посторонние не попадут." },
      { title: "Задание со сроком", text: "Выберите курс или тест, задайте срок и кому он адресован: всему классу или только группе." },
      { title: "Следите за результатами", text: "Обзор показывает, кто выполнил задание, как у него получилось и какие вопросы вызывают трудности у класса." },
      { title: "Безопасно для детей", text: "Без рекламы, с родительским замком. Регистрация и все функции для учителей бесплатны." },
    ],
    stepsTitle: "Как это работает",
    steps: [
      { title: "Создайте класс", text: "В разделе «Команды» создайте класс. Вы получите код, с которым ученики присоединяются." },
      { title: "Задайте задание", text: "Выберите курс или тест, задайте срок и решите, для кого задание." },
      { title: "Следите за результатами", text: "Видно, кто открыл задание, кто его выполнил и сколько попыток потребовалось." },
    ],
    cta: "Создать класс бесплатно",
    ctaHint: "Достаточно зарегистрироваться и создать класс в разделе «Команды».",
    studentsLink: "Ты ученик? Посмотри, что здесь есть →",
    homeLink: "Подробнее о функциях для учителей →",
    featuresTitle: "Что внутри",
    features: [
      { title: "Классы с кодом", text: "У каждого класса свой код. Передайте его ученикам, и они присоединятся сами." },
      { title: "Подтверждение учеников", text: "Выберите, входят ли ученики сразу, только после вашего подтверждения или класс закрыт." },
      { title: "Задания для класса, группы или ученика", text: "Задание можно дать всему классу, одной группе или отдельному ученику, у каждого свой срок." },
      { title: "Обзор результатов", text: "Видно, кто открыл задание, кто его выполнил и на каких вопросах класс застревает." },
      { title: "Чат класса", text: "Короткие сообщения прямо в команде, чтобы быстро всё согласовать." },
      { title: "Родительский замок", text: "Родители задают PIN и дневной лимит времени и могут запретить покупки в магазине или совместную игру." },
    ],
    previewBadge: "Пример",
    previewTitle: "Дроби, 5 класс",
    previewDue: "Срок: пятница",
    previewCaption: "Иллюстративный пример, не реальные данные.",
    faqTitle: "Частые вопросы",
    faq: [
      { q: "Это правда бесплатно?", a: "Да. Регистрация, классы и задания бесплатны, без рекламы." },
      { q: "Нужен ли ученикам аккаунт?", a: "Играть и учиться можно и без аккаунта. Чтобы войти в класс, нужно войти в аккаунт, так сохранится прогресс." },
      { q: "Можно принять только некоторых учеников?", a: "Да. Если включить подтверждение, вы видите каждую заявку и принимаете её сами." },
      { q: "Как работает родительский замок?", a: "Родители задают PIN и дневной лимит времени и могут запретить покупки в магазине и совместную игру." },
    ],
  },
  students: {
    nav: "Для учеников",
    title: "Для учеников",
    subtitle: "Всё, что есть на сайте. Учёба здесь — это игра, так что выбирай то, что тебе сейчас по душе!",
    cardsTitle: "Что тебя ждёт",
    features: {
      courses: { title: "Курсы", text: "Материал по предметам и классам. В каждом курсе есть уроки, игры и тесты, которые покажут, что ты уже знаешь." },
      daily: { title: "Ежедневный квиз", text: "Каждый день новый короткий квиз. Разомнись перед учёбой, это займёт пару минут." },
      idle: { title: "Игры без остановки", text: "Ферма, Город, База, Экономика и Питомцы. Они продолжают работать, даже когда ты не играешь." },
      escape: { title: "Квест-комнаты", text: "Логические загадки в комнатах. Решай задания и посмотри, сможешь ли выбраться." },
      together: { title: "Играть вместе", text: "Квизы и гонки для всего класса. Создай игру, и друзья присоединятся по коду." },
      review: { title: "Карта и повторение", text: "Карта покажет, что ты уже знаешь, а повторение напомнит то, что легко забыть." },
      materials: { title: "Материалы", text: "Учебные тексты и обзоры по темам, к которым можно вернуться в любой момент." },
      profile: { title: "Профиль и награды", text: "Твой аккаунт, опыт XP, коллекция открытых предметов, имя и аватар." },
      boards: { title: "Рейтинги", text: "Где ты среди других? Рейтинги, твоя команда и лига." },
      shop: { title: "Магазин", text: "Трать баллы на вещи для профиля и игр. На рынке можно торговать с другими игроками." },
      town: { title: "Город", text: "Свой городок с персонажами, у которых есть задания для тебя." },
      team: { title: "Класс и команда", text: "Присоединись кодом от учителя, выполняй задания и общайся в чате команды." },
    },
    cta: "Начать играть",
    ctaHint: "Играть и учиться можно и без аккаунта. Вход сохранит твой прогресс.",
    teachersLink: "Ты учитель? Посмотри, что у нас есть для тебя →",
  },
};

const uk: AudiencePagesText = {
  teachers: {
    nav: "Для вчителів",
    title: "Для вчителів",
    subtitle: "Тренування для всього класу в одному місці. Безкоштовно, без реклами та з дитячим захистом.",
    points: [
      { title: "Клас за хвилину", text: "Учні приєднуються за кодом класу. Кожну заявку підтверджуєте ви, тож стороння людина не потрапить." },
      { title: "Завдання з терміном", text: "Оберіть курс або тест, встановіть термін і для кого завдання: для всього класу чи лише для групи." },
      { title: "Стежте за результатами", text: "Огляд показує, хто виконав завдання, як це вийшло і які питання викликають труднощі в класі." },
      { title: "Безпечно для дітей", text: "Без реклами, з батьківським замком. Реєстрація та всі функції для вчителів безкоштовні." },
    ],
    stepsTitle: "Як це працює",
    steps: [
      { title: "Створіть клас", text: "У розділі «Команди» створіть клас. Ви отримаєте код, яким учні приєднуються." },
      { title: "Задайте завдання", text: "Оберіть курс або тест, встановіть термін і вирішіть, для кого завдання." },
      { title: "Слідкуйте за результатами", text: "Видно, хто відкрив завдання, хто його виконав і скільки спроб було." },
    ],
    cta: "Створити клас безкоштовно",
    ctaHint: "Достатньо зареєструватися й створити клас у розділі «Команди».",
    studentsLink: "Ви учень? Подивіться, що тут є →",
    homeLink: "Детальніше про функції для вчителів →",
    featuresTitle: "Що всередині",
    features: [
      { title: "Класи з кодом", text: "Кожен клас має свій код. Передайте його учням, і вони приєднаються самі." },
      { title: "Підтвердження учнів", text: "Оберіть, чи учні приєднуються одразу, лише після вашого підтвердження, чи клас закритий." },
      { title: "Завдання для класу, групи або учня", text: "Завдання можна дати всьому класу, одній групі або окремому учневі, кожному зі своїм терміном." },
      { title: "Огляд результатів", text: "Видно, хто відкрив завдання, хто його виконав і на яких питаннях клас застряє." },
      { title: "Чат класу", text: "Короткі повідомлення просто в команді, щоб швидко все узгодити." },
      { title: "Батьківський замок", text: "Батьки задають PIN, денний ліміт часу та можуть заборонити покупки в магазині або спільну гру." },
    ],
    previewBadge: "Приклад",
    previewTitle: "Дроби, 5 клас",
    previewDue: "Термін: п'ятниця",
    previewCaption: "Ілюстративний приклад, не реальні дані.",
    faqTitle: "Часті питання",
    faq: [
      { q: "Це справді безкоштовно?", a: "Так. Реєстрація, класи й завдання безкоштовні, без реклами." },
      { q: "Чи потрібен учням обліковий запис?", a: "Грати й учитися можна і без нього. Щоб приєднатися до класу, потрібно увійти, тоді зберігається прогрес." },
      { q: "Чи можна прийняти лише деяких учнів?", a: "Так. Якщо ввімкнути підтвердження, ви бачите кожну заявку й приймаєте її самі." },
      { q: "Як працює батьківський замок?", a: "Батьки задають PIN і денний ліміт часу та можуть заборонити покупки в магазині й спільну гру." },
    ],
  },
  students: {
    nav: "Для учнів",
    title: "Для учнів",
    subtitle: "Усе, що є тут. Навчання — це гра, тож обирай те, що тобі зараз до вподоби!",
    cardsTitle: "Що тебе чекає",
    features: {
      courses: { title: "Курси", text: "Матеріал за предметами та класами. У кожному курсі є уроки, ігри й тести, які покажуть, що ти вже знаєш." },
      daily: { title: "Щоденна вікторина", text: "Щодня нова коротка вікторина. Розімнися, це займе кілька хвилин." },
      idle: { title: "Ігри, що працюють самі", text: "Ферма, Місто, База, Економіка й Улюбленці. Вони тривають, навіть коли ти не граєш." },
      escape: { title: "Квест-кімнати", text: "Логічні головоломки в кімнатах. Розв'язуй завдання і подивися, чи зможеш вибратися." },
      together: { title: "Грати разом", text: "Вікторини й перегони для всього класу. Створи гру, і друзі приєднаються за кодом." },
      review: { title: "Мапа і повторення", text: "Мапа покаже, що ти вже знаєш, а повторення нагадає те, що легко забути." },
      materials: { title: "Матеріали", text: "Навчальні тексти й огляди тем, до яких можна повернутися будь-коли." },
      profile: { title: "Профіль і нагороди", text: "Твій обліковий запис, XP, колекція відкритих речей, ім'я та аватар." },
      boards: { title: "Рейтинги", text: "Де ти серед інших? Рейтинги, твоя команда та ліга." },
      shop: { title: "Магазин", text: "Витрачай бали на речі для профілю та ігор. На ринку можна торгувати з іншими гравцями." },
      town: { title: "Місто", text: "Власне містечко з персонажами, які мають для тебе завдання." },
      team: { title: "Клас і команда", text: "Приєднуйся кодом від вчителя, виконуй завдання та спілкуйся в чаті команди." },
    },
    cta: "Почати грати",
    ctaHint: "Грати й учитися можна і без облікового запису. Вхід збереже твій прогрес.",
    teachersLink: "Ти вчитель? Подивися, що ми пропонуємо тобі →",
  },
};

const ja: AudiencePagesText = {
  teachers: {
    nav: "教師の方へ",
    title: "教師の方へ",
    subtitle: "クラス全体の練習を一か所で。無料・広告なし・子ども向けのロック機能付きです。",
    points: [
      { title: "1分でクラスを作成", text: "生徒はクラスコードで参加します。参加の承認はあなたが行うので、部外者は入れません。" },
      { title: "期限付きの課題を出す", text: "コースやテストを選び、期限と対象（クラス全体またはグループ）を設定できます。" },
      { title: "結果を確認", text: "誰が課題を完了したか、どの程度できたか、クラスがつまずいている問題がわかります。" },
      { title: "子どもにも安心", text: "広告なし、保護者向けのロック機能付き。登録と教師向けの機能はすべて無料です。" },
    ],
    stepsTitle: "使い方",
    steps: [
      { title: "クラスを作る", text: "「チーム」セクションでクラスを作成すると、生徒が参加に使うクラスコードが発行されます。" },
      { title: "課題を出す", text: "コースやテストを選び、期限と対象を決めます。" },
      { title: "結果を見る", text: "課題を開いた生徒、完了した生徒、挑戦した回数がわかります。" },
    ],
    cta: "無料でクラスを作成",
    ctaHint: "登録してから「チーム」でクラスを作成するだけです。",
    studentsLink: "生徒の方はこちら →",
    homeLink: "教師向け機能の詳細 →",
    featuresTitle: "アプリでできること",
    features: [
      { title: "コード付きのクラス", text: "クラスごとに専用のコードがあります。生徒に伝えるだけで、生徒が自分で参加できます。" },
      { title: "生徒の参加を承認", text: "参加をすぐ許可するか、先生の承認後にするか、またはクラスを閉じるかを選べます。" },
      { title: "クラス・グループ・個人への課題", text: "課題はクラス全体、グループ、または個人に出せます。それぞれ期限を設定できます。" },
      { title: "結果の確認", text: "誰が課題を開いたか、誰が完了したか、クラスがどの問題でつまずいているかがわかります。" },
      { title: "クラスのチャット", text: "チーム内で短いメッセージをやり取りでき、すぐに連絡が取れます。" },
      { title: "保護者向けのロック", text: "保護者がPINと1日の利用時間の上限を設定し、ショップでの購入や一緒に遊ぶことを禁止できます。" },
    ],
    previewBadge: "例",
    previewTitle: "分数・5年生",
    previewDue: "期限：金曜日",
    previewCaption: "イメージ例で、実際のデータではありません。",
    faqTitle: "よくある質問",
    faq: [
      { q: "本当に無料ですか？", a: "はい。登録、クラス、課題は無料で、広告もありません。" },
      { q: "生徒にアカウントは必要ですか？", a: "アカウントなしでも遊んで学べます。クラスに参加するにはログインが必要で、進み具合が保存されます。" },
      { q: "一部の生徒だけを受け入れられますか？", a: "はい。承認をオンにすると、届いた参加申請を一件ずつ確認して受け入れられます。" },
      { q: "保護者向けのロックはどう機能しますか？", a: "保護者がPINと1日の利用時間の上限を設定し、ショップでの購入や一緒に遊ぶことを禁止できます。" },
    ],
  },
  students: {
    nav: "生徒の方へ",
    title: "生徒の方へ",
    subtitle: "ここで使えるものをぜんぶ紹介するよ。学びはゲーム感覚！今やりたいものを選んでね。",
    cardsTitle: "ここでできること",
    features: {
      courses: { title: "コース", text: "教科・学年ごとの学習内容。各コースにはレッスン、ゲーム、テストがあって、今の実力がわかるよ。" },
      daily: { title: "デイリークイズ", text: "毎日新しい短いクイズ。ウォーミングアップに、数分で終わるよ。" },
      idle: { title: "放置ゲーム", text: "農場、町、基地、経済、ペット。遊んでいない間も進み続けるよ。" },
      escape: { title: "脱出ゲーム", text: "部屋の中のロジックパズル。課題を解いて脱出できるかな？" },
      together: { title: "みんなで遊ぶ", text: "クラス全員で遊べるクイズとレース。ゲームを作れば、友だちがコードで参加できるよ。" },
      review: { title: "マップと復習", text: "マップで今の実力がわかるよ。復習は忘れやすいところを思い出させてくれる。" },
      materials: { title: "教材", text: "テーマごとの学習テキストや要点まとめ。いつでも読み返せるよ。" },
      profile: { title: "プロフィールと報酬", text: "アカウント、XP、解除したアイテムのコレクション、名前とアバター。" },
      boards: { title: "ランキング", text: "みんなの中で今どこにいる？ランキング、仲間のグループ、リーグ。" },
      shop: { title: "ショップ", text: "ポイントでプロフィールやゲームのアイテムをゲット。マーケットでは他のプレイヤーと取引できるよ。" },
      town: { title: "町", text: "自分の町。課題を持つキャラクターたちが待っているよ。" },
      team: { title: "クラスとチーム", text: "先生のコードで参加して、課題をこなし、チームのチャットで話そう。" },
    },
    cta: "遊び始める",
    ctaHint: "アカウントがなくても遊んで学べるよ。ログインすると進み具合が保存されるよ。",
    teachersLink: "教師の方はこちら →",
  },
};

const es: AudiencePagesText = {
  teachers: {
    nav: "Para docentes",
    title: "Para docentes",
    subtitle: "Práctica para toda la clase en un solo lugar. Gratis, sin anuncios y con bloqueo infantil.",
    points: [
      { title: "Clase en un minuto", text: "Los alumnos se unen con el código de la clase. Tú apruebas cada solicitud, así que no entra nadie ajeno." },
      { title: "Tarea con fecha límite", text: "Elige un curso o test, fija la fecha límite y para quién es: toda la clase o solo un grupo." },
      { title: "Sigue los resultados", text: "El resumen muestra quién completó la tarea, cómo le fue y qué preguntas dan problemas a la clase." },
      { title: "Seguro para niños", text: "Sin anuncios y con bloqueo parental. El registro y todas las funciones para docentes son gratis." },
    ],
    stepsTitle: "Cómo funciona",
    steps: [
      { title: "Crea una clase", text: "En la sección Equipos, crea una clase. Recibirás un código que los alumnos usan para unirse." },
      { title: "Asigna una tarea", text: "Elige un curso o test, pon una fecha límite y decide para quién es." },
      { title: "Revisa los resultados", text: "Verás quién abrió la tarea, quién la completó y cuántos intentos hizo." },
    ],
    cta: "Crear una clase gratis",
    ctaHint: "Solo tienes que registrarte y crear una clase en la sección Equipos.",
    studentsLink: "¿Eres alumno? Mira lo que encontrarás aquí →",
    homeLink: "Más sobre las funciones para docentes →",
    featuresTitle: "Qué encontrarás",
    features: [
      { title: "Clases con código", text: "Cada clase tiene su propio código. Compártelo con los alumnos y se unen por su cuenta." },
      { title: "Aprueba a los alumnos", text: "Elige si los alumnos entran al momento, solo después de tu aprobación o si la clase está cerrada." },
      { title: "Tareas para la clase, un grupo o un alumno", text: "Asigna una tarea a toda la clase, a un grupo o a un solo alumno, cada una con su fecha límite." },
      { title: "Resumen de resultados", text: "Ve quién abrió la tarea, quién la completó y en qué preguntas se atasca la clase." },
      { title: "Chat de la clase", text: "Mensajes cortos dentro del equipo para resolver las cosas rápido." },
      { title: "Bloqueo parental", text: "Los padres fijan un PIN y un límite de tiempo diario, y pueden bloquear las compras en la tienda o el juego en grupo." },
    ],
    previewBadge: "Ejemplo",
    previewTitle: "Fracciones, 5.º curso",
    previewDue: "Fecha límite: viernes",
    previewCaption: "Ejemplo ilustrativo, no son datos reales.",
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿De verdad es gratis?", a: "Sí. El registro, las clases y las tareas son gratuitos y sin anuncios." },
      { q: "¿Los alumnos necesitan una cuenta?", a: "Pueden jugar y aprender sin cuenta. Para unirse a una clase deben iniciar sesión, así se guarda su progreso." },
      { q: "¿Puedo aceptar solo a algunos alumnos?", a: "Sí. Si activas la aprobación, ves cada solicitud y la aceptas tú." },
      { q: "¿Cómo funciona el bloqueo parental?", a: "Los padres fijan un PIN y un límite de tiempo diario, y pueden bloquear las compras en la tienda y el juego en grupo." },
    ],
  },
  students: {
    nav: "Para alumnos",
    title: "Para alumnos",
    subtitle: "Todo lo que hay aquí. Aprender es un juego, así que elige lo que más te apetezca ahora mismo.",
    cardsTitle: "Esto te espera",
    features: {
      courses: { title: "Cursos", text: "Contenido por asignatura y curso. Cada curso tiene lecciones, juegos y tests que te muestran lo que ya sabes." },
      daily: { title: "Test diario", text: "Un test corto nuevo cada día. Caliéntate con él, solo tarda unos minutos." },
      idle: { title: "Juegos de fondo", text: "Granja, Ciudad, Base, Economía y Mascotas. Siguen avanzando aunque no estés jugando." },
      escape: { title: "Salas de escape", text: "Acertijos de lógica en salas. Resuelve las tareas y a ver si consigues escapar." },
      together: { title: "Jugar juntos", text: "Quizzes y carreras para toda la clase. Crea una partida y tus amigos se unen con un código." },
      review: { title: "Mapa y repaso", text: "El mapa muestra lo que ya sabes. El repaso te recuerda lo que se olvida con facilidad." },
      materials: { title: "Materiales", text: "Textos y resúmenes para estudiar, a los que puedes volver cuando quieras." },
      profile: { title: "Perfil y recompensas", text: "Tu cuenta, XP, tu colección de objetos desbloqueados, tu nombre y tu avatar." },
      boards: { title: "Clasificaciones", text: "¿Dónde estás tú? Clasificaciones, tu grupo y la liga." },
      shop: { title: "Tienda", text: "Gasta puntos en objetos para tu perfil y tus juegos. En el mercado puedes comerciar con otros jugadores." },
      town: { title: "Ciudad", text: "Tu propio pueblo con personajes que tienen tareas para ti." },
      team: { title: "Clase y equipo", text: "Únete con el código de tu profe, completa las tareas y chatea con tu equipo." },
    },
    cta: "Empezar a jugar",
    ctaHint: "Puedes jugar y aprender sin cuenta. Al iniciar sesión se guarda tu progreso.",
    teachersLink: "¿Eres docente? Mira lo que tenemos para ti →",
  },
};

const fr: AudiencePagesText = {
  teachers: {
    nav: "Pour les enseignants",
    title: "Pour les enseignants",
    subtitle: "L'entraînement de toute la classe au même endroit. Gratuit, sans publicité, avec un verrouillage pour enfants.",
    points: [
      { title: "Une classe en une minute", text: "Les élèves rejoignent avec le code de la classe. Vous validez chaque demande, personne d'extérieur n'entre." },
      { title: "Une tâche avec échéance", text: "Choisissez un cours ou un test, fixez l'échéance et les destinataires : toute la classe ou un groupe." },
      { title: "Suivez les résultats", text: "L'aperçu montre qui a terminé la tâche, comment ça s'est passé et quelles questions posent problème." },
      { title: "Sûr pour les enfants", text: "Sans publicité, avec verrou parental. L'inscription et toutes les fonctions enseignants sont gratuites." },
    ],
    stepsTitle: "Comment ça marche",
    steps: [
      { title: "Créez une classe", text: "Dans la rubrique Équipes, créez une classe : vous obtenez un code que les élèves saisissent pour rejoindre." },
      { title: "Donnez une tâche", text: "Choisissez un cours ou un test, fixez une échéance et décidez à qui s'adresse la tâche." },
      { title: "Suivez les résultats", text: "Vous voyez qui a ouvert la tâche, qui l'a terminée et combien d'essais il a fallu." },
    ],
    cta: "Créer une classe gratuitement",
    ctaHint: "Inscrivez-vous, puis créez une classe dans la rubrique Équipes.",
    studentsLink: "Tu es élève ? Découvre ce que tu trouveras ici →",
    homeLink: "En savoir plus sur les fonctions pour enseignants →",
    featuresTitle: "Ce que vous y trouverez",
    features: [
      { title: "Classes avec code", text: "Chaque classe a son propre code. Partagez-le avec les élèves, ils rejoignent seuls." },
      { title: "Validez les élèves", text: "Choisissez si les élèves entrent tout de suite, seulement après votre validation, ou si la classe est fermée." },
      { title: "Tâches pour la classe, un groupe ou un élève", text: "Donnez une tâche à toute la classe, à un groupe ou à un seul élève, chacune avec son échéance." },
      { title: "Aperçu des résultats", text: "Voyez qui a ouvert la tâche, qui l'a terminée et sur quelles questions la classe bloque." },
      { title: "Chat de classe", text: "Des messages courts directement dans l'équipe, pour régler les choses vite." },
      { title: "Verrou parental", text: "Les parents définissent un code PIN et une limite de temps quotidienne, et peuvent bloquer les achats dans la boutique ou le jeu à plusieurs." },
    ],
    previewBadge: "Exemple",
    previewTitle: "Fractions, 5e",
    previewDue: "Échéance : vendredi",
    previewCaption: "Exemple illustratif, pas de données réelles.",
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "C'est vraiment gratuit ?", a: "Oui. L'inscription, les classes et les tâches sont gratuites, sans publicité." },
      { q: "Les élèves ont-ils besoin d'un compte ?", a: "Ils peuvent jouer et apprendre sans compte. Pour rejoindre une classe, ils doivent se connecter, ce qui sauvegarde leur progression." },
      { q: "Puis-je n'accepter que certains élèves ?", a: "Oui. Si vous activez la validation, vous voyez chaque demande et l'acceptez vous-même." },
      { q: "Comment fonctionne le verrou parental ?", a: "Les parents définissent un code PIN et une limite de temps quotidienne, et peuvent bloquer les achats dans la boutique et le jeu à plusieurs." },
    ],
  },
  students: {
    nav: "Pour les élèves",
    title: "Pour les élèves",
    subtitle: "Tout ce que tu trouves ici. Apprendre est un jeu, alors choisis ce qui te tente maintenant.",
    cardsTitle: "Ce qui t'attend",
    features: {
      courses: { title: "Cours", text: "Des leçons par matière et par niveau. Chaque cours contient des leçons, des jeux et des tests qui montrent ce que tu sais déjà." },
      daily: { title: "Quiz du jour", text: "Un nouveau petit quiz chaque jour. Chauffe-toi avec, ça ne prend que quelques minutes." },
      idle: { title: "Jeux en veille", text: "Ferme, Ville, Base, Économie et Animaux. Ils continuent d'avancer même quand tu ne joues pas." },
      escape: { title: "Salles d'évasion", text: "Des énigmes logiques dans des salles. Résous les défis et vois si tu arrives à t'échapper." },
      together: { title: "Jouer ensemble", text: "Quiz et courses pour toute la classe. Lance une partie, tes amis rejoignent avec un code." },
      review: { title: "Carte et révisions", text: "La carte montre ce que tu sais déjà. Les révisions te rappellent ce qu'on oublie facilement." },
      materials: { title: "Supports", text: "Textes et résumés sur des thèmes auxquels tu peux revenir à tout moment." },
      profile: { title: "Profil et récompenses", text: "Ton compte, ton XP, ta collection d'objets débloqués, ton nom et ton avatar." },
      boards: { title: "Classements", text: "Où te situes-tu ? Classements, ton groupe et la ligue." },
      shop: { title: "Boutique", text: "Dépense des points pour des objets de profil et de jeu. Au marché, tu échanges avec d'autres joueurs." },
      town: { title: "Ville", text: "Ta petite ville, avec des personnages qui ont des missions pour toi." },
      team: { title: "Classe et équipe", text: "Rejoins avec le code de ton prof, fais les devoirs et discute dans le chat de l'équipe." },
    },
    cta: "Commencer à jouer",
    ctaHint: "Tu peux jouer et apprendre sans compte. La connexion enregistre ta progression.",
    teachersLink: "Tu es enseignant ? Découvre ce que nous avons pour toi →",
  },
};

const all: Record<Locale, AudiencePagesText> = { cs, en, de, ru, uk, ja, es, fr };

export function getAudiencePagesText(locale: Locale): AudiencePagesText {
  return all[locale];
}
