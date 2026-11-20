// Runs the real client modules (Theme/Widgets/Screens/init) against a mocked Roblox API,
// wired to the real Logic + ServerCore. Taps through the first slice and sweeps all tabs x tiers x viewport classes.
import { LuauState } from "luau-web";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => readFileSync(path.join(here, "..", "src", p), "utf8");
const pre = (s) => s.replace(/require\(script\.Parent\.(\w+)\)/g, "__mods.$1");
const out = [];
const S = await LuauState.createAsync({ print: (...a) => out.push(a.join("\t")) });

const def = (name, code) => `__mods.${name} = (function()\n${code}\nend)()\n`;
let code = readFileSync(path.join(here, "mock_roblox.lua"), "utf8") + "\nlocal __mods = {}\n";
code += def("Config", pre(src("shared/Config.lua")));
code += def("Logic", pre(src("shared/Logic.lua")));
code += def("Strings", src("shared/Strings.lua"));
code += def("Theme", src("client/EconomyUI/Theme.lua"));
code += def("Widgets", pre(src("client/EconomyUI/Widgets.lua")));
code += def("Screens", src("client/EconomyUI/Screens.lua"));
code += `__mods.CoreFactory = (function()\n${src("server/EconomyService/ServerCore.lua")}\nend)()\n`;
code += `local __initFn = function(script, require)\n${src("client/EconomyUI/init.client.lua")}\nend\n`;
code += readFileSync(path.join(here, "ui_smoke.lua"), "utf8");

await S.loadstring(code, "ui_smoke", true)();
let failed = 0;
for (const l of out) { console.log(l); if (l.startsWith("FAIL")) failed++; }
console.log(failed ? "UI SMOKE FAILED" : "UI SMOKE PASSED");
process.exit(failed ? 1 : 0);
