import test from "node:test";
import assert from "node:assert/strict";
import { learningResumeHref, parseLearningResume } from "./learning-resume";

test("resume preserves category, course, difficulty and the active language", () => {
  const resume = parseLearningResume({ category: "maturita", course: "matematika", difficulty: 4, game: null });
  assert.ok(resume);
  assert.equal(learningResumeHref("cs", resume), "/cs/kurzy/maturita/matematika/test/4");
  assert.equal(learningResumeHref("de", resume), "/de/kurzy/maturita/matematika/test/4");
});

test("game resume points to the selected game rather than the primary-school catalogue", () => {
  const resume = parseLearningResume({ category: "stredni", course: "fyzika", difficulty: 2, game: "space-invaders" });
  assert.ok(resume);
  assert.equal(learningResumeHref("en", resume), "/en/kurzy/stredni/fyzika/kurz/2/hra/space-invaders");
});

test("invalid, external, archived and unplayable resume destinations are discarded", () => {
  const valid = { category: "zakladni", course: "zlomky", difficulty: 1, game: null };
  for (const raw of [null, {}, { ...valid, category: "other" }, { ...valid, course: "https://evil.test" }, { ...valid, course: "../profil" }, { ...valid, course: "abc?next=x" }, { ...valid, difficulty: "1" }, { ...valid, difficulty: 0 }, { ...valid, difficulty: 6 }, { ...valid, difficulty: 1.5 }, { ...valid, game: "unknown" }, { ...valid, game: "runner", difficulty: 3 }]) {
    assert.equal(parseLearningResume(raw), null);
  }
});
