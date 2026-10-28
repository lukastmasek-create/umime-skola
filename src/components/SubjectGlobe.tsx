"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getGlobeText } from "@/i18n/globe";
import { fmt } from "@/i18n/live";
import { useAccount } from "@/lib/use-account";
import type { SubjectSummary } from "@/app/api/predmety/route";
import type { Locale } from "@/i18n/config";

// Výběr předmětu jako otáčející se globus. Zemi kreslí živě ve WebGL fragment shader: z Blenderu
// (umime-art/blender/znacky_*.py) jsou animované památky předmětů, textury globusu vznikají
// z reálných hranic zemí (umime-art/globus_textury.py). Každý předmět má svou zemi: čeština
// Česko, ruština Rusko, angličtina Velkou Británii… Globus sám putuje od předmětu k předmětu;
// když na předmět najedeš (nebo ho vybereš vpravo), zastaví se u něj a ukáže jeho památku.

const DIR = "/home/globe";
const BASE_R = 0.26; // poloměr globu v zlomku šířky plátna při zoomu 1
const DWELL_MS = 3400;
const CANVAS_SCALE = 1.5; // velikost plátna s globem vůči scéně
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.4;
const MANUAL_MS = 8000; // jak dlouho po zásahu uživatele prohlídka počká

// Prstenec ze školních předmětů (jako u Saturnu) a letadla s raketou, které globus obíhají.
const RING_ITEMS = ["kniha", "mikroskop", "tuzka", "banka", "atom", "kalkulacka", "pravitko", "dna", "cepice", "zarovka", "lupa", "glob", "kruzitko", "kostky", "pero", "svitek", "sesit", "rostlina"] as const;
const RING_COUNT = 32;
const RING_INCL = 0.27; // sklon roviny prstence k pohledu (malý = plochá elipsa)
const RING_ROLL = -0.3; // natočení prstence na obrazovce
const FLYERS = [
  { sprite: "letadlo", incl: -0.55, roll: 0.5, speed: 0.46, phase: 0.4, rho: 1.12, size: 0.1, trail: "255,255,255" },
  { sprite: "letadlo", incl: 0.95, roll: -0.9, speed: -0.38, phase: 3.1, rho: 1.2, size: 0.085, trail: "255,190,225" },
  { sprite: "raketa", incl: -1.15, roll: 0.15, speed: 0.31, phase: 1.9, rho: 1.3, size: 0.105, trail: "255,170,90" },
] as const;
const TRAIL_LEN = 26;

const orbit = (rho: number, incl: number, roll: number, th: number) => {
  const x0 = rho * Math.cos(th);
  const d = rho * Math.sin(th) * Math.cos(incl);
  const z0 = rho * Math.sin(th) * Math.sin(incl);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  return { x: x0 * cr - z0 * sr, z: x0 * sr + z0 * cr, d };
};

type Spot = { lon: number; lat: number };

// Hlavní město (nebo typické místo) země předmětu; pořadí id v mapě zemí (id.png) = pořadí zde.
const ORDER = ["cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis", "prirodopis"] as const;
const SPOTS: Record<string, Spot> = {
  cestina: { lon: 14.42, lat: 50.09 },
  literatura: { lon: 2.35, lat: 48.86 },
  anglictina: { lon: -0.13, lat: 51.5 },
  nemcina: { lon: 13.38, lat: 52.52 },
  rustina: { lon: 37.62, lat: 55.75 },
  matematika: { lon: 23.73, lat: 37.97 },
  dejepis: { lon: 12.5, lat: 41.9 },
  zemepis: { lon: 86.93, lat: 27.99 },
  prirodopis: { lon: -60.0, lat: -3.1 },
};
const LANDMARK: Record<string, string> = {
  cestina: "cestina",
  literatura: "literatura",
  anglictina: "anglictina",
  nemcina: "nemcina",
  rustina: "rustina",
  matematika: "matematika",
  dejepis: "dejepis",
  zemepis: "zemepis",
  prirodopis: "prirodopis",
};
// Prohlídka jde od východu na západ (jako se otáčí Země), tedy podle klesající zeměpisné délky.
const TOUR = [...ORDER].sort((a, b) => SPOTS[b].lon - SPOTS[a].lon);

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Koule v rovnoběžném průmětu: z polohy pixelu normála, otočení do souřadnic planety, barva z textury.
// Osvětlení, odlesk moře, mraky, reliéf a atmosféra se počítají tady; hranice a záře vybrané země
// se berou z mapy zemí (nejbližší vzorek, aby hrany nebyly rozmazané).
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uAlbedo;
uniform sampler2D uData;
uniform sampler2D uId;
uniform vec2 uRes;
uniform float uR;
uniform float uSpin;
uniform float uTilt;
uniform float uTime;
uniform float uSel;
uniform float uCloud;
in vec2 vUv;
out vec4 outColor;
const float PI = 3.14159265358979;

