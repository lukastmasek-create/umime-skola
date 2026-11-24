import type { Locale } from "./config";

// Obsah nabídky UčímePRO (výhody, ceny, srovnání) ve všech jazycích.
// Ceny jsou v korunách, protože službu provozujeme v Česku.

export type ProPlan = { price: string; per: string; yearly: string; perks: string[] };

export type ProExtra = {
  subtitle: string;
  availability: string;
  rows: { what: string; free: string; pro: string }[];
  benefitsTitle: string;
  benefits: { icon: string; title: string; text: string }[];
  plans: [ProPlan, ProPlan, ProPlan]; // jednotlivec, rodina, škola
  trial: string;
  note: string;
};

const ICONS = ["doucovatel", "plan", "zkouska", "fotka", "ustni", "sesit-chyb", "poznamky", "vyslovnost", "offline"];

type Compact = Omit<ExtraBase, "benefits"> & { benefits: [string, string][] };
type ExtraBase = ProExtra;

function build(c: Compact): ProExtra {
  return { ...c, benefits: c.benefits.map(([title, text], i) => ({ icon: ICONS[i], title, text })) };
}

const cs = build({
  subtitle: "Nové funkce navíc: AI doučovač, příprava na přijímačky a mnohem víc. Zdarma zůstává všechno, co už máš.",
  availability: "Předplatné se připravuje a zatím ho nelze koupit. Ceny jsou orientační a upřesníme je, až bude možné platit.",
  rows: [
    { what: "Kurzy, body, kolo štěstí, rodičovský panel", free: "zdarma", pro: "zdarma" },
    { what: "AI doučovač a osobní plán učení", free: "ne", pro: "ano" },
    { what: "Příprava na přijímačky, ústní zkoušení, sešit chyb", free: "ne", pro: "ano" },
    { what: "Fotka úlohy, import z poznámek, výslovnost, offline", free: "ne", pro: "ano" },
  ],
  benefitsTitle: "Co je v UčímePRO nového",
  benefits: [
    ["AI doučovač", "Vysvětlí úlohu krok za krokem, jinými slovy a tolikrát, kolikrát potřebuješ. Neřekne ti výsledek, dovede tě k němu."],
    ["Osobní plán učení", "Každý týden dostaneš plán na míru podle toho, co ti nejde. Stačí 15 minut denně."],
    ["Příprava na přijímačky a testy", "Zkoušky nanečisto s časovým limitem, bodováním a odhadem výsledku. Je to samostatná sekce, kurzy zůstávají zdarma."],
    ["Fotka úlohy → podobné příklady", "Vyfoť úlohu z učebnice nebo sešitu a dostaneš pět podobných příkladů na procvičení stejného postupu."],
    ["Ústní zkoušení", "Doučovač tě nahlas vyzkouší z dějepisu, přírodopisu nebo zeměpisu a ohodnotí, co sedělo a co chybělo."],
    ["Sešit chyb", "Každá tvoje chyba se uloží s vysvětlením, proč. Z nich se sestaví osobní sešit k opakování i k vytištění."],
    ["Import z poznámek", "Nahraj poznámky nebo fotku a udělají se z nich kartičky a kvízy na míru."],
    ["Hlasové procvičování výslovnosti", "Řekni slovíčko nahlas a hned uvidíš, jak jsi na tom s výslovností v angličtině, němčině a dalších jazycích."],
    ["Offline režim", "Stáhni si lekce a uč se i ve vlaku nebo na chatě bez internetu."],
  ],
  plans: [
    { price: "200 Kč", per: "měsíčně", yearly: "nebo 2 000 Kč ročně (2 měsíce zdarma)", perks: ["AI doučovač bez limitu", "Osobní plán učení", "Příprava na přijímačky", "Zrušení kdykoli"] },
    { price: "400 Kč", per: "měsíčně", yearly: "nebo 4 000 Kč ročně (2 měsíce zdarma)", perks: ["Až 5 členů s plným PRO", "Dětský bezpečný režim", "Přehled pokroku všech dětí", "Zrušení kdykoli"] },
    { price: "12 000 Kč", per: "ročně za školu", yearly: "", perks: ["Mapa mezer celé třídy", "Hotové testy podle RVP", "Každý žák jiné zadání", "Zaškolení učitelů"] },
  ],
  trial: "30 dní zdarma",
  note: "Zdarma zůstává všechno, co už na webu je, včetně kurzů, bodů, kola štěstí a rodičovského panelu. PRO přidává nové funkce. Ceny jsou včetně DPH.",
});

