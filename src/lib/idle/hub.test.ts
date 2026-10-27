import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ACHIEVEMENTS,
  EMPTY_HUB,
  EMPTY_METRICS,
  achievementViews,
  claimAchievement,
  claimDaily,
  dailyViews,
  dayKey,
  claimWeekly,
  normalizeHub,
  pickDaily,
  pickWeekly,
  rollDaily,
  rollWeekly,
  weeklyViews,
} from "./hub.ts";

const m = (patch: Partial<typeof EMPTY_METRICS>) => ({ ...EMPTY_METRICS, ...patch });

test("úspěchy mají jedinečná id a rostoucí cíle v každém žebříčku", () => {
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  const byMetric = new Map<string, number[]>();
  for (const a of ACHIEVEMENTS) byMetric.set(a.metric, [...(byMetric.get(a.metric) ?? []), a.target]);
  for (const [, targets] of byMetric) assert.deepEqual(targets, [...targets].sort((x, y) => x - y));
});

test("úspěch se dá vybrat jen splněný a jen jednou", () => {
  assert.deepEqual(claimAchievement(EMPTY_HUB, m({ baseModules: 4 }), "baseModules:1"), { ok: false, error: "not-done" });
  const r = claimAchievement(EMPTY_HUB, m({ baseModules: 5 }), "baseModules:1");
  assert.ok(r.ok && r.reward === 10);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(claimAchievement(r.hub, m({ baseModules: 99 }), "baseModules:1"), { ok: false, error: "already-claimed" });
  assert.deepEqual(claimAchievement(EMPTY_HUB, m({}), "nope"), { ok: false, error: "unknown" });
});

test("pokrok úspěchu se ořízne na cíl", () => {
  const v = achievementViews(m({ farmLevel: 99 }), EMPTY_HUB).filter((a) => a.metric === "farmLevel");
  assert.ok(v.every((a) => a.done && a.progress === a.target));
});

test("denní úkoly: stejný výběr pro hráče a den, vždy jeden z učení", () => {
  const a = pickDaily("u1", "2026-10-27");
  assert.deepEqual(a, pickDaily("u1", "2026-10-27"));
  assert.equal(a.length, 3);
  assert.equal(a[0].metric, "learnXpToday");
  assert.equal(new Set(a.map((q) => q.id)).size, 3);
  const days = new Set(Array.from({ length: 14 }, (_, i) => pickDaily("u1", `2026-10-${10 + i}`).map((q) => q.id).join()));
  assert.ok(days.size > 1, "výběr se mění ze dne na den");
});

test("denní úkol počítá jen dnešní přírůstek", () => {
  const date = "2026-10-27";
  const hub = rollDaily(EMPTY_HUB, date, m({ farmEarned: 1000, cityEarned: 5000, baseEarned: 100, petsEarned: 50, farmOrders: 7, cityBuildings: 20 }));
  const quests = pickDaily("u1", date);
  const game = quests[1];
  const later = m({ farmEarned: 1000 + 300, cityEarned: 5000 + 600, baseEarned: 100 + 800, petsEarned: 50 + 200, farmOrders: 9, cityBuildings: 23, learnXpToday: 40 });
  const views = dailyViews("u1", later, hub);
  assert.ok(views.every((v) => v.done), "všechny splněné po přírůstku z dneška");
  const before = dailyViews("u1", m({ farmEarned: 1000, cityEarned: 5000, baseEarned: 100, petsEarned: 50, farmOrders: 7, cityBuildings: 20 }), hub);
  assert.ok(before.every((v) => v.progress === 0), "starý stav se nepočítá");
  const r = claimDaily("u1", hub, later, game.id);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(claimDaily("u1", r.hub, later, game.id), { ok: false, error: "already-claimed" });
});

test("nový den resetuje záznam, stejný den ho nechá", () => {
  const h1 = rollDaily(EMPTY_HUB, "2026-10-27", m({ farmEarned: 10 }));
  assert.equal(rollDaily(h1, "2026-10-27", m({ farmEarned: 999 })), h1);
  const h2 = rollDaily(h1, "2026-10-28", m({ farmEarned: 999 }));
  assert.equal(h2.daily?.date, "2026-10-28");
  assert.equal(h2.daily?.baseline.farmEarned, 999);
  assert.deepEqual(h2.daily?.claimed, []);
});

test("normalizeHub zahodí nesmysly", () => {
  assert.deepEqual(normalizeHub(null), EMPTY_HUB);
  const h = normalizeHub({ claimed: ["baseModules:1", "baseModules:1", "xx", 5], daily: { date: "nope", baseline: {} } });
  assert.deepEqual(h, { v: 1, claimed: ["baseModules:1"], daily: null, weekly: null });
  assert.equal(dayKey(Date.UTC(2026, 9, 27, 23, 59)), "2026-10-27");
});

test("týdenní cíle: stabilní výběr, přírůstek za týden a jednorázový nárok", () => {
  const week = "2026-W44";
  const quests = pickWeekly("u1", week);
  assert.deepEqual(quests, pickWeekly("u1", week));
  assert.equal(quests.length, 3);
  assert.equal(quests[0].metric, "learnXpWeek");
  assert.equal(new Set(quests.map((q) => q.id)).size, 3);
  assert.ok(quests.every((q) => q.id.startsWith("w:")));

  const start = m({ farmEarned: 500, cityEarned: 900, baseEarned: 300, petsEarned: 40, farmOrders: 3, cityBuildings: 4 });
  const hub = rollWeekly(EMPTY_HUB, week, start);
  assert.equal(rollWeekly(hub, week, m({ farmEarned: 99999 })), hub, "stejný týden se nepřepisuje");
  const done = m({ farmEarned: 500 + 3000, cityEarned: 900 + 6000, baseEarned: 300 + 8000, petsEarned: 40 + 2000, farmOrders: 3 + 12, cityBuildings: 4 + 15, learnXpWeek: 300 });
  const views = weeklyViews("u1", done, hub);
  assert.ok(views.every((v) => v.done), "všechny splněné");
  assert.ok(weeklyViews("u1", start, hub).every((v) => v.progress === 0));
  const r = claimWeekly("u1", hub, done, quests[1].id);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.reward, quests[1].reward);
    assert.deepEqual(claimWeekly("u1", r.hub, done, quests[1].id), { ok: false, error: "already-claimed" });
  }
  assert.deepEqual(claimWeekly("u1", hub, start, quests[0].id), { ok: false, error: "not-done" });
  assert.deepEqual(claimWeekly("u1", hub, done, "w:nope"), { ok: false, error: "unknown" });
  const next = rollWeekly(hub, "2026-W45", done);
  assert.equal(next.weekly?.week, "2026-W45");
  assert.deepEqual(next.weekly?.claimed, []);
});

test("normalizeHub zachová platný týden a zahodí špatný", () => {
  const ok = normalizeHub({ weekly: { week: "2026-W44", baseline: { farmEarned: 5, nope: 1 }, claimed: ["w:farmEarned", 3] } });
  assert.deepEqual(ok.weekly, { week: "2026-W44", baseline: { farmEarned: 5 }, claimed: ["w:farmEarned"] });
  assert.equal(normalizeHub({ weekly: { week: "44" } }).weekly, null);
});
