-- Smoke test for the client shell (EconomyUI.client): boots it against mocked services, pushes server states,
-- resizes across phone / tablet / desktop widths, switches every tab and ticks the header animation.
local C = require("Config")
local L = require("Logic")
local H = C.H
local now = 1000.0 * H

local function signal()
	local s = { fns = {} }
	function s:Connect(fn) table.insert(self.fns, fn); return { Disconnect = function() end } end
	function s:Fire(...) for _, f in ipairs(self.fns) do f(...) end end
	return s
end

local playerGui = Instance.new("Folder")
local player = { DisplayName = "Ada", UserId = 1, WaitForChild = function() return playerGui end }
local stateRE = { OnClientEvent = signal() }
local noticeRE = { OnClientEvent = signal() }
local session -- server-side session driven through ServerCore
local Core = require("ServerCore")
local reqN = 0
local actionRF = { InvokeServer = function(_, name, reqId, ...)
	reqN = reqN + 1
	local ok, a, b, c = Core.invoke(session, name, reqId, now, nil, ...)
	stateRE.OnClientEvent:Fire(session.state, now, false)
	return ok, a, b, c
end }
local boardRF = { InvokeServer = function() return { { rank = 1, name = "Zed", value = 1e6 } } end }
local remotes = { WaitForChild = function(_, n) return ({ Action = actionRF, Board = boardRF, State = stateRE, Notice = noticeRE })[n] end }
local economy = { WaitForChild = function(_, n) return n end }
local heartbeat = signal()
local services = {
	Players = { LocalPlayer = player },
	ReplicatedStorage = { WaitForChild = function(_, n) if n == "Economy" then return economy end return remotes end },
	RunService = { Heartbeat = heartbeat, IsStudio = function() return true end },
	UserInputService = { TouchEnabled = false, InputBegan = signal(), InputEnded = signal(), GetFocusedTextBox = function() return nil end },
	HttpService = { GenerateGUID = function() reqN = reqN + 1; return "guid-" .. string.format("%08d", reqN) end },
}
local baseGetService = game.GetService
game.GetService = function(self, n) return services[n] or baseGetService(self, n) end
workspace = { GetServerTimeNow = function() return now / 1000 end }
script = setmetatable({ Parent = script.Parent }, { __index = function(_, k) if k == "WaitForChild" then return function(_, n) return n end end end })

Core = Core(L, C)
session = Core.newSession(nil, now)

CHUNKS.EconomyUI()
local gui = playerGui._kids[1]
assert(gui and gui.Name == "EconomyGui", "gui not created")

local function push() stateRE.OnClientEvent:Fire(session.state, now, false) end
local function tick(n) for _ = 1, n or 3 do heartbeat:Fire(1 / 20) end end
local function pressText(root, pattern)
	for _, d in ipairs(root:GetDescendants()) do
		if d.ClassName == "TextButton" and type(d.Text) == "string" and d.Text:find(pattern, 1, true) and d._p.Activated then d._p.Activated:Fire() return true end
	end
	return false
end

push(); tick()
-- character creation through the real button
assert(pressText(gui, "Start the game"), "start button missing")
assert(session.state.character ~= nil, "character not created")
tick()
-- claim daily via goals tab, then visit every tab at three widths
session.state.device = 4
for _, size in ipairs({ Vector2.new(390, 844), Vector2.new(820, 1180), Vector2.new(1600, 900) }) do
	gui._p.AbsoluteSize = size
	push(); tick()
	for _, tab in ipairs({ "Home", "Work", "Needs", "Business", "Invest", "Hustle", "Compare", "History", "Goals", "Leaders", "Devices", "More" }) do
		pressText(gui, tab)
		push(); tick(2)
	end
end
pressText(gui, "Claim")
push(); tick()
-- a server notice + a read-only push
noticeRE.OnClientEvent:Fire("load-failed")
stateRE.OnClientEvent:Fire(session.state, now, true)
tick()
now = now + 10 * 60000
push(); tick(10)
print(string.format("Shell OK: %d actions, %d instances", reqN, INSTANCES))
