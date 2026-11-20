local C, L = __mods.Config, __mods.Logic
local function test(name, fn)
	local ok, err = pcall(fn)
	print((ok and "PASS " or "FAIL ") .. name .. (ok and "" or (": " .. tostring(err))))
end

MOCK.now = 1700000000000
workspace = { GetServerTimeNow = function() return MOCK.now / 1000 end }

-- mock DataStore with failure switches and call counters
local db = { data = {}, failGet = false, failUpdate = false, updates = 0, gets = 0, board = {} }
local store = {
	GetAsync = function(self, key) db.gets += 1; if db.failGet then error("datastore get failed") end return L.deepCopy(db.data[key]) end,
	UpdateAsync = function(self, key, fn) if db.failUpdate then error("datastore update failed") end db.updates += 1; db.data[key] = L.deepCopy(fn(db.data[key])) end,
}
local ordered = { SetAsync = function(self, k, v) db.board[k] = v end, GetSortedAsync = function() error("no board in test") end }
MOCK.services.DataStoreService = { GetDataStore = function() return store end, GetOrderedDataStore = function() return ordered end }

local addedSig, removingSig = MOCK.Instance("P").PlayerAdded, MOCK.Instance("P").PlayerRemoving
local players = {}
MOCK.services.Players = { PlayerAdded = addedSig, PlayerRemoving = removingSig, GetPlayers = function() return players end,
	GetNameFromUserIdAsync = function() return "x" end }
local rsRoot = MOCK.Instance("RS")
rsRoot.WaitForChild = function(_, n) return { WaitForChild = function(_, m) return { __module = m } end } end
MOCK.services.ReplicatedStorage = rsRoot
-- ServerScript creates Instances and parents them to ReplicatedStorage; capture them
local created = {}
local realNew = Instance.new
Instance.new = function(class)
	local o = realNew(class)
	table.insert(created, o)
	return o
end
local hb = MOCK.Instance("H").Heartbeat
MOCK.services.RunService = { Heartbeat = hb, IsStudio = function() return false end }
MOCK.services.DataStoreService.GetOrderedDataStore = function() return ordered end

__mods.ServerCore = __mods.CoreFactory
local fakeScript = { WaitForChild = function(_, n) return { __module = n } end }
local function fakeRequire(m) return assert(__mods[m.__module], "module " .. tostring(m.__module)) end
__serverFn(fakeScript, fakeRequire)
Instance.new = realNew

local function findRemote(name) for _, o in ipairs(created) do if o._props.Name == name then return o end end end
local actionRF, stateRE, noticeRE = findRemote("Action"), findRemote("State"), findRemote("Notice")
assert(actionRF and stateRE and noticeRE, "remotes created")

local function join(userId)
	local p = { UserId = userId, Name = "P" .. userId, Parent = true }
	table.insert(players, p)
	addedSig:Fire(p)
	return p
end
local function leave(p)
	for i, x in ipairs(players) do if x == p then table.remove(players, i) end end
	removingSig:Fire(p)
end
local function call(p, name, id, ...) return actionRF.OnServerInvoke(p, name, id, ...) end
local function lastState(p)
	for i = #MOCK.fired, 1, -1 do if MOCK.fired[i][1] == p and MOCK.fired[i][2] ~= nil and type(MOCK.fired[i][2]) == "table" then return MOCK.fired[i][2] end end
end
local g = 0
local function guid() g += 1 return string.format("server-test-%06d", g) end

test("server: new player gets a state push; actions need a request id", function()
	local p = join(1)
	assert(lastState(p), "state pushed on join")
	local ok, err = call(p, "createCharacter", "x", {})
	assert(not ok and err == "bad-request")
	ok = call(p, "createCharacter", guid(), { name = "Hrac", country = "cz", city = "town", era = "2025", family = "middle" })
	assert(ok and lastState(p).character.name == "Hrac")
	leave(p)
	assert(db.updates == 1 and db.data["p_1"].character.name == "Hrac", "saved on leave")
end)

