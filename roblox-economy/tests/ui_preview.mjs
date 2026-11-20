// Dumps the real widget tree at several tiers/viewports and writes tests/out/tree-*.json for render_preview.mjs
import { LuauState } from "luau-web";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => readFileSync(path.join(here, "..", "src", p), "utf8");
const pre = (s) => s.replace(/require\(script\.Parent\.(\w+)\)/g, "__mods.$1");
const out = [];
const S = await LuauState.createAsync({ print: (...a) => out.push(a.join("\t")) });
const def = (name, code) => `__mods.${name} = (function()\n${code}\nend)()\n`;
let code = readFileSync(path.join(here, "mock_roblox.lua"), "utf8") + "\nlocal __mods = {}\n";
code += def("Config", pre(src("shared/Config.lua"))) + def("Logic", pre(src("shared/Logic.lua"))) + def("Strings", src("shared/Strings.lua"));
code += def("Theme", src("client/EconomyUI/Theme.lua")) + def("Widgets", pre(src("client/EconomyUI/Widgets.lua"))) + def("Screens", src("client/EconomyUI/Screens.lua"));
code += `__mods.CoreFactory = (function()\n${src("server/EconomyService/ServerCore.lua")}\nend)()\n`;
code += `local __initFn = function(script, require)\n${src("client/EconomyUI/init.client.lua")}\nend\n`;
code += readFileSync(path.join(here, "ui_preview.lua"), "utf8");
await S.loadstring(code, "ui_preview", true)();
mkdirSync(path.join(here, "out"), { recursive: true });
const shots = [];
for (const l of out) {
  if (!l.startsWith("SHOT\t")) { console.log(l); continue; }
  const [, name, w, h, json] = l.split("\t");
  shots.push({ name, w: +w, h: +h, tree: JSON.parse(json) });
}
writeFileSync(path.join(here, "out", "shots.json"), JSON.stringify(shots));
console.log("dumped", shots.map((s) => s.name).join(", "));
