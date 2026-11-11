"use client";

import Link from "next/link";
import { useEffect, useRef, type PointerEvent as RPE, type ReactNode } from "react";

// Karta kategorie: dá se chytit a odtáhnout. Puštěná poblíž se pružně vrátí, odtržená daleko
// (nebo hozená) spadne a pak shora naskočí zpátky na své místo. Klik dál funguje jako odkaz.
type Mode = "idle" | "drag" | "spring" | "fly";
const TEAR_DIST = 170; // px od domovské pozice, od kterých se karta odtrhne
const K = 170; // tuhost pružiny
const C = 15; // tlumení pružiny

export function TearCard({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const s = useRef({
    mode: "idle" as Mode, x: 0, y: 0, vx: 0, vy: 0, rot: 0, rotV: 0, age: 0, op: 1,
    gx: 0, gy: 0, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, moved: 0, down: false,
  });
  const raf = useRef(0);
  const last = useRef(0);

  const apply = () => {
    const el = ref.current; if (!el) return;
    const q = s.current;
    el.style.translate = `${q.x}px ${q.y}px`;
    el.style.setProperty("--dr", `${q.rot}deg`);
    el.style.opacity = String(q.op);
  };
  const reset = () => {
    const el = ref.current; if (!el) return;
    el.style.translate = ""; el.style.opacity = ""; el.style.removeProperty("--dr");
    el.classList.remove("is-drag", "is-tear", "is-fly");
  };

  const frame = (t: number) => {
    const q = s.current;
    const real = Math.min(0.25, (t - (last.current || t)) / 1000);
    last.current = t;
    if (q.mode === "spring" || q.mode === "fly") {
      const n = Math.max(1, Math.ceil(real / 0.008)), dt = real / n;
      for (let i = 0; i < n; i++) {
        if (q.mode === "spring") {
          q.vx += (-K * q.x - C * q.vx) * dt; q.vy += (-K * q.y - C * q.vy) * dt;
          q.rotV += (-K * q.rot - C * q.rotV) * dt;
          q.rot += q.rotV * dt;
        } else {
          q.age += dt; q.vy += 2600 * dt; q.rot += q.rotV * dt;
        }
        q.x += q.vx * dt; q.y += q.vy * dt;
      }
      if (q.mode === "spring" && q.op < 1) q.op = Math.min(1, q.op + real * 3);
      if (q.mode === "fly") {
        if (q.age > 0.7) q.op = Math.max(0, 1 - (q.age - 0.7) / 0.4);
        if (q.age > 1.2) { // respawn: shora naskočí na místo
          q.mode = "spring"; q.x = 0; q.y = -460; q.vx = 0; q.vy = 0; q.rot = 0; q.rotV = 0; q.op = 0;
          ref.current?.classList.remove("is-fly");
        }
      }
      apply();
      if (q.mode === "spring" && q.op >= 1 && Math.hypot(q.x, q.y) < 0.4 && Math.hypot(q.vx, q.vy) < 3 && Math.abs(q.rot) < 0.05) {
        q.mode = "idle"; reset();
      }
    }
    if (q.mode === "idle") { raf.current = 0; last.current = 0; return; }
    raf.current = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf.current) raf.current = requestAnimationFrame(frame); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const down = (e: RPE<HTMLAnchorElement>) => {
    const q = s.current;
    if (q.mode === "fly" || (e.pointerType === "mouse" && e.button !== 0)) return;
    q.down = true; q.moved = 0;
    q.gx = e.clientX - q.x; q.gy = e.clientY - q.y; // pozice kurzoru vůči domovské pozici karty
    q.sx = e.clientX; q.sy = e.clientY; q.lx = e.clientX; q.ly = e.clientY; q.lt = e.timeStamp;
    q.vx = 0; q.vy = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: RPE<HTMLAnchorElement>) => {
    const q = s.current; const el = ref.current;
    if (!q.down || !el) return;
    q.moved = Math.max(q.moved, Math.hypot(e.clientX - q.sx, e.clientY - q.sy));
    if (q.mode !== "drag" && q.moved < 6) return; // ještě klik
    if (q.mode !== "drag") { q.mode = "drag"; el.classList.add("is-drag"); }
    const dt = Math.max(0.001, (e.timeStamp - q.lt) / 1000);
    const nx = e.clientX - q.gx, ny = e.clientY - q.gy;
    q.vx = q.vx * 0.6 + ((nx - q.x) / dt) * 0.4; q.vy = q.vy * 0.6 + ((ny - q.y) / dt) * 0.4;
    q.x = nx; q.y = ny; q.lt = e.timeStamp;
    q.rot = Math.max(-14, Math.min(14, q.vx / 90)); // naklání se podle rychlosti tahu
    el.classList.toggle("is-tear", Math.hypot(nx, ny) > TEAR_DIST);
    apply();
  };
  const up = (e: RPE<HTMLAnchorElement>) => {
    const q = s.current; const el = ref.current;
    if (!q.down) return;
    q.down = false;
    el?.releasePointerCapture?.(e.pointerId);
    if (q.mode !== "drag" || !el) return;
    el.classList.remove("is-drag", "is-tear");
    const dist = Math.hypot(q.x, q.y), speed = Math.hypot(q.vx, q.vy);
    if (dist > TEAR_DIST || (speed > 1300 && dist > 70)) {
      q.mode = "fly"; q.age = 0;
      q.vx = Math.max(-1800, Math.min(1800, q.vx)); q.vy = Math.max(-1800, Math.min(1800, q.vy));
      q.rotV = Math.max(-140, Math.min(140, q.vx / 14 || 40));
      el.classList.add("is-fly");
    } else {
      q.mode = "spring"; q.rotV = 0; // vrátí se pružně
    }
    last.current = 0; kick();
  };
  // po tažení nesmí proběhnout proklik na odkaz
  const click = (e: React.MouseEvent) => { if (s.current.moved >= 6) { e.preventDefault(); e.stopPropagation(); } };

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClickCapture={click}
    >
      {children}
    </Link>
  );
}
