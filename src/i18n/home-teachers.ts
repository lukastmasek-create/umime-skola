import type { Locale } from "./config";

// Texty pro dvě cesty v hero sekci (žák / učitel) a sekci „Pro učitele“ na úvodní stránce.
export type HomeAudienceText = {
  playCta: string;
  teacherCta: string;
  teacherHint: string;
  accountLink: string;
  teachers: {
    eyebrow: string;
    title: string;
    lead: string;
    points: { title: string; text: string }[];
    cta: string;
    ctaHint: string;
    previewTitle: string;
    previewSample: string;
    previewDue: string;
    previewDone: string;
  };
};

const cs: HomeAudienceText = {
  playCta: "Jsem žák: začni hrát",
  teacherCta: "Jsem učitel: založ třídu",
  teacherHint: "Pro učitele zdarma, bez reklam.",
  accountLink: "Vytvořit účet",
  teachers: {
    eyebrow: "Pro učitele",
    title: "Procvičování pro celou třídu na jednom místě",
    lead: "Založ třídu, zadej žákům úkol s termínem a hned uvidíš, kdo ho splnil a kde se zasekli. Žáci se přitom učí hrou, takže procvičují rádi.",
    points: [
      { title: "Založ třídu za minutu", text: "Žáci se připojí kódem třídy. Přijetí schvaluješ ty, takže se k tobě nedostane nikdo cizí." },
      { title: "Zadej úkol s termínem", text: "Vyber kurz nebo test, nastav termín a komu úkol patří: celé třídě, nebo jen skupině." },
      { title: "Sleduj výsledky", text: "Přehled ukazuje, kdo úkol splnil, jak mu šel a které otázky dělají třídě potíže." },
      { title: "Bezpečné pro děti", text: "Bez reklam, s rodičovským zámkem. Registrace i všechny funkce pro učitele jsou zdarma." },
    ],
    cta: "Založit třídu zdarma",
    ctaHint: "Stačí se zaregistrovat a v sekci Týmy vytvořit třídu.",
    previewTitle: "Zlomky, 5. třída",
    previewSample: "Ukázka",
    previewDue: "Termín: pátek",
    previewDone: "splněno",
  },
};

const en: HomeAudienceText = {
  playCta: "I'm a student: start playing",
  teacherCta: "I'm a teacher: create a class",
  teacherHint: "Free for teachers, no ads.",
  accountLink: "Create an account",
  teachers: {
    eyebrow: "For teachers",
    title: "Practice for the whole class in one place",
    lead: "Create a class, assign pupils a task with a deadline and see right away who finished it and where they got stuck. Pupils learn through play, so they actually enjoy practising.",
    points: [
      { title: "Create a class in a minute", text: "Pupils join with a class code. You approve every request, so no outsiders get in." },
      { title: "Assign a task with a deadline", text: "Pick a course or test, set the deadline and who it is for: the whole class or just a group." },
      { title: "Track the results", text: "The overview shows who completed the task, how it went and which questions the class struggles with." },
      { title: "Safe for children", text: "No ads, with a parental lock. Registration and all teacher features are free." },
    ],
    cta: "Create a class for free",
    ctaHint: "Just sign up and create a class in the Teams section.",
    previewTitle: "Fractions, grade 5",
    previewSample: "Preview",
    previewDue: "Due: Friday",
    previewDone: "done",
  },
};

const de: HomeAudienceText = {
  playCta: "Ich bin Schüler: los geht's",
  teacherCta: "Ich bin Lehrer: Klasse anlegen",
  teacherHint: "Für Lehrkräfte kostenlos, ohne Werbung.",
  accountLink: "Konto erstellen",
  teachers: {
    eyebrow: "Für Lehrkräfte",
    title: "Üben für die ganze Klasse an einem Ort",
    lead: "Lege eine Klasse an, gib den Schülern eine Aufgabe mit Frist und sieh sofort, wer sie erledigt hat und wo es hakt. Die Schüler lernen spielerisch und üben dadurch gern.",
    points: [
      { title: "Klasse in einer Minute", text: "Schüler treten mit dem Klassencode bei. Du bestätigst jede Anfrage, es kommt also niemand Fremdes hinein." },
      { title: "Aufgabe mit Frist", text: "Wähle einen Kurs oder Test, setze die Frist und lege fest, für wen er gilt: die ganze Klasse oder nur eine Gruppe." },
      { title: "Ergebnisse verfolgen", text: "Die Übersicht zeigt, wer die Aufgabe erledigt hat, wie es lief und welche Fragen der Klasse Probleme machen." },
      { title: "Sicher für Kinder", text: "Keine Werbung, mit Kindersicherung. Registrierung und alle Lehrerfunktionen sind kostenlos." },
    ],
    cta: "Klasse kostenlos anlegen",
    ctaHint: "Einfach registrieren und im Bereich Teams eine Klasse erstellen.",
    previewTitle: "Brüche, 5. Klasse",
    previewSample: "Vorschau",
    previewDue: "Frist: Freitag",
    previewDone: "erledigt",
  },
};

