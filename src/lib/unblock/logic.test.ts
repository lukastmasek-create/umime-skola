import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVELS } from "./levels.ts";
import { minMoves, isSolved, axisRange, movePiece, canAt, cellsOf } from "./logic.ts";

test("pieces start on board without overlap", () => {
  for (const lv of LEVELS) {
    const seen = new Set<string>();
    for (const p of lv.pieces) for (const [y, x] of cellsOf(p)) {
      assert.ok(y >= 0 && y < 6 && x >= 0 && x < 6, `${lv.name} ${p.id} off board`);
      assert.ok(!seen.has(`${y},${x}`), `${lv.name} overlap`);
      seen.add(`${y},${x}`);
    }
  }
});

test("every level is solvable", () => {
  for (const lv of LEVELS) {
    const m = minMoves(lv.pieces);
    console.log(lv.name, "min moves", m);
    assert.ok(m > 0, `${lv.name} unsolvable (${m})`);
  }
});

test("key H exits through the right hole only on its row", () => {
  const ps = LEVELS[0].pieces;
  assert.equal(canAt(ps, "H", 2, 4), true); // still on board, cols 4-5
  assert.equal(canAt(ps, "H", 2, 6), true); // through the hole
  assert.equal(canAt(ps, "H", 1, 6), false); // wrong row
  assert.equal(canAt(ps, "A", 0, 4), true);
  assert.equal(canAt(ps, "A", 0, 6), false); // ordinary piece cannot leave
  assert.equal(isSolved(ps), false);
});

test("win when both keys are out", () => {
  let ps = LEVELS[0].pieces;
  ps = movePiece(ps, "H", "h", 6);
  assert.equal(isSolved(ps), false);
  ps = movePiece(ps, "V", "v", 6);
  assert.equal(isSolved(ps), true);
});

test("axis range of a blocked piece", () => {
  const r = axisRange(LEVELS[0].pieces, "C", "h");
  assert.deepEqual(r, { min: 0, max: 1 }); // B v sloupci 4 blokuje
});
