import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARB_COOLDOWN_MS,
  ASSETS,
  ASSET_EVENT_DURATION_MS,
  ASSET_EVENT_WINDOW_MS,
  ASSET_EVENTS,
  HISTORY_STEP_MS,
  MAX_ORDERS,
  ORDER_CHECK_MS,
  STARTUP_IDS,
  STARTUP_ROUND_MS,
  assetEventMult,
  cancelOrder,
  currentAssetEvent,
  placeOrder,
  portfolioValue,
  startupOutcome,
  startupRoundOf,
  COMPANIES,
  EVENT_DURATION_MS,
  EVENT_WINDOW_MS,
  HUSTLES,
  decideHustle,
  hustleChoices,
  hustleRoll,
  INCOME_SPEED,
  JOBS,
  SITUATIONS,
  arbitrage,
  assetDef,
  assetPrice,
  buyAsset,
  buyCompany,
  CONTRACT_MS,
  companyPrice,
  currentRival,
  researchCompany,
  rivalMult,
  sellPrice,
  PHASE_RATES,
  MAX_PHASE,
  phaseCost,
  phaseRequirement,
  rates as ratesOf,
  upgradePhase,
  isSick,
  rolesOf,
  sellCompany,
  signContract,
  chooseShift,
  companyIncome,
  companyYield,
  createCharacter,
  currentEvent,
  emptyState,
  eventAffects,
  fundResponse,
  hireStaff,
  investEdu,
  isNegativeEvent,
  negotiateRaise,
  newJob,
  netWorth,
  gameNow,
  normalizeState,
  setSpeed,
  quitJob,
  rates,
  rest,
  requestPromotion,
  restart,
  runCampaign,
  sellAsset,
  setCompanySetting,
  setLead,
  settle,
  startHustle,
  startShift,
  startVacation,
  takeJob,
  topUpHustle,
  upgradeCompany,
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
  assert.deepEqual(buyAsset({ ...old, cash: 1e6 }, "coin", 100, NOW), { ok: false, error: "locked" });
  assert.deepEqual(buyCompany(s, "nonsense", NOW), { ok: false, error: "bad-request" });
});

