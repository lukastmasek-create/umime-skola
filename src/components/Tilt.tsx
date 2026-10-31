"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Karta se za kurzorem naklání v prostoru (perspektiva) a po povrchu jí běží odlesk.
// Bez myši nebo při omezení animací zůstane rovná.
export function Tilt({ children, max = 7, className = "" }: { children: React.ReactNode; max?: number; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = outer.current;
    const card = inner.current;
    const shine = glare.current;
    if (!box || !card || !shine) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion()) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0, hover = 0, chover = 0;
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      chover += (hover - chover) * 0.1;
      card.style.transform = `perspective(900px) rotateX(${(-cy * max).toFixed(2)}deg) rotateY(${(cx * max).toFixed(2)}deg) translateZ(${(chover * 14).toFixed(1)}px)`;
      shine.style.opacity = String(0.1 + chover * 0.3);
      shine.style.background = `radial-gradient(circle at ${(50 + cx * 50).toFixed(1)}% ${(50 + cy * 50).toFixed(1)}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`;
      const moving = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 || Math.abs(hover - chover) > 0.01;
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      // reaguje i na kurzor v okolí karty, aby se nakláněla plynule, ne až po vstupu na ni
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      const near = Math.abs(nx) < 2.4 && Math.abs(ny) < 2.4;
      tx = near ? Math.max(-1, Math.min(1, nx)) : 0;
      ty = near ? Math.max(-1, Math.min(1, ny)) : 0;
      hover = Math.abs(nx) <= 1 && Math.abs(ny) <= 1 ? 1 : 0;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [max]);

  return (
    <div ref={outer} className={className}>
      <div ref={inner} className="relative" style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
        {children}
        <div ref={glare} aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen" style={{ opacity: 0.1 }} />
      </div>
    </div>
  );
}
