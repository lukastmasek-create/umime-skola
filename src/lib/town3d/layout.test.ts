import assert from "node:assert/strict";
import { test } from "node:test";
import { FOUNTAIN, PLACES, SOLID_PLACES, buildGraph, buildRoads, doorPoint, findPath, inFootprint, layoutProblems, nearestNode, type Pt } from "./layout.ts";

// Městečko: přístup k budovám vede jen po ulicích a nic nechodí skrz domy (regrese: domky měly dveře k zadní zdi).

test("příjezd od dveří nikdy nevede budovou", () => {
  const roads = buildRoads();
  for (const r of roads.filter((x) => x.drive)) {
    const owner = PLACES.find((p) => p.door && Math.hypot(doorPoint(p)[0] - r.a[0], doorPoint(p)[1] - r.a[1]) < 0.01);
    assert.ok(owner, "příjezd bez budovy");
    for (let k = 0.02; k <= 1; k += 0.02) {
      const x = r.a[0] + (r.b[0] - r.a[0]) * k;
      const z = r.a[1] + (r.b[1] - r.a[1]) * k;
      const other = SOLID_PLACES.find((p) => p !== owner && inFootprint(p, x, z));
      assert.equal(other, undefined, `příjezd ${owner.id} vede přes ${other?.id}`);
      assert.ok(!inFootprint(owner, x, z, 0.05), `příjezd ${owner.id} vede do vlastního domu`);
    }
  }
});

test("hrany ulic neprocházejí budovami", () => {
  const g = buildGraph(buildRoads());
  for (const [from, list] of g.edges)
    for (const e of list) {
      const [ax, az] = g.nodes[from];
      const [bx, bz] = g.nodes[e.to];
      for (let k = 0; k <= 1; k += 0.05) {
        const hit = SOLID_PLACES.find((p) => inFootprint(p, ax + (bx - ax) * k, az + (bz - az) * k, 0.05));
        assert.equal(hit, undefined, `ulice přes ${hit?.id}`);
      }
    }
});

test("rozložení nemá žádný kolizní problém", () => {
  assert.deepEqual(layoutProblems(), []);
});

test("cesta chodce z náměstí na druhou stranu obchází kašnu", () => {
  const g = buildGraph(buildRoads());
  const path: Pt[] = findPath(g, nearestNode(g, 0.9, 26), nearestNode(g, 0.9, -16));
  for (let i = 0; i + 1 < path.length; i++)
    for (let k = 0; k <= 1; k += 0.05) {
      const x = path[i][0] + (path[i + 1][0] - path[i][0]) * k;
      const z = path[i][1] + (path[i + 1][1] - path[i][1]) * k;
      assert.ok(Math.hypot(x - FOUNTAIN.x, z - FOUNTAIN.z) >= FOUNTAIN.r, "chodec jde přes kašnu");
    }
});
