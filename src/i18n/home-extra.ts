import type { Locale } from "./config";

// Doplňky úvodní stránky: rychlá navigace po sekcích, štítky důvěry, čísla a časté otázky.
// Čísla se dosazují z dat (počet předmětů, jazyků), texty tvrdí jen to, co web opravdu nabízí.
export type HomeExtraText = {
  nav: { label: string; play: string; subjects: string; sections: string; teachers: string; about: string; faq: string };
  badges: [string, string, string, string];
  stats: { subjects: string; levels: string; languages: string; ads: string };
  faq: { title: string; items: { q: string; a: string }[]; privacy: string };
};

const cs: HomeExtraText = {
  nav: { label: "Sekce stránky", play: "Hrát", subjects: "Předměty", sections: "Stupně", teachers: "Učitelé", about: "O nás", faq: "Otázky" },
  badges: ["Registrace zdarma", "Rodičovský zámek", "Vysvětlení u každé odpovědi", "Pro učitele zdarma"],
  stats: { subjects: "předmětů", levels: "úrovní v každém kurzu", languages: "jazyků", ads: "reklam" },
  faq: {
    title: "Časté otázky",
    items: [
      { q: "Kolik to stojí?", a: "Kurzy, body i rodičovský panel jsou zdarma a pro učitele je zdarma vše. Volitelné UčímePRO přidává AI doučovače, přípravu na přijímačky a další nástroje." },
      { q: "Pro jaký věk to je?", a: "Od 1. třídy základní školy přes přijímačky až po maturitu. Každý kurz má pět úrovní obtížnosti." },
      { q: "Jak začít se třídou?", a: "Zaregistruj se a v sekci Týmy založ třídu. Žáci se připojí kódem a ty jim zadáš úkol s termínem." },
      { q: "Co se děje s daty?", a: "Používáme jen nezbytné cookies pro přihlášení, jazyk a ochranu proti botům. Nezobrazujeme žádné reklamy." },
    ],
    privacy: "Ochrana soukromí",
  },
};

const en: HomeExtraText = {
  nav: { label: "Page sections", play: "Play", subjects: "Subjects", sections: "Stages", teachers: "Teachers", about: "About", faq: "FAQ" },
  badges: ["Free sign-up", "Parental lock", "Explanation for every answer", "Free for teachers"],
  stats: { subjects: "subjects", levels: "levels in every course", languages: "languages", ads: "ads" },
  faq: {
    title: "Frequently asked questions",
    items: [
      { q: "How much does it cost?", a: "Courses, points and the parent panel are free, and everything is free for teachers. The optional UčímePRO adds an AI tutor, exam prep and more tools." },
      { q: "What age is it for?", a: "From the 1st grade of primary school through entrance exams to the final school-leaving exam. Every course has five difficulty levels." },
      { q: "How do I start with my class?", a: "Sign up and create a class in the Teams section. Students join with a code and you assign them work with a deadline." },
      { q: "What happens to my data?", a: "We only use essential cookies for sign-in, language and bot protection. We show no ads at all." },
    ],
    privacy: "Privacy policy",
  },
};

const de: HomeExtraText = {
  nav: { label: "Seitenabschnitte", play: "Spielen", subjects: "Fächer", sections: "Stufen", teachers: "Lehrkräfte", about: "Über uns", faq: "Fragen" },
  badges: ["Kostenlose Anmeldung", "Elternsperre", "Erklärung zu jeder Antwort", "Für Lehrkräfte kostenlos"],
  stats: { subjects: "Fächer", levels: "Stufen in jedem Kurs", languages: "Sprachen", ads: "Werbung" },
  faq: {
    title: "Häufige Fragen",
    items: [
      { q: "Was kostet es?", a: "Kurse, Punkte und das Eltern-Panel sind kostenlos, für Lehrkräfte ist alles kostenlos. Das optionale UčímePRO bietet einen KI-Nachhilfelehrer, Prüfungsvorbereitung und weitere Werkzeuge." },
      { q: "Für welches Alter ist es?", a: "Von der 1. Klasse der Grundschule über die Aufnahmeprüfungen bis zum Abitur. Jeder Kurs hat fünf Schwierigkeitsstufen." },
      { q: "Wie starte ich mit meiner Klasse?", a: "Registriere dich und lege im Bereich Teams eine Klasse an. Die Schüler treten mit einem Code bei und du gibst ihnen Aufgaben mit Termin." },
      { q: "Was passiert mit den Daten?", a: "Wir nutzen nur notwendige Cookies für Anmeldung, Sprache und Schutz vor Bots. Wir zeigen keine Werbung." },
    ],
    privacy: "Datenschutz",
  },
};

const ru: HomeExtraText = {
  nav: { label: "Разделы страницы", play: "Играть", subjects: "Предметы", sections: "Ступени", teachers: "Учителям", about: "О нас", faq: "Вопросы" },
  badges: ["Бесплатная регистрация", "Родительский замок", "Объяснение к каждому ответу", "Для учителей бесплатно"],
  stats: { subjects: "предметов", levels: "уровней в каждом курсе", languages: "языков", ads: "рекламы" },
  faq: {
    title: "Частые вопросы",
    items: [
      { q: "Сколько это стоит?", a: "Курсы, баллы и родительская панель бесплатны, а для учителей бесплатно всё. Дополнительный UčímePRO добавляет ИИ-репетитора, подготовку к экзаменам и другие инструменты." },
      { q: "Для какого возраста?", a: "С 1-го класса начальной школы через вступительные экзамены до выпускного экзамена. В каждом курсе пять уровней сложности." },
      { q: "Как начать с классом?", a: "Зарегистрируйся и создай класс в разделе «Команды». Ученики присоединятся по коду, а ты дашь им задание со сроком." },
      { q: "Что происходит с данными?", a: "Мы используем только необходимые cookies для входа, языка и защиты от ботов. Никакой рекламы мы не показываем." },
    ],
    privacy: "Конфиденциальность",
  },
};

