import assert from "node:assert/strict";
import { test } from "node:test";
import { averagePrice, itemWorld, priceHistogram } from "./market-catalog.ts";

test("věc patří do svého světa, neznámá do other", () => {
  assert.equal(itemWorld("avatar-pirate"), "pirate");
  assert.equal(itemWorld("banner-galaxy"), "space");
  assert.equal(itemWorld("title-scholar"), "other");
  assert.equal(itemWorld("neexistuje"), "other");
});

test("graf cen počítá každou cenu právě jednou", () => {
  const prices = [10, 10, 55, 100, 100];
  const h = priceHistogram(prices, 10, 100, 4);
  assert.equal(h.length, 4);
  assert.equal(h.reduce((a, b) => a + b, 0), prices.length);
  assert.equal(h[0], 2);
  assert.equal(h[3], 2);
});

test("průměr prázdného seznamu je 0", () => {
  assert.equal(averagePrice([]), 0);
  assert.equal(averagePrice([10, 20, 31]), 20);
});
