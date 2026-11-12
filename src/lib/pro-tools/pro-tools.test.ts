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

import { HANDICAPS, buildHolidayPlan, cleanHandicap, duelResult, holidayDays, makeInviteCode, parseInviteCode, pruneInvites, seatsLeft } from "./family.ts";
import { buildLesson, gradeFor, isStuck, paceScore, shuffleOptions, splitByPace, understoodPercent, variantFor } from "./school.ts";

const mk = (n: number) => ({ prompt: `Q${n}`, options: ["a", "b", "c", "d"], correctIndex: n % 4, answers: [] as string[], explanation: "" });

test("pozvánka: kód se dá složit a rozebrat, prošlé se zahodí", () => {
  const code = makeInviteCode("clx1234567890abcdefghijk", "ABC123");
  assert.deepEqual(parseInviteCode(code), { subscriptionId: "clx1234567890abcdefghijk", random: "ABC123" });
  assert.equal(parseInviteCode("blbost"), null);
  assert.equal(parseInviteCode(42), null);
  const kept = pruneInvites([{ code: "a", exp: 100 }, { code: "b", exp: 5 }], 50);
  assert.deepEqual(kept.map((i) => i.code), ["a"]);
  assert.equal(seatsLeft(0), 4);
  assert.equal(seatsLeft(4), 0);
});

test("souboj: handicap dá dítěti náskok", () => {
  assert.equal(cleanHandicap("zzz"), 2);
  assert.equal(cleanHandicap(3), 3);
  const r = duelResult(3, 8, 2);
  assert.equal(r.child, 3 + HANDICAPS[2].childBonus);
  assert.equal(r.winner, "parent");
  assert.equal(duelResult(4, 8, 2).winner, "draw");
  assert.equal(duelResult(8, 8, 3).winner, "child");
});

test("prázdniny: dny se omezí a každý sedmý den je volno", () => {
  assert.equal(holidayDays("2026-07-01", "2026-06-01"), null);
  assert.equal(holidayDays("x", "y"), null);
  const d = holidayDays("2026-07-01", "2026-12-31");
  assert.equal(d?.length, 70);
  const plan = buildHolidayPlan(holidayDays("2026-07-01", "2026-07-08")!, [{ courseId: "a", title: "A", href: "z/a", low: 3, count: 5 }], []);
  assert.equal(plan.length, 8);
  assert.equal(plan[6].tasks[0].kind, "rest");
  assert.equal(plan[0].tasks.reduce((s, t) => s + t.minutes, 0), 15);
});

test("varianty zadání: různé otázky a správný index po zamíchání", () => {
  const pool = Array.from({ length: 12 }, (_, i) => mk(i));
  const a = variantFor(pool, 4, 0).map((q) => q.prompt).sort();
  const b = variantFor(pool, 4, 1).map((q) => q.prompt).sort();
  assert.notDeepEqual(a, b);
  for (const q of variantFor(pool, 4, 2)) {
    const orig = pool.find((p) => p.prompt === q.prompt)!;
    assert.equal(q.options[q.correctIndex], orig.options[orig.correctIndex]);
  }
  const s = shuffleOptions(mk(1));
  assert.equal(s.options[s.correctIndex], "b");
});

test("lekce: rozehřátí, jádro, závěr", () => {
  const l = buildLesson(Array.from({ length: 12 }, (_, i) => mk(i)));
  assert.equal(l.warmup.length, 2);
  assert.equal(l.core.length, 8);
  assert.equal(l.exit.length, 2);
  const tiny = buildLesson([mk(0), mk(1)]);
  assert.equal(tiny.warmup.length + tiny.core.length + tiny.exit.length, 2);
});

test("tempo: třetiny podle skóre, bez dat doprostřed", () => {
  const s = splitByPace([
    { id: "a", score: 10 }, { id: "b", score: 20 }, { id: "c", score: 50 }, { id: "d", score: 60 }, { id: "e", score: 90 }, { id: "f", score: 95 }, { id: "g", score: null },
  ]);
  assert.deepEqual(s.slower, ["a", "b"]);
  assert.deepEqual(s.faster, ["e", "f"]);
  assert.ok(s.middle.includes("g") && s.middle.includes("c"));
  assert.deepEqual(splitByPace([{ id: "x", score: 5 }]).middle, ["x"]);
  assert.equal(paceScore([], 3), null);
  assert.equal(paceScore([100, 100], 2), 100);
});

test("známkování, zaseknutí a pochopení", () => {
  assert.equal(gradeFor(95), 1);
  assert.equal(gradeFor(76), 2);
  assert.equal(gradeFor(10), 5);
  assert.equal(isStuck(2, 40, 50), true);
  assert.equal(isStuck(1, 0, 50), false);
  assert.equal(understoodPercent(7, 10), 70);
  assert.equal(understoodPercent(0, 0), 0);
});