test("příjem: peníze plynou v čase, offline má strop, bez postavy nic", () => {
  let s = start("rich");
  const bought = buyCompany(s, "shoes", NOW);
  s = bought.ok ? bought.state : s;
  const minute = settle(s, NOW + 60_000);
  const gain = minute.cash - s.cash;
  // Sazba se bere z poloviny úseku (viz settle); mimořádná událost ji může měnit, proto porovnáváme s ní.
  assert.ok(Math.abs(gain - rates(s, NOW + 30_000).net / 60) < 1e-6, `za minutu ${gain}`);
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
      // zprávy trhu umí cenu zvednout i nad dvojnásobek základu (memecoin s rally 1,5×)
      assert.ok(p > 0 && p < a.base * 4, `cena ${a.id} ${p}`);
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

test("hustle: kapitál se zablokuje a tři kola přijdou po čase, poslední rozhodnutí vyplatí", () => {
  const s = { ...start("rich"), cash: 1000 };
  const r = startHustle(s, "reselling", NOW, () => 0.3);
  ok(r);
  let st = r.state;
  assert.equal(st.cash, 800);
  assert.deepEqual(startHustle(st, "reselling", NOW), { ok: false, error: "busy" });
  // První kolo se otevře až po jednom intervalu (30 s), ne hned.
  assert.deepEqual(decideHustle(st, "reselling", NOW + 29_000, "balance"), { ok: false, error: "not-ready" });
  const d1 = decideHustle(st, "reselling", NOW + 30_000, "balance");
  ok(d1);
  st = d1.state;
  assert.equal(st.hustle.reselling!.round, 1);
  assert.equal(st.cash, 800);
  const d2 = decideHustle(st, "reselling", NOW + 60_000, "secure");
  ok(d2);
  st = d2.state;
  assert.equal(st.hustle.reselling!.round, 2);
  const d3 = decideHustle(st, "reselling", NOW + 90_000, "risky");
  ok(d3);
  assert.ok(!d3.state.hustle.reselling, "po posledním kole je hustl uzavřen");
  assert.ok(d3.ok && d3.gained?.cash === d3.state.cash - 800, "výplata se připíše do hotovosti");
  assert.deepEqual(decideHustle(d3.state, "reselling", NOW + 90_000, "balance"), { ok: false, error: "nothing" });
});

test("hustle: volba musí být v nabídce kola a nejde zamknutý hustl", () => {
  const s = { ...start("rich"), cash: 1000 };
  const r = startHustle(s, "reselling", NOW, () => 0.3);
  ok(r);
  assert.deepEqual(decideHustle(r.state, "reselling", NOW + 30_000, "neexistuje"), { ok: false, error: "bad-request" });
  assert.deepEqual(startHustle({ ...s, edu: 0 }, "startup", NOW), { ok: false, error: "locked" });
  assert.deepEqual(startHustle({ ...s, cash: 100 }, "carflip", NOW), { ok: false, error: "not-enough-cash" });
});

test("hustle: stejné semínko dává stejný výsledek a riziko zužuje rozsah každé volby", () => {
  const base = { startedAt: NOW, value: 1000, stake: 1000, round: 0, seed: 42, streak: 0 };
  const width = (risk: number, key: string) => {
    const c = hustleChoices({ ...base, risk }, "carflip").find((x) => x.key === key);
    assert.ok(c, key);
    return c.hi - c.lo;
  };
  assert.ok(width(10, "risky") < width(100, "risky"));
  assert.ok(width(100, "secure") < width(100, "risky"));
  assert.equal(hustleRoll(42, 1, 2), hustleRoll(42, 1, 2));
  for (let i = 0; i < 50; i++) {
    const v = hustleRoll(i * 977, i % 3, i % 4);
    assert.ok(v >= 0 && v < 1, `rozsah ${v}`);
  }
});

test("hustle: série úspěchů zvedá střed rozsahu a dokoupení zvětší hodnotu i vklad", () => {
  const base = { startedAt: NOW, value: 1000, stake: 1000, round: 0, seed: 7, risk: 50 };
  const fresh = hustleChoices({ ...base, streak: 0 }, "houseflip").find((x) => x.key === "balance")!;
  const hot = hustleChoices({ ...base, streak: 9 }, "houseflip").find((x) => x.key === "balance")!;
  assert.ok(hot.lo > fresh.lo && hot.hi > fresh.hi);
  const s = { ...start("rich"), cash: 10_000 };
  const r = startHustle(s, "carflip", NOW, () => 0, { stake: 1000 });
  ok(r);
  const top = topUpHustle(r.state, "carflip", NOW, 500);
  ok(top);
  assert.equal(top.state.cash, 10_000 - 1000 - 500);
  assert.equal(top.state.hustle.carflip!.value, 1500);
  assert.equal(top.state.hustle.carflip!.stake, 1500);
});

test("hustle: stará uložená hra se rozjetý hustl vyplatí hned při načtení", () => {
  const raw = { ...start("rich"), cash: 500, hustle: { reselling: { startedAt: NOW, payout: 300, stake: 200 } } };
  const n = normalizeState(JSON.parse(JSON.stringify(raw)), NOW);
  assert.equal(n.cash, 800);
  assert.equal(n.hustle.reselling, undefined);
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
      hustle: { carflip: { startedAt: NOW + 1e9, value: -5, stake: 1e12, round: 9, seed: "x", risk: 500, streak: -1 } },
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
  const slot = bad.hustle.carflip!;
  assert.ok(slot.startedAt <= NOW && slot.value === 0 && slot.round === 2 && slot.risk === 100 && slot.streak === 0);
  assert.equal(bad.edu, 25);
  const round = normalizeState(JSON.parse(JSON.stringify(start("rich"))), NOW);
  assert.equal(round.character?.name, "Eva");
});

test("firma: vylepšení, zaměstnanci, cena a výroba mění výnos; jde to jen u vlastněné firmy", () => {
  const base = { ...start("rich"), cash: 1e6 };
  assert.deepEqual(upgradeCompany(base, "shoes", NOW), { ok: false, error: "nothing" });
  const bought = buyCompany(base, "shoes", NOW);
  ok(bought);
  let s = bought.ok ? bought.state : base;
  const plain = companyYield(s, "shoes", NOW).gross;

  const up = upgradeCompany(s, "shoes", NOW);
  ok(up);
  s = up.ok ? up.state : s;
  assert.ok(companyYield(s, "shoes", NOW).gross > plain, "vylepšení zvedne výnos");
  assert.deepEqual(upgradeCompany(s, "shoes", NOW), { ok: false, error: "max" });

  const hired = hireStaff(s, "shoes", 1, NOW);
  ok(hired);
  s = hired.ok ? hired.state : s;
  assert.equal(s.setup.shoes?.staff, 1);
  assert.ok(companyYield(s, "shoes", NOW).costs > 0, "zaměstnanec stojí mzdu");
  assert.deepEqual(hireStaff(s, "shoes", 0, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(hireStaff({ ...s, companies: { shoes: 1 }, setup: { shoes: { ...s.setup.shoes!, staff: 3 } } }, "shoes", 1, NOW), { ok: false, error: "max" });
  assert.deepEqual(hireStaff({ ...s, cash: 0 }, "shoes", 1, NOW), { ok: false, error: "not-enough-cash" });
  const fired = hireStaff(s, "shoes", -1, NOW);
  ok(fired);
  assert.equal(fired.ok ? fired.state.setup.shoes?.staff : -1, 0);

  const cheap = setCompanySetting(s, "shoes", "output", 1.4, NOW);
  ok(cheap);
  assert.equal(cheap.ok ? cheap.state.setup.shoes?.output : -1, 1.4);
  const clamped = setCompanySetting(s, "shoes", "risk", 7, NOW);
  assert.equal(clamped.ok ? clamped.state.setup.shoes?.risk : -1, 1);
  assert.deepEqual(setCompanySetting(s, "shoes", "price", "extreme", NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(setCompanySetting(s, "shoes", "owner", 1, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(setCompanySetting(s, "clothes", "price", 1.5, NOW), { ok: false, error: "nothing" });
});

test("firma: marketingová kampaň běží půl hodiny a nedá se spustit znovu", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e6 }, "tech", NOW);
  ok(bought);
  const s = bought.ok ? bought.state : emptyState(NOW);
  const boosted = runCampaign(s, "tech", NOW);
  ok(boosted);
  if (!boosted.ok) return;
  assert.ok(boosted.state.cash < s.cash);
  assert.deepEqual(runCampaign(boosted.state, "tech", NOW + 60_000), { ok: false, error: "busy" });
  assert.ok(companyYield(boosted.state, "tech", NOW + 60_000).gross > companyYield(s, "tech", NOW + 60_000).gross);
  const later = NOW + 31 * 60_000;
  assert.ok(runCampaign(boosted.state, "tech", later).ok, "po půl hodině jde znovu");
});

test("události: každé okno má jednu událost, která trvá půl hodiny", () => {
  assert.ok(currentEvent(NOW), "na začátku okna běží událost");
  assert.equal(currentEvent(NOW + EVENT_DURATION_MS), null, "po půl hodině je klid");
  assert.equal(currentEvent(NOW + EVENT_WINDOW_MS)?.window, currentEvent(NOW)!.window + 1);
  assert.equal(currentEvent(NOW + EVENT_WINDOW_MS)?.endsAt, NOW + EVENT_WINDOW_MS + EVENT_DURATION_MS);
});

test("události: krizový fond zmírní ztrátu jen jednou a jen u zasažené firmy", () => {
  const s = { ...start("rich"), cash: 1e6 };
  const bought = buyCompany(s, "shoes", NOW);
  ok(bought);
  const owned = bought.ok ? bought.state : s;
  let t: number | null = null;
  for (let i = 0; i < 400 && t === null; i++) {
    const at = NOW + i * EVENT_WINDOW_MS;
    const ev = currentEvent(at);
    if (ev && isNegativeEvent(ev.def) && eventAffects(ev.def, "shoes")) t = at;
  }
  assert.ok(t !== null, "za pár oken přijde ztrátová událost pro obuv");
  const before = companyYield(owned, "shoes", t!).gross;
  const fund = fundResponse(owned, "shoes", t!);
  ok(fund);
  if (!fund.ok) return;
  assert.ok(fund.state.cash < owned.cash);
  assert.ok(companyYield(fund.state, "shoes", t!).gross > before, "fond zvedne výnos oproti bezbrannému stavu");
  assert.deepEqual(fundResponse(fund.state, "shoes", t!), { ok: false, error: "busy" });
  assert.deepEqual(fundResponse(owned, "shoes", NOW + EVENT_DURATION_MS + 1), { ok: false, error: "nothing" });
});

test("firma: prodej jednoho kusu vrátí podíl ceny a ořízne zaměstnance", () => {
  let s = { ...start("rich"), cash: 1e6 };
  for (let i = 0; i < 2; i++) {
    const b = buyCompany(s, "shoes", NOW);
    ok(b);
    s = b.ok ? b.state : s;
  }
  const h = hireStaff(s, "shoes", 1, NOW);
  ok(h);
  s = h.ok ? h.state : s;
  const sold = sellCompany(s, "shoes", NOW);
  ok(sold);
  if (!sold.ok) return;
  assert.equal(sold.state.companies.shoes, 1);
  assert.ok(sold.state.cash > s.cash, "prodej přinese peníze");
  assert.equal(sold.state.cash - s.cash, sellPrice(s, "shoes"), "vrátí přesně nabídnutou cenu");
  assert.ok(sellPrice(s, "shoes") < companyPrice(s, "shoes") / 1.15, "dostaneš míň, než jsi zaplatil");
  const last = sellCompany(sold.state, "shoes", NOW);
  ok(last);
  assert.equal(last.ok ? last.state.companies.shoes : 1, undefined, "poslední kus firmu zruší");
  assert.deepEqual(sellCompany(last.ok ? last.state : s, "shoes", NOW), { ok: false, error: "nothing" });
});

test("kontrakt: zvedne výnos na omezenou dobu, jen jeden najednou a zesílí dopad krize", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e6 }, "shoes", NOW);
  ok(bought);
  const s = bought.ok ? bought.state : emptyState(NOW);
  const signed = signContract(s, "shoes", NOW);
  ok(signed);
  if (!signed.ok) return;
  assert.ok(signed.state.cash < s.cash, "kontrakt něco stojí");
  assert.ok(companyYield(signed.state, "shoes", NOW).gross > companyYield(s, "shoes", NOW).gross, "kontrakt zvedne výnos");
  assert.deepEqual(signContract(signed.state, "shoes", NOW), { ok: false, error: "busy" });
  assert.ok(signContract(signed.state, "shoes", NOW + CONTRACT_MS + 1).ok, "po skončení jde podepsat znovu");
  assert.deepEqual(signContract(s, "clothes", NOW), { ok: false, error: "nothing" });
});

test("výzkum: každá úroveň zvedne výnos, strop jsou tři úrovně", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e9 }, "tech", NOW);
  ok(bought);
  let s = bought.ok ? bought.state : emptyState(NOW);
  let prev = companyYield(s, "tech", NOW).gross;
  for (let lvl = 1; lvl <= 3; lvl++) {
    const r = researchCompany(s, "tech", NOW);
    ok(r);
    s = r.ok ? r.state : s;
    assert.equal(s.research.tech, lvl);
    const now = companyYield(s, "tech", NOW).gross;
    assert.ok(now > prev, `úroveň ${lvl} zvedne výnos`);
    prev = now;
  }
  assert.deepEqual(researchCompany(s, "tech", NOW), { ok: false, error: "max" });
});

