import test from "node:test";
import assert from "node:assert/strict";
import { pointsFor, summarize } from "./daily-quiz.ts";

test("body rostou se sérií a obtížností", () => {
  assert.equal(pointsFor(3, 1, false), 3);
  assert.equal(pointsFor(3, 2, false), 4);
  assert.equal(pointsFor(5, 9, false), 9);
  assert.equal(pointsFor(2, 1, true), 3);
});

test("série se přeruší špatnou odpovědí a bezchybné kolo dává bonus", () => {
  const cfg = { subject: null, difficulty: 1, timed: false };
  const mixed = summarize([{ correct: true }, { correct: true }, { correct: false }, { correct: true }], cfg);
  assert.deepEqual([mixed.score, mixed.streak, mixed.best, mixed.points], [3, 1, 2, 1 + 2 + 1]);
  const all = summarize(Array.from({ length: 10 }, () => ({ correct: true })), cfg);
  assert.equal(all.flawless, true);
  assert.equal(all.points, 1 + 2 + 3 + 4 + 5 * 6 + 10);
});
