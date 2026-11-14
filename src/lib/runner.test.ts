import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRunnerPlan, bossOutcome, gateOutcome, runnerAllowed, runnerPlayable, RUNNER_BOSS_HITS } from "./runner.ts";

const qs = Array.from({ length: 8 }, (_, i) => ({
  id: `q${i}`,
  prompt: `Kolik je ${i}+1?`,
  options: [String(i + 1), String(i + 5), String(i + 9), String(i + 13)] as [string, string, string, string],
  correctIndex: 0,
  explanation: "",
}));

test("runner allowed only for simple courses", () => {
  assert.equal(runnerAllowed("ZAKLADNI", 1), true);
  assert.equal(runnerAllowed("ZAKLADNI", 2), true);
  assert.equal(runnerAllowed("ZAKLADNI", 3), false);
  assert.equal(runnerAllowed("STREDNI", 1), false);
  assert.equal(runnerAllowed("MATURITA", 1), false);
});

test("playable needs enough questions", () => {
  assert.equal(runnerPlayable(qs), true);
  assert.equal(runnerPlayable(qs.slice(0, 3)), false);
});

test("each row has exactly one correct gate with the correct answer", () => {
  const plan = buildRunnerPlan(qs, 6, () => 0.42);
  assert.ok(plan);
  assert.equal(plan.rows.length, 6);
  for (const row of plan.rows) {
    assert.equal(row.gates.filter((g) => g.correct).length, 1);
    assert.equal(row.gates.find((g) => g.correct)?.label, row.correctLabel);
  }
  assert.ok(plan.boss.length >= RUNNER_BOSS_HITS);
  for (const b of plan.boss) assert.ok(b.correctIndex >= 0 && b.correctIndex < 4);
});

test("gate and boss outcomes", () => {
  assert.equal(gateOutcome(5, true), 9);
  assert.equal(gateOutcome(2, false), 0);
  assert.equal(bossOutcome(5, true), 5);
  assert.equal(bossOutcome(2, false), 0);
});

test("no questions gives no plan", () => {
  assert.equal(buildRunnerPlan([], 6), null);
});