test("konkurence: každé okno cílí na vlastněný obor a kampaň útok zmírní", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e9 }, "bakery", NOW);
  ok(bought);
  const s = bought.ok ? bought.state : emptyState(NOW);
  let t: number | null = null;
  for (let i = 0; i < 50 && t === null; i++) if (currentRival(s, NOW + i * EVENT_WINDOW_MS) === "bakery") t = NOW + i * EVENT_WINDOW_MS;
  assert.ok(t !== null, "konkurent se během pár oken objeví u jediné firmy");
  assert.equal(currentRival(s, t! + EVENT_DURATION_MS + 1), null, "mimo okno žádný konkurent");
  const attacked = rivalMult(s, "bakery", t!);
  assert.ok(attacked < 1, "konkurent sníží výnos");
  const shielded = runCampaign(s, "bakery", t!);
  ok(shielded);
  if (!shielded.ok) return;
  assert.ok(rivalMult(shielded.state, "bakery", t!) > attacked, "kampaň útok zmírní");
  assert.equal(rivalMult(s, "bakery", t! + EVENT_DURATION_MS + 1), 1, "mimo okno bez vlivu");
});

test("nová pole: stará data se doplní a příliš dlouhý kontrakt se ořízne", () => {
  const s = normalizeState({ character: null, companies: { shoes: 2 }, research: { shoes: 9 }, contracts: { shoes: NOW + 999 * H } }, NOW);
  assert.deepEqual(s.research, { shoes: 3 });
  assert.equal(s.contracts.shoes, NOW + CONTRACT_MS, "kontrakt delší než limit se ořízne na nejdelší dobu");
  assert.deepEqual(normalizeState(null, NOW).research, {});
});

