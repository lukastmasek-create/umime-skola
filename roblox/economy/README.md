# Tycoon Life (Roblox)

Life-sim / business tycoon for Roblox: get a job, keep yourself fed, build companies, trade assets, run hustles,
hit goals and climb the leaderboard. Server-authoritative economy ported from `src/lib/idle/economy.ts`.

## Install in Roblox Studio

1. `python3 tools/build.py` (regenerates `install.lua` from `src/`).
2. Studio → View → Command Bar → paste `install.lua` → Enter.
3. Game Settings → Security → enable **Studio Access to API Services** (saving + leaderboard), then Play.

## Layout

| File | Runs on | Role |
| --- | --- | --- |
| `src/Config.lua` | shared | All tuning data: jobs, companies, assets, hustles, devices, milestones, daily reward. |
| `src/Logic.lua` | shared | Pure game rules. Server executes actions; client only reads display values. |
| `src/Strings.lua` | shared | Every player-facing string (English) + icons. |
| `src/EconomyService.server.lua` | server | DataStore load/save with retries, remotes, autosave, leaderboard. |
| `src/ServerCore.lua` | server | Action whitelist, request-id replay (no double charges), rate limiter. |
| `src/EconomyUI.client.lua` | client | Shell: splash, header, navigation, refresh policy, action feedback. |
| `src/Theme.lua`, `src/Widgets.lua` | client | Design tokens and UI kit (cards, buttons, toasts, modals, confetti, sound). |
| `src/Screens.lua` | client | Every screen and side panel. |

## Tests

```bash
npm i --no-save fengari@0.1.4
```

```bash
node tools/run-tests.js
```

`logic_spec` covers rules and exploits, `ui_spec` renders every screen and side panel for 3 game states × 3 widths × 4
device tiers and presses every button against a Roblox UI mock, and `shell_spec` boots the client shell end to end.

## Review: what changed from the original

**Localization** — whole game translated to English (strings, number format `1,234` / `1.23M`, durations, defaults).

**Bugs / exploits fixed**
- Companies, staff, upgrades, research, contracts, campaigns, stage-ups, boosts and job fees could be bought with no
  cash check, so a player could buy 50 factories on infinite credit. Now paid from cash; essentials (needs, stock,
  crisis fund, union deal) may use a small overdraft (2 days of living cost) so a broke player can still eat.
- Saved views on the Home tab were always rejected (`overview` vs `home`).
- Players already in the server when the service script started (Studio Play Solo) never got a session; joins are
  now guarded against double loads.
- Home screen leaked a global `card`; several hard-coded Czech strings in pinned cards.

**New gameplay**
- **Goals**: 21 milestones (shifts, rank, education, companies, stage, hustles, portfolio, net worth, devices) with cash +
  study-point rewards scaled to cost of living. Net-worth goals track this run's peak, so restarting can't farm them.
- **Daily reward** with a 7-day streak (20 h cooldown, 48 h grace). The streak survives restarts; cash doesn't.

**Gameplay v4**
- **Bank**: savings earn 4%/yr; loans at 12%/yr up to 50% of equity (net worth after debt). Interest flows through
  income every tick; savings auto-cover negative cash.
- **Daily missions**: 3 per real day from an 8-mission pool (shifts, trades, supplies, restocks, hustles, study,
  deposits, earnings), rewards scale with cost of living, plus study points.
- **Legacy**: restarting converts the all-time record into permanent points (+2% income each, sqrt-scaled, max 100).
- **Lifetime stats** (9 counters) and richer history samples (net worth, portfolio, cash, income every 5 min, 12 h).

**Organisation + analytics**
- Every screen is split into numbered HUD sections (`01 // COMMAND`, `02 // MODULES`, ...).
- Charts: net-worth and income trends, income breakdown bars, money allocation strip, shift performance,
  supply levels, top salaries, profit per company, revenue vs costs, portfolio by category and over time,
  3-hour price sparklines with % change on every asset, hustle round results, bank interest bars and a debt gauge.

**UI v2: sci-fi HUD** (styled on the reference HUD kit)
- Cut-corner neon frames, corner brackets, title plates with `>>>` chevrons, edge notches, a tactical grid
  backdrop with spinning ring clusters and a hologram platform.
- Dotted ring gauges with % (dashboard modules), segmented block progress bars, hazard-striped WARNING / DANGER plates,
  "MESSAGE" divider plates, crosshair reticles, waveform bars, hex price plates.
- Monochrome cyan glyphs and two-letter callsigns ("PG" = Programmer) replace color emoji.
- Diagonals are hard-edged UIGradients, never rotated frames, so everything still clips inside scrolling lists.

**UI v1 / feel**
- New visual system: midnight glass panels, violet→pink brand gradient, animated hero border, ambient glow, icons.
- Splash screen, count-up header numbers, tab slide/fade transitions, stacked toasts, pop-in modals with confirm
  dialogs for destructive actions, celebration screen + confetti for promotions, device unlocks and rewards,
  built-in UI sounds with a mute toggle, notification badges for claimable rewards.
- Content no longer rebuilds every second: it refreshes when something discrete changes, otherwise every few
  seconds, and never under the cursor or mid-press (hover and animations stay smooth).
