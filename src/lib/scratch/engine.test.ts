import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BLOCK_TYPES,
  BOUND_X,
  COSTUME_COUNT,
  SPECS,
  createRuntime,
  insertBlock,
  isRunning,
  makeBlock,
  moveBlock,
  normDir,
  removeBlock,
  sanitizeBlocks,
  scriptsOf,
  tick,
  type Block,
  type Runtime,
} from "./engine.ts";

// Pomocník: spustí všechny skripty, dokud něco běží (nejvýš tolik kroků, aby test nevisel).
function runAll(rt: Runtime, maxFrames = 10_000): void {
  for (let i = 0; i < maxFrames && isRunning(rt); i++) tick(rt, 16);
}

function blk(type: Block["type"], args: Record<string, string | number> = {}, body?: Block[]): Block {
  const b = makeBlock(type);
  return { ...b, args: { ...b.args, ...args }, ...(body ? { body } : {}) };
}

function script(...blocks: Block[]): Block[] {
  return [blk("start"), ...blocks];
}

test("nabídka má přesně 26 bloků a každý má definici", () => {
  assert.equal(BLOCK_TYPES.length, 26);
  for (const t of BLOCK_TYPES) assert.ok(SPECS[t], `chybí definice pro ${t}`);
});

test("kostým přepíná polohu a další kostým se točí dokola", () => {
  const rt = createRuntime(script(blk("costume", { costume: 2 }), blk("next-costume"), blk("next-costume")));
  runAll(rt);
  assert.equal(rt.sprite.pose, (2 - 1 + 2) % COSTUME_COUNT);
});

test("velikost a schování kočky se nastaví", () => {
  const rt = createRuntime(script(blk("size", { percent: 150 }), blk("hide")));
  runAll(rt);
  assert.equal(rt.sprite.size, 150);
  assert.equal(rt.sprite.visible, false);
});

test("opakuj dokud nejsi na okraji: pohyb skončí až u okraje", () => {
  const rt = createRuntime(
    script(blk("until-edge", {}, [blk("step", { steps: 20 })])),
  );
  runAll(rt);
  assert.ok(rt.sprite.x >= BOUND_X - 0.5);
});

test("krok vpřed s perem zanechá čáru ve směru pohledu", () => {
  const rt = createRuntime([...script(blk("pen", { mode: "down" }), blk("step", { steps: 50 }))], () => 0.5);
  runAll(rt);
  assert.equal(rt.lines.length, 1);
  assert.equal(Math.round(rt.lines[0].x2), 50);
  assert.equal(Math.round(rt.lines[0].y2), 0);
});

test("čtverec ze smyčky: opakuj 4× (krok 50, otoč 90) vrátí postavičku na start", () => {
  const rt = createRuntime(
    script(
      blk("pen", { mode: "down" }),
      blk("repeat", { times: 4 }, [blk("step", { steps: 50 }), blk("turn-right", { deg: 90 })]),
    ),
  );
  runAll(rt);
  assert.equal(rt.lines.length, 4);
  assert.ok(Math.abs(rt.sprite.x) < 1e-6 && Math.abs(rt.sprite.y) < 1e-6);
  assert.equal(normDir(rt.sprite.dir), 90);
});

test("režim krok po kroku: další příkaz počká stepDelay milisekund", () => {
  const rt = createRuntime(script(blk("step", { steps: 10 }), blk("step", { steps: 10 })));
  rt.stepDelay = 1000;
  tick(rt, 16);
  assert.equal(rt.sprite.x, 10);
  while (rt.time < 900) tick(rt, 16);
  assert.equal(rt.sprite.x, 10);
  while (rt.time < 1100) tick(rt, 16);
  assert.equal(rt.sprite.x, 20);
});

test("jdi na x, y a plynulé klouzání dojedou na cíl", () => {
  const rt = createRuntime(script(blk("glide", { x: 100, y: -50, secs: 0.5 })));
  runAll(rt);
  assert.equal(rt.sprite.x, 100);
  assert.equal(rt.sprite.y, -50);
});

test("jdi na náhodné místo používá generátor a zůstane v plátně", () => {
  const rt = createRuntime(script(blk("random")), () => 1);
  runAll(rt);
  assert.equal(rt.sprite.x, BOUND_X);
});

test("vlastní blok s parametry: definice se zavolá dvakrát s různými hodnotami", () => {
  const top: Block[] = [
    blk("start"),
    blk("call", { name: "ctverec", args: "40" }),
    blk("call", { name: "ctverec", args: "10" }),
    blk("define", { name: "ctverec", params: "velikost" }, [
      blk("pen", { mode: "down" }),
      blk("repeat", { times: 4 }, [blk("step", { steps: "$velikost" }), blk("turn-right", { deg: 90 })]),
    ]),
  ];
  const rt = createRuntime(top);
  runAll(rt);
  const lengths = rt.lines.map((l) => Math.round(Math.hypot(l.x2 - l.x1, l.y2 - l.y1)));
  assert.equal(lengths.length, 8);
  assert.deepEqual(lengths.slice(0, 4), [40, 40, 40, 40]);
  assert.deepEqual(lengths.slice(4), [10, 10, 10, 10]);
});

