import assert from "node:assert/strict";
import { test } from "node:test";
import { CITY_SIZE, canMoveTo as cityCanMoveTo, moveItem as cityMoveItem, startState as cityStart, type CityState } from "./city.ts";
import { BASE_SIZE, canMoveTo as baseCanMoveTo, moveModule, startState as baseStart, type BaseState } from "./base.ts";

// --- město ---

function cityWith(items: CityState["items"]): CityState {
  return { ...cityStart(0), items: [...cityStart(0).items, ...items] };
}

test("město: budova se přesune na volné místo a ostatní zůstanou na místě", () => {
  // silnice je na řádku CITY_SIZE/2 = 14, budova je nad ní
  const state = cityWith([["house", 2, 2, 0]]);
  const before = state.items.map((e) => [...e]);
  const res = cityMoveItem(state, { x: 2, y: 2 }, { x: 10, y: 4, rot: 0 });
  assert.equal(res.ok, true);
  if (!res.ok) return;
  assert.deepEqual(res.state.items[state.items.length - 1], ["house", 10, 4, 0]);
  // pořadí a ostatní položky se nemění
  assert.deepEqual(res.state.items.slice(0, -1), before.slice(0, -1));
  // přesun je zdarma
  assert.equal(res.state.coins, state.coins);
});

test("město: přesun nesmí převzít obsazené políčko, ani částečně přes jinou budovu", () => {
  const state = cityWith([["house", 2, 2, 0], ["cottage", 8, 2, 0]]);
  // 2x2 dům na (7,2) by zasáhl chaloupku na (8,2)
  assert.deepEqual(cityCanMoveTo(state, { x: 2, y: 2 }, { x: 7, y: 2, rot: 0 }), { ok: false, error: "occupied" });
  // silnice na řádku 14 je obsazená, dům tam nejde
  assert.deepEqual(cityCanMoveTo(state, { x: 2, y: 2 }, { x: 3, y: Math.floor(CITY_SIZE / 2), rot: 0 }), { ok: false, error: "occupied" });
});

test("město: budova se smí posunout o kousek, i když se překrývá sama se sebou", () => {
  const state = cityWith([["house", 2, 2, 0]]);
  const res = cityCanMoveTo(state, { x: 2, y: 2 }, { x: 3, y: 3, rot: 0 });
  assert.equal(res.ok, true);
});

test("město: otočení na místě je přesun, pokud se vejde", () => {
  const state = cityWith([["shop", 4, 4, 0]]); // 2x1
  const res = cityMoveItem(state, { x: 4, y: 4 }, { x: 4, y: 4, rot: 1 });
  assert.equal(res.ok, true);
  if (res.ok) assert.deepEqual(res.state.items.at(-1), ["shop", 4, 4, 1]);
});

test("město: mimo mapu a neexistující budova se odmítnou", () => {
  const state = cityWith([["house", 2, 2, 0]]);
  assert.deepEqual(cityCanMoveTo(state, { x: 2, y: 2 }, { x: CITY_SIZE - 1, y: 0, rot: 0 }), { ok: false, error: "out-of-bounds" });
  assert.deepEqual(cityCanMoveTo(state, { x: -1, y: -1 }, { x: 5, y: 5, rot: 0 }), { ok: false, error: "nothing-there" });
  assert.deepEqual(cityCanMoveTo(state, { x: 2, y: 2 }, { x: Number.NaN, y: 5, rot: 0 }), { ok: false, error: "out-of-bounds" });
});

test("město: pomník s body se přesune bez dalších bodů", () => {
  // přesun nesmí vyžadovat pointsCost (body se neplatí ani nevrací)
  const state = cityWith([["memorial", 2, 2, 0]]);
  const res = cityMoveItem(state, { x: 2, y: 2 }, { x: 6, y: 6, rot: 0 });
  assert.equal(res.ok, true);
});

// --- základna ---

function baseWith(items: BaseState["items"]): BaseState {
  return { ...baseStart(0), items: [...baseStart(0).items, ...items] };
}

test("základna: modul se přesune a velitelský modul zůstane na místě", () => {
  const state = baseWith([["solar", 1, 1, 0]]);
  const res = moveModule(state, { x: 1, y: 1 }, { x: 1, y: 4, rot: 0 });
  assert.equal(res.ok, true);
  if (!res.ok) return;
  assert.deepEqual(res.state.items[1], ["solar", 1, 4, 0]);
  assert.equal(res.state.items[0][0], "core");
  assert.equal(res.state.credits, state.credits);
});

test("základna: velitelský modul se přesunout nedá", () => {
  const state = baseStart(0);
  const core = state.items[0];
  assert.deepEqual(baseCanMoveTo(state, { x: core[1], y: core[2] }, { x: 0, y: 0, rot: 0 }), { ok: false, error: "core-protected" });
});

test("základna: obsazené a mimo mřížku se odmítnou", () => {
  const state = baseWith([["solar", 1, 1, 0], ["quarters", 5, 5, 0]]);
  assert.deepEqual(baseCanMoveTo(state, { x: 1, y: 1 }, { x: 5, y: 5, rot: 0 }), { ok: false, error: "occupied" });
  assert.deepEqual(baseCanMoveTo(state, { x: 1, y: 1 }, { x: BASE_SIZE - 1, y: 0, rot: 0 }), { ok: false, error: "out-of-bounds" });
});

test("základna: přesun je zdarma a neexistující modul se odmítne", () => {
  const state = baseWith([["solar", 1, 1, 0]]);
  const res = moveModule(state, { x: 1, y: 1 }, { x: 0, y: 0, rot: 0 });
  assert.equal(res.ok, true);
  if (res.ok) assert.equal(res.state.credits, state.credits);
  assert.deepEqual(moveModule(state, { x: 9, y: 9 }, { x: 0, y: 0, rot: 0 }), { ok: false, error: "nothing-there" });
});
