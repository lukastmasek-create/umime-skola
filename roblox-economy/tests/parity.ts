// Same scenario as parity.lua, computed by the original web implementation.
import * as E from "/home/user/umime-skola/src/lib/idle/economy.ts";

const rng = () => 0.5;
const out: string[] = [];
const P = (k: string, v: number) => out.push(`P ${k} ${v}`);
const must = (r: E.ActionResult): E.EconomyState => { if (!r.ok) throw new Error("action failed " + r.error); return r.state; };

const T0 = 1_700_000_000_000;
let st = E.emptyState(T0);
st = must(E.createCharacter(st, { name: "T", country: "de", city: "city", era: "2025", family: "business" }, T0));
P("start.cash", st.cash);
st = { ...st, cash: 5_000_000 };
st = must(E.takeJob(st, "warehouse", T0));
for (let i = 0; i < 3; i++) st = must(E.buyCompany(st, "shoes", T0));
for (let i = 0; i < 2; i++) st = must(E.buyCompany(st, "tech", T0));
st = must(E.hireStaff(st, "shoes", 1, T0, "producer"));
st = must(E.hireStaff(st, "shoes", 1, T0, "seller"));
st = must(E.hireStaff(st, "tech", 1, T0, "accountant"));
st = must(E.buyStock(st, "shoes", 10, T0));
st = must(E.buyStock(st, "tech", 8, T0));
st = must(E.setCompanySetting(st, "shoes", "price", 1.3, T0));
st = must(E.setCompanySetting(st, "shoes", "risk", 0.7, T0));
st = must(E.buyNeed(st, "food", 5, T0));
st = must(E.buyNeed(st, "transport", 3, T0));
for (const [id, amt] of [["flat", 20000], ["technology", 10000], ["gold", 5000], ["state", 3000], ["startup_it", 1000], ["coin", 2000]] as const)
  st = must(E.buyAsset(st, id, amt, T0));

const T1 = T0 + 600_000;
for (const id of ["flat", "technology", "gold", "state", "coin", "biotech", "memecoin", "index"] as const)
  P("price." + id, E.assetPrice(id, T1, st.startedAt));
const r = E.rates(st, T1);
for (const k of ["salary", "companies", "passive", "living", "companyCosts", "multiplier", "net", "dividends"] as const) P("rates." + k, r[k]);
P("netWorth", E.netWorth(st, T1));
P("living", E.livingCost(st));
P("needDaily.food", E.needDaily(st, "food"));
P("companyPrice.shoes", E.companyPrice(st, "shoes"));
P("sellPrice.shoes", E.sellPrice(st, "shoes"));
P("batch.shoes", E.batchPrice(st, "shoes", T1));
P("phaseReq5", E.phaseRequirement(5));
P("phaseCost5", E.phaseCost(5));
P("arbSpread", E.arbitrageSpread(T1));
for (let w = 0; w < 12; w++) { const ev = E.currentEvent(w * 7_200_000 + 1000); P("event.idx." + w, ev ? E.EVENTS.findIndex((e) => e.id === ev.def.id) + 1 : 0); const ae = E.currentAssetEvent(w * 10_800_000 + 1000); P("aevent.idx." + w, ae ? E.ASSET_EVENTS.findIndex((e) => e.id === ae.def.id) + 1 : 0); }

// shift
let s2 = must(E.startShift(st, T1, rng));
P("shift.seed", s2.shift!.seed);
const picks = [2, 1, 0];
for (const i of picks) s2 = must(E.chooseShift(s2, i, T1));
P("shift.cash", s2.cash - st.cash);
P("shift.points", s2.job!.points);
P("shift.energy", s2.energy);

// settle 10 min
const T2 = T1 + 600_000;
const s3 = E.settle(s2, T2);
P("settle.cash", s3.cash);
P("settle.energy", s3.energy);
P("settle.peak", s3.peak);

// hustle
let h = must(E.startHustle(st, "carflip", T1, rng, {}));
const slot = h.hustle.carflip!;
P("hustle.seed", slot.seed);
P("hustle.market", E.hustleMarket(slot, "carflip"));
let tt = T1;
for (let round = 0; round < 3; round++) {
  tt = E.hustleRoundAt(h.hustle.carflip!, "carflip", h.hustle.carflip!.round) + 1;
  const ch = E.hustleChoices(h.hustle.carflip!, "carflip");
  ch.forEach((c, i) => { P(`hustle.r${round}.c${i}.lo`, c.lo); P(`hustle.r${round}.c${i}.hi`, c.hi); });
  h = must(E.decideHustle(h, "carflip", tt, 1));
}
P("hustle.cash", h.cash);
P("hustle.exp", h.knowledge.carflip ?? 0);

// startup outcomes
for (let rd = 100; rd < 108; rd++) { const o = E.startupOutcome("startup_it", rd); P("startup." + rd, o.kind === "exit" ? o.mult : o.kind === "krach" ? -1 : 0); }
console.log(out.join("\n"));