test("fáze: postup chce výnos firem a zaplatí den tohoto výnosu; nejde přeskočit", () => {
  const s = { ...start("rich"), cash: 1e12 };
  assert.deepEqual(upgradePhase(s, NOW), { ok: false, error: "locked" }, "bez firem není dost výnosu");
  const bought = buyCompany(s, "shoes", NOW);
  ok(bought);
  let g = bought.ok ? bought.state : s;
  // Kusy kupujeme, dokud výnos nedosáhne požadavku (události a konkurent ho mohou snížit).
  for (let i = 0; i < 50 && ratesOf(g, NOW).companies < phaseRequirement(2); i++) {
    const b = buyCompany(g, "shoes", NOW);
    ok(b);
    g = b.ok ? b.state : g;
  }
  assert.ok(ratesOf(g, NOW).companies >= phaseRequirement(2), "výnos stačí");
  const up = upgradePhase(g, NOW);
  ok(up);
  if (!up.ok) return;
  assert.equal(up.state.phase, 2);
  assert.equal(g.cash - up.state.cash, phaseCost(2));
  if (ratesOf(up.state, NOW).companies < phaseRequirement(3)) {
    assert.deepEqual(upgradePhase(up.state, NOW), { ok: false, error: "locked" }, "další fáze chce víc výnosu");
  }
  assert.deepEqual(upgradePhase({ ...g, cash: 0 }, NOW), { ok: false, error: "not-enough-cash" });
});

