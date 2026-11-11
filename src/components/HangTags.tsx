"use client";

import { useEffect, useRef, type PointerEvent as RPE } from "react";
import { HANG_COLORS, HangIcon } from "./HangDecor";

const TAG_ICONS = ["search", "pulse", "check", "bug", "flag"] as const;

// Zavěšené štítky: dají se chytit myší/prstem a rozhoupat; při silném zatažení se nit přetrhne
// a štítek spadne. Za chvíli se shora vrátí (přebírá ho zpět CSS animace).
type Mode = "held" | "swing" | "free";
type S = {
  mode: Mode; el: HTMLElement; sway: HTMLElement; tag: HTMLElement;
  px: number; py: number; L: number; th: number; w: number;
  lastPx: number; lastPy: number; lastPt: number; pvx: number; pvy: number;
  tx: number; ty: number; vx: number; vy: number; spin: number; spinV: number; age: number;
};

const G = 1800; // px/s² (kyvadlo)
const DAMP = 1.5;
const TEAR = 110; // o kolik px za délku nitě se musí zatáhnout, aby se přetrhla

export function HangTags({ tags }: { tags: string[] }) {
  const states = useRef<Map<number, S>>(new Map());
  const raf = useRef(0);
  const last = useRef(0);

  const release = (i: number, s: S, delay: string) => {
    s.el.classList.remove("is-held", "is-swing", "is-free");
    s.el.style.removeProperty("transform");
    s.el.style.removeProperty("opacity");
    s.el.style.removeProperty("--tn");
    s.sway.style.removeProperty("transform");
    s.tag.style.removeProperty("transform");
    s.el.style.setProperty("--d", delay);
    states.current.delete(i);
  };

  const step = (i: number, s: S, dt: number) => {
    if (s.mode === "swing") {
      s.w += (-(G / s.L) * Math.sin(s.th) - DAMP * s.w) * dt;
      s.th += s.w * dt;
    } else if (s.mode === "free") {
      s.age += dt;
      s.vy += 2400 * dt;
      s.tx += s.vx * dt;
      s.ty += s.vy * dt;
      s.spin += s.spinV * dt;
    }
  };

  const frame = (t: number) => {
    const real = Math.min(0.25, (t - (last.current || t)) / 1000); // reálný čas; fyzika se dělí na krátké kroky
    last.current = t;
    states.current.forEach((s, i) => {
      if (s.mode === "held") return;
      for (let n = Math.ceil(real / 0.008), dt = real / Math.max(1, n); n > 0; n--) step(i, s, dt);
      if (s.mode === "swing") {
        s.sway.style.transform = `rotate(${s.th}rad)`;
        if (Math.abs(s.th) < 0.02 && Math.abs(s.w) < 0.06) release(i, s, "-5s"); // klidná fáze cyklu
      } else {
        s.el.style.transform = `translate(${s.tx}px, ${s.ty}px)`;
        s.tag.style.transform = `translateX(-50%) rotate(calc(var(--tr, 0deg) + ${s.spin}rad))`;
        if (s.age > 0.8) s.el.style.opacity = String(Math.max(0, 1 - (s.age - 0.8) / 0.5));
        if (s.age > 1.4 || s.ty > 560) release(i, s, "0s"); // spadl: znovu přilétne shora
      }
    });
    if (states.current.size) raf.current = requestAnimationFrame(frame);
    else { raf.current = 0; last.current = 0; }
  };
  const kick = () => { if (!raf.current) raf.current = requestAnimationFrame(frame); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const down = (i: number) => (e: RPE<HTMLElement>) => {
    const el = e.currentTarget.closest(".hang-str") as HTMLElement | null;
    if (!el || states.current.get(i)?.mode === "free") return;
    const sway = el.querySelector(".hang-sway") as HTMLElement;
    const tag = e.currentTarget as HTMLElement;
    const box = el.parentElement!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (Math.abs(r.top - (box.top - 44)) > 8) return; // právě přilétá nebo padá: nejde chytit
    const m = new DOMMatrixReadOnly(getComputedStyle(sway).transform);
    const th = Math.atan2(m.b, m.a);
    let s = states.current.get(i);
    if (!s) {
      s = {
        mode: "held", el, sway, tag, px: r.left + 0.5, py: r.top, L: r.height + 20, th, w: 0,
        lastPx: e.clientX, lastPy: e.clientY, lastPt: e.timeStamp, pvx: 0, pvy: 0,
        tx: 0, ty: 0, vx: 0, vy: 0, spin: 0, spinV: 0, age: 0,
      };
      states.current.set(i, s);
      sway.style.transform = `rotate(${th}rad)`;
    }
    s.mode = "held"; s.w = 0;
    el.classList.remove("is-swing");
    el.classList.add("is-held");
    tag.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const move = (i: number) => (e: RPE<HTMLElement>) => {
    const s = states.current.get(i);
    if (!s || s.mode !== "held") return;
    const dx = e.clientX - s.px, dy = e.clientY - s.py;
    const dist = Math.hypot(dx, dy);
    let th = Math.atan2(-dx, dy);
    while (th - s.th > Math.PI) th -= 2 * Math.PI;
    while (th - s.th < -Math.PI) th += 2 * Math.PI;
    const dtp = Math.max(0.001, (e.timeStamp - s.lastPt) / 1000);
    s.w = s.w * 0.6 + ((th - s.th) / dtp) * 0.4;
    s.pvx = s.pvx * 0.6 + ((e.clientX - s.lastPx) / dtp) * 0.4;
    s.pvy = s.pvy * 0.6 + ((e.clientY - s.lastPy) / dtp) * 0.4;
    s.lastPx = e.clientX; s.lastPy = e.clientY; s.lastPt = e.timeStamp;
    s.th = th;
    s.sway.style.transform = `rotate(${th}rad)`;
    const tn = Math.max(0, Math.min(1, (dist - s.L) / TEAR));
    s.el.style.setProperty("--tn", String(tn));
    if (tn >= 1) { // přetrženo
      s.mode = "free";
      s.vx = Math.max(-1800, Math.min(1800, s.pvx));
      s.vy = Math.max(-1800, Math.min(1800, s.pvy));
      s.spinV = Math.max(-8, Math.min(8, s.w * 0.6 + s.pvx / 400));
      s.el.classList.remove("is-held");
      s.el.classList.add("is-free");
      s.tag.releasePointerCapture?.(e.pointerId);
      kick();
    }
  };

  const up = (i: number) => (e: RPE<HTMLElement>) => {
    const s = states.current.get(i);
    if (!s || s.mode !== "held") return;
    s.mode = "swing";
    s.w = Math.max(-9, Math.min(9, s.w));
    s.el.classList.remove("is-held");
    s.el.classList.add("is-swing");
    s.el.style.setProperty("--tn", "0");
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    kick();
  };

  return (
    <div className="hang-tags">
      {tags.map((tag, i) => (
        <div key={tag} className={`hang-str hang-str-${i + 1}`} style={{ ["--tc" as string]: HANG_COLORS[i % HANG_COLORS.length] }}>
          <div className="hang-sway">
            <span className="hang-tag" onPointerDown={down(i)} onPointerMove={move(i)} onPointerUp={up(i)} onPointerCancel={up(i)}>
              <span className="hang-ic"><HangIcon kind={TAG_ICONS[i % TAG_ICONS.length]} size={16} /></span>
              <span>{tag}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
