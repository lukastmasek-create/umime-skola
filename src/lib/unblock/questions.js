"use strict";
// Question pools. A round is ALL number questions or ALL word questions.
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = shuffle;
exports.pickRound = pickRound;
exports.questionFor = questionFor;
exports.checkAnswer = checkAnswer;
var NUMBER_QS = [
    { type: "number", prompt: "What is 7 × 8?", answer: "56" },
    { type: "number", prompt: "What is 12 + 35?", answer: "47" },
    { type: "number", prompt: "What is 9 squared?", answer: "81" },
    { type: "number", prompt: "How many sides does a hexagon have?", answer: "6" },
    { type: "number", prompt: "How many legs does a spider have?", answer: "8" },
    { type: "number", prompt: "How many minutes are in 2 hours?", answer: "120" },
    { type: "number", prompt: "How many degrees in a right angle?", answer: "90" },
    { type: "number", prompt: "What is the next prime after 13?", answer: "17" },
    { type: "number", prompt: "How many days are in a leap year?", answer: "366" },
    { type: "number", prompt: "What is 144 ÷ 12?", answer: "12" },
    { type: "number", prompt: "How many continents are there?", answer: "7" },
    { type: "number", prompt: "How many players per football team on the pitch?", answer: "11" },
    { type: "number", prompt: "How many strings on a standard guitar?", answer: "6" },
    { type: "number", prompt: "What is 3 cubed?", answer: "27" },
    { type: "number", prompt: "How many bones in the adult human body?", answer: "206" },
    { type: "number", prompt: "How many hours in a week?", answer: "168" },
    { type: "number", prompt: "What is 1000 − 387?", answer: "613" },
    { type: "number", prompt: "How many seconds in 5 minutes?", answer: "300" },
    { type: "number", prompt: "What is 25% of 200?", answer: "50" },
    { type: "number", prompt: "Roman numeral XIV in digits?", answer: "14" },
    { type: "number", prompt: "How many months have 31 days?", answer: "7" },
    { type: "number", prompt: "How many corners does a cube have?", answer: "8" },
];
var WORD_QS = [
    { type: "word", prompt: "Opposite of 'ancient'?", answer: "modern" },
    { type: "word", prompt: "Capital of Japan?", answer: "tokyo" },
    { type: "word", prompt: "Plural of 'mouse'?", answer: "mice" },
    { type: "word", prompt: "Chemical symbol for gold?", answer: "au" },
    { type: "word", prompt: "Largest planet in the solar system?", answer: "jupiter" },
    { type: "word", prompt: "Main language spoken in Brazil?", answer: "portuguese" },
    { type: "word", prompt: "What do bees make?", answer: "honey" },
    { type: "word", prompt: "Opposite of 'generous'?", answer: "stingy" },
    { type: "word", prompt: "Hot drink made from cocoa beans?", answer: "chocolate" },
    { type: "word", prompt: "Colour of a ripe banana?", answer: "yellow" },
    { type: "word", prompt: "Capital of Italy?", answer: "rome" },
    { type: "word", prompt: "Animal that says 'moo'?", answer: "cow" },
    { type: "word", prompt: "Past tense of 'run'?", answer: "ran" },
    { type: "word", prompt: "Frozen water?", answer: "ice" },
    { type: "word", prompt: "Opposite of 'expand'?", answer: "contract" },
    { type: "word", prompt: "Currency of Japan?", answer: "yen" },
    { type: "word", prompt: "Organ that pumps blood?", answer: "heart" },
    { type: "word", prompt: "Tallest animal on land?", answer: "giraffe" },
    { type: "word", prompt: "A baby dog is called a...?", answer: "puppy" },
    { type: "word", prompt: "Capital of the Czech Republic?", answer: "prague" },
    { type: "word", prompt: "Opposite of 'brave'?", answer: "coward" },
    { type: "word", prompt: "Gas plants absorb from the air?", answer: "carbon dioxide" },
    { type: "word", prompt: "Fruit said to keep the doctor away?", answer: "apple" },
];
function shuffle(arr, rand) {
    var _a;
    if (rand === void 0) { rand = Math.random; }
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
    }
    return a;
}
function pickRound(rand) {
    if (rand === void 0) { rand = Math.random; }
    var type = rand() < 0.5 ? "number" : "word";
    var src = type === "number" ? NUMBER_QS : WORD_QS;
    return { type: type, pool: shuffle(src, rand) };
}
/** Question for block at index `i`; `offset` rotates questions after each correct answer. */
function questionFor(round, i, offset) {
    var n = round.pool.length;
    return round.pool[(((i + offset) % n) + n) % n];
}
var normWord = function (s) {
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};
function checkAnswer(q, input) {
    var raw = input.trim();
    if (!raw)
        return false;
    if (q.type === "number") {
        var n = Number(raw.replace(",", "."));
        return Number.isFinite(n) && n === Number(q.answer);
    }
    return normWord(raw) === normWord(q.answer);
}
