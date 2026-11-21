--!nonstrict
-- Every screen reads live server state through ctx. No screen computes outcomes: it only reads display values
-- (rates, gates, prices) from the shared Logic and sends actions through ctx.act.
local Screens = { panel = {}, pin = {} }

local function init(ctx)
	return ctx.state, ctx.now, ctx.L, ctx.C, ctx.S, ctx.W, ctx.T
end

local function reasonText(S, r)
	return S.f(S.reason[r.code] or r.code, { have = r.have and math.floor(r.have) or 0, need = r.need or 0 })
end
local function firstReason(S, gate)
	local r = gate.reasons[1]
	return r and reasonText(S, r) or nil
end

-- ───────── next action (Phone home) ─────────
local function nextAction(ctx)
	local st, now, L, C, S = ctx.state, ctx.now, ctx.L, ctx.C, ctx.S
	if L.claimableCount(st, now) > 0 then return { text = S.home.nextGoal, tab = "goals", btn = S.nav.goals, icon = "🎁" } end
	if not st.job then return { text = S.home.nextJob, tab = "work", btn = S.nav.work, icon = "💼" } end
	for id, slot in pairs(st.hustle) do
		if L.hustleDue(slot, id, now) then return { text = S.home.nextHustle, tab = "hustle", btn = S.nav.hustle, icon = "🎲" } end
	end
	if st.shift then return { text = S.f(S.work.decision, { a = st.shift.step + 1, b = C.SITUATIONS_PER_SHIFT }), tab = "work", btn = S.nav.work, icon = "🧠" } end
	for _, id in ipairs({ "food", "drink", "housing", "transport", "clothing" }) do
		if st.needs[id] <= 0 then return { text = S.home.nextFood, sub = S.needs[id].effect, tab = "needs", btn = S.nav.needs, icon = S.needIcon[id] } end
	end
	if st.energy >= C.SHIFT_MIN_ENERGY and now >= st.shiftReadyAt and st.sickUntil <= now and st.vacationUntil <= now then
		return { text = S.home.nextShift, tab = "work", btn = S.nav.work, icon = S.jobIcon[st.job.id] }
	end
	if st.device < #C.DEVICES then
		local g = L.deviceGate(st, st.device + 1, now)
		if g.ok then return { text = S.f(S.home.nextDevice, { name = S.devices[C.DEVICES[st.device + 1].id].name }), tab = "device", btn = S.nav.device, tag = ctx.W.fmt(C.DEVICES[st.device + 1].price), icon = "📲" } end
	end
	if st.energy < C.SHIFT_MIN_ENERGY then return { text = S.home.nextRest, tab = "work", btn = S.nav.work, icon = "😴" } end
	if next(st.companies) == nil and st.cash > 1500 then return { text = S.home.nextCompany, tab = "companies", btn = S.nav.companies, icon = "🏭" } end
	if st.cash > 500 then return { text = S.home.nextInvest, tab = "invest", btn = S.nav.invest, icon = "📈" } end
	if st.device < #C.DEVICES then
		return { text = S.f(S.home.nextSave, { name = S.devices[C.DEVICES[st.device + 1].id].name }), tab = "device", btn = S.nav.device, icon = "🐷" }
	end
	return { text = S.ui.nextNone, icon = "🌟" }
end
Screens.nextAction = nextAction

local function halfGrid(ctx, parent, items)
	local W = ctx.W
	local f = W.flow(parent)
	local w = math.floor((ctx.cw - 20 - 6) / 2)
	for i, it in ipairs(items) do
		W.stat(f, { label = it.label, value = it.value, color = it.color, sub = it.sub, icon = it.icon, size = UDim2.fromOffset(w, 64), order = i })
	end
	return f
end

-- ───────── home ─────────
local ALERT_TAB = { distress = "companies", lowEnergy = "work", needEmpty = "needs", noStock = "companies", event = "companies", sick = "work", crisis = "work", orderNear = "invest" }

local function alertText(ctx, a)
	local S, C = ctx.S, ctx.C
	local name = a.id and ((S.needs[a.id] and S.needs[a.id].name) or S.companies[a.id] or S.assets[a.id]) or ""
	if a.code == "distress" then return S.f(S.alerts.distress, { t = ctx.W.dur(a.ms) }) end
	if a.code == "event" then return S.f(S.alerts.event, { name = S.events[a.event], co = S.companies[a.id] }) end
	return S.f(S.alerts[a.code], { name = name })
end

