import assert from "node:assert/strict";
import { test } from "node:test";
import { CARDS, COLLECTION_BONUSES, collectionXpPercent, dueCollectionBonuses, normalizeCards, uniqueCardCount } from "./collection.ts";

const owned = (n: number) => Object.fromEntries(CARDS.slice(0, n).map((c) => [c.id, 1]));

test("normalizeCards drops unknown bonus ids and defaults claimed", () => {
  assert.deepEqual(normalizeCards(null).claimed, []);
  const s = normalizeCards({ owned: { book: 2 }, claimed: ["collection:4", "bogus", "collection:4"] });
  assert.deepEqual(s.claimed, ["collection:4"]);
  assert.equal(s.owned.book, 2);
});

test("uniqueCardCount counts distinct cards, not copies", () => {
  assert.equal(uniqueCardCount({ book: 5, pencil: 1 }), 2);
  assert.equal(uniqueCardCount({}), 0);
});

test("bonuses unlock at thresholds and are never due twice", () => {
  assert.deepEqual(dueCollectionBonuses({ owned: owned(3), claimed: [] }), []);
  const first = dueCollectionBonuses({ owned: owned(4), claimed: [] });
  assert.deepEqual(first.map((b) => b.id), ["collection:4"]);
  const after = { owned: owned(4), claimed: first.map((b) => b.id) };
  assert.deepEqual(dueCollectionBonuses(after), []);
});

test("a jump past several thresholds pays all of them once", () => {
  const due = dueCollectionBonuses({ owned: owned(12), claimed: [] });
  assert.deepEqual(due.map((b) => b.id), ["collection:4", "collection:8", "collection:12"]);
});

test("XP percent grows by 1 per unique card and tops out at 16", () => {
  assert.equal(collectionXpPercent({}), 0);
  assert.equal(collectionXpPercent({ book: 9, pencil: 1 }), 2);
  assert.equal(collectionXpPercent(owned(16)), 16);
  assert.equal(collectionXpPercent(Object.fromEntries(CARDS.map((c) => [c.id, 3]))), 16);
});

test("full collection points bonus is reachable and total stays modest", () => {
  const full = COLLECTION_BONUSES[COLLECTION_BONUSES.length - 1];
  assert.equal(full.uniqueAt, CARDS.length);
  const points = COLLECTION_BONUSES.reduce((s, b) => s + b.points, 0);
  assert.ok(points <= 60, `points total ${points}`);
});
