import assert from "node:assert/strict";
import { test } from "node:test";
import { isSubscriptionActive, subscriptionCoversUser, userHasPro, type SubscriptionRecord } from "./pro.ts";

const now = new Date("2026-06-01T12:00:00Z");
const day = 24 * 60 * 60 * 1000;

const sub = (over: Partial<SubscriptionRecord> = {}): SubscriptionRecord => ({
  id: "s1",
  tier: "INDIVIDUAL",
  ownerId: "u-owner",
  schoolId: null,
  startsAt: new Date(now.getTime() - day),
  endsAt: null,
  ...over,
});

test("předplatné: začátek v budoucnu nebo konec v minulosti není platné", () => {
  assert.equal(isSubscriptionActive(sub(), now), true);
  assert.equal(isSubscriptionActive(sub({ startsAt: new Date(now.getTime() + day) }), now), false);
  assert.equal(isSubscriptionActive(sub({ endsAt: new Date(now.getTime() - 1) }), now), false);
  assert.equal(isSubscriptionActive(sub({ endsAt: new Date(now.getTime() + day) }), now), true);
});

test("plátce jednotlivce i rodiny má PRO sám", () => {
  assert.equal(subscriptionCoversUser(sub({ tier: "FAMILY" }), { id: "u-owner", subscriptionId: null, schoolId: null }), true);
  assert.equal(subscriptionCoversUser(sub({ tier: "FAMILY" }), { id: "jiny", subscriptionId: null, schoolId: null }), false);
});

test("člen rodinného tarifu má PRO přes subscriptionId", () => {
  const family = sub({ id: "fam", tier: "FAMILY" });
  assert.equal(userHasPro({ id: "dite", subscriptionId: "fam", schoolId: null }, [family], now), true);
  assert.equal(userHasPro({ id: "dite", subscriptionId: "jine", schoolId: null }, [family], now), false);
});

test("školní tarif platí pro žáky dané školy, ne pro ostatní", () => {
  const school = sub({ id: "sk", tier: "SCHOOL", ownerId: null, schoolId: "skola-A" });
  assert.equal(userHasPro({ id: "zak", subscriptionId: null, schoolId: "skola-A" }, [school], now), true);
  assert.equal(userHasPro({ id: "zak", subscriptionId: null, schoolId: "skola-B" }, [school], now), false);
  assert.equal(userHasPro({ id: "zak", subscriptionId: null, schoolId: null }, [school], now), false);
});

test("neplatné předplatné nedá PRO nikomu", () => {
  const expired = sub({ endsAt: new Date(now.getTime() - 1) });
  assert.equal(userHasPro({ id: "u-owner", subscriptionId: null, schoolId: null }, [expired], now), false);
  assert.equal(userHasPro({ id: "u-owner", subscriptionId: null, schoolId: null }, [], now), false);
});
