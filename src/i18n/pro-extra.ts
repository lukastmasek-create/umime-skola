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

const ICONS = ["🤖", "🗓️", "🎯", "📷", "🎤", "📒", "📝", "🗣️", "📴"];

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
    { price: "100 Kč", per: "měsíčně", yearly: "nebo 1 000 Kč ročně (2 měsíce zdarma)", perks: ["1 účet", "Všechny výhody PRO pro jednotlivce", "Zrušení kdykoli"] },
    { price: "250 Kč", per: "měsíčně", yearly: "nebo 2 500 Kč ročně (2 měsíce zdarma)", perks: ["Až 5 členů rodiny s plným PRO", "Dětský bezpečný režim", "Začínat s dítětem: tipy, jak pomoci, aniž bys rušil/a", "Plán na prázdniny, ať se po létě nic nezapomene", "Rodinný souboj s handicapem pro vyrovnané šance"] },
    { price: "12 000 Kč", per: "ročně za školu", yearly: "", perks: ["Mapa mezer třídy s hotovou 20min lekcí na další hodinu", "Souběžná hodina: třída hraje týmově, učitel vidí, kdo se zasekl", "Nepsané testy podle RVP s klíčem a hodnocením", "Každý žák má jiné zadání, opisování nemá smysl", "Exit ticket za 2 minuty na konci hodiny", "Kamarád pro suplování: hodina zadaná jedním kliknutím", "Průvodce rodičovskými schůzkami: stránka o každém žákovi", "Pomalejší a rychlejší tempo bez nálepek", "Vlastní obsah školy z nahraných učebnic", "Zaškolení učitelů a přednostní podpora"] },
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
    { price: "CZK 100", per: "per month", yearly: "or CZK 1,000 per year (2 months free)", perks: ["1 account", "All PRO features for individuals", "Cancel anytime"] },
    { price: "CZK 250", per: "per month", yearly: "or CZK 2,500 per year (2 months free)", perks: ["Up to 5 family members with full PRO", "Child safe mode", "Start with the child: tips on how to help without interrupting", "Holiday plan so nothing is forgotten over the summer", "Family duel with a handicap for fair chances"] },
    { price: "CZK 12,000", per: "per year per school", yearly: "", perks: ["Class gap map with a ready 20-minute lesson for the next class", "Live lesson: the class plays in teams and the teacher sees who is stuck", "Unseen tests based on the curriculum with key and grading", "Every pupil gets a different task, so copying is pointless", "2-minute exit ticket at the end of a lesson", "Cover teacher buddy: a lesson assigned with one click", "Parent-meeting guide: a page about each pupil", "Slower and faster pace with no labels", "School's own content from uploaded textbooks", "Teacher training and priority support"] },
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
    { price: "100 Kč", per: "pro Monat", yearly: "oder 1.000 Kč pro Jahr (2 Monate gratis)", perks: ["1 Konto", "Alle PRO-Vorteile für Einzelpersonen", "Jederzeit kündbar"] },
    { price: "250 Kč", per: "pro Monat", yearly: "oder 2.500 Kč pro Jahr (2 Monate gratis)", perks: ["Bis zu 5 Familienmitglieder mit vollem PRO", "Sicherer Kindermodus", "Mit dem Kind starten: Tipps zum Helfen, ohne zu stören", "Ferienplan, damit im Sommer nichts vergessen wird", "Familienduell mit Handicap für faire Chancen"] },
    { price: "12.000 Kč", per: "pro Jahr und Schule", yearly: "", perks: ["Lücken-Karte der Klasse mit fertiger 20-Minuten-Lektion für die nächste Stunde", "Parallele Stunde: Die Klasse spielt im Team, die Lehrkraft sieht, wer feststeckt", "Ungeübte Tests nach Lehrplan mit Schlüssel und Bewertung", "Jedes Kind bekommt eine andere Aufgabe, Abschreiben bringt nichts", "Exit-Ticket in 2 Minuten am Stundenende", "Vertretungs-Buddy: Stunde mit einem Klick zugewiesen", "Leitfaden für Elternabende: eine Seite pro Kind", "Langsameres und schnelleres Tempo ohne Etiketten", "Eigene Inhalte der Schule aus hochgeladenen Lehrbüchern", "Lehrerschulung und bevorzugter Support"] },
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
    { price: "100 Kč", per: "в месяц", yearly: "или 1 000 Kč в год (2 месяца бесплатно)", perks: ["1 аккаунт", "Все возможности PRO для одного", "Отмена в любой момент"] },
    { price: "250 Kč", per: "в месяц", yearly: "или 2 500 Kč в год (2 месяца бесплатно)", perks: ["До 5 членов семьи с полным PRO", "Безопасный детский режим", "Начинать вместе с ребёнком: советы, как помочь, не мешая", "План на каникулы, чтобы за лето ничего не забылось", "Семейная дуэль с форой для равных шансов"] },
    { price: "12 000 Kč", per: "в год за школу", yearly: "", perks: ["Карта пробелов класса с готовым 20-минутным уроком на следующее занятие", "Параллельный урок: класс играет командами, учитель видит, кто застрял", "Новые тесты по программе с ключом и оценкой", "У каждого ученика своё задание, списывать бессмысленно", "Exit ticket за 2 минуты в конце урока", "Помощник для замены: урок задаётся одним щелчком", "Путеводитель по родительским собраниям: страница о каждом ученике", "Медленнее и быстрее без ярлыков", "Собственный контент школы из загруженных учебников", "Обучение учителей и приоритетная поддержка"] },
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
    { price: "100 Kč", per: "на місяць", yearly: "або 1 000 Kč на рік (2 місяці безкоштовно)", perks: ["1 акаунт", "Усі можливості PRO для однієї особи", "Скасування будь-коли"] },
    { price: "250 Kč", per: "на місяць", yearly: "або 2 500 Kč на рік (2 місяці безкоштовно)", perks: ["До 5 членів родини з повним PRO", "Безпечний дитячий режим", "Починати з дитиною: поради, як допомогти, не заважаючи", "План на канікули, щоб за літо нічого не забулося", "Родинний двобій із форою для рівних шансів"] },
    { price: "12 000 Kč", per: "на рік за школу", yearly: "", perks: ["Карта прогалин класу з готовим 20-хвилинним уроком на наступне заняття", "Паралельний урок: клас грає командами, вчитель бачить, хто застряг", "Нові тести за програмою з ключем і оцінюванням", "Кожен учень має інше завдання, списувати марно", "Exit ticket за 2 хвилини наприкінці уроку", "Помічник для заміни: урок задається одним кліком", "Путівник батьківськими зборами: сторінка про кожного учня", "Повільніший і швидший темп без ярликів", "Власний контент школи із завантажених підручників", "Навчання вчителів і пріоритетна підтримка"] },
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
    { price: "100 Kč", per: "月額", yearly: "または年額1,000 Kč（2か月分無料）", perks: ["1アカウント", "個人向けのPRO機能すべて", "いつでも解約可能"] },
    { price: "250 Kč", per: "月額", yearly: "または年額2,500 Kč（2か月分無料）", perks: ["最大5人の家族がフルPROを利用", "お子さま向けセーフモード", "子どもと一緒に始める：邪魔せずに助けるヒント", "夏休みの間に忘れないための休暇プラン", "ハンデつきで対等に戦える家族対決"] },
    { price: "12,000 Kč", per: "学校あたり年額", yearly: "", perks: ["次の授業用の20分レッスンつき、クラスの弱点マップ", "同時進行の授業：クラスがチームで遊び、先生はつまずいている子が分かる", "学習指導要領に沿った未発表テスト（答えと採点つき）", "生徒ごとに違う課題なので、写しても意味がない", "授業の最後に2分のエグジットチケット", "代理授業の味方：1クリックで授業を設定", "保護者面談ガイド：生徒ごとの1ページ", "ラベルなしで遅く・速くできるペース調整", "アップロードした教科書からの学校独自コンテンツ", "教員研修と優先サポート"] },
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
    { price: "100 Kč", per: "al mes", yearly: "o 1000 Kč al año (2 meses gratis)", perks: ["1 cuenta", "Todas las ventajas PRO para una persona", "Cancela cuando quieras"] },
    { price: "250 Kč", per: "al mes", yearly: "o 2500 Kč al año (2 meses gratis)", perks: ["Hasta 5 miembros de la familia con PRO completo", "Modo seguro para niños", "Empezar con el niño: consejos para ayudar sin molestar", "Plan de vacaciones para que no se olvide nada en verano", "Duelo familiar con ventaja para igualar las opciones"] },
    { price: "12 000 Kč", per: "al año por colegio", yearly: "", perks: ["Mapa de lagunas de la clase con una lección de 20 minutos lista para la siguiente hora", "Clase simultánea: la clase juega en equipos y el profesor ve quién se atasca", "Pruebas inéditas según el currículo con solucionario y valoración", "Cada alumno recibe una tarea distinta, copiar no sirve de nada", "Exit ticket de 2 minutos al final de la clase", "Compañero de sustitución: una clase asignada con un clic", "Guía para reuniones con padres: una página de cada alumno", "Ritmo más lento y más rápido sin etiquetas", "Contenido propio del colegio a partir de libros subidos", "Formación del profesorado y soporte prioritario"] },
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
    { price: "100 Kč", per: "par mois", yearly: "ou 1 000 Kč par an (2 mois offerts)", perks: ["1 compte", "Tous les avantages PRO pour une personne", "Résiliation à tout moment"] },
    { price: "250 Kč", per: "par mois", yearly: "ou 2 500 Kč par an (2 mois offerts)", perks: ["Jusqu'à 5 membres de la famille avec le PRO complet", "Mode enfant sécurisé", "Commencer avec l'enfant : conseils pour aider sans déranger", "Plan de vacances pour que rien ne soit oublié pendant l'été", "Duel familial avec handicap pour des chances égales"] },
    { price: "12 000 Kč", per: "par an et par école", yearly: "", perks: ["Carte des lacunes de la classe avec une leçon de 20 minutes prête pour le cours suivant", "Cours en direct : la classe joue en équipes et l'enseignant voit qui est bloqué", "Tests inédits selon le programme, avec corrigé et barème", "Chaque élève a un devoir différent, copier ne sert à rien", "Exit ticket de 2 minutes en fin de cours", "Copain de remplacement : un cours attribué en un clic", "Guide des réunions de parents : une page par élève", "Rythme plus lent et plus rapide sans étiquettes", "Contenu propre à l'école à partir de manuels importés", "Formation des enseignants et assistance prioritaire"] },
  ],
  trial: "30 jours offerts",
  note: "Tout ce qui est déjà sur le site reste gratuit, y compris les cours, les points, la roue de la fortune et l'espace parents. PRO ajoute de nouvelles fonctions. Prix TTC.",
});

const extras: Record<Locale, ProExtra> = { cs, en, de, ru, uk, ja, es, fr };

export function getProExtra(locale: Locale): ProExtra {
  return extras[locale] ?? cs;
}