test("fáze: nájem a daň rostou s fází; bez firmy se nic neplatí", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e9 }, "shoes", NOW);
  ok(bought);
  const base = bought.ok ? bought.state : emptyState(NOW);
  const low = ratesOf({ ...base, phase: 1 }, NOW);
  const high = ratesOf({ ...base, phase: 12 }, NOW);
  assert.ok(high.companyCosts > low.companyCosts, "vyšší fáze stojí víc");
  assert.equal(PHASE_RATES.length, MAX_PHASE);
  const owned = ratesOf({ ...base, phase: 2 }, NOW);
  assert.ok(owned.companyCosts > 0, "firma platí nájem a daň");
  assert.equal(ratesOf({ ...start("rich"), phase: 2 }, NOW).companyCosts, 0, "bez firmy se nic neplatí");
  assert.equal(normalizeState({ phase: 99 }, NOW).phase, MAX_PHASE);
  assert.equal(normalizeState(null, NOW).phase, 1);
});

test("čas: rychlost 16× připíše 16× příjem, offline strop se násobí a uložený herní čas se nořeže", () => {
  const bought = buyCompany(start("rich"), "shoes", NOW);
  const s1 = bought.ok ? bought.state : start("rich");
  const fast = setSpeed(s1, 16, NOW);
  assert.ok(fast.ok);
  const s16 = fast.ok ? fast.state : s1;
  assert.equal(gameNow(s16, NOW + 1000), NOW + 16_000, "herní čas plyne 16×");
  const gain1 = settle(s1, NOW + 60_000).cash - s1.cash;
  const gain16 = settle(s16, gameNow(s16, NOW + 60_000)).cash - s16.cash;
  assert.ok(gain16 > gain1 * 15 && gain16 < gain1 * 17, `16× ${gain16} vs 1× ${gain1}`);
  // offline strop: 15 reálných minut = 240 herních minut při 16×
  const week = settle(s16, gameNow(s16, NOW + 7 * 24 * H));
  const capped = settle(s16, NOW + 240 * 60_000);
  assert.ok(Math.abs(week.cash - capped.cash) < 1e-6, "offline strop se násobí rychlostí");
  // herní čas předběhne reálný; uložený stav se při načtení nesmí useknout
  const ahead = settle(s16, gameNow(s16, NOW + H));
  assert.equal(normalizeState(JSON.parse(JSON.stringify(ahead)), NOW + H).lastSeen, NOW + 16 * H);
  assert.equal(normalizeState(JSON.parse(JSON.stringify(ahead)), NOW + H).speed, 16);
});

