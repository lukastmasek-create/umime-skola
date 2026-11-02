import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARB_COOLDOWN_MS,
  ASSETS,
  COMPANIES,
  HUSTLES,
  INCOME_SPEED,
  JOBS,
  SITUATIONS,
  arbitrage,
  assetPrice,
  buyAsset,
  buyCompany,
  chooseShift,
  collectHustle,
  companyIncome,
  createCharacter,
  emptyState,
  fireStaff,
  hireStaff,
  investEdu,
  negotiateRaise,
  newJob,
  netWorth,
  normalizeState,
  quitJob,
  rates,
  rest,
  requestPromotion,
  restart,
  sellAsset,
  setLead,
  settle,
  startHustle,
  startShift,
  startVacation,
  takeJob,
  type EconomyState,
} from "./economy.ts";

// Pevný rng: první volání vrací 0,99 (žádná nemoc ani krize), třetí vrátí `seed` (výběr situací).
const rngFor = (seed: number) => {
  let i = 0;
  return () => (i++ === 2 ? seed : 0.99);
};

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

test("práce: poplatek, Vzdělání odemyká povolání, výměna a výpověď", () => {
  let s = start();
  assert.deepEqual(takeJob(s, "banker", NOW), { ok: false, error: "locked" });
  assert.deepEqual(takeJob({ ...s, edu: 14 }, "banker", NOW), { ok: false, error: "not-enough-cash" });
  const r = takeJob(s, "warehouse", NOW);
  ok(r);
  s = r.ok ? r.state : s;
  assert.deepEqual(takeJob(s, "warehouse", NOW), { ok: false, error: "same-job" });
  assert.equal(s.job?.rank, 1);
  const q = quitJob(s, NOW);
  ok(q);
  assert.deepEqual(quitJob(q.ok ? q.state : s, NOW), { ok: false, error: "no-job" });
});

test("pasivní plat je 60 % stupně a stoupá s povýšením a zvýšením", () => {
  const s = takeJob(start(), "warehouse", NOW);
  ok(s);
  const base = s.ok ? s.state : start();
  const salary = rates(base, NOW).salary;
  assert.ok(Math.abs(salary - 40 * 0.6 * INCOME_SPEED) < 1e-6, `plat ${salary}`);
  const up = { ...base, job: { ...base.job!, rank: 3 } };
  assert.ok(rates(up, NOW).salary > salary);
  const raised = { ...base, raises: { warehouse: 1.1 } };
  assert.ok(rates(raised, NOW).salary > salary);
  const ill = { ...base, sickUntil: NOW + H };
  assert.equal(rates(ill, NOW).salary, 0);
  const holiday = { ...base, vacationUntil: NOW + H };
  assert.ok(Math.abs(rates(holiday, NOW).salary - salary / 2) < 1e-6);
});

// Pomocník: projde celou směnu. `pick` dostane výkony situace a vrátí index volby.
const best = (p: number[]) => p.indexOf(Math.max(...p));
const worst = (p: number[]) => p.indexOf(Math.min(...p));
function playShift(s: EconomyState, now: number, pick: (perfs: number[]) => number): EconomyState {
  let cur = s;
  for (let step = 0; step < 3; step++) {
    const sh = cur.shift!;
    const perfs = [...SITUATIONS[(sh.seed + sh.step * 2) % SITUATIONS.length].perf];
    const r = chooseShift(cur, pick(perfs), now);
    ok(r);
    cur = r.ok ? r.state : cur;
  }
  return cur;
}

test("směna: energie se odečítá, výplata roste s výkonem a body se připisují", () => {
  const base = takeJob(start(), "warehouse", NOW);
  ok(base);
  const s = base.ok ? base.state : start();
  const startCash = s.cash;
  const started = startShift(s, NOW, rngFor(0));
  ok(started);
  const sh = started.ok ? started.state : s;
  assert.equal(sh.energy, s.energy, "energie se odečítá až při rozhodnutích");
  const good = playShift(sh, NOW, best);
  const bad = playShift(sh, NOW, worst);
  assert.ok(good.cash - startCash > bad.cash - startCash, "lepší výkon = vyšší výplata");
  assert.equal(good.energy, sh.energy - 30);
  assert.equal(good.shift, null);
  assert.ok(good.job!.points > 0);
  assert.deepEqual(startShift(good, NOW, rngFor(0)), { ok: false, error: "cooldown" });
  const one = chooseShift(sh, 0, NOW);
  ok(one);
  assert.equal(one.ok && one.event, "shift-step");
});

