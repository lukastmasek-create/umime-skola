--!nonstrict
-- Wires Roblox services around ServerCore: DataStore (versioned, retried), Remotes, leaderboard.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local Economy = ReplicatedStorage:WaitForChild("Economy")
local C = require(Economy:WaitForChild("Config"))
local L = require(Economy:WaitForChild("Logic"))
local Core = require(script:WaitForChild("ServerCore"))(L, C)

local STORE, BOARD = nil, nil
do
	local ok, a, b = pcall(function()
		return DataStoreService:GetDataStore("EconomyGame_v2"), DataStoreService:GetOrderedDataStore("EconomyBest_v2")
	end)
	if ok then STORE, BOARD = a, b else warn("[Economy] DataStore unavailable (publish the place). Progress will not save.") end
end

local remotes = Instance.new("Folder")
remotes.Name = "EconomyRemotes"
remotes.Parent = ReplicatedStorage
local function remote(class, name)
	local r = Instance.new(class)
	r.Name = name
	r.Parent = remotes
	return r
end
local actionRF = remote("RemoteFunction", "Action")
local boardRF = remote("RemoteFunction", "Board")
local stateRE = remote("RemoteEvent", "State")
local noticeRE = remote("RemoteEvent", "Notice")

local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end
local function key(p) return "p_" .. p.UserId end

local sessions = {}
local saving = {}
local lastBoardWrite = {}

-- ───────── persistence ─────────
local function withRetries(fn)
	local lastErr
	for attempt = 1, 3 do
		local ok, res = pcall(fn)
		if ok then return true, res end
		lastErr = res
		task.wait(attempt)
	end
	return false, lastErr
end

local function save(player)
	local s = sessions[player]
	if not s or s.readOnly or not STORE then return true end
	if saving[player] then return false end -- the running save loop will pick up the dirty flag
	saving[player] = true
	local allOk = true
	while s.dirty do
		s.dirty = false
		local snap = Core.snapshot(s)
		local ok, err = withRetries(function()
			STORE:UpdateAsync(key(player), function() return snap end)
		end)
		if not ok then
			warn("[Economy] save failed", player.Name, err)
			s.dirty = true -- keep for the next autosave; never drop progress
			allOk = false
			break
		end
		if BOARD and (os.clock() - (lastBoardWrite[player] or -1e9)) > 300 then
			lastBoardWrite[player] = os.clock()
			pcall(function() BOARD:SetAsync(tostring(player.UserId), math.floor(math.min(snap.best, 9e15))) end)
		end
	end
	saving[player] = nil
	return allOk
end

local function push(player)
	local s = sessions[player]
	if s then stateRE:FireClient(player, s.state, nowMs(), s.readOnly) end
end

local loading = {}
local function onPlayerAdded(player)
	if sessions[player] or loading[player] then return end
	loading[player] = true
	local now = nowMs()
	local session
	if not STORE then
		session = Core.newSession(nil, now)
	else
		local ok, data = withRetries(function() return STORE:GetAsync(key(player)) end)
		if ok then
			session = Core.newSession(data, now)
		else
			-- Could not read: do NOT overwrite the real save with a blank one.
			session = Core.newSession(nil, now, { readOnly = true })
			noticeRE:FireClient(player, "load-failed")
		end
	end
	loading[player] = nil
	if not player.Parent then return end
	now = nowMs()
	sessions[player] = session
	L.settle(session.state, now)
	push(player)
end
Players.PlayerAdded:Connect(onPlayerAdded)
-- Players who joined before this script ran (common in Studio Play Solo) would otherwise never get a session.
for _, p in ipairs(Players:GetPlayers()) do task.spawn(onPlayerAdded, p) end

Players.PlayerRemoving:Connect(function(player)
	local s = sessions[player]
	if s then
		Core.tick(s, nowMs())
		save(player)
	end
	sessions[player], saving[player], lastBoardWrite[player] = nil, nil, nil
end)

game:BindToClose(function()
	local deadline = os.clock() + 25
	for _, p in ipairs(Players:GetPlayers()) do
		task.spawn(save, p)
	end
	while os.clock() < deadline do
		local busy = false
		for _, p in ipairs(Players:GetPlayers()) do if saving[p] then busy = true end end
		if not busy then break end
		task.wait(0.2)
	end
end)

-- ───────── remotes ─────────
actionRF.OnServerInvoke = function(player, name, reqId, ...)
	local s = sessions[player]
	if not s then return false, "not-ready" end
	local ok, info, extra, extra2 = Core.invoke(s, name, reqId, nowMs(), os.clock(), ...)
	push(player)
	return ok, info, extra, extra2
end

local boardCache, boardAt = nil, 0
local nameCache = {}
boardRF.OnServerInvoke = function()
	if not BOARD then return {} end
	if boardCache and os.clock() - boardAt < 30 then return boardCache end
	local ok, pages = pcall(function() return BOARD:GetSortedAsync(false, C.BOARD_SIZE) end)
	if not ok then return boardCache or {} end
	local list = {}
	for rank, entry in ipairs(pages:GetCurrentPage()) do
		local uid = tonumber(entry.key)
		if uid and not nameCache[uid] then
			local okN, n = pcall(function() return Players:GetNameFromUserIdAsync(uid) end)
			nameCache[uid] = okN and n or ("#" .. tostring(uid))
		end
		table.insert(list, { rank = rank, name = nameCache[uid or 0] or "?", value = entry.value })
	end
	boardCache, boardAt = list, os.clock()
	return list
end

-- ───────── tick + autosave ─────────
local acc, saveAcc = 0, 0
RunService.Heartbeat:Connect(function(dt)
	acc += dt
	saveAcc += dt
	if acc >= 1 then
		acc = 0
		local now = nowMs()
		for player, s in pairs(sessions) do
			Core.tick(s, now)
			push(player)
		end
	end
	if saveAcc >= 60 then
		saveAcc = 0
		for player, s in pairs(sessions) do
			if s.dirty then task.spawn(save, player) end
		end
	end
end)
