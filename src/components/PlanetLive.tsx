"use client";

import { useEffect, useRef, useState } from "react";

// Planeta se vykresluje živě ve WebGL (plynulých 60 a víc snímků za vteřinu podle displeje).
// Z Blenderu (umime-art/blender/planeta_vrstvy.py) pocházejí vrstvy: rovnoúhlá textura povrchu,
// osvětlení se stínem prstence, atmosférická záře, prstenec za a před planetou a měsíce.
// Shader položí texturu na kouli a otáčí s ní; měsíce se pohybují po oběžných drahách v DOM.

const DIR = "/home/planet-live";
const W = 720;
const H = 478;
const ORTHO = 5.5; // šířka záběru v jednotkách scény (poloměr planety = 1)
const SPIN_SECONDS = 48; // jedna otáčka planety
const TILT = (6 * Math.PI) / 180;

const MOONS = [
  { id: "mesic1", r: 0.24, period: 15, phase: 0.6, orbit: (p: number) => [3.0 * Math.cos(p), 3.0 * Math.sin(p) * 0.55 - 0.25, 0.65 * Math.sin(p)] },
  { id: "mesic2", r: 0.11, period: -7.5, phase: 2.4, orbit: (p: number) => [2.15 * Math.cos(p), 2.15 * Math.sin(p) * 0.6, 0.3 * Math.sin(p - 2.4)] },
] as const;

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Rovnoběžný průmět koule: z polohy pixelu spočítá normálu, otočí ji do souřadnic planety
// a podle délky a šířky vyčte barvu z textury. Barva se násobí osvětlením z Blenderu.
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uAlbedo;
uniform sampler2D uShade;
uniform vec2 uRes;
uniform float uR;
uniform float uSpin;
uniform float uTilt;
in vec2 vUv;
out vec4 outColor;
const float PI = 3.14159265358979;

void main() {
  vec4 shade = texture(uShade, vUv);
  vec2 d = (vUv * uRes - uRes * 0.5) / uR;
  float r2 = min(dot(d, d), 0.9995);
  // svět: x doprava, y od kamery, z nahoru
  vec3 n = vec3(d.x, -sqrt(1.0 - r2), d.y);
  // p = Rz(spin) * Rx(-tilt) * n
  float ct = cos(uTilt), st = sin(uTilt);
  vec3 t = vec3(n.x, n.y * ct + n.z * st, -n.y * st + n.z * ct);
  float cs = cos(uSpin), ss = sin(uSpin);
  vec3 p = vec3(t.x * cs - t.y * ss, t.x * ss + t.y * cs, t.z);
  float u = atan(p.y, p.x) / (2.0 * PI) + 0.5;
  float v = asin(clamp(p.z, -1.0, 1.0)) / PI + 0.5;
  // derivace bez švu v místě, kde se u zalomí z 1 na 0
  float u2 = fract(u + 0.5);
  vec2 gx = vec2(abs(dFdx(u)) < abs(dFdx(u2)) ? dFdx(u) : dFdx(u2), dFdx(v));
  vec2 gy = vec2(abs(dFdy(u)) < abs(dFdy(u2)) ? dFdy(u) : dFdy(u2), dFdy(v));
  vec3 albedo = textureGrad(uAlbedo, vec2(u, v), gx, gy).rgb;
  vec3 col = albedo * shade.rgb * 1.55;
  outColor = vec4(col * shade.a, shade.a);
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

export function PlanetLive({ className = "", size = 500 }: { className?: string; size?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const moonEls = useRef<(HTMLImageElement | null)[]>([]);
  const [fallback, setFallback] = useState(false);
  const height = (size * H) / W;

  useEffect(() => {
    const cv = canvas.current;
    const box = wrap.current;
    if (!cv || !box) return;
    const gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      setFallback(true);
      return;
    }
    let raf = 0;
    let cleanup = () => {};
    let visible = true;
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(height * dpr);

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
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const scale = size / ORTHO; // pixelů na jednotku scény (CSS)

    const texture = (unit: number, img: HTMLImageElement, mip: boolean) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mip ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    const draw = (seconds: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u("uSpin"), (seconds / SPIN_SECONDS) * Math.PI * 2);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      MOONS.forEach((m, i) => {
        const el = moonEls.current[i];
        if (!el) return;
        const phi = (seconds / m.period) * Math.PI * 2 + m.phase;
        const [x, y, z] = m.orbit(phi);
        const px = size / 2 + x * scale;
        const py = height / 2 - z * scale;
        const sprite = m.r * 2 * 1.06 * scale;
        el.style.width = el.style.height = `${sprite}px`;
        el.style.transform = `translate3d(${px - sprite / 2}px, ${py - sprite / 2}px, 0)`;
        el.style.zIndex = y > 0 ? "2" : "6"; // za planetou / před planetou
      });
    };

    (async () => {
      try {
        const [albedo, shade] = await Promise.all([loadImage(`${DIR}/albedo.webp`), loadImage(`${DIR}/stin.webp`)]);
        if (disposed) return;
        texture(0, albedo, true);
        texture(1, shade, false);
        gl.uniform1i(u("uAlbedo"), 0);
        gl.uniform1i(u("uShade"), 1);
        gl.uniform2f(u("uRes"), cv.width, cv.height);
        gl.uniform1f(u("uR"), (cv.width / ORTHO) * 1);
        gl.uniform1f(u("uTilt"), TILT);
        const start = performance.now();
        const frame = (now: number) => {
          if (disposed) return;
          draw((now - start) / 1000);
          if (visible && !reduced) raf = requestAnimationFrame(frame);
          else raf = 0;
        };
        raf = requestAnimationFrame(frame);
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          if (visible && !raf && !reduced) raf = requestAnimationFrame(frame);
        });
        io.observe(box);
        cleanup = () => io.disconnect();
      } catch {
        setFallback(true);
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [size, height]);

  const layer = "absolute inset-0 h-full w-full select-none";
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`} style={{ width: size, height }}>
      <div ref={wrap} className="relative h-full w-full">
      {fallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/home/anim/planeta-realna-still.webp" alt="" draggable={false} className="h-full w-full object-contain" />
      ) : (
        <>
          {/* eslint-disable @next/next/no-img-element */}
          <img src={`${DIR}/prsten-zadni.webp`} alt="" draggable={false} loading="lazy" className={layer} style={{ zIndex: 1 }} />
          <canvas ref={canvas} className={layer} style={{ zIndex: 3, width: size, height }} />
          <img src={`${DIR}/halo.webp`} alt="" draggable={false} loading="lazy" className={layer} style={{ zIndex: 4, mixBlendMode: "screen" }} />
          <img src={`${DIR}/prsten-predni.webp`} alt="" draggable={false} loading="lazy" className={layer} style={{ zIndex: 5 }} />
          {MOONS.map((m, i) => (
            <img
              key={m.id}
              ref={(el) => {
                moonEls.current[i] = el;
              }}
              src={`${DIR}/${m.id}.webp`}
              alt=""
              draggable={false}
              className="absolute left-0 top-0 max-w-none"
              style={{ zIndex: 2, willChange: "transform" }}
            />
          ))}
          {/* eslint-enable @next/next/no-img-element */}
        </>
      )}
      </div>
    </div>
  );
}
