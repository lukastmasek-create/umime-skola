import assert from "node:assert/strict";
import { test } from "node:test";
import { locales } from "../../i18n/config.ts";
import { getEscapeText } from "../../i18n/escape.ts";
import { ESCAPE_MASTER_UNLOCK, ROOMS, ROOM_DIFFICULTY, ROOM_REWARDS, escapeTimeLimit, getEscape } from "./rewards.ts";
import type { Hotspot, Room } from "./types.ts";

// Kontrola všech únikovek ve všech jazycích: správná struktura, jednoznačné hádanky
// a hlavně to, že se každá místnost dá podle pravidel hry (EscapeRoom.tsx) dohrát.

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");
const ids = Object.keys(ROOMS);

function unique(list: string[], what: string) {
  const seen = new Set<string>();
  for (const x of list) {
    const key = norm(x);
    assert.ok(!seen.has(key), `${what}: duplicita „${x}“`);
    seen.add(key);
  }
}

function filled(value: unknown, where: string) {
  if (typeof value === "string") assert.ok(value.trim().length > 0, `${where}: prázdný text`);
  else if (Array.isArray(value)) value.forEach((v, i) => filled(v, `${where}[${i}]`));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) {
    // lockedMessage volných hádanek je prázdný záměrně (nikdy se nezobrazí).
    if (k === "lockedMessage") continue;
    filled(v, `${where}.${k}`);
  }
}

function checkStructure(room: Room, where: string) {
  filled({ intro: room.intro, winMessage: room.winMessage, items: room.items, puzzles: room.puzzles, recipes: room.recipes }, where);
  const itemIds = room.items.map((i) => i.id);
  const puzzleIds = room.puzzles.map((p) => p.id);
  unique(itemIds, `${where} id předmětů`);
  unique(puzzleIds, `${where} id hádanek`);
  unique(room.hotspots.map((h) => h.id), `${where} id míst`);
  unique(room.items.map((i) => i.name), `${where} názvy předmětů`);
  assert.deepEqual([...room.order].sort(), [...puzzleIds].sort(), `${where}: pořadí pro robota musí obsahovat každou hádanku`);
  assert.ok(puzzleIds.includes("door"), `${where}: chybí dveře`);

  const hasItem = (id: string, ctx: string) => assert.ok(itemIds.includes(id), `${where} ${ctx}: neznámý předmět ${id}`);
  for (const r of room.recipes) [r.a, r.b, r.result].forEach((id) => hasItem(id, "recept"));

  for (const p of room.puzzles) {
    const at = `${where} hádanka ${p.id}`;
    (p.rewardItems ?? []).forEach((id) => hasItem(id, at));
    assert.equal(p.hints.length, 3, `${at}: tři nápovědy`);
    unique(p.hints, `${at} nápovědy`);
    if (p.type === "choice") {
      assert.ok(p.options.length >= 2, `${at}: aspoň dvě možnosti`);
      unique(p.options, `${at} možnosti`);
      assert.ok(Number.isInteger(p.correct) && p.correct >= 0 && p.correct < p.options.length, `${at}: index správné odpovědi`);
    } else if (p.type === "match") {
      assert.ok(p.pairs.length >= 3, `${at}: aspoň tři dvojice`);
      unique(p.pairs.map(([l]) => l), `${at} levá strana`);
      unique(p.pairs.map(([, r]) => r), `${at} pravá strana`);
    } else if (p.type === "order") {
      assert.ok(p.items.length >= 3, `${at}: aspoň tři kroky`);
      unique(p.items, `${at} kroky`);
    } else {
      assert.ok(p.answers.length > 0, `${at}: chybí odpověď`);
      unique(p.answers, `${at} odpovědi`);
    }
  }

  for (const h of room.hotspots) {
    const at = `${where} místo ${h.id}`;
    assert.ok(h.label.trim(), `${at}: chybí popisek`);
    assert.ok(h.x >= 0 && h.y >= 0 && h.x + h.w <= 800 && h.y + h.h <= 450, `${at}: je mimo scénu`);
    if (h.kind === "puzzle") {
      assert.ok(puzzleIds.includes(h.puzzleId), `${at}: neznámá hádanka ${h.puzzleId}`);
      if (h.requiresItem) hasItem(h.requiresItem, at);
      if (h.requiresSolved) assert.ok(puzzleIds.includes(h.requiresSolved), `${at}: neznámá podmínka ${h.requiresSolved}`);
      if (h.requiresItem || h.requiresSolved) assert.ok(h.lockedMessage.trim(), `${at}: zamčené místo potřebuje hlášku`);
    } else if (h.kind === "use") {
      hasItem(h.item, at);
      h.rewardItems.forEach((id) => hasItem(id, at));
      assert.ok(h.lockedMessage.trim() && h.message.trim(), `${at}: chybí hláška`);
    } else if (h.kind === "examine") {
      assert.ok(h.message.trim(), `${at}: chybí hláška`);
    }
  }
  // Každá hádanka má právě jedno místo, kde se otevírá.
  for (const id of puzzleIds) {
    assert.equal(room.hotspots.filter((h) => h.kind === "puzzle" && h.puzzleId === id).length, 1, `${where}: hádanka ${id} musí mít jedno místo`);
  }
}

