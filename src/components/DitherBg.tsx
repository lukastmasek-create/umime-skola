"use client";

import { useEffect, useRef } from "react";

// Tečkované pole (dither), které se vlní a svítí kolem kurzoru. Kreslí se za obsah rodiče.
export function DitherBg({ bg = "rgba(0,0,0,0)", dot = "rgba(255,255,255,0.35)", className = "" }: { bg?: string; dot?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !host || !ctx) return;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const STEP = 6;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    const mouse = { x: 0.85, y: 0.2 };
    let w = 1, h = 1, t = 0, raf = 0, on = true;
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      cv.width = w;
      cv.height = h;
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = dot;
      for (let y = 0; y < h; y += STEP) {
        for (let x = 0; x < w; x += STEP) {
          const nx = x / w, ny = y / h;
          const d = Math.hypot(nx - mouse.x, (ny - mouse.y) * (h / w));
          const wave = 0.5 + 0.5 * Math.sin(nx * 9 + t) * Math.cos(ny * 7 - t * 0.7);
          const v = Math.max(0, Math.min(1, 0.4 * wave + 0.9 * Math.exp(-d * 4.5)));
          const thr = (BAYER[((y / STEP) & 3) * 4 + ((x / STEP) & 3)] + 0.5) / 16;
          if (v > thr) ctx.fillRect(x, y, STEP - 2, STEP - 2);
        }
      }
    };
    const frame = () => {
      if (on) { t += 0.025; draw(); }
      raf = requestAnimationFrame(frame);
    };
    size();
    draw();
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(host);
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      if (still) draw();
    };
    host.addEventListener("pointermove", move);
    if (!still) raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); host.removeEventListener("pointermove", move); };
  }, [bg, dot]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
