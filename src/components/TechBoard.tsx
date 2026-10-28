"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import board from "./tech-board.json";

// Sekce „Co tu najdeš“ jako diorama: deska plošného spoje s procesorem a čtyřmi podstavci
// (umime-art/blender/tech_deska.py). Na podstavcích stojí animované předměty (kniha, joystick,
// dveře únikovky, pohár) a po vodivých cestách z procesoru k nim běží elektrony. Najetí na předmět
// nebo kartu rozsvítí cestu, zrychlí proud elektronů a zvedne předmět.

export type TechFeature = { key: string; title: string; text: string; cta: string; href: string; color: string };

const OBJECTS = ["kniha", "joystick", "dvere", "pohar"] as const;
const TAU = Math.PI * 2;

type Pt = [number, number];
type Path = { pts: Pt[]; len: number[]; total: number };

function buildPath(raw: number[][]): Path {
  const pts = raw.map((p) => [p[0], p[1]] as Pt);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len, total: len[len.length - 1] };
}

function at(path: Path, u: number): Pt {
  const d = Math.max(0, Math.min(1, u)) * path.total;
  let i = 1;
  while (i < path.len.length - 1 && path.len[i] < d) i++;
  const k = (d - path.len[i - 1]) / Math.max(1e-6, path.len[i] - path.len[i - 1]);
  return [path.pts[i - 1][0] + (path.pts[i][0] - path.pts[i - 1][0]) * k, path.pts[i - 1][1] + (path.pts[i][1] - path.pts[i - 1][1]) * k];
}

