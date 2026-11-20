#!/usr/bin/env python3
"""Builds install.lua: paste into a Script in ServerStorage and 'Save as Local Plugin' (or the Studio command bar).
It recreates the exact Instance tree from default.project.json with Source filled in."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = root / "src"
def read(p):
    t = (src / p).read_text()
    assert "]==]" not in t, p
    return t
out = ['''local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local SPS = game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")
local function clear(p, n) local o = p:FindFirstChild(n) if o then o:Destroy() end end
clear(RS, "Economy") clear(SSS, "EconomyService") clear(SPS, "EconomyUI")
local function make(class, name, parent, source)
	local o = Instance.new(class) o.Name = name o.Source = source o.Parent = parent return o
end
local econ = Instance.new("Folder") econ.Name = "Economy" econ.Parent = RS
''']
for n in ("Config", "Logic", "Strings"):
    out.append(f'make("ModuleScript", "{n}", econ, [==[\n{read(f"shared/{n}.lua")}]==])\n')
out.append(f'local svc = make("Script", "EconomyService", SSS, [==[\n{read("server/EconomyService/init.server.lua")}]==])\n')
out.append(f'make("ModuleScript", "ServerCore", svc, [==[\n{read("server/EconomyService/ServerCore.lua")}]==])\n')
out.append(f'local ui = make("LocalScript", "EconomyUI", SPS, [==[\n{read("client/EconomyUI/init.client.lua")}]==])\n')
for n in ("Theme", "Widgets", "Screens"):
    out.append(f'make("ModuleScript", "{n}", ui, [==[\n{read(f"client/EconomyUI/{n}.lua")}]==])\n')
out.append('print("Ekonomika installed. Enable Studio Access to API Services (Game Settings > Security), then press Play.")\n')
(root / "install.lua").write_text("".join(out))
print("install.lua", (root / "install.lua").stat().st_size, "bytes")
