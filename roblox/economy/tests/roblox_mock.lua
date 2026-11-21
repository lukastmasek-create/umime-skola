-- Minimal stand-in for the Roblox UI API, enough to execute Theme/Widgets/Screens headlessly and catch
-- runtime errors (nil fields, typos, bad arithmetic). It does not draw anything.
local function vec2(x, y) return setmetatable({ X = x or 0, Y = y or 0 }, {
	__add = function(a, b) return vec2(a.X + b.X, a.Y + b.Y) end,
	__sub = function(a, b) return vec2(a.X - b.X, a.Y - b.Y) end,
}) end
Vector2 = { new = vec2 }

local function udim(s, o) return { Scale = s or 0, Offset = o or 0 } end
UDim = { new = udim }
local U2 = {}
U2.__index = U2
local function udim2(xs, xo, ys, yo)
	return setmetatable({ X = udim(xs, xo), Y = udim(ys, yo), Width = udim(xs, xo), Height = udim(ys, yo) }, U2)
end
U2.__add = function(a, b) return udim2(a.X.Scale + b.X.Scale, a.X.Offset + b.X.Offset, a.Y.Scale + b.Y.Scale, a.Y.Offset + b.Y.Offset) end
U2.__sub = function(a, b) return udim2(a.X.Scale - b.X.Scale, a.X.Offset - b.X.Offset, a.Y.Scale - b.Y.Scale, a.Y.Offset - b.Y.Offset) end
UDim2 = {
	new = function(a, b, c, d) return udim2(a or 0, b or 0, c or 0, d or 0) end,
	fromOffset = function(x, y) return udim2(0, x or 0, 0, y or 0) end,
	fromScale = function(x, y) return udim2(x or 0, 0, y or 0, 0) end,
}
local function c3(r, g, b) return { R = r or 0, G = g or 0, B = b or 0 } end
Color3 = { new = c3, fromRGB = function(r, g, b) return c3(r / 255, g / 255, b / 255) end,
	fromHex = function(h) assert(type(h) == "string" and #h == 6, "bad hex " .. tostring(h)); return c3(tonumber(h:sub(1, 2), 16) / 255, tonumber(h:sub(3, 4), 16) / 255, tonumber(h:sub(5, 6), 16) / 255) end }
ColorSequenceKeypoint = { new = function(t, c) assert(type(t) == "number" and type(c) == "table", "bad keypoint"); return { Time = t, Value = c } end }
ColorSequence = { new = function(a, b) assert(a ~= nil, "ColorSequence.new needs args"); return { a, b } end }
NumberSequence = { new = function(a, b) return { a, b } end }
TweenInfo = { new = function(...) return { ... } end }

local function enumOf(name)
	return setmetatable({}, { __index = function(_, k) return name .. "." .. k end })
end
Enum = setmetatable({}, { __index = function(t, k) local e = enumOf(k); rawset(t, k, e); return e end })

local function signal()
	local s = { fns = {} }
	function s:Connect(fn) table.insert(self.fns, fn); return { Disconnect = function() end } end
	function s:Fire(...) for _, f in ipairs(self.fns) do f(...) end end
	return s
end

local CLASS_OK = {
	Frame = true, TextLabel = true, TextButton = true, TextBox = true, ScrollingFrame = true, ImageLabel = true, ScreenGui = true,
	UICorner = true, UIStroke = true, UIPadding = true, UIGradient = true, UIListLayout = true, UIScale = true, Sound = true, Folder = true,
}
INSTANCES = 0
local Inst = {}
Inst.__index = function(self, k)
	local v = rawget(self, "_p")[k]
	if v ~= nil then return v end
	if Inst[k] then return Inst[k] end
	if k == "MouseEnter" or k == "MouseLeave" or k == "Activated" or k == "MouseButton1Down" or k == "MouseButton1Up" or k == "Destroying" or k == "FocusLost" or k == "Focused" then
		local s = signal(); rawget(self, "_p")[k] = s; return s
	end
	if k == "AbsolutePosition" then return vec2(0, 0) end
	if k == "AbsoluteSize" then return vec2(1280, 720) end
	if k == "ZIndex" then return 1 end
	if k == "LayoutOrder" then return 0 end
	if k == "AnchorPoint" then return vec2(0, 0) end
	if k == "Position" or k == "Size" then return UDim2.new() end
	if k == "CanvasPosition" then return vec2(0, 0) end
	if k == "Text" then return "" end
	return nil
end
Inst.__newindex = function(self, k, v)
	if k == "Parent" then
		local old = rawget(self, "_p").Parent
		if old then for i, c in ipairs(old._kids) do if c == self then table.remove(old._kids, i) break end end end
		if v then table.insert(v._kids, self) end
	end
	if (k == "Size" or k == "Position") and type(v) ~= "table" then error("bad " .. k .. " value " .. tostring(v), 2) end
	if (k == "TextSize" or k == "Rotation" or k == "BackgroundTransparency" or k == "TextTransparency" or k == "Thickness" or (k == "Transparency" and rawget(self, "_p").ClassName ~= "UIGradient") or k == "Scale" or k == "ZIndex" or k == "LayoutOrder") and type(v) ~= "number" then
		error("bad " .. k .. " value " .. tostring(v), 2)
	end
	if k == "Text" and type(v) ~= "string" then error("Text must be a string, got " .. type(v), 2) end
	rawget(self, "_p")[k] = v
end
function Inst:Destroy() self.Parent = nil; if self._p.Destroying then self._p.Destroying:Fire() end end
function Inst:GetChildren() local t = {} for i, c in ipairs(self._kids) do t[i] = c end return t end
function Inst:GetDescendants()
	local out = {}
	local function walk(n) for _, c in ipairs(n._kids) do table.insert(out, c); walk(c) end end
	walk(self)
	return out
end
function Inst:IsA(c) return self.ClassName == c or (c == "GuiObject" and self.ClassName ~= "UICorner") end
function Inst:SetAttribute(k, v) self._attr[k] = v end
function Inst:GetAttribute(k) return self._attr[k] end
function Inst:FindFirstChild(n) for _, c in ipairs(self._kids) do if c.Name == n then return c end end end
function Inst:GetPropertyChangedSignal() return signal() end
function Inst:Play() end
Instance = { new = function(class)
	assert(CLASS_OK[class], "unknown class " .. tostring(class))
	INSTANCES = INSTANCES + 1
	local o = setmetatable({ _p = {}, _kids = {}, _attr = {} }, Inst)
	o._p.ClassName = class
	o._p.Name = class
	return o
end }

local TweenService = { Create = function(_, o, info, props)
	assert(type(props) == "table", "tween props")
	return { Play = function() for k, v in pairs(props) do o[k] = v end end }
end }
game = { GetService = function(_, n) if n == "TweenService" then return TweenService end error("service " .. n .. " not mocked") end }
task = { delay = function() end, spawn = function() end, defer = function() end, wait = function() end } -- scheduled work never runs headlessly
os.clock = os.clock or function() return 0 end