local function tileData(ctx)
	local st, now, L, C, S, W = ctx.state, ctx.now, ctx.L, ctx.C, ctx.S, ctx.W
	local H = S.hero.tiles
	local minDays = math.huge
	for _, id in ipairs(C.NEEDS) do minDays = math.min(minDays, st.needs[id]) end
	local stock, cap, units = 0, 0, 0
	for _, c in ipairs(C.COMPANIES) do
		local n = st.companies[c.id] or 0
		if n > 0 then
			units += n
			cap += L.stockCapacity(n, st.phase)
			stock += (st.setup[c.id] and st.setup[c.id].stock or 0)
		end
	end
	local worth = math.max(1, L.netWorth(st, now))
	local pv = L.portfolioValue(st, now)
	local holdings = 0
	for _ in pairs(st.holdings) do holdings += 1 end
	local hustles, hr = 0, 0
	for _, slot in pairs(st.hustle) do hustles += 1; hr = math.max(hr, slot.round) end
	local nextDev = C.DEVICES[st.device + 1]
	local list = {
		{ tab = "work", icon = st.job and S.jobIcon[st.job.id] or "💼", color = ctx.T.color.tileA, c2 = ctx.T.color.tileD, shape = "hex", num = st.job and ("R" .. st.job.rank) or "—", title = S.nav.work, pct = st.energy / C.ENERGY_MAX, cap = S.f(H.work, { n = math.floor(st.energy) }) },
		{ tab = "needs", icon = "🍔", alert = minDays <= 0, color = ctx.T.color.tileB, c2 = ctx.T.color.tileF, shape = "circle", num = (minDays <= 0) and "!" or math.floor(minDays), title = S.nav.needs, pct = math.min(1, minDays / C.MAX_NEED_DAYS), cap = S.f(H.needs, { n = W.dec(minDays, 1) }) },
		{ tab = "companies", icon = "🏭", color = ctx.T.color.tileC, c2 = ctx.T.color.tileA, shape = "hex", num = units, title = S.nav.companies, pct = (cap > 0) and (stock / cap) or 0, cap = S.f(H.companies, { n = (cap > 0) and math.floor(100 * stock / cap) or 0 }) },
		{ tab = "invest", icon = "📈", color = ctx.T.color.tileD, c2 = ctx.T.color.tileB, shape = "circle", num = holdings, title = S.nav.invest, pct = pv / worth, cap = S.f(H.invest, { n = math.floor(100 * pv / worth) }) },
		{ tab = "hustle", icon = "🎲", color = ctx.T.color.tileE, c2 = ctx.T.color.tileF, shape = "hex", num = hustles, title = S.nav.hustle, pct = hr / C.HUSTLE_PHASES, cap = S.f(H.hustle, { a = hr, b = C.HUSTLE_PHASES }) },
	}
	local claim = L.claimableCount(st, now)
	local doneN = 0
	for _ in pairs(st.milestones) do doneN += 1 end
	table.insert(list, { tab = "goals", icon = "🎯", alert = claim > 0, color = ctx.T.color.tileG, c2 = ctx.T.color.tileC, num = claim > 0 and claim or (doneN .. "/" .. #C.MILESTONES), title = S.nav.goals, pct = doneN / #C.MILESTONES, cap = claim > 0 and S.f(S.goals.tile, { n = claim }) or S.f(S.goals.progress, { a = doneN, b = #C.MILESTONES }) })
	if nextDev then
		table.insert(list, { tab = "device", icon = "📱", color = ctx.T.color.tileF, c2 = ctx.T.color.tileA, shape = "circle", num = st.device, title = S.nav.device, pct = math.min(1, math.max(0, st.cash) / math.max(1, nextDev.price)), cap = S.f(H.device, { n = math.min(100, math.floor(100 * math.max(0, st.cash) / math.max(1, nextDev.price))) }) })
	else
		table.insert(list, { tab = "device", icon = "📱", color = ctx.T.color.tileF, c2 = ctx.T.color.tileA, shape = "circle", num = st.device, title = S.nav.device, pct = 1, cap = S.ui.max })
	end
	return list
end

function Screens.home(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local nxt = nextAction(ctx)
	local wide = ctx.cw >= 700

	-- hero (featured next step) + side panel ("friends online" slot -> what is happening in the economy)
	local top = W.new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = W.nextOrder(parent) }, parent)
	W.new("UIListLayout", { FillDirection = wide and Enum.FillDirection.Horizontal or Enum.FillDirection.Vertical, Padding = UDim.new(0, 12), SortOrder = Enum.SortOrder.LayoutOrder }, top)
	local heroW = wide and math.floor((ctx.cw - 12) * 0.62) or ctx.cw
	W.hero(top, {
		kicker = S.hero.kicker, title = nxt.text, sub = nxt.sub or S.hero.sub, price = nxt.tag or S.hero.free, h = wide and 230 or 215, icon = nxt.icon,
		size = UDim2.fromOffset(heroW, wide and 230 or 215), order = 1,
		cta = nxt.btn and S.hero.cta or nil, onCta = function() if nxt.tab then ctx.go(nxt.tab) end end,
		secondary = (nxt.tab ~= "device" and st.device < #C.DEVICES) and S.hero.secondary or nil, onSecondary = function() ctx.go("device") end,
	})
	local panelW = wide and (ctx.cw - 12 - heroW) or ctx.cw
	local panel = W.new("Frame", { Size = UDim2.fromOffset(panelW, wide and 230 or 0), AutomaticSize = wide and Enum.AutomaticSize.None or Enum.AutomaticSize.Y, BackgroundColor3 = T.color.panel, BackgroundTransparency = 0.1, BorderSizePixel = 0, LayoutOrder = 2 }, top)
	W.corner(panel, 20)
	W.stroke(panel, T.color.lineSoft, 1, 0)
	W.pad(panel, 12, 10, 12, 10)
	W.new("UIListLayout", { Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, panel)
	local live = W.label(panel, { text = "●  " .. W.upper(S.hero.panelTitle), size = UDim2.new(1, 0, 0, 16), ts = 11, color = T.color.teal, font = T.font.head, wrap = false, order = 0 })
	W.glow(live, "TextTransparency", 0, 0.35, 3)
	local alerts = L.alerts(st, now)
	local shown = 0
	for _, a in ipairs(alerts) do
		if shown >= (wide and 4 or 5) then break end
		shown += 1
		local color = (a.level == "bad") and T.color.red or ((a.level == "warn") and T.color.amber or T.color.teal)
		local row = W.new("Frame", { Size = UDim2.new(1, 0, 0, 38), BackgroundColor3 = T.color.ink, BackgroundTransparency = 0.4, BorderSizePixel = 0, LayoutOrder = shown }, panel)
		W.corner(row, 10)
		local text = alertText(ctx, a)
		local av = W.avatar(row, (a.level == "bad") and "!" or ((a.level == "warn") and "•" or "✓"), color, 28)
		av.Position = UDim2.fromOffset(6, 5)
		av.TextColor3 = T.color.creamInk
		W.label(row, { text = text, pos = UDim2.fromOffset(42, 0), size = UDim2.new(1, -118, 1, 0), ts = 12, font = T.font.caps, wrap = false, truncate = Enum.TextTruncate.AtEnd })
		W.button(row, { text = S.hero.panelOpen, variant = "ghost", w = 64, h = 24, ts = 10, pos = UDim2.new(1, -70, 0.5, -12), onClick = function() ctx.go(ALERT_TAB[a.code] or "home") end })
	end
	if shown == 0 then W.label(panel, { text = S.hero.panelEmpty, size = UDim2.new(1, 0, 0, 40), ts = 12, color = T.color.muted, font = T.font.caps, order = 1 }) end

	-- "continue" tile row
	W.label(parent, { text = W.upper(S.hero.continueTitle), size = UDim2.new(1, 0, 0, 26), ts = 16, font = T.font.display, color = T.color.text, wrap = false, order = W.nextOrder(parent) })
	local tiles = W.flow(parent)
	local data = tileData(ctx)
	local cols = (ctx.m.class == "compact") and 2 or ((ctx.cw >= 1000) and 7 or ((ctx.cw >= 700) and 4 or 3))
	local tw = math.floor((ctx.cw - 6 * (cols - 1) - 2) / cols)
	for i, td in ipairs(data) do
		W.tile(tiles, { w = tw, h = 150, icon = td.icon, alert = td.alert, color = td.color, color2 = td.c2, num = td.num, title = td.title, pct = td.pct, caption = td.cap, order = i, onClick = function() ctx.go(td.tab) end })
	end
	Screens.dailyCard(ctx, parent, true)

	local r = L.rates(st, now)
	local card = W.card(parent, { title = S.home.income, icon = "📊", right = S.f(S.home.mult, { n = W.dec(r.multiplier) }) })
	halfGrid(ctx, card, {
		{ label = S.home.salary, value = W.fmt(r.salary), color = T.color.line, icon = "💼" },
		{ label = S.home.companies, value = W.fmt(r.companies), color = T.color.line, icon = "🏭" },
		{ label = S.home.passive, value = W.fmt(r.passive), color = T.color.line, icon = "🏦" },
		{ label = S.home.costs, value = "−" .. W.fmt(r.companyCosts), color = T.color.red, icon = "🧾" },
		{ label = S.home.living, value = "−" .. W.fmt(r.living), color = T.color.amber, sub = S.needsUi.hint, icon = "🏠" },
		{ label = S.ui.income, value = W.fmt(r.net), color = (r.net >= 0) and T.color.teal or T.color.red, icon = "📈" },
	})
	local danger, left = L.distressOf(st, now)
	if danger then
		local c = W.card(parent, { title = S.co.distress, icon = "🚨", accent = T.color.red })
		W.note(c, S.f(S.co.distressText, { n = W.dur(left) }), T.color.red)
	end
	if st.sickUntil > now then W.note(W.card(parent, { title = S.work.title }), S.work.sick, T.color.amber) end
	local ev = L.currentEvent(now)
	local ae = L.currentAssetEvent(now)
	if ev or ae then
		local c = W.card(parent, { title = S.home.title, icon = "📰" })
		if ev then W.note(c, S.f(S.home.event, { name = S.events[ev.def.id] }) .. "  ×" .. W.dec(ev.def.mult, 2), ev.def.mult < 1 and T.color.red or T.color.teal) end
		if ae then W.note(c, S.f(S.home.news, { name = S.assetEvents[ae.def.id] }), T.color.line) end
	end
	card = W.card(parent, { title = S.board.record, icon = "🏆" })
	W.note(card, S.f(S.home.record, { a = W.fmt(st.best), b = st.runs }) .. " · " .. S.f(S.board.bankrupt, { n = st.bankruptcies }))
	W.row(card, {
		title = S.home.restart, sub = S.home.restartHint, cw = ctx.cw,
		actions = { { text = S.home.restart, variant = "danger", onClick = function()
			W.modal(S.home.restart, S.home.restartConfirm .. " " .. S.home.restartHint, {
				{ text = S.ui.no, variant = "ghost" },
				{ text = S.ui.yes, variant = "danger", onClick = function() ctx.act("restart") end },
			}, { icon = "♻️" })
		end } },
	})
	W.note(parent, S.legal.saveNote)
end

-- ───────── work ─────────
local function def_edu_for(C, job) return C.JOB_BY_ID[job.id].edu + job.rank end
function Screens.work(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local fx = L.needsEffects(st, now)
	local job = st.job
	local card = W.card(parent, { title = S.work.current, icon = "💼" })
	if job then
		local def = C.JOB_BY_ID[job.id]
		local nextPts = C.RANK_POINTS[job.rank + 1]
		W.row(card, { title = S.jobs[job.id], icon = S.jobIcon[job.id], highlight = T.color.brand, sub = S.f(S.work.rank, { a = job.rank, b = C.MAX_JOB_RANK }) .. " · " .. (nextPts and S.f(S.work.points, { a = job.points, b = nextPts }) or ("" .. job.points)) .. " · " .. S.f(S.work.pay, { n = W.fmt(L.jobHourly(st, now)) }), cw = ctx.cw })
		W.note(card, "⚡ " .. S.ui.energy .. "  " .. math.floor(st.energy) .. " / " .. C.ENERGY_MAX, st.energy < 30 and T.color.red or T.color.text)
		W.progress(card, st.energy / C.ENERGY_MAX, st.energy < 30 and T.color.red or T.color.teal, 8)
		if nextPts then
			W.note(card, "⭐ " .. S.f(S.work.points, { a = job.points, b = nextPts }))
			W.progress(card, job.points / nextPts, T.color.gold, 6)
		end
		if st.sickUntil > now then W.note(card, S.work.sick, T.color.amber) end
		if L.inCrisis(st, now) then W.note(card, S.work.crisis, T.color.amber) end
		if fx.noShift then W.note(card, S.work.walk, T.color.amber) end
	else
		W.note(card, S.work.noJob)
	end

	if job and st.shift then
		local sit = L.situationAt(st.shift.seed, st.shift.step)
		local txt = S.situations[sit.id]
		local sc = W.card(parent, { title = S.f(S.work.decision, { a = st.shift.step + 1, b = C.SITUATIONS_PER_SHIFT }), icon = "🧠", accent = T.color.magenta })
		W.label(sc, { text = txt.text, size = UDim2.new(1, 0, 0, 28), auto = Enum.AutomaticSize.Y, ts = 18, font = T.font.head, order = W.nextOrder(sc) })
		W.progress(sc, st.shift.step / C.SITUATIONS_PER_SHIFT, T.color.brand2, 6)
		local letters = { "A", "B", "C" }
		for i, choice in ipairs(txt.choices) do
			W.row(sc, { title = choice, icon = letters[i], cw = ctx.cw, actions = { { text = S.work.choose, variant = "primary", onClick = function() ctx.act("chooseShift", i) end } } })
		end
	elseif job then
		local cd = math.max(0, st.shiftReadyAt - now)
		local reason
		if st.sickUntil > now then reason = S.err.sick
		elseif st.vacationUntil > now then reason = S.err.vacation
		elseif cd > 0 then reason = S.f(S.work.cooldown, { n = W.dur(cd) })
		elseif st.energy < C.SHIFT_MIN_ENERGY then reason = S.err["low-energy"] end
		local ac = W.card(parent, { title = S.work.title, icon = "🗂️" })
		W.row(ac, { title = S.work.start, icon = "▶️", highlight = (not reason) and T.color.teal or nil, sub = S.f(S.work.startHint, { n = C.SHIFT_MIN_ENERGY }), cw = ctx.cw,
			actions = { { text = S.work.start, variant = "good", reason = reason, onClick = function() ctx.act("startShift", fx.noShift) end } } })
		local rreason = (now < st.restReadyAt) and S.f(S.work.cooldown, { n = W.dur(st.restReadyAt - now) }) or nil
		W.row(ac, { title = S.work.rest, icon = "😴", sub = S.work.restHint, cw = ctx.cw, actions = { { text = S.work.rest, variant = "ghost", reason = rreason, onClick = function() ctx.act("rest") end } } })
		W.row(ac, { title = S.work.vacation, icon = "🏖️", sub = S.work.vacationHint, cw = ctx.cw, actions = { { text = S.work.vacation, variant = "ghost", onClick = function() ctx.act("startVacation") end } } })
		local nextPts = C.RANK_POINTS[job.rank + 1]
		local preason
		if job.rank >= C.MAX_JOB_RANK then preason = S.err.max
		elseif nextPts and job.points < nextPts then preason = S.f(S.reason.points, { have = job.points, need = nextPts })
		elseif st.edu < def_edu_for(C, job) then preason = S.f(S.reason.edu, { have = st.edu, need = def_edu_for(C, job) }) end
		W.row(ac, { title = S.work.promo, icon = "🏅", sub = S.work.promoHint, cw = ctx.cw, actions = { { text = S.work.promo, variant = "primary", reason = preason, onClick = function() ctx.act("requestPromotion") end } } })
		W.row(ac, { title = S.work.raise, icon = "💸", sub = S.work.raiseHint, cw = ctx.cw, actions = { { text = S.work.raise, variant = "primary", reason = (now < st.raiseReadyAt) and S.f(S.work.cooldown, { n = W.dur(st.raiseReadyAt - now) }) or nil, onClick = function() ctx.act("negotiateRaise") end } } })
		if job.rank >= C.LEAD_MIN_RANK then
			W.row(ac, { title = S.work.lead, icon = "🦺", sub = S.work.leadHint, cw = ctx.cw, actions = { { text = job.lead and S.ui.no or S.ui.yes, variant = job.lead and "select" or "ghost", onClick = function() ctx.act("setLead", not job.lead) end } } })
		end
		W.row(ac, { title = S.work.quit, icon = "🚪", cw = ctx.cw, actions = { { text = S.work.quit, variant = "danger", onClick = function()
			W.modal(S.work.quit, S.jobs[job.id] .. "?", { { text = S.ui.no, variant = "ghost" }, { text = S.ui.yes, variant = "danger", onClick = function() ctx.act("quitJob") end } }, { icon = "🚪" })
		end } } })
	end

	-- education
	local ec = W.card(parent, { title = S.work.edu, icon = "🎓", right = S.f(S.work.eduPoints, { n = st.eduPoints }) })
	local cost = L.eduCost(st.edu)
	local ereason = (st.edu >= C.MAX_EDU) and S.err.max or ((st.eduPoints < cost) and S.f(S.reason.points, { have = st.eduPoints, need = cost }) or nil)
	W.row(ec, { title = S.work.edu .. " " .. st.edu .. "/" .. C.MAX_EDU, icon = "📚", sub = S.f(S.work.eduHint, { n = cost }), cw = ctx.cw,
		actions = { { text = S.work.eduBuy, variant = "good", reason = ereason, onClick = function() ctx.act("investEdu") end } } })

	if not st.shift then
		local jc = W.card(parent, { title = S.work.jobs, icon = "📋" })
		if ctx.feat.savedViews or ctx.feat.compare then
			W.segmented(jc, { { id = "", text = S.ui.all }, { id = "open", text = S.ui.available } }, ctx.ui.filter.work or "", function(id) ctx.ui.filter.work = id; ctx.rerender() end)
		end
		for _, j in ipairs(C.JOBS) do
			local g = L.jobGate(st, j.id)
			local show = (ctx.ui.filter.work ~= "open") or (st.edu >= j.edu)
			if show then
				local current = job and job.id == j.id
				W.row(jc, {
					title = S.jobs[j.id], icon = S.jobIcon[j.id], selected = current, cw = ctx.cw,
					sub = S.f(S.work.salary, { n = W.fmt(j.salary) }) .. " · " .. S.f(S.work.fee, { n = W.fmt(j.fee) }) .. " · " .. S.f(S.work.needEdu, { n = j.edu }),
					extra = (not g.ok and not current) and ("⛔ " .. (firstReason(S, g) or "")) or nil,
					actions = { { text = current and "✓" or S.work.take, variant = "primary", reason = current and S.err["same-job"] or ((not g.ok) and (firstReason(S, g) or S.err.locked) or ((st.cash < j.fee) and S.f(S.reason.cash, { have = W.fmt(st.cash), need = W.fmt(j.fee) }) or nil)), onClick = function() ctx.act("takeJob", j.id) end } },
				})
			end
		end
	end
end

-- ───────── needs ─────────
function Screens.needs(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.needsUi.title, icon = "🧺" })
	W.note(card, S.needsUi.hint .. " " .. S.f(S.needsUi.overdraft, { n = W.fmt(L.overdraft(st)) }))
	local fx = L.needsEffects(st, now)
	if fx.noShift then W.note(card, "⚠ " .. S.needsUi.transportWarn, T.color.amber) end
	if fx.bills then W.note(card, "⚠ " .. S.needsUi.billsWarn, T.color.red) end
	for _, id in ipairs(C.NEEDS) do
		local have = st.needs[id]
		local price = L.needDaily(st, id)
		local full = C.MAX_NEED_DAYS - have <= 1e-9
		W.row(card, {
			title = S.needs[id].name .. (have <= 0 and ("  " .. S.needsUi.empty) or ""), icon = S.needIcon[id], titleColor = have <= 0 and T.color.red or T.color.text, alert = have <= 0,
			sub = S.needs[id].effect, extra = S.f(S.needsUi.days, { n = W.dec(have, 1) }) .. " · " .. S.f(S.needsUi.perDay, { n = W.fmt(price) }), extraColor = T.color.line, cw = ctx.cw,
			actions = {
				{ text = S.needsUi.plus1, variant = "primary", reason = full and S.err.max or ((not L.canPayEssential(st, price)) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("buyNeed", id, 1) end },
				{ text = S.needsUi.plus7, variant = "ghost", reason = full and S.err.max or ((not L.canPayEssential(st, price)) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("buyNeed", id, C.MAX_NEED_DAYS) end },
			},
		})
		W.progress(card, have / C.MAX_NEED_DAYS, have <= 0 and T.color.red or T.color.teal, 6)
	end
	local bc = W.card(parent, { title = S.needsUi.boosts, icon = "🛍️" })
	for _, id in ipairs(C.BOOSTS) do
		local left = 0
		for _, b in ipairs(st.boosts) do if b.id == id then left = math.max(0, b.until_ - now) end end
		W.row(bc, { title = S.boosts[id], icon = (id == "cinema") and "🎬" or "🥫", sub = (left > 0) and S.f(S.ui.soon, { n = W.dur(left) }) or nil, cw = ctx.cw,
			actions = { { text = S.ui.buy .. " " .. W.fmt(L.boostPrice(st, id)), variant = "primary", reason = (not L.canPay(st, L.boostPrice(st, id))) and S.err["not-enough-cash"] or nil, onClick = function() ctx.act("buyBoost", id) end } } })
	end
end

-- ───────── companies ─────────
local function companyDetail(ctx, parent, id)
	local st, now, L, C, S, W, T = init(ctx)
	local n = st.companies[id] or 0
	local s = L.setupOf(st, id)
	local y = L.companyYield(st, id, now)
	local card = W.card(parent, { title = S.companies[id] .. " ×" .. n, icon = S.companyIcon[id], accent = T.color.magenta, right = S.f(S.co.profit, { n = W.fmt(y.gross - y.costs) }) })
	if y.strike then W.note(card, "⚠ " .. S.co.strike, T.color.red) end
	if L.currentRival(st, now) == id then W.note(card, "⚠ " .. S.co.rival, T.color.amber) end
	W.note(card, S.f(S.co.morale, { n = math.floor(y.morale * 100) }) .. (now < s.rookieUntil and (" · " .. S.co.rookies) or ""))
	if s.stock <= 0 then W.note(card, "⚠ " .. S.co.noStock, T.color.red) end
	W.progress(card, s.stock / math.max(1, L.stockCapacity(n, st.phase)), s.stock <= 0 and T.color.red or T.color.line, 8)
	W.row(card, { title = S.f(S.co.stock, { a = W.dec(s.stock, 1), b = L.stockCapacity(n, st.phase) }), icon = "📦", cw = ctx.cw,
		actions = { { text = S.co.buyStock .. " " .. W.fmt(L.batchPrice(id, now) * 5), variant = "primary", onClick = function() ctx.act("buyStock", id, 5) end } } })
	W.note(card, S.f(S.co.staff, { a = s.staff, b = n * C.MAX_STAFF_PER_UNIT }))
	for _, role in ipairs(C.STAFF_ROLES) do
		local cap = C.ROLE_MAX[role]
		local full = s.staff >= n * C.MAX_STAFF_PER_UNIT or s.roles[role] >= cap
		local ROLE_ICON = { producer = "🛠️", seller = "🤝", accountant = "🧮", manager = "👔" }
		W.row(card, { title = S.roles[role] .. " ×" .. s.roles[role], icon = ROLE_ICON[role], sub = S.ui.price .. " " .. W.fmt(L.hireCost(role)), cw = ctx.cw,
			actions = {
				{ text = "+", w = 52, variant = "primary", reason = full and S.err.max or ((not L.canPay(st, L.hireCost(role))) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("hireStaff", id, 1, role) end },
				{ text = "−", w = 52, variant = "ghost", reason = (s.roles[role] <= 0) and S.err.nothing or nil, onClick = function() ctx.act("hireStaff", id, -1, role) end },
			} })
	end
	for _, field in ipairs({ "price", "output", "risk" }) do
		local r = C.SETTING_RANGE[field]
		W.row(card, { title = S.f(S.co[field], { n = W.dec(s[field], 2) }), icon = ({ price = "🏷️", output = "⚙️", risk = "🎯" })[field], cw = ctx.cw,
			actions = {
				{ text = "−", w = 52, variant = "ghost", reason = (s[field] <= r.min + 1e-9) and S.err.max or nil, onClick = function() ctx.act("setCompanySetting", id, field, s[field] - r.step * 2) end },
				{ text = "+", w = 52, variant = "primary", reason = (s[field] >= r.max - 1e-9) and S.err.max or nil, onClick = function() ctx.act("setCompanySetting", id, field, s[field] + r.step * 2) end },
			} })
	end
	local function cant(price) return (not L.canPay(st, price)) and S.err["not-enough-cash"] or nil end
	W.row(card, { title = s.upgraded and S.co.upgraded or S.co.upgrade, icon = "⬆️", sub = "+30%", cw = ctx.cw,
		actions = { { text = S.ui.buy .. " " .. W.fmt(L.upgradePrice(st, id)), variant = "primary", reason = s.upgraded and S.err.max or cant(L.upgradePrice(st, id)), onClick = function() ctx.act("upgradeCompany", id) end } } })
	W.row(card, { title = S.co.campaign, icon = "📣", sub = (now < s.marketingUntil) and S.f(S.ui.soon, { n = W.dur(s.marketingUntil - now) }) or "+30% / 30 min", cw = ctx.cw, actions = { { text = W.fmt(L.campaignPrice(st, id)), variant = "primary", reason = (now < s.marketingUntil) and S.err.busy or cant(L.campaignPrice(st, id)), onClick = function() ctx.act("runCampaign", id) end } } })
	W.row(card, { title = S.co.contract, icon = "📝", sub = L.contractActive(st, id, now) and S.f(S.ui.soon, { n = W.dur((st.contracts[id] or now) - now) }) or "+35%", cw = ctx.cw, actions = { { text = W.fmt(L.contractPrice(st, id)), variant = "primary", reason = L.contractActive(st, id, now) and S.err.busy or cant(L.contractPrice(st, id)), onClick = function() ctx.act("signContract", id) end } } })
	local lvl = L.researchLevel(st, id)
	W.row(card, { title = S.f(S.co.research, { a = lvl, b = C.MAX_RESEARCH }), icon = "🔬", cw = ctx.cw, actions = { { text = W.fmt(L.researchPrice(st, id)), variant = "primary", reason = (lvl >= C.MAX_RESEARCH) and S.err.max or cant(L.researchPrice(st, id)), onClick = function() ctx.act("researchCompany", id) end } } })
	if s.staff >= C.UNION_MIN_STAFF then
		W.row(card, { title = S.co.union, icon = "🤝", cw = ctx.cw, actions = { { text = W.fmt(L.unionPrice(st, id)), variant = "primary", reason = (s.unionUntil > now) and S.err.busy or nil, onClick = function() ctx.act("unionDeal", id) end } } })
	end
	local ev = L.currentEvent(now)
	if ev and L.isNegativeEvent(ev.def) and L.eventAffects(ev.def, id) then
		W.row(card, { title = S.co.fund, icon = "🛡️", sub = S.events[ev.def.id], alert = true, cw = ctx.cw, actions = { { text = W.fmt(L.fundPrice(st, id)), variant = "danger", reason = (st.responses[id] == ev.window) and S.err.busy or nil, onClick = function() ctx.act("fundResponse", id) end } } })
	end
	W.row(card, { title = S.co.sell, icon = "💰", cw = ctx.cw, actions = { { text = W.fmt(L.sellPrice(st, id)), variant = "danger", onClick = function()
		W.modal(S.co.sell, S.companies[id] .. " → +" .. W.fmt(L.sellPrice(st, id)), { { text = S.ui.no, variant = "ghost" }, { text = S.ui.sell, variant = "danger", onClick = function() ctx.act("sellCompany", id) end } }, { icon = S.companyIcon[id] })
	end } } })
end

function Screens.companies(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local r = L.rates(st, now)
	local card = W.card(parent, { title = S.co.title, icon = "🏢", right = S.f(S.co.phase, { a = st.phase, b = C.MAX_PHASE }) })
	W.note(card, S.f(S.co.revenue, { n = W.fmt(r.companies) }) .. " · " .. S.f(S.co.costs, { n = W.fmt(r.companyCosts) }))
	local danger, left = L.distressOf(st, now)
	if danger then W.note(card, "⚠ " .. S.co.distress .. ": " .. S.f(S.co.distressText, { n = W.dur(left) }), T.color.red) end
	if st.lastBankruptId and now - st.lastBankruptAt < 3600000 then W.note(card, S.f(S.co.bankruptcy, { name = S.companies[st.lastBankruptId] }), T.color.red) end
	if st.phase < C.MAX_PHASE then
		local req, cost = L.phaseRequirement(st.phase + 1), L.phaseCost(st.phase + 1)
		local reason = (r.companies < req) and S.f(S.reason.cash, { have = W.fmt(r.companies), need = W.fmt(req) }) or ((not L.canPay(st, cost)) and S.err["not-enough-cash"] or nil)
		W.progress(card, r.companies / math.max(1, req), T.color.gold, 6)
		W.row(card, { title = S.co.nextPhase, icon = "🚀", sub = S.f(S.co.phaseHint, { req = W.fmt(req), cost = W.fmt(cost) }), cw = ctx.cw,
			actions = { { text = S.co.upgradePhase, variant = "good", reason = reason, onClick = function() ctx.act("upgradePhase") end } } })
	end
	local lc = W.card(parent, {})
	if ctx.feat.savedViews then
		W.segmented(lc, { { id = "", text = S.ui.all }, { id = "owned", text = S.ui.owned } }, ctx.ui.filter.companies or "", function(id) ctx.ui.filter.companies = id; ctx.rerender() end)
	end
	for _, c in ipairs(C.COMPANIES) do
		local n = st.companies[c.id] or 0
		if (ctx.ui.filter.companies ~= "owned") or n > 0 then
			local g = L.companyGate(st, c.id)
			local y = L.companyYield(st, c.id, now)
			local reason = (not g.ok) and firstReason(S, g) or ((st.cash < g.price) and S.f(S.reason.cash, { have = W.fmt(st.cash), need = W.fmt(g.price) }) or nil)
			W.row(lc, {
				title = S.f(S.co.unit, { name = S.companies[c.id], n = n }), icon = S.companyIcon[c.id], selected = (ctx.ui.company == c.id), cw = ctx.cw,
				sub = S.ui.price .. " " .. W.fmt(g.price) .. (n > 0 and (" · " .. S.f(S.co.profit, { n = W.fmt(y.gross - y.costs) })) or "") .. " · " .. S.f(S.cmp.payback, { n = c.payback }),
				extra = reason and ("⛔ " .. reason) or nil,
				actions = (function()
					local a = { { text = S.ui.buy, variant = "primary", reason = reason, onClick = function() ctx.act("buyCompany", c.id) end } }
					if n > 0 then table.insert(a, { text = (ctx.ui.company == c.id) and S.ui.close or S.co.manage, variant = "ghost", onClick = function() ctx.ui.company = (ctx.ui.company ~= c.id) and c.id or nil; ctx.rerender() end }) end
					return a
				end)(),
			})
		end
	end
	if ctx.ui.company and (st.companies[ctx.ui.company] or 0) > 0 then companyDetail(ctx, parent, ctx.ui.company) end
end

-- ───────── invest ─────────
local ORDER_KINDS = {
	{ id = "buyBelow", side = "buy", when = "below", key = "orderBuyBelow", pcts = { -0.03, -0.05, -0.1 } },
	{ id = "sellAbove", side = "sell", when = "above", key = "orderSellAbove", pcts = { 0.03, 0.05, 0.1 } },
	{ id = "sellBelow", side = "sell", when = "below", key = "orderSellBelow", pcts = { -0.03, -0.05, -0.1 } },
	{ id = "buyAbove", side = "buy", when = "above", key = "orderBuyAbove", pcts = { 0.03, 0.05, 0.1 } },
}

local function assetRow(ctx, parent, a, opts)
	local st, now, L, C, S, W, T = init(ctx)
	opts = opts or {}
	local price = L.assetPrice(a.id, now, st.startedAt)
	local have = st.holdings[a.id] or 0
	local locked = L.isLocked(st, "asset", a.id)
	local sub = S.f(S.inv.price, { n = W.fmt(price) }) .. " · " .. S.f(S.inv.yield, { n = W.dec(a.yield * 100, 1) })
	local extra
	if have > 0 then extra = S.f(S.inv.own, { q = W.dec(have, 2), v = W.fmt(have * price) }) .. " · " .. S.f(S.inv.pnl, { n = W.fmt(have * (price - (st.cost[a.id] or price))) }) end
	local watched = false
	for _, id in ipairs(st.watch) do if id == a.id then watched = true end end
	local lockText = locked and S.inv.locked or nil
	local actions = {
		{ text = S.f(S.inv.buy10, {}), variant = "primary", reason = lockText or ((st.cash < 1) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("buyAsset", a.id, st.cash * 0.1) end },
		{ text = S.inv.buyAll, variant = "ghost", reason = lockText or ((st.cash < 1) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("buyAsset", a.id, st.cash) end },
		{ text = S.inv.sellHalf, variant = "ghost", reason = (have <= 0) and S.err.nothing or nil, onClick = function() ctx.act("sellAsset", a.id, 0.5) end },
		{ text = S.inv.sellAll, variant = "danger", reason = (have <= 0) and S.err.nothing or nil, onClick = function() ctx.act("sellAsset", a.id, 1) end },
	}
	if opts.compact then actions = { actions[1], actions[4] } end
	if ctx.feat.watchlist then table.insert(actions, { text = watched and "★" or "☆", w = 48, variant = watched and "select" or "ghost", onClick = function() ctx.act("toggleWatch", a.id) end }) end
	table.insert(actions, { text = "⚙", w = 48, variant = (ctx.ui.orderAsset == a.id) and "select" or "ghost", onClick = function() ctx.ui.orderAsset = (ctx.ui.orderAsset ~= a.id) and a.id or nil; ctx.rerender() end })
	W.row(parent, { title = S.assets[a.id], icon = S.assetCatIcon[a.cat], sub = sub, extra = extra, extraColor = T.color.line, selected = (ctx.ui.orderAsset == a.id), cw = ctx.cw, actions = actions })
end
Screens.assetRow = assetRow

local function orderComposer(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local id = ctx.ui.orderAsset
	local card = W.card(parent, { title = S.inv.orders .. ": " .. S.assets[id], icon = "🎯", accent = T.color.magenta })
	W.note(card, S.inv.orderHint)
	local price = L.assetPrice(id, now, st.startedAt)
	W.note(card, S.f(S.inv.price, { n = W.fmt(price) }))
	for _, k in ipairs(ORDER_KINDS) do
		local f = W.flow(card)
		W.label(f, { text = S.inv[k.key], size = UDim2.new(1, 0, 0, 18), ts = 12, color = T.color.muted })
		for _, pct in ipairs(k.pcts) do
			local limit = price * (1 + pct)
			local reason
			if k.side == "sell" and (st.holdings[id] or 0) <= 0 then reason = S.err.nothing
			elseif #st.orders >= C.MAX_ORDERS then reason = S.f(S.inv.orderMax, { n = C.MAX_ORDERS }) end
			W.button(f, { text = string.format("%+d%% · %s", math.round(pct * 100), W.fmt(limit)), variant = "ghost", w = 150, reason = reason, onClick = function()
				ctx.act("placeOrder", { asset = id, side = k.side, when = k.when, price = limit, amount = math.max(1, st.cash * 0.25), share = 1 })
			end })
		end
	end
end

function Screens.invest(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local pv = L.portfolioValue(st, now)
	local card = W.card(parent, { title = S.inv.title, icon = "📈", right = S.inv.portfolio .. " " .. W.fmt(pv) })
	local ae = L.currentAssetEvent(now)
	if ae then W.note(card, "📰 " .. S.assetEvents[ae.def.id] .. "  ×" .. W.dec(ae.def.mult, 2), ae.def.mult < 1 and T.color.red or T.color.teal) end
	W.note(card, S.inv.startupWarn)
	local opts = { { id = "", text = S.ui.all } }
	for _, cat in ipairs(C.ASSET_CATEGORIES) do table.insert(opts, { id = cat, text = S.assetCats[cat] }) end
	table.insert(opts, { id = "owned", text = S.ui.owned })
	W.segmented(card, opts, ctx.ui.filter.invest or "", function(id) ctx.ui.filter.invest = id; ctx.rerender() end)
	if ctx.ui.orderAsset then orderComposer(ctx, parent) end
	local f = ctx.ui.filter.invest or ""
	local cur
	local list
	for _, a in ipairs(C.ASSETS) do
		local show = (f == "") or (f == a.cat) or (f == "owned" and (st.holdings[a.id] or 0) > 0)
		if show then
			if a.cat ~= cur then cur = a.cat; list = W.card(parent, { title = S.assetCats[a.cat], icon = S.assetCatIcon[a.cat] }) end
			assetRow(ctx, list, a)
		end
	end
	if #st.orders > 0 then
		local oc = W.card(parent, { title = S.inv.orders .. " (" .. #st.orders .. "/" .. C.MAX_ORDERS .. ")", icon = "📑" })
		for _, o in ipairs(st.orders) do
			W.row(oc, { title = S.sides[o.side] .. " " .. S.assets[o.asset], sub = S.sides[o.when] .. " " .. W.fmt(o.price), cw = ctx.cw,
				actions = { { text = S.inv.orderCancel, variant = "danger", onClick = function() ctx.act("cancelOrder", o.id) end } } })
		end
	end
	local arb = W.card(parent, { title = S.inv.arb, icon = "⚖️" })
	local spread = L.arbitrageSpread(now) * 100
	W.note(arb, S.inv.arbHint .. " " .. S.f(S.inv.spread, { n = W.dec(spread, 2) }))
	local amount = math.min(st.cash, L.arbitrageLimit(st))
	local reason
	if now < st.arbReadyAt then reason = S.f(S.work.cooldown, { n = W.dur(st.arbReadyAt - now) })
	elseif amount < 1 then reason = S.err["not-enough-cash"]
	elseif L.arbitrageSpread(now) - C.ARB_FEE <= 0 then reason = S.err["no-spread"] end
	W.row(arb, { title = S.f(S.inv.arbRun, { n = W.fmt(amount) }), cw = ctx.cw, actions = { { text = S.inv.arb, variant = "good", reason = reason, onClick = function() ctx.act("arbitrage", amount) end } } })
	if #st.news > 0 then
		local nc = W.card(parent, { title = S.inv.log, icon = "🗞️" })
		for i = #st.news, math.max(1, #st.news - 6), -1 do
			local n = st.news[i]
			W.note(nc, S.news[n.kind] .. " · " .. S.assets[n.asset] .. " · " .. W.fmt(n.amount), (n.kind == "startup-krach" or n.kind == "order-failed") and T.color.red or T.color.teal)
		end
	end
end

-- ───────── hustle ─────────
function Screens.hustle(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.hu.title, icon = "🎲" })
	W.note(card, S.hu.hint)
	for _, h in ipairs(C.HUSTLES) do
		local slot = st.hustle[h.id]
		if not slot then
			local g = L.hustleGate(st, h.id)
			local reason = (not g.ok) and firstReason(S, g) or nil
			W.row(card, { title = S.hustles[h.id], icon = S.hustleIcon[h.id], sub = S.f(S.hu.stake, { n = W.fmt(h.cost) }) .. " · " .. S.f(S.hu.experience, { a = st.knowledge[h.id] or 0, b = C.HUSTLE_MAX_EXPERIENCE }) .. " · " .. S.f(S.hu.needEdu, { n = h.edu }), extra = reason and ("⛔ " .. reason) or nil, cw = ctx.cw,
				actions = { { text = S.hu.start, variant = "good", reason = reason, onClick = function() ctx.act("startHustle", h.id, h.cost) end } } })
		else
			local c = W.card(parent, { title = S.hustles[h.id], icon = S.hustleIcon[h.id], accent = T.color.magenta, right = S.f(S.hu.round, { a = slot.round + 1, b = C.HUSTLE_PHASES }) })
			W.note(c, S.f(S.hu.value, { n = W.fmt(slot.value) }) .. " · " .. S.f(S.hu.stake, { n = W.fmt(slot.stake) }), slot.value >= slot.stake and T.color.teal or T.color.red)
			W.progress(c, slot.round / C.HUSTLE_PHASES, T.color.brand2, 6)
			if L.hustleDue(slot, h.id, now) then
				local hint = L.hustleHint(slot, h.id, st.knowledge[h.id] or 0)
				if hint ~= nil then W.note(c, hint and S.hu.hintUp or S.hu.hintDown, T.color.line) end
				for _, ch in ipairs(L.hustleChoices(slot, h.id)) do
					W.row(c, { title = (ch.event and (S.hu.opportunity .. " ★ ") or "") .. S.f(S.hu.option, { n = ch.index }), icon = ch.event and "✨" or ({ "A", "B", "C" })[ch.index], highlight = ch.event and T.color.gold or nil, sub = S.f(S.hu.range, { lo = W.dec(ch.lo), hi = W.dec(ch.hi) }) .. " · " .. S.f(S.hu.cost, { n = math.round(ch.cost * 100) }), cw = ctx.cw,
						actions = { { text = S.work.choose, variant = ch.event and "select" or "primary", onClick = function() ctx.act("decideHustle", h.id, ch.index) end } } })
				end
			else
				W.note(c, S.f(S.hu.opens, { n = W.dur(L.hustleRoundAt(slot, h.id, slot.round) - now) }), T.color.amber)
			end
			local amt = math.max(1, math.floor(h.cost / 2))
			W.row(c, { title = S.f(S.hu.topUp, { n = W.fmt(amt) }), cw = ctx.cw, actions = { { text = "+", w = 56, variant = "ghost", reason = (st.cash < amt) and S.err["not-enough-cash"] or nil, onClick = function() ctx.act("topUpHustle", h.id, amt) end } } })
		end
	end
end

-- ───────── board ─────────
function Screens.board(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.board.title, icon = "🏆" })
	W.note(card, S.f(S.board.best, { n = W.fmt(st.best) }) .. " · " .. S.f(S.board.runs, { n = st.runs }))
	local data = ctx.ui.board
	if not data or #data == 0 then W.note(card, S.board.empty) return end
	local rows = {}
	local medal = { "🥇", "🥈", "🥉" }
	for _, e in ipairs(data) do table.insert(rows, { (medal[e.rank] or ("#" .. e.rank)), e.name, W.fmt(e.value) }) end
	W.table(card, { S.board.rank, S.board.player, S.board.record }, rows, ctx.cw)
end

-- ───────── device shop ─────────
local function reqLines(ctx, d)
	local st, now, L, C, S, W = init(ctx)
	local out = {}
	local req = d.req
	if req.shifts then table.insert(out, { text = S.f(S.reason.shifts, { have = st.stats.shifts or 0, need = req.shifts }), ok = (st.stats.shifts or 0) >= req.shifts }) end
	if req.edu then table.insert(out, { text = S.f(S.reason.edu, { have = st.edu, need = req.edu }), ok = st.edu >= req.edu }) end
	if req.netWorth then local nw = L.netWorth(st, now); table.insert(out, { text = S.f(S.reason.netWorth, { have = W.fmt(nw), need = W.fmt(req.netWorth) }), ok = nw >= req.netWorth }) end
	if req.companies then
		local n = 0
		for _, c in ipairs(C.COMPANIES) do n += st.companies[c.id] or 0 end
		table.insert(out, { text = S.f(S.reason.companies, { have = n, need = req.companies }), ok = n >= req.companies })
	end
	return out
end

local DEV_ICON = { phone = "📱", ipad = "📲", laptop = "💻", pc = "🖥️" }
function Screens.device(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.deviceUi.title, icon = "📱" })
	W.note(card, S.deviceUi.note)
	for tier, d in ipairs(C.DEVICES) do
		local info = S.devices[d.id]
		local owned = tier <= st.device
		local isNext = tier == st.device + 1
		local c = W.card(parent, { title = info.name .. " · " .. info.tag, icon = DEV_ICON[d.id], accent = owned and T.color.teal or (isNext and T.color.magenta or T.color.lineDim), right = owned and ("✓ " .. S.deviceUi.owned) or W.fmt(d.price) })
		W.note(c, info.desc, T.color.text)
		W.note(c, S.deviceUi.benefits .. ":", T.color.line)
		local order = { "splitView", "watchlist", "upcoming", "compare", "savedViews", "quickActions", "pinnedCards", "history", "alerts" }
		local limitFor = { watchlist = d.limits.watch, savedViews = d.limits.views, pinnedCards = d.limits.pins }
		local any = false
		for _, k in ipairs(order) do
			if d.features[k] then
				local prev = C.DEVICES[tier - 1]
				if not (prev and prev.features[k]) or limitFor[k] ~= nil and prev and limitFor[k] ~= ({ watchlist = prev.limits.watch, savedViews = prev.limits.views, pinnedCards = prev.limits.pins })[k] then
					any = true
					W.note(c, "• " .. S.f(S.deviceFeatures[k], { n = limitFor[k] }), T.color.text)
				end
			end
		end
		if not any and tier == 1 then W.note(c, "• " .. S.devices.phone.tag, T.color.text) end
		if isNext then
			W.note(c, S.deviceUi.requirements .. ":", T.color.line)
			for _, r in ipairs(reqLines(ctx, d)) do W.note(c, (r.ok and "✓ " or "✗ ") .. r.text, r.ok and T.color.teal or T.color.amber) end
			local after = st.cash - d.price
			local days = after / math.max(1, L.livingCost(st) * 24)
			W.note(c, S.f(S.deviceUi.afterLine, { a = S.ui.cash, b = W.fmt(st.cash), c = W.fmt(after), d = W.dec(math.max(0, days), 1) }), after < 0 and T.color.red or T.color.text)
			local g = L.deviceGate(st, tier, now)
			local reason = (not g.ok) and firstReason(S, g) or nil
			W.row(c, { title = S.f(S.deviceUi.buy, { n = W.fmt(d.price) }), cw = ctx.cw,
				actions = { { text = S.ui.buy, variant = "good", reason = reason, onClick = function()
					W.modal(S.deviceUi.title, S.f(S.deviceUi.confirm, { name = info.name, price = W.fmt(d.price), cash = S.ui.cash, before = W.fmt(st.cash), after = W.fmt(st.cash - d.price) }), {
						{ text = S.ui.no, variant = "ghost" },
						{ text = S.ui.buy, variant = "good", onClick = function() ctx.act("buyDevice", tier) end },
					}, { icon = DEV_ICON[d.id] })
				end } } })
		end
	end
end

-- ───────── compare workspace (laptop+) ─────────
local function cmpItems(ctx, kind)
	local st, now, L, C, S, W = init(ctx)
	local out = {}
	if kind == "jobs" then
		for _, j in ipairs(C.JOBS) do table.insert(out, { id = j.id, name = S.jobs[j.id] }) end
	elseif kind == "companies" then
		for _, c in ipairs(C.COMPANIES) do table.insert(out, { id = c.id, name = S.companies[c.id] }) end
	else
		for _, a in ipairs(C.ASSETS) do table.insert(out, { id = a.id, name = S.assets[a.id] }) end
	end
	return out
end

function Screens.compare(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local ui = ctx.ui
	local card = W.card(parent, { title = S.cmp.title, icon = "⚖️" })
	W.note(card, S.cmp.hint)
	W.segmented(card, { { id = "jobs", text = S.cmp.jobs }, { id = "companies", text = S.cmp.companies }, { id = "assets", text = S.cmp.assets } }, ui.cmpKind, function(id)
		ui.cmpKind = id; ui.cmpSel = {}; ctx.rerender()
	end)
	local kind = ui.cmpKind
	local sel = ui.cmpSel
	local function selected(id) for _, v in ipairs(sel) do if v == id then return true end end return false end
	if #sel == 0 then W.note(card, S.cmp.pick) end
	if #sel > 0 then
		local headers = { S.cmp.metric }
		local rows = {}
		local function add(label, fn) local r = { label }; for _, id in ipairs(sel) do table.insert(r, fn(id)) end; table.insert(rows, r) end
		for _, id in ipairs(sel) do table.insert(headers, (kind == "jobs" and S.jobs[id]) or (kind == "companies" and S.companies[id]) or S.assets[id]) end
		if kind == "jobs" then
			add(S.cmp.salaryCol, function(id) return W.fmt(C.JOB_BY_ID[id].salary) end)
			add(S.cmp.feeCol, function(id) return W.fmt(C.JOB_BY_ID[id].fee) end)
			add(S.cmp.eduCol, function(id) return C.JOB_BY_ID[id].edu end)
			add(S.cmp.netPay, function(id) local ch = st.character; return W.fmt(C.JOB_BY_ID[id].salary * C.COUNTRY_DEF[ch.country].salary * C.CITY_DEF[ch.city].salary * (1 - C.PERSONAL_TAX)) end)
			add(S.cmp.unlocked, function(id) return (st.edu >= C.JOB_BY_ID[id].edu) and "✓" or "✗" end)
		elseif kind == "companies" then
			add(S.cmp.priceCol, function(id) return W.fmt(L.companyPrice(st, id)) end)
			add(S.cmp.paybackCol, function(id) return W.dec(C.COMPANY_BY_ID[id].payback, 1) end)
			add(S.cmp.incomeCol, function(id) return W.fmt(L.companyIncome(id)) end)
			add(S.ui.owned, function(id) return st.companies[id] or 0 end)
			add(S.cmp.unlocked, function(id) return L.isLocked(st, "company", id) and "✗" or "✓" end)
		else
			add(S.cmp.priceCol, function(id) return W.fmt(L.assetPrice(id, now, st.startedAt)) end)
			add(S.cmp.yieldCol, function(id) return W.dec(C.ASSET_BY_ID[id].yield * 100, 1) .. "%" end)
			add(S.cmp.driftCol, function(id) return W.dec(C.ASSET_BY_ID[id].drift * 100, 1) .. "%" end)
			add(S.cmp.volCol, function(id) return "±" .. W.dec(C.ASSET_BY_ID[id].vol * 100, 0) .. "%" end)
			add(S.ui.owned, function(id) return W.dec(st.holdings[id] or 0, 2) end)
		end
		W.table(card, headers, rows, ctx.cw)
	end
	local lc = W.card(parent, {})
	for _, it in ipairs(cmpItems(ctx, kind)) do
		local on = selected(it.id)
		local icon = (kind == "jobs" and S.jobIcon[it.id]) or (kind == "companies" and S.companyIcon[it.id]) or S.assetCatIcon[C.ASSET_BY_ID[it.id].cat]
		W.row(lc, { title = it.name, icon = icon, selected = on, cw = ctx.cw, actions = { { text = on and S.cmp.remove or S.cmp.add, variant = on and "danger" or "primary", reason = (not on and #sel >= 3) and S.err.max or nil, onClick = function()
			if on then for i, v in ipairs(sel) do if v == it.id then table.remove(sel, i) break end end else table.insert(sel, it.id) end
			ctx.rerender()
		end } } })
	end
end

-- ───────── history (PC) ─────────
function Screens.history(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.hist.title, icon = "🕘" })
	local w, p = {}, {}
	for _, h in ipairs(st.history) do table.insert(w, h.w); table.insert(p, h.p) end
	W.note(card, S.hist.worth, T.color.line)
	local _, lo, hi = W.chart(card, w, T.color.teal, 110, { none = S.hist.none })
	if lo then W.note(card, S.f(S.hist.minLabel, { n = W.fmt(lo) }) .. " · " .. S.f(S.hist.maxLabel, { n = W.fmt(hi) }) .. " · " .. S.f(S.hist.nowLabel, { n = W.fmt(L.netWorth(st, now)) })) end
	W.note(card, S.hist.portfolio, T.color.line)
	W.chart(card, p, T.color.line, 80, { none = S.hist.none })
	local nc = W.card(parent, { title = S.hist.log, icon = "🗞️" })
	if #st.news == 0 then W.note(nc, S.hist.none) end
	for i = #st.news, 1, -1 do
		local n = st.news[i]
		W.note(nc, S.news[n.kind] .. " · " .. S.assets[n.asset] .. " · " .. W.fmt(n.amount), (n.kind == "startup-krach" or n.kind == "order-failed") and T.color.red or T.color.teal)
	end
	local dc = W.card(parent, { title = S.hist.devices, icon = "📱" })
	if #st.deviceLog == 0 then W.note(dc, S.devices.phone.name .. " · " .. S.ui.free) end
	for _, d in ipairs(st.deviceLog) do W.note(dc, S.devices[C.DEVICES[d.tier].id].name .. " · " .. W.fmt(d.price)) end
end

-- ───────── side panels (iPad+) ─────────
function Screens.panel.watch(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.watch, icon = "⭐", right = #st.watch .. "/" .. C.DEVICES[st.device].limits.watch })
	if #st.watch == 0 then W.note(card, S.panel.noWatch) end
	for _, id in ipairs(st.watch) do assetRow(ctx, card, C.ASSET_BY_ID[id], { compact = true }) end
end

local function dur(ctx, ms) return ctx.W.dur(ms) end
function Screens.panel.upcoming(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.upcoming, icon = "📅" })
	local list = L.upcoming(st, now)
	if #list == 0 then W.note(card, S.panel.empty) end
	for i, u in ipairs(list) do
		if i > 6 then break end
		local text
		if u.kind == "need" then text = (u.inMs <= 0) and S.f(S.panel.needNow, { name = S.needs[u.id].name }) or S.f(S.panel.needIn, { name = S.needs[u.id].name, t = dur(ctx, u.inMs) })
		else text = S.f(S.panel.stockIn, { name = S.companies[u.id], t = dur(ctx, u.inMs) }) end
		W.note(card, text .. " · " .. W.fmt(u.amount), (u.inMs <= 0) and T.color.red or T.color.text)
	end
end

function Screens.panel.projects(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.projects, icon = "🧩" })
	local list = L.projects(st, now)
	if #list == 0 then W.note(card, S.panel.empty) end
	for _, p in ipairs(list) do
		if p.kind == "shift" then W.note(card, S.f(S.panel.shiftActive, { n = p.step + 1 }), T.color.text)
		elseif p.kind == "hustle" then
			W.note(card, p.due and S.f(S.panel.hustleDue, { name = S.hustles[p.id] }) or S.f(S.panel.hustleIn, { name = S.hustles[p.id], t = dur(ctx, p.inMs) }), p.due and T.color.amber or T.color.text)
		else
			local o = p.order
			W.note(card, S.f(S.panel.orderLine, { side = S.sides[o.side], name = S.assets[o.asset], price = S.sides[o.when] .. " " .. W.fmt(o.price) }))
		end
	end
end

function Screens.panel.alerts(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.alerts, icon = "🔔" })
	local list = L.alerts(st, now)
	if #list == 0 then W.note(card, S.panel.empty) end
	for _, a in ipairs(list) do
		local color = (a.level == "bad") and T.color.red or ((a.level == "warn") and T.color.amber or T.color.teal)
		local name = a.id and (S.needs[a.id] and S.needs[a.id].name or S.companies[a.id] or S.assets[a.id]) or ""
		local text
		if a.code == "distress" then text = S.f(S.alerts.distress, { t = dur(ctx, a.ms) })
		elseif a.code == "event" then text = S.f(S.alerts.event, { name = S.events[a.event], co = S.companies[a.id] })
		else text = S.f(S.alerts[a.code], { name = name }) end
		W.note(card, "● " .. text, color)
	end
end

-- Pinned cards (PC): configurable list stored on the server (validated against device limits)
function Screens.pin.cash(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.ui.cash, value = W.fmt(ctx.state.cash), color = T.color.teal }) end
function Screens.pin.netWorth(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.ui.netWorth, value = W.fmt(ctx.L.netWorth(ctx.state, ctx.now)), color = T.color.line }) end
function Screens.pin.income(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; local r = ctx.L.rates(ctx.state, ctx.now); W.stat(p, { label = S.ui.income, value = W.fmt(r.net), color = r.net >= 0 and T.color.teal or T.color.red }) end
function Screens.pin.energy(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.ui.energy, value = math.floor(ctx.state.energy) .. "/" .. ctx.C.ENERGY_MAX, color = ctx.state.energy < 30 and T.color.red or T.color.teal }) end
function Screens.pin.needs(ctx, p)
	local W, S, T, C = ctx.W, ctx.S, ctx.T, ctx.C
	local empty = 0
	local minDays = math.huge
	for _, id in ipairs(C.NEEDS) do if ctx.state.needs[id] <= 0 then empty += 1 end; minDays = math.min(minDays, ctx.state.needs[id]) end
	W.stat(p, { label = S.preset.needs, value = empty > 0 and (empty .. " " .. S.needsUi.empty) or W.dec(minDays, 1) .. " d", color = empty > 0 and T.color.red or T.color.teal })
end
function Screens.pin.companies(ctx, p)
	local W, S, T, C, L = ctx.W, ctx.S, ctx.T, ctx.C, ctx.L
	local n, profit = 0, 0
	for _, c in ipairs(C.COMPANIES) do
		local k = ctx.state.companies[c.id] or 0
		if k > 0 then n += k; local y = L.companyYield(ctx.state, c.id, ctx.now); profit += y.gross - y.costs end
	end
	W.stat(p, { label = S.preset.companies, value = tostring(n), sub = W.fmt(profit) .. " " .. S.preset.perYear, color = T.color.line })
end
function Screens.pin.portfolio(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.preset.portfolio, value = W.fmt(ctx.L.portfolioValue(ctx.state, ctx.now)), color = T.color.line }) end
function Screens.pin.projects(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.preset.projects, value = tostring(#ctx.L.projects(ctx.state, ctx.now)), color = T.color.amber }) end
function Screens.pin.hustle(ctx, p)
	local W, S, T = ctx.W, ctx.S, ctx.T
	local due = 0
	for id, slot in pairs(ctx.state.hustle) do if ctx.L.hustleDue(slot, id, ctx.now) then due += 1 end end
	W.stat(p, { label = S.preset.hustle, value = tostring(due), sub = S.preset.waiting, color = due > 0 and T.color.amber or T.color.muted })
end
function Screens.pin.events(ctx, p)
	local W, S, T = ctx.W, ctx.S, ctx.T
	local ev = ctx.L.currentEvent(ctx.now)
	W.stat(p, { label = S.preset.events, value = ev and S.events[ev.def.id] or "—", color = ev and (ev.def.mult < 1 and T.color.red or T.color.teal) or T.color.muted, ts = 16 })
end

function Screens.panel.pinned(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local limit = C.DEVICES[st.device].limits.pins
	local card = W.card(parent, { title = S.panel.pinned, icon = "📌", right = #st.pins .. "/" .. limit })
	local flow = W.flow(card)
	local w = math.floor((ctx.sideW or ctx.cw) / 2) - 18
	for i, id in ipairs(st.pins) do
		local holder = W.new("Frame", { Size = UDim2.fromOffset(math.max(120, w), 62), BackgroundTransparency = 1, LayoutOrder = i }, flow)
		local inner = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1 }, holder)
		W.new("UIListLayout", {}, inner)
		if Screens.pin[id] then Screens.pin[id](ctx, inner) end
	end
	if #st.pins == 0 then W.note(card, S.panel.empty) end
	W.button(card, { text = ctx.ui.pinEdit and S.ui.done or S.ui.edit, variant = ctx.ui.pinEdit and "select" or "ghost", w = 100, onClick = function() ctx.ui.pinEdit = not ctx.ui.pinEdit; ctx.rerender() end })
	if ctx.ui.pinEdit then
		local fl = W.flow(card)
		for i, id in ipairs(C.PIN_CARDS) do
			local on = false
			for _, v in ipairs(st.pins) do if v == id then on = true end end
			W.button(fl, { text = S.preset[id], variant = on and "select" or "ghost", w = 110, order = i, onClick = function()
				local list = {}
				for _, v in ipairs(st.pins) do if v ~= id then table.insert(list, v) end end
				if not on then table.insert(list, id) end
				ctx.act("setPins", list)
			end })
		end
	end
end

-- Compact toolbar (laptop+): quick actions on the left, saved views on the right. Horizontal scroll, never clips.
function Screens.toolbar(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local feat = ctx.feat
	local n = 0
	local function nextN() n += 1 return n end
	local function tag(text)
		local l = W.label(parent, { text = W.upper(text), size = UDim2.fromOffset(12 + #text * 7.5, ctx.m.btnH), ts = 11, font = T.font.head, color = T.color.muted, wrap = false, align = Enum.TextXAlignment.Center })
		l.LayoutOrder = nextN()
	end
	if feat.quickActions then
		tag(S.quick.title)
		local shiftReason
		if not st.job then shiftReason = S.err["no-job"]
		elseif st.shift then shiftReason = nil
		elseif st.sickUntil > now then shiftReason = S.err.sick
		elseif now < st.shiftReadyAt then shiftReason = S.f(S.work.cooldown, { n = W.dur(st.shiftReadyAt - now) })
		elseif st.energy < C.SHIFT_MIN_ENERGY then shiftReason = S.err["low-energy"] end
		local fx = L.needsEffects(st, now)
		W.button(parent, { text = st.shift and S.work.choose or S.quick.shift, icon = "▶", variant = "good", w = 120, order = nextN(), reason = shiftReason, onClick = function()
			if st.shift then ctx.go("work") else ctx.act("startShift", fx.noShift) end
		end })
		W.button(parent, { text = S.quick.rest, icon = "😴", variant = "ghost", w = 110, order = nextN(), reason = (now < st.restReadyAt) and S.err.cooldown or nil, onClick = function() ctx.act("rest") end })
		W.button(parent, { text = S.quick.food, icon = "🍔", variant = "primary", w = 130, order = nextN(), reason = (st.needs.food >= C.MAX_NEED_DAYS - 1e-9) and S.err.max or nil, onClick = function() ctx.act("buyNeed", "food", 1) end })
		W.button(parent, { text = S.quick.sellAll, icon = "📈", variant = "ghost", w = 140, order = nextN(), onClick = function() ctx.go("invest") end })
	end
	if feat.savedViews then
		local limit = C.DEVICES[st.device].limits.views
		tag(S.views.title .. " " .. #st.views .. "/" .. limit)
		for i, v in ipairs(st.views) do
			W.button(parent, { text = v.name, variant = "primary", w = math.max(90, 16 + #v.name * 7), order = nextN(), onClick = function() ctx.ui.filter[v.tab] = v.filter; ctx.go(v.tab) end })
			W.button(parent, { text = "×", variant = "danger", w = 34, order = nextN(), onClick = function() ctx.act("deleteView", i) end })
		end
		W.button(parent, { text = S.views.save, variant = "good", w = 140, order = nextN(), reason = (#st.views >= limit) and S.f(S.views.limit, { n = limit }) or nil, onClick = function()
			ctx.act("saveView", S.f(S.views.name, { n = #st.views + 1 }) .. " · " .. S.nav[ctx.ui.tab], { tab = ctx.ui.tab, filter = ctx.ui.filter[ctx.ui.tab] or "" })
		end })
	end
end

-- ───────── goals: daily reward + milestones ─────────
function Screens.dailyCard(ctx, parent, compact)
	local st, now, L, C, S, W, T = init(ctx)
	local ready = L.dailyReady(st, now)
	if compact and not ready then return end
	local streak = ready and L.dailyNextStreak(st, now) or (st.dailyStreak or 0)
	local card = W.card(parent, { title = S.goals.daily, icon = "🎁", accent = ready and T.color.gold or nil, right = S.f(S.goals.streak, { n = streak }), rightColor = T.color.gold })
	if not compact then W.note(card, S.f(S.goals.dailyHint, { n = C.DAILY_MAX_STREAK })) end
	-- streak track: one pip per day, the claimable day glows
	local track = W.flow(card)
	for d = 1, C.DAILY_MAX_STREAK do
		local done = d < streak or (d == streak and not ready)
		local today = ready and d == streak
		local pip = W.new("TextLabel", { Size = UDim2.fromOffset(40, 46), BackgroundColor3 = done and T.color.gold or (today and T.color.raised or T.color.ink), BackgroundTransparency = done and 0.1 or 0.2, Text = (done and "✓" or tostring(d)) .. "\n" .. W.fmt(L.dailyReward(st, d)), Font = T.font.head, TextSize = 10, TextColor3 = done and T.color.creamInk or T.color.text, LayoutOrder = d, BorderSizePixel = 0 }, track)
		W.corner(pip, 10)
		if today then
			local stp = W.stroke(pip, T.color.gold, 2)
			W.glow(stp, "Transparency", 0, 0.6, 4)
		end
	end
	if ready then
		local reward = L.dailyReward(st, streak)
		W.button(card, { text = S.f(S.goals.dailyClaim, { n = W.fmt(reward) }), icon = "🎁", variant = "gold", w = math.min(ctx.cw - 28, 260), order = W.nextOrder(card), onClick = function() ctx.act("claimDaily") end })
	else
		W.note(card, S.f(S.goals.dailyNext, { t = W.dur(st.dailyAt + C.DAILY_COOLDOWN_MS - now) }))
	end
end

local KIND_ICON = { shifts = "💼", rank = "🏅", edu = "🎓", companies = "🏭", phase = "🚀", hustles = "🎲", portfolio = "📈", netWorth = "💎", device = "📱" }
function Screens.goals(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	Screens.dailyCard(ctx, parent, false)
	local list = L.milestoneList(st, now)
	local claimable, open, finished = {}, {}, {}
	for _, it in ipairs(list) do
		if it.claimed then table.insert(finished, it) elseif it.done then table.insert(claimable, it) else table.insert(open, it) end
	end
	table.sort(open, function(a, b) return (a.have / a.def.target) > (b.have / b.def.target) end)
	local card = W.card(parent, { title = S.goals.title, icon = "🎯", right = S.f(S.goals.progress, { a = #finished, b = #list }) })
	W.note(card, S.goals.hint)
	W.progress(card, #finished / math.max(1, #list), T.color.gold, 8)
	local function target(it)
		local k = it.def.kind
		local v = (k == "portfolio" or k == "netWorth") and W.fmt(it.def.target) or tostring(it.def.target)
		return S.f(S.milestoneKind[k], { n = v })
	end
	local function have(it)
		local k = it.def.kind
		if k == "portfolio" or k == "netWorth" then return W.fmt(math.min(it.have, it.def.target)) end
		return tostring(math.floor(math.min(it.have, it.def.target)))
	end
	for _, it in ipairs(claimable) do
		W.row(card, { title = S.milestones[it.def.id], icon = KIND_ICON[it.def.kind], highlight = T.color.gold, sub = target(it), extra = S.f(S.goals.reward, { n = W.fmt(it.reward) }) .. (it.def.points > 0 and (" · " .. S.f(S.goals.points, { n = it.def.points })) or ""), extraColor = T.color.gold, cw = ctx.cw,
			actions = { { text = S.goals.claim, icon = "🎁", variant = "gold", w = 120, onClick = function() ctx.act("claimMilestone", it.def.id) end } } })
	end
	for _, it in ipairs(open) do
		W.row(card, { title = S.milestones[it.def.id], icon = KIND_ICON[it.def.kind], sub = target(it), extra = S.f(S.goals.progress, { a = have(it), b = (it.def.kind == "portfolio" or it.def.kind == "netWorth") and W.fmt(it.def.target) or it.def.target }) .. " · " .. S.f(S.goals.reward, { n = W.fmt(it.reward) }), extraColor = T.color.line, cw = ctx.cw })
		W.progress(card, it.have / it.def.target, T.color.brand, 4)
	end
	if #finished > 0 then
		local done = W.card(parent, { title = S.goals.claimed, icon = "✅" })
		local fl = W.flow(done)
		for i, it in ipairs(finished) do
			W.chip(fl, "✓ " .. S.milestones[it.def.id], T.color.gold, i)
		end
		if #finished == #list then W.note(done, S.goals.allDone, T.color.gold) end
	end
end

return Screens
