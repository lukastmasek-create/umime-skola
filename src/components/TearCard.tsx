"use client";

import Link from "next/link";
import { useEffect, useRef, type PointerEvent as RPE, type ReactNode } from "react";

// Karta kategorie: dá se chytit a odtáhnout (myší, na dotyku po krátkém podržení).
// Puštěná poblíž se pružně vrátí; odtržená daleko (nebo hozená) se rozlétne, spadne a shora
// naskočí zpátky na své místo. Na hover se 3D naklání za kurzorem. Klik dál otevírá odkaz.
type Mode = "idle" | "drag" | "spring" | "fly";
const TEAR_DIST = 170; // px od domovské pozice, od kterých se karta odtrhne
const K = 170; // tuhost pružiny
const C = 15; // tlumení pružiny
const HOLD_MS = 220; // podržení na dotyku, než se karta „zvedne"

function burst(x: number, y: number, color: string) {
  for (let i = 0; i < 16; i++) {
    const d = document.createElement("i");
    const size = 4 + Math.random() * 7;
    Object.assign(d.style, {
      position: "fixed", left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px", background: i % 3 ? color : "#fff", pointerEvents: "none", zIndex: "9999",
    });
    document.body.appendChild(d);
    const a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 110;
    d.animate(
      [
        { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * dist - 4}px, ${Math.sin(a) * dist + 60}px) scale(0.2) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ],
      { duration: 650 + Math.random() * 350, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).onfinish = () => d.remove();
  }
}

export function TearCard({ href, className, accent, children }: { href: string; className?: string; accent?: string; children: ReactNode }) {
  const slot = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLAnchorElement>(null);
  const s = useRef({
    mode: "idle" as Mode, x: 0, y: 0, vx: 0, vy: 0, rot: 0, rotV: 0, age: 0, op: 1,
    gx: 0, gy: 0, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, moved: 0, down: false, touch: false, armed: false,
  });
  const raf = useRef(0);
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    el.classList.remove("is-drag", "is-tear", "is-fly", "is-lift");
    slot.current?.classList.remove("is-away");
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

  // na dotyku po zvednutí zakážeme rolování stránky (musí být nativní, ne-pasivní listener)
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const stop = (e: TouchEvent) => { if (s.current.armed && e.cancelable) e.preventDefault(); };
    el.addEventListener("touchmove", stop, { passive: false });
    return () => { el.removeEventListener("touchmove", stop); cancelAnimationFrame(raf.current); clearTimeout(timer.current); };
  }, []);

  const tilt = (e: RPE<HTMLAnchorElement>) => {
    const inner = ref.current?.firstElementChild as HTMLElement | null;
    if (!inner || e.pointerType !== "mouse" || s.current.mode !== "idle" || s.current.down) return;
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    inner.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    inner.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
    inner.style.setProperty("--gx", `${px * 100}%`);
    inner.style.setProperty("--gy", `${py * 100}%`);
    // bezrozměrné -1..1 pro paralaxu vrstev (pozadí, ikona, hvězdičky) a posun stínu
    inner.style.setProperty("--px", ((px - 0.5) * 2).toFixed(3));
    inner.style.setProperty("--py", ((py - 0.5) * 2).toFixed(3));
  };
  const untilt = () => {
    const inner = ref.current?.firstElementChild as HTMLElement | null;
    ["--rx", "--ry", "--gx", "--gy", "--px", "--py"].forEach((p) => inner?.style.removeProperty(p));
  };

  const grab = (e: RPE<HTMLAnchorElement>) => {
    const q = s.current;
    q.armed = true;
    q.gx = e.clientX - q.x; q.gy = e.clientY - q.y;
    q.lx = e.clientX; q.ly = e.clientY; q.lt = e.timeStamp; q.vx = 0; q.vy = 0;
    untilt();
  };
  const down = (e: RPE<HTMLAnchorElement>) => {
    const q = s.current;
    if (q.mode === "fly" || (e.pointerType === "mouse" && e.button !== 0)) return;
    q.down = true; q.moved = 0; q.touch = e.pointerType !== "mouse"; q.armed = false;
    q.sx = e.clientX; q.sy = e.clientY;
    if (q.touch) {
      const el = e.currentTarget, ev = { clientX: e.clientX, clientY: e.clientY, timeStamp: e.timeStamp } as RPE<HTMLAnchorElement>;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { // podrženo: karta se zvedne a jde tahat
        if (!s.current.down) return;
        grab(ev); el.classList.add("is-lift"); navigator.vibrate?.(12);
      }, HOLD_MS);
    } else {
      grab(e);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const move = (e: RPE<HTMLAnchorElement>) => {
    const q = s.current; const el = ref.current;
    if (!q.down) { tilt(e); return; }
    if (!el) return;
    q.moved = Math.max(q.moved, Math.hypot(e.clientX - q.sx, e.clientY - q.sy));
    if (q.touch && !q.armed) { // pohyb před zvednutím = uživatel rolouje stránku
      if (q.moved > 8) { clearTimeout(timer.current); q.down = false; }
      return;
    }
    if (q.mode !== "drag" && q.moved < 6) return; // ještě klik
    if (q.mode !== "drag") {
      q.mode = "drag"; el.classList.add("is-drag"); slot.current?.classList.add("is-away");
      if (q.touch) el.setPointerCapture(e.pointerId);
    }
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
    clearTimeout(timer.current);
    if (!q.down) return;
    q.down = false;
    el?.releasePointerCapture?.(e.pointerId);
    if (q.mode !== "drag" || !el) { q.armed = false; el?.classList.remove("is-lift"); return; }
    q.armed = false;
    el.classList.remove("is-drag", "is-tear", "is-lift");
    const dist = Math.hypot(q.x, q.y), speed = Math.hypot(q.vx, q.vy);
    if (dist > TEAR_DIST || (speed > 1300 && dist > 70)) {
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, accent || "#8f86ff");
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
    <div ref={slot} className="pcard-slot" style={accent ? ({ ["--ac" as string]: accent } as React.CSSProperties) : undefined}>
      <span className="pcard-ghost" aria-hidden />
      <Link
        ref={ref}
        href={href}
        className={className}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => { if (s.current.touch) e.preventDefault(); }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={untilt}
        onClickCapture={click}
      >
        {children}
      </Link>
    </div>
  );
}
