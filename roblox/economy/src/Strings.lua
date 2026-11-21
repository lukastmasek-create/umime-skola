--!nonstrict
-- All player-facing text lives here (English). Keys are stable ids; add another table for more locales.
local S = {}

S.locale = "en"

function S.f(template, vars)
	return (template:gsub("{(%w+)}", function(k) local v = vars and vars[k]; return v ~= nil and tostring(v) or "{" .. k .. "}" end))
end

S.ui = {
	title = "TYCOON LIFE", tagline = "Work. Build. Invest. Rise.",
	cash = "Cash", netWorth = "Net worth", income = "Net income / yr", perYear = "{n} / yr",
	energy = "Energy", next = "Next step", nextNone = "Everything is running. Consider an investment or a company.",
	yes = "Yes", no = "No", close = "Close", back = "Back", confirm = "Confirm", buy = "Buy", sell = "Sell",
	owned = "Owned", price = "Price", cost = "Cost", effect = "Effect", locked = "Locked", free = "Free",
	max = "Maxed", soon = "{n} left", now = "Now", secLeft = "{n}s", minLeft = "{n} min", hourLeft = "{n} h",
	loading = "Loading your empire…", saveFailed = "Your progress couldn't be loaded. The game is read-only so your save is never overwritten. Rejoin to try again.",
	studioPreview = "Device preview (Studio only)", preview = "Previewing",
	more = "More", pinned = "Pinned cards", edit = "Edit", done = "Done",
	nothing = "Nothing here yet.", panels = "Panels", all = "All", available = "Available", main = "Main",
	sound = "Sound", soundOn = "SFX ON", soundOff = "SFX OFF", requires = "Requires {name}",
	tips = {
		"Tip: Keep food and drink stocked — empty needs slow everything down.",
		"Tip: Education boosts every income source by 4% per level.",
		"Tip: Companies run out of stock. Refill before output drops to 20%.",
		"Tip: Limit orders fill even while you're offline (up to 15 minutes).",
		"Tip: Hustle experience makes market hints more reliable.",
		"Tip: Claim your daily reward every day to grow your streak.",
	},
}

S.nav = {
	home = "Home", work = "Work", needs = "Needs", companies = "Business", invest = "Invest",
	hustle = "Hustle", board = "Leaders", device = "Devices", compare = "Compare", history = "History", goals = "Goals", more = "More",
}
S.navIcon = { home = "⌂", work = "▣", needs = "◒", companies = "▥", invest = "↗", hustle = "◈", board = "♛", device = "▯", compare = "⇌", history = "◷", goals = "◎", more = "≡" }
S.navShort = S.navIcon

