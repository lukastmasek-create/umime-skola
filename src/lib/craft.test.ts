import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  BUY_PER_DAY,
  MATERIALS,
  MAX_ENDLESS_BOOST,
  MAX_XP_BOOST,
  RARITIES,
  RECIPES,
  WORLDS,
  activate,
  activeTotal,
  applyEvents,
  buy,
  craft,
  dropsForQuest,
  dropsForXp,
  emptyCraft,
  materialDef,
  materialOf,
  normalizeCraft,
  recipeDef,
  refine,
  setFocus,
  unlockKey,
  type CraftState,
  type Rarity,
} from "./craft.ts";
import { AVATARS } from "./avatars.ts";
import { TITLES } from "./titles.ts";
import { getCraftText } from "../i18n/craft.ts";

const LOCALES = ["cs", "en", "de", "ru"] as const;
const NOW = Date.UTC(2026, 9, 31, 12, 0);
const withMats = (mats: Record<string, number>, patch: Partial<CraftState> = {}): CraftState => ({ ...emptyCraft(NOW), mats, ...patch });

test("materiály: každý svět má právě jeden materiál každé vzácnosti a jména ve všech jazycích", () => {
  assert.equal(MATERIALS.length, WORLDS.length * RARITIES.length);
  assert.equal(new Set(MATERIALS.map((m) => m.id)).size, MATERIALS.length);
  for (const w of WORLDS) for (const r of RARITIES) assert.equal(MATERIALS.filter((m) => m.world === w && m.rarity === r).length, 1, `${w}/${r}`);
  for (const m of MATERIALS) for (const loc of LOCALES) assert.ok(m.names[loc], `${m.id} ${loc}`);
});

test("recepty odpovídají světu: bonusy z obecných, ostatní jen z materiálů svého světa", () => {
  assert.equal(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length);
  for (const r of RECIPES) {
    const mats = Object.keys(r.cost);
    assert.ok(mats.length > 0, r.id);
    for (const id of mats) {
      const def = materialDef(id);
      assert.ok(def, `${r.id}: neznámý materiál ${id}`);
      assert.equal(def.world, r.category === "bonus" ? "obecne" : r.world, `${r.id}: ${id} je z jiného světa`);
    }
    for (const loc of LOCALES) assert.ok(r.names[loc], `${r.id} ${loc}`);
  }
});

test("vyrobené avatary, tituly a pozadí existují v profilu; doplňky čekají na pojmenovaný 3D model", () => {
  const cosmetics = readFileSync(new URL("./cosmetics.ts", import.meta.url), "utf8");
  for (const r of RECIPES) {
    if (r.output === "avatar") {
      const a = AVATARS.find((x) => x.id === r.ref);
      assert.ok(a && "event" in a.unlock && a.unlock.event === "craft", `avatar ${r.ref}`);
      assert.equal(a.names.cs, r.names.cs);
      assert.ok(r.asset3d, `${r.id}: chybí jméno 3D modelu`);
    }
    if (r.output === "title") {
      const ti = TITLES.find((x) => x.id === r.ref);
      assert.ok(ti && "event" in ti.unlock && ti.unlock.event === "craft", `titul ${r.ref}`);
    }
    if (r.output === "banner") assert.ok(cosmetics.includes(`"${r.ref}":`), `pozadí ${r.ref}`);
    if (r.output === "named") {
      assert.equal(r.ready, false, `${r.id} nemá model, nesmí jít vyrobit`);
      assert.ok(r.asset3d?.startsWith("craft-"), `${r.id}: jméno modelu`);
    }
    if (r.output === "bonus") assert.ok(r.effect, r.id);
  }
  // Každá kategorie, kterou chtěl zadavatel, má recepty.
  for (const c of ["bonus", "avatar", "avatar-acc", "pet-acc", "profile", "room"]) assert.ok(RECIPES.some((r) => r.category === c), c);
});

test("texty craftování ve všech jazycích", () => {
  for (const loc of LOCALES) {
    const t = getCraftText(loc);
    for (const w of WORLDS) assert.ok(t.worlds[w], `${loc} ${w}`);
    for (const r of RARITIES) assert.ok(t.rarities[r], `${loc} ${r}`);
    for (const r of RECIPES) assert.ok(t.sections[r.category]?.title, `${loc} ${r.category}`);
  }
});

