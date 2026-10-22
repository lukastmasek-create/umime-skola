"use client";

import { useEffect, useRef } from "react";
import { Sprites } from "@/lib/sprites";

// Ukázka hry na úvodní stránce: stejné sprity jako ve hře, ale jen přehrávaná smyčka.
// Loď doletí k správnému mimozemšťanovi, vystřelí a slovo se doplní.
const W = 640;
const H = 420;
const CYCLE = 7;
const ALIENS = [
  { letter: "i", color: "#7c6cff", type: "kyklop" },
  { letter: "í", color: "#ff5d73", type: "krab" },
  { letter: "y", color: "#ffb020", type: "chobotnice" },
  { letter: "ý", color: "#22c55e", type: "ufo" },
];
const AX = [110, 257, 403, 530];
const SHIP_Y = 350;
const ALIEN_Y = 120;

function label(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, w: number, color: string) {
  ctx.fillStyle = "rgba(11,8,32,0.85)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - 17, w, 34, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 1);
}

export function ArcadeDemo() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    const sp = new Sprites("space");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 1 + Math.random() * 1.6 }));
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = reduce ? 4.6 : (((now - start) / 1000) % CYCLE);
      const total = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // pozadí
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#070519");
      bg.addColorStop(1, "#1d0f45");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      sp.draw(ctx, "pozadi_mlhovina", "mlhovina", W / 2, H / 2, W, H);
      sp.draw(ctx, "pozadi_planeta", "planeta", 560, 330, W * 0.36, H * 0.36, { alpha: 0.55 });
      ctx.fillStyle = "#fff";
      for (const s of stars) {
        ctx.globalAlpha = 0.5;
        ctx.fillRect(s.x, (s.y + total * 8 * s.s) % H, s.s, s.s);
      }
      ctx.globalAlpha = 1;

      // rozhraní
      ctx.font = "700 18px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("♥ ♥ ♥", 20, 26);
      ctx.textAlign = "right";
      ctx.fillText(t > 3.6 && t < 6.4 ? "0150" : "0120", W - 20, 26);

      // zadání
      const solved = t > 3.6 && t < 6.4;
      ctx.fillStyle = solved ? "rgba(34,197,94,0.28)" : "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.roundRect(W / 2 - 110, 40, 220, 44, 12);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 26px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(solved ? "ž i vot ✓" : "ž ___ vot", W / 2, 63);

      // mimozemšťané
      ALIENS.forEach((a, i) => {
        const hit = i === 0 && t > 3.3;
        const x = AX[i];
        const y = ALIEN_Y + Math.sin(total * 2 + i * 1.3) * 5;
        if (!hit) {
          const f = "klid_" + (1 + (Math.floor(total * 5 + i) % 4));
          sp.draw(ctx, "mimozemstane", a.type + "_" + f, x, y + 24, 84, 84);
          label(ctx, a.letter, x, y + 92, 64, a.color);
        } else if (t < 4.0) {
          const k = Math.min(8, 1 + Math.floor((t - 3.3) / 0.09));
          sp.draw(ctx, "vybuch", "snimek_" + k, x, y + 40, 110, 110);
        }
      });

      // loď: dolétá pod správné slovo, střelí
      const shipX = t < 2.2 ? W / 2 + (AX[0] - W / 2) * (1 - Math.pow(1 - t / 2.2, 3)) : t < 6 ? AX[0] : AX[0] + (W / 2 - AX[0]) * Math.min(1, (t - 6) / 0.9);
      sp.draw(ctx, "lod", t < 2.1 ? "plamen_" + (1 + (Math.floor(total * 14) % 3)) : "klid", shipX, SHIP_Y, 78, 78);
      if (t > 2.5 && t < 3.3) {
        const k = (t - 2.5) / 0.8;
        sp.draw(ctx, "strely", "hrac", AX[0], SHIP_Y - 30 - k * (SHIP_Y - 30 - (ALIEN_Y + 40)), 34, 34);
      }
    };
    raf = requestAnimationFrame(frame);

    // Mimo obrazovku se nevykresluje.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-md select-none overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[#0f0c24] shadow-[6px_6px_0_var(--shadow-ink)]"
    >
      <canvas ref={ref} className="block h-auto w-full" style={{ aspectRatio: `${W} / ${H}` }} />
    </div>
  );
}
