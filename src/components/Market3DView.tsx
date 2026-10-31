"use client";

import { useEffect, useRef } from "react";
import { getHeroLook } from "@/lib/hero";
import type { WorldId } from "@/lib/market-worlds";
import type { MarketHandle, MarketSpot } from "@/lib/town3d/market3d";

// Živá 3D scéna světa uživatelského obchodu; cedule stánků jsou HTML prvky, které engine každý snímek posune.
export function Market3DView({
  world,
  signs,
  hover,
  hello,
  onOpen,
  onHover,
  onFail,
}: {
  world: WorldId;
  signs: Record<string, { name: string; count: string }>;
  hover: MarketSpot | null;
  hello: (key: MarketSpot) => { npc: string; text: string } | null;
  onOpen: (key: MarketSpot) => void;
  onHover: (key: MarketSpot | null) => void;
  onFail: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const cb = useRef({ onOpen, onHover, onFail });
  useEffect(() => {
    cb.current = { onOpen, onHover, onFail };
  });
  const signsRef = useRef(signs);
  useEffect(() => {
    signsRef.current = signs;
    for (const [key, s] of Object.entries(signs)) {
      const el = layer.current?.querySelector<HTMLElement>(`[data-sign="${key}"]`);
      if (el) el.innerHTML = `${s.name}<span class="block text-[10px] font-semibold text-white/80">${s.count}</span>`;
    }
  }, [signs]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let handle: MarketHandle | null = null;
    let alive = true;
    void import("@/lib/town3d/market3d").then(({ createMarket3D }) => {
      if (!alive) return;
      handle = createMarket3D(el, {
        world,
        look: getHeroLook(),
        onOpen: (k) => cb.current.onOpen(k),
        onHover: (k) => cb.current.onHover(k),
      });
      if (!handle) return cb.current.onFail();
      const lay = layer.current;
      const els = new Map<string, HTMLElement>();
      if (lay) {
        lay.innerHTML = "";
        for (const [key, s] of Object.entries(signsRef.current)) {
          if (key === "lod") continue;
          const d = document.createElement("button");
          d.type = "button";
          d.dataset.sign = key;
          d.className = "market3d-sign";
          d.innerHTML = `${s.name}<span class="block text-[10px] font-semibold text-white/80">${s.count}</span>`;
          d.addEventListener("click", () => handle?.open(key as MarketSpot));
          lay.appendChild(d);
          els.set(key, d);
        }
      }
      handle.labels((items) => {
        for (const it of items) {
          const d = els.get(it.key);
          if (!d) continue;
          d.style.display = it.visible ? "" : "none";
          d.style.transform = `translate(${it.x}px, ${it.y}px) translate(-50%, -100%)`;
        }
      });
    });
    return () => {
      alive = false;
      handle?.dispose();
    };
  }, [world]);

  const h = hover && hover !== "lod" ? hello(hover) : null;
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]" style={{ aspectRatio: "16 / 9", minHeight: 420 }}>
      <div ref={box} className="absolute inset-0 bg-[#0b1630]" />
      <div ref={layer} className="pointer-events-none absolute inset-0" />
      {h && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[5] max-w-[20rem] -translate-x-1/2 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-center text-sm font-bold shadow-[0_3px_0_var(--shadow-ink)]">
          <span className="block text-[11px] font-extrabold text-[var(--brand-600)]">{h.npc}</span>
          {h.text}
        </div>
      )}
    </div>
  );
}
