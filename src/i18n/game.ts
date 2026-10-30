import type { Locale } from "./config";

export type GameQuestion = {
  id?: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export type GameText = {
  play: string;
  title: string;
  intro: string;
  controls: string;
  start: string;
  again: string;
  next: string;
  finish: string;
  question: string;
  lives: string;
  score: string;
  combo: string;
  courseCoins: string;
  upgrades: string;
  upgradeFire: string;
  upgradeLife: string;
  upgradeSlow: string;
  level: string;
  buy: string;
  maxed: string;
  correct: string;
  wrong: string;
  wrongLostLife: string;
  missed: string;
  whyCorrect: string;
  gameOver: string;
  runComplete: string;
  earned: string;
  completionBonus: string;
  backToCourse: string;
  games: string;
  soon: string;
  fire: string;
  demoNote: string;
  pressSpace: string;
  sound: string;
  pause: string;
  resume: string;
  paused: string;
  endRun: string;
  autoContinue: string;
  difficulty: string;
  easy: string;
  normal: string;
  hard: string;
  difficultyHint: { easy: string; normal: string; hard: string };
  hint: string;
  hintLeft: string;
  hintText: string;
  hintUsed: string;
  reviewTitle: string;
  practiceMistakes: string;
  noMistakes: string;
  summary: string;
  repeatLater: string;
  damage: string;
  tipDodge: string;
  questions: GameQuestion[];
};

const cs: GameText = {
  play: "Hrát",
  title: "Obrana galaxie",
  intro: "Nad hlavou se objeví otázka a mimozemšťané nesou odpovědi. Sestřel tu správnou!",
  controls: "← → nebo A D pohyb, mezerník střelba, na telefonu táhni prstem po hře",
  start: "Spustit hru",
  again: "Hrát znovu",
  next: "Další otázka →",
  finish: "Dokončit",
  question: "Otázka",
  lives: "Životy",
  score: "Skóre",
  combo: "Série",
  courseCoins: "Body kurzu",
  upgrades: "Upgrady",
  upgradeFire: "Rychlost střelby",
  upgradeLife: "Extra život",
  upgradeSlow: "Zpomalení vetřelců",
  level: "úr.",
  buy: "Koupit",
  maxed: "Max",
  correct: "Správně! 🎉",
  wrong: "Špatná odpověď!",
  wrongLostLife: "Špatně! −1 život",
  missed: "Správná odpověď ti uletěla!",
  whyCorrect: "Proč je to správně",
  gameOver: "Konec hry",
  runComplete: "Level dokončen! 🏆",
  earned: "Získáno bodů",
  completionBonus: "Za dokončení celého kurzu dostaneš globální body (brzy).",
  backToCourse: "← Zpět na kurz",
  games: "Vyber si hru",
  soon: "Brzy",
  fire: "Střelba",
  demoNote: "Ukázkové otázky — obsah kurzu se bude doplňovat.",
  pressSpace: "nebo stiskni mezerník",
  sound: "Zvuk",
  pause: "Pozastavit",
  resume: "Pokračovat",
  paused: "Pozastaveno",
  endRun: "Ukončit kolo",
  autoContinue: "Další otázka přijde sama. Pozastav, kdybys chtěl číst déle.",
  difficulty: "Obtížnost",
  easy: "🐢 Snadná",
  normal: "🙂 Střední",
  hard: "🔥 Těžká",
  difficultyHint: { easy: "Pomalejší hra, víc času a 5 životů. Nejlepší na začátek.", normal: "Vyvážená hra se 4 životy.", hard: "Rychlá hra, méně času a 3 životy, ale víc bodů." },
  hint: "💡 Nápověda",
  hintLeft: "zbývá",
  hintText: "Není to: {a} ani {b}",
  hintUsed: "Za bod s nápovědou dostaneš jen půlku.",
  reviewTitle: "Co si zopakovat",
  practiceMistakes: "Procvičit chyby",
  noMistakes: "Bez jediné chyby! 🌟",
  summary: "Správně {a} z {b} otázek",
  repeatLater: "Tuhle otázku dostaneš ještě jednou na konci.",
  damage: "Zásah! −1 život",
  tipDodge: "Sbírej bonusy 🛡️ ⚡ 🐌 a uhýbej červeným střelám. Poslední otázka je BOSS.",
  questions: [
    {
      prompt: "Kolik je 7 × 8?",
      options: ["54", "56", "48", "64"],
      correctIndex: 1,
      explanation: "7 × 8 = 56. Zapamatuj si řadu 5, 6, 7, 8 — vždyť 56 = 7 × 8.",
    },
    {
      prompt: "Která planeta je největší ve Sluneční soustavě?",
      options: ["Mars", "Saturn", "Jupiter", "Země"],
      correctIndex: 2,
      explanation: "Jupiter je největší planeta — objemem je přes 1300× větší než Země. Saturn je druhý největší.",
    },
    {
      prompt: "Jaký je chemický vzorec vody?",
      options: ["CO₂", "H₂O", "O₂", "NaCl"],
      correctIndex: 1,
      explanation: "Molekula vody má dva atomy vodíku (H) a jeden atom kyslíku (O), proto H₂O.",
    },
    {
      prompt: "Které z těchto zvířat je savec?",
      options: ["Kapr", "Delfín", "Orel", "Krokodýl"],
      correctIndex: 1,
      explanation: "Delfín dýchá plícemi, rodí živá mláďata a krmí je mlékem. To dělají savci, i když delfín žije ve vodě.",
    },
    {
      prompt: "Kolik stran má šestiúhelník?",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      explanation: "Šestiúhelník (hexagon) má 6 stran. Předpona „hexa“ znamená šest.",
    },
  ],
};

const en: GameText = {
  play: "Play",
  title: "Galaxy Defence",
  intro: "A question appears up top and the aliens carry the answers. Shoot the right one!",
  controls: "← → or A D to move, space to shoot, on a phone drag your finger on the game",
  start: "Start game",
  again: "Play again",
  next: "Next question →",
  finish: "Finish",
  question: "Question",
  lives: "Lives",
  score: "Score",
  combo: "Streak",
  courseCoins: "Course points",
  upgrades: "Upgrades",
  upgradeFire: "Fire rate",
  upgradeLife: "Extra life",
  upgradeSlow: "Slow invaders",
  level: "lvl",
  buy: "Buy",
  maxed: "Max",
  correct: "Correct! 🎉",
  wrong: "Wrong answer!",
  wrongLostLife: "Wrong! −1 life",
  missed: "The right answer got away!",
  whyCorrect: "Why this is correct",
  gameOver: "Game over",
  runComplete: "Level complete! 🏆",
  earned: "Points earned",
  completionBonus: "Finishing the whole course earns you global points (coming soon).",
  backToCourse: "← Back to course",
  games: "Pick a game",
  soon: "Soon",
  fire: "Fire",
  demoNote: "Sample questions — course content will be added over time.",
  pressSpace: "or press space",
  sound: "Sound",
  pause: "Pause",
  resume: "Resume",
  paused: "Paused",
  endRun: "End run",
  autoContinue: "The next question starts on its own. Pause if you want more time to read.",
  difficulty: "Difficulty",
  easy: "🐢 Easy",
  normal: "🙂 Medium",
  hard: "🔥 Hard",
  difficultyHint: { easy: "Slower game, more time and 5 lives. Best to start with.", normal: "A balanced game with 4 lives.", hard: "Fast game, less time and 3 lives, but more points." },
  hint: "💡 Hint",
  hintLeft: "left",
  hintText: "It is not: {a} or {b}",
  hintUsed: "A point earned with a hint is worth half.",
  reviewTitle: "Worth reviewing",
  practiceMistakes: "Practice mistakes",
  noMistakes: "Not a single mistake! 🌟",
  summary: "{a} of {b} questions correct",
  repeatLater: "You will get this question once more at the end.",
  damage: "Hit! −1 life",
  tipDodge: "Grab power-ups 🛡️ ⚡ 🐌 and dodge the red shots. The last question is the BOSS.",
  questions: [
    {
      prompt: "What is 7 × 8?",
      options: ["54", "56", "48", "64"],
      correctIndex: 1,
      explanation: "7 × 8 = 56. Remember the sequence 5, 6, 7, 8 — because 56 = 7 × 8.",
    },
    {
      prompt: "Which planet is the largest in the Solar System?",
      options: ["Mars", "Saturn", "Jupiter", "Earth"],
      correctIndex: 2,
      explanation: "Jupiter is the largest planet — over 1,300 times Earth's volume. Saturn is second largest.",
    },
    {
      prompt: "What is the chemical formula of water?",
      options: ["CO₂", "H₂O", "O₂", "NaCl"],
      correctIndex: 1,
      explanation: "A water molecule has two hydrogen atoms (H) and one oxygen atom (O), hence H₂O.",
    },
    {
      prompt: "Which of these animals is a mammal?",
      options: ["Carp", "Dolphin", "Eagle", "Crocodile"],
      correctIndex: 1,
      explanation: "A dolphin breathes with lungs, gives birth to live young and feeds them milk. That makes it a mammal, even though it lives in water.",
    },
    {
      prompt: "How many sides does a hexagon have?",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      explanation: "A hexagon has 6 sides. The prefix “hexa” means six.",
    },
  ],
};

const de: GameText = {
  play: "Spielen",
  title: "Galaxie-Abwehr",
  intro: "Oben erscheint eine Frage und die Aliens tragen die Antworten. Schieß die richtige ab!",
  controls: "← → oder A D zum Bewegen, Leertaste zum Schießen, am Handy mit dem Finger ziehen",
  start: "Spiel starten",
  again: "Nochmal spielen",
  next: "Nächste Frage →",
  finish: "Beenden",
  question: "Frage",
  lives: "Leben",
  score: "Punkte",
  combo: "Serie",
  courseCoins: "Kurspunkte",
  upgrades: "Upgrades",
  upgradeFire: "Feuerrate",
  upgradeLife: "Extra-Leben",
  upgradeSlow: "Gegner verlangsamen",
  level: "Stufe",
  buy: "Kaufen",
  maxed: "Max",
  correct: "Richtig! 🎉",
  wrong: "Falsche Antwort!",
  wrongLostLife: "Falsch! −1 Leben",
  missed: "Die richtige Antwort ist entkommen!",
  whyCorrect: "Warum das richtig ist",
  gameOver: "Spiel vorbei",
  runComplete: "Level geschafft! 🏆",
  earned: "Verdiente Punkte",
  completionBonus: "Für den Abschluss des ganzen Kurses gibt es globale Punkte (bald).",
  backToCourse: "← Zurück zum Kurs",
  games: "Spiel wählen",
  soon: "Bald",
  fire: "Schießen",
  demoNote: "Beispielfragen — Kursinhalte werden nach und nach ergänzt.",
  pressSpace: "oder Leertaste drücken",
  sound: "Ton",
  pause: "Pause",
  resume: "Weiter",
  paused: "Pausiert",
  endRun: "Runde beenden",
  autoContinue: "Die nächste Frage startet von selbst. Pausiere, wenn du länger lesen willst.",
  difficulty: "Schwierigkeit",
  easy: "🐢 Leicht",
  normal: "🙂 Mittel",
  hard: "🔥 Schwer",
  difficultyHint: { easy: "Langsameres Spiel, mehr Zeit und 5 Leben. Am besten zum Anfangen.", normal: "Ausgewogenes Spiel mit 4 Leben.", hard: "Schnelles Spiel, weniger Zeit und 3 Leben, aber mehr Punkte." },
  hint: "💡 Tipp",
  hintLeft: "übrig",
  hintText: "Es ist nicht: {a} und nicht {b}",
  hintUsed: "Ein Punkt mit Tipp zählt nur halb.",
  reviewTitle: "Zum Wiederholen",
  practiceMistakes: "Fehler üben",
  noMistakes: "Kein einziger Fehler! 🌟",
  summary: "{a} von {b} Fragen richtig",
  repeatLater: "Diese Frage kommt am Ende noch einmal.",
  damage: "Treffer! −1 Leben",
  tipDodge: "Sammle Boni 🛡️ ⚡ 🐌 und weiche den roten Schüssen aus. Die letzte Frage ist der BOSS.",
  questions: [
    {
      prompt: "Wie viel ist 7 × 8?",
      options: ["54", "56", "48", "64"],
      correctIndex: 1,
      explanation: "7 × 8 = 56. Merk dir die Reihe 5, 6, 7, 8 — denn 56 = 7 × 8.",
    },
    {
      prompt: "Welcher Planet ist der größte im Sonnensystem?",
      options: ["Mars", "Saturn", "Jupiter", "Erde"],
      correctIndex: 2,
      explanation: "Jupiter ist der größte Planet — sein Volumen ist über 1300-mal so groß wie das der Erde. Saturn ist der zweitgrößte.",
    },
    {
      prompt: "Wie lautet die chemische Formel von Wasser?",
      options: ["CO₂", "H₂O", "O₂", "NaCl"],
      correctIndex: 1,
      explanation: "Ein Wassermolekül besteht aus zwei Wasserstoffatomen (H) und einem Sauerstoffatom (O), daher H₂O.",
    },
    {
      prompt: "Welches dieser Tiere ist ein Säugetier?",
      options: ["Karpfen", "Delfin", "Adler", "Krokodil"],
      correctIndex: 1,
      explanation: "Ein Delfin atmet mit Lungen, bringt lebende Junge zur Welt und säugt sie. Das tun Säugetiere, auch wenn der Delfin im Wasser lebt.",
    },
    {
      prompt: "Wie viele Seiten hat ein Sechseck?",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      explanation: "Ein Sechseck (Hexagon) hat 6 Seiten. Die Vorsilbe „hexa“ bedeutet sechs.",
    },
  ],
};

const ru: GameText = {
  play: "Играть",
  title: "Защита галактики",
  intro: "Вверху появляется вопрос, а пришельцы несут ответы. Сбей правильный!",
  controls: "← → или A D — движение, пробел — выстрел, на телефоне води пальцем по игре",
  start: "Начать игру",
  again: "Играть снова",
  next: "Следующий вопрос →",
  finish: "Завершить",
  question: "Вопрос",
  lives: "Жизни",
  score: "Счёт",
  combo: "Серия",
  courseCoins: "Баллы курса",
  upgrades: "Улучшения",
  upgradeFire: "Скорострельность",
  upgradeLife: "Доп. жизнь",
  upgradeSlow: "Замедление пришельцев",
  level: "ур.",
  buy: "Купить",
  maxed: "Макс",
  correct: "Правильно! 🎉",
  wrong: "Неверный ответ!",
  wrongLostLife: "Неверно! −1 жизнь",
  missed: "Правильный ответ улетел!",
  whyCorrect: "Почему это правильно",
  gameOver: "Игра окончена",
  runComplete: "Уровень пройден! 🏆",
  earned: "Получено баллов",
  completionBonus: "За прохождение всего курса ты получишь глобальные баллы (скоро).",
  backToCourse: "← Назад к курсу",
  games: "Выбери игру",
  soon: "Скоро",
  fire: "Выстрел",
  demoNote: "Примеры вопросов — содержимое курса будет добавляться постепенно.",
  pressSpace: "или нажми пробел",
  sound: "Звук",
  pause: "Пауза",
  resume: "Продолжить",
  paused: "Пауза",
  endRun: "Закончить раунд",
  autoContinue: "Следующий вопрос начнётся сам. Поставь на паузу, если хочешь читать дольше.",
  difficulty: "Сложность",
  easy: "🐢 Легко",
  normal: "🙂 Средне",
  hard: "🔥 Сложно",
  difficultyHint: { easy: "Медленнее, больше времени и 5 жизней. Лучше всего для начала.", normal: "Сбалансированная игра с 4 жизнями.", hard: "Быстро, меньше времени и 3 жизни, но больше очков." },
  hint: "💡 Подсказка",
  hintLeft: "осталось",
  hintText: "Это не: {a} и не {b}",
  hintUsed: "Очко с подсказкой стоит вдвое меньше.",
  reviewTitle: "Стоит повторить",
  practiceMistakes: "Потренировать ошибки",
  noMistakes: "Ни одной ошибки! 🌟",
  summary: "Верно {a} из {b} вопросов",
  repeatLater: "Этот вопрос ещё раз встретится в конце.",
  damage: "Попадание! −1 жизнь",
  tipDodge: "Собирай бонусы 🛡️ ⚡ 🐌 и уворачивайся от красных выстрелов. Последний вопрос — БОСС.",
  questions: [
    {
      prompt: "Сколько будет 7 × 8?",
      options: ["54", "56", "48", "64"],
      correctIndex: 1,
      explanation: "7 × 8 = 56. Запомни ряд 5, 6, 7, 8 — ведь 56 = 7 × 8.",
    },
    {
      prompt: "Какая планета самая большая в Солнечной системе?",
      options: ["Марс", "Сатурн", "Юпитер", "Земля"],
      correctIndex: 2,
      explanation: "Юпитер — самая большая планета, по объёму он более чем в 1300 раз больше Земли. Сатурн — второй по величине.",
    },
    {
      prompt: "Какова химическая формула воды?",
      options: ["CO₂", "H₂O", "O₂", "NaCl"],
      correctIndex: 1,
      explanation: "Молекула воды состоит из двух атомов водорода (H) и одного атома кислорода (O), поэтому H₂O.",
    },
    {
      prompt: "Какое из этих животных — млекопитающее?",
      options: ["Карп", "Дельфин", "Орёл", "Крокодил"],
      correctIndex: 1,
      explanation: "Дельфин дышит лёгкими, рождает живых детёнышей и кормит их молоком. Так делают млекопитающие, хотя дельфин живёт в воде.",
    },
    {
      prompt: "Сколько сторон у шестиугольника?",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      explanation: "У шестиугольника (гексагона) 6 сторон. Приставка «гекса» означает шесть.",
    },
  ],
};

const texts: Record<Locale, GameText> = { cs, en, de, ru };

export function getGameText(locale: Locale): GameText {
  return texts[locale];
}