export function TechBoard({ features }: { features: TechFeature[] }) {
  const [active, setActive] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const box = wrap.current;
    const canvas = cv.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = board.paths.map(buildPath);
    let W = 0, H = 0, dpr = 1;
    let raf = 0;
    let visible = true;
    let disposed = false;
    const resize = () => {
      const r = box.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    // elektrony: u = poloha na cestě 0..1, v = rychlost
    const electrons = paths.map((_, i) => Array.from({ length: 10 }, (_, k) => ({ u: (k / 10 + i * 0.13) % 1, v: 0.12 + ((k * 37) % 10) / 70, on: k < 3 })));
    const rings: { x: number; y: number; life: number; c: string }[] = [];
    const t0 = performance.now();
    let last = t0;

    const frame = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sec = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const act = activeRef.current;

      // záře procesoru, při výběru výraznější a v barvě vybrané cesty
      const cx = board.cpu[0] * W, cy = board.cpu[1] * H;
      const pulse = 0.5 + 0.5 * Math.sin(sec * 2.2);
      const cpuColor = act === null ? "127,232,255" : hexToRgb(board.colors[act]);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.07);
      cg.addColorStop(0, `rgba(${cpuColor},${0.35 + 0.25 * pulse + (act === null ? 0 : 0.2)})`);
      cg.addColorStop(1, `rgba(${cpuColor},0)`);
      ctx.fillStyle = cg;
      ctx.fillRect(cx - W * 0.07, cy - W * 0.07, W * 0.14, W * 0.14);

      paths.forEach((p, i) => {
        const hot = act === i;
        const rgb = hexToRgb(board.colors[i]);
        const el = electrons[i];
        // při výběru se zapnou všechny elektrony cesty, jinak jen první tři
        el.forEach((e, k) => {
          e.on = hot ? true : k < 3;
          if (!reduced) e.u += e.v * dt * (hot ? 2.2 : 1);
          if (e.u > 1) {
            e.u -= 1;
            if (hot && Math.random() < 0.6) {
              const [x, y] = at(p, 1);
              rings.push({ x: x * W, y: y * H, life: 0, c: rgb });
            }
          }
          if (!e.on) return;
          // krátký ocas složený z několika bodů za elektronem
          for (let s = 0; s < 7; s++) {
            const [x, y] = at(p, e.u - s * 0.012);
            const a = (1 - s / 7) * (hot ? 0.95 : 0.6) * (e.u < 0.03 || e.u > 0.97 ? 0.4 : 1);
            const r = (hot ? 4.2 : 3.2) * (1 - s * 0.09) * (W / 1200);
            const g = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * 2.4);
            g.addColorStop(0, `rgba(255,255,255,${a})`);
            g.addColorStop(0.35, `rgba(${rgb},${a * 0.8})`);
            g.addColorStop(1, `rgba(${rgb},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(x * W - r * 2.4, y * H - r * 2.4, r * 4.8, r * 4.8);
          }
        });
        if (hot) {
          // celá cesta jemně září
          ctx.strokeStyle = `rgba(${rgb},${0.28 + 0.12 * pulse})`;
          ctx.lineWidth = 5 * (W / 1200);
          ctx.lineJoin = "round";
          ctx.beginPath();
          p.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)));
          ctx.stroke();
        }
      });
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life += dt;
        if (r.life > 0.9) {
          rings.splice(i, 1);
          continue;
        }
        const k = r.life / 0.9;
        ctx.strokeStyle = `rgba(${r.c},${0.7 * (1 - k)})`;
        ctx.lineWidth = 3 * (1 - k) * (W / 1200);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, (24 + 70 * k) * (W / 1200), (14 + 40 * k) * (W / 1200), 0, 0, TAU);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      if (visible && !reduced) raf = requestAnimationFrame(frame);
      else raf = 0;
    };
    const kick = () => {
      if (!raf && visible && !disposed) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) frame(performance.now());
      kick();
    });
    ro.observe(box);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(box);
    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const hold = (i: number | null) => ({
    onMouseEnter: () => setActive(i),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
  });

  return (
    <div className="flex flex-col gap-8">
      <div ref={wrap} className="relative mx-auto w-full max-w-[1180px] select-none" style={{ aspectRatio: `${board.w} / ${board.h}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/tech/deska.webp" alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full" />
        <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        {features.map((f, i) => {
          const s = board.sprites[i];
          const on = active === i;
          return (
            <Link
              key={f.key}
              href={f.href}
              aria-label={f.title}
              {...hold(i)}
              className="absolute z-10 block rounded-[40%]"
              style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%`, aspectRatio: "1 / 1" }}
            >
              <span
                className="globe-sprite block h-full w-full"
                style={{
                  backgroundImage: `url(/home/tech/${OBJECTS[i]}.webp)`,
                  animationDuration: ["3.2s", "2.4s", "4.8s", "3.6s"][i],
                  transform: on ? "translateY(-7%) scale(1.07)" : "translateY(0) scale(1)",
                  filter: on ? `drop-shadow(0 10px 18px ${f.color}aa) brightness(1.08)` : "drop-shadow(0 8px 10px rgba(0,0,0,0.45))",
                  transition: "transform 0.28s cubic-bezier(0.2, 1.3, 0.4, 1), filter 0.28s",
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[88%] -translate-x-1/2 whitespace-nowrap rounded-md border-2 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#0b0820] sm:text-xs"
                style={{ background: f.color, borderColor: "#16132b", opacity: on ? 1 : 0, transform: `translate(-50%, ${on ? 0 : 6}px)`, transition: "opacity 0.2s, transform 0.2s" }}
              >
                {f.title}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Link
            key={f.key}
            href={f.href}
            {...hold(i)}
            className="card card-hover tech-card flex flex-col gap-3 p-5"
            style={{
              borderColor: `${f.color}${active === i ? "ff" : "88"}`,
              boxShadow: active === i ? `0 0 28px ${f.color}66, 0 4px 0 var(--shadow-ink)` : undefined,
              ["--tc" as string]: f.color,
              ["--i" as string]: i,
              ["--glow" as string]: `${f.color}33`,
            }}
          >
            <span aria-hidden className="electric" />
            <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: f.color }}>
              {"// 0" + (i + 1)}
            </span>
            <h3 className="text-lg font-bold">{f.title}</h3>
            <p className="text-sm text-[var(--muted)]">{f.text}</p>
            <span className="mt-auto pt-1 font-mono text-sm font-bold" style={{ color: f.color }}>
              {f.cta} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function hexToRgb(h: string): string {
  const n = parseInt(h.replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
