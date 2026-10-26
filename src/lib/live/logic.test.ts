import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyChest,
  chestOptions,
  cleanName,
  cleanQuestion,
  cleanSettings,
  effectiveStatus,
  generatePin,
  playerQuestionIndex,
  questionOrder,
  quizPoints,
  rankPlayers,
} from "./logic.ts";

const base = { mode: "QUIZ" as const, status: "QUESTION" as const, questionStartedAt: 1000, endsAt: null, settings: { seconds: 20, raceTarget: 10, durationMin: 5 }, now: 1000, answered: 0, players: 3 };

test("quizPoints: rychlost a série", () => {
  assert.equal(quizPoints(false, 100, 20, 3), 0);
  assert.equal(quizPoints(true, 0, 20, 0), 1000);
  assert.equal(quizPoints(true, 20000, 20, 0), 500);
  assert.equal(quizPoints(true, 10000, 20, 2), 750 + 100);
  assert.equal(quizPoints(true, 0, 20, 99), 1000 + 250);
  assert.equal(quizPoints(true, 99999, 20, 0), 500);
});

test("effectiveStatus: kvíz odhalí po čase nebo když odpověděli všichni", () => {
  assert.equal(effectiveStatus(base), "QUESTION");
  assert.equal(effectiveStatus({ ...base, now: 1000 + 20000 }), "REVEAL");
  assert.equal(effectiveStatus({ ...base, answered: 3 }), "REVEAL");
  assert.equal(effectiveStatus({ ...base, players: 0, answered: 0 }), "QUESTION");
  assert.equal(effectiveStatus({ ...base, status: "LOBBY" }), "LOBBY");
});

test("effectiveStatus: závod končí časem", () => {
  const race = { ...base, mode: "RACE" as const, endsAt: 5000 };
  assert.equal(effectiveStatus({ ...race, now: 4999 }), "QUESTION");
  assert.equal(effectiveStatus({ ...race, now: 5000 }), "ENDED");
});

test("questionOrder je stálé a obsahuje každou otázku jednou", () => {
  const a = questionOrder(8, "player-1");
  assert.deepEqual(a, questionOrder(8, "player-1"));
  assert.deepEqual([...a].sort((x, y) => x - y), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(playerQuestionIndex(8, "player-1", 8), a[0]);
});

test("truhly: tři možnosti a pravidla", () => {
  assert.equal(chestOptions().length, 3);
  assert.deepEqual(applyChest({ kind: "gold", amount: 30 }, 10, null), { me: 30, victim: 0 });
  assert.deepEqual(applyChest({ kind: "lose", amount: 25 }, 10, null), { me: -10, victim: 0 });
  assert.deepEqual(applyChest({ kind: "steal", amount: 40 }, 0, 15), { me: 15, victim: -15 });
  assert.deepEqual(applyChest({ kind: "steal", amount: 40 }, 0, null), { me: 0, victim: 0 });
});

test("rankPlayers podle režimu", () => {
  const p = (id: string, score: number, gold: number, progress: number, joinedAt: number) => ({ id, score, gold, progress, joinedAt });
  const ps = [p("a", 100, 5, 2, 1), p("b", 300, 1, 1, 2), p("c", 300, 9, 3, 3)];
  assert.deepEqual(rankPlayers("QUIZ", ps).map((x) => x.id), ["b", "c", "a"]);
  assert.deepEqual(rankPlayers("GOLD", ps).map((x) => x.id), ["c", "a", "b"]);
  assert.deepEqual(rankPlayers("RACE", ps).map((x) => x.id), ["c", "a", "b"]);
});

test("čištění vstupů", () => {
  assert.equal(cleanName("  Anna\n\tNovák   "), "Anna Novák");
  assert.equal(cleanName("x".repeat(40)).length, 16);
  assert.equal(cleanName(5), "");
  assert.deepEqual(cleanSettings({ seconds: 1, raceTarget: 999, durationMin: "x" }), { seconds: 5, raceTarget: 50, durationMin: 5 });
  assert.equal(cleanQuestion({ prompt: "?", options: ["a", "b"], correctIndex: 2 }), null);
  assert.deepEqual(cleanQuestion({ prompt: " ? ", options: ["a", "b", "c", "d"], correctIndex: 1 }), { prompt: "?", options: ["a", "b", "c", "d"], correctIndex: 1 });
  assert.match(generatePin(), /^\d{6}$/);
});