test("vlastní blok bez parametrů a chybějící definice hlásí chybu", () => {
  const rt = createRuntime(script(blk("call", { name: "neexistuje", args: "" })));
  runAll(rt);
  assert.ok(rt.error && rt.error.includes("neexistuje"));
  assert.equal(isRunning(rt), false);
});

test("zastav vše ukončí všechna vlákna, i když běží nekonečná smyčka", () => {
  const top: Block[] = [
    blk("start"),
    blk("forever", {}, [blk("step", { steps: 1 })]),
    blk("start"),
    blk("wait", { secs: 0.1 }),
    blk("stop"),
  ];
  const rt = createRuntime(top);
  runAll(rt, 1000);
  assert.equal(isRunning(rt), false);
  assert.equal(rt.error, null);
});

test("pokud na okraji, odraz obrátí směr k vnitřku plátna", () => {
  const rt = createRuntime([blk("start"), blk("edge")]);
  rt.sprite.x = BOUND_X;
  rt.sprite.dir = 90;
  runAll(rt);
  assert.equal(rt.sprite.dir, -90);
});

test("hlavička skriptu a definice se při čištění povolí jen na nejvyšší úrovni", () => {
  const raw = {
    blocks: [
      { type: "start", id: "a1" },
      { type: "repeat", args: { times: 3 }, body: [{ type: "start" }, { type: "step", args: { steps: 5 } }] },
      { type: "neznamy" },
      { type: "define", args: { name: "f" }, body: [{ type: "define" }] },
    ],
  };
  const out = sanitizeBlocks(raw);
  assert.deepEqual(out.map((b) => b.type), ["start", "repeat", "define"]);
  assert.deepEqual(out[1].body?.map((b) => b.type), ["step"]);
  assert.deepEqual(out[2].body, []);
});

test("čištění omezí rozsah čísel a neznámé volby vrátí na výchozí hodnotu", () => {
  const out = sanitizeBlocks({
    blocks: [
      { type: "pen", args: { mode: "boom" } },
      { type: "pen-size", args: { size: 9999 } },
      { type: "pen-color", args: { color: "#000000" } },
    ],
  });
  assert.equal(out[0].args.mode, "down");
  assert.equal(out[1].args.size, 30);
  assert.equal(out[2].args.color, "#16132b");
});

test("čištění hlídá hloubku vnoření", () => {
  let deep: unknown = { type: "step", args: { steps: 1 } };
  for (let i = 0; i < 20; i++) deep = { type: "repeat", args: { times: 1 }, body: [deep] };
  const out = sanitizeBlocks({ blocks: [{ type: "start" }, deep] });
  let depth = 0;
  let cur: Block | undefined = out[1];
  while (cur) {
    depth += 1;
    cur = cur.body?.[0];
  }
  assert.ok(depth <= 8, `hloubka ${depth}`);
});

test("scriptsOf rozdělí bloky podle hlavičky a definice ukončí skript", () => {
  const top: Block[] = [
    blk("start"),
    blk("step"),
    blk("start"),
    blk("say"),
    blk("define", { name: "f" }, []),
    blk("step"),
  ];
  const scripts = scriptsOf(top);
  assert.equal(scripts.length, 2);
  assert.deepEqual(scripts[0].map((b) => b.type), ["step"]);
  assert.deepEqual(scripts[1].map((b) => b.type), ["say"]);
});

test("přesun bloku do vlastního potomka se odmítne", () => {
  const inner = blk("step");
  const outer = blk("repeat", {}, [inner]);
  const list = [outer];
  assert.equal(moveBlock(list, outer.id, outer.id, 0), null);
});

test("přesun ve stejném seznamu počítá s posunem indexu", () => {
  const a = blk("step", { steps: 1 });
  const b = blk("step", { steps: 2 });
  const c = blk("step", { steps: 3 });
  const list = [a, b, c];
  // Vložit a před c (zóna index 3 = za c) → pořadí b, c, a
  const moved = moveBlock(list, a.id, null, 3);
  assert.ok(moved);
  assert.deepEqual(moved.map((x) => x.args.steps), [2, 3, 1]);
});

test("odebrání a vložení do těla bloku fungují na vnořené úrovni", () => {
  const leaf = blk("step");
  const rep = blk("repeat", {}, []);
  const top = [rep, leaf];
  const { list: without, removed } = removeBlock(top, leaf.id);
  assert.equal(removed?.id, leaf.id);
  const back = insertBlock(without, rep.id, 0, leaf);
  assert.equal(back[0].body?.[0].id, leaf.id);
});

test("normDir drží směr v rozsahu -180 až 180", () => {
  assert.equal(normDir(270), -90);
  assert.equal(normDir(-270), 90);
  assert.equal(normDir(0), 0);
});
