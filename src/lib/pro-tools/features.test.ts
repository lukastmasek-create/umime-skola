import { test } from "node:test";
import assert from "node:assert/strict";
import { featureAvailableIn } from "./features.ts";

test("ústní zkoušení je jen v angličtině", () => {
  assert.equal(featureAvailableIn("ustni", "en"), true);
  assert.equal(featureAvailableIn("ustni", "cs"), false);
  assert.equal(featureAvailableIn("ustni", "de"), false);
});

test("nástroje bez omezení jazyka jsou dostupné všude", () => {
  assert.equal(featureAvailableIn("doucovatel", "cs"), true);
  assert.equal(featureAvailableIn("doucovatel", "en"), true);
});