type State = { inv: string[]; solved: string[]; opened: string[]; used: string[]; got: string[] };
const key = (s: State) => [s.inv, s.solved, s.opened, s.used].map((l) => [...l].sort().join(",")).join("|");

// Možné tahy hráče podle pravidel komponenty EscapeRoom (výběr předmětu + klik na místo, spojení dvou předmětů).
function moves(room: Room, s: State): State[] {
  const out: State[] = [];
  const give = (state: State, ids: string[]) => ({
    ...state,
    inv: [...state.inv, ...ids.filter((id) => !state.inv.includes(id))],
    got: [...state.got, ...ids.filter((id) => !state.got.includes(id))],
  });
  for (const h of room.hotspots) {
    if (h.kind === "use" && !s.used.includes(h.id) && s.inv.includes(h.item)) {
      out.push(give({ ...s, used: [...s.used, h.id], inv: s.inv.filter((x) => x !== h.item) }, h.rewardItems));
    }
    if (h.kind !== "puzzle" || s.solved.includes(h.puzzleId)) continue;
    if (h.requiresSolved && !s.solved.includes(h.requiresSolved)) continue;
    let next = s;
    if (h.requiresItem && !s.opened.includes(h.id)) {
      if (!s.inv.includes(h.requiresItem)) continue;
      next = { ...s, opened: [...s.opened, h.id] };
    }
    const puzzle = room.puzzles.find((p) => p.id === h.puzzleId)!;
    next = { ...next, solved: [...next.solved, puzzle.id] };
    if (h.requiresItem) next = { ...next, inv: next.inv.filter((x) => x !== h.requiresItem) };
    out.push(give(next, puzzle.rewardItems ?? []));
  }
  for (const r of room.recipes) {
    if (s.inv.includes(r.a) && s.inv.includes(r.b)) {
      out.push(give({ ...s, inv: [...s.inv.filter((x) => x !== r.a && x !== r.b)] }, [r.result]));
    }
  }
  return out;
}

// Prohledá všechny dosažitelné stavy. Vrátí, jestli jdou dveře otevřít, a ověří, že dveře
// nejdou otevřít dřív, než má hráč všechny poznámky s číslicemi kódu.
function explore(room: Room, where: string) {
  const notes = room.items.filter((i) => i.note).map((i) => i.id);
  const door = room.hotspots.find((h) => h.kind === "puzzle" && h.puzzleId === "door") as Extract<Hotspot, { kind: "puzzle" }>;
  const start: State = { inv: [], solved: [], opened: [], used: [], got: [] };
  const seen = new Set([key(start)]);
  const queue = [start];
  let escaped = false;
  const everGot = new Set<string>();
  while (queue.length) {
    const s = queue.shift()!;
    s.got.forEach((id) => everGot.add(id));
    if (s.solved.includes("door")) {
      escaped = true;
      continue;
    }
    for (const n of moves(room, s)) {
      if (n.solved.includes("door") && !s.solved.includes("door")) {
        const missing = notes.filter((id) => !s.got.includes(id));
        assert.deepEqual(missing, [], `${where}: dveře jdou otevřít bez poznámek ${missing.join(", ")}`);
        void door;
      }
      const k = key(n);
      if (!seen.has(k)) {
        seen.add(k);
        queue.push(n);
      }
    }
  }
  assert.ok(escaped, `${where}: místnost nejde dohrát`);
  const neverGot = room.items.map((i) => i.id).filter((id) => !everGot.has(id));
  assert.deepEqual(neverGot, [], `${where}: tyto předměty nejdou získat`);
}

