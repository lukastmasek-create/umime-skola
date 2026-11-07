import test from "node:test";
import assert from "node:assert/strict";
import { attemptsLeft, cleanMaxAttempts, cleanSnapshot, gradeAttempt, studentStatus, toPublic } from "./logic.ts";

const qs = cleanSnapshot([
  { prompt: "2+2?", options: ["3", "4"], correctIndex: 1, explanation: "čtyři" },
  { prompt: "I ___ a cat", options: [], answers: ["have"], correctIndex: 0, explanation: "" },
  { prompt: "špatná", options: ["a"], correctIndex: 0 },
]);

test("cleanSnapshot zahodí neplatné otázky", () => assert.equal(qs.length, 2));
test("toPublic neprozradí odpovědi", () => {
  const p = toPublic(qs);
  assert.equal(JSON.stringify(p).includes("correctIndex"), false);
  assert.equal(p[1].gaps, 1);
});
test("gradeAttempt hodnotí výběr i doplňování", () => {
  const r = gradeAttempt(qs, { "0": { choice: 1 }, "1": { typed: [" HAVE "] } });
  assert.equal(r.correct, 2);
  assert.equal(r.percent, 100);
  assert.equal(gradeAttempt(qs, { "0": { choice: 0 } }).correct, 0);
});
test("pokusy", () => {
  assert.equal(attemptsLeft(null, 5), null);
  assert.equal(attemptsLeft(2, 3), 0);
  assert.equal(cleanMaxAttempts(""), null);
  assert.equal(cleanMaxAttempts(3), 3);
  assert.equal(cleanMaxAttempts(999), 20);
});
test("stav žáka", () => {
  assert.equal(studentStatus({ viewed: false, attempts: 0, best: 0, passPercent: 50 }), "new");
  assert.equal(studentStatus({ viewed: true, attempts: 0, best: 0, passPercent: 50 }), "viewed");
  assert.equal(studentStatus({ viewed: true, attempts: 1, best: 40, passPercent: 50 }), "tried");
  assert.equal(studentStatus({ viewed: true, attempts: 1, best: 60, passPercent: 50 }), "done");
});
