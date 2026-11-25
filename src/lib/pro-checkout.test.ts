import test from "node:test";
import assert from "node:assert/strict";
import { checkoutPrice, checkoutSelection } from "./pro-checkout";

test("published plans retain their prices and school is annual", () => {
  assert.equal(checkoutPrice("individual", [], false), 200);
  assert.equal(checkoutPrice("individual", [], true), 2000);
  assert.equal(checkoutPrice("family", [], false), 400);
  assert.equal(checkoutPrice("family", [], true), 4000);
  assert.equal(checkoutPrice("school", [], false), 12000);
  assert.equal(checkoutSelection({ plan: "school", billing: "monthly" }).yearly, true);
});
test("checkout preserves a custom selection and rejects unknown URL values", () => {
  const selection = checkoutSelection({ plan: "custom", billing: "yearly", features: "photo,tutor,tutor,invalid" });
  assert.deepEqual(selection.selected, ["tutor", "photo"]);
  assert.equal(checkoutPrice(selection.plan, selection.selected, selection.yearly), 1300);
  assert.equal(checkoutSelection({ plan: "invalid" }).plan, "custom");
  assert.equal(checkoutPrice("custom", checkoutSelection({ features: "" }).selected, false), 0);
});
