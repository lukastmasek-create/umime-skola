import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanPairs, cleanTitle, isMatch, isPlayable, pairsFromData, DILNA_MAX_PAIRS } from "./dilna.ts";

test("cleanPairs zahodí prázdné a neúplné dvojice", () => {
  const out = cleanPairs([{ left: " Voda ", right: "H2O" }, { left: "", right: "x" }, { left: "y" }, null, "text"]);
  assert.deepEqual(out, [{ left: "Voda", right: "H2O" }]);
});

test("cleanPairs odstraní duplicitní levou stranu bez ohledu na velikost písmen", () => {
  const out = cleanPairs([{ left: "Pes", right: "dog" }, { left: "pes", right: "hound" }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].right, "dog");
});

test("cleanPairs omezí počet dvojic a délku textu", () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ left: `L${i}`, right: `R${i}` }));
  assert.equal(cleanPairs(many).length, DILNA_MAX_PAIRS);
  const long = cleanPairs([{ left: "a".repeat(500), right: "b" }]);
  assert.equal(long[0].left.length, 120);
});

test("cleanPairs nepřijme cokoli jiného než pole", () => {
  assert.deepEqual(cleanPairs("nic"), []);
  assert.deepEqual(cleanPairs(undefined), []);
});

test("cleanTitle použije záložní název, když je prázdný", () => {
  assert.equal(cleanTitle("  "), "Hra z dílny");
  assert.equal(cleanTitle(42, "X"), "X");
  assert.equal(cleanTitle("Slovíčka"), "Slovíčka");
});

test("isPlayable vyžaduje aspoň tři dvojice", () => {
  assert.equal(isPlayable([{ left: "a", right: "1" }, { left: "b", right: "2" }]), false);
  assert.equal(isPlayable([{ left: "a", right: "1" }, { left: "b", right: "2" }, { left: "c", right: "3" }]), true);
});

test("isMatch uzná jen stejnou dvojici", () => {
  assert.equal(isMatch(2, 2), true);
  assert.equal(isMatch(2, 3), false);
});

test("pairsFromData čte uložená data bezpečně", () => {
  assert.deepEqual(pairsFromData({ pairs: [{ left: "a", right: "b" }] }), [{ left: "a", right: "b" }]);
  assert.deepEqual(pairsFromData(null), []);
  assert.deepEqual(pairsFromData({ pairs: "špatně" }), []);
});