test("materiály z učení: deterministické, 1 kus za 10 XP, jen zvolený svět nebo obecné", () => {
  assert.deepEqual(dropsForXp("e1", 40, "les"), dropsForXp("e1", 40, "les"));
  assert.equal(dropsForXp("e1", 40, "les").length, 4);
  assert.equal(dropsForXp("e2", 4, "les").length, 0);
  assert.equal(dropsForXp("e2", 5, "les").length, 1);
  assert.equal(dropsForXp("e2", 0, "les").length, 0);
  const worlds = new Set(Array.from({ length: 50 }, (_, i) => dropsForXp(`x${i}`, 30, "hrad")).flat().map((id) => materialDef(id)!.world));
  assert.deepEqual([...worlds].sort(), ["hrad", "obecne"]);
  const q = dropsForQuest("q1", "more");
  assert.equal(q.length, 2);
  assert.equal(materialDef(q[0])!.world, "more");
  assert.equal(materialDef(q[1])!.world, "obecne");
});

test("lepší výsledek a úkoly dávají vzácnější materiály", () => {
  const share = (ids: string[]) => ids.filter((id) => materialDef(id)!.rarity !== "common").length / ids.length;
  const small = Array.from({ length: 400 }, (_, i) => dropsForXp(`s${i}`, 10, "vesmir")).flat();
  const big = Array.from({ length: 100 }, (_, i) => dropsForXp(`b${i}`, 40, "vesmir")).flat();
  const quest = Array.from({ length: 200 }, (_, i) => dropsForQuest(`q${i}`, "vesmir")).flat();
  assert.ok(share(big) > share(small), "30+ XP najednou je lepší");
  assert.ok(share(quest) > share(big), "úkoly jsou nejlepší");
});

test("události se připíšou jen jednou a posunou ukazatel", () => {
  const s0 = emptyCraft(NOW, "les");
  const xp = [
    { id: "old", amount: 50, at: NOW - 1000 },
    { id: "a", amount: 20, at: NOW + 1000 },
    { id: "b", amount: 10, at: NOW + 2000 },
  ];
  const s1 = applyEvents(s0, xp, [{ id: "q", amount: 20, at: NOW + 500 }]);
  const total = (s: CraftState) => Object.values(s.mats).reduce((a, b) => a + b, 0);
  assert.equal(total(s1) - total(s0), 3 + 2, "staré se nepočítají; 20 XP = 2, 10 XP = 1, úkol = 2");
  assert.equal(s1.xpCursor, NOW + 2000);
  assert.equal(s1.questCursor, NOW + 500);
  assert.equal(applyEvents(s1, xp, []), s1, "podruhé už nic");
});

test("vyrobit: chybějící materiál, zaplacení, odemčení jen jednou, doplňek bez modelu nejde", () => {
  const avatar = recipeDef("avatar-star-wanderer")!;
  assert.deepEqual(craft(withMats({}), avatar.id, []), { ok: false, error: "missing" });
  const rich = withMats({ "moon-dust": 10, meteorite: 5, "star-crystal": 2 });
  const r = craft(rich, avatar.id, []);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.unlock, "avatar:star-wanderer");
  assert.deepEqual(r.state.mats, { "moon-dust": 4, meteorite: 2, "star-crystal": 1 });
  assert.deepEqual(craft(rich, avatar.id, ["avatar:star-wanderer"]), { ok: false, error: "owned" });
  assert.deepEqual(craft(withMats({ "moon-dust": 99, meteorite: 99, "star-crystal": 99 }), "antenna-helmet", []), { ok: false, error: "not-ready" });
  assert.deepEqual(craft(rich, "nope", []), { ok: false, error: "unknown" });
  const b = craft(withMats({ wood: 8, iron: 2 }), "scroll", []);
  assert.ok(b.ok && b.state.inv.scroll === 1 && b.unlock === null);
  assert.equal(unlockKey(recipeDef("banner-craft-reef")!), "banner:craft-reef");
});

test("bonusy se sčítají až do stropu a vyprší", () => {
  let s = withMats({}, { inv: { scroll: 3, "great-scroll": 1, hourglass: 3 } });
  for (const id of ["scroll", "scroll"]) {
    const r = activate(s, id, NOW);
    assert.ok(r.ok);
    if (r.ok) s = r.state;
  }
  assert.equal(activeTotal(s, "xp", NOW), 40);
  const third = activate(s, "great-scroll", NOW);
  assert.ok(third.ok);
  if (third.ok) s = third.state;
  assert.equal(activeTotal(s, "xp", NOW), MAX_XP_BOOST, "strop +50 %");
  assert.deepEqual(activate(s, "scroll", NOW), { ok: false, error: "cap" }, "plný strop neplýtvá bonusem");
  assert.equal(activeTotal(s, "xp", NOW + 61 * 60_000), 30, "svitky po hodině doběhly, kniha běží");
  for (let i = 0; i < 2; i++) {
    const r = activate(s, "hourglass", NOW);
    if (r.ok) s = r.state;
  }
  assert.equal(activeTotal(s, "endless", NOW), MAX_ENDLESS_BOOST);
  assert.deepEqual(activate(withMats({}), "scroll", NOW), { ok: false, error: "none" });
  const pouch = activate(withMats({}, { inv: { pouch: 1 } }), "pouch", NOW);
  assert.ok(pouch.ok && pouch.effect.kind === "points" && pouch.effect.amount === 40 && !pouch.state.inv.pouch);
});

