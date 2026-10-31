"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTown3dText } from "@/i18n/town3d";
import { getHeroLook } from "@/lib/hero";
import { useAccount } from "@/lib/use-account";
import { notifyAccountChanged } from "@/lib/account-events";
import { PLACES } from "@/lib/town3d/layout";
import type { WorldHandle } from "@/lib/town3d/world";
import { BUILDINGS, BUILDING_IDS, MAX_BUILDING_LEVEL, SET_REWARD, TREASURE_SETS, TREASURE_SET_IDS, type BuildingId, type QuestSnapshot, type TreasureSet } from "@/lib/town-progress";

type Tab = "places" | "quests" | "build" | "treasures";
type Spots = { spots: { idx: number; slot: number; kind: string }[]; collected: number[] } | null;
const WORLD_OF_SET: Record<TreasureSet, string> = { pirati: "pristav", les: "les", vesmir: "stanice", hrad: "hrad", more: "more" };
// Kdo zadává úkol → nad kterým místem svítí vykřičník.
const QUEST_PLACE: Record<string, string> = { babicka: "babicka", farmar: "farmar", kluk: "kluk", pekar: "pekarna", knihovnice: "knihovna" };

// Živé 3D městečko jako hra ve stránce: engine (lib/town3d/world.ts) + popisky, panel a info o místě.
export function TownWorld({ locale }: { locale: Locale }) {
  const { ui, places: names } = getTown3dText(locale);
  const box = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const world = useRef<WorldHandle | null>(null);
  const [account] = useAccount();
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [tab, setTab] = useState<Tab>("places");
  const [selected, setSelected] = useState<string>("namesti");
  const [night, setNight] = useState(false);
  const [build, setBuild] = useState(false);
  const [spots, setSpots] = useState<Spots>(null);
  const [quests, setQuests] = useState<QuestSnapshot>([]);
  const [levels, setLevels] = useState<Partial<Record<BuildingId, number>>>({});
  const [treasures, setTreasures] = useState<{ pieces: Record<string, number>; claimed: TreasureSet[] }>({ pieces: {}, claimed: [] });
  const [toast, setToast] = useState<string | null>(null);
  const spotsRef = useRef<Spots>(null);
  const loggedIn = !!account && account.loggedIn;

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  // načtení stavu ze serveru
  const refresh = useCallback(async () => {
    const [s, q, b, t] = await Promise.all([
      fetch("/api/mestecko").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/mestecko/ukoly").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/mestecko/budovy").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/mestecko/poklady").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    if (s?.spots) setSpots({ spots: s.spots, collected: s.collected ?? [] });
    if (q?.quests) setQuests(q.quests);
    if (b?.levels) setLevels(b.levels);
    if (t?.pieces) setTreasures({ pieces: t.pieces, claimed: t.claimed ?? [] });
  }, []);

  useEffect(() => {
    void refresh(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [refresh]);

  useEffect(() => {
    spotsRef.current = spots;
    if (!spots) return;
    world.current?.setCollectibles(spots.spots.map((s) => ({ slot: s.slot, kind: s.kind, taken: spots.collected.includes(s.idx) })));
  }, [spots, state]);

  useEffect(() => {
    const ids = quests.filter((q) => !q.claimed).map((q) => QUEST_PLACE[q.giver]).filter(Boolean);
    world.current?.setQuestMarks([...new Set(ids)]);
  }, [quests, state]);

  // engine
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let disposed = false;
    let handle: WorldHandle | null = null;
    import("@/lib/town3d/world").then(({ createWorld }) => {
      if (disposed) return;
      handle = createWorld(el, {
        look: getHeroLook(),
        onSelect: (id) => setSelected(id),
        onArrive: (id) => say(`${ui.arrived}: ${names[id]?.name ?? id}`),
        onReady: () => setState("ready"),
        onCollect: async (slot) => {
          const spot = spotsRef.current?.spots.find((s) => s.slot === slot);
          if (!spot) return;
          const res = await fetch("/api/mestecko", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idx: spot.idx }) }).catch(() => null);
          const data = res?.ok ? await res.json() : null;
          if (data?.gained) {
            say(`+${data.gained} 🪙${data.treasure ? ` · 💎 ${data.treasure}` : ""}`);
            setSpots({ spots: data.spots, collected: data.collected });
            notifyAccountChanged();
            void refresh();
          }
        },
      });
      if (!handle) {
        setState("failed");
        return;
      }
      world.current = handle;
      // popisky: prvky se vytvoří jednou, engine je každý snímek posune
      const layer = labelsRef.current;
      const els = new Map<string, HTMLButtonElement>();
      if (layer) {
        for (const p of PLACES) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = `town3d-label town3d-label-${p.kind}`;
          b.textContent = `${p.icon} ${names[p.id]?.name ?? p.id}`;
          b.addEventListener("click", () => {
            setSelected(p.id);
            handle?.walkTo(p.id);
          });
          layer.appendChild(b);
          els.set(p.id, b);
        }
      }
      handle.labels((items) => {
        for (const it of items) {
          const b = els.get(it.id);
          if (!b) continue;
          b.style.display = it.visible ? "" : "none";
          if (it.visible) b.style.transform = `translate(${it.x}px, ${it.y}px) translate(-50%, -100%)`;
        }
      });
    });
    return () => {
      disposed = true;
      handle?.dispose();
      world.current = null;
      if (labelsRef.current) labelsRef.current.innerHTML = ""; // eslint-disable-line react-hooks/exhaustive-deps
    };
  }, [names, say, refresh, ui.arrived]);

  // noc podle hodin (večer a v noci), dá se přepnout
  useEffect(() => {
    const h = new Date().getHours();
    setNight(h >= 20 || h < 6); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  useEffect(() => world.current?.setNight(night), [night, state]);
  useEffect(() => world.current?.setBuildMode(build), [build, state]);


  async function claimQuest(id: string) {
    const res = await fetch("/api/mestecko/ukoly", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claim: id }) }).catch(() => null);
    const data = res?.ok ? await res.json() : null;
    if (data?.quests) {
      setQuests(data.quests);
      say(`+${data.gained} 🪙`);
      notifyAccountChanged();
    }
  }
  async function upgrade(id: BuildingId) {
    const res = await fetch("/api/mestecko/budovy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ upgrade: id }) }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (data?.levels) {
      setLevels(data.levels);
      notifyAccountChanged();
      say(`${BUILDINGS[id].icon} ${names[id]?.name ?? id}: ${ui.level} ${data.levels[id]}`);
    }
  }
  async function claimSet(set: TreasureSet) {
    const res = await fetch("/api/mestecko/poklady", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claim: set }) }).catch(() => null);
    const data = res?.ok ? await res.json() : null;
    if (data?.pieces) {
      setTreasures({ pieces: data.pieces, claimed: data.claimed });
      say(`+${data.gained} 🪙`);
      notifyAccountChanged();
    }
  }

  function fullscreen() {
    const el = shell.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => {});
  }

  const sel = PLACES.find((p) => p.id === selected) ?? PLACES[0];
  const selText = names[sel.id];
  const points = account && account.loggedIn ? account.points : null;
  const placeRow = (id: string, sub?: string, right?: React.ReactNode) => {
    const p = PLACES.find((x) => x.id === id)!;
    return (
      <button
        key={id}
        type="button"
        onClick={() => {
          setSelected(id);
          world.current?.walkTo(id);
        }}
        className={`town3d-row ${selected === id ? "is-on" : ""}`}
      >
        <span className="text-xl" aria-hidden>
          {p.icon}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-bold">{names[id]?.name ?? id}</span>
          {sub && <span className="block truncate text-xs opacity-70">{sub}</span>}
        </span>
        {right}
      </button>
    );
  };

  return (
    <div ref={shell} className="town3d-shell relative h-[calc(100dvh-112px)] min-h-[560px] w-full overflow-hidden bg-[#a9dcff]">
      <div ref={box} className="absolute inset-0" aria-label={ui.hint} role="application" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 overflow-hidden" />

      {state !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#a9dcff]/80 text-lg font-bold text-[#1b1840]">
          {state === "failed" ? (
            <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow">
              <p className="mb-3">{ui.noWebgl}</p>
              <Link href={`/${locale}/mestecko`} className="btn-bouncy btn-primary">
                {ui.oldTown}
              </Link>
            </div>
          ) : (
            <span className="animate-pulse">🏗️ {ui.loading}</span>
          )}
        </div>
      )}

      {/* horní lišta */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-center gap-2">
        <span className="town3d-chip font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          🏘️ {ui.title}
        </span>
        {points !== null && <span className="town3d-chip">🪙 {points}</span>}
        {account && account.loggedIn && <span className="town3d-chip">⭐ {account.level}</span>}
        {spots && (
          <span className="town3d-chip">
            ✨ {ui.collected} {spots.collected.length}/{spots.spots.length}
          </span>
        )}
        <span className="flex-1" />
        <button type="button" className="town3d-chip pointer-events-auto" aria-pressed={build} onClick={() => setBuild((b) => !b)}>
          🏗️ {ui.buildMode}
        </button>
        <button type="button" className="town3d-chip pointer-events-auto" onClick={() => setNight((n) => !n)}>
          {night ? `☀️ ${ui.day}` : `🌙 ${ui.night}`}
        </button>
        <button type="button" className="town3d-chip pointer-events-auto" onClick={fullscreen}>
          ⛶ {ui.fullscreen}
        </button>
        <Link href={`/${locale}/mestecko`} className="town3d-chip pointer-events-auto">
          ↩ {ui.oldTown}
        </Link>
      </div>

      {/* panel */}
      <aside className="town3d-panel absolute bottom-3 right-3 top-16 flex w-[290px] flex-col overflow-hidden max-md:left-3 max-md:top-auto max-md:h-[44%] max-md:w-auto">
        <div className="grid grid-cols-4 gap-1 p-2" role="tablist">
          {(["places", "quests", "build", "treasures"] as Tab[]).map((x) => (
            <button key={x} type="button" role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className="town3d-tab">
              <span aria-hidden>{{ places: "📍", quests: "❗", build: "🏗️", treasures: "💎" }[x]}</span>
              {ui.tabs[x]}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 overflow-auto p-2 pt-0">
          {tab === "places" && (
            <>
              <h3 className="town3d-h">{ui.worlds}</h3>
              {PLACES.filter((p) => p.kind === "world").map((p) => placeRow(p.id))}
              <h3 className="town3d-h">{ui.town}</h3>
              {PLACES.filter((p) => p.kind === "place").map((p) => placeRow(p.id))}
              <h3 className="town3d-h">{ui.homes}</h3>
              {PLACES.filter((p) => p.kind === "home").map((p) => placeRow(p.id))}
            </>
          )}
          {tab === "quests" && (
            <>
              {!loggedIn && <p className="p-2 text-sm opacity-80">{ui.questsEmpty}</p>}
              {quests.map((q) => {
                const done = q.progress >= q.target;
                const place = QUEST_PLACE[q.giver];
                return (
                  <div key={q.id} className="town3d-card">
                    <p className="text-sm font-bold">{ui.quest[q.kind].replace("{n}", String(q.target))}</p>
                    <p className="text-xs opacity-70">{place ? names[place]?.name : ""}</p>
                    <div className="my-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full rounded-full bg-[#7ee0b0]" style={{ width: `${(q.progress / q.target) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span>
                        {q.progress}/{q.target} · +{q.reward} 🪙
                      </span>
                      {q.claimed ? (
                        <span className="font-bold text-[#7ee0b0]">✓ {ui.claimed}</span>
                      ) : done ? (
                        <button type="button" onClick={() => claimQuest(q.id)} className="town3d-btn">
                          {ui.claim}
                        </button>
                      ) : q.href ? (
                        <Link href={`/${locale}${q.href}`} className="town3d-btn">
                          {ui.go}
                        </Link>
                      ) : place ? (
                        <button type="button" onClick={() => world.current?.walkTo(place)} className="town3d-btn">
                          {ui.go}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {tab === "build" && (
            <>
              {!loggedIn && <p className="p-2 text-sm opacity-80">{ui.login}</p>}
              {BUILDING_IDS.map((id) => {
                const lv = levels[id] ?? 0;
                const cost = BUILDINGS[id].costs[lv];
                return (
                  <div key={id} className="town3d-card">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden>
                        {BUILDINGS[id].icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{names[id]?.name ?? id}</p>
                        <p className="text-xs opacity-70">{ui.buildBonus[id]}</p>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="flex gap-1" aria-label={`${ui.level} ${lv}/${MAX_BUILDING_LEVEL}`}>
                        {Array.from({ length: MAX_BUILDING_LEVEL }, (_, i) => (
                          <span key={i} className={`h-2 w-5 rounded ${i < lv ? "bg-[#ffd24d]" : "bg-white/15"}`} />
                        ))}
                      </span>
                      {lv >= MAX_BUILDING_LEVEL ? (
                        <span className="text-xs font-bold">{ui.maxed}</span>
                      ) : (
                        <button type="button" disabled={!loggedIn || (points ?? 0) < cost} onClick={() => upgrade(id)} className="town3d-btn disabled:opacity-40">
                          {ui.upgrade} · {cost} 🪙
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <h3 className="town3d-h">{ui.plots}</h3>
              {PLACES.filter((p) => p.kind === "plot").map((p) => placeRow(p.id, ui.soon))}
            </>
          )}
          {tab === "treasures" &&
            TREASURE_SET_IDS.map((set) => {
              const icons = TREASURE_SETS[set];
              const have = icons.filter((_, i) => (treasures.pieces[`${set}:${i}`] ?? 0) > 0).length;
              const claimed = treasures.claimed.includes(set);
              return (
                <div key={set} className="town3d-card">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>{names[WORLD_OF_SET[set]]?.name}</span>
                    <span className="text-xs opacity-70">
                      {have}/{icons.length}
                    </span>
                  </div>
                  <div className="my-1 flex gap-1 text-2xl">
                    {icons.map((ic, i) => (
                      <span key={i} style={{ opacity: (treasures.pieces[`${set}:${i}`] ?? 0) > 0 ? 1 : 0.22, filter: (treasures.pieces[`${set}:${i}`] ?? 0) > 0 ? undefined : "grayscale(1)" }}>
                        {ic}
                      </span>
                    ))}
                  </div>
                  {claimed ? (
                    <p className="text-xs font-bold text-[#7ee0b0]">✓ {ui.claimed}</p>
                  ) : have === icons.length ? (
                    <button type="button" onClick={() => claimSet(set)} className="town3d-btn">
                      {ui.claimSet} · {SET_REWARD} 🪙
                    </button>
                  ) : (
                    <p className="text-xs opacity-70">{ui.setReward.replace("{n}", String(SET_REWARD))}</p>
                  )}
                </div>
              );
            })}
        </div>
      </aside>

      {/* vybrané místo */}
      <section className="town3d-panel absolute bottom-3 left-3 w-[min(440px,calc(100%-320px))] min-w-[260px] p-4 max-md:bottom-[calc(44%+20px)] max-md:right-3 max-md:w-auto" aria-live="polite">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {sel.icon} {selText?.name}
        </h2>
        <p className="mt-1 text-sm opacity-80">{sel.kind === "plot" ? ui.plotDesc : selText?.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="town3d-btn" onClick={() => world.current?.walkTo(sel.id)}>
            🚶 {ui.go}
          </button>
          {sel.href ? (
            <Link href={`/${locale}${sel.href}`} className="town3d-btn town3d-btn-gold">
              🚪 {ui.enter}
            </Link>
          ) : sel.kind === "place" && sel.id !== "namesti" ? (
            <span className="town3d-btn opacity-60">⏳ {ui.soon}</span>
          ) : null}
        </div>
      </section>

      <p className="pointer-events-none absolute left-1/2 top-14 hidden -translate-x-1/2 rounded-full bg-[#1b1840]/70 px-3 py-1 text-xs text-white md:block">{ui.hint}</p>
      {toast && <div className="town3d-toast absolute left-1/2 top-24 -translate-x-1/2">{toast}</div>}
    </div>
  );
}
