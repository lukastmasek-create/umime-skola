"use client";

import { useEffect, useRef, useState } from "react";
import { Nebula } from "@/components/SpaceDecor";

// Živé pozadí úvodní scény. Mlhovina se počítá ve WebGL (fraktální šum s deformací, pomalu se
// vlní a posouvá se za kurzorem); nad ní je 2D vrstva s hvězdami v několika hloubkách, padajícími
// hvězdami, občasnou kometou a kosmickou lodí z Blenderu (umime-art/blender/hrdina_lod.py), která
// letí za kurzorem s pružinou, naklání se do zatáček a za sebou nechává plamen a jiskry.
// Kliknutí ji vymrští. Bez myši (telefon) loď plave po vlastní dráze. Při omezení animací
// v systému zůstane jen statická mlhovina a hvězdy.

const SHIP_SRC = "/home/hero/lod-strip.webp";
const SHIP_FRAMES = 12;
const SHIP_W = 512;
const SHIP_H = 256;
// Kometa z Blenderu (umime-art/blender/kometa_hero.py): 24 snímků vedle sebe, hlava vpravo dole, ohon vlevo nahoře.
const COMET_SRC = "/home/hero/kometa-strip.webp";
const COMET_FRAMES = 24;
const COMET_S = 384;
const COMET_HEAD = { x: 0.735, y: 0.724 }; // poloha jádra ve snímku (0..1)

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Mlhovina: tři vrstvy deformovaného fbm šumu ve fialové, růžové a azurové; hloubku dává
// posun podle kurzoru. Počítá se v malém rozlišení, mlhovina je hladká, tak to nevadí.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = (vUv - 0.5) * vec2(asp, 1.0);
  float t = uTime * 0.04;
  vec2 p = uv * 1.5 + uMouse * 0.06;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 0.4));
  float f = fbm(p + 3.4 * r);

  vec3 deep = vec3(0.035, 0.03, 0.12);
  vec3 violet = vec3(0.32, 0.14, 0.82);
  vec3 pink = vec3(0.98, 0.28, 0.66);
  vec3 cyan = vec3(0.10, 0.68, 0.98);

  vec3 col = deep;
  float dens = smoothstep(0.18, 0.95, f * f * 1.7 + r.x * 0.35);
  col = mix(col, violet, dens);
  col = mix(col, pink, smoothstep(0.35, 1.0, r.y) * dens * 0.9);
  col = mix(col, cyan, smoothstep(0.45, 1.0, length(q)) * 0.55 * dens);
  // jasná jádra mlhoviny a tmavé prachové pásy
  col += pink * pow(smoothstep(0.55, 1.0, f), 3.0) * 0.5;
  col *= 0.55 + 0.6 * smoothstep(0.1, 0.9, fbm(p * 2.3 + 9.0 * r));
  // vinětace
  col *= 1.0 - 0.55 * dot(uv * vec2(0.7, 1.0), uv * vec2(0.7, 1.0));
  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

type Star = { x: number; y: number; r: number; layer: number; ph: number; sp: number; hue: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; kind: 0 | 1 };
type Meteor = { x: number; y: number; vx: number; vy: number; len: number; life: number; max: number };

const TAU = Math.PI * 2;

