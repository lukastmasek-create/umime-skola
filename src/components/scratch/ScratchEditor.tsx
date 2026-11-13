"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { ScratchText } from "@/i18n/scratch";
import {
  BLOCK_TYPES,
  BOUND_X,
  BOUND_Y,
  CATEGORIES,
  MAX_BLOCKS,
  SPECS,
  STAGE_H,
  STAGE_W,
  countBlocks,
  createRuntime,
  findBlock,
  insertBlock,
  isRunning,
  makeBlock,
  moveBlock,
  removeBlock as withoutBlock,
  stopRuntime,
  tick,
  updateArg,
  type Block,
  type BlockType,
  type Category,
  type Line,
  type Runtime,
  type Sprite,
  type Value,
} from "@/lib/scratch/engine";
import { checkChallenge, CHALLENGE_IDS, type ChallengeId } from "@/lib/scratch/challenges";
import { BlockIcon, CatSprite, CategoryIcon, FlagIcon, GripIcon, SlidersIcon, StopIcon, TrashIcon } from "./ScratchIcons";

const CAT_COLOR: Record<Category, string> = {
  events: "#ffc933",
  motion: "#8fd0ff",
  pen: "#7ee0b0",
  control: "#ff8a6b",
  looks: "#c9a8ff",
  custom: "#ffb3d9",
};

const INK = "#16132b";

// Globální styly webu (nadpisy, pole) nejsou ve vrstvě Tailwindu, proto barvy dávám přímo inline.
const INK_STYLE = { color: INK } as const;
const FIELD_STYLE = { background: "#ffffff", color: INK } as const;

function collide(args: Parameters<typeof pointerWithin>[0]) {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : closestCenter(args);
}
const PAPER = "#fffaf0";
const PEN_SWATCHES = ["#16132b", "#ff8a6b", "#ffc933", "#7ee0b0", "#8fd0ff", "#c9a8ff"];

// Rychlost: stanice posuvníku od nejrychlejší po nejpomalejší. Násobí čas, takže se pohne všechno naráz.
// mult = násobič času, stepMs = pauza po každém příkazu (jen u režimu krok po kroku).
type SpeedStation = { mult: number; stepMs: number };
const SPEEDS: SpeedStation[] = [
  { mult: 4, stepMs: 0 },
  { mult: 2, stepMs: 0 },
  { mult: 1, stepMs: 0 }, // Normálně
  { mult: 0.5, stepMs: 0 },
  { mult: 0.25, stepMs: 0 },
  { mult: 0.1, stepMs: 0 },
  { mult: 1, stepMs: 1000 }, // Každý příkaz zhruba za sekundu
];
const DEFAULT_SPEED = 2;
// Jak dlouho kočka klouže k nové pozici: na pomalých stanicích delší, aby byl pohyb vidět.
function moveMsFor(s: SpeedStation): number {
  return Math.round(Math.min(900, Math.max(100, 100 / s.mult)));
}
// Herní smyčka běží po krocích max. 16 ms, aby pohyb při vysoké rychlosti zůstal plynulý.
const SUB_STEP_MS = 16;

// Přizpůsobení: velikost menu a jeviště, schované bloky a rychlost. Ukládá se jen do prohlížeče žáka.
type Size = "s" | "m" | "l";
type Prefs = { menu: Size; stage: Size; hidden: BlockType[]; speed: number };
const PREFS_KEY = "umime-scratch-prefs";
const DEFAULT_PREFS: Prefs = { menu: "m", stage: "m", hidden: [], speed: DEFAULT_SPEED };
// Velké jeviště zůstává rozumně široké, aby se pod ním pořád vešly skripty.
const MENU_W: Record<Size, string> = { s: "220px", m: "270px", l: "300px" };
const STAGE_W_COL: Record<Size, string> = { s: "420px", m: "540px", l: "600px" };
const SIZES: Size[] = ["s", "m", "l"];

function isSize(v: unknown): v is Size {
  return v === "s" || v === "m" || v === "l";
}

// Kdyby prohlížeč úložiště nepustil, drží se nastavení aspoň v paměti do obnovení stránky.
const PREFS_EVENT = "umime-scratch-prefs-change";
let memoryPrefs: string | null = null;

function readRawPrefs(): string | null {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw !== null) return raw;
  } catch {
    // Úložiště není dostupné, použije se paměť.
  }
  return memoryPrefs;
}

