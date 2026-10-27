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
  games: Record<"osmismerka" | "spojovani" | "pexeso" | "sibenice" | "trideni" | "doplnovani" | "milionar" | "presmycky" | "blesk" | "poklad", { title: string; intro: string }>;
  quiz: { ready: string; start: string; score: string; correctN: string; timeLeft: string; streak: string; best: string; timeUp: string; wrongAnswer: string; correctWas: string; pickTile: string };
  mil: { points: string; fifty: string; audience: string; skip: string; take: string; safe: string; question: string; reached: string; won: string; lost: string; takeHome: string };
  scramble: { hint: string; clear: string; placeholder: string; letters: string; revealed: string };
  treasure: { gold: string; lives: string; chest: string; skull: string; coin: string; openedTiles: string; question: string };
  sort: { right: string; wrong: string; hint: string; card: string; wasRight: string; wasWrong: string; correctIs: string; review: string };
  fill: { bank: string; check: string; placeholder: string; attemptsLeft: string; revealed: string; correctIs: string; pickWord: string };
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
    trideni: { title: "Třídění", intro: "Roztřiď tvrzení na správná a špatná. Kartu přetáhni doprava (správně) nebo doleva (špatně), nebo použij tlačítka či šipky." },
    doplnovani: { title: "Doplňování", intro: "Doplň správná slova do vět. Na lehčí úrovni je vybíráš z nabídky, na těžší je píšeš sám." },
    milionar: { title: "Chceš být milionářem?", intro: "Odpovídej na otázky po žebříčku bodů. Pomůže ti 50:50, hlas publika a přeskočení. Špatná odpověď tě vrátí na poslední jistý bod, nebo si můžeš body vzít a skončit." },
    presmycky: { title: "Přesmyčky", intro: "Písmena jsou zamíchaná. Poskládej z nich správnou odpověď na otázku. Klepej na písmena, nebo piš na klávesnici." },
    blesk: { title: "Bleskový kvíz", intro: "Odpovídej, co to jde. Za správnou odpověď bod a série, za špatnou ztratíš pět sekund. Klávesy 1 až 4 vybírají odpověď." },
    poklad: { title: "Hon za pokladem", intro: "Správná odpověď ti odemkne jedno políčko na ostrově. Skrývá se v nich zlato a truhly, ale i lebky, které berou životy." },
  },
  matching: { questions: "Otázky", answers: "Odpovědi" },
  sort: { right: "Správně", wrong: "Špatně", hint: "Přetáhni kartu, nebo ← →", card: "Karta", wasRight: "Správně!", wasWrong: "Chyba.", correctIs: "Správná odpověď", review: "Tady jsi chyboval" },
  fill: { bank: "Slova k doplnění", check: "Zkontrolovat", placeholder: "Doplň…", attemptsLeft: "pokusů", revealed: "Správně je", correctIs: "Správně", pickWord: "Vyber slovo a klepni na mezeru" },
  quiz: { ready: "Připraven?", start: "Start", score: "Skóre", correctN: "Správně", timeLeft: "Zbývá", streak: "Série", best: "Nejlepší série", timeUp: "Čas vypršel!", wrongAnswer: "Špatně", correctWas: "Správně bylo", pickTile: "Vyber políčko k odkopání" },
  mil: { points: "bodů", fifty: "50:50", audience: "Publikum", skip: "Přeskočit", take: "Vzít body", safe: "jistý bod", question: "Otázka", reached: "Došel jsi na", won: "Vyhráno", lost: "Špatně! Odnášíš si", takeHome: "Odnášíš si" },
  scramble: { hint: "Nápověda", clear: "Smazat", placeholder: "Složená odpověď", letters: "písmen", revealed: "Správně je" },
  treasure: { gold: "Zlato", lives: "Životy", chest: "Truhla", skull: "Lebka", coin: "Mince", openedTiles: "Odkryto", question: "Otázka" },
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
    trideni: { title: "Sorting", intro: "Sort the statements into right and wrong. Drag a card right (true) or left (false), or use the buttons or arrow keys." },
    doplnovani: { title: "Fill in the blanks", intro: "Fill the right words into the sentences. On easier levels you pick them from a list, on harder ones you type them." },
    milionar: { title: "Who wants to be a millionaire?", intro: "Answer the questions up the points ladder. 50:50, ask the audience and skip can help. A wrong answer drops you to the last safe point, or you can take your points and stop." },
    presmycky: { title: "Anagrams", intro: "The letters are scrambled. Put them together into the right answer to the question. Tap the letters or type on the keyboard." },
    blesk: { title: "Lightning quiz", intro: "Answer as many as you can. A right answer earns a point and a streak, a wrong one costs five seconds. Keys 1 to 4 pick an answer." },
    poklad: { title: "Treasure hunt", intro: "A right answer unlocks one tile on the island. They hide gold and chests, but also skulls that cost lives." },
  },
  matching: { questions: "Questions", answers: "Answers" },
  sort: { right: "Right", wrong: "Wrong", hint: "Drag the card, or ← →", card: "Card", wasRight: "Right!", wasWrong: "Mistake.", correctIs: "Right answer", review: "Where you slipped" },
  fill: { bank: "Words to fill in", check: "Check", placeholder: "Fill in…", attemptsLeft: "tries", revealed: "The answer is", correctIs: "Correct", pickWord: "Pick a word, then tap a blank" },
  quiz: { ready: "Ready?", start: "Start", score: "Score", correctN: "Correct", timeLeft: "Left", streak: "Streak", best: "Best streak", timeUp: "Time's up!", wrongAnswer: "Wrong", correctWas: "The answer was", pickTile: "Pick a tile to dig" },
  mil: { points: "points", fifty: "50:50", audience: "Audience", skip: "Skip", take: "Take points", safe: "safe point", question: "Question", reached: "You reached", won: "Won", lost: "Wrong! You take home", takeHome: "You take home" },
  scramble: { hint: "Hint", clear: "Clear", placeholder: "Your answer", letters: "letters", revealed: "The answer is" },
  treasure: { gold: "Gold", lives: "Lives", chest: "Chest", skull: "Skull", coin: "Coin", openedTiles: "Opened", question: "Question" },
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
    trideni: { title: "Sortieren", intro: "Sortiere die Aussagen in richtig und falsch. Zieh die Karte nach rechts (richtig) oder links (falsch) oder nutze die Tasten oder Pfeile." },
    doplnovani: { title: "Lückentext", intro: "Setze die richtigen Wörter in die Sätze ein. Auf leichten Stufen wählst du sie aus einer Liste, auf schweren tippst du sie selbst." },
    milionar: { title: "Wer wird Millionär?", intro: "Beantworte die Fragen auf der Punkteleiter. 50:50, Publikum und Überspringen helfen dir. Eine falsche Antwort wirft dich auf den letzten sicheren Punkt zurück, oder du nimmst deine Punkte und hörst auf." },
    presmycky: { title: "Buchstabensalat", intro: "Die Buchstaben sind durcheinander. Setze daraus die richtige Antwort auf die Frage zusammen. Tippe die Buchstaben an oder schreibe mit der Tastatur." },
    blesk: { title: "Blitzquiz", intro: "Antworte, so schnell du kannst. Für eine richtige Antwort gibt es einen Punkt und eine Serie, für eine falsche verlierst du fünf Sekunden. Die Tasten 1 bis 4 wählen die Antwort." },
    poklad: { title: "Schatzsuche", intro: "Eine richtige Antwort schaltet ein Feld der Insel frei. Darunter liegen Gold und Truhen, aber auch Totenköpfe, die Leben kosten." },
  },
  matching: { questions: "Fragen", answers: "Antworten" },
  sort: { right: "Richtig", wrong: "Falsch", hint: "Karte ziehen oder ← →", card: "Karte", wasRight: "Richtig!", wasWrong: "Fehler.", correctIs: "Richtige Antwort", review: "Hier lagst du daneben" },
  fill: { bank: "Wörter zum Einsetzen", check: "Prüfen", placeholder: "Ergänze…", attemptsLeft: "Versuche", revealed: "Richtig ist", correctIs: "Richtig", pickWord: "Wort wählen, dann Lücke antippen" },
  quiz: { ready: "Bereit?", start: "Start", score: "Punkte", correctN: "Richtig", timeLeft: "Übrig", streak: "Serie", best: "Beste Serie", timeUp: "Zeit abgelaufen!", wrongAnswer: "Falsch", correctWas: "Richtig war", pickTile: "Wähle ein Feld zum Graben" },
  mil: { points: "Punkte", fifty: "50:50", audience: "Publikum", skip: "Überspringen", take: "Punkte nehmen", safe: "sicherer Punkt", question: "Frage", reached: "Du hast erreicht", won: "Gewonnen", lost: "Falsch! Du nimmst mit", takeHome: "Du nimmst mit" },
  scramble: { hint: "Tipp", clear: "Löschen", placeholder: "Deine Antwort", letters: "Buchstaben", revealed: "Richtig ist" },
  treasure: { gold: "Gold", lives: "Leben", chest: "Truhe", skull: "Totenkopf", coin: "Münze", openedTiles: "Geöffnet", question: "Frage" },
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
    trideni: { title: "Сортировка", intro: "Рассортируй утверждения на верные и неверные. Перетащи карточку вправо (верно) или влево (неверно) либо используй кнопки или стрелки." },
    doplnovani: { title: "Вставь слова", intro: "Вставь нужные слова в предложения. На лёгких уровнях выбираешь их из списка, на сложных вводишь сам." },
    milionar: { title: "Кто хочет стать миллионером?", intro: "Отвечай на вопросы по лестнице очков. Помогут 50:50, помощь зала и пропуск. Неверный ответ вернёт на последний надёжный балл, либо можно забрать очки и закончить." },
    presmycky: { title: "Анаграммы", intro: "Буквы перемешаны. Составь из них правильный ответ на вопрос. Нажимай на буквы или печатай на клавиатуре." },
    blesk: { title: "Блиц-викторина", intro: "Отвечай как можно быстрее. За верный ответ балл и серия, за неверный минус пять секунд. Клавиши 1–4 выбирают ответ." },
    poklad: { title: "Охота за сокровищами", intro: "Верный ответ открывает одну клетку острова. В них золото и сундуки, но и черепа, которые отнимают жизни." },
  },
  matching: { questions: "Вопросы", answers: "Ответы" },
  sort: { right: "Верно", wrong: "Неверно", hint: "Перетащи карточку или ← →", card: "Карточка", wasRight: "Верно!", wasWrong: "Ошибка.", correctIs: "Правильный ответ", review: "Где ты ошибся" },
  fill: { bank: "Слова для вставки", check: "Проверить", placeholder: "Вставь…", attemptsLeft: "попыток", revealed: "Правильно так", correctIs: "Верно", pickWord: "Выбери слово и коснись пропуска" },
  quiz: { ready: "Готов?", start: "Старт", score: "Очки", correctN: "Верно", timeLeft: "Осталось", streak: "Серия", best: "Лучшая серия", timeUp: "Время вышло!", wrongAnswer: "Неверно", correctWas: "Правильно было", pickTile: "Выбери клетку, чтобы копать" },
  mil: { points: "очков", fifty: "50:50", audience: "Зал", skip: "Пропустить", take: "Забрать очки", safe: "надёжный балл", question: "Вопрос", reached: "Ты дошёл до", won: "Выиграно", lost: "Неверно! Ты забираешь", takeHome: "Ты забираешь" },
  scramble: { hint: "Подсказка", clear: "Стереть", placeholder: "Твой ответ", letters: "букв", revealed: "Правильно так" },
  treasure: { gold: "Золото", lives: "Жизни", chest: "Сундук", skull: "Череп", coin: "Монета", openedTiles: "Открыто", question: "Вопрос" },
};

const texts: Record<Locale, ClassicText> = { cs, en, de, ru };

export function getClassicText(locale: Locale): ClassicText {
  return texts[locale];
}
