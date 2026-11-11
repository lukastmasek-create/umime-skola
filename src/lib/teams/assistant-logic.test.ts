import test from "node:test";
import assert from "node:assert/strict";
import { buildContext, cleanTurns, systemPrompt } from "./assistant-logic.ts";

test("cleanTurns začíná i končí zprávou uživatele a spojí stejné role", () => {
  const t = cleanTurns([
    { role: "assistant", content: "ahoj" },
    { role: "user", content: "a" },
    { role: "user", content: "b" },
    { role: "assistant", content: "c" },
    { role: "user", content: "d" },
  ]);
  assert.deepEqual(t.map((x) => x.role), ["user", "assistant", "user"]);
  assert.equal(t[0].content, "a\nb");
});
test("cleanTurns zahodí neplatné vstupy a řídí délku", () => {
  assert.deepEqual(cleanTurns("x"), []);
  assert.deepEqual(cleanTurns([{ role: "system", content: "x" }, { role: "user", content: " " }]), []);
  assert.deepEqual(cleanTurns([{ role: "user", content: "q" }, { role: "assistant", content: "a" }]), []);
  assert.equal(cleanTurns([{ role: "user", content: "x".repeat(900) }])[0].content.length, 500);
});
test("buildContext nezahrnuje cizí jména a označí stav", () => {
  const c = buildContext([{ name: "8.A", role: "STUDENT", assignments: [{ title: "Zlomky", dueAt: new Date("2026-01-02T10:00:00Z"), state: "overdue", done: false }] }], new Date("2026-01-03T00:00:00Z"));
  assert.match(c, /po termínu/);
  assert.match(c, /Zlomky/);
});
test("systemPrompt obalí data značkami", () => assert.match(systemPrompt("cs", "x"), /<data>\nx\n<\/data>/));
