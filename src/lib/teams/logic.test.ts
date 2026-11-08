import test from "node:test";
import assert from "node:assert/strict";
import {
  attemptsLeft, cleanJoinMode, cleanMaxAttempts, cleanSnapshot, completedLate, csvCell, dueState, gradeAttempt, isAssignedTo, joinOutcome,
  parseEmails, questionStats, splitRandomly, studentStatus, toCsv, toPublic, wrongIndexes,
} from "./logic.ts";

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

test("režim připojení", () => {
  assert.equal(cleanJoinMode("APPROVAL"), "APPROVAL");
  assert.equal(cleanJoinMode("x"), null);
  assert.equal(joinOutcome("OPEN"), "active");
  assert.equal(joinOutcome("APPROVAL"), "pending");
  assert.equal(joinOutcome("CLOSED"), "closed");
  assert.equal(joinOutcome("něco"), "active");
});
test("hromadné e-maily", () => {
  const r = parseEmails("a@x.cz, B@x.cz;a@X.cz\nšpatný  c@y.cz");
  assert.deepEqual(r.valid, ["a@x.cz", "B@x.cz", "c@y.cz"]);
  assert.deepEqual(r.invalid, ["špatný"]);
  assert.deepEqual(parseEmails(null).valid, []);
});
test("zadání vybraným žákům a skupinám", () => {
  const me = { userId: "u1", groupId: "g1" };
  assert.equal(isAssignedTo([], me), true);
  assert.equal(isAssignedTo([{ groupId: "g2", userId: null }], me), false);
  assert.equal(isAssignedTo([{ groupId: "g1", userId: null }], me), true);
  assert.equal(isAssignedTo([{ groupId: null, userId: "u1" }], me), true);
  assert.equal(isAssignedTo([{ groupId: "g1", userId: null }], { userId: "u1", groupId: null }), false);
});
test("náhodné rozdělení nic neztratí a je vyvážené", () => {
  const parts = splitRandomly([1, 2, 3, 4, 5, 6, 7], 3);
  assert.equal(parts.length, 3);
  assert.deepEqual(parts.flat().sort(), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(Math.max(...parts.map((p) => p.length)) - Math.min(...parts.map((p) => p.length)) <= 1);
});
test("termíny", () => {
  const now = new Date("2026-01-10T12:00:00Z");
  assert.equal(dueState(null, now), "none");
  assert.equal(dueState("2026-01-10T11:00:00Z", now), "overdue");
  assert.equal(dueState("2026-01-11T12:00:00Z", now), "soon");
  assert.equal(dueState("2026-02-01T12:00:00Z", now), "ok");
  const due = "2026-01-10T00:00:00Z";
  assert.equal(completedLate([{ percent: 80, createdAt: "2026-01-11T00:00:00Z" }], 50, due), true);
  assert.equal(completedLate([{ percent: 30, createdAt: "2026-01-09T00:00:00Z" }, { percent: 80, createdAt: "2026-01-11T00:00:00Z" }], 50, due), true);
  assert.equal(completedLate([{ percent: 80, createdAt: "2026-01-09T00:00:00Z" }, { percent: 90, createdAt: "2026-01-11T00:00:00Z" }], 50, due), false);
  assert.equal(completedLate([{ percent: 10, createdAt: "2026-01-11T00:00:00Z" }], 50, due), false);
  assert.equal(completedLate([{ percent: 80, createdAt: "2026-01-11T00:00:00Z" }], 50, null), false);
});
test("chyby po otázkách", () => {
  const r = gradeAttempt(qs, { "0": { choice: 0 }, "1": { typed: ["have"] } });
  assert.deepEqual(wrongIndexes(r.review), [0]);
  const st = questionStats(2, [{ wrong: [0] }, { wrong: [0, 1] }, { wrong: null }, { wrong: [] }]);
  assert.deepEqual(st, [{ index: 0, attempts: 3, wrong: 2 }, { index: 1, attempts: 3, wrong: 1 }]);
});
test("CSV escapuje a chrání před vzorci", () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell("a;b"), '"a;b"');
  assert.equal(csvCell("=SUM(A1)"), "'=SUM(A1)");
  assert.equal(csvCell(-5), "-5");
  assert.equal(csvCell(null), "");
  assert.equal(toCsv([["a", 1], ["b", null]]), "a;1\r\nb;");
});