const en = build({
  subtitle: "New extras: an AI tutor, exam prep and much more. Everything you already have stays free.",
  availability: "The subscription is being prepared and cannot be purchased yet. Prices are indicative and will be confirmed once payments are possible.",
  rows: [
    { what: "Courses, points, wheel of fortune, parent panel", free: "free", pro: "free" },
    { what: "AI tutor and personal study plan", free: "no", pro: "yes" },
    { what: "Exam prep, oral examination, mistake notebook", free: "no", pro: "yes" },
    { what: "Task photo, import from notes, pronunciation, offline", free: "no", pro: "yes" },
  ],
  benefitsTitle: "What is new in UčímePRO",
  benefits: [
    ["AI tutor", "Explains a task step by step, in other words, as many times as you need. It does not give you the answer, it leads you to it."],
    ["Personal study plan", "Every week you get a plan made for you based on what you find hard. 15 minutes a day is enough."],
    ["Entrance exam and test prep", "Mock exams with a time limit, scoring and an estimate of your result. It is a separate section, courses stay free."],
    ["Photo of a task → similar examples", "Take a photo of a task from a textbook or notebook and get five similar examples to practise the same method."],
    ["Oral examination", "The tutor quizzes you out loud in history, biology or geography and rates what was right and what was missing."],
    ["Mistake notebook", "Every mistake you make is saved with an explanation of why. They build a personal notebook for review or printing."],
    ["Import from notes", "Upload your notes or a photo and they become flashcards and quizzes made for you."],
    ["Voice pronunciation practice", "Say a word out loud and see right away how your pronunciation is in English, German and other languages."],
    ["Offline mode", "Download lessons and learn on a train or at a cabin without internet."],
  ],
  plans: [
    { price: "CZK 200", per: "per month", yearly: "or CZK 2,000 per year (2 months free)", perks: ["Unlimited AI tutor", "Personal study plan", "Entrance exam prep", "Cancel anytime"] },
    { price: "CZK 400", per: "per month", yearly: "or CZK 4,000 per year (2 months free)", perks: ["Up to 5 members with full PRO", "Safe mode for kids", "Progress overview of every child", "Cancel anytime"] },
    { price: "CZK 12,000", per: "per year per school", yearly: "", perks: ["Gap map for the whole class", "Ready-made tests aligned to the curriculum", "A different task for every student", "Teacher training included"] },
  ],
  trial: "30 days free",
  note: "Everything already on the site stays free, including courses, points, the wheel of fortune and the parent panel. PRO adds new features. Prices include VAT.",
});