S.devices = {
	phone = { name = "Phone", tag = "Compact overview", desc = "One panel with bottom navigation. Every game action is available." },
	ipad = { name = "Tablet", tag = "Split view", desc = "Split view, a watchlist, upcoming expenses and active projects at a glance." },
	laptop = { name = "Laptop", tag = "Analyst workstation", desc = "Compare jobs, companies and assets side by side, with saved views and quick actions." },
	pc = { name = "Gaming PC", tag = "Command center", desc = "Configurable pinned cards, deep history and a live alerts panel." },
}
S.deviceFeatures = {
	splitView = "Split view (list + detail)", watchlist = "Watchlist (up to {n})", upcoming = "Upcoming expenses and projects",
	compare = "Compare workspace (up to 3 items)", savedViews = "Saved views (up to {n})", quickActions = "One-tap quick actions",
	pinnedCards = "Pinned cards (up to {n})", history = "Deep net-worth and event history", alerts = "Alerts panel",
}
S.deviceUi = {
	title = "Devices", current = "Current device", nextTitle = "Next device", buy = "Buy for {n}", owned = "Owned",
	noMore = "You own the best device.", benefits = "What you get", price = "Price", requirements = "Requirements", unlocked = "{name} unlocked!",
	afterLine = "{a}: {b} → {c} (covers {d} days of needs)", confirm = "{name}: {price}\n{cash}: {before} → {after}",
	note = "Devices change how much you can see and how fast you can act — not how much you earn. Every economic action works on every device.",
}
S.reason = {
	edu = "Requires Education {need} (you have {have}).", busyShift = "Finish your shift first.", sameJob = "You already have this job.",
	era = "Doesn't exist in this era yet.", maxUnits = "Maximum units reached.", cash = "Not enough cash: {have} of {need}.",
	running = "Already running.", shifts = "Complete shifts: {have} of {need}.", netWorth = "Net worth {have} of {need}.", companies = "Own at least {need} company (you have {have}).",
	points = "Not enough points: {have} of {need}.", deviceOrder = "Devices unlock in order.", unknownDevice = "Unknown device.",
}
S.err = {
	["not-enough-cash"] = "Not enough cash.", ["not-enough-points"] = "Not enough points.", locked = "Locked — meet the requirements first.",
	max = "Already at maximum.", ["no-job"] = "You don't have a job.", busy = "Can't do that right now.", cooldown = "Wait a moment.",
	["low-energy"] = "Not enough energy. Rest or buy food.", sick = "You're sick.", vacation = "You're on vacation.",
	["no-transport"] = "No transport — you'll have to walk.", ["not-ready"] = "Not ready yet.", ["same-job"] = "You already have this job.",
	nothing = "Nothing to do.", ["bad-request"] = "Invalid request.", ["no-spread"] = "No price gap between markets right now.",
	["rate-limit"] = "Slow down a little.", ["save-unavailable"] = "Saving is unavailable.", ["not-ready-server"] = "Server is starting up.",
	["no-character"] = "Create a character first.", ["has-character"] = "You already have a character.", ["no-shift"] = "No active shift.",
}
S.evt = {
	["shift-started"] = "Shift started.", ["shift-step"] = "Next situation.", ["shift-done"] = "Shift complete! +{n}", sick = "You got sick.",
	["crisis-warning"] = "Heads up: a crisis is coming to your industry.", promoted = "Promoted!", ["promo-rejected"] = "Request denied. Try again in an hour.",
	raised = "Raise approved!", ["raise-rejected"] = "Raise denied.", warned = "Warning for poor performance!",
	fired = "You've been fired!", rested = "Fully rested.", vacation = "Vacation started.", sold = "Sold +{n}", bought = "Bought for {n}",
	arbitrage = "Arbitrage +{n}", lost = "Hustle: you got scammed!", done = "Hustle complete.", step = "Round decided.", device = "Device unlocked!",
	milestone = "Goal reached! +{n}", daily = "Daily reward +{n}",
}

