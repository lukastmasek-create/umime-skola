import { withFallbacks } from "./config";
import type { Locale } from "./config";

type MaterialsText = {
  nav: string;
  title: string;
  subtitle: string;
  czechOnlyNote: string;
  topics: string;
  levels: Record<1 | 2 | 3 | 4, { title: string; hint: string }>;
  contents: string;
  remember: string;
  practice: string;
  practiceHint: string;
  prev: string;
  next: string;
  allCourses: string;
  interactive: { check: string; right: string; wrong: string; cards: string; flip: string; practice: string; again: string; score: string };
  back: string;
  allSubjects: string;
  examples: string;
  tip: string;
};

const texts: Record<Locale, MaterialsText> = {
  ...withFallbacks({
  cs: {
    nav: "Materiály",
    title: "Výukové materiály",
    subtitle: "Přehledné výtahy z učiva ke všem předmětům – od úplných základů až po pokročilé téma. Po přečtení si látku procvičíš v kurzech.",
    czechOnlyNote: "",
    topics: "Témat",
    levels: {
      1: { title: "Úplné základy", hint: "1.–3. třída" },
      2: { title: "Základní učivo", hint: "4.–6. třída" },
      3: { title: "Pokročilé", hint: "7.–9. třída" },
      4: { title: "Příprava na přijímačky", hint: "9. třída a přijímací zkoušky" },
    },
    contents: "Obsah",
    remember: "Co si zapamatovat",
    practice: "Procvičit v kurzech",
    practiceHint: "Máš to přečtené? Vyzkoušej si látku v testech.",
    prev: "Předchozí téma",
    next: "Další téma",
    allCourses: "Všechny kurzy předmětu",
    interactive: { check: "Ověř si", right: "Správně!", wrong: "Vedle, správně je:", cards: "Kartičky – klikni a otoč", flip: "Otočit kartičku", practice: "Procvič si téma", again: "Znovu", score: "Hotovo! Správně {a} z {b}." },
    back: "Zpět na přehled předmětu",
    allSubjects: "Všechny předměty",
    examples: "Příklady",
    tip: "Tip",
  },
  en: {
    nav: "Materials",
    title: "Study materials",
    subtitle: "Clear summaries of the curriculum for every subject – from the very basics to advanced topics. After reading, practise in the courses.",
    czechOnlyNote: "The study materials are written in Czech.",
    topics: "Topics",
    levels: {
      1: { title: "The very basics", hint: "grades 1–3" },
      2: { title: "Core material", hint: "grades 4–6" },
      3: { title: "Advanced", hint: "grades 7–9" },
      4: { title: "Entrance exam prep", hint: "grade 9 and entrance exams" },
    },
    contents: "Contents",
    remember: "Key points",
    practice: "Practise in courses",
    practiceHint: "Done reading? Test yourself in the quizzes.",
    prev: "Previous topic",
    next: "Next topic",
    allCourses: "All courses in this subject",
    interactive: { check: "Check yourself", right: "Correct!", wrong: "Not quite, the answer is:", cards: "Flashcards – click to flip", flip: "Flip the card", practice: "Practise this topic", again: "Again", score: "Done! {a} of {b} correct." },
    back: "Back to subject overview",
    allSubjects: "All subjects",
    examples: "Examples",
    tip: "Tip",
  },
  de: {
    nav: "Lernmaterial",
    title: "Lernmaterial",
    subtitle: "Übersichtliche Zusammenfassungen des Stoffs für alle Fächer – von den Grundlagen bis zu fortgeschrittenen Themen. Danach kannst du in den Kursen üben.",
    czechOnlyNote: "Das Lernmaterial ist auf Tschechisch verfasst.",
    topics: "Themen",
    levels: {
      1: { title: "Ganz einfache Grundlagen", hint: "Klasse 1–3" },
      2: { title: "Grundwissen", hint: "Klasse 4–6" },
      3: { title: "Fortgeschritten", hint: "Klasse 7–9" },
      4: { title: "Aufnahmeprüfung", hint: "Klasse 9 und Aufnahmeprüfungen" },
    },
    contents: "Inhalt",
    remember: "Das solltest du dir merken",
    practice: "In den Kursen üben",
    practiceHint: "Fertig gelesen? Teste dich in den Quizzen.",
    prev: "Vorheriges Thema",
    next: "Nächstes Thema",
    allCourses: "Alle Kurse des Fachs",
    interactive: { check: "Teste dich", right: "Richtig!", wrong: "Leider nicht, richtig ist:", cards: "Karteikarten – klicken zum Umdrehen", flip: "Karte umdrehen", practice: "Thema üben", again: "Nochmal", score: "Fertig! {a} von {b} richtig." },
    back: "Zurück zur Fachübersicht",
    allSubjects: "Alle Fächer",
    examples: "Beispiele",
    tip: "Tipp",
  },
  ru: {
    nav: "Материалы",
    title: "Учебные материалы",
    subtitle: "Краткие конспекты по всем предметам — от самых основ до продвинутых тем. После чтения закрепи знания в курсах.",
    czechOnlyNote: "Учебные материалы написаны на чешском языке.",
    topics: "Тем",
    levels: {
      1: { title: "Самые основы", hint: "1–3 классы" },
      2: { title: "Базовый материал", hint: "4–6 классы" },
      3: { title: "Продвинутый уровень", hint: "7–9 классы" },
      4: { title: "Подготовка к вступительным экзаменам", hint: "9 класс и вступительные экзамены" },
    },
    contents: "Содержание",
    remember: "Что запомнить",
    practice: "Тренироваться в курсах",
    practiceHint: "Прочитал? Проверь себя в тестах.",
    prev: "Предыдущая тема",
    next: "Следующая тема",
    allCourses: "Все курсы предмета",
    interactive: { check: "Проверь себя", right: "Верно!", wrong: "Не совсем, правильно:", cards: "Карточки – нажми, чтобы перевернуть", flip: "Перевернуть карточку", practice: "Потренируйся", again: "Ещё раз", score: "Готово! Верно {a} из {b}." },
    back: "Назад к обзору предмета",
    allSubjects: "Все предметы",
    examples: "Примеры",
    tip: "Совет",
  },
  }),
  uk: {
    nav: "Матеріали",
    title: "Навчальні матеріали",
    subtitle: "Короткі конспекти з навчального матеріалу всіх предметів: від самих основ до просунутих тем. Після читання закріпи знання в курсах.",
    czechOnlyNote: "Навчальні матеріали написані чеською мовою.",
    topics: "Тем",
    levels: {
      1: { title: "Самі основи", hint: "1.–3. клас" },
      2: { title: "Базовий матеріал", hint: "4.–6. клас" },
      3: { title: "Просунутий рівень", hint: "7.–9. клас" },
      4: { title: "Підготовка до вступних іспитів", hint: "9. клас і вступні іспити" },
    },
    contents: "Зміст",
    remember: "Що запам'ятати",
    practice: "Потренуватися в курсах",
    practiceHint: "Прочитано? Перевір себе в тестах.",
    prev: "Попередня тема",
    next: "Наступна тема",
    allCourses: "Усі курси предмета",
    interactive: { check: "Перевір себе", right: "Правильно!", wrong: "Не зовсім, правильно:", cards: "Картки: клацни, щоб перевернути", flip: "Перевернути картку", practice: "Потренуй тему", again: "Ще раз", score: "Готово! Правильно {a} з {b}." },
    back: "Назад до огляду предмета",
    allSubjects: "Усі предмети",
    examples: "Приклади",
    tip: "Порада",
  },
  ja: {
    nav: "教材",
    title: "学習教材",
    subtitle: "すべての教科の学習内容を、いちばん基本の内容から発展的なテーマまでわかりやすくまとめました。読んだあとは、コースで練習しましょう。",
    czechOnlyNote: "学習教材はチェコ語で書かれています。",
    topics: "テーマ数",
    levels: {
      1: { title: "いちばん基本", hint: "1〜3年生" },
      2: { title: "基礎の学習内容", hint: "4〜6年生" },
      3: { title: "発展", hint: "7〜9年生" },
      4: { title: "入試対策", hint: "9年生と入学試験" },
    },
    contents: "目次",
    remember: "覚えておきたいこと",
    practice: "コースで練習する",
    practiceHint: "読み終わりましたか？ テストで力をためしてみましょう。",
    prev: "前のテーマ",
    next: "次のテーマ",
    allCourses: "この教科のすべてのコース",
    interactive: { check: "確認しよう", right: "正解です！", wrong: "惜しい、正解は:", cards: "カード: クリックしてめくろう", flip: "カードをめくる", practice: "このテーマを練習", again: "もう一度", score: "できました！ {b} 問中 {a} 問正解です。" },
    back: "教科の一覧に戻る",
    allSubjects: "すべての教科",
    examples: "例",
    tip: "ヒント",
  },
  es: {
    nav: "Materiales",
    title: "Materiales de estudio",
    subtitle: "Resúmenes claros del temario de todas las asignaturas, desde lo más básico hasta temas avanzados. Después de leer, practica en los cursos.",
    czechOnlyNote: "Los materiales de estudio están escritos en checo.",
    topics: "Temas",
    levels: {
      1: { title: "Lo más básico", hint: "1.º–3.º curso" },
      2: { title: "Contenido básico", hint: "4.º–6.º curso" },
      3: { title: "Avanzado", hint: "7.º–9.º curso" },
      4: { title: "Preparación para el examen de acceso", hint: "9.º curso y exámenes de admisión" },
    },
    contents: "Contenido",
    remember: "Puntos clave",
    practice: "Practica en los cursos",
    practiceHint: "¿Ya lo has leído? Ponte a prueba en los tests.",
    prev: "Tema anterior",
    next: "Tema siguiente",
    allCourses: "Todos los cursos de la asignatura",
    interactive: { check: "Compruébalo", right: "¡Correcto!", wrong: "No del todo, la respuesta es:", cards: "Tarjetas: haz clic para girar", flip: "Girar la tarjeta", practice: "Practica este tema", again: "Otra vez", score: "¡Listo! {a} de {b} correctas." },
    back: "Volver al resumen de la asignatura",
    allSubjects: "Todas las asignaturas",
    examples: "Ejemplos",
    tip: "Consejo",
  },
  fr: {
    nav: "Supports",
    title: "Supports de révision",
    subtitle: "Des résumés clairs du programme pour toutes les matières, des bases jusqu'aux sujets avancés. Après la lecture, entraîne-toi dans les cours.",
    czechOnlyNote: "Les supports de révision sont rédigés en tchèque.",
    topics: "Thèmes",
    levels: {
      1: { title: "Les bases", hint: "1re–3e année" },
      2: { title: "Notions de base", hint: "4e–6e année" },
      3: { title: "Avancé", hint: "7e–9e année" },
      4: { title: "Préparation aux concours d'entrée", hint: "9e année et examens d'entrée" },
    },
    contents: "Sommaire",
    remember: "À retenir",
    practice: "S'entraîner dans les cours",
    practiceHint: "Tu as fini de lire ? Teste-toi dans les quiz.",
    prev: "Thème précédent",
    next: "Thème suivant",
    allCourses: "Tous les cours de la matière",
    interactive: { check: "Vérifie-toi", right: "Correct !", wrong: "Pas tout à fait, la bonne réponse est :", cards: "Fiches : clique pour retourner", flip: "Retourner la fiche", practice: "S'entraîner sur ce thème", again: "Encore", score: "Terminé ! {a} réponse(s) juste(s) sur {b}." },
    back: "Retour à la vue d'ensemble de la matière",
    allSubjects: "Toutes les matières",
    examples: "Exemples",
    tip: "Astuce",
  },
};

export function getMaterialsText(locale: Locale): MaterialsText {
  return texts[locale];
}
