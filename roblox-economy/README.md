# Economy – Roblox Studio port

Port of `src/lib/idle/economy.ts` (Next.js idle game) to Luau. UNTESTED in Studio: no Luau runtime was available in the build sandbox.

## Option A: Rojo
`rojo serve` in this folder, connect from Studio. `default.project.json` maps everything.

## Option B: paste by hand
| File | Studio object | Parent |
|---|---|---|
| `src/shared/Config.lua` | ModuleScript `Config` | ReplicatedStorage > Folder `Economy` |
| `src/shared/Logic.lua` | ModuleScript `Logic` | same folder `Economy` |
| `src/server/EconomyService.server.lua` | Script `EconomyService` | ServerScriptService |
| `src/client/EconomyUI.client.lua` | LocalScript `EconomyUI` | StarterPlayer > StarterPlayerScripts |

Then: Game Settings > Security > enable **Studio Access to API Services** (DataStore saving). Play.

## Ported
Character (country/city/era/family), jobs + 3-decision shifts + promotion/raise/lead, needs, education,
14 companies (staff roles, stock, price/output/risk, upgrade, phases, rent/tax, events, bankruptcy warning),
26 assets (price waves, market news, startups exit/krach), 6 hustles (3 rounds), offline income (15 min cap), DataStore save.

## Dropped (add later)
Limit/stop orders, arbitrage, vacation, crisis, contracts, research, rivals, unions, marketing, speed 1-16x,
leaderboard/API routes, i18n (UI is English), boosts, point exchange. Education uses learning points earned from shifts
(web version used points from the quiz site).

## Architecture
Server owns state, `Logic.settle` runs every second, one RemoteFunction `Action` for all moves, RemoteEvent `State` pushes snapshots. Client only renders.