S.create = {
	title = "Create your character", name = "Name", country = "Country (wages and prices)", city = "City (wages, costs, rent)",
	era = "Era (starting money, digital industries)", family = "Family (starting money)", start = "Start the game",
	hint = "Your background sets your starting money and small bonuses. It can only be changed by starting over.",
	startMoney = "Starting cash: {n}", welcome = "WELCOME", pitch = "Start from nothing. Take a job, keep yourself fed, then build companies, trade assets and climb the leaderboard.",
}
S.countries = { cz = "Czechia", sk = "Slovakia", de = "Germany", us = "USA", gb = "United Kingdom", jp = "Japan" }
S.countryFlag = { cz = "CZ", sk = "SK", de = "DE", us = "US", gb = "UK", jp = "JP" }
S.cities = { village = "Village", town = "Town", city = "City", metropolis = "Metropolis" }
S.eras = { ["1990"] = "1990s", ["2010"] = "2010s", ["2025"] = "Today", ["2050"] = "Future" }
S.families = { poor = "Poor family", middle = "Middle class", rich = "Wealthy family", business = "Business family" }
S.jobs = { warehouse = "Warehouse Worker", seller = "Salesperson", cook = "Cook", police = "Police Officer", vet = "Veterinarian", programmer = "Programmer", farmer = "Farmer", firefighter = "Firefighter", teacher = "Teacher", journalist = "Journalist", architect = "Architect", pilot = "Pilot", doctor = "Doctor", banker = "Banker" }
S.jobIcon = { warehouse = "WH", seller = "SL", cook = "CK", police = "PD", vet = "VT", programmer = "PG", farmer = "FM", firefighter = "FF", teacher = "TC", journalist = "JR", architect = "AR", pilot = "PL", doctor = "MD", banker = "BK" }
S.companies = { shoes = "Shoe Store", clothes = "Clothing Brand", tech = "Electronics", delivery = "Delivery Service", supermarket = "Supermarket", digi = "Digital Agency", software = "Software House", hardware = "Hardware Maker", factory = "Factory", bakery = "Bakery", carwash = "Car Wash", eshop = "Online Store", printshop = "Print Shop", streaming = "Streaming Platform" }
S.companyIcon = { shoes = "SH", clothes = "CL", tech = "EL", delivery = "DL", supermarket = "SM", digi = "DA", software = "SW", hardware = "HW", factory = "FX", bakery = "BK", carwash = "CW", eshop = "OS", printshop = "PR", streaming = "ST" }
S.assets = { coin = "Main Coin", altcoin = "Altcoin", stablecoin = "Stablecoin", memecoin = "Memecoin", defi = "DeFi Token", flat = "Apartment", house = "House", land = "Land Plot", office = "Office Space", technology = "Tech Stocks", energy = "Energy Stocks", bank = "Bank Stocks", consumer = "Consumer Goods", biotech = "Biotech", gold = "Gold", silver = "Silver", copper = "Copper", state = "Government Bonds", corporate = "Corporate Bonds", junk = "High-Yield Bonds", index = "World Index Fund", dividend = "Dividend Fund", theme = "Thematic Fund", startup_it = "IT Startup", startup_fintech = "Fintech Startup", startup_green = "Green Energy Startup" }
S.assetCats = { crypto = "Crypto", realestate = "Real estate", stocks = "Stocks", metals = "Metals", bonds = "Bonds", funds = "Funds", startups = "Startups" }
S.assetCatIcon = { crypto = "CR", realestate = "RE", stocks = "EQ", metals = "MT", bonds = "BD", funds = "FD", startups = "SU" }
S.roles = { producer = "Producer", seller = "Sales Rep", accountant = "Accountant", manager = "Manager" }
S.hustles = { lemonade = "Lemonade Stand", reselling = "Reselling", carflip = "Car Flipping", houseflip = "House Flipping", startup = "Startup", freelance = "Freelance Gig" }
S.hustleIcon = { lemonade = "LM", reselling = "RS", carflip = "CF", houseflip = "HF", startup = "SU", freelance = "FL" }
S.needs = {
	food = { name = "Food", effect = "Without food, energy recovers at half speed." },
	drink = { name = "Drinks", effect = "Without drinks, energy drains over time." },
	clothing = { name = "Clothing", effect = "Without clothing, all income drops by 15%." },
	housing = { name = "Housing", effect = "Without housing, you pay fines every hour." },
	transport = { name = "Transport", effect = "Without transport, you walk to shifts and it costs more energy." },
	health = { name = "Health", effect = "Without healthcare, energy can't go above 70%." },
	leisure = { name = "Leisure", effect = "Without leisure, energy recovers 20% slower." },
}
S.needIcon = { food = "FD", drink = "DR", clothing = "CL", housing = "HS", transport = "TR", health = "HL", leisure = "LS" }
S.boosts = { energy_drink = "Energy Drink (faster recovery)", cinema = "Cinema Night (+10% income)" }
S.events = {
	crash = "Market Crash", hyper = "Hyperinflation", shortage = "Supply Shortage", outage = "Server Outage", boom = "Economic Boom",
	viral = "Going Viral", strike = "Industry Strike", fashion = "Fashion Trend", subsidy = "State Subsidy", breach = "Data Breach",
}
S.assetEvents = { cryptoRally = "Crypto Rally", cryptoCrash = "Crypto Crash", rateHike = "Rate Hike", rateCut = "Rate Cut", techBoom = "Tech Boom", goldFear = "Crisis Fears — Gold Climbs", panic = "Market Panic", bull = "Bull Market", bear = "Bear Market" }
S.news = { ["startup-exit"] = "Startup exit", ["startup-krach"] = "Startup collapsed", ["buy-filled"] = "Buy order filled", ["sell-filled"] = "Sell order filled", ["order-failed"] = "Order failed" }
S.situations = {
	delivery = { text = "A late delivery is waiting to be unloaded.", choices = { "Unload it fast", "Split it among the team", "Leave it for later" } },
	customer = { text = "An angry customer walks in.", choices = { "Argue back", "Listen and fix it", "Call a colleague" } },
	queue = { text = "A long queue is forming.", choices = { "Work faster", "Open a second counter", "Ignore it" } },
	tools = { text = "A tool just broke.", choices = { "Patch it up", "Replace it and report it", "Keep working" } },
	colleague = { text = "A colleague needs help.", choices = { "Say no", "Help quickly", "Teach them how" } },
	spill = { text = "Something spilled on the floor.", choices = { "Walk around it", "Clean up and put out a sign", "Call the janitor" } },
}
S.work = {
	title = "Work", current = "Current job", rank = "Rank {a} of {b}", points = "Points {a} / {b}", pay = "Salary {n} / yr",
	start = "Start shift", startHint = "3 decisions. Needs {n}+ energy.", rest = "Rest", restHint = "Refills energy. Once every 6 hours.",
	vacation = "Vacation", vacationHint = "A day off at half pay with full energy.",
	promo = "Ask for promotion", promoHint = "Needs points, Education and 2 hours at your rank.", raise = "Negotiate raise", raiseHint = "Once every 7 days.",
	lead = "Shift lead", leadHint = "+5% pay, +10 energy per shift.", quit = "Quit job", choose = "Choose", decision = "Decision {a}/{b}",
	jobs = "Job board", salary = "{n} / yr", fee = "Fee {n}", needEdu = "Edu {n}", noJob = "You don't have a job yet. Pick one below.",
	sick = "You're sick: no passive salary or shifts.", cooldown = "Ready in {n}", edu = "Education", eduHint = "+4% to all income. Costs {n} points earned at work.", eduBuy = "Study", eduPoints = "Study points: {n}",
	walk = "No transport: walking (+15 energy)", crisis = "Industry crisis: salary −10%.", take = "Apply",
}
S.needsUi = { title = "Living needs", hint = "Supplies are bought days ahead and run down every day.", days = "{n} days", perDay = "{n} / day", plus1 = "+1 day", plus7 = "Fill up", boosts = "Consumer goods", empty = "EMPTY", transportWarn = "No transport: you walk to work (+15 energy).", billsWarn = "No housing: you're paying fines every hour.", overdraft = "Essentials can use a small overdraft (up to {n})." }
S.co = {
	title = "Business", phase = "Stage {a}/{b}", revenue = "Revenue {n} / yr", costs = "Costs {n} / yr", profit = "Profit {n} / yr",
	nextPhase = "Next stage", phaseHint = "Needs company revenue of {req} / yr and costs {cost}. Raises rent and tax, expands storage.", upgradePhase = "Advance",
	unit = "{name} ×{n}", staff = "Staff {a}/{b}", stock = "Stock {a}/{b} batches", noStock = "OUT OF STOCK: output down to 20%",
	price = "Product price ×{n}", output = "Output ×{n}", risk = "Risk {n}", upgrade = "Upgrade industry", upgraded = "Upgraded (+30%)",
	campaign = "Marketing campaign", contract = "Supply contract", research = "Research {a}/{b}", union = "Union agreement", fund = "Crisis fund", sell = "Sell one unit",
	buyStock = "Stock ×5", morale = "Morale {n}%", strike = "ON STRIKE", rival = "A rival is attacking", manage = "Manage", hire = "Hire", fire = "Fire",
	distress = "BANKRUPTCY WARNING", distressText = "Cash can't cover running costs. {n} left. Sell a unit, cut staff or lower output.",
	bankruptcy = "{name} went bankrupt.", rookies = "New hires are training.", settings = "Strategy", staffTitle = "Team", actions = "Growth",
}
S.inv = {
	title = "Invest", portfolio = "Portfolio", own = "Holding {q} ({v})", yield = "Yield {n}% / yr", buy10 = "Buy 10%", buyAll = "Buy max", sellHalf = "Sell ½", sellAll = "Sell all",
	watch = "Watch", unwatch = "Unwatch", orders = "Orders", orderHint = "Buy or sell automatically when the price hits a limit. Fills while you're away too (within the offline limit).",
	orderBuyBelow = "Buy the dip", orderSellAbove = "Take profit", orderSellBelow = "Stop loss", orderBuyAbove = "Buy the breakout",
	orderPlace = "Place order", orderCancel = "Cancel", orderMax = "At most {n} orders.", arb = "Arbitrage", arbHint = "Trade the price gap between two markets. Profit depends on the current gap.", arbRun = "Trade {n}",
	spread = "Market gap {n}%", news = "Market news", log = "Market log", pnl = "P/L {n}", startupWarn = "Startups: every hour they either keep going, exit big, or collapse.", locked = "Locked in this era",
	price = "Price {n}", limitPrice = "Limit price", amount = "Amount", share = "Share",
}
S.hu = { title = "Hustle", hint = "Put in capital and make three rounds of decisions. You're paid out at the end — and it can be a loss.", stake = "Stake {n}", start = "Start", round = "Round {a}/{b}", value = "Value {n}", topUp = "Add capital {n}",
	opens = "Next decision in {n}", option = "Option {n}", opportunity = "Opportunity", range = "result ×{lo} to ×{hi}", cost = "costs {n}% of stake", hintUp = "Hunch: the market will rise ▲", hintDown = "Hunch: the market will fall ▼",
	experience = "Experience {a}/{b}", needEdu = "Edu {n}", chosen = "Chosen" }