test("směna: nejde spustit bez energie, při nemoci nebo na dovolené", () => {
  const base = takeJob(start(), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  assert.deepEqual(startShift({ ...s, energy: 20 }, NOW, () => 0.99), { ok: false, error: "low-energy" });
  assert.deepEqual(startShift({ ...s, sickUntil: NOW + H }, NOW, () => 0.99), { ok: false, error: "sick" });
  assert.deepEqual(startShift({ ...s, vacationUntil: NOW + H }, NOW, () => 0.99), { ok: false, error: "vacation" });
  assert.deepEqual(startShift(start(), NOW, () => 0.99), { ok: false, error: "no-job" });
  assert.deepEqual(chooseShift(s, 0, NOW), { ok: false, error: "no-shift" });
});

test("nemoc se losuje při nástupu a hráč ji nemůže odmítnout", () => {
  const base = takeJob(start(), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  const sick = startShift(s, NOW, () => 0.01);
  ok(sick);
  assert.equal(sick.ok ? sick.event : null, "sick");
  assert.ok(sick.ok && sick.state.sickUntil > NOW);
  assert.equal(sick.ok ? sick.state.shift : "x", null);
});

test("povýšení: body a čekání na stupeň, šance podle výkonu", () => {
  const base = takeJob(start("business"), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  assert.deepEqual(requestPromotion({ ...s, job: { ...s.job!, points: 0 } }, NOW + 3 * H), { ok: false, error: "not-enough-points" });
  // Warehouse chce Vzdělání 1 (stupeň 1 → 2), proto edu 1.
  const ready = { ...s, edu: 1, job: { ...s.job!, points: 60, rankSince: NOW - 3 * H } };
  assert.deepEqual(requestPromotion({ ...ready, job: { ...ready.job!, rankSince: NOW } }, NOW), { ok: false, error: "not-ready" });
  assert.deepEqual(requestPromotion({ ...ready, edu: 0 }, NOW), { ok: false, error: "locked" });
  const yes = requestPromotion(ready, NOW, () => 0);
  ok(yes);
  assert.equal(yes.ok && yes.state.job?.rank, 2);
  assert.equal(yes.ok && yes.event, "promoted");
  const no = requestPromotion(ready, NOW, () => 0.999);
  ok(no);
  assert.equal(no.ok && no.event, "promo-rejected");
  assert.deepEqual(requestPromotion(no.ok ? no.state : ready, NOW + 1000, () => 0), { ok: false, error: "cooldown" });
});

test("prémie: jednou za den 10 % z výplat za směny", () => {
  const base = takeJob(start(), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  const withPay = { ...s, dayPay: 1000, bonusAt: NOW };
  const after = settle(withPay, NOW + 25 * H);
  const control = settle({ ...withPay, dayPay: 0 }, NOW + 25 * H);
  assert.ok(Math.abs(after.cash - control.cash - 100) < 1e-6, "prémie je 10 % z 1000");
  assert.equal(after.dayPay, 0);
  const soon = settle({ ...withPay }, NOW + H);
  assert.equal(soon.dayPay, 1000, "před uplynutím dne se nic nevyplácí");
});

test("vyjednání platu: jednou za 7 dní, trvale zvýší plat povolání", () => {
  const base = takeJob(start(), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  const r = negotiateRaise(s, NOW, () => 0);
  ok(r);
  assert.ok(r.ok && (r.state.raises.warehouse ?? 1) > 1.04);
  assert.equal(r.ok && r.event, "raised");
  assert.deepEqual(negotiateRaise(r.ok ? r.state : s, NOW + H, () => 0), { ok: false, error: "cooldown" });
  const no = negotiateRaise(s, NOW, () => 0.999);
  assert.equal(no.ok && no.event, "raise-rejected");
});

test("vedoucí směny jen od stupně 4 a dovolená má limit", () => {
  const base = takeJob(start(), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  assert.deepEqual(setLead(s, true, NOW), { ok: false, error: "locked" });
  const senior = { ...s, job: { ...s.job!, rank: 4 } };
  const lead = setLead(senior, true, NOW);
  ok(lead);
  assert.equal(lead.ok && lead.state.job?.lead, true);
  const v1 = startVacation(s, NOW);
  ok(v1);
  const v2 = startVacation(v1.ok ? v1.state : s, NOW + 25 * H);
  ok(v2);
  const v3 = startVacation(v2.ok ? v2.state : s, NOW + 50 * H);
  assert.deepEqual(v3, { ok: false, error: "max" });
});

test("odpočinek jednou za 6 hodin doplní energii", () => {
  const s = { ...start(), energy: 10 };
  const r = rest(s, NOW);
  ok(r);
  assert.equal(r.ok && r.state.energy, 100);
  assert.deepEqual(rest(r.ok ? r.state : s, NOW + H), { ok: false, error: "cooldown" });
});

test("zaměstnanci: nábor do vlastní firmy stojí, mzda snižuje čistý příjem", () => {
  const bought = buyCompany(start("rich"), "shoes", NOW);
  ok(bought);
  const s = bought.ok ? bought.state : start("rich");
  const before = rates(s, NOW);
  const hired = hireStaff(s, "shoes", NOW);
  ok(hired);
  const h = hired.ok ? hired.state : s;
  assert.equal(h.staff.shoes, 1);
  assert.ok(rates(h, NOW).wages > 0, "mzda je výdaj");
  assert.ok(rates(h, NOW).companies > before.companies, "zaměstnanec zvedá výnos firmy");
  assert.deepEqual(hireStaff(start("rich"), "shoes", NOW), { ok: false, error: "nothing" });
  assert.deepEqual(fireStaff(s, "shoes", NOW), { ok: false, error: "nothing" });
  const fired = fireStaff(h, "shoes", NOW);
  ok(fired);
  assert.equal(fired.ok && fired.state.staff.shoes, undefined);
});

test("výpověď: 5 špatných směn dá varování, dalších 5 výpověď", () => {
  const base = takeJob(start(), "warehouse", NOW);
  let s = base.ok ? base.state : start();
  let t = NOW;
  // seed 0 vybere situace, kde je nejhorší volba průměrně pod 30 %.
  const badShift = (cur: EconomyState): EconomyState => {
    t += 3 * H;
    const st = startShift({ ...cur, energy: 100 }, t, rngFor(0));
    ok(st);
    return playShift(st.ok ? st.state : cur, t, worst);
  };
  for (let i = 0; i < 4; i++) s = badShift(s);
  assert.equal(s.job?.warned, false);
  s = badShift(s);
  assert.equal(s.job?.warned, true);
  assert.ok(s.job, "zatím je v práci");
  for (let i = 0; i < 4; i++) s = badShift(s);
  s = badShift(s);
  assert.equal(s.job, null, "výpověď");
});

test("krize v oboru: varování přijde a plat se sníží až za den", () => {
  const base = takeJob(start(), "warehouse", NOW);
  const s = base.ok ? base.state : start();
  const seq = [0.99, 0.01, 0];
  let i = 0;
  const warned = startShift(s, NOW, () => seq[i++]);
  ok(warned);
  assert.equal(warned.ok && warned.event, "crisis-warning");
  const crisis = warned.ok ? warned.state.crisis : null;
  assert.ok(crisis && crisis.startAt === NOW + 24 * H);
  const before = jobSalaryAt(s, NOW + 25 * H);
  const during = jobSalaryAt(warned.ok ? warned.state : s, NOW + 25 * H);
  assert.ok(Math.abs(during - before * 0.9) < 1e-6, "krize snižuje plat o 10 %");
});

// Pasivní plat na hodinu, aby krizi šlo porovnat bez vlivu jiných složek.
const jobSalaryAt = (s: EconomyState, now: number) => rates(s, now).salary;

test("normalizace staré hry: stupeň se odvodí z hodin a body začínají od nuly", () => {
  const old = normalizeState({ character: { country: "cz", name: "Eva", city: "town", era: "2025", family: "poor" }, job: { id: "warehouse", hours: 1 } }, NOW);
  // Starý vzorec: 1 hodina = 4 kroky po 0,25 h, což dává stupeň 5.
  assert.equal(old.job?.rank, 5);
  assert.equal(old.job?.points, 0);
  assert.equal(old.energy, 100);
  assert.equal(old.shift, null);
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
  assert.deepEqual(buyAsset({ ...old, cash: 1e6 }, "crypto", 100, NOW), { ok: false, error: "locked" });
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
  const b = buyAsset(s, "stocks", 1000, NOW);
  ok(b);
  const held = b.ok ? b.state : s;
  assert.equal(held.cash, 500);
  assert.ok(Math.abs((held.holdings.stocks ?? 0) * assetPrice("stocks", NOW) - 1000) < 1e-6);
  const sold = sellAsset(held, "stocks", 1, NOW);
  ok(sold);
  const after = sold.ok ? sold.state : held;
  assert.ok(Math.abs(after.cash - 1500) < 1e-6, "ve stejný okamžik je prodej bez zisku");
  assert.equal(after.holdings.stocks, undefined);
  assert.deepEqual(sellAsset(after, "stocks", 1, NOW), { ok: false, error: "nothing" });
  assert.deepEqual(buyAsset(s, "stocks", -5, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(buyAsset({ ...s, cash: 0 }, "stocks", 10, NOW), { ok: false, error: "not-enough-cash" });
});

test("nemovitosti a cenné papíry dávají pasivní příjem", () => {
  const s = { ...start("rich"), cash: 100_000 };
  const re = buyAsset(s, "realestate", 50_000, NOW);
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
  const base = rates({ ...s, edu: 0, job: newJob("warehouse", NOW) }, NOW);
  const boosted = rates({ ...s, job: newJob("warehouse", NOW) }, NOW);
  assert.ok(boosted.net > base.net);
  assert.deepEqual(investEdu({ ...s, edu: 25 }, NOW), { ok: false, error: "max" });
  const learning = rates({ ...s, job: newJob("warehouse", NOW) }, NOW, 5);
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
  assert.equal(bad.holdings.stocks, undefined);
  assert.equal(bad.holdings.metal, 2);
  assert.ok(bad.hustle.carflip!.startedAt <= NOW && bad.hustle.carflip!.payout <= 5000 * 1.55);
  assert.equal(bad.edu, 25);
  const round = normalizeState(JSON.parse(JSON.stringify(start("rich"))), NOW);
  assert.equal(round.character?.name, "Eva");
});
