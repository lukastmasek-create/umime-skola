"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccount } from "@/lib/use-account";
import type { SubjectSummary } from "@/app/api/predmety/route";
import { prefersReducedMotion } from "@/lib/motion";

// Kurzy jako souostroví: každý předmět je ostrov s památkou z Blenderu (stejné jako na globusu),
// moře se vlní ve WebGL (vlny, třpyt, pěna kolem pobřeží, kruhy od kurzoru a od vybraného ostrova),
// mezi ostrovy pluje plachetnice. Přihlášenému se u ostrova ukáže postup. Ostrovy jsou odkazy
// na filtr předmětu, takže to funguje i bez JavaScriptu.

const DIR = "/home/globe";
const TAU = Math.PI * 2;

type Island = { slug: string; label: string; color: string; count: number; href: string; active: boolean };

// Poloha ostrovů v procentech scény: širší rozložení do dvou řad a úzké do tří sloupců.
const WIDE: Record<string, [number, number]> = {
  cestina: [10, 24], literatura: [30, 19], anglictina: [50, 26], nemcina: [70, 20], rustina: [90, 25],
  matematika: [10, 52], dejepis: [30, 47], zemepis: [50, 54], prirodopis: [70, 48], fyzika: [90, 53],
  chemie: [17, 80], obcanka: [39, 75], hudebka: [61, 81], francouzstina: [83, 76],
};
const NARROW: Record<string, [number, number]> = {
  cestina: [21, 9], literatura: [50, 6], anglictina: [79, 10],
  nemcina: [21, 28], rustina: [50, 25], matematika: [79, 29],
  dejepis: [21, 47], zemepis: [50, 44], prirodopis: [79, 48],
  fyzika: [21, 66], chemie: [50, 63], obcanka: [79, 67],
  hudebka: [33, 85], francouzstina: [67, 82],
};
const ORDER = ["cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis", "prirodopis", "fyzika", "chemie", "obcanka", "hudebka", "francouzstina"];
const N = ORDER.length;

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Moře: součet několika vln dává výšku a z ní normálu; osvětlení z levého horního rohu, třpyt, hloubka
// podle vzdálenosti od ostrovů (tyrkys u břehu), pěna v kruzích kolem ostrovů a zlatá vlna kolem vybraného.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uIsl[14];
uniform float uSel;
uniform vec3 uMouse;
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
float waves(vec2 p, float t) {
  float h = 0.0;
  h += sin(dot(p, vec2(0.8, 0.6)) * 9.0 + t * 1.1) * 0.5;
  h += sin(dot(p, vec2(-0.5, 0.85)) * 14.0 + t * 1.5) * 0.28;
  h += sin(dot(p, vec2(0.95, -0.3)) * 23.0 - t * 1.9) * 0.16;
  h += (noise(p * 18.0 + t * 0.3) - 0.5) * 0.4;
  return h;
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * asp, vUv.y);
  float e = 0.004;
  float h0 = waves(p, uTime), hx = waves(p + vec2(e, 0.0), uTime), hy = waves(p + vec2(0.0, e), uTime);
  vec3 n = normalize(vec3((h0 - hx) * 2.4, (h0 - hy) * 2.4, 1.0));

  // vzdálenost k nejbližšímu ostrovu (v jednotkách výšky scény)
  float dMin = 9.0;
  float foam = 0.0;
  float sel = 0.0;
  for (int i = 0; i < 14; i++) {
    vec2 c = vec2(uIsl[i].x * asp, uIsl[i].y);
    float d = length((p - c) * vec2(1.0, 1.35));
    float r = uIsl[i].z;
    dMin = min(dMin, d - r);
    float edge = d - r;
    // tři pěnové kruhy, které se od břehu pomalu rozšiřují
    for (int k = 0; k < 3; k++) {
      float ph = fract(uTime * 0.07 + float(k) / 3.0 + float(i) * 0.17);
      float ring = abs(edge - ph * 0.07);
      foam += smoothstep(0.006, 0.0, ring) * (1.0 - ph) * (0.6 + 0.4 * noise(p * 40.0 + uTime));
    }
    foam += smoothstep(0.02, 0.0, abs(edge - 0.004)) * 0.6;
    if (abs(uSel - float(i)) < 0.5) {
      float ph2 = fract(uTime * 0.5);
      sel += smoothstep(0.012, 0.0, abs(edge - 0.02 - ph2 * 0.09)) * (1.0 - ph2);
    }
  }

  float depth = smoothstep(0.0, 0.2, dMin);
  vec3 shallow = vec3(0.16, 0.78, 0.82), mid = vec3(0.07, 0.42, 0.78), deep = vec3(0.03, 0.14, 0.42);
  vec3 col = mix(shallow, mid, smoothstep(0.0, 0.1, dMin));
  col = mix(col, deep, smoothstep(0.08, 0.5, dMin));

  // světlo a třpyt
  vec3 L = normalize(vec3(-0.5, 0.6, 0.65));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  col *= 0.75 + 0.5 * diff;
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 140.0);
  col += vec3(1.0, 0.97, 0.9) * spec * 1.4;
  // kaustika v mělčině
  float ca = abs(sin(h0 * 14.0 + p.x * 20.0)) * abs(sin(h0 * 11.0 - p.y * 24.0));
  col += vec3(0.5, 0.9, 0.9) * pow(ca, 6.0) * 0.35 * (1.0 - smoothstep(0.0, 0.12, dMin));
  col += vec3(0.95, 0.98, 1.0) * clamp(foam, 0.0, 1.0) * 0.8;
  col += vec3(1.0, 0.85, 0.4) * sel * 1.2;

  // kruhy od kurzoru
  vec2 m = vec2(uMouse.x * asp, uMouse.y);
  float dm = length(p - m);
  float rip = smoothstep(0.01, 0.0, abs(dm - fract(uMouse.z) * 0.12)) * (1.0 - fract(uMouse.z)) * step(0.0, uMouse.z);
  col += vec3(0.85, 0.95, 1.0) * rip * 0.5;
  col *= 1.0 - 0.35 * dot(vUv - 0.5, vUv - 0.5) * 2.0;
  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

