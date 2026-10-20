import type { Locale } from "./config";

export type TestText = {
  difficulties: [string, string, string, string, string];
  coursesTitle: string;
  coursesSubtitle: string;
  testsTitle: string;
  testsSubtitle: string;
  openTest: string;
  openCourse: string;
  locked: string;
  test: string;
  question: string;
  hint: string;
  check: string;
  yourAnswer: string;
  correctAnswer: string;
  why: string;
  result: string;
  correctCount: string;
  grade: string;
  gradeNames: [string, string, string, string, string];
  newTest: string;
  backToCourse: string;
  empty: string;
  strictNote: string;
};

const cs: TestText = {
  difficulties: ["Nejsnazší", "Snadný", "Střední", "Těžký", "Nejtěžší"],
  coursesTitle: "Kurzy",
  coursesSubtitle: "Procvičuj hrou. Vyber si obtížnost.",
  testsTitle: "Testy",
  testsSubtitle: "Souhrnný test jako ve škole: odpovědi píšeš do polí. Při každém spuštění dostaneš jiné otázky.",
  openTest: "Napsat test",
  openCourse: "Hrát",
  locked: "Zatím bez otázek",
  test: "Test",
  question: "Otázka",
  hint: "💡 Nápověda",
  check: "Vyhodnotit test",
  yourAnswer: "Tvoje odpověď",
  correctAnswer: "Správně",
  why: "Proč",
  result: "Výsledek",
  correctCount: "Správně",
  grade: "Známka",
  gradeNames: ["výborný", "chvalitebný", "dobrý", "dostatečný", "nedostatečný"],
  newTest: "Nový test (jiné otázky)",
  backToCourse: "← Zpět na kurz",
  empty: "Pro tuto obtížnost zatím nejsou žádné otázky.",
  strictNote: "Pozor na délku: i/í a y/ý se počítají jako různé odpovědi.",
};

const en: TestText = {
  difficulties: ["Easiest", "Easy", "Medium", "Hard", "Hardest"],
  coursesTitle: "Courses",
  coursesSubtitle: "Practice through games. Pick a difficulty.",
  testsTitle: "Tests",
  testsSubtitle: "A summary test like at school: you write the answers in the fields. Every attempt has different questions.",
  openTest: "Take the test",
  openCourse: "Play",
  locked: "No questions yet",
  test: "Test",
  question: "Question",
  hint: "💡 Hint",
  check: "Check test",
  yourAnswer: "Your answer",
  correctAnswer: "Correct",
  why: "Why",
  result: "Result",
  correctCount: "Correct",
  grade: "Grade",
  gradeNames: ["excellent", "very good", "good", "sufficient", "insufficient"],
  newTest: "New test (different questions)",
  backToCourse: "← Back to course",
  empty: "There are no questions for this difficulty yet.",
  strictNote: "Mind the length: i/í and y/ý count as different answers.",
};

const de: TestText = {
  difficulties: ["Am leichtesten", "Leicht", "Mittel", "Schwer", "Am schwersten"],
  coursesTitle: "Kurse",
  coursesSubtitle: "Übe mit Spielen. Wähle einen Schwierigkeitsgrad.",
  testsTitle: "Tests",
  testsSubtitle: "Ein Test wie in der Schule: Du schreibst die Antworten in die Felder. Bei jedem Versuch gibt es andere Fragen.",
  openTest: "Test schreiben",
  openCourse: "Spielen",
  locked: "Noch keine Fragen",
  test: "Test",
  question: "Frage",
  hint: "💡 Hinweis",
  check: "Test auswerten",
  yourAnswer: "Deine Antwort",
  correctAnswer: "Richtig",
  why: "Warum",
  result: "Ergebnis",
  correctCount: "Richtig",
  grade: "Note",
  gradeNames: ["sehr gut", "gut", "befriedigend", "ausreichend", "mangelhaft"],
  newTest: "Neuer Test (andere Fragen)",
  backToCourse: "← Zurück zum Kurs",
  empty: "Für diesen Schwierigkeitsgrad gibt es noch keine Fragen.",
  strictNote: "Achte auf die Länge: i/í und y/ý zählen als verschiedene Antworten.",
};

const ru: TestText = {
  difficulties: ["Самый лёгкий", "Лёгкий", "Средний", "Сложный", "Самый сложный"],
  coursesTitle: "Курсы",
  coursesSubtitle: "Тренируйся в играх. Выбери сложность.",
  testsTitle: "Тесты",
  testsSubtitle: "Итоговый тест как в школе: ответы пишешь в поля. При каждом запуске вопросы разные.",
  openTest: "Написать тест",
  openCourse: "Играть",
  locked: "Пока нет вопросов",
  test: "Тест",
  question: "Вопрос",
  hint: "💡 Подсказка",
  check: "Проверить тест",
  yourAnswer: "Твой ответ",
  correctAnswer: "Правильно",
  why: "Почему",
  result: "Результат",
  correctCount: "Верно",
  grade: "Оценка",
  gradeNames: ["отлично", "очень хорошо", "хорошо", "удовлетворительно", "неудовлетворительно"],
  newTest: "Новый тест (другие вопросы)",
  backToCourse: "← Назад к курсу",
  empty: "Для этой сложности пока нет вопросов.",
  strictNote: "Следи за длиной: i/í и y/ý считаются разными ответами.",
};

const texts: Record<Locale, TestText> = { cs, en, de, ru };

export function getTestText(locale: Locale): TestText {
  return texts[locale];
}
