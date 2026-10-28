import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BOSS_LIVES,
  applyAnswer,
  applyHint,
  boostBonus,
  chapterRequirement,
  comboMultiplier,
  emptyChallenge,
  normalizeChallenge,
  partyOrderTarget,
  rankInParty,
  rollChallenge,
  targetDifficulty,
  weekReward,
  weekTier,
  type ChallengeState,
  type Pending,
} from "./challenge.ts";

const NOW = Date.UTC(2026, 9, 28, 12);
const question = { id: "q1", prompt: "?", options: ["a", "b", "c", "d"], correctIndex: 2, explanation: "x", course: "k", weak: false };
const withPending = (p: Partial<Pending> = {}, s: ChallengeState = emptyChallenge(NOW)): ChallengeState => ({
  ...s,
  pending: { game: "farm", issuedAt: NOW, q: question, hidden: [], boss: null, ...p },
});

test("násobič série roste a má strop ×2", () => {
  assert.equal(comboMultiplier(0), 1);
  assert.equal(comboMultiplier(5), 1.5);
  assert.equal(comboMultiplier(50), 2);
});

test("správná odpověď zvedne sérii, dá odměnu a boost; chyba sérii zruší", () => {
  const ok = applyAnswer(withPending(), 2, 10_000, NOW + 3000)!;
  assert.ok(ok.correct && ok.fast);
  assert.equal(ok.streak, 1);
  assert.ok(ok.reward.coins > 0 && ok.reward.xp >= 3);
  assert.equal(ok.state.pending, null);
  assert.equal(ok.state.week.score, 2);
  assert.ok(boostBonus(ok.state.games.farm, NOW + 1000) > 0);

  const base = withPending();
  base.games.farm.streak = 4;
  const bad = applyAnswer(base, 0, 10_000, NOW)!;
  assert.ok(!bad.correct);
  assert.equal(bad.streak, 0);
  assert.equal(bad.reward.coins, 0);
});

test("štít odpustí chybu a sérii nechá", () => {
  const s = withPending();
  s.games.farm.streak = 3;
  s.games.farm.shield = 1;
  const out = applyAnswer(s, 1, 0, NOW)!;
  assert.ok(out.shielded);
  assert.equal(out.state.games.farm.streak, 3);
  assert.equal(out.state.games.farm.shield, 0);
});

test("každá čtvrtá správná dá nápovědu, každá šestá štít", () => {
  const s = withPending();
  s.games.farm.streak = 3;
  assert.ok(applyAnswer(s, 2, 0, NOW)!.gained.hint);
  const t = withPending();
  t.games.farm.streak = 5;
  assert.ok(applyAnswer(t, 2, 0, NOW)!.gained.shield);
});

test("nápověda 50:50 schová dvě špatné a nikdy správnou", () => {
  const s = withPending();
  s.games.farm.hints = 1;
  const h = applyHint(s)!;
  assert.equal(h.pending!.hidden.length, 2);
  assert.ok(!h.pending!.hidden.includes(2));
  assert.equal(h.games.farm.hints, 0);
  assert.equal(applyHint(h), null);
});

test("boss: prohra po ztrátě životů, výhra po pěti otázkách", () => {
  let s = withPending({ boss: { chapter: 1, idx: 0, right: 0, lives: BOSS_LIVES } });
  for (let i = 0; i < 5; i++) {
    const out = applyAnswer(s, 2, 10_000, NOW + 20_000)!;
    if (i < 4) {
      assert.ok(!out.boss!.done);
      s = withPending({ boss: out.state.pending!.boss }, out.state);
    } else {
      assert.ok(out.boss!.won);
      assert.equal(out.state.games.farm.chapter, 1);
      assert.ok(out.reward.points >= 20);
    }
  }
  let l = withPending({ boss: { chapter: 1, idx: 0, right: 0, lives: BOSS_LIVES } });
  for (let i = 0; i < 3; i++) {
    const out = applyAnswer(l, 0, 10_000, NOW)!;
    if (i < 2) l = withPending({ boss: out.state.pending!.boss }, out.state);
    else {
      assert.ok(out.boss!.done && !out.boss!.won);
      assert.equal(out.state.games.farm.chapter, 0);
    }
  }
});

test("obtížnost se přizpůsobí úspěšnosti", () => {
  assert.equal(targetDifficulty([1, 1, 1, 1, 1], null), 4);
  assert.equal(targetDifficulty([0, 0, 0, 0, 1], null), 1);
  assert.equal(targetDifficulty([], null), 2);
  assert.equal(targetDifficulty([1, 1, 1, 1, 1], 4), 5);
});

test("týden: skóre, odměny a pořadí v partě", () => {
  assert.equal(weekTier(24), 0);
  assert.equal(weekTier(60), 2);
  const rows = [
    { userId: "a", name: "A", score: 80 },
    { userId: "b", name: "B", score: 30 },
    { userId: "c", name: "C", score: 0 },
  ];
  assert.equal(rankInParty(rows, "a"), 1);
  assert.equal(rankInParty(rows, "b"), 2);
  assert.equal(rankInParty(rows, "c"), 0);
  assert.equal(weekReward(80, 1).points, 12 + 10);
  assert.equal(weekReward(10, 1).points, 0);
  assert.equal(partyOrderTarget(1), 80);
});

test("nový týden uzavře starý a normalizace opraví poškozená data", () => {
  const s = emptyChallenge(NOW);
  s.week.score = 50;
  const next = rollChallenge(s, NOW + 8 * 86_400_000);
  assert.equal(next.week.score, 0);
  assert.equal(next.lastWeek?.score, 50);
  const n = normalizeChallenge({ games: { farm: { streak: -5, shield: 99 } }, pending: { q: {} }, inbox: [{ bad: true }] }, NOW);
  assert.equal(n.games.farm.streak, 0);
  assert.equal(n.games.farm.shield, 2);
  assert.equal(n.pending, null);
  assert.equal(n.inbox.length, 0);
  assert.equal(chapterRequirement("farm", 9), Number.MAX_SAFE_INTEGER);
});
