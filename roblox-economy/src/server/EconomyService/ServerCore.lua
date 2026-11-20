--!nonstrict
-- Roblox-independent server core. The service script wires DataStore / Remotes around it.
-- Guarantees: every action is validated + executed synchronously (no yields), duplicate request ids replay
-- the cached result instead of executing twice, and unknown action names are rejected.
return function(L, C)
	local Core = {}
	local SEEN_MAX = 128
	local BUCKET_MAX, BUCKET_REFILL = 12, 10 -- burst 12, 10 actions per second sustained

	function Core.newSession(raw, now, opts)
		opts = opts or {}
		local state = (raw ~= nil) and L.migrate(raw, now) or L.newState(now, 0, 0)
		return {
			state = state, seen = {}, seenOrder = {}, readOnly = opts.readOnly == true,
			dirty = false, bucket = BUCKET_MAX, bucketAt = 0,
		}
	end

	local ACTIONS = {
		createCharacter = function(st, now, input) return L.createCharacter(st, type(input) == "table" and input or {}, now) end,
		restart = function(st, now) return L.restart(st, now) end,
		buyNeed = function(st, now, id, days) return L.buyNeed(st, id, days, now) end,
		buyBoost = function(st, now, id) return L.buyBoost(st, id, now) end,
		takeJob = function(st, now, id) return L.takeJob(st, id, now) end,
		quitJob = function(st, now) return L.quitJob(st, now) end,
		startShift = function(st, now, walk) return L.startShift(st, now, math.random, walk == true) end,
		chooseShift = function(st, now, idx) return L.chooseShift(st, idx, now) end,
		rest = function(st, now) return L.rest(st, now) end,
		startVacation = function(st, now) return L.startVacation(st, now) end,
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
		runCampaign = function(st, now, id) return L.runCampaign(st, id, now) end,
		fundResponse = function(st, now, id) return L.fundResponse(st, id, now) end,
		signContract = function(st, now, id) return L.signContract(st, id, now) end,
		researchCompany = function(st, now, id) return L.researchCompany(st, id, now) end,
		unionDeal = function(st, now, id) return L.unionDeal(st, id, now) end,
		upgradePhase = function(st, now) return L.upgradePhase(st, now) end,
		buyAsset = function(st, now, id, amount) return L.buyAsset(st, id, amount, now) end,
		sellAsset = function(st, now, id, share) return L.sellAsset(st, id, share, now) end,
		placeOrder = function(st, now, input) return L.placeOrder(st, input, now) end,
		cancelOrder = function(st, now, id) return L.cancelOrder(st, id, now) end,
		arbitrage = function(st, now, amount) return L.arbitrage(st, amount, now) end,
		startHustle = function(st, now, id, stake) return L.startHustle(st, id, stake, now, math.random) end,
		topUpHustle = function(st, now, id, amount) return L.topUpHustle(st, id, amount, now) end,
		decideHustle = function(st, now, id, opt) return L.decideHustle(st, id, opt, now) end,
		buyDevice = function(st, now, tier) return L.buyDevice(st, tier, now) end,
		toggleWatch = function(st, now, id) return L.toggleWatch(st, id) end,
		saveView = function(st, now, name, view) return L.saveView(st, name, view) end,
		deleteView = function(st, now, idx) return L.deleteView(st, idx) end,
		setPins = function(st, now, list) return L.setPins(st, list) end,
	}
	Core.ACTIONS = ACTIONS

	local function remember(session, reqId, result)
		session.seen[reqId] = result
		table.insert(session.seenOrder, reqId)
		if #session.seenOrder > SEEN_MAX then
			local old = table.remove(session.seenOrder, 1)
			session.seen[old] = nil
		end
	end

	-- Returns ok, info, extra, extra2. `now` in ms. `clock` seconds for the rate limiter (optional).
	function Core.invoke(session, name, reqId, now, clock, ...)
		if type(name) ~= "string" or type(reqId) ~= "string" or #reqId < 8 or #reqId > 64 then return false, "bad-request" end
		local cached = session.seen[reqId]
		if cached then return cached[1], cached[2], cached[3], cached[4] end -- replay, never re-execute
		local fn = ACTIONS[name]
		if not fn then return false, "bad-request" end
		if session.readOnly then return false, "save-unavailable" end
		if clock then
			session.bucket = math.min(BUCKET_MAX, session.bucket + (clock - session.bucketAt) * BUCKET_REFILL)
			session.bucketAt = clock
			if session.bucket < 1 then return false, "rate-limit" end -- not remembered: client may retry with a new id
			session.bucket -= 1
		end
		L.settle(session.state, now)
		local ok, info, extra, extra2 = fn(session.state, now, ...)
		remember(session, reqId, { ok, info, extra, extra2 })
		if ok then session.dirty = true end
		return ok, info, extra, extra2
	end

	function Core.tick(session, now)
		if session.readOnly then return end
		L.settle(session.state, now)
		session.dirty = true
	end

	function Core.snapshot(session) return L.deepCopy(session.state) end

	return Core
end
