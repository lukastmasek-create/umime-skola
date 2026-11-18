#!/usr/bin/env node
// Kontrola odkazů na ikony: zbylé odkazy na převedené .svg, chybějící soubory, názvy Icon mimo manifest, nepoužité ikony.
// Spuštění:  node tools/icons/check-refs.mjs   (vrací kód 1 při rozbitém odkazu)
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const IK = join(ROOT, "public", "ikony");
const manifestSrc = readFileSync(join(ROOT, "src/lib/icon-manifest.ts"), "utf8");
const MANIFEST = Object.fromEntries([...manifestSrc.matchAll(/^  "([^"]+)": (\{.*\}),$/gm)].map((m) => [m[1], JSON.parse(m[2])]));
const vector = new Set(Object.keys(MANIFEST).filter((n) => MANIFEST[n].v));

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (f === "node_modules" || f === ".next" || f === "archive") continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|mjs|js|json)$/.test(f) && !p.endsWith("icon-manifest.ts") && !p.endsWith("lib/icons.ts")) out.push(p);
  }
  return out;
}
const files = [...walk(join(ROOT, "src")), join(ROOT, "public", "sw.js")].filter(existsSync);
const text = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));
const rel = (f) => f.replace(ROOT + "/", "");

const broken = [];
const residual = [];
const allowedVector = [];

for (const [f, s] of text) {
  // Doslovné cesty /ikony/<název>.<přípona>
  for (const m of s.matchAll(/\/ikony\/([A-Za-z0-9_.\-${}.]+?)\.(svg|webp)\b/g)) {
    const name = m[1];
    if (name.includes("${")) {
      if (m[2] === "svg") residual.push(`${rel(f)}: dynamická cesta ${m[0]}`);
      continue;
    }
    if (m[2] === "svg") {
      if (vector.has(name)) allowedVector.push(`${rel(f)}: ${m[0]}`);
      else residual.push(`${rel(f)}: ${m[0]}`);
    } else if (!existsSync(join(IK, name + ".webp"))) broken.push(`${rel(f)}: chybí ${m[0]}`);
  }
}

// Soubory vs. manifest.
const onDisk = readdirSync(IK);
for (const n of Object.keys(MANIFEST)) {
  const e = MANIFEST[n];
  if (e.v) { if (!onDisk.includes(n + ".svg")) broken.push(`manifest: chybí ${n}.svg`); continue; }
  if (!onDisk.includes(n + ".webp")) broken.push(`manifest: chybí ${n}.webp`);
  (e.t ?? []).forEach((_, i) => { if (!onDisk.includes(`${n}.tw${i + 1}.webp`)) broken.push(`manifest: chybí ${n}.tw${i + 1}.webp`); });
}
const known = new Set(onDisk.filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)));
for (const n of known) if (!MANIFEST[n]) broken.push(`manifest: chybí záznam pro ${n}.svg (spusť build-webp.mjs)`);
for (const f of onDisk.filter((f) => f.endsWith(".webp"))) {
  const base = f.replace(/\.tw\d+\.webp$/, "").replace(/\.webp$/, "");
  if (!MANIFEST[base]) broken.push(`public/ikony/${f}: sirotek bez manifestu`);
}

// Doslovné názvy v <Icon name="..."> a v polích/objektech, které je plní.
const used = new Set();
const unknownLiterals = [];
for (const [f, s] of text) {
  for (const m of s.matchAll(/<Icon\b[^>]*\bname="([^"]+)"/g)) {
    used.add(m[1]);
    if (!MANIFEST[m[1]]) unknownLiterals.push(`${rel(f)}: <Icon name="${m[1]}">`);
  }
}
// Každý název ikony, který se v kódu vyskytuje jako celé slovo/řetězec (včetně dynamických zdrojů: slugy, tabulky).
const dead = [];
const corpus = [...text].filter(([f]) => !f.endsWith(".css")).map(([, s]) => s).join("\n");
for (const n of Object.keys(MANIFEST)) {
  const re = new RegExp(`(^|[^A-Za-z0-9_-])${n.replace(/[-_]/g, "[-_]")}([^A-Za-z0-9_-]|$)`);
  if (!re.test(corpus) && !used.has(n)) dead.push(n);
}

console.log(`Ikony v manifestu: ${Object.keys(MANIFEST).length} (z toho ponecháno jako SVG: ${vector.size})`);
console.log(`Rozbité odkazy: ${broken.length + unknownLiterals.length}`);
broken.concat(unknownLiterals).forEach((l) => console.log("  ✗ " + l));
console.log(`Zbylé odkazy na převedené .svg: ${residual.length}`);
residual.forEach((l) => console.log("  ✗ " + l));
console.log(`Povolené odkazy na SVG (výjimky): ${allowedVector.length}`);
allowedVector.forEach((l) => console.log("  • " + l));
console.log(`Ikony, jejichž název se v src/ nikde nevyskytuje (nejspíš nepoužité nebo skládané dynamicky): ${dead.length}`);
if (dead.length) console.log("  " + dead.join(", "));
if (broken.length + unknownLiterals.length + residual.length) process.exitCode = 1;
