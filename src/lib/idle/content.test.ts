import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getBaseText } from "../../i18n/base.ts";
import { DESTINATIONS, MODULES, SHIPS } from "./base.ts";
import { CITY_ITEMS } from "./city.ts";

const LOCALES = ["cs", "en", "de", "ru"] as const;

test("Základna: každý modul a cíl má texty ve všech jazycích", () => {
  for (const loc of LOCALES) {
    const t = getBaseText(loc);
    for (const m of MODULES) {
      assert.ok(t.modules[m.id]?.how && t.modules[m.id]?.fact, `${loc}: modul ${m.id}`);
      assert.ok(m.names[loc], `${loc}: název modulu ${m.id}`);
    }
    for (const d of DESTINATIONS) {
      const x = t.dests[d.id];
      assert.ok(x, `${loc}: cíl ${d.id}`);
      assert.equal(x.options.length, 4);
      assert.equal(new Set(x.options).size, 4, `${loc}: ${d.id} má různé možnosti`);
      assert.ok(x.question && x.blurb && x.fact && x.explanation, `${loc}: ${d.id} texty`);
      assert.ok(d.quizCorrect >= 0 && d.quizCorrect <= 3);
      assert.ok(d.names[loc]);
    }
  }
});

test("Základna: jedinečná id, cíle řazené podle obtížnosti a smysluplné lodě", () => {
  assert.equal(new Set(MODULES.map((m) => m.id)).size, MODULES.length);
  assert.equal(new Set(DESTINATIONS.map((d) => d.id)).size, DESTINATIONS.length);
  for (const d of DESTINATIONS) assert.ok(d.baseMinutes > 0 && d.credits > 0 && d.science > 0);
  // delší cesta vynáší víc kreditů ve stejné třídě lodi
  for (const tier of [1, 2, 3] as const) {
    const list = DESTINATIONS.filter((d) => d.tier === tier).sort((a, b) => a.baseMinutes - b.baseMinutes);
    assert.deepEqual(list.map((d) => d.credits), [...list.map((d) => d.credits)].sort((a, b) => a - b), `tier ${tier}`);
  }
  assert.ok(SHIPS.length >= 3);
});

test("Město: jedinečná id, jazyky a každá budova je vidět (obrázek nebo předpis vzhledu)", () => {
  assert.equal(new Set(CITY_ITEMS.map((i) => i.id)).size, CITY_ITEMS.length);
  const manifest = JSON.parse(readFileSync("public/city/sprites/manifest.json", "utf8")) as { sprites: string[] };
  const sprites = new Set(manifest.sprites);
  const render = readFileSync("src/components/idle/city-render.ts", "utf8");
  const art = new Set([...render.matchAll(/^\s{2}([a-z_]+): \{ wall:/gm)].map((m) => m[1]));
  const drawn = new Set([...render.matchAll(/case "([a-z_]+)":/g)].map((m) => m[1]));
  for (const it of CITY_ITEMS) {
    for (const loc of LOCALES) assert.ok(it.names[loc], `${loc}: název ${it.id}`);
    const visible = sprites.has(it.id) || art.has(it.id) || drawn.has(it.id) || it.cat === "road";
    assert.ok(visible, `${it.id} by se nevykreslilo`);
  }
});

test("Město: každá budova má ikonu v nabídce", () => {
  const src = readFileSync("src/components/idle/CityGame.tsx", "utf8");
  const block = src.slice(src.indexOf("const EMOJI"), src.indexOf("};", src.indexOf("const EMOJI")));
  const icons = new Set([...block.matchAll(/\b([a-z_]+): "/g)].map((m) => m[1]));
  const missing = CITY_ITEMS.filter((i) => !icons.has(i.id)).map((i) => i.id);
  assert.deepEqual(missing, []);
});

test("Základna: každý modul, loď a cíl má obrázek v public/", async () => {
  const { existsSync } = await import("node:fs");
  for (const m of MODULES) assert.ok(existsSync(`public/base/icons/${m.id}.webp`), `ikona modulu ${m.id}`);
  for (const s of SHIPS) assert.ok(existsSync(`public/base/ships/${s.id}.webp`), `loď ${s.id}`);
  for (const d of DESTINATIONS) assert.ok(existsSync(`public/base/planets/${d.id}.webp`), `planeta ${d.id}`);
});