const uk: HomeExtraText = {
  nav: { label: "Розділи сторінки", play: "Грати", subjects: "Предмети", sections: "Ступені", teachers: "Учителям", about: "Про нас", faq: "Питання" },
  badges: ["Безкоштовна реєстрація", "Батьківський замок", "Пояснення до кожної відповіді", "Для вчителів безкоштовно"],
  stats: { subjects: "предметів", levels: "рівнів у кожному курсі", languages: "мов", ads: "реклами" },
  faq: {
    title: "Часті питання",
    items: [
      { q: "Скільки це коштує?", a: "Курси, бали й батьківська панель безкоштовні, а для вчителів безкоштовно все. Додатковий UčímePRO додає ШІ-репетитора, підготовку до іспитів та інші інструменти." },
      { q: "Для якого віку?", a: "Від 1-го класу початкової школи через вступні іспити до випускного іспиту. Кожен курс має п'ять рівнів складності." },
      { q: "Як почати з класом?", a: "Зареєструйся і створи клас у розділі «Команди». Учні приєднаються за кодом, а ти даси їм завдання з терміном." },
      { q: "Що відбувається з даними?", a: "Ми використовуємо лише необхідні cookies для входу, мови та захисту від ботів. Жодної реклами ми не показуємо." },
    ],
    privacy: "Конфіденційність",
  },
};

const ja: HomeExtraText = {
  nav: { label: "ページのセクション", play: "遊ぶ", subjects: "教科", sections: "学年", teachers: "先生へ", about: "私たちについて", faq: "よくある質問" },
  badges: ["無料登録", "ペアレンタルロック", "すべての答えに解説", "先生は無料"],
  stats: { subjects: "教科", levels: "各コースのレベル", languages: "言語", ads: "広告" },
  faq: {
    title: "よくある質問",
    items: [
      { q: "料金はかかりますか？", a: "コース、ポイント、保護者パネルは無料で、先生はすべて無料です。オプションの UčímePRO では AI 家庭教師や受験対策などのツールが使えます。" },
      { q: "対象年齢は？", a: "小学1年生から入学試験、卒業試験まで。各コースには5つの難易度があります。" },
      { q: "クラスで始めるには？", a: "登録して「チーム」でクラスを作成します。生徒はコードで参加し、期限付きの課題を出せます。" },
      { q: "データはどう扱われますか？", a: "ログイン、言語、ボット対策に必要な Cookie だけを使います。広告は一切表示しません。" },
    ],
    privacy: "プライバシー",
  },
};

const es: HomeExtraText = {
  nav: { label: "Secciones de la página", play: "Jugar", subjects: "Asignaturas", sections: "Etapas", teachers: "Docentes", about: "Nosotros", faq: "Preguntas" },
  badges: ["Registro gratis", "Control parental", "Explicación en cada respuesta", "Gratis para docentes"],
  stats: { subjects: "asignaturas", levels: "niveles en cada curso", languages: "idiomas", ads: "anuncios" },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "¿Cuánto cuesta?", a: "Los cursos, los puntos y el panel para padres son gratis, y para docentes todo es gratis. El UčímePRO opcional añade un tutor con IA, preparación de exámenes y más herramientas." },
      { q: "¿Para qué edad es?", a: "Desde 1.º de primaria, pasando por los exámenes de acceso, hasta el examen final de bachillerato. Cada curso tiene cinco niveles de dificultad." },
      { q: "¿Cómo empiezo con mi clase?", a: "Regístrate y crea una clase en la sección Equipos. Los alumnos se unen con un código y tú les asignas tareas con fecha límite." },
      { q: "¿Qué pasa con los datos?", a: "Solo usamos cookies necesarias para el inicio de sesión, el idioma y la protección contra bots. No mostramos anuncios." },
    ],
    privacy: "Privacidad",
  },
};

const fr: HomeExtraText = {
  nav: { label: "Sections de la page", play: "Jouer", subjects: "Matières", sections: "Niveaux", teachers: "Enseignants", about: "À propos", faq: "Questions" },
  badges: ["Inscription gratuite", "Contrôle parental", "Explication pour chaque réponse", "Gratuit pour les enseignants"],
  stats: { subjects: "matières", levels: "niveaux dans chaque cours", languages: "langues", ads: "publicité" },
  faq: {
    title: "Questions fréquentes",
    items: [
      { q: "Combien ça coûte ?", a: "Les cours, les points et le panneau parents sont gratuits, et tout est gratuit pour les enseignants. L'option UčímePRO ajoute un tuteur IA, la préparation aux examens et d'autres outils." },
      { q: "Pour quel âge ?", a: "Du CP jusqu'au bac, en passant par les examens d'entrée. Chaque cours a cinq niveaux de difficulté." },
      { q: "Comment commencer avec ma classe ?", a: "Inscris-toi et crée une classe dans la section Équipes. Les élèves rejoignent avec un code et tu leur donnes des devoirs avec une date limite." },
      { q: "Que deviennent les données ?", a: "Nous n'utilisons que les cookies nécessaires à la connexion, à la langue et à la protection contre les bots. Aucune publicité." },
    ],
    privacy: "Confidentialité",
  },
};

const texts: Record<Locale, HomeExtraText> = { cs, en, de, ru, uk, ja, es, fr };

export function getHomeExtraText(locale: Locale): HomeExtraText {
  return texts[locale];
}
