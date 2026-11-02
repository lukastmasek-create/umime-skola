import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARB_COOLDOWN_MS,
  ASSETS,
  COMPANIES,
  HUSTLES,
  JOBS,
  arbitrage,
  assetDef,
  assetPrice,
  buyAsset,
  buyCompany,
  collectHustle,
  companyIncome,
  createCharacter,
  emptyState,
  investEdu,
  netWorth,
  normalizeState,
  quitJob,
  rates,
  restart,
  sellAsset,
  settle,
  startHustle,
  takeJob,
  type EconomyState,
} from "./economy.ts";

const H = 3_600_000;
const NOW = 1_800_000_000_000;
const ok = (r: { ok: boolean }) => assert.ok(r.ok, JSON.stringify(r));

function start(family: "poor" | "middle" | "rich" | "business" = "middle", era: "1990" | "2010" | "2025" | "2050" = "2025"): EconomyState {
  const r = createCharacter(emptyState(NOW), { country: "cz", name: "  Eva  ", city: "town", era, family }, NOW);
  assert.ok(r.ok);
  return r.ok ? r.state : emptyState(NOW);
}

test("obsah: jedinečná id, platné ceny a rostoucí žebříčky", () => {
  const ids = [...JOBS.map((j) => j.id), ...COMPANIES.map((c) => c.id), ...ASSETS.map((a) => a.id), ...HUSTLES.map((h) => h.id)];
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(JOBS.map((j) => j.salary), [...JOBS.map((j) => j.salary)].sort((a, b) => a - b));
  assert.deepEqual(COMPANIES.map((c) => c.cost), [...COMPANIES.map((c) => c.cost)].sort((a, b) => a - b));
  for (const c of COMPANIES) assert.ok(companyIncome(c.id) > 0 && c.cost / companyIncome(c.id) <= 14, `návratnost ${c.id}`);
  for (const h of HUSTLES) assert.ok(h.min < 1 && h.max > 1 && (h.min + h.max) / 2 > 1, `hustle ${h.id}`);
});

