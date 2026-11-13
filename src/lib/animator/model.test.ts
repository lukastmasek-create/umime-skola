import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyEasing,
  clampPose,
  defaultProject,
  keyAt,
  makeObject,
  poseAt,
  removeKeyAt,
  sanitizeProject,
  upsertKey,
  type Key,
} from "./model.ts";

const k = (t: number, x: number, ease: Key["ease"] = "linear"): Key => ({ t, x, y: 0, rot: 0, scale: 1, opacity: 1, ease });

test("před prvním a po posledním klíči se objekt drží na kraji", () => {
  const keys = [k(1, 10), k(3, 30)];
  assert.equal(poseAt(keys, 0).x, 10);
  assert.equal(poseAt(keys, 5).x, 30);
});

test("mezi klíči se hodnoty lineárně dopočítají", () => {
  const keys = [k(0, 0), k(2, 100)];
  assert.equal(poseAt(keys, 1).x, 50);
  assert.equal(poseAt(keys, 0.5).x, 25);
});

test("easing mění průběh, ale krajní body zůstávají stejné", () => {
  for (const e of ["linear", "ease", "bounce"] as const) {
    assert.equal(applyEasing(0, e), 0, `${e} začíná na 0`);
    assert.ok(Math.abs(applyEasing(1, e) - 1) < 1e-9, `${e} končí na 1`);
  }
  // Ease je v půlce přesně 0.5 a bounce doskočí do cíle bez přelétnutí.
  assert.equal(applyEasing(0.5, "ease"), 0.5);
  for (let i = 0; i <= 100; i++) assert.ok(applyEasing(i / 100, "bounce") <= 1 + 1e-9);
});

test("klíč se stejným časem se přepíše místo přidání", () => {
  let keys = upsertKey([k(0, 0), k(2, 5)], k(2, 99));
  assert.equal(keys.length, 2);
  assert.equal(keyAt(keys, 2)?.x, 99);
  keys = upsertKey(keys, k(1, 7));
  assert.deepEqual(keys.map((x) => x.t), [0, 1, 2]);
});

test("mazání klíče odebere jen ten na daném čase", () => {
  const keys = removeKeyAt([k(0, 0), k(1, 1), k(2, 2)], 1);
  assert.deepEqual(keys.map((x) => x.t), [0, 2]);
});

test("poloha se ořízne do limitů a neplatná čísla se nahradí klidovou hodnotou", () => {
  const p = clampPose({ x: 9999, y: -9999, rot: 0, scale: 50, opacity: Number.NaN });
  assert.equal(p.x, 220);
  assert.equal(p.y, -130);
  assert.equal(p.scale, 3);
  assert.equal(p.opacity, 1);
});

test("nový objekt má klidový klíč v čase nula a výchozí projekt jde načíst", () => {
  const o = makeObject("a", "Test", "star", "#ffc933");
  assert.equal(o.keys.length, 1);
  assert.equal(o.keys[0].t, 0);
  const p = defaultProject();
  assert.ok(p.objects.length >= 1);
  assert.equal(poseAt(p.objects[0].keys, 2).x, 120);
});

test("čištění zahodí neznámý tvar a seřadí klíče podle času", () => {
  const raw = {
    duration: 3,
    objects: [
      {
        id: "x1",
        name: "Hvězda",
        shape: "dinosaurus",
        color: "#000000",
        keys: [
          { t: 2, x: 5 },
          { t: 0.5, x: "špatně" },
          { t: 99, x: 1 },
        ],
      },
    ],
  };
  const p = sanitizeProject(raw);
  assert.ok(p);
  assert.equal(p.duration, 3);
  assert.equal(p.objects[0].shape, "ball");
  assert.equal(p.objects[0].color, "#ff8a6b");
  const ts = p.objects[0].keys.map((x) => x.t);
  assert.deepEqual(ts, [0.5, 2, 3], "čas se ořízne na délku a seřadí");
  assert.equal(p.objects[0].keys[0].x, 0, "neplatné x se nahradí klidovou hodnotou");
});

test("čištění odmítne data, která nejsou projekt", () => {
  assert.equal(sanitizeProject(null), null);
  assert.equal(sanitizeProject({ duration: 4 }), null);
});