test("čas: nepovolená rychlost a bez postavy se nepřepne", () => {
  assert.deepEqual(setSpeed(start(), 3, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(setSpeed(emptyState(NOW), 2, NOW), { ok: false, error: "no-character" });
});

test("tržní zprávy: zpráva působí jen na svou kategorii a jen hodinu z každých tří", () => {
  let found = 0;
  for (let t = NOW; t < NOW + 30 * H; t += 10 * 60_000) {
    const ev = currentAssetEvent(t);
    if (!ev) continue;
    found++;
    for (const a of ASSETS) {
      const expected = ev.def.affects === "all" || ev.def.affects.includes(a.cat) ? ev.def.mult : 1;
      assert.equal(assetEventMult(a.id, t), expected, `${ev.def.id} → ${a.id}`);
    }
  }
  assert.ok(found > 0, "zprávy se objevují");
  assert.ok(ASSET_EVENTS.length >= 5);
  const windowStart = Math.floor(NOW / ASSET_EVENT_WINDOW_MS) * ASSET_EVENT_WINDOW_MS;
  assert.equal(currentAssetEvent(windowStart + ASSET_EVENT_DURATION_MS), null, "po hodině zpráva končí");
});

test("startupy: držba se vyhodnotí v kole, které nastane po nákupu (exit i krach)", () => {
  const base = startupRoundOf(NOW);
  const first = (id: (typeof STARTUP_IDS)[number]) => {
    for (let r = base + 1; r <= base + 400; r++) {
      const out = startupOutcome(id, r);
      if (out.kind !== "run") return { round: r, kind: out.kind };
    }
    return null;
  };
  const exitId = STARTUP_IDS.find((id) => first(id)?.kind === "exit");
  const krachId = STARTUP_IDS.find((id) => first(id)?.kind === "krach");
  assert.ok(exitId && krachId, "v testovacím okně jsou oba výsledky");

  for (const [id, want] of [
    [exitId, "startup-exit"],
    [krachId, "startup-krach"],
  ] as const) {
    const f = first(id)!;
    const bought = buyAsset({ ...start(), cash: 1_000_000 }, id, 10_000, NOW);
    ok(bought);
    if (!bought.ok) continue;
    const after = settle(bought.state, f.round * STARTUP_ROUND_MS + 1);
    assert.equal(after.holdings[id], undefined, `${id}: držba je pryč`);
    assert.ok(after.news.some((n) => n.kind === want && n.asset === id), `${id}: zpráva ${want}`);
  }
});

test("startupy: kolo, které nastalo před nákupem, držbu neovlivní", () => {
  const id = STARTUP_IDS[0];
  const base = startupRoundOf(NOW);
  const bought = buyAsset({ ...start(), cash: 1_000_000 }, id, 10_000, NOW);
  ok(bought);
  if (!bought.ok) return;
  assert.equal(bought.state.startupRound[id], base, "nová držba začíná v aktuálním kole");
  const same = settle(bought.state, NOW + 1);
  assert.ok((same.holdings[id] ?? 0) > 0, "v tom samém kole se nic nevyhodnocuje");
});

test("příkazy: stop-loss se splní, až cena klesne na hranici; hranice na špatné straně se odmítne", () => {
  const bought = buyAsset({ ...start(), cash: 1_000_000 }, "technology", 100_000, NOW);
  ok(bought);
  if (!bought.ok) return;
  const p0 = assetPrice("technology", NOW);
  // Hledáme čas, kdy se cena v okně kontroly (hodina po poslední kontrole, ta se bere po krocích) dostane pod dnešní cenu.
  let at = 0;
  let trigger = 0;
  for (let k = 1; k <= 48 && !at; k++) {
    const t = NOW + k * H;
    const from = t - 15 * 60_000;
    const low = Math.min(assetPrice("technology", from + ORDER_CHECK_MS), assetPrice("technology", t));
    if (low < p0 * 0.999) {
      at = t;
      trigger = low * 1.0001;
    }
  }
  assert.ok(at > 0, "v následujících dvou dnech cena klesne");

  const placed = placeOrder(bought.state, { asset: "technology", side: "sell", when: "below", price: trigger, amount: 0, share: 1 }, NOW);
  ok(placed);
  if (!placed.ok) return;
  assert.deepEqual(placeOrder(bought.state, { asset: "technology", side: "sell", when: "above", price: trigger, amount: 0, share: 1 }, NOW), { ok: false, error: "bad-request" });
  assert.deepEqual(placeOrder(bought.state, { asset: "technology", side: "buy", when: "below", price: p0 * 2, amount: 100, share: 0 }, NOW), { ok: false, error: "bad-request" });

  const later = settle(placed.state, at);
  assert.equal(later.holdings.technology, undefined, "držba se prodala");
  assert.equal(later.orders.length, 0, "příkaz je vyřízený");
  assert.ok(later.news.some((n) => n.kind === "sell-filled" && n.asset === "technology"), "zpráva o prodeji");
});

test("příkazy: nejvýš osm čekajících, zrušit jde jen existující", () => {
  let s = { ...start(), cash: 1_000_000 };
  const p = assetPrice("gold", NOW);
  for (let i = 0; i < MAX_ORDERS; i++) {
    const r = placeOrder(s, { asset: "gold", side: "buy", when: "below", price: p * 0.5, amount: 1000, share: 0 }, NOW);
    ok(r);
    if (r.ok) s = r.state;
  }
  assert.equal(s.orders.length, MAX_ORDERS);
  assert.deepEqual(placeOrder(s, { asset: "gold", side: "buy", when: "below", price: p * 0.5, amount: 1000, share: 0 }, NOW), { ok: false, error: "max" });
  const firstId = s.orders[0].id;
  const cancelled = cancelOrder(s, firstId, NOW);
  ok(cancelled);
  if (cancelled.ok) assert.equal(cancelled.state.orders.length, MAX_ORDERS - 1);
  assert.deepEqual(cancelOrder(s, "nope", NOW), { ok: false, error: "nothing" });
});

test("historie: bod se zapíše nejvýš jednou za čtvrt hodiny", () => {
  let s = settle(start(), NOW + 60_000);
  assert.equal(s.history.length, 1);
  s = settle(s, NOW + 5 * 60_000);
  assert.equal(s.history.length, 1);
  s = settle(s, NOW + 60_000 + HISTORY_STEP_MS + 60_000);
  assert.equal(s.history.length, 2);
  assert.equal(s.history[1].p, portfolioValue(s, NOW + 60_000 + HISTORY_STEP_MS + 60_000));
});

test("dividendy: výnos z akcií se ukazuje zvlášť, z kovů ne", () => {
  const r = rates({ ...start(), holdings: { energy: 1000, flat: 1 } }, NOW);
  assert.ok(r.dividends > 0 && r.dividends < r.passive, "nájem z bytu není dividenda");
  assert.equal(rates({ ...start(), holdings: { gold: 1000 } }, NOW).dividends, 0);
});

test("uložená hra bez nových polí se načte a neplatné příkazy se zahodí", () => {
  const old = { ...start() } as Record<string, unknown>;
  for (const k of ["orders", "orderSeq", "news", "history", "startupRound"]) delete old[k];
  const n = normalizeState(old, NOW);
  assert.deepEqual(n.orders, []);
  assert.deepEqual(n.news, []);
  assert.deepEqual(n.history, []);
  assert.deepEqual(n.startupRound, {});
  const bad = normalizeState(
    {
      ...start(),
      orders: [
        { id: "x", asset: "nope", side: "buy", when: "below", price: 1, amount: 1, share: 0, createdAt: NOW },
        { id: "y", asset: "gold", side: "buy", when: "below", price: 5, amount: 10, share: 0, createdAt: NOW },
      ],
    },
    NOW,
  );
  assert.deepEqual(bad.orders.map((o) => o.id), ["y"]);
});

test("zaměstnanci: role se nabírají zvlášť, účetní a manažer jsou jen jeden na firmu", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e9 }, "shoes", NOW);
  ok(bought);
  let s = bought.ok ? bought.state : emptyState(NOW);
  const seller = hireStaff(s, "shoes", 1, NOW, "seller");
  ok(seller);
  s = seller.ok ? seller.state : s;
  assert.equal(rolesOf(s.setup.shoes!).seller, 1);
  assert.equal(s.setup.shoes!.staff, 1);
  const mgr = hireStaff(s, "shoes", 1, NOW, "manager");
  ok(mgr);
  s = mgr.ok ? mgr.state : s;
  assert.deepEqual(hireStaff(s, "shoes", 1, NOW, "manager"), { ok: false, error: "max" }, "manažer je jen jeden");
  assert.deepEqual(hireStaff(s, "shoes", 1, NOW, "nobody"), { ok: false, error: "bad-request" });
  const fired = hireStaff(s, "shoes", -1, NOW, "seller");
  ok(fired);
  assert.equal(rolesOf(fired.ok ? fired.state.setup.shoes! : s.setup.shoes!).seller, 0);
  assert.deepEqual(hireStaff(fired.ok ? fired.state : s, "shoes", -1, NOW, "seller"), { ok: false, error: "nothing" });
});

