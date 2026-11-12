import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStudyPlan, planMinutes, DAILY_MINUTES } from "./plan.ts";
import { clampSize, examMinutes, sample, scoreExam } from "./exam.ts";

const days = ["d0", "d1", "d2", "d3", "d4", "d5", "d6"];
const weak = [
  { courseId: "a", title: "A", href: "z/a", low: 5, count: 9 },
  { courseId: "b", title: "B", href: "z/b", low: 2, count: 4 },
];

test("plán má sedm dní, den před koncem zkoušku a poslední den odpočinek", () => {
  const plan = buildStudyPlan({ days, due: 12, weak, fresh: [] });
  assert.equal(plan.length, 7);
  assert.equal(plan[5].tasks[0].kind, "exam");
  assert.equal(plan[6].tasks[0].kind, "rest");
});

test("běžný den dá dohromady 15 minut a střídá slabé kurzy", () => {
  const plan = buildStudyPlan({ days, due: 40, weak, fresh: [] });
  for (const d of plan.slice(0, 5)) assert.equal(d.tasks.reduce((s, t) => s + t.minutes, 0), DAILY_MINUTES);
  const w = plan.slice(0, 5).map((d) => d.tasks.find((t) => t.kind === "weak"));
  assert.equal((w[0] as { courseId: string }).courseId, "a");
  assert.equal((w[1] as { courseId: string }).courseId, "b");
});

test("bez slabých míst nabídne nové kurzy, bez nich aspoň opakování", () => {
  const fresh = [{ courseId: "n", title: "N", href: "z/n" }];
  const withFresh = buildStudyPlan({ days, due: 0, weak: [], fresh });
  assert.equal(withFresh[0].tasks.at(-1)?.kind, "fresh");
  const none = buildStudyPlan({ days, due: 0, weak: [], fresh: [] });
  assert.equal(none[0].tasks[0].kind, "review");
  assert.ok(planMinutes(none) > 0);
});

test("velikost zkoušky se omezí na povolené hodnoty", () => {
  assert.equal(clampSize(30), 30);
  assert.equal(clampSize(7), 20);
  assert.equal(clampSize("abc"), 20);
  assert.equal(examMinutes(50), 60);
});

test("výběr otázek je bez opakování a respektuje počet", () => {
  const out = sample([1, 2, 3, 4, 5, 6], 4, () => 0.3);
  assert.equal(out.length, 4);
  assert.equal(new Set(out).size, 4);
});

test("vyhodnocení počítá body i pásmo odhadu", () => {
  const key = { q1: 0, q2: 1, q3: 2, q4: 3 };
  const s = scoreExam({ q1: 0, q2: 1, q3: null, q4: 0 }, key);
  assert.equal(s.correct, 2);
  assert.equal(s.percent, 50);
  assert.equal(s.points, 25);
  assert.ok(s.low < 25 && s.high > 25 && s.high <= 50 && s.low >= 0);
  const perfect = scoreExam({ q1: 0, q2: 1, q3: 2, q4: 3 }, key);
  assert.equal(perfect.points, 50);
  assert.equal(perfect.low, 50);
});

import { compareWords, pronunciationScore } from "./pronunciation.ts";

test("výslovnost: shoda ignoruje velikost písmen a diakritiku", () => {
  assert.equal(pronunciationScore("Good morning", "good morning"), 100);
  assert.equal(pronunciationScore("Schön", "schon"), 100);
  assert.ok(pronunciationScore("good morning", "good mourning") >= 80);
  assert.equal(pronunciationScore("hello", ""), 0);
});

test("výslovnost: označí slova, která nezazněla", () => {
  const c = compareWords("I like green apples", "i like apples");
  assert.deepEqual(c.map((x) => x.ok), [true, true, false, true]);
});
