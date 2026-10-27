import assert from "node:assert/strict";
import { test } from "node:test";
import { EVENT_CAP as BASE_CAP, NO_BONUS, bonusMultiplier } from "./base.ts";
import { EVENT_CAP as CITY_CAP } from "./city.ts";
import { EVENT_CAP as PETS_CAP, emptyState as petsEmpty, incomePerHour } from "./pets.ts";
import { EVENTS, GAME_IDS, MAX_EVENT_BONUS, WEEKLY_FOCUS_BONUS, activeEvents, allEventBonuses, eventBonusFor, inRange, isoWeekKey, weekNumber, weekStart, weeklyFocus } from "./events.ts";

const utc = (y: number, m: number, d: number, h = 12) => Date.UTC(y, m - 1, d, h);

test("rozsah dat včetně hranic a přes konec roku", () => {
  assert.ok(inRange(10, 25, [[10, 25], [11, 2]]));
  assert.ok(inRange(11, 2, [[10, 25], [11, 2]]));
  assert.ok(!inRange(11, 3, [[10, 25], [11, 2]]));
  assert.ok(!inRange(10, 24, [[10, 25], [11, 2]]));
  assert.ok(inRange(12, 30, [[12, 20], [1, 5]]));
  assert.ok(inRange(1, 3, [[12, 20], [1, 5]]));
  assert.ok(!inRange(6, 1, [[12, 20], [1, 5]]));
});

test("aktivní události podle data", () => {
  assert.deepEqual(activeEvents(utc(2026, 10, 27)).map((e) => e.id), ["pumpkin"]);
  assert.deepEqual(activeEvents(utc(2026, 12, 13)).map((e) => e.id).sort(), ["christmas", "meteors"]);
  assert.deepEqual(activeEvents(utc(2026, 6, 15)), []);
  assert.deepEqual(activeEvents(utc(2026, 9, 14)).map((e) => e.id), ["back-to-school"]);
  assert.deepEqual(activeEvents(utc(2026, 9, 15)).map((e) => e.id), ["harvest"]);
});

test("události mají unikátní id a platná data", () => {
  assert.equal(new Set(EVENTS.map((e) => e.id)).size, EVENTS.length);
  for (const e of EVENTS) {
    assert.ok(Object.keys(e.bonus).length > 0);
    for (const [g, b] of Object.entries(e.bonus)) {
      assert.ok(GAME_IDS.includes(g as never));
      assert.ok(b! > 0 && b! <= MAX_EVENT_BONUS, `${e.id}/${g}`);
    }
    for (const [[m1, d1], [m2, d2]] of e.ranges) for (const [m, d] of [[m1, d1], [m2, d2]]) assert.ok(m >= 1 && m <= 12 && d >= 1 && d <= 31);
  }
});

test("hra týdne se střídá po čtyřech a je v celém týdnu stejná", () => {
  const mon = weekStart(utc(2026, 10, 27));
  assert.equal(new Date(mon).getUTCDay(), 1);
  for (let i = 0; i < 7; i++) assert.equal(weeklyFocus(mon + i * 86_400_000 + 3_600_000), weeklyFocus(mon));
  const seq = [0, 1, 2, 3, 4].map((w) => weeklyFocus(mon + w * 7 * 86_400_000));
  assert.equal(new Set(seq.slice(0, 4)).size, 4);
  assert.equal(seq[4], seq[0]);
  assert.equal(weekNumber(mon + 7 * 86_400_000) - weekNumber(mon), 1);
});

test("ISO týden", () => {
  assert.equal(isoWeekKey(utc(2026, 10, 27)), "2026-W44");
  assert.equal(isoWeekKey(utc(2026, 1, 1)), "2026-W01");
  assert.equal(isoWeekKey(utc(2025, 12, 29)), "2026-W01");
  assert.equal(isoWeekKey(utc(2021, 1, 3)), "2020-W53");
});

test("bonus má strop a hra týdne se přičítá", () => {
  const now = utc(2026, 12, 13); // Vánoce + meteory
  const all = allEventBonuses(now);
  for (const g of GAME_IDS) assert.ok(all[g].total <= MAX_EVENT_BONUS + 1e-12);
  const city = eventBonusFor("city", now);
  assert.ok(Math.abs(city.total - Math.min(MAX_EVENT_BONUS, 0.25 + (city.focus ? WEEKLY_FOCUS_BONUS : 0))) < 1e-12);
  // mimo události dostane bonus jen hra týdne
  const quiet = utc(2026, 6, 10);
  const focused = GAME_IDS.filter((g) => eventBonusFor(g, quiet).total > 0);
  assert.deepEqual(focused, [weeklyFocus(quiet)]);
  assert.equal(eventBonusFor(focused[0], quiet).total, WEEKLY_FOCUS_BONUS);
});

test("bonus události se přičítá ve všech hrách a má všude stejný strop", () => {
  assert.equal(BASE_CAP, MAX_EVENT_BONUS);
  assert.equal(CITY_CAP, MAX_EVENT_BONUS);
  assert.equal(PETS_CAP, MAX_EVENT_BONUS);
  assert.equal(bonusMultiplier({ ...NO_BONUS, event: 0.2 }), 1.2);
  assert.equal(bonusMultiplier({ ...NO_BONUS, event: 5 }), 1 + MAX_EVENT_BONUS, "nad strop se nejde");
  assert.equal(bonusMultiplier({ learning: 0.1, pet: 0, city: 0 }), 1.1, "starý tvar bonusu bez události funguje");
  const st = petsEmpty(0);
  const stats = { name: "x", growth: 0, hunger: 100, happy: 100, accessory: null };
  const plain = incomePerHour(st, stats, 0);
  assert.ok(Math.abs(incomePerHour(st, stats, 0, 0.2) / plain - 1.2) < 1e-9);
  assert.ok(Math.abs(incomePerHour(st, stats, 0, 9) / plain - (1 + MAX_EVENT_BONUS)) < 1e-9);
  assert.equal(incomePerHour(st, stats, 0, -1), plain, "záporný bonus se ignoruje");
});
