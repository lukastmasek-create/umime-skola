// Runs the Luau logic in a real Luau VM (luau-web / wasm) and compares it with the original economy.ts.
// Usage: cd roblox-economy/tests && npm i && node run.mjs
import { LuauState } from "luau-web";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => readFileSync(path.join(here, "..", "src", p), "utf8");
const pre = (s) => s.replace(/require\(script\.Parent\.Config\)/g, '__mod("Config")');

const out = [];
const mods = {};
const S = await LuauState.createAsync({ print: (...a) => out.push(a.join("\t")), __mod: (n) => mods[n] });
const load = (code, name) => S.loadstring(code, name, true);

mods.Config = await load(pre(src("shared/Config.lua")), "Config")();
mods.Logic = await load(pre(src("shared/Logic.lua")), "Logic")();
mods.Core = await load(src("server/EconomyService/ServerCore.lua"), "ServerCore")();

const run = async (file) => {
  out.length = 0;
  await load(readFileSync(path.join(here, file), "utf8"), file)();
  return [...out];
};

let failed = 0;
// 1) unit / integration suite (asserts inside Luau)
for (const line of await run("suite.lua")) {
  console.log(line);
  if (line.startsWith("FAIL")) failed++;
}
// 2) parity with the web implementation
const luauLines = await run("parity.lua");
const parse = (lines) => Object.fromEntries(lines.filter((l) => l.startsWith("P ")).map((l) => { const [, k, v] = l.split(" "); return [k, Number(v)]; }));
const got = parse(luauLines);
const tsOut = execFileSync("npx", ["tsx", path.join(here, "parity.ts")], { cwd: here, encoding: "utf8" });
const want = parse(tsOut.split("\n"));
let bad = 0, n = 0;
for (const [k, v] of Object.entries(want)) {
  n++;
  const g = got[k];
  const tol = Math.max(1e-6, Math.abs(v) * 1e-9);
  if (g === undefined || !(Math.abs(g - v) <= tol)) { bad++; console.log(`FAIL parity ${k}: luau=${g} web=${v}`); }
}
console.log(`parity: ${n - bad}/${n} match`);
if (bad) failed++;
console.log(failed ? "TESTS FAILED" : "ALL TESTS PASSED");
process.exit(failed ? 1 : 0);
