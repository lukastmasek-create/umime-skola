import assert from "node:assert/strict";
import { test } from "node:test";
import { BOUND_X, type Line } from "./engine";
import { checkChallenge, isClosedShape } from "./challenges";

const seg = (x1: number, y1: number, x2: number, y2: number): Line => ({ x1, y1, x2, y2, color: "#000", size: 1 });

test("čtverec je uzavřený tvar", () => {
  const sq = [seg(0, 0, 50, 0), seg(50, 0, 50, 50), seg(50, 50, 0, 50), seg(0, 50, 0, 0)];
  assert.equal(isClosedShape(sq), true);
  assert.equal(checkChallenge("square", { sprite: { x: 0, y: 0 }, lines: sq }), true);
});

test("otevřená čára není uzavřený tvar", () => {
  const open = [seg(0, 0, 50, 0), seg(50, 0, 50, 50), seg(50, 50, 0, 50), seg(0, 50, 0, 20)];
  assert.equal(isClosedShape(open), false);
});

test("tři čáry nestačí a nulové čáry se nepočítají", () => {
  assert.equal(isClosedShape([seg(0, 0, 50, 0), seg(50, 0, 50, 50), seg(50, 50, 0, 0)]), false);
  const sq = [seg(0, 0, 50, 0), seg(50, 0, 50, 50), seg(50, 50, 0, 50), seg(0, 50, 0, 0)];
  assert.equal(isClosedShape([...sq, seg(10, 10, 10, 10)]), true);
});

test("výzva okraje: kočka musí být u pravého okraje", () => {
  assert.equal(checkChallenge("edge", { sprite: { x: BOUND_X, y: 0 }, lines: [] }), true);
  assert.equal(checkChallenge("edge", { sprite: { x: 0, y: 0 }, lines: [] }), false);
});

test("výzva čar: aspoň dvanáct čar", () => {
  const many = Array.from({ length: 12 }, (_, i) => seg(i, 0, i + 1, 1));
  assert.equal(checkChallenge("lines", { sprite: { x: 0, y: 0 }, lines: many }), true);
  assert.equal(checkChallenge("lines", { sprite: { x: 0, y: 0 }, lines: many.slice(1) }), false);
});
