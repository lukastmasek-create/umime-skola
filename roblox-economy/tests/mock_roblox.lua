-- Minimal Roblox API mock so the client modules can run inside a plain Luau VM.
MOCK = { vp = { X = 1280, Y = 720 }, pending = {}, tree = {}, toasts = {}, fired = {} }
local EVENTS = { Activated = true, MouseEnter = true, MouseLeave = true, MouseButton1Down = true, MouseButton1Up = true, FocusLost = true, Changed = true,
	Heartbeat = true, InputBegan = true, InputEnded = true, OnClientEvent = true, RenderStepped = true, PlayerAdded = true, PlayerRemoving = true }
local function signal()
	local s = { cbs = {} }
	function s:Connect(fn) table.insert(self.cbs, fn) return { Disconnect = function() end } end
	function s:Fire(...) for _, f in ipairs(self.cbs) do f(...) end end
	function s:Wait() return 0 end
	return s
end
local V2mt = {}
V2mt.__index = V2mt
function V2mt.__add(a, b) return Vector2.new(a.X + b.X, a.Y + b.Y) end
function V2mt.__sub(a, b) return Vector2.new(a.X - b.X, a.Y - b.Y) end
Vector2 = { new = function(x, y) return setmetatable({ X = x or 0, Y = y or 0 }, V2mt) end }
local U2mt = {}
function U2mt.__add(a, b) return UDim2.new(a.XS + b.XS, a.XO + b.XO, a.YS + b.YS, a.YO + b.YO) end
function U2mt.__sub(a, b) return UDim2.new(a.XS - b.XS, a.XO - b.XO, a.YS - b.YS, a.YO - b.YO) end
UDim2 = {
	new = function(xs, xo, ys, yo) return setmetatable({ XS = xs or 0, XO = xo or 0, YS = ys or 0, YO = yo or 0, X = { Scale = xs or 0, Offset = xo or 0 }, Y = { Scale = ys or 0, Offset = yo or 0 } }, U2mt) end,
	fromOffset = function(x, y) return UDim2.new(0, x, 0, y) end,
	fromScale = function(x, y) return UDim2.new(x, 0, y, 0) end,
}
UDim = { new = function(s, o) return { Scale = s, Offset = o } end }
Color3 = {
	new = function(r, g, b) return { R = r, G = g, B = b } end,
	fromRGB = function(r, g, b) return { R = r / 255, G = g / 255, B = b / 255 } end,
	fromHex = function(h) assert(#h == 6, "bad hex " .. h) return { hex = h } end,
}
ColorSequence = { new = function(a, b) return { a = a, b = b } end }
TweenInfo = { new = function() return {} end }
local enumProxy
enumProxy = function(path) return setmetatable({ __path = path }, { __index = function(_, k) return enumProxy(path .. "." .. k) end }) end
Enum = enumProxy("Enum")

local classes = {}
local function mk(class)
	local o = { ClassName = class, _children = {}, _props = {}, _attrs = {}, _sig = {} }
	return setmetatable(o, classes)
end
classes.__index = function(o, k)
	local raw = rawget(o, "_props")[k]
	if raw ~= nil then return raw end
	if k == "Destroy" then return function(self) self._destroyed = true; if self._parent then for i, c in ipairs(self._parent._children) do if c == self then table.remove(self._parent._children, i) break end end end; self._parent = nil end end
	if k == "GetChildren" then return function(self) local t = {} for i, c in ipairs(self._children) do t[i] = c end return t end end
	if k == "SetAttribute" then return function(self, a, v) self._attrs[a] = v end end
	if k == "GetAttribute" then return function(self, a) return self._attrs[a] end end
	if k == "GetPropertyChangedSignal" then return function(self, p) self._sig["prop:" .. p] = self._sig["prop:" .. p] or signal(); return self._sig["prop:" .. p] end end
	if k == "FindFirstChild" or k == "WaitForChild" then return function(self, n) for _, c in ipairs(self._children) do if c._props.Name == n then return c end end return nil end end
	if k == "FireClient" then return function(self, p, ...) local function cp(t) if type(t) ~= "table" then return t end local r = {} for a, b in pairs(t) do r[a] = cp(b) end return r end local args = table.pack(...) for i = 1, args.n do args[i] = cp(args[i]) end table.insert(MOCK.fired, { p, table.unpack(args, 1, args.n) }) end end
	if k == "IsA" then return function(self, c) return self.ClassName == c or (c == "GuiObject" and self.ClassName ~= "ScreenGui") end end
	if k == "Parent" then return o._parent end
	if k == "AbsoluteSize" then return (o.ClassName == "ScreenGui") and Vector2.new(MOCK.vp.X, MOCK.vp.Y) or Vector2.new(200, 40) end
	if k == "AbsolutePosition" then return Vector2.new(0, 0) end
	if k == "CanvasPosition" then return Vector2.new(0, 0) end
	if EVENTS[k] then o._sig[k] = o._sig[k] or signal(); return o._sig[k] end
	return nil
end
classes.__newindex = function(o, k, v)
	if k == "Parent" then
		if o._parent then for i, c in ipairs(o._parent._children) do if c == o then table.remove(o._parent._children, i) break end end end
		o._parent = v
		if v then table.insert(v._children, o) end
	else
		o._props[k] = v
	end
end
Instance = { new = function(class) return mk(class) end }
MOCK.Instance = mk

task = {
	spawn = function(fn, ...) fn(...) end,
	defer = function(fn, ...) fn(...) end,
	delay = function(t, fn) table.insert(MOCK.pending, fn) end,
	wait = function() return 0 end,
}
function MOCK.flush() local p = MOCK.pending; MOCK.pending = {}; for _, f in ipairs(p) do f() end end

-- walk tree helpers
function MOCK.walk(root, fn) fn(root); for _, c in ipairs(root._children) do MOCK.walk(c, fn) end end
function MOCK.texts(root)
	local out = {}
	MOCK.walk(root, function(o)
		local t = o._props.Text
		if type(t) == "string" and t ~= "" then table.insert(out, t) end
	end)
	return out
end
function MOCK.has(root, needle)
	for _, t in ipairs(MOCK.texts(root)) do if string.find(t, needle, 1, true) then return true end end
	return false
end
function MOCK.tap(root, needle, nth)
	local seen = 0
	local fired = false
	MOCK.walk(root, function(o)
		if fired or o.ClassName ~= "TextButton" then return end
		local t = o._props.Text
		if type(t) == "string" and string.find(t, needle, 1, true) and not o._destroyed then
			seen += 1
			if seen == (nth or 1) then
				local sig = o._sig.Activated
				if sig then sig:Fire() fired = true end
			end
		end
	end)
	return fired
end
function MOCK.countButtons(root)
	local n = 0
	MOCK.walk(root, function(o) if o.ClassName == "TextButton" then n += 1 end end)
	return n
end

MOCK.services = { TweenService = { Create = function() return { Play = function() end } end } }
game = { GetService = function(_, n) return assert(MOCK.services[n], "service " .. n) end, BindToClose = function(_, fn) MOCK.onClose = fn end }

function MOCK.tapExact(root, text)
	local fired = false
	MOCK.walk(root, function(o)
		if fired or o.ClassName ~= "TextButton" or o._destroyed then return end
		if o._props.Text == text and o._sig.Activated then o._sig.Activated:Fire() fired = true end
	end)
	return fired
end