const ru: HomeAudienceText = {
  playCta: "Я ученик: начать играть",
  teacherCta: "Я учитель: создать класс",
  teacherHint: "Для учителей бесплатно, без рекламы.",
  accountLink: "Создать аккаунт",
  teachers: {
    eyebrow: "Для учителей",
    title: "Тренировка для всего класса в одном месте",
    lead: "Создайте класс, задайте ученикам задание со сроком и сразу увидите, кто его выполнил и где возникли трудности. Ученики учатся в игре, поэтому занимаются охотно.",
    points: [
      { title: "Класс за минуту", text: "Ученики входят по коду класса. Каждую заявку подтверждаете вы, так что посторонние не попадут." },
      { title: "Задание со сроком", text: "Выберите курс или тест, задайте срок и кому он адресован: всему классу или только группе." },
      { title: "Следите за результатами", text: "Обзор показывает, кто выполнил задание, как у него получилось и какие вопросы вызывают трудности у класса." },
      { title: "Безопасно для детей", text: "Без рекламы, с родительским замком. Регистрация и все функции для учителей бесплатны." },
    ],
    cta: "Создать класс бесплатно",
    ctaHint: "Достаточно зарегистрироваться и создать класс в разделе «Команды».",
    previewTitle: "Дроби, 5 класс",
    previewSample: "Пример",
    previewDue: "Срок: пятница",
    previewDone: "выполнено",
  },
};

const uk: HomeAudienceText = {
  playCta: "Я учень: почати грати",
  teacherCta: "Я вчитель: створити клас",
  teacherHint: "Для вчителів безкоштовно, без реклами.",
  accountLink: "Створити обліковий запис",
  teachers: {
    eyebrow: "Для вчителів",
    title: "Тренування для всього класу в одному місці",
    lead: "Створи клас, дай учням завдання з терміном і одразу побачиш, хто його виконав і де виникли труднощі. Учні вчаться через гру, тож із задоволенням тренуються.",
    points: [
      { title: "Клас за хвилину", text: "Учні приєднуються за кодом класу. Кожну заявку підтверджуєш ти, тож сторонні не потраплять." },
      { title: "Завдання з терміном", text: "Обери курс або тест, постав термін і вкажи, кому завдання: усьому класу чи лише групі." },
      { title: "Стеж за результатами", text: "Огляд показує, хто виконав завдання, як у нього пішло і які питання викликають труднощі в класі." },
      { title: "Безпечно для дітей", text: "Без реклами, з батьківським замком. Реєстрація та всі функції для вчителів безкоштовні." },
    ],
    cta: "Створити клас безкоштовно",
    ctaHint: "Просто зареєструйся і створи клас у розділі «Команди».",
    previewTitle: "Дроби, 5 клас",
    previewSample: "Приклад",
    previewDue: "Термін: п'ятниця",
    previewDone: "виконано",
  },
};