test("zaměstnanci: prodavač a manažer zvednou výnos; nová parta je chvíli méně výkonná", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e9 }, "shoes", NOW);
  ok(bought);
  const base = bought.ok ? bought.state : emptyState(NOW);
  const plain = companyYield(base, "shoes", NOW).gross;
  const sellerHire = hireStaff(base, "shoes", 1, NOW, "seller");
  ok(sellerHire);
  if (!sellerHire.ok) return;
  const withSeller = sellerHire.state;
  assert.ok(companyYield(withSeller, "shoes", NOW).gross > plain, "prodavač zvedne výnos");
  const mgr = hireStaff(base, "shoes", 1, NOW, "manager");
  ok(mgr);
  if (mgr.ok) assert.ok(companyYield(mgr.state, "shoes", NOW).gross > plain, "manažer zvedne výnos");
  const trained = { ...withSeller, setup: { ...withSeller.setup, shoes: { ...withSeller.setup.shoes!, rookieUntil: 0 } } };
  assert.ok(companyYield(withSeller, "shoes", NOW).gross < companyYield(trained, "shoes", NOW).gross, "zaškolení stojí výkon");
});

test("zaměstnanci: nemoc je deterministická a v okně se nemění", () => {
  let sick = 0;
  for (let i = 0; i < 1000; i++) if (isSick("shoes", NOW + i * EVENT_WINDOW_MS)) sick++;
  assert.ok(sick > 20 && sick < 200, `nemoc zhruba v 10 % oken, je ${sick}`);
  assert.equal(isSick("shoes", NOW), isSick("shoes", NOW + 1000), "uvnitř okna se nemění");
});