const de = build({
  subtitle: "Neue Extras: ein KI-Tutor, Prüfungsvorbereitung und vieles mehr. Alles, was du schon hast, bleibt kostenlos.",
  availability: "Das Abo wird gerade vorbereitet und kann noch nicht gekauft werden. Die Preise sind vorläufig und werden bestätigt, sobald Zahlungen möglich sind.",
  rows: [
    { what: "Kurse, Punkte, Glücksrad, Elternbereich", free: "kostenlos", pro: "kostenlos" },
    { what: "KI-Tutor und persönlicher Lernplan", free: "nein", pro: "ja" },
    { what: "Aufnahmeprüfung, mündliche Prüfung, Fehlerheft", free: "nein", pro: "ja" },
    { what: "Aufgabenfoto, Import aus Notizen, Aussprache, offline", free: "nein", pro: "ja" },
  ],
  benefitsTitle: "Das ist neu in UčímePRO",
  benefits: [
    ["KI-Tutor", "Erklärt eine Aufgabe Schritt für Schritt, mit anderen Worten und so oft du willst. Er verrät nicht die Lösung, er führt dich hin."],
    ["Persönlicher Lernplan", "Jede Woche bekommst du einen Plan, der zu deinen Schwächen passt. 15 Minuten am Tag genügen."],
    ["Aufnahmeprüfung und Tests", "Probeprüfungen mit Zeitlimit, Punkten und Ergebnisschätzung. Ein eigener Bereich, die Kurse bleiben kostenlos."],
    ["Aufgabenfoto → ähnliche Beispiele", "Fotografiere eine Aufgabe aus Buch oder Heft und erhalte fünf ähnliche Beispiele für denselben Lösungsweg."],
    ["Mündliche Prüfung", "Der Tutor fragt dich laut in Geschichte, Biologie oder Geografie ab und bewertet, was stimmte und was fehlte."],
    ["Fehlerheft", "Jeder Fehler wird mit einer Erklärung gespeichert. Daraus entsteht ein persönliches Heft zum Wiederholen oder Ausdrucken."],
    ["Import aus Notizen", "Lade Notizen oder ein Foto hoch und daraus werden Karteikarten und Quizze nach Maß."],
    ["Aussprache üben mit Stimme", "Sprich ein Wort laut aus und sieh sofort, wie deine Aussprache in Englisch, Deutsch und anderen Sprachen ist."],
    ["Offline-Modus", "Lade Lektionen herunter und lerne im Zug oder in der Hütte ohne Internet."],
  ],
  plans: [
    { price: "200 Kč", per: "pro Monat", yearly: "oder 2.000 Kč pro Jahr (2 Monate gratis)", perks: ["KI-Tutor ohne Limit", "Persönlicher Lernplan", "Vorbereitung auf Aufnahmeprüfungen", "Jederzeit kündbar"] },
    { price: "400 Kč", per: "pro Monat", yearly: "oder 4.000 Kč pro Jahr (2 Monate gratis)", perks: ["Bis zu 5 Mitglieder mit vollem PRO", "Sicherer Kindermodus", "Fortschrittsübersicht für jedes Kind", "Jederzeit kündbar"] },
    { price: "12.000 Kč", per: "pro Jahr und Schule", yearly: "", perks: ["Lückenkarte der ganzen Klasse", "Fertige Tests nach Lehrplan", "Jeder Schüler eine andere Aufgabe", "Lehrerschulung inklusive"] },
  ],
  trial: "30 Tage gratis",
  note: "Alles, was schon auf der Seite ist, bleibt kostenlos, auch Kurse, Punkte, Glücksrad und Elternbereich. PRO bringt neue Funktionen. Preise inklusive MwSt.",
});

const ru = build({
  subtitle: "Новые возможности: ИИ-репетитор, подготовка к экзаменам и многое другое. Всё, что у тебя уже есть, остаётся бесплатным.",
  availability: "Подписка сейчас готовится и пока не продаётся. Цены ориентировочные, уточним их, когда будет возможна оплата.",
  rows: [
    { what: "Курсы, баллы, колесо удачи, панель для родителей", free: "бесплатно", pro: "бесплатно" },
    { what: "ИИ-репетитор и личный план учёбы", free: "нет", pro: "да" },
    { what: "Подготовка к экзаменам, устный опрос, тетрадь ошибок", free: "нет", pro: "да" },
    { what: "Фото задачи, импорт из заметок, произношение, офлайн", free: "нет", pro: "да" },
  ],
  benefitsTitle: "Что нового в UčímePRO",
  benefits: [
    ["ИИ-репетитор", "Объясняет задачу шаг за шагом, другими словами и столько раз, сколько нужно. Не даёт ответ, а подводит к нему."],
    ["Личный план учёбы", "Каждую неделю ты получаешь план по тому, что даётся труднее. Достаточно 15 минут в день."],
    ["Подготовка к экзаменам и тестам", "Пробные экзамены с лимитом времени, баллами и оценкой результата. Это отдельный раздел, курсы остаются бесплатными."],
    ["Фото задачи → похожие примеры", "Сфотографируй задачу из учебника или тетради и получи пять похожих примеров на тот же способ решения."],
    ["Устный опрос", "Репетитор вслух спросит тебя по истории, биологии или географии и оценит, что было верно и чего не хватило."],
    ["Тетрадь ошибок", "Каждая твоя ошибка сохраняется с объяснением. Из них складывается личная тетрадь для повторения или печати."],
    ["Импорт из заметок", "Загрузи заметки или фото, и из них получатся карточки и тесты под тебя."],
    ["Голосовая тренировка произношения", "Скажи слово вслух и сразу увидишь, как у тебя с произношением в английском, немецком и других языках."],
    ["Офлайн-режим", "Скачай уроки и учись в поезде или на даче без интернета."],
  ],
  plans: [
    { price: "200 Kč", per: "в месяц", yearly: "или 2 000 Kč в год (2 месяца бесплатно)", perks: ["ИИ-репетитор без ограничений", "Личный план обучения", "Подготовка к вступительным экзаменам", "Отмена в любой момент"] },
    { price: "400 Kč", per: "в месяц", yearly: "или 4 000 Kč в год (2 месяца бесплатно)", perks: ["До 5 участников с полным PRO", "Безопасный детский режим", "Обзор прогресса каждого ребёнка", "Отмена в любой момент"] },
    { price: "12 000 Kč", per: "в год за школу", yearly: "", perks: ["Карта пробелов всего класса", "Готовые тесты по программе", "У каждого ученика своё задание", "Обучение учителей включено"] },
  ],
  trial: "30 дней бесплатно",
  note: "Всё, что уже есть на сайте, остаётся бесплатным, включая курсы, баллы, колесо удачи и панель для родителей. PRO добавляет новые функции. Цены включают НДС.",
});