void main() {
  vec2 d = (vUv * uRes - uRes * 0.5) / uR;
  float r2 = dot(d, d);
  float r = sqrt(r2);
  vec3 L = normalize(vec3(-0.55, -0.5, 0.62));

  // atmosféra kolem koule
  float glowK = exp(-(r - 1.0) * 11.0);
  float lightSide = 0.55 + 0.45 * clamp(dot(normalize(d + 1e-4), vec2(L.x, L.z) * 1.4), -1.0, 1.0);
  vec3 glowCol = vec3(0.3, 0.62, 1.0) * glowK * lightSide;
  float glowA = clamp(glowK * 0.85, 0.0, 1.0) * (1.0 - smoothstep(1.08, 1.32, r));

  if (r2 >= 1.0) {
    outColor = vec4(glowCol * glowA, glowA);
    return;
  }

  vec3 n = vec3(d.x, -sqrt(1.0 - r2), d.y);
  float ct = cos(uTilt), st = sin(uTilt);
  vec3 t = vec3(n.x, n.y * ct + n.z * st, -n.y * st + n.z * ct);
  float cs = cos(uSpin), ss = sin(uSpin);
  vec3 p = vec3(t.x * cs - t.y * ss, t.x * ss + t.y * cs, t.z);
  float u = atan(p.y, p.x) / (2.0 * PI) + 0.5;
  float v = asin(clamp(p.z, -1.0, 1.0)) / PI + 0.5;
  float u2 = fract(u + 0.5);
  vec2 gx = vec2(abs(dFdx(u)) < abs(dFdx(u2)) ? dFdx(u) : dFdx(u2), dFdx(v));
  vec2 gy = vec2(abs(dFdy(u)) < abs(dFdy(u2)) ? dFdy(u) : dFdy(u2), dFdy(v));
  vec3 alb = textureGrad(uAlbedo, vec2(u, v), gx, gy).rgb;
  vec3 dat = textureGrad(uData, vec2(u, v), gx, gy).rgb;
  float ocean = dat.r;

  // reliéf: výška posunutá směrem ke světlu
  float h1 = textureGrad(uData, vec2(u + 0.0011, v - 0.0011), gx, gy).g;
  float relief = (dat.g - h1) * 3.2 * (1.0 - ocean);

  float ndl = dot(n, L);
  float lit = smoothstep(-0.2, 0.8, ndl);
  vec3 col = alb * (0.2 + 1.08 * lit) + relief * 0.4 * lit;

  // odlesk slunce na moři
  vec3 H = normalize(L + vec3(0.0, -1.0, 0.0));
  float spec = pow(max(dot(n, H), 0.0), 80.0) * ocean;
  col += vec3(1.0, 0.97, 0.88) * spec * 0.8;

  // mraky se stínem na povrchu
  float cl = textureGrad(uData, vec2(u + uCloud, v), gx, gy).b;
  float clShadow = textureGrad(uData, vec2(u + uCloud - 0.0016, v + 0.0016), gx, gy).b;
  col *= 1.0 - 0.35 * clShadow * (1.0 - cl);
  col = mix(col, vec3(0.97, 0.98, 1.0) * (0.3 + 0.85 * lit), cl * 0.9);

  // země předmětů: světlý obrys, vybraná navíc pulzuje
  float idx = floor(textureLod(uId, vec2(u, v), 0.0).r * 255.0 / 20.0 + 0.5);
  if (idx > 0.5) {
    vec2 px = vec2(1.0 / 3072.0, 1.0 / 1536.0) * 1.3;
    float edge = 0.0;
    edge += step(0.5, abs(floor(textureLod(uId, vec2(u + px.x, v), 0.0).r * 255.0 / 20.0 + 0.5) - idx));
    edge += step(0.5, abs(floor(textureLod(uId, vec2(u - px.x, v), 0.0).r * 255.0 / 20.0 + 0.5) - idx));
    edge += step(0.5, abs(floor(textureLod(uId, vec2(u, v + px.y), 0.0).r * 255.0 / 20.0 + 0.5) - idx));
    edge += step(0.5, abs(floor(textureLod(uId, vec2(u, v - px.y), 0.0).r * 255.0 / 20.0 + 0.5) - idx));
    edge = clamp(edge, 0.0, 1.0);
    float sel = 1.0 - step(0.5, abs(idx - uSel));
    float pulse = 0.65 + 0.35 * sin(uTime * 4.0);
    col = mix(col, col * 1.2 + 0.04, sel * 0.7);
    col += edge * vec3(1.0, 0.97, 0.85) * (0.18 + 0.7 * sel * pulse) * (0.5 + 0.5 * lit);
  }

  // světla měst na noční straně (kanál G mapy zemí)
  float cityLights = textureLod(uId, vec2(u, v), 0.0).g;
  float night = 1.0 - smoothstep(-0.12, 0.28, ndl);
  col += cityLights * night * vec3(1.0, 0.78, 0.4) * 1.5;

  // atmosférický okraj
  float fres = pow(1.0 - (-n.y), 3.0);
  col += vec3(0.22, 0.52, 1.0) * fres * (0.35 + 0.65 * lit) * 0.9;
  col *= mix(0.88, 1.0, lit);

  float edgeA = 1.0 - smoothstep(0.992, 1.0, r);
  vec3 outRgb = col * edgeA + glowCol * glowA * (1.0 - edgeA);
  float outA = edgeA + glowA * (1.0 - edgeA);
  outColor = vec4(outRgb, outA);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const TAU = Math.PI * 2;
const wrapAngle = (a: number) => a - TAU * Math.round(a / TAU);

type Subject = { slug: string; value: string; label: string; color: string };

export function SubjectGlobe({ locale, subjects }: { locale: Locale; subjects: Subject[] }) {
  const t = getGlobeText(locale);
  const [account] = useAccount();
  const [data, setData] = useState<Record<string, SubjectSummary> | null>(null);
  const [front, setFront] = useState<string>("cestina");
  const [pinned, setPinned] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pinEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const landmarkEl = useRef<HTMLAnchorElement>(null);
  const backCv = useRef<HTMLCanvasElement>(null);
  const frontCv = useRef<HTMLCanvasElement>(null);
  const ringEls = useRef<(HTMLImageElement | null)[]>([]);
  const flyEls = useRef<(HTMLImageElement | null)[]>([]);
  const pinnedRef = useRef<string | null>(null);
  const activeRef = useRef<string>("cestina");
  const ctlRef = useRef<{ zoomBy: (f: number) => void; reset: () => void } | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = pinned ?? front;
  const bySlug = (slug: string) => subjects.find((s) => s.slug === slug);

  useEffect(() => {
    pinnedRef.current = pinned;
    activeRef.current = pinned ?? front;
  }, [pinned, front]);

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

  useEffect(
    () => () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
    },
    [],
  );

  // --- vykreslování a prohlídka ---
  useEffect(() => {
    const cv = canvas.current;
    const box = stage.current;
    if (!cv || !box) return;
    const gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      setFallback(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let raf = 0;
    let visible = true;
    let cleanup = () => {};

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      setFallback(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.clearColor(0, 0, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);

    const texture = (unit: number, img: HTMLImageElement, mip: boolean, nearest: boolean) => {
      const tx = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      const filter = nearest ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    // stav kamery
    let size = 0;
    let dpr = 1;
    const resize = () => {
      size = box.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      // plátno s globem je o čtvrtinu větší na každou stranu, aby přiblížený globus nebyl uříznutý
      cv.width = Math.round(size * CANVAS_SCALE * dpr);
      cv.height = cv.width;
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(u("uRes"), cv.width, cv.height);
      for (const c of [back2d, front2d]) {
        if (!c) continue;
        c.width = Math.round(size * dpr);
        c.height = c.width;
      }
    };
    const back2d = backCv.current;
    const front2d = frontCv.current;
    const bctx = back2d?.getContext("2d") ?? null;
    const fctx = front2d?.getContext("2d") ?? null;
    const dust = Array.from({ length: 150 }, (_, i) => {
      const r = Math.sin(i * 12.9898) * 43758.5453;
      const f = (k: number) => Math.abs(Math.sin(r * k)) % 1;
      return { th: f(1.3) * TAU, off: 0.9 + f(2.1) * 0.22, size: 0.6 + f(3.7) * 1.4, a: 0.25 + f(5.3) * 0.5, sp: 0.8 + f(7.1) * 0.5, wob: f(9.7) };
    });
    const trails = FLYERS.map(() => [] as { x: number; y: number; d: number }[]);

    const desiredSpin = (slug: string) => SPOTS[slug].lon * (Math.PI / 180) + Math.PI / 2;
    const desiredTilt = (slug: string) => Math.max(-0.6, Math.min(0.6, SPOTS[slug].lat * (Math.PI / 180) * 0.75));
    const near = (target: number, from: number) => from + wrapAngle(target - from);

    let spin = desiredSpin("cestina") + 1.6;
    let tilt = 0.2;
    let zoom = 1.0;
    let spinTar = spin;
    let tiltTar = tilt;
    let tourIdx = TOUR.indexOf("cestina");
    let anchor = near(desiredSpin(TOUR[tourIdx]), spin);
    let stepAt = performance.now();
    let manualUntil = 0;
    let wasManual = false;
    let userZoom = 1;
    let vel = 0; // setrvačnost otáčení (rad/s)
    let tvel = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
    const nearest = () => {
      let best = ORDER[0] as string;
      let bestD = 99;
      for (const slug of ORDER) {
        const lo = (SPOTS[slug].lon * Math.PI) / 180, la = (SPOTS[slug].lat * Math.PI) / 180;
        const dl = wrapAngle(lo - (spin - Math.PI / 2)) * Math.cos(la);
        const dp = la - tilt;
        const d = Math.hypot(dl, dp);
        if (d < bestD) {
          bestD = d;
          best = slug;
        }
      }
      return { slug: best, d: bestD };
    };
    let last = performance.now();
    let lastPinned: string | null = null;

    const frame = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const pin = pinnedRef.current;
      const dragging = now < manualUntil || pointers.size > 0;

      if (pin) {
        spinTar = near(desiredSpin(pin), spin);
        tiltTar = desiredTilt(pin);
      } else if (!dragging && !reduced) {
        if (lastPinned || now - stepAt > DWELL_MS) {
          // další zastávka prohlídky: vždy dál na západ
          if (!lastPinned) {
            const from = TOUR[tourIdx];
            tourIdx = (tourIdx + 1) % TOUR.length;
            const to = TOUR[tourIdx];
            const step = (((SPOTS[from].lon - SPOTS[to].lon) % 360) + 360) % 360;
            anchor -= step * (Math.PI / 180);
            setFront(to);
          } else {
            // po odchodu kurzoru prohlídka pokračuje od předmětu, u kterého se zastavila
            tourIdx = Math.max(0, TOUR.indexOf(lastPinned as (typeof TOUR)[number]));
            anchor = near(desiredSpin(TOUR[tourIdx]), spin);
            setFront(TOUR[tourIdx]);
          }
          stepAt = now;
        }
        spinTar = anchor - ((now - stepAt) / 1000) * 0.012;
        tiltTar = desiredTilt(TOUR[tourIdx]);
      } else if (reduced && !dragging) {
        spinTar = near(desiredSpin(activeRef.current), spin);
        tiltTar = desiredTilt(activeRef.current);
      }
      lastPinned = pin;

      if (dragging) {
        wasManual = true;
        if (pointers.size === 0 && !pin) {
          // setrvačnost po puštění: globus dotáčí a zpomaluje
          spin += vel * dt;
          tilt = Math.max(-1.25, Math.min(1.25, tilt + tvel * dt));
          spinTar = spin;
          tiltTar = tilt;
          const decay = Math.exp(-dt * 2.4);
          vel *= decay;
          tvel *= decay;
        }
        // panel ukazuje předmět, k jehož zemi se uživatel právě dotočil
        const n = nearest();
        if (!pin && n.d < 0.5 && n.slug !== activeRef.current) setFront(n.slug);
      } else if (wasManual) {
        // po manuálním otáčení prohlídka pokračuje od nejbližšího předmětu
        wasManual = false;
        const n = nearest();
        tourIdx = Math.max(0, TOUR.indexOf(n.slug as (typeof TOUR)[number]));
        anchor = near(desiredSpin(TOUR[tourIdx]), spin);
        stepAt = now;
        setFront(TOUR[tourIdx]);
      }

      const k = dragging ? 12 : 2.6;
      spin += (spinTar - spin) * (1 - Math.exp(-dt * k));
      tilt += (tiltTar - tilt) * (1 - Math.exp(-dt * k));
      const settled = Math.abs(spinTar - spin) < 0.18;
      const auto = dragging ? 1.15 : settled ? 1.5 : 1.12;
      const zoomTar = Math.min(MAX_ZOOM + 0.3, auto * userZoom);
      zoom += (zoomTar - zoom) * (1 - Math.exp(-dt * 3));

      const R = size * BASE_R * zoom;
      const sel = ORDER.indexOf(activeRef.current as (typeof ORDER)[number]) + 1;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u("uR"), R * dpr);
      gl.uniform1f(u("uSpin"), spin);
      gl.uniform1f(u("uTilt"), tilt);
      gl.uniform1f(u("uTime"), now / 1000);
      gl.uniform1f(u("uSel"), sel);
      gl.uniform1f(u("uCloud"), -now / 1000 / 520 + 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // prstenec ze školních předmětů, prach a dráhy letadel; zadní polovina je pod globem, přední nad ním
      const sw = back2d?.width ?? 0;
      if (bctx && fctx) {
        bctx.clearRect(0, 0, sw, sw);
        fctx.clearRect(0, 0, sw, sw);
        const cx = size / 2, cy = size / 2;
        const rho = size * (0.17 + 0.16 * zoom);
        const sec = now / 1000;
        const spinRing = reduced ? 0 : sec * 0.11;
        const put = (th: number, rr: number) => {
          const o = orbit(rr, RING_INCL, RING_ROLL, th);
          return { x: cx + o.x, y: cy - o.z, d: o.d };
        };
        // průsvitný pás prstence
        for (const [k, a] of [[0.9, 0.1], [0.97, 0.2], [1.04, 0.2], [1.11, 0.1]] as const) {
          for (let i = 0; i < 90; i++) {
            const p1 = put((i / 90) * TAU, rho * k), p2 = put(((i + 1) / 90) * TAU, rho * k);
            const ctx = p1.d > 0 ? bctx : fctx;
            ctx.strokeStyle = `rgba(170,205,255,${a * (p1.d > 0 ? 0.7 : 1)})`;
            ctx.lineWidth = rho * 0.06 * dpr;
            ctx.beginPath();
            ctx.moveTo(p1.x * dpr, p1.y * dpr);
            ctx.lineTo(p2.x * dpr, p2.y * dpr);
            ctx.stroke();
          }
        }
        for (const dp of dust) {
          const p = put(dp.th + spinRing * dp.sp, rho * dp.off);
          const ctx = p.d > 0 ? bctx : fctx;
          ctx.fillStyle = `rgba(235,245,255,${dp.a * (p.d > 0 ? 0.6 : 1)})`;
          ctx.beginPath();
          ctx.arc(p.x * dpr, p.y * dpr, dp.size * dpr, 0, TAU);
          ctx.fill();
        }
        for (let i = 0; i < RING_COUNT; i++) {
          const el = ringEls.current[i];
          if (!el) continue;
          const th = (i / RING_COUNT) * TAU + spinRing;
          const jitter = 1 + 0.05 * Math.sin(i * 7.3);
          const p = put(th, rho * jitter);
          const depth = p.d / rho; // -1 vpředu .. 1 vzadu
          const sz = size * 0.092 * (1.08 - depth * 0.22);
          const rock = reduced ? 0 : Math.sin(sec * 0.9 + i * 1.7) * 10;
          const bob = reduced ? 0 : Math.sin(sec * 1.3 + i) * 3;
          el.style.width = el.style.height = `${sz}px`;
          el.style.transform = `translate3d(${p.x - sz / 2}px, ${p.y - sz / 2 + bob}px, 0) rotate(${rock}deg)`;
          el.style.zIndex = p.d > 0 ? "1" : "6";
          el.style.filter = p.d > 0 ? "brightness(0.78)" : "none";
        }
        // letadla a raketa s dráhou za sebou
        FLYERS.forEach((f, i) => {
          const el = flyEls.current[i];
          if (!el) return;
          const th = f.phase + (reduced ? 0 : sec * f.speed);
          const r2 = size * (0.34 + 0.08 * zoom) * f.rho;
          const o1 = orbit(r2, f.incl, f.roll, th);
          const o2 = orbit(r2, f.incl, f.roll, th + 0.03 * Math.sign(f.speed));
          const x = cx + o1.x, y = cy - o1.z;
          const ang = Math.atan2(-(o2.z - o1.z), o2.x - o1.x);
          const sz = size * f.size * (1.05 - (o1.d / r2) * 0.2);
          el.style.width = el.style.height = `${sz}px`;
          el.style.transform = `translate3d(${x - sz / 2}px, ${y - sz / 2}px, 0) rotate(${ang}rad)`;
          el.style.zIndex = o1.d > 0 ? "1" : "7";
          const tr = trails[i];
          tr.push({ x, y, d: o1.d });
          if (tr.length > TRAIL_LEN) tr.shift();
          for (let k = 1; k < tr.length; k++) {
            const a = tr[k - 1], b = tr[k];
            const ctx = b.d > 0 ? bctx : fctx;
            ctx.strokeStyle = `rgba(${f.trail},${(k / tr.length) * 0.55})`;
            ctx.lineWidth = (1 + (k / tr.length) * 2.6) * dpr;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(a.x * dpr, a.y * dpr);
            ctx.lineTo(b.x * dpr, b.y * dpr);
            ctx.stroke();
          }
        });
      }

      // průmět značek: stejné otočení jako v shaderu, jen opačným směrem
      const cs = Math.cos(spin), ss = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt);
      for (const slug of ORDER) {
        const { lon, lat } = SPOTS[slug];
        const lo = (lon * Math.PI) / 180, la = (lat * Math.PI) / 180;
        const px = Math.cos(la) * Math.cos(lo), py = Math.cos(la) * Math.sin(lo), pz = Math.sin(la);
        const tx = px * cs + py * ss, ty = -px * ss + py * cs, tz = pz;
        const nx = tx, ny = ty * ct - tz * st, nz = ty * st + tz * ct;
        const facing = -ny;
        const x = size / 2 + nx * R, y = size / 2 - nz * R;
        const isActive = slug === activeRef.current;
        const el = isActive ? landmarkEl.current : pinEls.current[slug];
        const hide = pinEls.current[slug];
        if (hide) {
          const showPin = !isActive && facing > 0.12;
          hide.style.opacity = showPin ? String(Math.min(1, (facing - 0.12) * 4)) : "0";
          hide.style.pointerEvents = showPin ? "auto" : "none";
          hide.style.transform = `translate3d(${x - 15}px, ${y - 15}px, 0)`;
        }
        if (isActive && el) {
          const f = Math.max(0, Math.min(1, (facing - 0.1) * 3));
          el.style.opacity = String(f);
          el.style.pointerEvents = f > 0.6 ? "auto" : "none";
          el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -79%) scale(${0.7 + 0.3 * f})`;
        }
      }

      if (visible && (!reduced || Math.abs(spinTar - spin) > 0.002 || Math.abs(zoomTar - zoom) > 0.002 || Math.abs(vel) > 0.01 || Math.abs(tvel) > 0.01)) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const kick = () => {
      if (!raf && visible && !disposed) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    // ovládání: tažení otáčí (se setrvačností), kolečko po kliknutí nebo Ctrl+kolečko, štípnutí a tlačítka
    // přibližují, dvojklik vrací výchozí pohled, šipky a +/- fungují z klávesnice
    let engaged = false;
    let lastMoveAt = 0;
    const bump = () => {
      manualUntil = performance.now() + MANUAL_MS;
      kick();
    };
    let pinch0 = 0;
    let pinchZoom0 = 1;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      box.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      engaged = true;
      vel = 0;
      tvel = 0;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
        pinchZoom0 = userZoom;
      }
      bump();
    };
    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        if (pinch0 > 0) userZoom = clampZoom((pinchZoom0 * Math.hypot(a.x - b.x, a.y - b.y)) / pinch0);
      } else {
        const R = size * BASE_R * zoom;
        const dSpin = -dx / R, dTilt = dy / R;
        spin += dSpin;
        tilt = Math.max(-1.25, Math.min(1.25, tilt + dTilt));
        spinTar = spin;
        tiltTar = tilt;
        const dtm = Math.max(0.008, (e.timeStamp - lastMoveAt) / 1000);
        lastMoveAt = e.timeStamp;
        vel = Math.max(-8, Math.min(8, vel * 0.5 + (dSpin / dtm) * 0.5));
        tvel = Math.max(-8, Math.min(8, tvel * 0.5 + (dTilt / dtm) * 0.5));
      }
      bump();
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch0 = 0;
      // kdo před puštěním zastavil, žádný švih nechce
      if (e.timeStamp - lastMoveAt > 90) {
        vel = 0;
        tvel = 0;
      }
      bump();
    };
    const onLeave = () => {
      engaged = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || engaged)) return;
      e.preventDefault();
      userZoom = clampZoom(userZoom * Math.exp(-e.deltaY * 0.0016));
      bump();
    };
    const resetView = () => {
      userZoom = 1;
      vel = 0;
      tvel = 0;
      manualUntil = 0;
      kick();
    };
    const onKey = (e: KeyboardEvent) => {
      const step = 0.16;
      if (e.key === "ArrowLeft") spin -= step;
      else if (e.key === "ArrowRight") spin += step;
      else if (e.key === "ArrowUp") tilt = Math.min(1.25, tilt + step);
      else if (e.key === "ArrowDown") tilt = Math.max(-1.25, tilt - step);
      else if (e.key === "+" || e.key === "=") userZoom = clampZoom(userZoom * 1.2);
      else if (e.key === "-" || e.key === "_") userZoom = clampZoom(userZoom / 1.2);
      else if (e.key === "0" || e.key === "Home") return resetView();
      else return;
      e.preventDefault();
      spinTar = spin;
      tiltTar = tilt;
      bump();
    };
    ctlRef.current = {
      zoomBy: (f: number) => {
        userZoom = clampZoom(userZoom * f);
        bump();
      },
      reset: resetView,
    };
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerup", onUp);
    box.addEventListener("pointercancel", onUp);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("dblclick", resetView);
    box.addEventListener("keydown", onKey);

    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(box);
    resize();

    (async () => {
      try {
        const [albedo, dat, ids] = await Promise.all([loadImage(`${DIR}/albedo.webp`), loadImage(`${DIR}/data.webp`), loadImage(`${DIR}/id.png`)]);
        if (disposed) return;
        texture(0, albedo, true, false);
        texture(1, dat, true, false);
        texture(2, ids, false, true);
        gl.uniform1i(u("uAlbedo"), 0);
        gl.uniform1i(u("uData"), 1);
        gl.uniform1i(u("uId"), 2);
        setReady(true);
        last = performance.now();
        stepAt = last;
        raf = requestAnimationFrame(frame);
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          kick();
        });
        io.observe(box);
        const prevCleanup = cleanup;
        cleanup = () => {
          prevCleanup();
          io.disconnect();
        };
      } catch {
        setFallback(true);
      }
    })();

    // při změně vybraného předmětu a po kliknutí na značku znovu rozběhneme vykreslování
    const watch = window.setInterval(kick, 400);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearInterval(watch);
      ro.disconnect();
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerup", onUp);
      box.removeEventListener("pointercancel", onUp);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("dblclick", resetView);
      box.removeEventListener("keydown", onKey);
      ctlRef.current = null;
      cleanup();
    };
  }, []);

  const pin = (slug: string | null) => {
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    if (slug) setPinned(slug);
    else releaseTimer.current = setTimeout(() => setPinned(null), 900);
  };

  // Tlačítka přiblížení: factor 0 = obnovit pohled.
  const control = (factor: number) => () => {
    if (factor === 0) ctlRef.current?.reset();
    else ctlRef.current?.zoomBy(factor);
  };

  const subject = bySlug(active) ?? subjects[0];
  const summary = data?.[subject.slug];
  const base = `/${locale}/kurzy/zakladni?predmet=${subject.slug}`;
  const href = (slug: string) => `/${locale}/kurzy/zakladni?predmet=${slug}`;
  const percent = summary && summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;
  const stageHidden = fallback ? "hidden" : "";

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div
        ref={stage}
        role="group"
        aria-label={t.label}
        tabIndex={0}
        className="relative mx-auto aspect-square w-full max-w-[600px] cursor-grab touch-pan-y select-none rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 active:cursor-grabbing"
        onPointerLeave={() => pin(null)}
      >
        {fallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${DIR}/still.webp`} alt="" draggable={false} className="h-full w-full object-contain" />
        ) : (
          <>
            <canvas ref={backCv} aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full" />
            <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible">
              <defs>
                <path id="orb-a" d="M 4 52 A 47 17 -16 1 1 96 48 A 47 17 -16 1 1 4 52" />
                <path id="orb-b" d="M 10 30 A 42 22 28 1 1 90 70 A 42 22 28 1 1 10 30" />
              </defs>
              <use href="#orb-a" fill="none" stroke="rgba(160,190,255,0.22)" strokeWidth="0.25" strokeDasharray="1.2 1.6" />
              <use href="#orb-b" fill="none" stroke="rgba(255,190,225,0.18)" strokeWidth="0.25" strokeDasharray="0.8 1.8" />
              <circle r="1.3" fill="#fff6c8">
                <animateMotion dur="26s" repeatCount="indefinite"><mpath href="#orb-a" /></animateMotion>
              </circle>
              <circle r="1" fill="#9fe7ff">
                <animateMotion dur="38s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#orb-b" /></animateMotion>
              </circle>
            </svg>
            {/* eslint-disable @next/next/no-img-element */}
            {Array.from({ length: RING_COUNT }, (_, i) => (
              <img
                key={i}
                ref={(el) => {
                  ringEls.current[i] = el;
                }}
                src={`${DIR}/obj-${RING_ITEMS[i % RING_ITEMS.length]}.webp`}
                alt=""
                aria-hidden
                draggable={false}
                loading="lazy"
                className="pointer-events-none absolute left-0 top-0 max-w-none opacity-95"
                style={{ willChange: "transform" }}
              />
            ))}
            {FLYERS.map((f, i) => (
              <img
                key={i}
                ref={(el) => {
                  flyEls.current[i] = el;
                }}
                src={`${DIR}/obj-${f.sprite}.webp`}
                alt=""
                aria-hidden
                draggable={false}
                loading="lazy"
                className="pointer-events-none absolute left-0 top-0 max-w-none"
                style={{ willChange: "transform" }}
              />
            ))}
            {/* eslint-enable @next/next/no-img-element */}
            <canvas ref={canvas} aria-hidden className={`pointer-events-none absolute left-[-25%] top-[-25%] z-[2] h-[150%] w-[150%] ${stageHidden}`} style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s" }} />
            {!ready && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${DIR}/still.webp`} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-contain" />
            )}
            <canvas ref={frontCv} aria-hidden className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />
            {ORDER.map((slug) => {
              const s = bySlug(slug);
              if (!s) return null;
              return (
                <button
                  key={slug}
                  ref={(el) => {
                    pinEls.current[slug] = el;
                  }}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  title={`${s.label} · ${t.places[slug]}`}
                  onMouseEnter={() => pin(slug)}
                  onFocus={() => pin(slug)}
                  onClick={() => pin(slug)}
                  className="absolute left-0 top-0 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#16132b] bg-white/85 opacity-0 shadow-[0_3px_0_rgba(0,0,0,0.35)] transition-[opacity] hover:scale-110"
                  style={{ background: s.color, willChange: "transform" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/home/predmet-${slug}.webp`} alt="" width={20} height={20} draggable={false} className="h-5 w-5 object-contain" />
                </button>
              );
            })}
            <Link
              ref={landmarkEl}
              href={href(subject.slug)}
              tabIndex={-1}
              aria-hidden
              className="absolute left-0 top-0 z-20 flex flex-col items-center opacity-0"
              style={{ willChange: "transform, opacity" }}
              onMouseEnter={() => pin(subject.slug)}
            >
              <span key={subject.slug} className="globe-pop flex flex-col items-center">
                <span
                  className="globe-sprite block h-[150px] w-[150px] drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)] sm:h-[190px] sm:w-[190px]"
                  style={{ backgroundImage: `url(${DIR}/${LANDMARK[subject.slug]}.webp)` }}
                />
                <span
                  className="-mt-6 whitespace-nowrap rounded-full border-2 border-[#16132b] px-3 py-1 text-xs font-extrabold text-[#16132b] shadow-[0_3px_0_rgba(0,0,0,0.35)] sm:text-sm"
                  style={{ background: subject.color }}
                >
                  {subject.label} · {t.places[subject.slug]}
                </span>
              </span>
            </Link>
          </>
        )}
        {!fallback && (
          <div className="absolute right-1 top-1 z-30 flex flex-col gap-1.5">
            {(
              [
                ["+", t.zoomIn, 1.3],
                ["−", t.zoomOut, 1 / 1.3],
                ["⟲", t.resetView, 0],
              ] as const
            ).map(([label, name, factor]) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                title={name}
                onClick={control(factor)}
                className="btn-bouncy flex h-9 w-9 items-center justify-center bg-[var(--surface)] text-lg font-extrabold leading-none"
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-xs font-semibold text-white/70">↔ {t.drag}</p>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <p className="text-sm text-[var(--muted)]">{t.hint}</p>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {subjects.map((s) => {
            const sum = data?.[s.slug];
            const pct = sum && sum.total > 0 ? (sum.done / sum.total) * 100 : 0;
            const isActive = s.slug === active;
            // Předměty bez vlastní země na globu (Fyzika) jsou jen odkaz; globus se kvůli nim nezastavuje.
            const onGlobe = (ORDER as readonly string[]).includes(s.slug);
            return (
              <li key={s.slug}>
                <Link
                  href={href(s.slug)}
                  onMouseEnter={() => onGlobe && pin(s.slug)}
                  onMouseLeave={() => onGlobe && pin(null)}
                  onFocus={() => onGlobe && pin(s.slug)}
                  onBlur={() => onGlobe && pin(null)}
                  aria-current={isActive ? "true" : undefined}
                  className={`card card-hover relative flex h-full flex-col gap-1.5 p-2.5 text-[#1b1830] ${isActive ? "ring-4 ring-white/80" : ""}`}
                  style={{ background: s.color, borderColor: "#16132b" }}
                >
                  <span className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/home/predmet-${s.slug}.webp`} alt="" width={36} height={36} draggable={false} className="h-9 w-9 shrink-0 object-contain" />
                    <span className="text-sm font-bold leading-tight">{s.label}</span>
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-black/15" aria-hidden>
                    <span className="block h-full rounded-full bg-[#16132b]/70" style={{ width: `${pct}%`, transition: "width 0.6s ease" }} />
                  </span>
                  {sum && sum.due > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 rounded-full border-2 border-[#16132b] bg-[#ffd24d] px-1.5 text-[11px] font-extrabold leading-5" title={fmt(t.review, { n: sum.due })}>
                      🔁 {sum.due}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="card flex flex-col gap-3 p-4" style={{ borderColor: subject.color }}>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/home/predmet-${subject.slug}.webp`} alt="" width={44} height={44} draggable={false} className="h-11 w-11 object-contain" />
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                {subject.label}
              </h3>
              <p className="text-xs font-semibold text-[var(--muted)]">{t.places[subject.slug]}</p>
            </div>
          </div>
          {summary ? (
            summary.total > 0 ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                  <span>{fmt(t.progress, { done: summary.done, total: summary.total })}</span>
                  <span>{percent} %</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, background: subject.color, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">{t.noCourses}</p>
            )
          ) : (
            account?.loggedIn === false && <p className="text-xs text-[var(--muted)]">{t.guest}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {summary?.next && (
              <Link
                href={`/${locale}/kurzy/${summary.next.category}/${summary.next.slug}`}
                className="btn-bouncy btn-primary flex min-w-0 max-w-full items-center px-4 py-2 text-sm font-bold"
              >
                <span className="truncate">{fmt(summary.next.started ? t.continueCourse : t.startCourse, { title: summary.next.title })}</span>
              </Link>
            )}
            <Link href={base} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold">
              {t.openCourses}
            </Link>
            {summary && summary.due > 0 && (
              <Link href={`/${locale}/opakovani`} className="btn-bouncy bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b]">
                🔁 {fmt(t.review, { n: summary.due })}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
