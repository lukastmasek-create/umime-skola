import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BLOCK_TYPES,
  BOUND_X,
  COSTUME_COUNT,
  SPECS,
  createRuntime,
  insertBlock,
  isAnimating,
  isRunning,
  makeBlock,
  moveBlock,
  normDir,
  removeBlock,
  sanitizeBlocks,
  scriptsOf,
  stopRuntime,
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

test("nabídka má přesně 31 bloků a každý má definici", () => {
  assert.equal(BLOCK_TYPES.length, 31);
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

test("otočení dokola za čas dojede na cílový úhel a zůstane v rozsahu", () => {
  const rt = createRuntime(script(blk("spin", { deg: 720, secs: 1 })));
  for (let i = 0; i < 30; i++) tick(rt, 16);
  assert.ok(isRunning(rt), "uprostřed přechodu skript ještě běží");
  assert.notEqual(normDir(rt.sprite.dir), 90, "uprostřed přechodu se úhel mění");
  runAll(rt);
  assert.equal(normDir(rt.sprite.dir), normDir(90 + 720));
});

test("skok zvedne kočku do výšky a na konci dopadne ve stejném kostýmu", () => {
  const rt = createRuntime(script(blk("costume", { costume: 2 }), blk("jump", { height: 80 })));
  let peak = 0;
  let airPose = -1;
  for (let i = 0; i < 1000 && isRunning(rt); i++) {
    tick(rt, 16);
    peak = Math.max(peak, rt.sprite.lift);
    if (rt.sprite.lift > 40) airPose = rt.sprite.pose;
  }
  assert.ok(peak > 75 && peak <= 80, `výška skoku ${peak}`);
  assert.equal(airPose, 2, "ve vzduchu je kostým skoku");
  assert.equal(rt.sprite.lift, 0);
  assert.equal(rt.sprite.pose, 1);
});

test("zprůhlednění a zvětšení se plynule dojedou na cíl", () => {
  const rt = createRuntime(script(blk("fade", { transparency: 60, secs: 0.5 }), blk("grow", { percent: 250, secs: 0.5 })));
  runAll(rt);
  assert.equal(rt.sprite.ghost, 60);
  assert.equal(rt.sprite.size, 250);
});

test("třpytky vzniknou na místě kočky, doznívají a pak zmizí", () => {
  const rt = createRuntime(script(blk("goto", { x: 40, y: 20 }), blk("sparkle", { count: 5 })));
  runAll(rt);
  assert.equal(rt.fx.length, 1);
  assert.equal(rt.fx[0].count, 5);
  assert.equal(rt.fx[0].x, 40);
  assert.ok(isAnimating(rt), "dokud doznívají, editor pokračuje");
  while (isAnimating(rt)) tick(rt, 16);
  assert.equal(rt.fx.length, 0);
});

test("zastavení vynuluje skok a třpytky, aby kočka nezůstala ve vzduchu", () => {
  const rt = createRuntime(script(blk("sparkle"), blk("jump", { height: 100 })));
  for (let i = 0; i < 5; i++) tick(rt, 16);
  assert.ok(rt.sprite.lift > 0);
  assert.equal(rt.fx.length, 1);
  stopRuntime(rt);
  assert.equal(rt.sprite.lift, 0);
  assert.equal(rt.fx.length, 0);
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