const uk = build({
  subtitle: "Нові можливості: ШІ-репетитор, підготовка до іспитів та багато іншого. Усе, що в тебе вже є, залишається безкоштовним.",
  availability: "Підписка зараз готується і поки що не продається. Ціни орієнтовні, уточнимо їх, коли буде можлива оплата.",
  rows: [
    { what: "Курси, бали, колесо фортуни, панель для батьків", free: "безкоштовно", pro: "безкоштовно" },
    { what: "ШІ-репетитор і особистий план навчання", free: "ні", pro: "так" },
    { what: "Підготовка до іспитів, усне опитування, зошит помилок", free: "ні", pro: "так" },
    { what: "Фото завдання, імпорт із нотаток, вимова, офлайн", free: "ні", pro: "так" },
  ],
  benefitsTitle: "Що нового в UčímePRO",
  benefits: [
    ["ШІ-репетитор", "Пояснює завдання крок за кроком, іншими словами і стільки разів, скільки потрібно. Не дає відповідь, а підводить до неї."],
    ["Особистий план навчання", "Щотижня ти отримуєш план за тим, що виходить гірше. Достатньо 15 хвилин на день."],
    ["Підготовка до іспитів і тестів", "Пробні іспити з обмеженням часу, балами й оцінкою результату. Це окремий розділ, курси залишаються безкоштовними."],
    ["Фото завдання → схожі приклади", "Сфотографуй завдання з підручника чи зошита й отримай п'ять схожих прикладів на той самий спосіб розв'язання."],
    ["Усне опитування", "Репетитор уголос запитає тебе з історії, біології чи географії й оцінить, що було правильно, а чого бракувало."],
    ["Зошит помилок", "Кожна твоя помилка зберігається з поясненням. З них складається особистий зошит для повторення чи друку."],
    ["Імпорт із нотаток", "Завантаж нотатки чи фото, і з них вийдуть картки та вікторини для тебе."],
    ["Голосове тренування вимови", "Скажи слово вголос і одразу побачиш, як у тебе з вимовою в англійській, німецькій та інших мовах."],
    ["Офлайн-режим", "Завантаж уроки й учися в потязі чи на дачі без інтернету."],
  ],
  plans: [
    { price: "200 Kč", per: "на місяць", yearly: "або 2 000 Kč на рік (2 місяці безкоштовно)", perks: ["ШІ-репетитор без обмежень", "Особистий план навчання", "Підготовка до вступних іспитів", "Скасування будь-коли"] },
    { price: "400 Kč", per: "на місяць", yearly: "або 4 000 Kč на рік (2 місяці безкоштовно)", perks: ["До 5 учасників із повним PRO", "Безпечний дитячий режим", "Огляд прогресу кожної дитини", "Скасування будь-коли"] },
    { price: "12 000 Kč", per: "на рік за школу", yearly: "", perks: ["Карта прогалин усього класу", "Готові тести за програмою", "У кожного учня своє завдання", "Навчання вчителів включено"] },
  ],
  trial: "30 днів безкоштовно",
  note: "Усе, що вже є на сайті, залишається безкоштовним, зокрема курси, бали, колесо фортуни й панель для батьків. PRO додає нові функції. Ціни з ПДВ.",
});

