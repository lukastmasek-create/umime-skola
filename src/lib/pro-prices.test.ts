import test from "node:test";
import assert from "node:assert/strict";
import { PRO_ITEMS, proPrice } from "./pro-prices";

test("PRO prices match published builder and annual discount", () => {
  assert.equal(proPrice([], false), 0);
  assert.equal(proPrice(["tutor", "photo"], false), 130);
  assert.equal(proPrice(["tutor", "photo"], true), 1300);
  assert.equal(proPrice(PRO_ITEMS.map(i => i.id), false), 200);
  assert.equal(proPrice(PRO_ITEMS.map(i => i.id), true), 2000);
  assert.equal(proPrice(["tutor", "tutor", "unknown"], false), 80);
});