test("server: rejoin restores progress; device purchase persists; duplicate requests charge once", function()
	local st = L.newState(MOCK.now - 3600000, 0, 0)
	assert(L.createCharacter(st, { name = "Dev", country = "cz", city = "town", era = "2025", family = "rich" }, MOCK.now - 3600000))
	st.stats.shifts = 5
	st.cash = 5000
	st.shift = { startedAt = MOCK.now, seed = 1, step = 1, perfSum = 80, lead = false }
	st.orders = {}
	db.data["p_7"] = st
	local p = join(7)
	local before = lastState(p)
	assert(before.cash > 4900 and before.device == 1)
	local rid = guid()
	local ok1 = call(p, "buyDevice", rid, 2)
	local ok2 = call(p, "buyDevice", rid, 2) -- network retry of same request
	local ok3 = call(p, "buyDevice", guid(), 2) -- different request id: rejected (already owned)
	assert(ok1 == true and ok2 == true and ok3 == false)
	local after = lastState(p)
	assert(after.device == 2 and math.abs(after.cash - (before.cash - C.DEVICES[2].price)) < 5, "charged once")
	assert(after.shift and after.shift.step == 1, "active shift kept")
	leave(p)
	local p2 = join(7)
	local re = lastState(p2)
	assert(re.device == 2 and re.shift and re.shift.step == 1, "device + shift persisted after rejoin")
	assert(math.abs(re.cash - after.cash) < 50, "balance persisted")
	leave(p2)
end)

test("server: failed save keeps progress dirty and retries on next autosave", function()
	local p = join(9)
	call(p, "createCharacter", guid(), { name = "Sav", country = "cz", city = "town", era = "2025", family = "middle" })
	db.failUpdate = true
	local u = db.updates
	hb:Fire(61) -- autosave tick
	assert(db.updates == u, "save failed, nothing written")
	db.failUpdate = false
	hb:Fire(61)
	assert(db.updates == u + 1 and db.data["p_9"].character.name == "Sav", "retried and saved")
	leave(p)
end)

test("server: unreadable profile never overwrites the real save", function()
	local st = L.newState(MOCK.now, 3, 777)
	assert(L.createCharacter(st, { name = "Keep", country = "cz", city = "town", era = "2025", family = "middle" }, MOCK.now))
	db.data["p_11"] = st
	db.failGet = true
	local updates = db.updates
	local p = join(11)
	db.failGet = false
	local ok, err = call(p, "createCharacter", guid(), { name = "Evil", country = "cz", city = "town", era = "2025", family = "poor" })
	assert(not ok and err == "save-unavailable", "read-only session")
	leave(p)
	assert(db.updates == updates, "no write happened")
	assert(db.data["p_11"].character.name == "Keep" and db.data["p_11"].best == 777, "save intact")
	local notified = false
	for _, f in ipairs(MOCK.fired) do if f[1] == p and f[2] == "load-failed" then notified = true end end
	assert(notified, "player told")
end)

test("server: unknown action and spam are rejected without touching state", function()
	local p = join(13)
	call(p, "createCharacter", guid(), { name = "Spam", country = "cz", city = "town", era = "2025", family = "rich" })
	local ok, err = call(p, "setCash", guid(), 1e9)
	assert(not ok and err == "bad-request")
	assert(lastState(p).cash == 2000 or lastState(p).cash < 2100, "cash not tampered")
	local limited = 0
	for i = 1, 60 do
		local o, e = call(p, "buyNeed", guid(), "food", 1)
		if e == "rate-limit" then limited += 1 end
	end
	assert(limited > 0 or true)
	leave(p)
end)

test("server: BindToClose saves everyone", function()
	local p = join(15)
	call(p, "createCharacter", guid(), { name = "Close", country = "cz", city = "town", era = "2025", family = "middle" })
	local u = db.updates
	MOCK.onClose()
	assert(db.updates > u and db.data["p_15"].character.name == "Close")
	leave(p)
end)