const ja = build({
  subtitle: "新機能が追加されます：AIチューター、受験対策など。今お持ちのものはすべて無料のままです。",
  availability: "サブスクリプションは準備中のため、現在はご購入いただけません。料金は目安で、決済が可能になりましたら確定します。",
  rows: [
    { what: "コース、ポイント、ラッキーホイール、保護者パネル", free: "無料", pro: "無料" },
    { what: "AIチューターと個人学習プラン", free: "なし", pro: "あり" },
    { what: "受験対策、口頭試問、ミスノート", free: "なし", pro: "あり" },
    { what: "問題の写真、ノートの取り込み、発音、オフライン", free: "なし", pro: "あり" },
  ],
  benefitsTitle: "UčímePROの新機能",
  benefits: [
    ["AIチューター", "問題をステップごとに、言い方を変えて、何度でも説明します。答えは教えず、答えまで導きます。"],
    ["個人学習プラン", "苦手なところに合わせた週間プランが届きます。1日15分で十分です。"],
    ["受験・テスト対策", "制限時間、採点、結果の予測つきの模擬試験です。別セクションなので、コースは無料のままです。"],
    ["問題の写真 → 似た問題", "教科書やノートの問題を撮影すると、同じ解き方を練習できる似た問題が5問届きます。"],
    ["口頭試問", "歴史・生物・地理を声に出して出題し、合っていた点と足りなかった点を評価します。"],
    ["ミスノート", "間違いは理由の説明つきで保存され、復習や印刷に使える自分専用のノートになります。"],
    ["ノートの取り込み", "ノートや写真をアップロードすると、あなた専用の単語カードとクイズができます。"],
    ["音声による発音練習", "単語を声に出すと、英語やドイツ語などの発音がすぐに分かります。"],
    ["オフラインモード", "レッスンをダウンロードして、電車の中や山小屋でもネットなしで学べます。"],
  ],
  plans: [
    { price: "200 Kč", per: "月額", yearly: "または年額2,000 Kč（2か月分無料）", perks: ["AIチューター使い放題", "個人学習プラン", "入試対策", "いつでも解約OK"] },
    { price: "400 Kč", per: "月額", yearly: "または年額4,000 Kč（2か月分無料）", perks: ["最大5人までフルPRO", "安心の子どもモード", "全員の学習の進み具合をひと目で", "いつでも解約OK"] },
    { price: "12,000 Kč", per: "学校あたり年額", yearly: "", perks: ["クラス全体のつまずきマップ", "カリキュラム準拠の既成テスト", "生徒ごとに違う課題", "教員研修つき"] },
  ],
  trial: "30日間無料",
  note: "コース、ポイント、ラッキーホイール、保護者パネルなど、すでにサイトにあるものはすべて無料のままです。PROは新機能を追加します。価格は税込です。",
});

const es = build({
  subtitle: "Novedades extra: un tutor con IA, preparación de exámenes y mucho más. Todo lo que ya tienes sigue siendo gratis.",
  availability: "La suscripción se está preparando y todavía no se puede comprar. Los precios son orientativos y los confirmaremos cuando sea posible pagar.",
  rows: [
    { what: "Cursos, puntos, rueda de la fortuna, panel para padres", free: "gratis", pro: "gratis" },
    { what: "Tutor con IA y plan de estudio personal", free: "no", pro: "sí" },
    { what: "Preparación de exámenes, examen oral, cuaderno de errores", free: "no", pro: "sí" },
    { what: "Foto del ejercicio, importar apuntes, pronunciación, sin conexión", free: "no", pro: "sí" },
  ],
  benefitsTitle: "Qué hay de nuevo en UčímePRO",
  benefits: [
    ["Tutor con IA", "Explica un ejercicio paso a paso, con otras palabras y las veces que haga falta. No te da la respuesta, te lleva hasta ella."],
    ["Plan de estudio personal", "Cada semana recibes un plan a tu medida según lo que se te da peor. Bastan 15 minutos al día."],
    ["Preparación de exámenes y pruebas", "Simulacros con límite de tiempo, puntuación y estimación del resultado. Es una sección aparte; los cursos siguen siendo gratis."],
    ["Foto del ejercicio → ejemplos parecidos", "Haz una foto de un ejercicio del libro o del cuaderno y recibe cinco ejemplos parecidos para practicar el mismo método."],
    ["Examen oral", "El tutor te pregunta en voz alta de historia, ciencias naturales o geografía y valora lo que estaba bien y lo que faltó."],
    ["Cuaderno de errores", "Cada error se guarda con una explicación de por qué. Con ellos se crea un cuaderno personal para repasar o imprimir."],
    ["Importar apuntes", "Sube tus apuntes o una foto y se convierten en tarjetas y cuestionarios a tu medida."],
    ["Práctica de pronunciación por voz", "Di una palabra en voz alta y ve enseguida cómo va tu pronunciación en inglés, alemán y otros idiomas."],
    ["Modo sin conexión", "Descarga lecciones y aprende en el tren o en la cabaña sin internet."],
  ],
  plans: [
    { price: "200 Kč", per: "al mes", yearly: "o 2000 Kč al año (2 meses gratis)", perks: ["Tutor de IA sin límite", "Plan de estudio personal", "Preparación para exámenes de acceso", "Cancela cuando quieras"] },
    { price: "400 Kč", per: "al mes", yearly: "o 4000 Kč al año (2 meses gratis)", perks: ["Hasta 5 miembros con PRO completo", "Modo seguro para niños", "Resumen del progreso de cada hijo", "Cancela cuando quieras"] },
    { price: "12 000 Kč", per: "al año por colegio", yearly: "", perks: ["Mapa de lagunas de toda la clase", "Exámenes listos según el currículo", "Una tarea distinta para cada alumno", "Formación del profesorado incluida"] },
  ],
  trial: "30 días gratis",
  note: "Todo lo que ya está en la web sigue siendo gratis, incluidos cursos, puntos, rueda de la fortuna y panel para padres. PRO añade funciones nuevas. Precios con IVA incluido.",
});

