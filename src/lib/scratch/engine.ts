// Logika Scratch-like bloků: definice bloků, vykonávání skriptů a čištění uložených dat.
// Bez Reactu a DOM, takže jde otestovat přes node --test.

export const STAGE_W = 480;
export const STAGE_H = 360;
// Postavička se drží kousek od okraje, aby nebyla půlka mimo plátno.
export const BOUND_X = STAGE_W / 2 - 24;
export const BOUND_Y = STAGE_H / 2 - 24;

export const MAX_BLOCKS = 300;
export const MAX_DEPTH = 6;
export const MAX_CALL_DEPTH = 40;
export const MAX_LINES = 4000;
export const MAX_SAVE_CHARS = 200_000;

export const PEN_COLORS = ["#16132b", "#ff8a6b", "#ffc933", "#7ee0b0", "#8fd0ff", "#c9a8ff"] as const;

export const CATEGORIES = ["events", "motion", "pen", "control", "looks", "custom"] as const;
export type Category = (typeof CATEGORIES)[number];

export const BLOCK_TYPES = [
  "start",
  "goto",
  "random",
  "step",
  "glide",
  "turn-right",
  "turn-left",
  "edge",
  "pen",
  "pen-color",
  "pen-size",
  "clear",
  "repeat",
  "forever",
  "wait",
  "stop",
  "say",
  "set-var",
  "define",
  "call",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

// Hodnota pole: číslo, nebo text. Text může být odkaz na parametr ve tvaru "$jmeno".
export type Value = number | string;
export type Scope = Record<string, Value>;

export type Block = {
  id: string;
  type: BlockType;
  args: Record<string, Value>;
  body?: Block[];
};

export type FieldSpec =
  | { key: string; kind: "number"; def: number; min: number; max: number }
  | { key: string; kind: "text"; def: string; max: number }
  | { key: string; kind: "select"; def: string; options: readonly string[] }
  | { key: string; kind: "color"; def: string; options: readonly string[] };

export type BlockSpec = {
  category: Category;
  fields: readonly FieldSpec[];
  container: boolean;
  hat: boolean;
};

const num = (key: string, def: number, min: number, max: number): FieldSpec => ({ key, kind: "number", def, min, max });
const text = (key: string, def: string, max = 30): FieldSpec => ({ key, kind: "text", def, max });
const select = (key: string, def: string, options: readonly string[]): FieldSpec => ({ key, kind: "select", def, options });
const color = (key: string, def: string): FieldSpec => ({ key, kind: "color", def, options: PEN_COLORS });

function spec(category: Category, fields: FieldSpec[] = [], flags: { container?: boolean; hat?: boolean } = {}): BlockSpec {
  return { category, fields, container: flags.container ?? false, hat: flags.hat ?? false };
}

// 20 bloků. Každý blok má kategorii, pole (vstupy) a případně tělo (container) nebo je to hlavička skriptu (hat).
export const SPECS: Record<BlockType, BlockSpec> = {
  start: spec("events", [], { hat: true }),
  goto: spec("motion", [num("x", 0, -BOUND_X, BOUND_X), num("y", 0, -BOUND_Y, BOUND_Y)]),
  random: spec("motion"),
  step: spec("motion", [num("steps", 10, -300, 300)]),
  glide: spec("motion", [num("x", 0, -BOUND_X, BOUND_X), num("y", 0, -BOUND_Y, BOUND_Y), num("secs", 1, 0, 30)]),
  "turn-right": spec("motion", [num("deg", 15, -360, 360)]),
  "turn-left": spec("motion", [num("deg", 15, -360, 360)]),
  edge: spec("motion"),
  pen: spec("pen", [select("mode", "down", ["down", "up"])]),
  "pen-color": spec("pen", [color("color", PEN_COLORS[0])]),
  "pen-size": spec("pen", [num("size", 2, 1, 30)]),
  clear: spec("pen"),
  repeat: spec("control", [num("times", 10, 0, 500)], { container: true }),
  forever: spec("control", [], { container: true }),
  wait: spec("control", [num("secs", 1, 0, 60)]),
  stop: spec("control"),
  say: spec("looks", [text("text", "Ahoj!", 60)]),
  "set-var": spec("looks", [text("name", "body", 20), text("value", "0", 30)]),
  define: spec("custom", [text("name", "tvar", 20), text("params", "velikost", 60)], { container: true }),
  call: spec("custom", [text("name", "tvar", 20), text("args", "50", 60)]),
};

export function isBlockType(v: unknown): v is BlockType {
  return typeof v === "string" && (BLOCK_TYPES as readonly string[]).includes(v);
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

let idCounter = 0;
export function newId(): string {
  idCounter += 1;
  return `b${idCounter.toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function makeBlock(type: BlockType): Block {
  const s = SPECS[type];
  const args: Record<string, Value> = {};
  for (const f of s.fields) args[f.key] = f.def;
  return s.container ? { id: newId(), type, args, body: [] } : { id: newId(), type, args };
}

// ---------- hodnoty ----------

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function toNumber(v: Value): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = v.trim();
  const n = Number(s);
  return s !== "" && Number.isFinite(n) ? n : 0;
}

// "$jmeno" → hodnota parametru nebo proměnné (chybějící = 0). Jinak vrátí hodnotu beze změny.
export function resolve(raw: Value, scope: Scope, vars: Scope): Value {
  if (typeof raw === "number") return raw;
  const s = raw.trim();
  if (s.startsWith("$")) {
    const k = s.slice(1);
    if (has(scope, k)) return scope[k];
    if (has(vars, k)) return vars[k];
    return 0;
  }
  return s;
}

// Číselný text (třeba "12") se ukládá jako číslo, ostatní zůstane textem.
export function storeValue(v: Value): Value {
  if (typeof v === "number") return v;
  const s = v.trim();
  const n = Number(s);
  return s !== "" && Number.isFinite(n) ? n : s;
}

export function normDir(d: number): number {
  return ((((d + 180) % 360) + 360) % 360) - 180;
}

// ---------- stav běhu ----------

export type Sprite = {
  x: number;
  y: number;
  dir: number; // 0 = nahoru, 90 = doprava (jako ve Scratchi)
  penDown: boolean;
  penColor: string;
  penSize: number;
  say: string | null;
};

export type Line = { x1: number; y1: number; x2: number; y2: number; color: string; size: number };

type Proc = { params: string[]; body: Block[] };

type Thread = { gen: Generator<number, void, void>; wakeAt: number; done: boolean };

export type Runtime = {
  sprite: Sprite;
  lines: Line[];
  vars: Scope;
  procs: Record<string, Proc>;
  threads: Thread[];
  time: number;
  error: string | null;
  stopped: boolean;
  rng: () => number;
};

// Skripty = blok „Po kliknutí na vlajku“ a bloky za ním, až do dalšího hlavního bloku.
export function scriptsOf(top: readonly Block[]): Block[][] {
  const out: Block[][] = [];
  let cur: Block[] | null = null;
  for (const b of top) {
    if (b.type === "start") {
      cur = [];
      out.push(cur);
    } else if (b.type === "define") {
      cur = null;
    } else if (cur) {
      cur.push(b);
    }
  }
  return out;
}

export function splitList(s: string): string[] {
  return s
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p !== "");
}

export function createRuntime(top: readonly Block[], rng: () => number = Math.random): Runtime {
  const procs: Record<string, Proc> = Object.create(null);
  for (const b of top) {
    if (b.type !== "define") continue;
    const name = String(b.args.name ?? "").trim();
    if (!name || has(procs, name)) continue;
    procs[name] = { params: splitList(String(b.args.params ?? "")), body: b.body ?? [] };
  }
  const rt: Runtime = {
    sprite: { x: 0, y: 0, dir: 90, penDown: false, penColor: PEN_COLORS[0], penSize: 2, say: null },
    lines: [],
    vars: Object.create(null),
    procs,
    threads: [],
    time: 0,
    error: null,
    stopped: false,
    rng,
  };
  rt.threads = scriptsOf(top).map((script) => ({
    gen: runBlocks(rt, script, Object.create(null), 0),
    wakeAt: 0,
    done: false,
  }));
  return rt;
}

export function isRunning(rt: Runtime): boolean {
  return !rt.stopped && rt.error === null && rt.threads.some((t) => !t.done);
}

export function stopRuntime(rt: Runtime): void {
  rt.stopped = true;
  rt.threads = [];
}

// Posune vlákna o dt milisekund. Každé vlákno běží nejvýš jednou za krok, smyčky se vzdají v každé iteraci.
export function tick(rt: Runtime, dt: number): void {
  if (rt.stopped || rt.threads.length === 0) return;
  rt.time += dt;
  for (const th of rt.threads) {
    if (rt.stopped) break;
    if (th.done || rt.time < th.wakeAt) continue;
    try {
      const r = th.gen.next();
      if (r.done) th.done = true;
      else th.wakeAt = rt.time + Math.max(0, r.value);
    } catch (e) {
      rt.error = e instanceof Error ? e.message : "Neznámá chyba.";
      stopRuntime(rt);
      return;
    }
  }
  if (rt.stopped) rt.threads = [];
  else rt.threads = rt.threads.filter((t) => !t.done);
}

// ---------- pohyb a kreslení ----------

function place(rt: Runtime, x: number, y: number): void {
  const s = rt.sprite;
  const nx = clamp(x, -BOUND_X, BOUND_X);
  const ny = clamp(y, -BOUND_Y, BOUND_Y);
  if (s.penDown && (nx !== s.x || ny !== s.y) && rt.lines.length < MAX_LINES) {
    rt.lines.push({ x1: s.x, y1: s.y, x2: nx, y2: ny, color: s.penColor, size: s.penSize });
  }
  s.x = nx;
  s.y = ny;
}

function bounce(s: Sprite): void {
  const r = (s.dir * Math.PI) / 180;
  if ((s.x >= BOUND_X && Math.sin(r) > 0) || (s.x <= -BOUND_X && Math.sin(r) < 0)) s.dir = normDir(-s.dir);
  const r2 = (s.dir * Math.PI) / 180;
  if ((s.y >= BOUND_Y && Math.cos(r2) > 0) || (s.y <= -BOUND_Y && Math.cos(r2) < 0)) s.dir = normDir(180 - s.dir);
}

// ---------- vykonávání ----------

function argNum(rt: Runtime, b: Block, key: string, scope: Scope): number {
  const f = SPECS[b.type].fields.find((x) => x.key === key);
  const raw = b.args[key] ?? f?.def ?? 0;
  const v = toNumber(resolve(raw, scope, rt.vars));
  return f && f.kind === "number" ? clamp(v, f.min, f.max) : v;
}

function argText(rt: Runtime, b: Block, key: string, scope: Scope): string {
  const raw = b.args[key] ?? "";
  return String(resolve(raw, scope, rt.vars));
}

function* runBlocks(rt: Runtime, blocks: readonly Block[], scope: Scope, depth: number): Generator<number, void, void> {
  for (const b of blocks) {
    if (rt.stopped) return;
    yield* runBlock(rt, b, scope, depth);
  }
}

function* runBlock(rt: Runtime, b: Block, scope: Scope, depth: number): Generator<number, void, void> {
  switch (b.type) {
    case "start":
    case "define":
      return;

    case "goto":
      place(rt, argNum(rt, b, "x", scope), argNum(rt, b, "y", scope));
      return;

    case "random":
      place(rt, (rt.rng() * 2 - 1) * BOUND_X, (rt.rng() * 2 - 1) * BOUND_Y);
      return;

    case "step": {
      const n = argNum(rt, b, "steps", scope);
      const r = (rt.sprite.dir * Math.PI) / 180;
      place(rt, rt.sprite.x + n * Math.sin(r), rt.sprite.y + n * Math.cos(r));
      return;
    }

    case "glide": {
      const tx = argNum(rt, b, "x", scope);
      const ty = argNum(rt, b, "y", scope);
      const ms = argNum(rt, b, "secs", scope) * 1000;
      const sx = rt.sprite.x;
      const sy = rt.sprite.y;
      const start = rt.time;
      while (ms > 0 && rt.time - start < ms) {
        if (rt.stopped) return;
        const t = clamp((rt.time - start) / ms, 0, 1);
        place(rt, sx + (tx - sx) * t, sy + (ty - sy) * t);
        yield 0;
      }
      place(rt, tx, ty);
      return;
    }

    case "turn-right":
      rt.sprite.dir = normDir(rt.sprite.dir + argNum(rt, b, "deg", scope));
      return;

    case "turn-left":
      rt.sprite.dir = normDir(rt.sprite.dir - argNum(rt, b, "deg", scope));
      return;

    case "edge":
      bounce(rt.sprite);
      return;

    case "pen":
      rt.sprite.penDown = argText(rt, b, "mode", scope) === "down";
      return;

    case "pen-color": {
      const c = argText(rt, b, "color", scope);
      rt.sprite.penColor = (PEN_COLORS as readonly string[]).includes(c) ? c : PEN_COLORS[0];
      return;
    }

    case "pen-size":
      rt.sprite.penSize = argNum(rt, b, "size", scope);
      return;

    case "clear":
      rt.lines = [];
      return;

    case "repeat": {
      const n = Math.round(argNum(rt, b, "times", scope));
      for (let i = 0; i < n; i++) {
        if (rt.stopped) return;
        yield* runBlocks(rt, b.body ?? [], scope, depth);
        yield 0;
      }
      return;
    }

    case "forever":
      for (;;) {
        if (rt.stopped) return;
        yield* runBlocks(rt, b.body ?? [], scope, depth);
        yield 0;
      }

    case "wait":
      yield argNum(rt, b, "secs", scope) * 1000;
      return;

    case "stop":
      stopRuntime(rt);
      return;

    case "say": {
      const t = argText(rt, b, "text", scope).trim();
      rt.sprite.say = t === "" ? null : t.slice(0, 60);
      return;
    }

    case "set-var": {
      const name = argText(rt, b, "name", scope).trim().slice(0, 20);
      if (!name) return;
      rt.vars[name] = storeValue(argText(rt, b, "value", scope));
      return;
    }

    case "call": {
      const name = argText(rt, b, "name", scope).trim();
      if (!has(rt.procs, name)) throw new Error(`Blok „${name}“ není definovaný.`);
      if (depth >= MAX_CALL_DEPTH) throw new Error("Bloky se volají moc hluboko do sebe.");
      const proc = rt.procs[name];
      // Argumenty jsou odděleny čárkou; každý se vyhodnotí zvlášť (třeba "$velikost, 10").
      const values = splitList(String(b.args.args ?? ""));
      const inner: Scope = Object.create(null);
      proc.params.forEach((p, i) => {
        inner[p] = i < values.length ? resolve(values[i], scope, rt.vars) : 0;
      });
      yield* runBlocks(rt, proc.body, inner, depth + 1);
      return;
    }
  }
}

// ---------- strom bloků (pro editor) ----------

export function countBlocks(list: readonly Block[]): number {
  let n = 0;
  for (const b of list) n += 1 + countBlocks(b.body ?? []);
  return n;
}

export function locate(list: readonly Block[], id: string, parentId: string | null = null): { parentId: string | null; index: number } | null {
  const idx = list.findIndex((b) => b.id === id);
  if (idx >= 0) return { parentId, index: idx };
  for (const b of list) {
    if (b.body) {
      const r = locate(b.body, id, b.id);
      if (r) return r;
    }
  }
  return null;
}

export function findBlock(list: readonly Block[], id: string): Block | null {
  for (const b of list) {
    if (b.id === id) return b;
    if (b.body) {
      const r = findBlock(b.body, id);
      if (r) return r;
    }
  }
  return null;
}

export function containsId(block: Block, id: string): boolean {
  if (block.id === id) return true;
  return (block.body ?? []).some((c) => containsId(c, id));
}

export function removeBlock(list: readonly Block[], id: string): { list: Block[]; removed: Block | null } {
  const idx = list.findIndex((b) => b.id === id);
  if (idx >= 0) {
    return { list: [...list.slice(0, idx), ...list.slice(idx + 1)], removed: list[idx] };
  }
  const next: Block[] = [];
  let removed: Block | null = null;
  for (const b of list) {
    if (!removed && b.body) {
      const r = removeBlock(b.body, id);
      if (r.removed) {
        removed = r.removed;
        next.push({ ...b, body: r.list });
        continue;
      }
    }
    next.push(b);
  }
  return { list: removed ? next : [...list], removed };
}

export function insertBlock(list: readonly Block[], parentId: string | null, index: number, block: Block): Block[] {
  if (parentId === null) {
    const i = clamp(index, 0, list.length);
    return [...list.slice(0, i), block, ...list.slice(i)];
  }
  return list.map((b) => {
    if (b.id === parentId) {
      const body = b.body ?? [];
      const i = clamp(index, 0, body.length);
      return { ...b, body: [...body.slice(0, i), block, ...body.slice(i)] };
    }
    if (b.body) return { ...b, body: insertBlock(b.body, parentId, index, block) };
    return b;
  });
}

export function updateArg(list: readonly Block[], id: string, key: string, value: Value): Block[] {
  return list.map((b) => {
    if (b.id === id) return { ...b, args: { ...b.args, [key]: value } };
    if (b.body) return { ...b, body: updateArg(b.body, id, key, value) };
    return b;
  });
}

// Přesun bloku do cílové zóny (rodič + index). Vrací null, když by blok skončil uvnitř sebe.
export function moveBlock(list: readonly Block[], id: string, parentId: string | null, index: number): Block[] | null {
  const moving = findBlock(list, id);
  if (!moving) return null;
  if (parentId !== null && containsId(moving, parentId)) return null;
  const loc = locate(list, id);
  if (!loc) return null;
  const { list: without, removed } = removeBlock(list, id);
  if (!removed) return null;
  const adjusted = loc.parentId === parentId && loc.index < index ? index - 1 : index;
  return insertBlock(without, parentId, adjusted, removed);
}

// ---------- čištění dat (ze serveru i z editoru) ----------

function cleanField(v: unknown, f: FieldSpec): Value {
  if (f.kind === "number") {
    if (typeof v === "number" && Number.isFinite(v)) return clamp(v, f.min, f.max);
    if (typeof v === "string" && v.length <= 30) return v;
    return f.def;
  }
  if (f.kind === "text") return typeof v === "string" ? v.slice(0, f.max) : f.def;
  return typeof v === "string" && f.options.includes(v) ? v : f.def;
}

function safeId(v: unknown): string {
  return typeof v === "string" && /^[a-z0-9]{1,40}$/i.test(v) ? v : newId();
}

// Ze surových dat (JSON) udělá bezpečný seznam bloků: zná jen naše typy, omezí hloubku a počet.
export function sanitizeBlocks(raw: unknown): Block[] {
  let count = 0;

  const list = (arr: unknown, depth: number, top: boolean): Block[] => {
    if (!Array.isArray(arr)) return [];
    const out: Block[] = [];
    for (const item of arr) {
      if (count >= MAX_BLOCKS) break;
      const b = one(item, depth, top);
      if (b) out.push(b);
    }
    return out;
  };

  const one = (item: unknown, depth: number, top: boolean): Block | null => {
    if (!isRecord(item) || !isBlockType(item.type)) return null;
    const type = item.type;
    // Hlavičky skriptů a definice patří jen na nejvyšší úroveň.
    if ((type === "start" || type === "define") && !top) return null;
    count += 1;
    const s = SPECS[type];
    const rawArgs = isRecord(item.args) ? item.args : {};
    const args: Record<string, Value> = {};
    for (const f of s.fields) args[f.key] = cleanField(rawArgs[f.key], f);
    const b: Block = { id: safeId(item.id), type, args };
    if (s.container) b.body = depth >= MAX_DEPTH ? [] : list(item.body, depth + 1, false);
    return b;
  };

  const root = isRecord(raw) ? raw.blocks : undefined;
  return list(root, 0, true);
}
