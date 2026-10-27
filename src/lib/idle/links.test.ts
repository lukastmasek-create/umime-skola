import assert from "node:assert/strict";
import { test } from "node:test";
import { citySpeedBonus, emptyState as farm, petSpeedBonus, takeItem } from "./farm.ts";
import { MAX_UPGRADE_LEVEL, UPGRADES, buyUpgrade, emptyState as pets, farmFeedGrowth, feedWithFarm, incomePerHour, learningPower, normalizeState as normalizePets, play, playCooldownMs } from "./pets.ts";

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

import { ANIMALS, CROPS, MAX_LEVEL, PRODUCTS, animalReady, makeOrder, xpForLevel } from "./farm.ts";

test("obsah farmy: jedinečná id, řazení podle úrovně a platné vazby", () => {
  const ids = [...CROPS.map((c) => c.id), ...PRODUCTS.map((p) => p.id), ...ANIMALS.map((a) => a.id)];
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(CROPS.map((c) => c.level), [...CROPS.map((c) => c.level)].sort((a, b) => a - b));
  assert.deepEqual(ANIMALS.map((a) => a.level), [...ANIMALS.map((a) => a.level)].sort((a, b) => a - b));
  for (const a of ANIMALS) assert.ok(PRODUCTS.some((p) => p.id === a.product), `produkt zvířete ${a.id}`);
  for (const d of [...CROPS, ...ANIMALS]) assert.ok(d.level >= 1 && d.level <= MAX_LEVEL, `úroveň ${d.id}`);
});

test("vyvážení farmy: výdělek za minutu a návratnost zvířat", () => {
  const rate = CROPS.map((c) => c.price / c.minutes);
  // od úrovně 5 (jahoda) se výdělek za minutu drží v pásmu 1,3–1,6 mince, aby se vyplatila i delší čekání
  for (const c of CROPS.filter((c) => c.level >= 5)) {
    const r = c.price / c.minutes;
    assert.ok(r >= 1.3 && r <= 1.6, `${c.id}: ${r.toFixed(2)} mincí/min`);
  }
  assert.ok(rate[0] > rate[rate.length - 1]);
  for (const c of CROPS) assert.ok(c.price > c.seed, `${c.id} musí vydělat víc než semínko`);
  // zvířata: výdělek za minutu roste s úrovní a koupě se vrátí do ~ 5 hodin sběru
  const per = ANIMALS.map((a) => PRODUCTS.find((p) => p.id === a.product)!.price / a.minutes);
  assert.deepEqual(per, [...per].sort((a, b) => a - b));
  // návratnost koupě (v hodinách sběru) roste s úrovní, ale nepřekročí den
  const back = ANIMALS.map((a) => a.cost / (PRODUCTS.find((p) => p.id === a.product)!.price / a.minutes) / 60);
  assert.deepEqual(back, [...back].sort((a, b) => a - b));
  for (const [i, h] of back.entries()) assert.ok(h <= 24, `${ANIMALS[i].id}: návratnost ${h.toFixed(1)} h`);
});

test("zakázky nabízejí i nové položky a postup úrovní je dosažitelný", () => {
  const seen = new Set<string>();
  let k = 1;
  const rand = () => ((k = (k * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 400; i++) for (const it of makeOrder(MAX_LEVEL, rand).items) seen.add(it.item);
  for (const id of ["rose", "silk", "turkeyegg", "cabbage"]) assert.ok(seen.has(id), `zakázka s ${id}`);
  assert.ok(xpForLevel(MAX_LEVEL) < 20_000);
  assert.equal(animalReady("turkey", undefined, Date.now(), 0), 0);
});

test("nová vylepšení mazlíčků: hřiště zkracuje pauzu, učebna zesiluje učení", () => {
  const st = pets(0);
  assert.equal(playCooldownMs(st), 120_000);
  const lvl5 = { ...st, upgrades: { ...st.upgrades, playground: 5 } };
  assert.equal(playCooldownMs(lvl5), 36_000);
  assert.equal(learningPower(st), 1);
  assert.equal(learningPower({ ...st, upgrades: { ...st.upgrades, school: 5 } }), 2);

  const stats = { name: "x", growth: 0, hunger: 100, happy: 100, accessory: null };
  const plain = incomePerHour(st, stats, 0.5);
  const school = incomePerHour({ ...st, upgrades: { ...st.upgrades, school: 5 } }, stats, 0.5);
  assert.ok(Math.abs(school / plain - 2 / 1.5) < 1e-9, "při plném učení +100 % místo +50 %");
  assert.equal(incomePerHour({ ...st, upgrades: { ...st.upgrades, school: 5 } }, stats, 0), incomePerHour(st, stats, 0), "bez učení škola nic nedává");

  // krátká pauza opravdu pustí hru dřív
  const withPet = { ...lvl5, active: "cat" as const, pets: { cat: stats }, lastPlayAt: 1000 };
  assert.deepEqual(play(withPet, 1000 + 20_000), { ok: false, error: "cooldown" });
  assert.ok(play(withPet, 1000 + 37_000).ok);
  assert.deepEqual(play({ ...withPet, upgrades: { ...withPet.upgrades, playground: 0 } }, 1000 + 37_000), { ok: false, error: "cooldown" });
});

test("starý uložený stav bez nových vylepšení se načte s nulami a nová jde koupit", () => {
  const old = normalizePets({ v: 1, active: null, pets: {}, coins: 99999, totalEarned: 0, upgrades: { bowl: 2, toys: 1, bed: 0 }, lastSeen: 0, lastPlayAt: 0 }, 0);
  assert.deepEqual(old.upgrades, { bowl: 2, toys: 1, bed: 0, playground: 0, school: 0 });
  for (const id of UPGRADES) {
    const r = buyUpgrade(old, id);
    assert.ok(r.ok, id);
  }
  const maxed = { ...old, upgrades: { ...old.upgrades, school: MAX_UPGRADE_LEVEL } };
  assert.deepEqual(buyUpgrade(maxed, "school"), { ok: false, error: "max-level" });
});
