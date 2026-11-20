--!nonstrict
-- Authoritative server: per-player state, DataStore saving, one RemoteFunction for all actions.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local Economy = ReplicatedStorage:WaitForChild("Economy")
local C = require(Economy:WaitForChild("Config"))
local L = require(Economy:WaitForChild("Logic"))

local STORE = nil
do
	local okStore, result = pcall(function()
		return DataStoreService:GetDataStore("EconomyGame_v1")
	end)
	if okStore then
		STORE = result
	else
		warn("[Economy] DataStore unavailable. Progress will not save.")
	end
end
local TICK_SEC = 1
local SAVE_SEC = 60
local ACTION_MIN_GAP = 0.08 -- seconds, basic spam guard

local remotes = Instance.new("Folder")
remotes.Name = "EconomyRemotes"
remotes.Parent = ReplicatedStorage
local actionRF = Instance.new("RemoteFunction")
actionRF.Name = "Action"
actionRF.Parent = remotes
local stateRE = Instance.new("RemoteEvent")
stateRE.Name = "State"
stateRE.Parent = remotes

local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end

local states: { [Player]: any } = {}
local lastAction: { [Player]: number } = {}
local dirty: { [Player]: boolean } = {}

local function push(player)
	local st = states[player]
	if st then stateRE:FireClient(player, st, nowMs()) end
end

local function save(player)
	local st = states[player]
	if not st then return end
	local ok, err = pcall(function()
		STORE:SetAsync("p_" .. player.UserId, st)
	end)
	if not ok then warn("[Economy] save failed for", player.Name, err) end
	dirty[player] = false
end

Players.PlayerAdded:Connect(function(player)
	local ok, data = pcall(function() return STORE:GetAsync("p_" .. player.UserId) end)
	local now = nowMs()
	local st
	if ok and type(data) == "table" and data.v == 1 then
		st = data
		-- never trust negative gaps; settle caps offline gain to MAX_OFFLINE_MIN
		st.lastSeen = math.min(st.lastSeen or now, now)
	else
		st = L.newState(now, 0, 0)
	end
	states[player] = st
	L.settle(st, now)
	push(player)
end)

Players.PlayerRemoving:Connect(function(player)
	local st = states[player]
	if st then
		L.settle(st, nowMs())
		save(player)
	end
	states[player], lastAction[player], dirty[player] = nil, nil, nil
end)

game:BindToClose(function()
	if RunService:IsStudio() then return end
	for _, p in ipairs(Players:GetPlayers()) do save(p) end
end)

-- Action table: name -> function(state, now, ...) returning ok, info, extra
local actions = {
	createCharacter = function(st, now, input) return L.createCharacter(st, type(input) == "table" and input or {}, now) end,
	restart = function(st, now) return L.restart(st, now) end,
	buyNeed = function(st, now, id, days) return L.buyNeed(st, id, days, now) end,
	takeJob = function(st, now, id) return L.takeJob(st, id, now) end,
	quitJob = function(st, now) return L.quitJob(st, now) end,
	startShift = function(st, now, walk) return L.startShift(st, now, math.random, walk == true) end,
	chooseShift = function(st, now, idx) return L.chooseShift(st, idx, now) end,
	rest = function(st, now) return L.rest(st, now) end,
	requestPromotion = function(st, now) return L.requestPromotion(st, now, math.random) end,
	negotiateRaise = function(st, now) return L.negotiateRaise(st, now, math.random) end,
	setLead = function(st, now, on) return L.setLead(st, on == true) end,
	investEdu = function(st, now) return L.investEdu(st, now) end,
	buyCompany = function(st, now, id) return L.buyCompany(st, id, now) end,
	sellCompany = function(st, now, id) return L.sellCompany(st, id, now) end,
	upgradeCompany = function(st, now, id) return L.upgradeCompany(st, id, now) end,
	hireStaff = function(st, now, id, delta, role) return L.hireStaff(st, id, delta, role, now) end,
	buyStock = function(st, now, id, amount) return L.buyStock(st, id, amount, now) end,
	setCompanySetting = function(st, now, id, field, v) return L.setCompanySetting(st, id, field, v, now) end,
	upgradePhase = function(st, now) return L.upgradePhase(st, now) end,
	buyAsset = function(st, now, id, amount) return L.buyAsset(st, id, amount, now) end,
	sellAsset = function(st, now, id, share) return L.sellAsset(st, id, share, now) end,
	startHustle = function(st, now, id, stake) return L.startHustle(st, id, stake, now, math.random) end,
	decideHustle = function(st, now, id, opt) return L.decideHustle(st, id, opt, now) end,
}

actionRF.OnServerInvoke = function(player, name, ...)
	local st = states[player]
	local fn = actions[name]
	if not st or type(name) ~= "string" or not fn then return false, "bad-request" end
	local t = os.clock()
	if lastAction[player] and t - lastAction[player] < ACTION_MIN_GAP then return false, "cooldown" end
	lastAction[player] = t
	local now = nowMs()
	L.settle(st, now) -- always settle before acting
	local ok, info, extra = fn(st, now, ...)
	dirty[player] = true
	push(player)
	return ok, info, extra
end

-- Periodic settle + push + autosave
local acc, saveAcc = 0, 0
RunService.Heartbeat:Connect(function(dt)
	acc += dt
	saveAcc += dt
	if acc >= TICK_SEC then
		acc = 0
		local now = nowMs()
		for player, st in pairs(states) do
			L.settle(st, now)
			dirty[player] = true
			push(player)
		end
	end
	if saveAcc >= SAVE_SEC then
		saveAcc = 0
		for player in pairs(states) do
			if dirty[player] then task.spawn(save, player) end
		end
	end
end)
