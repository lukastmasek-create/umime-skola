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
};

export function getMaterialsText(locale: Locale): MaterialsText {
  return texts[locale];
}
