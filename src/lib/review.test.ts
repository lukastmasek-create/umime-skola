import test from "node:test";
import assert from "node:assert/strict";
import { DONE_PERCENT, coursesDoneBetween, normalizeReview, recordCourse, type ReviewState } from "./review.ts";

const at = (iso: string) => Date.parse(`${iso}T12:00:00Z`);
const empty: ReviewState = { items: {}, courses: {} };

test("den dokončení se zapíše při prvním dosažení prahu a při opakování se nepřepíše", () => {
  let s = recordCourse(empty, "c1", 60, at("2026-11-01"));
  assert.equal(s.courses.c1.doneAt, undefined);
  s = recordCourse(s, "c1", DONE_PERCENT, at("2026-11-03"));
  assert.equal(s.courses.c1.doneAt, "2026-11-03");
  s = recordCourse(s, "c1", 100, at("2026-11-06"));
  assert.equal(s.courses.c1.doneAt, "2026-11-03");
  assert.equal(s.courses.c1.last, "2026-11-06");
});

test("přehled počítá jen kurzy dokončené v posledních dnech", () => {
  let s = recordCourse(empty, "stary", 90, at("2026-10-01"));
  s = recordCourse(s, "novy", 90, at("2026-11-05"));
  s = recordCourse(s, "rozdelany", 40, at("2026-11-05"));
  assert.deepEqual(coursesDoneBetween(s, "2026-11-01"), ["novy"]);
  assert.deepEqual(coursesDoneBetween(s, "0000-00-00").sort(), ["novy", "stary"]);
});

test("opakovaný test starého kurzu nezapočítá kurz do tohoto týdne", () => {
  let s = recordCourse(empty, "c", 95, at("2026-10-01"));
  s = recordCourse(s, "c", 50, at("2026-11-05"));
  assert.deepEqual(coursesDoneBetween(s, "2026-11-01"), []);
});

test("starý záznam bez doneAt se počítá podle dne posledního testu", () => {
  const legacy = normalizeReview({ courses: { c: { tests: 2, best: 90, last: "2026-11-04" } } });
  assert.equal(legacy.courses.c.doneAt, undefined);
  assert.deepEqual(coursesDoneBetween(legacy, "2026-11-01"), ["c"]);
});

test("normalizace zachová platný doneAt a zahodí nesmyslný", () => {
  const ok = normalizeReview({ courses: { a: { tests: 1, best: 90, last: "2026-11-04", doneAt: "2026-11-02" }, b: { tests: 1, best: 90, last: "2026-11-04", doneAt: "pondělí" } } });
  assert.equal(ok.courses.a.doneAt, "2026-11-02");
  assert.equal(ok.courses.b.doneAt, undefined);
});
