import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVELS } from "./levels.ts";
import { minMoves, slideRange, isSolved, moveBlock, canOccupy } from "./logic.ts";
import { checkAnswer, pickRound, questionFor, type Question } from "./questions.ts";

test("every level is solvable", () => {
  for (const lv of LEVELS) {
    const m = minMoves(lv.blocks);
    assert.ok(m > 0, `${lv.name} unsolvable (${m})`);
    console.log(lv.name, "min moves", m);
  }
});

test("collision and exit rules", () => {
  const bs = LEVELS[0].blocks;
  assert.equal(canOccupy(bs, "X", 1), false); // A sits at col 2 row 1-2
  assert.equal(isSolved(bs), false);
  const r = slideRange(bs, "X");
  assert.deepEqual(r, { min: 0, max: 0 });
  const solved = moveBlock(bs, "X", 5);
  assert.equal(isSolved(solved), true);
});

test("checkAnswer number and word", () => {
  const n: Question = { type: "number", prompt: "", answer: "56" };
  const w: Question = { type: "word", prompt: "", answer: "carbon dioxide" };
  assert.equal(checkAnswer(n, " 56 "), true);
  assert.equal(checkAnswer(n, "57"), false);
  assert.equal(checkAnswer(n, ""), false);
  assert.equal(checkAnswer(w, "Carbon-Dioxide"), true);
  assert.equal(checkAnswer(w, "carbon"), false);
});

test("rounds are single-type and rotate", () => {
  for (let i = 0; i < 20; i++) {
    const r = pickRound();
    assert.ok(r.pool.every((q) => q.type === r.type));
    assert.notEqual(questionFor(r, 0, 0), questionFor(r, 0, 1));
  }
});