const ja: HomeAudienceText = {
  playCta: "生徒です：遊びを始める",
  teacherCta: "先生です：クラスを作る",
  teacherHint: "先生は無料で、広告もありません。",
  accountLink: "アカウントを作成",
  teachers: {
    eyebrow: "先生の方へ",
    title: "クラス全員の練習を1か所で",
    lead: "クラスを作って、期限つきの課題を生徒に出しましょう。誰が終わらせたか、どこでつまずいたかがすぐにわかります。生徒はゲームを通して学ぶので、楽しく練習できます。",
    points: [
      { title: "1分でクラスを作成", text: "生徒はクラスコードで参加します。参加の承認はあなたが行うので、部外者が入ることはありません。" },
      { title: "期限つきで課題を出す", text: "コースかテストを選び、期限と対象を設定します。クラス全員でも、特定のグループだけでもOKです。" },
      { title: "結果を確認", text: "一覧で、誰が課題を終えたか、どのくらいできたか、クラスがどの問題に苦戦しているかがわかります。" },
      { title: "子どもにも安心", text: "広告なし、保護者用のロック付き。登録も先生向けの機能もすべて無料です。" },
    ],
    cta: "無料でクラスを作成",
    ctaHint: "登録して、「チーム」のセクションでクラスを作成するだけです。",
    previewTitle: "分数、5年生",
    previewSample: "サンプル",
    previewDue: "期限: 金曜日",
    previewDone: "完了",
  },
};

const es: HomeAudienceText = {
  playCta: "Soy alumno: empezar a jugar",
  teacherCta: "Soy profesor: crear una clase",
  teacherHint: "Gratis para profesores, sin anuncios.",
  accountLink: "Crear una cuenta",
  teachers: {
    eyebrow: "Para profesores",
    title: "Práctica para toda la clase en un solo lugar",
    lead: "Crea una clase, asigna a los alumnos una tarea con fecha límite y verás al instante quién la ha terminado y dónde se han atascado. Los alumnos aprenden jugando, así que practican con gusto.",
    points: [
      { title: "Crea una clase en un minuto", text: "Los alumnos se unen con el código de la clase. Tú apruebas cada solicitud, así que no entra nadie ajeno." },
      { title: "Asigna una tarea con fecha límite", text: "Elige un curso o un test, fija la fecha límite y a quién va dirigido: a toda la clase o solo a un grupo." },
      { title: "Sigue los resultados", text: "El resumen muestra quién ha completado la tarea, qué tal le ha ido y qué preguntas le cuestan a la clase." },
      { title: "Seguro para niños", text: "Sin anuncios y con bloqueo parental. El registro y todas las funciones para profesores son gratuitos." },
    ],
    cta: "Crear una clase gratis",
    ctaHint: "Solo tienes que registrarte y crear una clase en la sección Equipos.",
    previewTitle: "Fracciones, 5.º de primaria",
    previewSample: "Vista previa",
    previewDue: "Fecha límite: viernes",
    previewDone: "hecho",
  },
};

const fr: HomeAudienceText = {
  playCta: "Je suis élève : commencer à jouer",
  teacherCta: "Je suis enseignant : créer une classe",
  teacherHint: "Gratuit pour les enseignants, sans publicité.",
  accountLink: "Créer un compte",
  teachers: {
    eyebrow: "Pour les enseignants",
    title: "De l'entraînement pour toute la classe, au même endroit",
    lead: "Crée une classe, donne aux élèves un exercice avec une échéance et vois tout de suite qui l'a fait et où ils bloquent. Les élèves apprennent en jouant, alors ils s'entraînent volontiers.",
    points: [
      { title: "Une classe en une minute", text: "Les élèves rejoignent avec le code de la classe. Tu valides chaque demande, donc personne d'extérieur n'entre." },
      { title: "Un exercice avec échéance", text: "Choisis un parcours ou un test, fixe l'échéance et les destinataires : toute la classe ou seulement un groupe." },
      { title: "Suis les résultats", text: "Le tableau de bord montre qui a terminé l'exercice, comment ça s'est passé et les questions qui posent problème à la classe." },
      { title: "Sûr pour les enfants", text: "Sans publicité, avec un verrou parental. L'inscription et toutes les fonctions enseignants sont gratuites." },
    ],
    cta: "Créer une classe gratuitement",
    ctaHint: "Il suffit de t'inscrire et de créer une classe dans la rubrique Équipes.",
    previewTitle: "Fractions, 5e",
    previewSample: "Aperçu",
    previewDue: "Échéance : vendredi",
    previewDone: "fait",
  },
};

const all: Record<Locale, HomeAudienceText> = { cs, en, de, ru, uk, ja, es, fr };

export function getHomeAudienceText(locale: Locale): HomeAudienceText {
  return all[locale];
}