export function HeroSky() {
  const gl$ = useRef<HTMLCanvasElement>(null);
  const fx$ = useRef<HTMLCanvasElement>(null);
  const ship$ = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const glCv = gl$.current;
    const fxCv = fx$.current;
    const shipCv = ship$.current;
    const host = glCv?.parentElement;
    if (!glCv || !fxCv || !shipCv || !host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let disposed = false;
    let raf = 0;
    let visible = true;

    // --- WebGL mlhovina ---
    const gl = glCv.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    let u: (n: string) => WebGLUniformLocation | null = () => null;
    let glOk = false;
    if (gl) {
      try {
        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "aPos");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        u = (n) => gl.getUniformLocation(prog, n);
        glOk = true;
      } catch {
        setFallback(true);
      }
    } else {
      setFallback(true);
    }

    // --- 2D vrstva ---
    const ctx = fxCv.getContext("2d")!;
    const sctx = shipCv.getContext("2d")!; // loď a jiskry jsou nad obsahem stránky
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      fxCv.width = shipCv.width = Math.round(W * dpr);
      fxCv.height = shipCv.height = Math.round(H * dpr);
      if (gl && glOk) {
        const scale = 0.42; // mlhovina je hladká, stačí malé rozlišení
        glCv.width = Math.max(2, Math.round(W * scale));
        glCv.height = Math.max(2, Math.round(H * scale));
        gl.viewport(0, 0, glCv.width, glCv.height);
        gl.uniform2f(u("uRes"), glCv.width, glCv.height);
      }
    };

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const stars: Star[] = Array.from({ length: 150 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: i % 17 === 0 ? rnd(1.6, 2.4) : rnd(0.5, 1.3),
      layer: i % 3,
      ph: Math.random() * TAU,
      sp: rnd(0.6, 2.2),
      hue: Math.random() < 0.2 ? 210 : Math.random() < 0.3 ? 40 : 0,
    }));
    const sparks: Spark[] = [];
    const meteors: Meteor[] = [];
    let nextMeteor = 1.2;
    let comet: { x: number; y: number; vx: number; vy: number; boost: number; seed: number } | null = null;
    let nextComet = 2;
    const cdust: { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; warm: boolean }[] = [];
    const cometImg = new Image();
    let cometReady = false;
    cometImg.onload = () => {
      cometReady = true;
    };
    cometImg.src = COMET_SRC;

    // loď: poloha, rychlost, natočení a cíl
    const ship = { x: 0, y: 0, vx: 0, vy: 0, ang: 0, roll: 0, boost: 0 };
    let placed = false;
    const mouse = { x: 0, y: 0, inside: false, nx: 0, ny: 0, sx: 0, sy: 0 };
    const sprite = new Image();
    let spriteReady = false;
    sprite.onload = () => {
      spriteReady = true;
    };
    sprite.src = SHIP_SRC;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height;
      mouse.nx = (mouse.x / r.width) * 2 - 1;
      mouse.ny = (mouse.y / r.height) * 2 - 1;
      if (!raf) kick();
    };
    const onLeave = () => {
      mouse.inside = false;
    };
    const burst = (x: number, y: number, n: number, power: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, v = rnd(40, power);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rnd(0.5, 1.1), size: rnd(1.5, 3.2), kind: 1 });
      }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,input,[role=button]")) return;
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      if (comet && Math.hypot(x - comet.x, y - comet.y) < 140) {
        // kliknutí na kometu: sprška ledových jisker a kometa na chvíli přidá
        comet.boost = 1.6;
        for (let i = 0; i < 42; i++) {
          const a = Math.random() * TAU, v = rnd(60, 420);
          cdust.push({ x: comet.x, y: comet.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rnd(0.7, 1.6), size: rnd(1.6, 3.6), warm: Math.random() < 0.35 });
        }
        if (!raf) kick();
        return;
      }
      const dx = x - ship.x, dy = y - ship.y;
      const d = Math.hypot(dx, dy) || 1;
      ship.vx += (dx / d) * 900;
      ship.vy += (dy / d) * 900;
      ship.boost = 1;
      burst(ship.x, ship.y, 36, 360);
      if (!raf) kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave);

    let lastT = performance.now();
    const t0 = lastT;
    const draw = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const sec = (now - t0) / 1000;

      // plynulé sledování kurzoru pro paralaxu
      mouse.sx += (mouse.nx - mouse.sx) * Math.min(1, dt * 3);
      mouse.sy += (mouse.ny - mouse.sy) * Math.min(1, dt * 3);

      if (gl && glOk) {
        gl.uniform1f(u("uTime"), reduced ? 14 : sec);
        gl.uniform2f(u("uMouse"), mouse.sx, mouse.sy);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, W, H);

      // hvězdy ve třech hloubkách: dál = pomalejší a méně citlivé na kurzor
      for (const s of stars) {
        const depth = 0.25 + s.layer * 0.35;
        const drift = reduced ? 0 : sec * (2 + s.layer * 3);
        const x = (((s.x * W - drift - mouse.sx * 24 * depth) % W) + W) % W;
        const y = s.y * H - mouse.sy * 16 * depth;
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(sec * s.sp + s.ph);
        ctx.globalAlpha = tw * (0.45 + depth * 0.5);
        ctx.fillStyle = s.hue === 210 ? "#bcd6ff" : s.hue === 40 ? "#ffe9b0" : "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, s.r * (0.7 + depth * 0.5), 0, TAU);
        ctx.fill();
        if (s.r > 1.5) {
          // paprsky u největších hvězd
          ctx.globalAlpha = tw * 0.35;
          ctx.fillRect(x - s.r * 4, y - 0.4, s.r * 8, 0.8);
          ctx.fillRect(x - 0.4, y - s.r * 4, 0.8, s.r * 8);
        }
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        // --- padající hvězdy ---
        nextMeteor -= dt;
        if (nextMeteor <= 0) {
          nextMeteor = rnd(2.5, 7);
          const a = rnd(0.35, 0.7);
          const v = rnd(700, 1100);
          meteors.push({ x: rnd(-0.1, 0.8) * W, y: rnd(-40, 0.3 * H), vx: Math.cos(a) * v, vy: Math.sin(a) * v, len: rnd(160, 340), life: 0, max: rnd(0.7, 1.2) });
        }
        ctx.globalCompositeOperation = "lighter";
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.life += dt;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          if (m.life > m.max) {
            meteors.splice(i, 1);
            continue;
          }
          const k = Math.sin((m.life / m.max) * Math.PI);
          const n = Math.hypot(m.vx, m.vy);
          const tx = m.x - (m.vx / n) * m.len, ty = m.y - (m.vy / n) * m.len;
          const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
          g.addColorStop(0, `rgba(255,255,255,${0.95 * k})`);
          g.addColorStop(0.2, `rgba(160,200,255,${0.5 * k})`);
          g.addColorStop(1, "rgba(120,150,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 9);
          hg.addColorStop(0, `rgba(255,255,255,${k})`);
          hg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = hg;
          ctx.fillRect(m.x - 9, m.y - 9, 18, 18);
        }

        // --- kometa z Blenderu: prolétá z pravého horního rohu doleva dolů, u kurzoru zrychlí ---
        nextComet -= dt;
        if (!comet && nextComet <= 0 && cometReady) {
          comet = { x: W + 260, y: rnd(0.05, 0.1) * H, vx: -rnd(75, 100), vy: rnd(7, 13), boost: 0, seed: Math.random() * 100 };
          nextComet = rnd(24, 38);
        }
        if (comet) {
          const near = mouse.inside && fine && Math.hypot(mouse.x - comet.x, mouse.y - comet.y) < 260;
          comet.boost += ((near ? 1 : 0) - comet.boost) * Math.min(1, dt * (near ? 3 : 0.8));
          const speed = 1 + 1.7 * comet.boost;
          comet.x += comet.vx * speed * dt;
          comet.y += comet.vy * speed * dt;
          if (comet.x < -420 || comet.y > H + 300) comet = null;
          else {
            const scale = (Math.min(1.05, Math.max(0.55, W / 1300)) * (1 + 0.07 * Math.min(1, comet.boost)));
            // paralaxa: kometa je daleko, kurzor ji posouvá jen jemně
            const px = comet.x + mouse.sx * 18;
            const py = comet.y + mouse.sy * 12;
            const frame = Math.floor((sec * 14) % COMET_FRAMES);
            const size = COMET_S * scale;
            // sprite je zrcadlený (hlava vlevo dole), jádro leží v bodě COMET_HEAD
            const dx = px - (1 - COMET_HEAD.x) * size;
            const dy = py - COMET_HEAD.y * size;
            ctx.save();
            ctx.globalAlpha = Math.min(1, (W + 260 - comet.x) / 160, (comet.x + 420) / 200);
            ctx.shadowColor = "rgba(150,200,255,0.5)";
            ctx.shadowBlur = 26;
            ctx.translate(dx + size, dy);
            ctx.scale(-1, 1);
            ctx.drawImage(cometImg, frame * COMET_S, 0, COMET_S, COMET_S, 0, 0, size, size);
            ctx.restore();
            // částice z ohonu zůstávají za kometou na obloze a pomalu zhasínají
            const tailDir = { x: 0.78, y: -0.62 }; // směr ohonu (zrcadlený): doprava nahoru
            const n = comet.boost > 0.4 ? 3 : 1;
            for (let i = 0; i < n; i++) {
              const L = rnd(0.18, 0.9) * size * 0.78;
              const sp = rnd(-0.12, 0.12) * size * 0.3;
              cdust.push({ x: px + tailDir.x * L - tailDir.y * sp, y: py + tailDir.y * L + tailDir.x * sp, vx: -comet.vx * 0.12 + rnd(-8, 8), vy: -comet.vy * 0.12 + rnd(-8, 8), life: 0, max: rnd(1.4, 2.8), size: rnd(1, 2.6), warm: Math.random() < 0.3 });
            }
            // občas z komety odletí padající hvězda
            if (Math.random() < dt * 0.35) nextMeteor = Math.min(nextMeteor, 0.05);
          }
        }
        for (let i = cdust.length - 1; i >= 0; i--) {
          const d = cdust[i];
          d.life += dt;
          if (d.life >= d.max) {
            cdust.splice(i, 1);
            continue;
          }
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.vx *= 1 - dt * 0.9;
          d.vy *= 1 - dt * 0.9;
          const k = 1 - d.life / d.max;
          const c = d.warm ? "255,226,170" : "200,228,255";
          const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 3);
          g.addColorStop(0, `rgba(${c},${0.85 * k})`);
          g.addColorStop(1, `rgba(${c},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(d.x - d.size * 3, d.y - d.size * 3, d.size * 6, d.size * 6);
        }
        if (cdust.length > 320) cdust.splice(0, cdust.length - 320);
        ctx.globalCompositeOperation = "source-over";
      }

      // --- loď ---
      if (!placed) {
        ship.x = W * 0.2;
        ship.y = H * 0.7;
        placed = true;
      }
      let tx: number, ty: number;
      if (mouse.inside && fine) {
        tx = mouse.x;
        ty = mouse.y;
      } else {
        // volná plavba: široká osmička přes celou scénu
        tx = W * (0.5 + 0.36 * Math.sin(sec * 0.23));
        ty = H * (0.5 + 0.3 * Math.sin(sec * 0.37 + 1));
      }
      if (!reduced) {
        const k = mouse.inside && fine ? 7 : 3.2;
        ship.vx += ((tx - ship.x) * k - ship.vx * 3.1) * dt;
        ship.vy += ((ty - ship.y) * k - ship.vy * 3.1) * dt;
        const sp = Math.hypot(ship.vx, ship.vy);
        const maxSp = 760;
        if (sp > maxSp) {
          ship.vx *= maxSp / sp;
          ship.vy *= maxSp / sp;
        }
        ship.x += ship.vx * dt;
        ship.y += ship.vy * dt;
        // míří po směru letu; při zastavení se vyrovná mírně nahoru doprava
        const targetAng = sp > 40 ? Math.atan2(ship.vy, ship.vx) : -0.15;
        const da = ((targetAng - ship.ang + Math.PI * 3) % TAU) - Math.PI;
        ship.roll += (da * 0.9 - ship.roll) * Math.min(1, dt * 6);
        ship.ang += da * Math.min(1, dt * (sp > 40 ? 7 : 2));
        ship.boost = Math.max(0, ship.boost - dt * 1.6);

        // jiskry a plamen za lodí
        const tail = { x: ship.x - Math.cos(ship.ang) * 70, y: ship.y - Math.sin(ship.ang) * 70 };
        const n = sp > 120 ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const spread = rnd(-0.28, 0.28);
          const back = ship.ang + Math.PI + spread;
          const v = rnd(70, 190) + sp * 0.15;
          sparks.push({ x: tail.x, y: tail.y, vx: Math.cos(back) * v, vy: Math.sin(back) * v, life: 0, max: rnd(0.45, 0.95), size: rnd(1.4, 3.6), kind: 0 });
        }
      }
      sctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max) {
          sparks.splice(i, 1);
          continue;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 1 - dt * 1.6;
        s.vy *= 1 - dt * 1.6;
        const k = 1 - s.life / s.max;
        // plamen přechází z bílé přes žlutou a oranžovou do modré
        const c = s.kind === 0 ? (k > 0.7 ? "255,246,210" : k > 0.4 ? "255,190,70" : "120,150,255") : k > 0.5 ? "255,255,255" : "255,150,200";
        const rad = s.size * (0.6 + k * 1.8);
        const g = sctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad * 2.2);
        g.addColorStop(0, `rgba(${c},${0.85 * k})`);
        g.addColorStop(1, `rgba(${c},0)`);
        sctx.fillStyle = g;
        sctx.fillRect(s.x - rad * 2.2, s.y - rad * 2.2, rad * 4.4, rad * 4.4);
      }
      sctx.globalCompositeOperation = "source-over";
      if (sparks.length > 420) sparks.splice(0, sparks.length - 420);

      if (spriteReady) {
        const scale = 0.4 + ship.boost * 0.05;
        const frame = Math.floor((reduced ? 0 : sec * 24) % SHIP_FRAMES);
        sctx.save();
        sctx.translate(ship.x, ship.y);
        sctx.rotate(ship.ang);
        // příčný náklon do zatáčky jako mírné zploštění výšky
        sctx.scale(1, 1 - Math.min(0.14, Math.abs(ship.roll) * 0.12));
        sctx.shadowColor = "rgba(150,170,255,0.55)";
        sctx.shadowBlur = 24;
        sctx.drawImage(sprite, frame * SHIP_W, 0, SHIP_W, SHIP_H, -SHIP_W * scale * 0.42, -SHIP_H * scale * 0.5, SHIP_W * scale, SHIP_H * scale);
        sctx.restore();
      }

      if (visible && !reduced) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    function kick() {
      if (!raf && visible && !disposed) {
        lastT = performance.now();
        raf = requestAnimationFrame(draw);
      }
    }

    const ro = new ResizeObserver(() => {
      resize();
      kick();
      if (reduced) draw(performance.now());
    });
    ro.observe(host);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(host);
    raf = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
      {fallback && <Nebula className="absolute inset-0 h-full" />}
      <canvas ref={gl$} className="absolute inset-0 h-full w-full" style={{ display: fallback ? "none" : undefined }} />
      <canvas ref={fx$} className="absolute inset-0 h-full w-full" />
    </div>
    <canvas ref={ship$} aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full select-none" />
    </>
  );
}
