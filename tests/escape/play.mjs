// Bot, který v opravdovém prohlížeči dohraje únikovky přes UI (klikání na místa v místnosti,
// inventář, spojování předmětů a řešení hádanek v okně). Potřebuje běžící web (npm run dev).
//
//   node --experimental-strip-types --import ./tests/ts-resolve.mjs tests/escape/play.mjs [url] [místnosti] [jazyky]
//   např. … tests/escape/play.mjs http://localhost:3000 pirate,lab cs,en
//
// Bez argumentů hraje všechny únikovky ve všech jazycích. Na každé první místnosti jednou
// schválně odpoví špatně, aby se ověřilo, že roste nebezpečí a počítají se chyby.
import { createRequire } from "node:module";
import { locales } from "../../src/i18n/config.ts";
import { getEscapeText } from "../../src/i18n/escape.ts";
import { ROOMS, getEscape } from "../../src/lib/escape/rewards.ts";

// Playwright není v package.json (stejně jako u tests/games), načte se lokální nebo globální instalace.
const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3000";
const ids = process.argv[3] ? process.argv[3].split(",") : Object.keys(ROOMS);
const langs = (process.argv[4] ? process.argv[4].split(",") : [...locales]);

const hotspotSel = (label) => `svg g[role="button"][aria-label=${JSON.stringify(label)}]`;

async function clickHotspot(page, h) {
  await page.locator(hotspotSel(h.label)).first().click();
}

async function clickItem(page, room, id) {
  const name = room.items.find((i) => i.id === id).name;
  const exact = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
  await page.locator("aside button").filter({ has: page.locator("span.flex-1", { hasText: exact }) }).first().click();
}

async function solveModal(page, puzzle, ui, wrongFirst) {
  const modal = page.locator("div.fixed.inset-0 .card");
  await modal.waitFor();
  const check = modal.getByRole("button", { name: ui.check, exact: true });
  if (wrongFirst && puzzle.type === "code") {
    await modal.locator("input").fill("zzz-wrong");
    await check.click();
    await modal.getByText(ui.wrong).waitFor();
  }
  if (puzzle.type === "code") {
    await modal.locator("input").fill(puzzle.answers[0]);
  } else if (puzzle.type === "choice") {
    await modal.getByRole("button", { name: puzzle.options[puzzle.correct], exact: true }).click();
  } else if (puzzle.type === "order") {
    for (const item of puzzle.items) {
      await modal.locator("div.flex.flex-wrap").getByRole("button", { name: item, exact: true }).click();
    }
  } else {
    const cols = modal.locator("div.grid.grid-cols-2 > div");
    for (let i = 0; i < puzzle.pairs.length; i++) {
      await cols.nth(0).getByRole("button").nth(i).click();
      await cols.nth(1).getByRole("button", { name: puzzle.pairs[i][1], exact: true }).click();
    }
  }
  await check.click();
  await modal.waitFor({ state: "detached" });
}

// Hraje jednu místnost jako rozumný hráč: spojí, co jde spojit, použije předměty a řeší hádanky v pořadí.
async function playRoom(page, room, ui, wrongOnce) {
  const inv = new Set();
  const solved = new Set();
  const used = new Set();
  let wrong = wrongOnce;
  for (let guard = 0; guard < 40 && !solved.has("door"); guard++) {
    const recipe = room.recipes.find((r) => inv.has(r.a) && inv.has(r.b));
    if (recipe) {
      await clickItem(page, room, recipe.a);
      await clickItem(page, room, recipe.b);
      inv.delete(recipe.a);
      inv.delete(recipe.b);
      inv.add(recipe.result);
      continue;
    }
    const use = room.hotspots.find((h) => h.kind === "use" && !used.has(h.id) && inv.has(h.item));
    if (use) {
      await clickItem(page, room, use.item);
      await clickHotspot(page, use);
      used.add(use.id);
      inv.delete(use.item);
      use.rewardItems.forEach((i) => inv.add(i));
      continue;
    }
    const nextId = room.order.find((id) => !solved.has(id));
    const h = room.hotspots.find((x) => x.kind === "puzzle" && x.puzzleId === nextId);
    if (!h || h.kind !== "puzzle") throw new Error(`${room.id}: nevím, jak dál (${nextId})`);
    if (h.requiresItem) {
      if (!inv.has(h.requiresItem)) throw new Error(`${room.id}: chybí předmět ${h.requiresItem} pro ${h.id}`);
      await clickItem(page, room, h.requiresItem);
    }
    await clickHotspot(page, h);
    const puzzle = room.puzzles.find((p) => p.id === h.puzzleId);
    await solveModal(page, puzzle, ui, wrong && puzzle.type === "code");
    wrong = false;
    solved.add(puzzle.id);
    if (h.requiresItem) inv.delete(h.requiresItem);
    (puzzle.rewardItems ?? []).forEach((i) => inv.add(i));
  }
  if (!solved.has("door")) throw new Error(`${room.id}: dveře se neotevřely`);
}

const browser = await chromium.launch();
const failures = [];
let played = 0;
for (const locale of langs) {
  const ui = getEscapeText(locale).ui;
  for (const id of ids) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    const escape = getEscape(id, locale);
    const started = Date.now();
    try {
      await page.goto(`${base}/${locale}/unikovky/${id}`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: new RegExp(ui.timed) }).click();
      for (let i = 0; i < escape.rooms.length; i++) {
        await page.getByText(ui.roomProgress.replace("{n}", String(i + 1)).replace("{total}", String(escape.rooms.length))).first().waitFor();
        await playRoom(page, escape.rooms[i], ui, i === 0);
        if (i < escape.rooms.length - 1) {
          await page.getByRole("button", { name: new RegExp(ui.nextRoom) }).click();
        }
      }
      await page.getByRole("heading", { name: ui.winTitle }).waitFor();
      const mistakes = await page.getByText(`${ui.mistakes}: 1`).count();
      if (!mistakes) throw new Error("chyba se nezapočítala");
      if (errors.length) throw new Error(`chyby stránky: ${errors.join("; ")}`);
      played++;
      console.log(`ok   ${locale}/${id} (${escape.rooms.length} místnosti, ${((Date.now() - started) / 1000).toFixed(1)} s)`);
    } catch (e) {
      failures.push(`${locale}/${id}: ${e.message.split("\n")[0]}`);
      console.log(`FAIL ${locale}/${id}: ${e.message.split("\n")[0]}`);
      await page.screenshot({ path: `tests/escape/fail-${locale}-${id}.png` }).catch(() => {});
    }
    await page.close();
  }
}
await browser.close();
console.log(`\nDohráno ${played}, selhalo ${failures.length}.`);
if (failures.length) process.exit(1);