test("postava: startovní peníze podle rodiny a doby, jméno se očistí, podruhé nejde", () => {
  assert.equal(start("middle").cash, 300);
  assert.equal(start("rich").cash, 1500);
  assert.equal(start("poor", "1990").cash, 60);
  assert.equal(start("business", "2050").cash, 750);
  const s = start();
  assert.equal(s.character?.name, "Eva");
  assert.deepEqual(createCharacter(s, { country: "cz", name: "X", city: "town", era: "2025", family: "poor" }, NOW), { ok: false, error: "has-character" });
  assert.deepEqual(createCharacter(emptyState(NOW), { country: "xx", name: "X", city: "town", era: "2025", family: "poor" }, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(createCharacter(emptyState(NOW), { country: "cz", name: "   ", city: "town", era: "2025", family: "poor" }, NOW), { ok: false, error: "bad-request" });
});

test("práce: poplatek, výměna a výpověď; zkušenosti zvedají plat", () => {
  let s = start();
  assert.deepEqual(takeJob(s, "banker", NOW), { ok: false, error: "not-enough-cash" });
  const r = takeJob(s, "warehouse", NOW);
  ok(r);
  s = r.ok ? r.state : s;
  assert.deepEqual(takeJob(s, "warehouse", NOW), { ok: false, error: "same-job" });
  const before = rates(s, NOW).salary;
  const later = { ...s, job: { id: "warehouse" as const, hours: 1 } };
  assert.ok(rates(later, NOW).salary > before);
  const q = quitJob(s, NOW);
  ok(q);
  assert.deepEqual(quitJob(q.ok ? q.state : s, NOW), { ok: false, error: "no-job" });
});

test("firmy: cena roste s počtem, digitální obory zamyká doba", () => {
  let s = start("rich");
  const first = buyCompany(s, "shoes", NOW);
  ok(first);
  s = first.ok ? first.state : s;
  assert.equal(s.cash, 1500 - 150);
  const second = buyCompany(s, "shoes", NOW);
  ok(second);
  assert.equal(second.ok ? s.cash - second.state.cash : 0, 173);
  const old = start("rich", "1990");
  assert.deepEqual(buyCompany({ ...old, cash: 1e6 }, "software", NOW), { ok: false, error: "locked" });
  assert.deepEqual(buyAsset({ ...old, cash: 1e6 }, "coin", 100, NOW), { ok: false, error: "locked" });
  assert.deepEqual(buyCompany(s, "nonsense", NOW), { ok: false, error: "bad-request" });
});

test("příjem: peníze plynou v čase, offline má strop, bez postavy nic", () => {
  let s = start("rich");
  const bought = buyCompany(s, "shoes", NOW);
  s = bought.ok ? bought.state : s;
  const minute = settle(s, NOW + 60_000);
  const gain = minute.cash - s.cash;
  assert.ok(gain > 5 && gain < 12, `za minutu ${gain}`);
  const week = settle(s, NOW + 7 * 24 * H);
  const capped = settle(s, NOW + 15 * 60_000);
  assert.ok(Math.abs(week.cash - capped.cash) < 1e-6, "offline má strop 15 min");
  assert.equal(settle(emptyState(NOW), NOW + H).cash, 0);
});

test("investice: cena je čistá funkce času a nákup/prodej drží účet", () => {
  for (const a of ASSETS) {
    assert.equal(assetPrice(a.id, NOW), assetPrice(a.id, NOW));
    for (let i = 0; i < 200; i++) {
      const p = assetPrice(a.id, NOW + i * 7 * 60_000);
      assert.ok(p > 0 && p < a.base * 3, `cena ${a.id} ${p}`);
    }
  }
  const s = start("rich");
  const b = buyAsset(s, "technology", 1000, NOW);
  ok(b);
  const held = b.ok ? b.state : s;
  assert.equal(held.cash, 500);
  assert.ok(Math.abs((held.holdings.technology ?? 0) * assetPrice("technology", NOW) - 1000) < 1e-6);
  const sold = sellAsset(held, "technology", 1, NOW);
  ok(sold);
  const after = sold.ok ? sold.state : held;
  assert.ok(Math.abs(after.cash - 1500) < 1e-6, "ve stejný okamžik je prodej bez zisku");
  assert.equal(after.holdings.technology, undefined);
  assert.deepEqual(sellAsset(after, "technology", 1, NOW), { ok: false, error: "nothing" });
  assert.deepEqual(buyAsset(s, "technology", -5, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(buyAsset({ ...s, cash: 0 }, "technology", 10, NOW), { ok: false, error: "not-enough-cash" });
});

test("nemovitosti a cenné papíry dávají pasivní příjem", () => {
  const s = { ...start("rich"), cash: 100_000 };
  const re = buyAsset(s, "flat", 50_000, NOW);
  const state = re.ok ? re.state : s;
  assert.ok(rates(state, NOW).passive > 0);
});

test("arbitráž: potřebuje rozdíl cen a čeká se mezi obchody", () => {
  const s = start("rich");
  let found: number | null = null;
  for (let i = 0; i < 2000 && found === null; i++) {
    const t = NOW + i * 20_000;
    if (arbitrage(s, 1000, t).ok) found = t;
  }
  assert.ok(found !== null, "někdy se rozdíl cen vyplatí");
  const r = arbitrage(s, 1000, found!);
  assert.ok(r.ok && r.state.cash > s.cash);
  if (r.ok) {
    assert.deepEqual(arbitrage(r.state, 1000, found! + 1000), { ok: false, error: "cooldown" });
    assert.equal(r.state.arbReadyAt, found! + ARB_COOLDOWN_MS);
  }
});

test("hustle: kapitál se zablokuje, výsledek je v rozsahu a vybrat jde až po čase", () => {
  const s = { ...start("rich"), cash: 1000 };
  const lo = startHustle(s, "reselling", NOW, () => 0);
  const hi = startHustle(s, "reselling", NOW, () => 0.999999);
  ok(lo);
  ok(hi);
  const slot = lo.ok ? lo.state : s;
  assert.equal(slot.cash, 800);
  assert.deepEqual(startHustle(slot, "reselling", NOW), { ok: false, error: "busy" });
  assert.deepEqual(collectHustle(slot, "reselling", NOW + 20_000), { ok: false, error: "not-ready" });
  const paid = collectHustle(slot, "reselling", NOW + 60_000);
  assert.ok(paid.ok && paid.state.cash === 800 + 170 && !paid.state.hustle.reselling);
  const rich = collectHustle(hi.ok ? hi.state : s, "reselling", NOW + 60_000);
  assert.ok(rich.ok && rich.state.cash > 1000);
  assert.deepEqual(startHustle({ ...s, cash: 100 }, "carflip", NOW), { ok: false, error: "not-enough-cash" });
  assert.deepEqual(collectHustle(s, "reselling", NOW), { ok: false, error: "nothing" });
});

test("vzdělání: body se utrácejí, bonus roste a má strop", () => {
  let s = start();
  const r = investEdu(s, NOW);
  assert.ok(r.ok && r.pointsSpent === 10);
  s = r.ok ? r.state : s;
  const base = rates({ ...s, edu: 0, job: { id: "warehouse", hours: 0 } }, NOW);
  const boosted = rates({ ...s, job: { id: "warehouse", hours: 0 } }, NOW);
  assert.ok(boosted.net > base.net);
  assert.deepEqual(investEdu({ ...s, edu: 25 }, NOW), { ok: false, error: "max" });
  const learning = rates({ ...s, job: { id: "warehouse", hours: 0 } }, NOW, 5);
  assert.ok(learning.multiplier <= 1 + 0.04 + 0.5 + 1e-9, "učení má strop");
});

test("začít znovu: nový start, zachová rekord a počet pokusů", () => {
  let s = start("rich");
  const bought = buyCompany(s, "shoes", NOW);
  s = bought.ok ? bought.state : s;
  assert.ok(s.best >= 1500);
  const r = restart(s, NOW + H);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.state.character, null);
    assert.equal(r.state.runs, 1);
    assert.equal(r.state.best, s.best);
    assert.deepEqual(r.state.companies, {});
  }
});

test("investice: nová aktiva jdou koupit a prodat a stará držba zůstane platná", () => {
  const s = start("rich");
  for (const id of ["index", "startup_it"] as const) {
    const b = buyAsset(s, id, 500, NOW);
    ok(b);
    const held = b.ok ? b.state : s;
    assert.ok((held.holdings[id] ?? 0) > 0, `držba ${id}`);
    const sold = sellAsset(held, id, 1, NOW);
    ok(sold);
  }
  // stará aktiva mají beze změny stejnou cenu jako dřív (žádný přepočet držby)
  assert.equal(assetDef("technology").base, 100);
  assert.equal(assetDef("state").yield, 0.0015);
});

test("investice: staré obecné držby se přesunou na výchozí položku bez ztráty", () => {
  assert.equal(assetDef("technology").seed, "stocks");
  const raw = { ...start("rich"), holdings: { stocks: 4 }, cost: { stocks: 90 } };
  const s = normalizeState(raw, NOW);
  assert.equal(s.holdings.technology, 4);
  assert.equal(s.holdings.stocks, undefined);
  assert.equal(s.cost.technology, 90);
  // nová a stará držba téže položky se sloučí a cena na kus je vážený průměr
  const both = normalizeState({ ...start("rich"), holdings: { stocks: 1, technology: 3 }, cost: { stocks: 100, technology: 200 } }, NOW);
  assert.equal(both.holdings.technology, 4);
  assert.equal(both.cost.technology, 175);
});

test("jmění: hotovost + investice + firmy", () => {
  const s = start("rich");
  assert.equal(netWorth(s, NOW), 1500);
  const c = buyCompany(s, "shoes", NOW);
  assert.equal(c.ok ? netWorth(c.state, NOW) : -1, 1500);
});

test("normalizeState: poškozená data se opraví bez pádu", () => {
  assert.equal(normalizeState(null, NOW).character, null);
  assert.equal(normalizeState("x", NOW).cash, 0);
  const bad = normalizeState(
    {
      character: { country: "cz", name: "<b>Tom</b>", city: "nope", era: "2025", family: "poor" },
      cash: "lots",
      companies: { shoes: 9999, ghost: 4 },
      holdings: { stocks: -3, metal: 2 },
      hustle: { carflip: { startedAt: NOW + 1e9, payout: 1e12 } },
      edu: 99,
    },
    NOW,
  );
  assert.equal(bad.character, null, "neplatné město = bez postavy");
  assert.equal(bad.cash, 0);
  assert.equal(bad.companies.shoes, 50);
  assert.equal("ghost" in bad.companies, false);
  assert.equal(bad.holdings.technology, undefined);
  assert.equal(bad.holdings.gold, 2);
  assert.ok(bad.hustle.carflip!.startedAt <= NOW && bad.hustle.carflip!.payout <= 5000 * 1.55);
  assert.equal(bad.edu, 25);
  const round = normalizeState(JSON.parse(JSON.stringify(start("rich"))), NOW);
  assert.equal(round.character?.name, "Eva");
});
