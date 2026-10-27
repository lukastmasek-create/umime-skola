import type { Locale } from "./config";

// Texty klasických her (osmisměrka, spojování, pexeso, šibenice).
export type ClassicText = {
  back: string;
  again: string;
  time: string;
  mistakes: string;
  moves: string;
  found: string;
  solved: string;
  round: string;
  noData: string;
  doneTitle: string;
  reviewHint: string;
  xpLabel: string;
  letters: string;
  showAnswer: string;
  nextRound: string;
  finish: string;
  triesLeft: string;
  gameOver: string;
  rightAnswer: string;
  games: Record<"osmismerka" | "spojovani" | "pexeso" | "sibenice", { title: string; intro: string }>;
  matching: { questions: string; answers: string };
};

const cs: ClassicText = {
  back: "← Zpět na kurz",
  again: "Hrát znovu",
  time: "Čas",
  mistakes: "Chyby",
  moves: "Tahy",
  found: "Nalezeno",
  solved: "Vyřešeno",
  round: "Slovo",
  noData: "Z tohoto kurzu se tahle hra zatím nedá sestavit (chybí vhodné odpovědi). Zkus jinou hru nebo jiný kurz.",
  doneTitle: "Hotovo! 🎉",
  reviewHint: "Chybné otázky se zapsaly do opakování.",
  xpLabel: "XP",
  letters: "písmen",
  showAnswer: "Správná odpověď",
  nextRound: "Další slovo →",
  finish: "Dokončit",
  triesLeft: "Zbývá chyb",
  gameOver: "Oběšenec je hotový",
  rightAnswer: "Správně",
  games: {
    osmismerka: { title: "Osmisměrka", intro: "Najdi v tabulce odpovědi na otázky. Slova vedou vodorovně, svisle i úhlopříčně. Táhni prstem nebo myší přes písmena, případně klepni na první a pak na poslední písmeno." },
    spojovani: { title: "Spojování", intro: "Klikni na otázku vlevo a pak na její správnou odpověď vpravo. Spoj všechny dvojice co nejrychleji a s co nejméně chybami." },
    pexeso: { title: "Pexeso", intro: "Otáčej karty a hledej dvojice: otázku a její správnou odpověď. Pamatuj si, kde co leží." },
    sibenice: { title: "Šibenice", intro: "Z otázky poznej odpověď a hádej ji písmeno po písmenu. Šest chyb a oběšenec je hotový." },
  },
  matching: { questions: "Otázky", answers: "Odpovědi" },
};

const en: ClassicText = {
  back: "← Back to the course",
  again: "Play again",
  time: "Time",
  mistakes: "Mistakes",
  moves: "Moves",
  found: "Found",
  solved: "Solved",
  round: "Word",
  noData: "This game can't be built from this course yet (no suitable answers). Try another game or course.",
  doneTitle: "Done! 🎉",
  reviewHint: "Questions you missed were added to your review.",
  xpLabel: "XP",
  letters: "letters",
  showAnswer: "Right answer",
  nextRound: "Next word →",
  finish: "Finish",
  triesLeft: "Mistakes left",
  gameOver: "The hangman is complete",
  rightAnswer: "Correct",
  games: {
    osmismerka: { title: "Word search", intro: "Find the answers to the questions in the grid. Words run across, down and diagonally. Drag over the letters, or tap the first and then the last letter." },
    spojovani: { title: "Matching", intro: "Click a question on the left and then its right answer on the right. Match all the pairs fast and with as few mistakes as possible." },
    pexeso: { title: "Memory", intro: "Flip cards to find pairs: a question and its right answer. Remember where everything is." },
    sibenice: { title: "Hangman", intro: "Work out the answer from the question and guess it letter by letter. Six mistakes and the hangman is complete." },
  },
  matching: { questions: "Questions", answers: "Answers" },
};

const de: ClassicText = {
  back: "← Zurück zum Kurs",
  again: "Nochmal spielen",
  time: "Zeit",
  mistakes: "Fehler",
  moves: "Züge",
  found: "Gefunden",
  solved: "Gelöst",
  round: "Wort",
  noData: "Aus diesem Kurs lässt sich das Spiel noch nicht bauen (keine passenden Antworten). Probier ein anderes Spiel oder einen anderen Kurs.",
  doneTitle: "Geschafft! 🎉",
  reviewHint: "Verpasste Fragen wurden zur Wiederholung gespeichert.",
  xpLabel: "XP",
  letters: "Buchstaben",
  showAnswer: "Richtige Antwort",
  nextRound: "Nächstes Wort →",
  finish: "Fertig",
  triesLeft: "Fehler übrig",
  gameOver: "Der Galgen ist fertig",
  rightAnswer: "Richtig",
  games: {
    osmismerka: { title: "Wortsuche", intro: "Finde die Antworten auf die Fragen im Gitter. Die Wörter laufen waagerecht, senkrecht und diagonal. Zieh über die Buchstaben oder tippe den ersten und dann den letzten an." },
    spojovani: { title: "Zuordnen", intro: "Klicke links auf eine Frage und rechts auf die richtige Antwort. Ordne alle Paare schnell und mit möglichst wenig Fehlern zu." },
    pexeso: { title: "Memory", intro: "Dreh Karten um und finde Paare: eine Frage und ihre richtige Antwort. Merk dir, wo was liegt." },
    sibenice: { title: "Galgenmännchen", intro: "Erkenne die Antwort an der Frage und rate sie Buchstabe für Buchstabe. Sechs Fehler und der Galgen ist fertig." },
  },
  matching: { questions: "Fragen", answers: "Antworten" },
};

const ru: ClassicText = {
  back: "← Назад к курсу",
  again: "Играть снова",
  time: "Время",
  mistakes: "Ошибки",
  moves: "Ходы",
  found: "Найдено",
  solved: "Решено",
  round: "Слово",
  noData: "Из этого курса пока нельзя собрать игру (нет подходящих ответов). Попробуй другую игру или курс.",
  doneTitle: "Готово! 🎉",
  reviewHint: "Вопросы с ошибками добавлены в повторение.",
  xpLabel: "XP",
  letters: "букв",
  showAnswer: "Правильный ответ",
  nextRound: "Следующее слово →",
  finish: "Завершить",
  triesLeft: "Осталось ошибок",
  gameOver: "Виселица готова",
  rightAnswer: "Верно",
  games: {
    osmismerka: { title: "Поиск слов", intro: "Найди в таблице ответы на вопросы. Слова идут по горизонтали, вертикали и диагонали. Проведи пальцем или мышью по буквам либо коснись первой и последней буквы." },
    spojovani: { title: "Соединение", intro: "Нажми на вопрос слева, а затем на правильный ответ справа. Соедини все пары быстро и с минимумом ошибок." },
    pexeso: { title: "Мемори", intro: "Переворачивай карточки и ищи пары: вопрос и его правильный ответ. Запоминай, что где лежит." },
    sibenice: { title: "Виселица", intro: "Пойми ответ по вопросу и угадывай его по буквам. Шесть ошибок — и виселица готова." },
  },
  matching: { questions: "Вопросы", answers: "Ответы" },
};

const texts: Record<Locale, ClassicText> = { cs, en, de, ru };

export function getClassicText(locale: Locale): ClassicText {
  return texts[locale];
}
