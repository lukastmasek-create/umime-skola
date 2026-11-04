import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesCourseQuery, normalizeSearchText } from "./course-search.ts";

test("hledání ignoruje velká písmena a diakritiku", () => {
  assert.equal(normalizeSearchText("  Přísloví "), "prislovi");
  assert.equal(normalizeSearchText("Frazémy"), normalizeSearchText("FRAZEMY"));
  assert.ok(matchesCourseQuery({ title: "Přísloví a jejich smysl", description: null }, "prislovi"));
});

test("prázdný dotaz vyhovuje všem kurzům, hledá i v popisu", () => {
  const course = { title: "Matematika 5", description: "Desetinná čísla" };
  assert.ok(matchesCourseQuery(course, ""));
  assert.ok(matchesCourseQuery(course, "   "));
  assert.ok(matchesCourseQuery(course, "desetinna"));
  assert.equal(matchesCourseQuery(course, "zlomky"), false);
});