test("zušlechtění 3 → 1 v rámci světa, epické už ne", () => {
  const r = refine(withMats({ shell: 7 }), "shell", 2);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.state.mats, { shell: 1, coral: 2 });
  assert.deepEqual(refine(withMats({ shell: 2 }), "shell"), { ok: false, error: "missing" });
  assert.deepEqual(refine(withMats({ "ocean-heart": 9 }), "ocean-heart"), { ok: false, error: "unknown" });
});

test("nákup: jen běžné a neobvyklé, denní limit a body", () => {
  const r = buy(withMats({}), "iron", 2, 500, NOW);
  assert.ok(r.ok && r.price === 80 && r.state.mats.iron === 2);
  assert.deepEqual(buy(withMats({}), "silver", 1, 9999, NOW), { ok: false, error: "unknown" });
  assert.deepEqual(buy(withMats({}), "wood", 1, 10, NOW), { ok: false, error: "points" });
  const full = withMats({}, { bought: { day: "2026-10-31", count: BUY_PER_DAY } });
  assert.deepEqual(buy(full, "wood", 1, 999, NOW), { ok: false, error: "limit" });
  assert.ok(buy(full, "wood", 1, 999, NOW + 86_400_000).ok, "další den zase jde");
});

test("bonusy za body nejdou zneužít nákupem materiálu", () => {
  const value = (cost: Record<string, number | undefined>) => Object.entries(cost).reduce((s, [id, c]) => s + (c ?? 0) * ({ common: 15, uncommon: 40, rare: 999, epic: 999 } as Record<Rarity, number>)[materialDef(id)!.rarity], 0);
  for (const r of RECIPES) if (r.effect?.kind === "points") assert.ok(value(r.cost) > r.effect.amount, r.id);
});

test("normalizace a změna světa", () => {
  assert.equal(normalizeCraft(null, NOW), null);
  assert.equal(normalizeCraft({ v: 2 }, NOW), null);
  const s = normalizeCraft({ v: 1, focus: "xx", mats: { wood: 3, nope: 5, iron: -2 }, inv: { scroll: 2, "avatar-blacksmith": 1 }, boosts: [{ kind: "xp", pct: 20, until: NOW - 1 }] }, NOW)!;
  assert.equal(s.focus, "vesmir");
  assert.deepEqual(s.mats, { wood: 3 });
  assert.deepEqual(s.inv, { scroll: 2 });
  assert.deepEqual(s.boosts, []);
  const f = setFocus(s, "kouzla");
  assert.ok(f.ok && f.state.focus === "kouzla");
  assert.deepEqual(setFocus(s, "obecne"), { ok: false, error: "unknown" });
});

// Vyváženost: běžné učení (~80 XP denně po 10 XP) a 3 vybrané odměny ve stálých hrách denně.
// Exkluzivní avatar má jít vyrobit zhruba za 2–3 dny, ne za jeden.
test("vyváženost: avatar za 2–3 dny běžného učení", () => {
  const need = recipeDef("avatar-moon-witch")!.cost;
  // Umí z nasbíraného vyrobit? Zušlechťovat jde jen nahoru, takže stačí projít vzácnosti od nejnižší.
  const canMake = (mats: Record<string, number>) => {
    let carry = 0;
    for (const r of RARITIES) {
      const id = materialOf("kouzla", r).id;
      const surplus = (mats[id] ?? 0) + carry - (need[id] ?? 0);
      if (surplus < 0) return false;
      carry = Math.floor(surplus / 3);
    }
    return true;
  };
  const share = (days: number) => {
    let ok = 0;
    const players = 200;
    for (let p = 0; p < players; p++) {
      let s = emptyCraft(NOW, "kouzla");
      const xp = [];
      const quests = [];
      for (let d = 0; d < days; d++) {
        for (let i = 0; i < 8; i++) xp.push({ id: `p${p}d${d}x${i}`, amount: 10, at: NOW + 1 + d * 86_400_000 + i });
        for (let i = 0; i < 3; i++) quests.push({ id: `p${p}d${d}q${i}`, amount: 10, at: NOW + 1 + d * 86_400_000 + i });
      }
      s = applyEvents(s, xp, quests);
      if (canMake(s.mats)) ok++;
    }
    return ok / players;
  };
  assert.ok(share(1) < 0.5, `za 1 den by to bylo moc rychlé (${share(1)})`);
  assert.ok(share(3) >= 0.8, `za 3 dny by to mělo jít většině (${share(3)})`);
});