S.board = { title = "Leaderboard", rank = "#", empty = "The leaderboard is empty for now (or Studio isn't connected to DataStores).", you = "You", best = "Record {n}", record = "Record net worth", runs = "Runs {n}", bankrupt = "Bankruptcies {n}", player = "Player" }
S.cmp = { title = "Compare", hint = "Pick up to 3 items and compare them side by side.", jobs = "Jobs", companies = "Companies", assets = "Assets", add = "Add", remove = "Remove", metric = "Metric", pick = "Pick items below.", payback = "Payback {n} yrs", profit = "Profit/unit {n}", salaryCol = "Salary", feeCol = "Fee", eduCol = "Education", priceCol = "Price", yieldCol = "Yield", driftCol = "Growth", volCol = "Volatility", paybackCol = "Payback", netPay = "Net yearly pay", incomeCol = "Income/unit/yr", unlocked = "Unlocked" }
S.views = { title = "Saved views", save = "Save view", name = "View {n}", apply = "Apply", delete = "Delete", empty = "No saved views.", limit = "View limit is {n}." }
S.quick = { title = "Quick actions", shift = "Shift", rest = "Rest", food = "Food +1", sellAll = "Portfolio", device = "Devices" }
S.panel = { watch = "Watchlist", upcoming = "Upcoming expenses", projects = "Active projects", alerts = "Alerts", pinned = "Pinned cards", empty = "Empty", history = "History",
	needIn = "{name}: runs out in {t}", needNow = "{name}: empty", stockIn = "{name}: stock runs out in {t}", shiftActive = "Shift in progress (step {n}/3)", hustleDue = "{name}: decision waiting", hustleIn = "{name}: next round in {t}",
	orderLine = "{side} {name} at {price}", noWatch = "Add assets with the ☆ button.", buy = "Buy", sell = "Sell" }
