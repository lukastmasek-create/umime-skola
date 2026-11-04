import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { isSupplementaryCourse, normalizeSearchText } from "./supplementary-courses.ts";

const require = createRequire(import.meta.url);
const contentDir = join(import.meta.dirname, "../../prisma/content");

const slugsIn = (file: string) =>
  (require(join(contentDir, file)) as { courses: { slug: string }[] }).courses.map((c) => c.slug);

test("výčet doplňkových kurzů odpovídá souborům prisma/content/*doplnky*.cjs", () => {
  const files = readdirSync(contentDir).filter((f) => f.endsWith(".cjs"));
  const supplementary = files.filter((f) => f.includes("doplnky")).flatMap(slugsIn);
  const regular = files.filter((f) => !f.includes("doplnky")).flatMap(slugsIn);
  assert.ok(supplementary.length > 0);
  for (const slug of supplementary) assert.ok(isSupplementaryCourse(slug), `chybí ${slug}`);
  for (const slug of regular) assert.equal(isSupplementaryCourse(slug), false, slug);
});

test("hledání ignoruje velká písmena a diakritiku", () => {
  assert.equal(normalizeSearchText("  Přísloví "), "prislovi");
  assert.equal(normalizeSearchText("Frazémy"), normalizeSearchText("FRAZEMY"));
  assert.ok(normalizeSearchText("Přísloví a jejich smysl").includes(normalizeSearchText("prislovi")));
});
