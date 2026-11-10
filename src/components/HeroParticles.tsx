"use client";

import { useEffect, useRef } from "react";

// Částice za hrdinou úvodní stránky: body spojené čárami se k ukazateli přitahují. Canvas leží za obsahem
// a nechytá myš, ukazatel se sleduje na celém okně. Bez pohybu (systémové omezení nebo přepínač animací)
// se vykreslí jen jeden klidný snímek.
export function HeroParticles({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const frac = (v: number) => v - Math.floor(v);
    const N = 58;
    const pts = Array.from({ length: N }, (_, i) => {
      const x = 0.03 + 0.94 * frac(Math.sin(i * 12.9898 + 1.3) * 43758.5453);
      const y = 0.05 + 0.9 * frac(Math.sin(i * 78.233 + 4.1) * 24634.6345);
      return { x, y, hx: x, hy: y, vx: 0, vy: 0 };
    });
    const mouse = { x: -1, y: -1 };
    let w = 0;
    let h = 0;
    function size() {
      const r = cv!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv!.width = Math.max(1, w * dpr);
      cv!.height = Math.max(1, h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(cv);
    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (mouse.x >= 0) {
          const dx = mouse.x - p.x * w;
          const dy = mouse.y - p.y * h;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 160) {
            p.vx += (dx / d) * 0.05;
            p.vy += (dy / d) * 0.05;
          }
        }
        p.vx += (p.hx - p.x) * 0.0016;
        p.vy += (p.hy - p.y) * 0.0016;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += (p.vx / w) * 60;
        p.y += (p.vy / h) * 60;
      }
      ctx!.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot((pts[i].x - pts[j].x) * w, (pts[i].y - pts[j].y) * h);
          if (d < 90) {
            ctx!.strokeStyle = `rgba(160,190,255,${(1 - d / 90) * 0.35})`;
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x * w, pts[i].y * h);
            ctx!.lineTo(pts[j].x * w, pts[j].y * h);
            ctx!.stroke();
          }
        }
      }
      ctx!.fillStyle = "rgba(255,210,77,0.85)";
      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x * w, p.y * h, 2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    let raf = 0;
    function frame() {
      draw();
      raf = requestAnimationFrame(frame);
    }
    draw();
    if (!still) raf = requestAnimationFrame(frame);
    function move(e: PointerEvent) {
      const r = cv!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (mouse.x < 0 || mouse.y < 0 || mouse.x > r.width || mouse.y > r.height) {
        mouse.x = -1;
        mouse.y = -1;
      }
    }
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${className}`} />;
}