S.alerts = {
	distress = "Bankruptcy in {t}", lowEnergy = "Low energy", needEmpty = "{name}: supply empty", noStock = "{name}: out of stock", event = "Event: {name} hits {co}",
	sick = "You're sick", crisis = "Crisis in your industry", orderNear = "{name} is close to your order",
}
S.hist = { title = "History", worth = "Net worth over time", portfolio = "Portfolio", log = "Recent news", devices = "Devices purchased", none = "No data yet.", nowLabel = "Now {n}", minLabel = "Low {n}", maxLabel = "High {n}" }
S.home = {
	title = "Overview", income = "Yearly income", salary = "Salary", companies = "Business", passive = "Passive", costs = "Business costs", living = "Living (est.)", mult = "Multiplier ×{n}",
	record = "Record {a} · runs {b}", restart = "Start over", restartHint = "Wipes progress including devices. Your record and run count are kept.", restartConfirm = "Really start over?",
	event = "Event: {name}", news = "Market news: {name}", nextJob = "Find your first job", nextShift = "Work a shift", nextFood = "Restock your needs", nextTransport = "Buy transport", nextDevice = "You can buy a {name}", nextRest = "Take a rest", nextHustle = "Make your hustle decision",
	nextCompany = "Start your first company", nextInvest = "Put your spare cash to work", nextSave = "Save up for a {name}", nextGoal = "Claim your rewards",
}
S.hero = {
	kicker = "Recommended move", sub = "Based on where you are, this is the best next step.", cta = "Go", secondary = "Devices",
	free = "FREE", panelTitle = "Live feed", panelOpen = "Open", panelEmpty = "All quiet. No alerts.", online = "ONLINE", continueTitle = "Your empire",
	tiles = { work = "energy {n}%", needs = "{n} days of supplies", companies = "stock {n}%", invest = "{n}% of net worth", hustle = "round {a}/{b}", device = "{n}% of price" },
}
S.goals = {
	title = "Goals", hint = "Hit milestones to earn cash and study points. Rewards scale with your cost of living.", claim = "Claim", claimed = "Claimed", progress = "{a} / {b}",
	reward = "+{n}", points = "+{n} study pts", daily = "Daily reward", dailyHint = "Come back every day. Your streak grows the reward (max day {n}).",
	dailyClaim = "Claim {n}", dailyNext = "Next reward in {t}", streak = "Day {n} streak", ready = "{n} ready", allDone = "All goals complete. Legendary.",
	tile = "{n} to claim",
}
S.milestones = {
	first_shift = "First day on the job", shifts_10 = "Reliable worker", shifts_50 = "Workhorse", shifts_200 = "Iron will",
	rank_2 = "Moving up", rank_5 = "Top of the ladder", edu_3 = "Bookworm", edu_10 = "Scholar",
	first_company = "Entrepreneur", companies_10 = "Conglomerate", phase_3 = "Scaling up",
	first_hustle = "Side hustler", hustles_10 = "Deal maker", portfolio_5k = "First portfolio", portfolio_100k = "Fund manager",
	worth_10k = "Five figures", worth_100k = "Six figures", worth_1m = "Millionaire", worth_10m = "Tycoon",
	device_ipad = "Upgrade!", device_pc = "Battlestation",
}
S.milestoneKind = {
	shifts = "Complete {n} shifts", rank = "Reach job rank {n}", edu = "Reach Education {n}", companies = "Own {n} company units", phase = "Reach business stage {n}",
	hustles = "Finish {n} hustles", portfolio = "Hold a portfolio worth {n}", netWorth = "Reach a net worth of {n}", device = "Own device tier {n}",
}
S.preset = { cash = "Cash", netWorth = "Net worth", income = "Income", needs = "Needs", companies = "Business", portfolio = "Portfolio", projects = "Projects", hustle = "Hustle", energy = "Energy", events = "Events", waiting = "waiting", perYear = "/ yr" }
S.legal = { saveNote = "Progress is saved to Roblox servers. This is a game, not financial advice." }
S.sides = { buy = "Buy", sell = "Sell", below = "below", above = "above" }

return S
