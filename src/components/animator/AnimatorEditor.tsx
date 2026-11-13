"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import type { AnimatorText } from "@/i18n/animator";
import { INK, SKETCH_RADIUS } from "@/components/scratch/theme";
import { TrashIcon } from "@/components/scratch/ScratchIcons";
import {
  ANIM_COLORS,
  ANIM_SHAPES,
  EASINGS,
  LIMITS,
  MAX_DURATION,
  MAX_OBJECTS,
  MIN_DURATION,
  clampPose,
  defaultProject,
  keyAt,
  makeObject,
  poseAt,
  removeKeyAt,
  sanitizeProject,
  upsertKey,
  type AnimObject,
  type Easing,
  type Key,
  type Pose,
  type Project,
} from "@/lib/animator/model";
import { ShapeArt, ShapeIcon } from "./AnimatorShapes";

const STORE_KEY = "umime-animator-v1";
const W = 480;
const H = 320;
const PROPS = ["x", "y", "rot", "scale", "opacity"] as const;

const PANEL = "rounded-2xl border-[3px] border-[#16132b] bg-[#fffaf0] p-4 shadow-[6px_6px_0_#16132b]";
const BTN =
  "rounded-xl border-2 border-[#16132b] bg-white px-3 py-1.5 text-sm font-bold text-[#16132b] shadow-[2px_2px_0_#16132b] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0";
const SKETCH: CSSProperties = { borderRadius: SKETCH_RADIUS };
const INK_STYLE = { color: INK } as const;

const roundT = (t: number) => Math.round(t * 100) / 100;

const FALLBACK = defaultProject();

// Úložiště je jen v prohlížeči daného člověka. Když není dostupné, editor funguje dál bez ukládání.
function subscribeStored(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
}

function parseStored(raw: string | null): Project | null {
  if (!raw) return null;
  try {
    return sanitizeProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveProject(p: Project): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    // Prohlížeč úložiště zakázal, animace se prostě neuloží.
  }
}