test("každá únikovka má ve všech jazycích aspoň dvě místnosti, obtížnost 1–5 a odměnu", () => {
  for (const id of ids) {
    assert.ok([1, 2, 3, 4, 5].includes(ROOM_DIFFICULTY[id]), `${id}: obtížnost`);
    assert.ok(ROOM_REWARDS[id], `${id}: odměna`);
    for (const locale of locales) {
      const escape = getEscape(id, locale)!;
      assert.ok(escape.rooms.length >= 2, `${id}/${locale}: místností`);
      assert.equal(escape.timeLimitSeconds, escape.rooms.reduce((sum, r) => sum + r.timeLimitSeconds, 0));
      assert.equal(escape.timeLimitSeconds, escapeTimeLimit(id));
      unique(escape.rooms.map((r) => r.id), `${id}/${locale} id místností`);
    }
  }
  assert.ok(ESCAPE_MASTER_UNLOCK.startsWith("title:"));
});

test("struktura a jednoznačnost hádanek", () => {
  for (const id of ids) for (const locale of locales) {
    getEscape(id, locale)!.rooms.forEach((room, i) => checkStructure(room, `${id}/${locale}/místnost ${i + 1}`));
  }
});

test("každá místnost jde dohrát a dveře chtějí všechny poznámky", () => {
  for (const id of ids) for (const locale of locales) {
    getEscape(id, locale)!.rooms.forEach((room, i) => explore(room, `${id}/${locale}/místnost ${i + 1}`));
  }
});

test("kód dveří: tolik číslic, kolik je poznámek, a stejný ve všech jazycích", () => {
  for (const id of ids) {
    const base = getEscape(id, "cs")!;
    base.rooms.forEach((room, i) => {
      const door = room.puzzles.find((p) => p.id === "door")!;
      assert.equal(door.type, "code");
      if (door.type !== "code") return;
      const notes = room.items.filter((it) => it.note).length;
      assert.match(door.answers[0], new RegExp(`^\\d{${notes}}$`), `${id}/místnost ${i + 1}: kód má mít ${notes} číslic`);
      // Poslední nápověda prozradí kód, musí tedy sedět s odpovědí.
      assert.ok(door.hints[2].includes(door.answers[0]), `${id}/místnost ${i + 1}: poslední nápověda neříká kód`);
      for (const locale of locales) {
        const other = getEscape(id, locale)!.rooms[i];
        const otherDoor = other.puzzles.find((p) => p.id === "door")!;
        assert.ok(otherDoor.type === "code" && otherDoor.answers.includes(door.answers[0]), `${id}/${locale}/místnost ${i + 1}: jiný kód`);
        assert.ok(otherDoor.hints[2].includes(door.answers[0]), `${id}/${locale}/místnost ${i + 1}: nápověda neříká kód`);
        assert.equal(other.items.filter((it) => it.note).length, notes, `${id}/${locale}: jiný počet poznámek`);
        // Správné odpovědi ostatních hádanek (index u výběru) jsou ve všech jazycích stejné.
        for (const p of room.puzzles) {
          const q = other.puzzles.find((x) => x.id === p.id)!;
          assert.equal(q.type, p.type, `${id}/${locale}/${p.id}: typ`);
          if (p.type === "choice" && q.type === "choice") assert.equal(q.correct, p.correct, `${id}/${locale}/${p.id}: správná možnost`);
          if (p.type === "order" && q.type === "order") assert.equal(q.items.length, p.items.length, `${id}/${locale}/${p.id}: počet kroků`);
          if (p.type === "match" && q.type === "match") assert.equal(q.pairs.length, p.pairs.length, `${id}/${locale}/${p.id}: počet dvojic`);
        }
      }
    });
  }
});

test("výpis únikovek: každá místnost má v každém jazyce kartu s předmětem", () => {
  for (const locale of locales) {
    const list = getEscapeText(locale).list;
    assert.deepEqual(list.rooms.map((r) => r.id).sort(), [...ids].sort(), `${locale}: karty únikovek`);
    for (const r of list.rooms) filled(r, `${locale}/${r.id}`);
  }
});
