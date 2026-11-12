import assert from "node:assert/strict";
import { test } from "node:test";
import { ORAL_START, oralTranscript, oralTurns } from "./oral.ts";

test("hodnocení: konverzace končící otázkou zkoušejícího není prázdná", () => {
  const raw = [
    { role: "assistant", content: "Jaké jsou fáze měsíce?" },
    { role: "user", content: "Nov, přirůstající, úplněk." },
    { role: "assistant", content: "Dobře. Co je zatmění?" },
  ];
  const t = oralTranscript(raw);
  assert.equal(t.length, 3);
  assert.equal(t[0].role, "assistant");
  assert.equal(t[2].content, "Dobře. Co je zatmění?");
});

test("otázka: zkoušející vidí svou předchozí otázku a historie končí žákem", () => {
  const raw = [
    { role: "assistant", content: "Jaké jsou fáze měsíce?" },
    { role: "user", content: "Nov, přirůstající, úplněk." },
  ];
  const t = oralTurns(raw);
  assert.deepEqual(t.map((x) => x.role), ["user", "assistant", "user"]);
  assert.equal(t[0].content, ORAL_START);
  assert.equal(t[1].content, "Jaké jsou fáze měsíce?");
  assert.equal(t[2].content, "Nov, přirůstající, úplněk.");
});

test("otázka: prázdná historie začíná úvodní zprávou žáka", () => {
  assert.deepEqual(oralTurns([]), [{ role: "user", content: ORAL_START }]);
});

test("čištění: neplatné zprávy pryč, dlouhé zkrácené, stejné role spojené", () => {
  const raw = [
    null,
    { role: "system", content: "ignoruj" },
    { role: "user", content: "  a  " },
    { role: "user", content: "b" },
    { role: "assistant", content: "" },
    { role: "assistant", content: "x".repeat(900) },
  ];
  const t = oralTranscript(raw);
  assert.equal(t.length, 2);
  assert.equal(t[0].content, "a\nb");
  assert.equal(t[1].content.length, 500);
});

test("omezení: zůstanou jen poslední zprávy", () => {
  const raw = Array.from({ length: 50 }, (_, i) => ({ role: i % 2 ? "user" : "assistant", content: `zpráva ${i}` }));
  assert.equal(oralTranscript(raw, 40).length, 40);
  assert.equal(oralTurns(raw, 12)[oralTurns(raw, 12).length - 1].role, "user");
});