export function CourseWorld({ locale, islands, allHref, allLabel, noteLabel }: { locale: string; islands: Island[]; allHref: string; allLabel: string; noteLabel: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const sea = useRef<HTMLCanvasElement>(null);
  const ship = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [account] = useAccount();
  const [data, setData] = useState<Record<string, SubjectSummary> | null>(null);
  const hoverRef = useRef<string | null>(null);
  const narrowRef = useRef(false);
  const selRef = useRef(-1);

  const selected = islands.find((i) => i.active)?.slug ?? null;
  const focus = hover ?? selected;

  useEffect(() => {
    hoverRef.current = focus;
    selRef.current = focus ? ORDER.indexOf(focus) : -1;
  }, [focus]);
  useEffect(() => {
    narrowRef.current = narrow;
  }, [narrow]);

  useEffect(() => {
    if (!account?.loggedIn) return;
    let alive = true;
    fetch("/api/predmety")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.loggedIn && d.subjects) setData(d.subjects);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [account?.loggedIn]);

  useEffect(() => {
    const box = stage.current;
    const cv = sea.current;
    if (!box || !cv) return;
    const reduced = prefersReducedMotion();
    const gl = cv.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    let glOk = false;
    let u: (n: string) => WebGLUniformLocation | null = () => null;
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
        glOk = false;
      }
    }
    let W = 0, H = 0;
    let raf = 0;
    let visible = true;
    let disposed = false;
    const mouse = { x: -1, y: -1, t: -10 };
    const t0 = performance.now();
    const resize = () => {
      const r = box.getBoundingClientRect();
      W = r.width;
      H = r.height;
      setNarrow(W < 640);
      if (gl && glOk) {
        const scale = Math.min(1, 900 / W) * Math.min(window.devicePixelRatio || 1, 1.25);
        cv.width = Math.max(2, Math.round(W * scale));
        cv.height = Math.max(2, Math.round(H * scale));
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(u("uRes"), cv.width, cv.height);
      }
    };
    const pos = (slug: string): [number, number] => (narrowRef.current ? NARROW : WIDE)[slug];
    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const sec = (now - t0) / 1000;
      if (gl && glOk) {
        const arr = new Float32Array(N * 3);
        ORDER.forEach((slug, i) => {
          const [px, py] = pos(slug);
          arr[i * 3] = px / 100;
          arr[i * 3 + 1] = 1 - (py + 4) / 100;
          arr[i * 3 + 2] = narrowRef.current ? 0.042 : 0.034;
        });
        gl.uniform3fv(u("uIsl"), arr);
        gl.uniform1f(u("uTime"), reduced ? 3 : sec);
        gl.uniform1f(u("uSel"), selRef.current);
        gl.uniform3f(u("uMouse"), mouse.x, mouse.y, reduced ? -1 : (now - mouse.t) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      // plachetnice pluje stále zprava doleva (příď má vlevo), za okrajem se vynoří znovu zprava; nikdy se nezrcadlí
      const sh = ship.current;
      if (sh && W > 0) {
        const t = reduced ? 0.45 : (sec * 0.018) % 1;
        const sz = Math.min(W * (narrowRef.current ? 0.26 : 0.13), 190);
        const px = (1 - t) * (W + sz * 1.4) - sz * 0.7 - sz / 2;
        const y = 54 + (narrowRef.current ? 12 : 8) * Math.sin(t * TAU * 2);
        sh.style.width = `${sz}px`;
        sh.style.transform = `translate3d(${px}px, ${(y / 100) * H - sz * 0.7 + Math.sin(sec * 2) * 3}px, 0) rotate(${Math.sin(sec * 1.3) * 2.5}deg)`;
      }
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && !disposed) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      const now = performance.now();
      if (now - mouse.t > 450) {
        mouse.x = x;
        mouse.y = y;
        mouse.t = now;
      }
      kick();
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) frame(performance.now());
      kick();
    });
    ro.observe(box);
    resize();
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      kick();
    });
    io.observe(box);
    window.addEventListener("pointermove", onMove, { passive: true });
    kick();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const place = narrow ? NARROW : WIDE;
  const size = narrow ? 28 : 14;

  return (
    <div className="mb-10">
      <div
        ref={stage}
        className="relative w-full overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]"
        style={{ aspectRatio: narrow ? "4 / 7.5" : "16 / 11", background: "linear-gradient(180deg,#1b6fc4,#0a3a7a)" }}
      >
        <canvas ref={sea} aria-hidden className="absolute inset-0 h-full w-full" />
        <div ref={ship} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[5]" style={{ aspectRatio: "1 / 1", willChange: "transform" }}>
          <span className="ship-sprite block h-full w-full" style={{ backgroundImage: "url(/home/svet/plachetnice.webp)" }} />
        </div>
        {islands.map((isl) => {
          const [x, y] = place[isl.slug] ?? [50, 50];
          const on = focus === isl.slug;
          const sum = data?.[isl.slug];
          const pct = sum && sum.total > 0 ? Math.round((sum.done / sum.total) * 100) : null;
          return (
            <Link
              key={isl.slug}
              href={isl.href}
              aria-current={isl.active ? "true" : undefined}
              onMouseEnter={() => setHover(isl.slug)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(isl.slug)}
              onBlur={() => setHover(null)}
              className="absolute z-10 block"
              style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, transform: "translate(-50%, -66%)" }}
            >
              <span
                className="block w-full transition-transform duration-300"
                style={{ aspectRatio: "1 / 1", transform: on ? "translateY(-5%) scale(1.07)" : "none", filter: on ? "drop-shadow(0 14px 14px rgba(0,20,60,0.5))" : "drop-shadow(0 8px 8px rgba(0,20,60,0.4))" }}
              >
                {on ? (
                  <span className="globe-sprite block h-full w-full" style={{ backgroundImage: `url(${DIR}/${isl.slug}.webp)` }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${DIR}/still-${isl.slug}.webp`} alt="" draggable={false} loading="lazy" className="block h-full w-full select-none" />
                )}
              </span>
              <span
                className="absolute left-1/2 top-[86%] flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap rounded-full border-2 border-[#16132b] px-3 py-0.5 text-center text-[11px] font-extrabold leading-tight text-[#16132b] shadow-[0_3px_0_rgba(0,0,0,0.35)] sm:text-sm"
                style={{ background: isl.color, outline: isl.active ? "3px solid #fff" : undefined }}
              >
                <span>
                  {isl.label} <span className="font-bold opacity-70">· {isl.count}</span>
                </span>
                {pct !== null && (
                  <span aria-hidden className="block h-1 w-14 overflow-hidden rounded-full bg-black/20">
                    <span className="block h-full rounded-full bg-[#16132b]/80" style={{ width: `${pct}%` }} />
                  </span>
                )}
              </span>
            </Link>
          );
        })}
        <Link
          href={allHref}
          className="btn-bouncy absolute bottom-3 left-3 z-20 bg-[var(--surface)] px-3 py-1.5 text-xs font-bold sm:text-sm"
          aria-current={!selected ? "true" : undefined}
        >
          {allLabel}
        </Link>
        <p className="pointer-events-none absolute bottom-3 right-4 z-20 hidden text-xs font-semibold text-white/80 sm:block">{noteLabel}</p>
      </div>
      <span className="sr-only" lang={locale}>
        {noteLabel}
      </span>
    </div>
  );
}
