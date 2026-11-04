import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyState } from "./economy.ts";
import { foundedCompanies, overtakeRange } from "./economy-feed.ts";

test("založení firmy: oznámí se jen první kus daného oboru", () => {
  const a = emptyState(0);
  const b = { ...a, companies: { shoes: 1 } };
  assert.deepEqual(foundedCompanies(a, b), ["shoes"]);

  const c = { ...b, companies: { shoes: 2 } };
  assert.deepEqual(foundedCompanies(b, c), [], "další kus stejného oboru není nová firma");

  const d = { ...c, companies: { shoes: 2, bakery: 1 } };
  assert.deepEqual(foundedCompanies(c, d), ["bakery"], "nový obor je nová firma");
});

test("předehnání: předehnaní jsou rekordy v (starý, nový]; hráč bez rekordu nikoho nepředhání", () => {
  assert.equal(overtakeRange(0, 500), null, "hráč, který se teprve dostává do žebříčku, nikoho nepředhání");
  assert.equal(overtakeRange(300, 300), null, "bez růstu rekordu nic");
  assert.equal(overtakeRange(300, 200), null, "pokles rekordu nikoho nepředhání");
  assert.deepEqual(overtakeRange(300, 500), { low: 300, high: 500 });
});
