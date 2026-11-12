import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignmentQuestions, cleanGame, cleanKind, cleanPairs, cleanPrompts, cleanSteps, cleanTitle, dilnaPrompt, gameFromRow, isAssignable, sourceFromQuestions,
  DILNA_MAX_PAIRS, DILNA_MAX_STEPS, isMatch,
} from "./dilna.ts";

test("cleanPairs zahodí prázdné a neúplné dvojice", () => {
  const out = cleanPairs([{ left: " Voda ", right: "H2O" }, { left: "", right: "x" }, { left: "y" }, null, "text"]);
  assert.deepEqual(out, [{ left: "Voda", right: "H2O" }]);
});

test("cleanPairs odstraní duplicitní levou stranu bez ohledu na velikost písmen", () => {
  const out = cleanPairs([{ left: "Pes", right: "dog" }, { left: "pes", right: "hound" }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].right, "dog");
});

test("cleanPairs omezí počet dvojic a délku textu", () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ left: `L${i}`, right: `R${i}` }));
  assert.equal(cleanPairs(many).length, DILNA_MAX_PAIRS);
  assert.equal(cleanPairs([{ left: "a".repeat(500), right: "b" }])[0].left.length, 120);
});

test("cleanKind vrátí pairs pro neznámý typ", () => {
  assert.equal(cleanKind("order"), "order");
  assert.equal(cleanKind("hack"), "pairs");
  assert.equal(cleanKind(undefined), "pairs");
});

test("cleanTitle použije záložní název, když je prázdný", () => {
  assert.equal(cleanTitle("  "), "Hra z dílny");
  assert.equal(cleanTitle("Slovíčka"), "Slovíčka");
});

test("cleanGame pro pořadí vyžaduje aspoň tři položky", () => {
  assert.equal(cleanGame("order", { items: ["a", "b"] }), null);
  assert.deepEqual(cleanGame("order", { items: ["a", "b", "c"] }), { kind: "order", items: ["a", "b", "c"] });
});

test("cleanSteps zahodí kroky bez správné odpovědi", () => {
  const good = { clue: "Stopa", question: "Kdo?", options: ["Anna", "Petr", "Karel"], correctIndex: 2 };
  const bad = { clue: "Stopa", question: "Kdo?", options: ["Anna"], correctIndex: 0 };
  const badIndex = { clue: "Stopa", question: "Kdo?", options: ["Anna", "Petr"], correctIndex: 5 };
  assert.deepEqual(cleanSteps([good, bad, badIndex]), [good]);
});

test("cleanSteps omezí počet kroků", () => {
  const step = { clue: "c", question: "q", options: ["a", "b"], correctIndex: 0 };
  assert.equal(cleanSteps(Array.from({ length: 20 }, () => step)).length, DILNA_MAX_STEPS);
});

test("cleanPrompts vyžaduje zadání, vzorová odpověď je volitelná", () => {
  assert.deepEqual(cleanPrompts([{ prompt: "Popiš den" }, { prompt: "", model: "x" }]), [{ prompt: "Popiš den", model: "" }]);
});

test("gameFromRow čte uložená data a neznámý typ bere jako dvojice", () => {
  assert.deepEqual(gameFromRow("pairs", { pairs: [{ left: "a", right: "1" }, { left: "b", right: "2" }, { left: "c", right: "3" }] })?.kind, "pairs");
  assert.equal(gameFromRow("story", { pairs: [] }), null);
  assert.equal(gameFromRow(null, null), null);
});

test("speak hry se nedají zadat jako úkol", () => {
  assert.equal(isAssignable({ kind: "speak", prompts: [{ prompt: "a", model: "" }] }), false);
  assert.equal(isAssignable({ kind: "order", items: ["a", "b", "c"] }), true);
});

test("dilnaPrompt obsahuje požadovaný JSON tvar pro typ hry", () => {
  assert.match(dilnaPrompt("order", "cs"), /"items"/);
  assert.match(dilnaPrompt("story", "en"), /"steps"/);
  assert.match(dilnaPrompt("speak", "cs"), /"prompts"/);
  assert.match(dilnaPrompt("pairs", "en"), /English/);
});

test("sourceFromQuestions složí text ze správných odpovědí", () => {
  const text = sourceFromQuestions("Angličtina", [{ prompt: "Dog?", options: ["pes", "kočka"], correctIndex: 0 }]);
  assert.match(text, /Kurz: Angličtina/);
  assert.match(text, /Správná odpověď: pes/);
});

test("assignmentQuestions u párování: správná odpověď je na správné pozici a bez duplicit", () => {
  const game = { kind: "pairs" as const, pairs: [{ left: "a", right: "1" }, { left: "b", right: "2" }, { left: "c", right: "3" }] };
  const qs = assignmentQuestions(game, "cs");
  assert.equal(qs.length, 3);
  qs.forEach((q, i) => {
    assert.equal(q.options[q.correctIndex], game.pairs[i].right);
    assert.equal(new Set(q.options).size, q.options.length);
  });
});

test("assignmentQuestions u řazení ptá na následující položku", () => {
  const qs = assignmentQuestions({ kind: "order", items: ["jedna", "dvě", "tři", "čtyři"] }, "cs");
  assert.equal(qs.length, 3);
  assert.equal(qs[0].options[qs[0].correctIndex], "dvě");
  assert.equal(qs[2].options[qs[2].correctIndex], "čtyři");
});

test("assignmentQuestions u příběhu použije kroky beze změny", () => {
  const qs = assignmentQuestions({ kind: "story", steps: [{ clue: "Stopa", question: "Kdo?", options: ["A", "B"], correctIndex: 1 }] }, "en");
  assert.equal(qs[0].correctIndex, 1);
  assert.match(qs[0].prompt, /Stopa/);
});

test("assignmentQuestions u mluvené hry nevrací nic", () => {
  assert.deepEqual(assignmentQuestions({ kind: "speak", prompts: [{ prompt: "a", model: "" }] }, "cs"), []);
});

test("cleanSteps po odstranění prázdné možnosti drží správnou odpověď", () => {
  const out = cleanSteps([{ clue: "c", question: "q", options: ["A", "", "C"], correctIndex: 2 }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].options[out[0].correctIndex], "C");
});

test("isMatch uzná jen stejnou dvojici", () => {
  assert.equal(isMatch(2, 2), true);
  assert.equal(isMatch(2, 3), false);
});

test("prompt i otázky úkolu se řídí jazykem učitele, neznámý jazyk padá na angličtinu", () => {
  assert.match(dilnaPrompt("pairs", "ja"), /Japanese/);
  assert.match(dilnaPrompt("pairs", "xx"), /English/);
  const game = { kind: "pairs" as const, pairs: [{ left: "a", right: "1" }, { left: "b", right: "2" }, { left: "c", right: "3" }] };
  assert.match(assignmentQuestions(game, "de")[0].prompt, /Welche Erklärung/);
  assert.match(assignmentQuestions(game, "xx")[0].prompt, /Which explanation/);
});
