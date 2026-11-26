import { test } from "node:test";
import assert from "node:assert/strict";
import { chatTitle, isSpaceGrade, isSpaceSubject, isSpaceTool, spacePrompt, SPACE_TOOLS } from "./ai-space.ts";
import { cleanReply } from "../ai-clean.ts";

test("spacePrompt obsahuje pravidla režimu, předmět, ročník a bezpečnost", () => {
  const p = spacePrompt("cs", "quiz", "math", "4");
  assert.match(p, /jen jednu otázku/);
  assert.match(p, /matematika/);
  assert.match(p, /4\. třídy/);
  assert.match(p, /116 111/);
  for (const tool of SPACE_TOOLS) assert.ok(spacePrompt("en", tool, "auto", "auto").includes("in English"));
});

test("konverzace v angličtině vysvětluje opravy v jazyce rozhraní", () => {
  assert.match(spacePrompt("de", "language", "english", "7"), /auf Deutsch/);
});

test("validace režimu, předmětu a ročníku", () => {
  assert.ok(isSpaceTool("tutor"));
  assert.ok(!isSpaceTool("hack"));
  assert.ok(isSpaceSubject("physics"));
  assert.ok(!isSpaceSubject(3));
  assert.ok(isSpaceGrade("ss"));
  assert.ok(!isSpaceGrade("10"));
});

test("chatTitle zkrátí dlouhou zprávu po slovech", () => {
  assert.equal(chatTitle("  Co je   fotosyntéza? "), "Co je fotosyntéza?");
  const long = chatTitle("Nevím jak se počítá obsah lichoběžníku když znám jen úhlopříčky a výšku");
  assert.ok(long.endsWith("…") && long.length <= 43);
});

test("cleanReply odstraní přemýšlení a prefix role", () => {
  assert.equal(cleanReply("<think>hmm</think>\nAhoj"), "Ahoj");
  assert.equal(cleanReply("Assistant: Ahoj"), "Ahoj");
});