export function AnimatorEditor({ t }: { t: AnimatorText }) {
  // Uložená verze se čte přes useSyncExternalStore, takže se na serveru ani při hydrataci nic nerozjede.
  const rawStored = useSyncExternalStore(subscribeStored, readStored, () => null);
  const stored = useMemo(() => parseStored(rawStored), [rawStored]);
  // Úpravy v paměti mají přednost před uloženou verzí.
  const [edits, setEdits] = useState<Project | null>(null);
  const project = edits ?? stored ?? FALLBACK;
  const setProject = (fn: (p: Project) => Project) => setEdits((prev) => fn(prev ?? project));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const timeRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (edits) saveProject(edits);
  }, [edits]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // Přehrávání: posouvá čas podle snímků prohlížeče. Na konci se buď vrátí na začátek, nebo zastaví.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let next = timeRef.current + dt;
      if (next >= project.duration) {
        if (!loop) {
          timeRef.current = project.duration;
          setTime(project.duration);
          setPlaying(false);
          return;
        }
        next = next % project.duration;
      }
      timeRef.current = next;
      setTime(next);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, loop, project.duration]);

  const selected = project.objects.find((o) => o.id === selectedId) ?? project.objects[0] ?? null;
  const pose: Pose | null = selected ? poseAt(selected.keys, time) : null;
  const keyHere = selected ? keyAt(selected.keys, time) : null;

  function updateObject(id: string, fn: (o: AnimObject) => AnimObject) {
    setProject((p) => ({ ...p, objects: p.objects.map((o) => (o.id === id ? fn(o) : o)) }));
  }

  // Uloží polohu v aktuálním čase. Když tam klíč je, přepíše ho a zachová jeho plynulost.
  function keyPose(id: string, change: Partial<Pose>, ease?: Easing) {
    const at = roundT(timeRef.current);
    updateObject(id, (o) => {
      const current = poseAt(o.keys, at);
      const existing = keyAt(o.keys, at);
      const next: Key = { t: at, ...clampPose({ ...current, ...change }), ease: ease ?? existing?.ease ?? "ease" };
      return { ...o, keys: upsertKey(o.keys, next) };
    });
  }

  function deleteKey() {
    if (!selected) return;
    const at = roundT(time);
    updateObject(selected.id, (o) => (o.keys.length <= 1 ? o : { ...o, keys: removeKeyAt(o.keys, at) }));
  }

  function addObject() {
    if (project.objects.length >= MAX_OBJECTS) return;
    const n = project.objects.length;
    const shape = ANIM_SHAPES[n % ANIM_SHAPES.length];
    const id = `o${Date.now().toString(36)}`;
    const o = makeObject(id, t.shapes[shape], shape, ANIM_COLORS[n % ANIM_COLORS.length]);
    o.keys[0] = { ...o.keys[0], x: ((n % 5) - 2) * 70 };
    setProject((p) => ({ ...p, objects: [...p.objects, o] }));
    setSelectedId(id);
  }

  function deleteObject() {
    if (!selected) return;
    const rest = project.objects.filter((o) => o.id !== selected.id);
    setProject((p) => ({ ...p, objects: rest }));
    setSelectedId(rest[0]?.id ?? null);
  }

  function setDuration(raw: number) {
    const d = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(raw * 2) / 2));
    setProject((p) => ({
      ...p,
      duration: d,
      // Klíče za koncem se přitáhnou na konec, aby nezmizely z osy.
      objects: p.objects.map((o) => ({
        ...o,
        keys: o.keys.reduce<Key[]>((acc, k) => upsertKey(acc, { ...k, t: Math.min(k.t, d) }), []),
      })),
    }));
    setTime((cur) => Math.min(cur, d));
  }

  function reset() {
    if (!window.confirm(t.resetConfirm)) return;
    const p = defaultProject();
    setEdits(p);
    setSelectedId(p.objects[0]?.id ?? null);
    setTime(0);
    setPlaying(false);
  }

  // ---------- jeviště: přetahování postavy ----------

  function toStage(e: PointerEvent<SVGElement>) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W - W / 2, y: ((e.clientY - r.top) / r.height) * H - H / 2 };
  }

  function onObjectDown(e: PointerEvent<SVGGElement>, o: AnimObject) {
    e.stopPropagation();
    setSelectedId(o.id);
    setPlaying(false);
    const p = toStage(e);
    const cur = poseAt(o.keys, time);
    dragRef.current = { id: o.id, dx: p.x - cur.x, dy: p.y - cur.y };
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function onStageMove(e: PointerEvent<SVGSVGElement>) {
    const d = dragRef.current;
    if (!d) return;
    const p = toStage(e);
    keyPose(d.id, { x: p.x - d.dx, y: p.y - d.dy });
  }

  function onStageUp() {
    dragRef.current = null;
  }

  const duration = project.duration;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-5">
        <div className={PANEL} style={SKETCH}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button type="button" className={BTN} onClick={() => {
              if (!playing && timeRef.current >= duration) setTime(0);
              setPlaying((p) => !p);
            }} aria-pressed={playing}>
              {playing ? t.pause : t.play}
            </button>
            <label className="flex items-center gap-1.5 text-sm font-bold" style={INK_STYLE}>
              <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> {t.loop}
            </label>
            <span className="ml-auto text-sm font-bold tabular-nums" style={INK_STYLE}>
              {time.toFixed(2)} s / {duration} s
            </span>
          </div>

          <svg
            ref={svgRef}
            viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
            className="block h-auto w-full touch-none select-none rounded-xl border-2 border-[#16132b] bg-[#fffaf0]"
            role="img"
            aria-label={t.stageLabel}
            onPointerMove={onStageMove}
            onPointerUp={onStageUp}
            onPointerCancel={onStageUp}
          >
            <defs>
              <pattern id="animator-dots" width="24" height="24" patternUnits="userSpaceOnUse" x={-W / 2} y={-H / 2}>
                <circle cx="2" cy="2" r="1.1" fill={INK} opacity=".16" />
              </pattern>
            </defs>
            <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="url(#animator-dots)" />
            <path d="M-220 118 C-120 108 120 126 220 116" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth={3} strokeDasharray="8 8" />
            {project.objects.map((o) => {
              const p = poseAt(o.keys, time);
              const isSel = o.id === selected?.id;
              return (
                <g
                  key={o.id}
                  transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.scale})`}
                  opacity={p.opacity}
                  onPointerDown={(e) => onObjectDown(e, o)}
                  style={{ cursor: "grab" }}
                >
                  {isSel && <circle r={52} fill="none" stroke="#ffc933" strokeWidth={5} strokeDasharray="6 8" />}
                  <ShapeArt shape={o.shape} color={o.color} />
                </g>
              );
            })}
            {project.objects.length === 0 && (
              <text x={0} y={0} textAnchor="middle" fontSize={18} fontWeight={700} fill={INK}>
                {t.noObject}
              </text>
            )}
          </svg>
        </div>

        <div className={PANEL} style={SKETCH}>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold" style={INK_STYLE}>{t.timeline}</span>
            <label className="ml-auto flex items-center gap-2 text-sm font-bold" style={INK_STYLE}>
              {t.duration}
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_DURATION}
                step={0.5}
                value={duration}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (Number.isFinite(v)) setDuration(v);
                }}
                className="w-20 rounded-lg border-2 border-[#16132b] bg-white px-2 py-1"
              />
              s
            </label>
          </div>
          <input
            type="range"
            aria-label={t.timeline}
            min={0}
            max={duration}
            step={0.01}
            value={Math.min(time, duration)}
            onChange={(e) => {
              setPlaying(false);
              setTime(parseFloat(e.target.value));
            }}
            className="w-full accent-[#ff8a6b]"
          />
          {/* Stopa s klíči vybrané postavy: kosočtverec = klíč, klik na něj přeskočí na jeho čas. */}
          <div className="relative mt-2 h-8 rounded-lg border-2 border-dashed border-[#16132b]/40">
            {selected?.keys.map((k) => (
              <button
                key={k.t}
                type="button"
                aria-label={`${t.timeline} ${k.t.toFixed(2)} s`}
                onClick={() => {
                  setPlaying(false);
                  setTime(k.t);
                }}
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-[#16132b] bg-[#ffc933] hover:scale-125"
                style={{ left: `${(k.t / duration) * 100}%` }}
              />
            ))}
            <div className="absolute inset-y-0 w-[3px] bg-[#ff8a6b]" style={{ left: `${(Math.min(time, duration) / duration) * 100}%` }} />
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <div className={PANEL} style={SKETCH}>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold" style={INK_STYLE}>{t.addObject}</span>
            <button type="button" className={BTN} onClick={addObject} disabled={project.objects.length >= MAX_OBJECTS}>
              +
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {project.objects.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedId(o.id)}
                aria-pressed={o.id === selected?.id}
                aria-label={o.name}
                className={`flex items-center justify-center rounded-xl border-2 border-[#16132b] bg-white p-1 transition ${o.id === selected?.id ? "ring-4 ring-[#ffc933]" : ""}`}
              >
                <ShapeIcon shape={o.shape} color={o.color} size={36} />
              </button>
            ))}
          </div>
        </div>

        {selected && pose && (
          <div className={PANEL} style={SKETCH}>
            <div className="mb-3 flex items-center gap-2">
              <input
                value={selected.name}
                maxLength={20}
                aria-label={t.objectName}
                onChange={(e) => updateObject(selected.id, (o) => ({ ...o, name: e.target.value }))}
                className="min-w-0 flex-1 rounded-lg border-2 border-[#16132b] bg-white px-2 py-1 font-bold"
              />
              <button type="button" className={`${BTN} px-2`} onClick={deleteObject} aria-label={t.deleteObject} title={t.deleteObject}>
                <TrashIcon size={16} />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={t.shape}>
              {ANIM_SHAPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selected.shape === s}
                  onClick={() => updateObject(selected.id, (o) => ({ ...o, shape: s }))}
                  title={t.shapes[s]}
                  className={`rounded-lg border-2 border-[#16132b] bg-white p-0.5 ${selected.shape === s ? "ring-4 ring-[#ffc933]" : ""}`}
                >
                  <ShapeIcon shape={s} color={selected.color} size={30} />
                </button>
              ))}
            </div>
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t.color}>
              {ANIM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  aria-pressed={selected.color === c}
                  onClick={() => updateObject(selected.id, (o) => ({ ...o, color: c }))}
                  className={`h-7 w-7 rounded-full border-2 border-[#16132b] ${selected.color === c ? "ring-4 ring-[#ffc933]" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {PROPS.map((k) => {
                const [lo, hi] = LIMITS[k];
                const step = k === "scale" || k === "opacity" ? 0.05 : 1;
                return (
                  <label key={k} className="flex flex-col gap-1 text-sm font-bold" style={INK_STYLE}>
                    <span className="flex justify-between">
                      <span>{t.props[k]}</span>
                      <span className="tabular-nums">{Number(pose[k].toFixed(2))}</span>
                    </span>
                    <input
                      type="range"
                      min={lo}
                      max={hi}
                      step={step}
                      value={pose[k]}
                      onChange={(e) => keyPose(selected.id, { [k]: parseFloat(e.target.value) } as Partial<Pose>)}
                      className="accent-[#7ee0b0]"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t-2 border-dashed border-[#16132b]/30 pt-4">
              <p className="text-xs" style={INK_STYLE}>{t.keyHint}</p>
              <label className="flex items-center justify-between gap-2 text-sm font-bold" style={INK_STYLE}>
                {t.ease}
                <select
                  value={keyHere?.ease ?? "ease"}
                  onChange={(e) => keyPose(selected.id, {}, e.target.value as Easing)}
                  className="rounded-lg border-2 border-[#16132b] bg-white px-2 py-1"
                >
                  {EASINGS.map((e) => (
                    <option key={e} value={e}>{t.easings[e]}</option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={BTN} onClick={() => keyPose(selected.id, {})}>
                  {t.addKey}
                </button>
                <button type="button" className={BTN} onClick={deleteKey} disabled={!keyHere || selected.keys.length <= 1}>
                  {t.deleteKey}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={PANEL} style={SKETCH}>
          <p className="mb-2 font-bold" style={INK_STYLE}>{t.howTitle}</p>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm" style={INK_STYLE}>
            {t.howSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-xs" style={INK_STYLE}>{t.saved}</span>
            <button type="button" className={BTN} onClick={reset}>
              {t.reset}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
