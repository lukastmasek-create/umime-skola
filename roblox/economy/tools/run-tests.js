// Runs tests/*.lua against the Luau sources in a JS Lua VM (fengari).
// Usage (from roblox/economy):  npm i --no-save fengari@0.1.4 && node tools/run-tests.js
const fs = require('fs'); const path = require('path');
let fengari;
try { fengari = require('fengari'); } catch (e) { console.error('fengari missing: npm i --no-save fengari@0.1.4'); process.exit(2); }
const { lua, lauxlib, lualib, to_luastring } = fengari;
const shim = require('./luau-shim');
const root = path.resolve(__dirname, '..');
const src = (m) => shim(fs.readFileSync(path.join(root, 'src', m + '.lua'), 'latin1'));

const PRELUDE = `
bit32 = {}
-- fengari has 32-bit integers, so bit32 is emulated with float arithmetic
function bit32.bxor(a, b)
  a = a % 4294967296; b = b % 4294967296
  local r, bit = 0, 1
  for _ = 1, 32 do
    local x, y = a % 2, b % 2
    if x ~= y then r = r + bit end
    a = (a - x) / 2; b = (b - y) / 2; bit = bit * 2
  end
  return r
end
function bit32.rshift(a, n) return math.floor((a % 4294967296) / 2 ^ n) end
function math.round(x) if x >= 0 then return math.floor(x + 0.5) else return math.ceil(x - 0.5) end end
function math.clamp(x, a, b) return math.min(b, math.max(a, x)) end
function table.pack(...) return { n = select("#", ...), ... } end
MODULES = {}
CHUNKS = {}
script = { Parent = setmetatable({}, { __index = function(_, k) return k end }) }
local rawrequire = require
function require(x) if type(x) == "string" and MODULES[x] then return MODULES[x] end return rawrequire(x) end
`;

function runSuite(test, mods, withMock, chunks) {
  const L = lauxlib.luaL_newstate(); lualib.luaL_openlibs(L);
  const run = (code, name) => {
    if (lauxlib.luaL_loadbuffer(L, to_luastring(code), null, to_luastring(name)) !== 0 || lua.lua_pcall(L, 0, 0, 0) !== 0) {
      throw new Error(name + ': ' + lua.lua_tojsstring(L, -1));
    }
  };
  run(PRELUDE, 'prelude');
  if (withMock) run(fs.readFileSync(path.join(root, 'tests', 'roblox_mock.lua'), 'latin1'), 'roblox_mock');
  for (const m of mods) run(`MODULES["${m}"] = (function() ${src(m)}\nend)()`, m);
  for (const c of chunks || []) run(`CHUNKS["${c.split('.')[0]}"] = function() ${src(c)}\nend`, c);
  run(shim(fs.readFileSync(path.join(root, 'tests', test), 'latin1')), test);
}

let failed = 0;
for (const [test, mods, mock, chunks] of [
  ['logic_spec.lua', ['Config', 'Logic', 'ServerCore'], false],
  ['ui_spec.lua', ['Config', 'Logic', 'Strings', 'Theme', 'Widgets', 'Screens'], true],
  ['shell_spec.lua', ['Config', 'Logic', 'ServerCore', 'Strings', 'Theme', 'Widgets', 'Screens'], true, ['EconomyUI.client']],
]) {
  try { runSuite(test, mods, mock, chunks); console.log('PASS', test); }
  catch (e) { failed++; console.log('FAIL', test, '\n  ' + e.message); }
}
process.exit(failed ? 1 : 0);
