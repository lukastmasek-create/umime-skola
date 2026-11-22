"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Živé pozadí „Hrát společně“: WebGL fragment shader (deformovaný proud barev + jemné světlo,
// které se pomalu vlní a lehce se posouvá za kurzorem). Počítá se v půlce rozlišení.
// Pod plátnem je WebP náhrada (/arena/poster-*.webp): vykreslí se hned, a zůstane, když WebGL
// chybí nebo je omezený pohyb (pak se shader vykreslí jen jednou). Mimo obrazovku a na skryté kartě se smyčka zastaví.

export type ArenaKey = "neutral" | "quiz" | "race" | "gold" | "streak" | "survival" | "teams";

export const ARENA_COLORS: Record<ArenaKey, [string, string]> = {
  neutral: ["#5a6cff", "#ff8a6b"],
  quiz: ["#29a3ff", "#8fd0ff"],
  race: ["#17a864", "#7ee0b0"],
  gold: ["#ffc933", "#ff8a1f"],
  streak: ["#ff5a3c", "#ffc933"],
  survival: ["#8a5cff", "#c9a8ff"],
  teams: ["#ff5a8a", "#29a3ff"],
};

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uA; uniform vec3 uB;
in vec2 vUv; out vec4 outColor;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<4;i++){ v += a*noise(p); p = p*2.02 + 7.0; a *= 0.5; } return v; }
void main(){
  float asp = uRes.x / uRes.y;
  vec2 uv = (vUv - 0.5) * vec2(asp, 1.0);
  float t = uTime * 0.06;
  vec2 p = uv * 1.6 + uMouse * 0.08;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 2.6 * q);
  vec3 base = mix(vec3(0.05, 0.04, 0.14), vec3(0.09, 0.07, 0.22), vUv.y);
  float d1 = smoothstep(0.25, 0.95, f * 1.5 + q.x * 0.3);
  float d2 = smoothstep(0.35, 1.0, fbm(p * 1.3 - 2.0 * q + 3.0));
  vec3 col = base + uA * d1 * 0.55 + uB * d2 * 0.4;
  float v = smoothstep(1.15, 0.2, length(uv));
  col *= 0.55 + 0.6 * v;
  vec2 g = fract(vUv * vec2(asp, 1.0) * 28.0) - 0.5;
  col += vec3(1.0) * smoothstep(0.08, 0.0, length(g)) * 0.05;
  outColor = vec4(col, 1.0);
}`;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function ArenaBackdrop({ variant = "neutral", className = "" }: { variant?: ArenaKey; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // zůstane WebP náhrada
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const [ca, cb] = ARENA_COLORS[variant];
    gl.uniform3fv(u("uA"), rgb(ca));
    gl.uniform3fv(u("uB"), rgb(cb));
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uMouse = u("uMouse");

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const still = prefersReducedMotion();
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const resize = () => {
      const w = Math.max(2, Math.round(canvas.clientWidth * 0.5));
      const h = Math.max(2, Math.round(canvas.clientHeight * 0.5));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    const draw = (now: number) => {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = "1"; // CSS zprůhlední WebP náhradu až po prvním snímku
    };
    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (still) return draw(performance.now());
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (0.5 - e.clientY / window.innerHeight) * 2;
    };
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    start();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      // Kontext se neruší (loseContext): v StrictMode by druhé připojení dostalo už ztracený kontext.
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      delete canvas.dataset.ready;
    };
  }, [variant]);

  return (
    <div aria-hidden className={`arena-bg ${className}`} style={{ backgroundImage: `url(/arena/poster-${variant}.webp)` }}>
      <canvas ref={canvasRef} className="arena-bg-canvas" />
    </div>
  );
}

/** Barva pozadí podle hry (akční hry; klasické berou barvu podle pořadí). */
export const GAME_ARENA: Record<string, ArenaKey> = {
  "space-invaders": "survival",
  "pac-man": "gold",
  snake: "race",
  breakout: "quiz",
  tetris: "teams",
  mole: "streak",
  ninja: "survival",
  minesweeper: "quiz",
  runner: "race",
};
