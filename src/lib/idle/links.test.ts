import assert from "node:assert/strict";
import { test } from "node:test";
import { citySpeedBonus, emptyState as farm, petSpeedBonus, takeItem } from "./farm.ts";
import { emptyState as pets, farmFeedGrowth, feedWithFarm } from "./pets.ts";

test("bonusy ostatních her mají stropy", () => {
  assert.equal(petSpeedBonus(null), 0);
  assert.equal(petSpeedBonus(3), 0.03);
  assert.equal(petSpeedBonus(50), 0.1);
  assert.equal(citySpeedBonus(14), 0);
  assert.equal(citySpeedBonus(30), 0.02);
  assert.equal(citySpeedBonus(9999), 0.1);
  assert.equal(citySpeedBonus(-5), 0);
});

test("krmení úrodou: růst podle ceny, s mezemi", () => {
  assert.equal(farmFeedGrowth(1), 2);
  assert.equal(farmFeedGrowth(30), 10);
  assert.equal(farmFeedGrowth(10_000), 20);
});

test("odebrání ze sýpky po kusech a bez záporných zásob", () => {
  const s = { ...farm(0), stock: { wheat: 2 } };
  const one = takeItem(s, "wheat");
  assert.ok(one.ok && one.state.stock.wheat === 1);
  assert.ok(one.ok);
  if (one.ok) {
    const two = takeItem(one.state, "wheat");
    assert.ok(two.ok && !("wheat" in two.state.stock));
    if (two.ok) assert.equal(takeItem(two.state, "wheat").ok, false);
  }
  assert.equal(takeItem(s, "nonsense").ok, false);
  assert.equal(s.stock.wheat, 2, "původní stav se nemění");
});

test("nakrmení úrodou potřebuje aktivního mazlíčka a zvedá růst i sytost", () => {
  assert.deepEqual(feedWithFarm(pets(0), 30), { ok: false, error: "no-pet" });
  const withPet = { ...pets(0), active: "cat" as const, pets: { cat: { name: "Micka", growth: 0, hunger: 50, happy: 98, accessory: null } } };
  const r = feedWithFarm(withPet, 30);
  assert.ok(r.ok);
  if (r.ok) {
    const c = r.state.pets.cat!;
    assert.deepEqual([c.growth, c.hunger, c.happy], [10, 75, 100]);
  }
});