function subscribePrefs(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREFS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREFS_EVENT, onChange);
  };
}

function parsePrefs(raw: string | null): Prefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const p = JSON.parse(raw) as Partial<Record<keyof Prefs, unknown>>;
    const hidden = Array.isArray(p.hidden)
      ? p.hidden.filter((x): x is BlockType => typeof x === "string" && (BLOCK_TYPES as readonly string[]).includes(x) && x !== "start")
      : [];
    const speed =
      typeof p.speed === "number" && Number.isInteger(p.speed) && p.speed >= 0 && p.speed < SPEEDS.length
        ? p.speed
        : DEFAULT_SPEED;
    return {
      menu: isSize(p.menu) ? p.menu : DEFAULT_PREFS.menu,
      stage: isSize(p.stage) ? p.stage : DEFAULT_PREFS.stage,
      hidden,
      speed,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(p: Prefs) {
  const raw = JSON.stringify(p);
  memoryPrefs = raw;
  try {
    window.localStorage.setItem(PREFS_KEY, raw);
  } catch {
    // Bez úložiště zůstane nastavení v paměti.
  }
  window.dispatchEvent(new Event(PREFS_EVENT));
}

type Snap = { sprite: Sprite; lines: Line[]; say: string | null; error: string | null };
type SaveState = "idle" | "saving" | "saved" | "error";

const EMPTY_SPRITE = createRuntime([]).sprite;
const START_SNAP: Snap = { sprite: EMPTY_SPRITE, lines: [], say: null, error: null };

function takeSnap(rt: Runtime): Snap {
  return { sprite: { ...rt.sprite }, lines: rt.lines.slice(), say: rt.sprite.say, error: rt.error };
}

// Dnd id zóny: "zone|<rodič nebo root>|<index>"
function zoneId(parentId: string | null, index: number): string {
  return `zone|${parentId ?? "root"}|${index}`;
}

function parseZone(id: string): { parentId: string | null; index: number } | null {
  const [kind, parent, idx] = id.split("|");
  if (kind !== "zone") return null;
  const index = Number(idx);
  if (!Number.isInteger(index)) return null;
  return { parentId: parent === "root" ? null : parent, index };
}

type DragData = { kind: "palette"; type: BlockType } | { kind: "block"; id: string };

// Šablona "jdi na x: {x}" → části s textem nebo s vstupem.
function splitTemplate(tpl: string): Array<{ text: string } | { key: string }> {
  return tpl
    .split(/(\{\w+\})/)
    .filter((s) => s !== "")
    .map((s) => {
      const m = /^\{(\w+)\}$/.exec(s);
      return m ? { key: m[1] } : { text: s };
    });
}

// Náhled bloku v nabídce: vstupy nahradí výchozími hodnotami.
function previewLabel(type: BlockType, t: ScratchText): string {
  const fields = SPECS[type].fields;
  return t.blocks[type].replace(/\{(\w+)\}/g, (_, key: string) => {
    const f = fields.find((x) => x.key === key);
    if (!f) return "";
    if (f.kind === "select") return t.options[String(f.def)] ?? String(f.def);
    if (f.kind === "color") return "■";
    return String(f.def);
  });
}

async function saveNow(blocks: Block[]): Promise<boolean> {
  try {
    const res = await fetch("/api/scratch", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ScratchEditor({
  t,
  initialBlocks,
  loggedIn,
  loginHref,
}: {
  t: ScratchText;
  initialBlocks: Block[] | null;
  loggedIn: boolean;
  loginHref: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks ?? []);
  const [snap, setSnap] = useState<Snap>(START_SNAP);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>("idle");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeId | null>(null);
  const [ranOnce, setRanOnce] = useState(false);

  // Na serveru a při prvním vykreslení jsou výchozí hodnoty, pak se načtou z prohlížeče (bez rozdílu při hydrataci).
  const rawPrefs = useSyncExternalStore(subscribePrefs, readRawPrefs, () => null);
  const prefs = useMemo(() => parsePrefs(rawPrefs), [rawPrefs]);

  const rtRef = useRef<Runtime | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const pending = useRef<Block[] | null>(null);
  // Smyčka čte rychlost z reference, aby se změna posuvníku projevila hned, i když skript běží.
  const speedRef = useRef<SpeedStation>(SPEEDS[DEFAULT_SPEED]);
  useEffect(() => {
    speedRef.current = SPEEDS[prefs.speed] ?? SPEEDS[DEFAULT_SPEED];
  }, [prefs.speed]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const flush = useCallback(() => {
    const b = pending.current;
    if (!b) return;
    pending.current = null;
    window.clearTimeout(saveTimer.current);
    setSave("saving");
    void saveNow(b).then((ok) => setSave(ok ? "saved" : "error"));
  }, []);

  // Při odchodu ze stránky ještě odeslat čekající změnu.
  useEffect(() => () => flush(), [flush]);

  const commit = useCallback(
    (next: Block[]) => {
      setBlocks(next);
      if (!loggedIn) return;
      pending.current = next;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(flush, 800);
    },
    [loggedIn, flush],
  );

  // Herní smyčka: běží jen při spuštění, po skončení všech skriptů se zastaví.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const rt = rtRef.current;
      if (!rt) {
        setRunning(false);
        return;
      }
      // Uplynulý čas (max. 64 ms, aby po přepnutí karty nevyskočila kočka) vynásobený rychlostí,
      // rozdělený na krátké kroky. Díky tomu se kočka hýbe plynule i na nejvyšší rychlost.
      rt.stepDelay = speedRef.current.stepMs;
      let budget = Math.min(64, now - last) * speedRef.current.mult;
      last = now;
      while (budget > 0 && isRunning(rt)) {
        const dt = Math.min(SUB_STEP_MS, budget);
        tick(rt, dt);
        budget -= dt;
      }
      setSnap(takeSnap(rt));
      if (!isRunning(rt)) {
        setRunning(false);
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  function run() {
    if (!blocks.some((b) => b.type === "start")) {
      setNotice(t.noHat);
      return;
    }
    setNotice(null);
    setRanOnce(true);
    const rt = createRuntime(blocks);
    rtRef.current = rt;
    setSnap(takeSnap(rt));
    setRunning(true);
  }

  function stop() {
    const rt = rtRef.current;
    if (rt) {
      stopRuntime(rt);
      setSnap(takeSnap(rt));
    }
    setRunning(false);
  }

  function clearAll() {
    if (blocks.length > 0 && !window.confirm(t.clearConfirm)) return;
    stop();
    rtRef.current = null;
    setSnap(START_SNAP);
    setNotice(null);
    commit([]);
  }

  function addBlock(type: BlockType, parentId: string | null, index: number) {
    if (countBlocks(blocks) >= MAX_BLOCKS) {
      setNotice(t.limit);
      return;
    }
    setNotice(null);
    commit(insertBlock(blocks, parentId, index, makeBlock(type)));
  }

  function onDragStart(e: DragStartEvent) {
    const data = e.active.data.current as DragData | undefined;
    if (data?.kind === "palette") setActiveLabel(previewLabel(data.type, t));
    else if (data?.kind === "block") {
      const b = findBlock(blocks, data.id);
      setActiveLabel(b ? previewLabel(b.type, t) : null);
    }
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveLabel(null);
    const { active, over } = e;
    if (!over) return;
    const target = parseZone(String(over.id));
    if (!target) return;
    const data = active.data.current as DragData | undefined;
    if (data?.kind === "palette") {
      addBlock(data.type, target.parentId, target.index);
    } else if (data?.kind === "block") {
      const next = moveBlock(blocks, data.id, target.parentId, target.index);
      if (next) commit(next);
    }
  }

  function setArg(id: string, key: string, value: Value) {
    commit(updateArg(blocks, id, key, value));
  }

  function changePrefs(patch: Partial<Prefs>) {
    savePrefs({ ...prefs, ...patch });
  }

  // Odstartovací blok je vždy vidět, jinak by nešlo nic spustit.
  function setBlockVisible(types: BlockType[], visible: boolean) {
    const affected: BlockType[] = types.filter((x) => x !== "start");
    const hidden = visible
      ? prefs.hidden.filter((x) => !affected.includes(x))
      : Array.from(new Set([...prefs.hidden, ...affected]));
    changePrefs({ hidden });
  }

  function removeBlock(id: string) {
    commit(withoutBlock(blocks, id).list);
  }

  const hasHat = blocks.some((b) => b.type === "start");

  return (
    <DndContext sensors={sensors} collisionDetection={collide} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveLabel(null)}>
    <div className="mb-5 flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCustomOpen((o) => !o)}
          aria-expanded={customOpen}
          style={INK_STYLE}
          className="flex items-center gap-2 rounded-xl border-2 border-[#16132b] bg-[#c9a8ff] px-4 py-2 font-bold shadow-[3px_3px_0_#16132b] transition hover:-translate-y-0.5"
        >
          <SlidersIcon size={18} /> {t.customize}
        </button>
      </div>

      {customOpen && (
        <section
          aria-label={t.customizeTitle}
          className="flex flex-col gap-5 rounded-2xl border-[3px] border-[#16132b] bg-[#fffaf0] p-5 shadow-[6px_6px_0_#16132b]"
        >
          <h2 className="text-xl font-bold" style={{ ...INK_STYLE, fontFamily: "var(--font-heading)" }}>
            {t.customizeTitle}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <SizeChooser label={t.menuSize} value={prefs.menu} onChange={(menu) => changePrefs({ menu })} t={t} />
            <SizeChooser label={t.stageSize} value={prefs.stage} onChange={(stage) => changePrefs({ stage })} t={t} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="font-bold" style={INK_STYLE}>{t.hiddenBlocks}</div>
            <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const types = BLOCK_TYPES.filter((type) => SPECS[type].category === cat);
                const toggleable = types.filter((type) => type !== "start");
                const allShown = toggleable.every((type) => !prefs.hidden.includes(type));
                return (
                  <div key={cat} className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-[#16132b] p-3">
                    <label className="flex items-center gap-2 text-sm font-bold" style={INK_STYLE}>
                      <input
                        type="checkbox"
                        checked={allShown}
                        disabled={toggleable.length === 0}
                        onChange={(e) => setBlockVisible(toggleable, e.target.checked)}
                        className="h-4 w-4 accent-[#16132b]"
                      />
                      <CategoryIcon category={cat} size={20} /> {t.categories[cat]}
                    </label>
                    {types.map((type) => {
                      const shown = !prefs.hidden.includes(type);
                      return (
                        <label key={type} className="flex items-center gap-2 pl-6 text-sm" style={INK_STYLE}>
                          <input
                            type="checkbox"
                            checked={shown}
                            disabled={type === "start"}
                            onChange={(e) => setBlockVisible([type], e.target.checked)}
                            aria-label={`${t.showBlock}: ${previewLabel(type, t)}`}
                            className="h-4 w-4 accent-[#16132b]"
                          />
                          <span className="min-w-0 truncate">{previewLabel(type, t)}</span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => changePrefs({ ...DEFAULT_PREFS })}
              style={INK_STYLE}
              className="rounded-lg border-2 border-[#16132b] px-3 py-1.5 text-sm font-bold hover:bg-[#8fd0ff]/50"
            >
              {t.resetPrefs}
            </button>
          </div>
        </section>
      )}
    </div>

    <div
      className="grid gap-6 lg:grid-cols-[var(--menu-w)_minmax(0,1fr)_var(--stage-w)]"
      style={{ "--menu-w": MENU_W[prefs.menu], "--stage-w": STAGE_W_COL[prefs.stage] } as CSSProperties}
    >
      {/* Jeviště */}
      <section className="order-first flex flex-col gap-3 lg:order-last lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running}
            style={INK_STYLE}
            className="flex items-center gap-2 rounded-xl border-2 border-[#16132b] bg-[#7ee0b0] px-4 py-2 font-bold shadow-[3px_3px_0_#16132b] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <FlagIcon size={18} /> {t.run}
          </button>
          <button
            type="button"
            onClick={stop}
            style={INK_STYLE}
            className="flex items-center gap-2 rounded-xl border-2 border-[#16132b] bg-[#ff8a6b] px-4 py-2 font-bold shadow-[3px_3px_0_#16132b] transition hover:-translate-y-0.5"
          >
            <StopIcon size={16} /> {t.stop}
          </button>
        </div>

        <div className="rounded-2xl border-[3px] border-[#16132b] bg-[#fffaf0] p-3 shadow-[6px_6px_0_#16132b]">
          <Stage snap={snap} label={t.stage} moveMs={moveMsFor(SPEEDS[prefs.speed] ?? SPEEDS[DEFAULT_SPEED])} />
        </div>

        {notice && <div className="rounded-lg border-2 border-dashed border-[#16132b] bg-[#ffc933]/40 px-3 py-2 text-sm font-semibold">{notice}</div>}
        {snap.error && (
          <div role="alert" className="rounded-lg border-2 border-[#16132b] bg-[#ff8a6b] px-3 py-2 text-sm font-semibold">
            {t.error}: {snap.error}
          </div>
        )}
        {!hasHat && !notice && <div className="text-sm text-[var(--muted)]">{t.stageHint}</div>}
        <SaveStatus loggedIn={loggedIn} save={save} t={t} loginHref={loginHref} />

        <ChallengePanel
          t={t}
          selected={challenge}
          onSelect={(id) => {
            setChallenge((cur) => (cur === id ? null : id));
            setRanOnce(false);
          }}
          status={
            challenge === null || running || !ranOnce ? null : checkChallenge(challenge, snap) ? "done" : "retry"
          }
        />
      </section>

      {/* Nabídka bloků */}
      <aside className="order-2 flex flex-col gap-5 rounded-2xl border-[3px] border-[#16132b] bg-[#fffaf0] p-4 lg:order-first lg:max-h-[78vh] lg:overflow-y-auto">
          <SpeedSlider value={prefs.speed} onChange={(speed) => changePrefs({ speed })} t={t} />

          <div role="heading" aria-level={2} className="font-bold text-[#16132b]" style={INK_STYLE}>{t.palette}</div>
          {CATEGORIES.map((cat) => {
            const types = BLOCK_TYPES.filter((type) => SPECS[type].category === cat && !prefs.hidden.includes(type));
            if (types.length === 0) return null;
            return (
              <div key={cat} className="flex flex-col gap-2">
                <div role="heading" aria-level={3} className="flex items-center gap-2 text-sm font-bold text-[#16132b]" style={INK_STYLE}>
                  <CategoryIcon category={cat} size={prefs.menu === "l" ? 26 : 20} /> {t.categories[cat]}
                </div>
                {types.map((type) => (
                  <PaletteItem key={type} type={type} t={t} large={prefs.menu === "l"} onPick={() => addBlock(type, null, blocks.length)} />
                ))}
              </div>
            );
          })}
          <div className="text-xs text-[var(--muted)]">{t.addHint}</div>
      </aside>

      {/* Pracovní plocha se skripty: sdílí DndContext s nabídkou a jevištěm */}
      <section className="order-3 min-w-0 lg:max-h-[78vh] lg:overflow-y-auto">
        <WorkspaceDrop blocks={blocks} t={t} onArg={setArg} onRemove={removeBlock} onClearAll={clearAll} />
      </section>
    </div>
    <DragOverlay>{activeLabel ? <div className="rounded-xl border-2 border-[#16132b] bg-[#fffaf0] px-3 py-1.5 text-sm font-semibold shadow-[3px_3px_0_#16132b]">{activeLabel}</div> : null}</DragOverlay>
    </DndContext>
  );
}

// Posuvník rychlosti: vlevo nejrychleji, vpravo nejpomaleji. Tečky jsou stanice, na kterých se dá zastavit.
function SpeedSlider({ value, onChange, t }: { value: number; onChange: (v: number) => void; t: ScratchText }) {
  const last = SPEEDS.length - 1;
  const stationName = t.speedStations[value] ?? "";
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-[#16132b] bg-white/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="scratch-speed" className="flex items-center gap-1.5 font-bold" style={INK_STYLE}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#ffc933" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          </svg>
          {t.speedTitle}
        </label>
        <span className="rounded-md border-2 border-[#16132b] bg-[#ffc933] px-2 py-0.5 text-xs font-bold" style={INK_STYLE} aria-hidden="true">
          {stationName}
        </span>
      </div>
      <input
        id="scratch-speed"
        type="range"
        min={0}
        max={last}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={stationName}
        className="w-full accent-[#16132b]"
      />
      <div className="flex justify-between px-[6px]" aria-hidden="true">
        {SPEEDS.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full border-2 border-[#16132b] ${i === value ? "bg-[#ffc933]" : "bg-white"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs" style={INK_STYLE}>
        <span>← {t.speedFastest}</span>
        <span>{t.speedSlowest} →</span>
      </div>
    </div>
  );
}

function SizeChooser({ label, value, onChange, t }: { label: string; value: Size; onChange: (v: Size) => void; t: ScratchText }) {
  const names: Record<Size, string> = { s: t.sizeS, m: t.sizeM, l: t.sizeL };
  return (
    <div className="flex flex-col gap-2">
      <div className="font-bold" style={INK_STYLE}>{label}</div>
      <div className="flex gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={value === s}
            onClick={() => onChange(s)}
            style={INK_STYLE}
            className={`flex-1 rounded-xl border-2 border-[#16132b] px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0_#16132b] transition hover:-translate-y-0.5 ${value === s ? "bg-[#ffc933]" : "bg-white"}`}
          >
            {names[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

function PaletteItem({ type, t, large, onPick }: { type: BlockType; t: ScratchText; large: boolean; onPick: () => void }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: `palette|${type}`, data: { kind: "palette", type } satisfies DragData });
  return (
    <div ref={setNodeRef} className={`flex items-stretch gap-1 transition ${isDragging ? "opacity-40" : ""}`}>
      <button
        type="button"
        onClick={onPick}
        className={`flex flex-1 items-center gap-2 rounded-xl border-2 border-[#16132b] px-3 text-left font-semibold shadow-[2px_2px_0_#16132b] transition hover:-translate-y-0.5 ${large ? "py-2.5 text-base" : "py-1.5 text-sm"}`}
        style={{ background: CAT_COLOR[SPECS[type].category], ...INK_STYLE }}
      >
        <BlockIcon type={type} size={large ? 22 : 18} className="shrink-0" />
        <span className="min-w-0">{previewLabel(type, t)}</span>
      </button>
      <span
        {...listeners}
        {...attributes}
        aria-label={t.dragBlock}
        className="flex cursor-grab touch-none items-center rounded-lg border-2 border-dashed border-[#16132b] px-1"
      >
        <GripIcon size={14} />
      </span>
    </div>
  );
}

function WorkspaceDrop({
  blocks,
  t,
  onArg,
  onRemove,
  onClearAll,
}: {
  blocks: Block[];
  t: ScratchText;
  onArg: (id: string, key: string, value: Value) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-[#16132b] bg-[#fffaf0] p-3">
      <div className="flex items-center justify-between gap-2">
        <div role="heading" aria-level={2} className="font-bold text-[#16132b]" style={INK_STYLE}>{t.workspace}</div>
        <button
          type="button"
          onClick={onClearAll}
          style={INK_STYLE}
          className="flex items-center gap-1.5 rounded-lg border-2 border-[#16132b] px-2.5 py-1 text-xs font-bold hover:bg-[#ff8a6b]/40"
        >
          <TrashIcon size={14} /> {t.clearAll}
        </button>
      </div>
      <ListZone parentId={null} list={blocks} t={t} onArg={onArg} onRemove={onRemove} />
    </div>
  );
}

// Seznam bloků s přetahovacími zónami mezi nimi (a na konci).
function ListZone({
  parentId,
  list,
  t,
  onArg,
  onRemove,
}: {
  parentId: string | null;
  list: Block[];
  t: ScratchText;
  onArg: (id: string, key: string, value: Value) => void;
  onRemove: (id: string) => void;
}) {
  if (list.length === 0) {
    return <DropZone id={zoneId(parentId, 0)} big={parentId !== null} empty={parentId === null} />;
  }
  return (
    <div className="flex flex-col">
      {list.map((b, i) => (
        <div key={b.id} className="flex flex-col">
          <DropZone id={zoneId(parentId, i)} />
          <BlockNode block={b} t={t} onArg={onArg} onRemove={onRemove} />
        </div>
      ))}
      <DropZone id={zoneId(parentId, list.length)} />
    </div>
  );
}

function DropZone({ id, big = false, empty = false }: { id: string; big?: boolean; empty?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  if (empty) {
    return (
      <div
        ref={setNodeRef}
        className={`grid place-items-center rounded-xl border-2 border-dashed border-[#16132b] py-8 text-sm text-[var(--muted)] transition ${isOver ? "bg-[#ffc933]/50" : ""}`}
      >
        ↓
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      className={`rounded-full transition-all ${big ? "min-h-10" : "h-3"} ${isOver ? "bg-[#ffc933]" : ""}`}
    />
  );
}

function BlockNode({
  block,
  t,
  onArg,
  onRemove,
}: {
  block: Block;
  t: ScratchText;
  onArg: (id: string, key: string, value: Value) => void;
  onRemove: (id: string) => void;
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `block|${block.id}`,
    data: { kind: "block", id: block.id } satisfies DragData,
  });
  const s = SPECS[block.type];
  const color = CAT_COLOR[s.category];
  const isHat = block.type === "start";
  const parts = splitTemplate(t.blocks[block.type]);

  return (
    <div ref={setNodeRef} className={`transition ${isDragging ? "opacity-40" : ""}`}>
      <div
        className={`flex items-center gap-1 border-2 border-[#16132b] pr-1 shadow-[2px_2px_0_#16132b] ${isHat ? "rounded-t-[26px] rounded-b-lg pl-1" : "rounded-lg"}`}
        style={{ background: color }}
      >
        <span {...listeners} {...attributes} aria-label={t.dragBlock} className="flex cursor-grab touch-none self-stretch items-center px-1">
          <GripIcon size={14} />
        </span>
        <span className="flex shrink-0 items-center">
          <BlockIcon type={block.type} size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 py-2 text-sm font-semibold text-[#16132b]">
          {parts.map((p, i) =>
            "text" in p ? (
              <span key={i}>{p.text}</span>
            ) : (
              <FieldInput key={i} block={block} fieldKey={p.key} t={t} onArg={onArg} />
            ),
          )}
        </div>
        <button type="button" onClick={() => onRemove(block.id)} aria-label={t.removeBlock} className="rounded-md p-1 hover:bg-white/50">
          <TrashIcon size={14} />
        </button>
      </div>
      {s.container && (
        <div className="ml-3 mt-1 border-l-[3px] pl-2" style={{ borderColor: color }}>
          <ListZone parentId={block.id} list={block.body ?? []} t={t} onArg={onArg} onRemove={onRemove} />
        </div>
      )}
    </div>
  );
}

function FieldInput({
  block,
  fieldKey,
  t,
  onArg,
}: {
  block: Block;
  fieldKey: string;
  t: ScratchText;
  onArg: (id: string, key: string, value: Value) => void;
}) {
  const f = SPECS[block.type].fields.find((x) => x.key === fieldKey);
  const value = block.args[fieldKey] ?? f?.def ?? "";
  const label = t.fieldNames[fieldKey] ?? fieldKey;

  if (!f) return null;

  if (f.kind === "select") {
    return (
      <select
        aria-label={label}
        value={String(value)}
        onChange={(e) => onArg(block.id, fieldKey, e.target.value)}
        className="rounded-md border-2 border-[#16132b] px-1 py-0.5 text-sm"
        style={FIELD_STYLE}
      >
        {f.options.map((o) => (
          <option key={o} value={o}>
            {t.options[o] ?? o}
          </option>
        ))}
      </select>
    );
  }

  if (f.kind === "color") {
    return (
      <span role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1">
        {PEN_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={value === c}
            aria-label={c}
            onClick={() => onArg(block.id, fieldKey, c)}
            className={`h-4 w-4 rounded-full border-2 border-[#16132b] ${value === c ? "ring-2 ring-[#16132b] ring-offset-1" : ""}`}
            style={{ background: c }}
          />
        ))}
      </span>
    );
  }

  const wide = f.kind === "text" && f.max > 20;
  return (
    <input
      aria-label={label}
      inputMode={f.kind === "number" ? "decimal" : "text"}
      value={String(value)}
      maxLength={f.kind === "text" ? f.max : 30}
      onChange={(e) => onArg(block.id, fieldKey, e.target.value)}
      className={`rounded-md border-2 border-[#16132b] px-1.5 py-0.5 text-sm ${wide ? "w-36" : "w-16"}`}
      style={FIELD_STYLE}
    />
  );
}

// Jeviště: čára z pera, kočka a bublina řeči. Souřadnice jsou v plátně 480 × 360, střed je uprostřed.
function Stage({ snap, label, moveMs }: { snap: Snap; label: string; moveMs: number }) {
  const { sprite, lines, say } = snap;
  const sx = sprite.x;
  const sy = -sprite.y;
  const bubbleW = say ? Math.min(220, 24 + say.length * 8) : 0;
  return (
    <svg viewBox={`${-STAGE_W / 2} ${-STAGE_H / 2} ${STAGE_W} ${STAGE_H}`} className="block h-auto w-full" role="img" aria-label={label}>
      <defs>
        <pattern id="scratch-dots" width="24" height="24" patternUnits="userSpaceOnUse" x={-STAGE_W / 2} y={-STAGE_H / 2}>
          <circle cx="2" cy="2" r="1.1" fill={INK} opacity=".18" />
        </pattern>
      </defs>
      <rect x={-STAGE_W / 2} y={-STAGE_H / 2} width={STAGE_W} height={STAGE_H} fill={PAPER} />
      <rect x={-STAGE_W / 2} y={-STAGE_H / 2} width={STAGE_W} height={STAGE_H} fill="url(#scratch-dots)" />
      <rect x={-BOUND_X} y={-BOUND_Y} width={BOUND_X * 2} height={BOUND_Y * 2} fill="none" stroke={INK} strokeOpacity=".12" strokeDasharray="4 6" />
      <g>
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={-l.y1} x2={l.x2} y2={-l.y2} stroke={l.color} strokeWidth={l.size} strokeLinecap="round" />
        ))}
      </g>
      {/* Kočka a bublina se jen posouvají k nové pozici; krátký přechod z toho udělá plynulý pohyb, ne skoky. Otočení se nepřechází, aby se neroztočila dokola. */}
      <g
        className="transition-transform ease-linear motion-reduce:transition-none"
        style={{ transform: `translate(${sx}px, ${sy}px)`, transitionDuration: `${moveMs}ms` }}
      >
        <g style={{ transform: `rotate(${sprite.dir - 90}deg) scale(1.1)` }}>
          <CatSprite />
        </g>
        {say && (
          <g>
            <rect x={-bubbleW / 2} y={-78} width={bubbleW} height={30} rx={10} fill="#fff" stroke={INK} strokeWidth={2} />
            <path d="M-6 -48 L0 -40 L6 -48" fill="#fff" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
            <text x={0} y={-58} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill={INK}>
              {say}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}

// Výzvy: vyber jednu, sestav skript a spusť. Výsledek se ukáže až po doběhnutí.
function ChallengePanel({
  t,
  selected,
  onSelect,
  status,
}: {
  t: ScratchText;
  selected: ChallengeId | null;
  onSelect: (id: ChallengeId) => void;
  status: "done" | "retry" | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-[3px] border-[#16132b] bg-[#fffaf0] p-3 shadow-[4px_4px_0_#16132b]">
      <div className="font-bold" style={INK_STYLE}>{t.challengesTitle}</div>
      <div className="flex flex-wrap gap-2">
        {CHALLENGE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={selected === id}
            onClick={() => onSelect(id)}
            style={INK_STYLE}
            className={`rounded-lg border-2 border-[#16132b] px-2.5 py-1 text-sm font-bold transition hover:-translate-y-0.5 ${selected === id ? "bg-[#ffc933]" : "bg-white"}`}
          >
            {t.challenges[id]?.title ?? id}
          </button>
        ))}
      </div>
      {selected === null ? (
        <div className="text-sm text-[var(--muted)]">{t.challengeHint}</div>
      ) : (
        <div className="flex flex-col gap-1 text-sm" style={INK_STYLE}>
          <div>{t.challenges[selected]?.goal}</div>
          {status === "done" && <div className="font-bold text-[#16132b]">✔ {t.challengeDone}</div>}
          {status === "retry" && <div className="font-semibold">{t.challengeRetry}</div>}
        </div>
      )}
    </div>
  );
}

function SaveStatus({ loggedIn, save, t, loginHref }: { loggedIn: boolean; save: SaveState; t: ScratchText; loginHref: string }) {
  if (!loggedIn) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 text-sm text-[var(--muted)]">
        {t.loginHint}
        <Link href={loginHref} className="font-bold text-[var(--foreground)] underline decoration-2 underline-offset-2">
          {t.loginLink}
        </Link>
      </div>
    );
  }
  const text = save === "saving" ? t.saving : save === "saved" ? t.saved : save === "error" ? t.saveFailed : "";
  return (
    <div className="min-h-5 text-sm text-[var(--muted)]" aria-live="polite">
      {text}
    </div>
  );
}