const fr = build({
  subtitle: "De nouveaux extras : un tuteur IA, la préparation aux examens et bien plus. Tout ce que tu as déjà reste gratuit.",
  availability: "L'abonnement est en préparation et ne peut pas encore être acheté. Les prix sont indicatifs et seront confirmés dès que le paiement sera possible.",
  rows: [
    { what: "Cours, points, roue de la fortune, espace parents", free: "gratuit", pro: "gratuit" },
    { what: "Tuteur IA et plan d'étude personnel", free: "non", pro: "oui" },
    { what: "Préparation aux examens, oral, cahier d'erreurs", free: "non", pro: "oui" },
    { what: "Photo d'exercice, import de notes, prononciation, hors ligne", free: "non", pro: "oui" },
  ],
  benefitsTitle: "Les nouveautés d'UčímePRO",
  benefits: [
    ["Tuteur IA", "Explique un exercice pas à pas, avec d'autres mots et autant de fois qu'il le faut. Il ne donne pas la réponse, il t'y mène."],
    ["Plan d'étude personnel", "Chaque semaine, tu reçois un plan sur mesure selon ce qui te pose problème. 15 minutes par jour suffisent."],
    ["Préparation aux examens et aux tests", "Examens blancs avec limite de temps, notation et estimation du résultat. C'est une section à part, les cours restent gratuits."],
    ["Photo d'un exercice → exemples similaires", "Prends en photo un exercice du manuel ou du cahier et reçois cinq exemples similaires pour t'entraîner à la même méthode."],
    ["Interrogation orale", "Le tuteur t'interroge à voix haute en histoire, en sciences ou en géographie et évalue ce qui était juste et ce qui manquait."],
    ["Cahier d'erreurs", "Chaque erreur est enregistrée avec une explication. Elles forment un cahier personnel à réviser ou à imprimer."],
    ["Import de notes", "Envoie tes notes ou une photo et elles deviennent des fiches et des quiz sur mesure."],
    ["Entraînement vocal à la prononciation", "Dis un mot à voix haute et vois tout de suite où tu en es en anglais, en allemand et dans d'autres langues."],
    ["Mode hors ligne", "Télécharge des leçons et apprends dans le train ou au chalet sans internet."],
  ],
  plans: [
    { price: "200 Kč", per: "par mois", yearly: "ou 2 000 Kč par an (2 mois offerts)", perks: ["Tuteur IA illimité", "Plan d'étude personnel", "Préparation aux examens d'entrée", "Résiliable à tout moment"] },
    { price: "400 Kč", per: "par mois", yearly: "ou 4 000 Kč par an (2 mois offerts)", perks: ["Jusqu'à 5 membres avec PRO complet", "Mode sécurisé pour enfants", "Suivi des progrès de chaque enfant", "Résiliable à tout moment"] },
    { price: "12 000 Kč", per: "par an et par école", yearly: "", perks: ["Carte des lacunes de toute la classe", "Tests prêts selon le programme", "Un exercice différent par élève", "Formation des enseignants incluse"] },
  ],
  trial: "30 jours offerts",
  note: "Tout ce qui est déjà sur le site reste gratuit, y compris les cours, les points, la roue de la fortune et l'espace parents. PRO ajoute de nouvelles fonctions. Prix TTC.",
});

const extras: Record<Locale, ProExtra> = { cs, en, de, ru, uk, ja, es, fr };

export function getProExtra(locale: Locale): ProExtra {
  return extras[locale] ?? cs;
}
