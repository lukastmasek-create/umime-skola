// Runs the real service script (init.server.lua) with mocked Players / DataStore / Remotes.
import { LuauState } from "luau-web";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => readFileSync(path.join(here, "..", "src", p), "utf8");
const pre = (s) => s.replace(/require\(script\.Parent\.(\w+)\)/g, "__mods.$1");
const out = [];
const S = await LuauState.createAsync({ print: (...a) => out.push(a.join("\t")), warn: (...a) => out.push("WARN " + a.join(" ")) });
const def = (name, code) => `__mods.${name} = (function()\n${code}\nend)()\n`;
let code = readFileSync(path.join(here, "mock_roblox.lua"), "utf8") + "\nlocal __mods = {}\n";
code += def("Config", pre(src("shared/Config.lua")));
code += def("Logic", pre(src("shared/Logic.lua")));
code += def("CoreFactory", src("server/EconomyService/ServerCore.lua"));
code += `local __serverFn = function(script, require)\n${src("server/EconomyService/init.server.lua")}\nend\n`;
code += readFileSync(path.join(here, "server_smoke.lua"), "utf8");
await S.loadstring(code, "server_smoke", true)();
let failed = 0;
for (const l of out) { console.log(l); if (l.startsWith("FAIL")) failed++; }
console.log(failed ? "SERVER SMOKE FAILED" : "SERVER SMOKE PASSED");
process.exit(failed ? 1 : 0);
