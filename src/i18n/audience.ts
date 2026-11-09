// Texty stránek „Pro učitele“ (/ucitele) a „Pro žáky“ (/zaci) ve všech jazycích webu.
import type { Locale } from "./config";

export const FEATURE_KEYS = [
  "courses",
  "daily",
  "idle",
  "escape",
  "together",
  "review",
  "materials",
  "profile",
  "boards",
  "shop",
  "town",
  "team",
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
      { title: "Založ třídu", text: "Vytvoř tým a dostaneš kód, který žáci zadají při připojení." },
      { title: "Zadej úkol", text: "Vyber kurz nebo test, nastav termín a rozhodni, pro koho úkol je." },
      { title: "Sleduj výsledky", text: "Uvidíš, kdo úkol otevřel, kdo ho splnil a kolikrát to zkoušel." },
    ],
    cta: "Založit třídu zdarma",
    ctaHint: "Stačí se zaregistrovat a v sekci Týmy vytvořit třídu.",
    studentsLink: "Jsi žák? Podívej se, co na webu najdeš →",
    homeLink: "Víc o funkcích pro učitele →",
  },
  students: {
    nav: "Pro žáky",
    title: "Pro žáky",
    subtitle: "Všechno, co na webu najdeš. Učení je tu hra, tak si vyber, na co máš zrovna chuť.",
    cardsTitle: "Co tu najdeš",
    features: {
      courses: { title: "Kurzy", text: "Učivo podle předmětů a ročníků. Každý kurz má lekce, hry a testy." },
      daily: { title: "Denní kvíz", text: "Každý den nový krátký kvíz na rozehřátí." },
      idle: { title: "Stálé hry", text: "Farma, Město, Základna, Ekonomika a Mazlíčci. Běží i tehdy, když zrovna nehraješ." },
      escape: { title: "Únikovky", text: "Logické hádanky v místnostech. Vyřeš úkoly a unikni." },
      together: { title: "Hrát spolu", text: "Kvíz a závody pro celou třídu. Založ hru a ostatní se připojí kódem." },
      review: { title: "Mapa a opakování", text: "Mapa ukáže, co už umíš, a opakování připomene to, na co se zapomíná." },
      materials: { title: "Materiály", text: "Výukové texty a přehledy k tématům, ke kterým se můžeš kdykoli vrátit." },
      profile: { title: "Profil a odměny", text: "Tvůj účet, XP, sbírka odemčených věcí a jméno i avatar." },
      boards: { title: "Žebříčky", text: "Kde jsi mezi ostatními: žebříčky, parta a liga." },
      shop: { title: "Obchod", text: "Věci za body do profilu a her. Na tržišti obchoduješ s ostatními hráči." },
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
      { title: "Create a class", text: "Make a team and you get a class code that pupils enter when they join." },
      { title: "Assign a task", text: "Pick a course or test, set a deadline and decide who the task is for." },
      { title: "Track the results", text: "See who opened the task, who completed it and how many attempts it took." },
    ],
    cta: "Create a class for free",
    ctaHint: "Just sign up and create a class in the Teams section.",
    studentsLink: "Are you a pupil? See what you'll find here →",
    homeLink: "More about features for teachers →",
  },
  students: {
    nav: "For students",
    title: "For students",
    subtitle: "Everything you can find here. Learning is a game, so pick whatever you feel like.",
    cardsTitle: "What you'll find here",
    features: {
      courses: { title: "Courses", text: "Lessons by subject and grade. Each course has lessons, games and tests." },
      daily: { title: "Daily quiz", text: "A new short quiz every day to warm up." },
      idle: { title: "Idle games", text: "Farm, Town, Base, Economy and Pets. They keep running even when you're not playing." },
      escape: { title: "Escape rooms", text: "Logic puzzles in rooms. Solve the tasks and escape." },
      together: { title: "Play together", text: "Quizzes and races for the whole class. Start a game and others join with a code." },
      review: { title: "Map and review", text: "The map shows what you already know, and review reminds you of what you tend to forget." },
      materials: { title: "Materials", text: "Study texts and overviews for topics you can come back to any time." },
      profile: { title: "Profile and rewards", text: "Your account, XP, a collection of unlocked items, and your name and avatar." },
      boards: { title: "Leaderboards", text: "See where you stand: leaderboards, your group and the league." },
      shop: { title: "Shop", text: "Spend points on items for your profile and games. At the marketplace you trade with other players." },
      town: { title: "Town", text: "Your own little town with characters who have tasks for you." },
      team: { title: "Class and team", text: "Join with a code from your teacher, complete assignments and chat with your team." },
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
      { title: "Klasse anlegen", text: "Erstelle ein Team, dann bekommst du einen Klassencode, mit dem sich die Schüler anmelden." },
      { title: "Aufgabe stellen", text: "Wähle einen Kurs oder Test, setze eine Frist und lege fest, für wen die Aufgabe ist." },
      { title: "Ergebnisse ansehen", text: "Du siehst, wer die Aufgabe geöffnet, wer sie erledigt und wie oft er es versucht hat." },
    ],
    cta: "Klasse kostenlos anlegen",
    ctaHint: "Einfach registrieren und im Bereich Teams eine Klasse erstellen.",
    studentsLink: "Bist du Schüler? Hier findest du alles →",
    homeLink: "Mehr zu den Funktionen für Lehrkräfte →",
  },
  students: {
    nav: "Für Schüler",
    title: "Für Schüler",
    subtitle: "Alles, was du hier findest. Lernen ist hier ein Spiel, wähle einfach, worauf du Lust hast.",
    cardsTitle: "Das findest du hier",
    features: {
      courses: { title: "Kurse", text: "Lernstoff nach Fächern und Klassenstufen. Jeder Kurs hat Lektionen, Spiele und Tests." },
      daily: { title: "Tägliches Quiz", text: "Jeden Tag ein neues kurzes Quiz zum Warmwerden." },
      idle: { title: "Idle-Spiele", text: "Farm, Stadt, Basis, Wirtschaft und Haustiere. Sie laufen weiter, auch wenn du gerade nicht spielst." },
      escape: { title: "Escape-Räume", text: "Logikrätsel in Räumen. Löse die Aufgaben und entkomme." },
      together: { title: "Gemeinsam spielen", text: "Quiz und Wettrennen für die ganze Klasse. Starte ein Spiel, die anderen treten mit einem Code bei." },
      review: { title: "Karte und Wiederholung", text: "Die Karte zeigt, was du schon kannst, und die Wiederholung erinnert dich an das, was man leicht vergisst." },
      materials: { title: "Materialien", text: "Lerntexte und Übersichten zu Themen, zu denen du jederzeit zurückkehren kannst." },
      profile: { title: "Profil und Belohnungen", text: "Dein Konto, XP, eine Sammlung freigeschalteter Dinge sowie dein Name und Avatar." },
      boards: { title: "Ranglisten", text: "Wo du im Vergleich stehst: Ranglisten, deine Gruppe und die Liga." },
      shop: { title: "Shop", text: "Gib Punkte für Dinge für dein Profil und die Spiele aus. Auf dem Marktplatz handelst du mit anderen Spielern." },
      town: { title: "Stadt", text: "Dein eigenes Städtchen mit Figuren, die Aufgaben für dich haben." },
      team: { title: "Klasse und Team", text: "Tritt mit dem Code deiner Lehrkraft bei, erledige Aufgaben und chatte im Teamchat." },
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
      { title: "Создайте класс", text: "Создайте команду и получите код класса, с которым ученики присоединяются." },
      { title: "Задайте задание", text: "Выберите курс или тест, задайте срок и решите, для кого задание." },
      { title: "Следите за результатами", text: "Видно, кто открыл задание, кто его выполнил и сколько попыток потребовалось." },
    ],
    cta: "Создать класс бесплатно",
    ctaHint: "Достаточно зарегистрироваться и создать класс в разделе «Команды».",
    studentsLink: "Ты ученик? Посмотри, что здесь есть →",
    homeLink: "Подробнее о функциях для учителей →",
  },
  students: {
    nav: "Для учеников",
    title: "Для учеников",
    subtitle: "Всё, что есть на сайте. Учёба здесь — это игра, так что выбирай, что тебе по душе.",
    cardsTitle: "Что здесь есть",
    features: {
      courses: { title: "Курсы", text: "Материал по предметам и классам. В каждом курсе есть уроки, игры и тесты." },
      daily: { title: "Ежедневный квиз", text: "Каждый день новый короткий квиз для разминки." },
      idle: { title: "Игры без остановки", text: "Ферма, Город, База, Экономика и Питомцы. Они продолжают работать, даже когда ты не играешь." },
      escape: { title: "Квест-комнаты", text: "Логические загадки в комнатах. Решай задания и выберись наружу." },
      together: { title: "Играть вместе", text: "Квизы и гонки для всего класса. Создай игру, и остальные присоединятся по коду." },
      review: { title: "Карта и повторение", text: "Карта покажет, что ты уже знаешь, а повторение напомнит то, что легко забыть." },
      materials: { title: "Материалы", text: "Учебные тексты и обзоры по темам, к которым можно вернуться в любой момент." },
      profile: { title: "Профиль и награды", text: "Твой аккаунт, опыт XP, коллекция открытых предметов, имя и аватар." },
      boards: { title: "Рейтинги", text: "Где ты среди других: рейтинги, команда и лига." },
      shop: { title: "Магазин", text: "Трать баллы на вещи для профиля и игр. На рынке можно торговать с другими игроками." },
      town: { title: "Город", text: "Свой городок с персонажами, у которых есть задания для тебя." },
      team: { title: "Класс и команда", text: "Присоединись кодом от учителя, выполняй задания и переписывайся в чате команды." },
    },
    cta: "Начать играть",
    ctaHint: "Играть и учиться можно и без аккаунта. Вход сохранит твой прогресс.",
    teachersLink: "Вы учитель? Посмотрите, что у нас есть для вас →",
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
      { title: "Створіть клас", text: "Створіть команду, і ви отримаєте код класу, яким учні приєднуються." },
      { title: "Задайте завдання", text: "Оберіть курс або тест, встановіть термін і вирішіть, для кого завдання." },
      { title: "Слідкуйте за результатами", text: "Видно, хто відкрив завдання, хто його виконав і скільки спроб було." },
    ],
    cta: "Створити клас безкоштовно",
    ctaHint: "Достатньо зареєструватися й створити клас у розділі «Команди».",
    studentsLink: "Ви учень? Подивіться, що тут є →",
    homeLink: "Детальніше про функції для вчителів →",
  },
  students: {
    nav: "Для учнів",
    title: "Для учнів",
    subtitle: "Усе, що є на сайті. Навчання тут — це гра, тож обирай те, що тобі до вподоби.",
    cardsTitle: "Що тут є",
    features: {
      courses: { title: "Курси", text: "Матеріал за предметами та класами. У кожному курсі є уроки, ігри й тести." },
      daily: { title: "Щоденна вікторина", text: "Щодня нова коротка вікторина для розминки." },
      idle: { title: "Ігри, що працюють самі", text: "Ферма, Місто, База, Економіка й Улюбленці. Вони тривають, навіть коли ти не граєш." },
      escape: { title: "Квест-кімнати", text: "Логічні головоломки в кімнатах. Розв'язуй завдання і вибирайся назовні." },
      together: { title: "Грати разом", text: "Вікторини й перегони для всього класу. Створи гру, і інші приєднаються за кодом." },
      review: { title: "Мапа і повторення", text: "Мапа покаже, що ти вже знаєш, а повторення нагадає те, що легко забути." },
      materials: { title: "Матеріали", text: "Навчальні тексти й огляди тем, до яких можна повернутися будь-коли." },
      profile: { title: "Профіль і нагороди", text: "Твій обліковий запис, XP, колекція відкритих речей, ім'я та аватар." },
      boards: { title: "Рейтинги", text: "Де ти серед інших: рейтинги, твоя група та ліга." },
      shop: { title: "Магазин", text: "Витрачай бали на речі для профілю й ігор. На ринку можна торгувати з іншими гравцями." },
      town: { title: "Місто", text: "Власне містечко з персонажами, які мають для тебе завдання." },
      team: { title: "Клас і команда", text: "Приєднайся кодом від вчителя, виконуй завдання та листуйся в чаті команди." },
    },
    cta: "Почати грати",
    ctaHint: "Грати й учитися можна і без облікового запису. Вхід збереже твій прогрес.",
    teachersLink: "Ви вчитель? Подивіться, що ми пропонуємо →",
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
      { title: "クラスを作る", text: "チームを作成すると、生徒が参加に使うクラスコードが発行されます。" },
      { title: "課題を出す", text: "コースやテストを選び、期限と対象を決めます。" },
      { title: "結果を見る", text: "課題を開いた生徒、完了した生徒、挑戦した回数がわかります。" },
    ],
    cta: "無料でクラスを作成",
    ctaHint: "登録してから「チーム」でクラスを作成するだけです。",
    studentsLink: "生徒の方はこちら →",
    homeLink: "教師向け機能の詳細 →",
  },
  students: {
    nav: "生徒の方へ",
    title: "生徒の方へ",
    subtitle: "ここで使えるものをまとめました。学びはゲーム感覚で、好きなものを選んでください。",
    cardsTitle: "ここにあるもの",
    features: {
      courses: { title: "コース", text: "教科・学年ごとの学習内容。各コースにはレッスン、ゲーム、テストがあります。" },
      daily: { title: "デイリークイズ", text: "毎日新しい短いクイズで準備運動ができます。" },
      idle: { title: "放置ゲーム", text: "農場、町、基地、経済、ペット。プレイしていない間も進み続けます。" },
      escape: { title: "脱出ゲーム", text: "部屋の中のロジックパズル。課題を解いて脱出しましょう。" },
      together: { title: "みんなで遊ぶ", text: "クラス全員で遊べるクイズとレース。ゲームを作ると、コードで他の人が参加できます。" },
      review: { title: "マップと復習", text: "マップで習得度がわかり、復習で忘れやすいところを思い出せます。" },
      materials: { title: "教材", text: "テーマごとの学習テキストや要点まとめ。いつでも読み返せます。" },
      profile: { title: "プロフィールと報酬", text: "アカウント、XP、解除したアイテムのコレクション、名前とアバター。" },
      boards: { title: "ランキング", text: "他の人との比較。ランキング、仲間のグループ、リーグ。" },
      shop: { title: "ショップ", text: "ポイントでプロフィールやゲームのアイテムを購入。マーケットでは他のプレイヤーと取引できます。" },
      town: { title: "町", text: "自分の町。課題を持つキャラクターに会えます。" },
      team: { title: "クラスとチーム", text: "先生のコードで参加し、課題に取り組み、チームのチャットで話せます。" },
    },
    cta: "遊び始める",
    ctaHint: "アカウントがなくても遊んで学べます。ログインすると進み具合が保存されます。",
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
      { title: "Crea una clase", text: "Crea un equipo y recibirás un código de clase que los alumnos usan para unirse." },
      { title: "Asigna una tarea", text: "Elige un curso o test, pon una fecha límite y decide para quién es." },
      { title: "Revisa los resultados", text: "Verás quién abrió la tarea, quién la completó y cuántos intentos hizo." },
    ],
    cta: "Crear una clase gratis",
    ctaHint: "Solo tienes que registrarte y crear una clase en la sección Equipos.",
    studentsLink: "¿Eres alumno? Mira lo que encontrarás aquí →",
    homeLink: "Más sobre las funciones para docentes →",
  },
  students: {
    nav: "Para alumnos",
    title: "Para alumnos",
    subtitle: "Todo lo que hay aquí. Aprender es un juego, así que elige lo que más te apetezca.",
    cardsTitle: "Lo que encontrarás aquí",
    features: {
      courses: { title: "Cursos", text: "Contenido por asignatura y curso. Cada curso tiene lecciones, juegos y tests." },
      daily: { title: "Test diario", text: "Un test corto nuevo cada día para calentar." },
      idle: { title: "Juegos de fondo", text: "Granja, Ciudad, Base, Economía y Mascotas. Siguen avanzando aunque no estés jugando." },
      escape: { title: "Salas de escape", text: "Acertijos de lógica en salas. Resuelve las tareas y escapa." },
      together: { title: "Jugar juntos", text: "Quizzes y carreras para toda la clase. Crea una partida y los demás se unen con un código." },
      review: { title: "Mapa y repaso", text: "El mapa muestra lo que ya sabes y el repaso te recuerda lo que se olvida fácilmente." },
      materials: { title: "Materiales", text: "Textos y resúmenes de estudio sobre temas a los que puedes volver cuando quieras." },
      profile: { title: "Perfil y recompensas", text: "Tu cuenta, XP, la colección de objetos desbloqueados, tu nombre y tu avatar." },
      boards: { title: "Clasificaciones", text: "Mira dónde estás entre los demás: clasificaciones, tu grupo y la liga." },
      shop: { title: "Tienda", text: "Gasta puntos en objetos para tu perfil y los juegos. En el mercado puedes comerciar con otros jugadores." },
      town: { title: "Ciudad", text: "Tu propio pueblo con personajes que tienen tareas para ti." },
      team: { title: "Clase y equipo", text: "Únete con el código de tu docente, completa las tareas y chatea con tu equipo." },
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
      { title: "Créez une classe", text: "Créez une équipe : vous obtenez un code de classe que les élèves saisissent pour rejoindre." },
      { title: "Donnez une tâche", text: "Choisissez un cours ou un test, fixez une échéance et décidez à qui s'adresse la tâche." },
      { title: "Suivez les résultats", text: "Vous voyez qui a ouvert la tâche, qui l'a terminée et combien d'essais il a fallu." },
    ],
    cta: "Créer une classe gratuitement",
    ctaHint: "Inscrivez-vous, puis créez une classe dans la rubrique Équipes.",
    studentsLink: "Tu es élève ? Découvre ce que tu trouveras ici →",
    homeLink: "En savoir plus sur les fonctions pour enseignants →",
  },
  students: {
    nav: "Pour les élèves",
    title: "Pour les élèves",
    subtitle: "Tout ce que tu trouves ici. Apprendre est un jeu, alors choisis ce qui te tente.",
    cardsTitle: "Ce que tu trouves ici",
    features: {
      courses: { title: "Cours", text: "Des leçons par matière et par niveau. Chaque cours contient des leçons, des jeux et des tests." },
      daily: { title: "Quiz du jour", text: "Un nouveau petit quiz chaque jour pour s'échauffer." },
      idle: { title: "Jeux en veille", text: "Ferme, Ville, Base, Économie et Animaux. Ils continuent d'avancer même quand tu ne joues pas." },
      escape: { title: "Salles d'évasion", text: "Des énigmes logiques dans des salles. Résous les défis et échappe-toi." },
      together: { title: "Jouer ensemble", text: "Quiz et courses pour toute la classe. Lance une partie et les autres rejoignent avec un code." },
      review: { title: "Carte et révisions", text: "La carte montre ce que tu sais déjà, et les révisions te rappellent ce qu'on oublie facilement." },
      materials: { title: "Supports", text: "Textes et résumés sur des thèmes auxquels tu peux revenir à tout moment." },
      profile: { title: "Profil et récompenses", text: "Ton compte, ton XP, ta collection d'objets débloqués, ton nom et ton avatar." },
      boards: { title: "Classements", text: "Vois où tu te situes : classements, ton groupe et la ligue." },
      shop: { title: "Boutique", text: "Dépense des points pour des objets de profil et de jeu. Sur le marché, tu échanges avec d'autres joueurs." },
      town: { title: "Ville", text: "Ta petite ville, avec des personnages qui ont des missions pour toi." },
      team: { title: "Classe et équipe", text: "Rejoins avec le code de ton enseignant, fais les devoirs et discute dans le chat de l'équipe." },
    },
    cta: "Commencer à jouer",
    ctaHint: "Tu peux jouer et apprendre sans compte. La connexion enregistre ta progression.",
    teachersLink: "Vous êtes enseignant ? Découvrez ce que nous avons pour vous →",
  },
};

const all: Record<Locale, AudiencePagesText> = { cs, en, de, ru, uk, ja, es, fr };

export function getAudiencePagesText(locale: Locale): AudiencePagesText {
  return all[locale];
}
