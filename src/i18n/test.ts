import { withFallbacks } from "./config";
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
  hint: "Nápověda",
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
  hint: "Hint",
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
  hint: "Hinweis",
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
  hint: "Подсказка",
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

const uk: TestText = {
  difficulties: ["Найлегший", "Легкий", "Середній", "Складний", "Найскладніший"],
  coursesTitle: "Курси",
  coursesSubtitle: "Тренуйся, граючи. Обери складність.",
  testsTitle: "Тести",
  testsSubtitle: "Підсумковий тест, як у школі: відповіді пишеш у полях. Під час кожного запуску будуть інші питання.",
  openTest: "Написати тест",
  openCourse: "Грати",
  locked: "Поки без питань",
  test: "Тест",
  question: "Питання",
  hint: "Підказка",
  check: "Перевірити тест",
  yourAnswer: "Твоя відповідь",
  correctAnswer: "Правильно",
  why: "Чому",
  result: "Результат",
  correctCount: "Правильно",
  grade: "Оцінка",
  gradeNames: ["відмінно", "дуже добре", "добре", "задовільно", "незадовільно"],
  newTest: "Новий тест (інші питання)",
  backToCourse: "← Назад до курсу",
  empty: "Для цієї складності поки немає питань.",
  strictNote: "Уважно з довжиною: i/í та y/ý вважаються різними відповідями.",
};

const ja: TestText = {
  difficulties: ["いちばんやさしい", "やさしい", "ふつう", "むずかしい", "いちばんむずかしい"],
  coursesTitle: "コース",
  coursesSubtitle: "ゲームで練習しましょう。難易度を選んでください。",
  testsTitle: "テスト",
  testsSubtitle: "学校のような総合テストです。答えは欄に書き込みます。挑戦するたびに問題が変わります。",
  openTest: "テストを受ける",
  openCourse: "プレイ",
  locked: "まだ問題がありません",
  test: "テスト",
  question: "問題",
  hint: "ヒント",
  check: "テストを採点",
  yourAnswer: "あなたの答え",
  correctAnswer: "正解",
  why: "理由",
  result: "結果",
  correctCount: "正解",
  grade: "成績",
  gradeNames: ["とても良い", "良い", "まずまず", "もう少し", "努力が必要"],
  newTest: "新しいテスト（別の問題）",
  backToCourse: "← コースに戻る",
  empty: "この難易度の問題はまだありません。",
  strictNote: "文字の長さに注意してください: i/í と y/ý は別の答えとして数えられます。",
};

const es: TestText = {
  difficulties: ["Muy fácil", "Fácil", "Medio", "Difícil", "Muy difícil"],
  coursesTitle: "Cursos",
  coursesSubtitle: "Practica jugando. Elige una dificultad.",
  testsTitle: "Tests",
  testsSubtitle: "Un examen resumen como en el colegio: escribes las respuestas en los campos. Cada vez tendrás preguntas diferentes.",
  openTest: "Hacer el test",
  openCourse: "Jugar",
  locked: "Todavía sin preguntas",
  test: "Test",
  question: "Pregunta",
  hint: "Pista",
  check: "Evaluar test",
  yourAnswer: "Tu respuesta",
  correctAnswer: "Correcta",
  why: "Por qué",
  result: "Resultado",
  correctCount: "Correctas",
  grade: "Nota",
  gradeNames: ["sobresaliente", "notable", "bien", "suficiente", "insuficiente"],
  newTest: "Nuevo test (otras preguntas)",
  backToCourse: "← Volver al curso",
  empty: "Todavía no hay preguntas para esta dificultad.",
  strictNote: "Ojo con la longitud: i/í e y/ý cuentan como respuestas distintas.",
};

const fr: TestText = {
  difficulties: ["Très facile", "Facile", "Moyen", "Difficile", "Très difficile"],
  coursesTitle: "Cours",
  coursesSubtitle: "Entraîne-toi en jouant. Choisis une difficulté.",
  testsTitle: "Tests",
  testsSubtitle: "Un contrôle récapitulatif comme à l'école : tu écris les réponses dans les cases. À chaque essai, les questions changent.",
  openTest: "Passer le test",
  openCourse: "Jouer",
  locked: "Pas encore de questions",
  test: "Test",
  question: "Question",
  hint: "Indice",
  check: "Corriger le test",
  yourAnswer: "Ta réponse",
  correctAnswer: "Correct",
  why: "Pourquoi",
  result: "Résultat",
  correctCount: "Correct",
  grade: "Note",
  gradeNames: ["très bien", "bien", "assez bien", "passable", "insuffisant"],
  newTest: "Nouveau test (autres questions)",
  backToCourse: "← Retour au cours",
  empty: "Pas encore de questions pour cette difficulté.",
  strictNote: "Attention à la longueur : i/í et y/ý comptent comme des réponses différentes.",
};

const texts: Record<Locale, TestText> = { ...withFallbacks({ cs, en, de, ru }), uk, ja, es, fr };

export function getTestText(locale: Locale): TestText {
  return texts[locale];
}