test("zaměstnanci: odchod nikdy nevezme víc, než je v firmě lidí, a ubere z nejpočetnější role", () => {
  const bought = buyCompany({ ...start("rich"), cash: 1e9 }, "shoes", NOW);
  ok(bought);
  let s = bought.ok ? bought.state : emptyState(NOW);
  for (const role of ["producer", "producer", "seller"] as const) {
    const h = hireStaff(s, "shoes", 1, NOW, role);
    ok(h);
    s = h.ok ? h.state : s;
  }
  let drops = 0;
  for (let w = 1; w <= 200; w++) {
    const boundary = w * EVENT_WINDOW_MS;
    const after = settle({ ...s, lastSeen: boundary - 1000 }, boundary + 1000);
    const before = s.setup.shoes!.staff;
    const left = after.setup.shoes?.staff ?? 0;
    assert.ok(left >= 0 && left <= before, "nikdy víc, než bylo");
    const r = rolesOf(after.setup.shoes ?? s.setup.shoes!);
    assert.ok(r.producer >= 0 && r.seller >= 0, "role nejsou záporné");
    if (left < before) drops++;
  }
  assert.ok(drops > 0, "za 200 oken někdo odejde");
});

test("zaměstnanci: účetní sníží daň; vyplatí se u větší firmy, u jedné firmy ne", () => {
  const buy = (n: number) => {
    let st = { ...start("rich"), cash: 1e12 };
    for (let i = 0; i < n; i++) {
      const b = buyCompany(st, "shoes", NOW);
      ok(b);
      st = b.ok ? b.state : st;
    }
    return st;
  };
  const big = buy(20);
  const accBig = hireStaff(big, "shoes", 1, NOW, "accountant");
  ok(accBig);
  if (accBig.ok) assert.ok(ratesOf({ ...accBig.state, phase: 5 }, NOW).net > ratesOf({ ...big, phase: 5 }, NOW).net, "u velké firmy se účetní vyplatí");
  const small = buy(1);
  const accSmall = hireStaff(small, "shoes", 1, NOW, "accountant");
  ok(accSmall);
  if (accSmall.ok) assert.ok(ratesOf({ ...accSmall.state, phase: 5 }, NOW).net < ratesOf({ ...small, phase: 5 }, NOW).net, "u jedné firmy je mzda větší než úspora");
});
