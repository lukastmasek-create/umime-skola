"use client";

import { useEffect, useRef, useState } from "react";
import trail from "./hory-stezka.json";

// „Jak to funguje“ jako výstup na horu. Hora s klikatou stezkou a třemi tábory je z Blenderu
// (umime-art/blender/hory_stezka.py); turista s batohem jde po stezce podle rolování stránky,
// za sebou nechává zlatou stopu, v táborech se zapálí oheň a odemkne se krok. Na vrcholu vlaje
// vlajka a sype se konfeta. Bez animací (nebo omezení pohybu) stojí turista na vrcholu.

export type TrekStep = { title: string; text: string };

const DIR = "/home/hory";
const CAMP_AT = [0.2, 0.56, 0.92]; // pozice táborů na stezce (0..1), stejně jako v Blenderu
const HIKER_FRAMES = 12;
const STEP_PX = 26; // kolik pixelů stezky odpovídá jednomu snímku chůze

type P = [number, number];

export function MountainTrek({ steps }: { steps: TrekStep[] }) {
  const scene = useRef<HTMLDivElement>(null);
  const hiker = useRef<HTMLDivElement>(null);
  const walked = useRef<HTMLCanvasElement>(null);
  const [reached, setReached] = useState(0); // kolik táborů je odemčeno
  const reachedRef = useRef(0);

  useEffect(() => {
    const box = scene.current;
    const hk = hiker.current;
    const cv = walked.current;
    if (!box || !hk || !cv) return;
    const ctx = cv.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = trail.trail as P[];
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum[cum.length - 1];
    const at = (u: number): P => {
      const d = Math.max(0, Math.min(1, u)) * total;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < d) i++;
      const k = (d - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
    };
    let W = 0, H = 0, dpr = 1;
    let target = reduced ? 1 : 0;
    let cur = target;
    let raf = 0;
    let lastX = 0;
    let facing = 1;
    let frameAcc = 0;
    let lastU = cur;
    let disposed = false;

    const resize = () => {
      const r = box.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };

    const paint = (u: number, moving: boolean) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // zlatá stopa po ušlé části stezky
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const upto = u * total;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (cum[i] > upto) {
          const p = at(u);
          ctx.lineTo(p[0] * W, p[1] * H);
          break;
        }
        if (i === 0) ctx.moveTo(pts[i][0] * W, pts[i][1] * H);
        else ctx.lineTo(pts[i][0] * W, pts[i][1] * H);
      }
      ctx.strokeStyle = "rgba(255,210,77,0.35)";
      ctx.lineWidth = 11 * (W / 640);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,244,190,0.95)";
      ctx.lineWidth = 3.2 * (W / 640);
      ctx.setLineDash([2 * (W / 640), 7 * (W / 640)]);
      ctx.stroke();
      ctx.setLineDash([]);
      // turista
      const [x, y] = at(u);
      const px = x * W, py = y * H;
      if (Math.abs(px - lastX) > 0.4) facing = px > lastX ? 1 : -1;
      lastX = px;
      if (moving) frameAcc += Math.hypot(px - lastPx, py - lastPy);
      lastPx = px;
      lastPy = py;
      const hw = W * 0.15;
      const frame = moving ? Math.floor(frameAcc / (STEP_PX * (W / 640))) % HIKER_FRAMES : 0;
      hk.style.width = hk.style.height = `${hw}px`;
      hk.style.transform = `translate3d(${px - hw / 2}px, ${py - hw * 0.905}px, 0) scaleX(${facing})`;
      hk.style.backgroundPosition = `${(frame / (HIKER_FRAMES - 1)) * 100}% 0`;
      const n = CAMP_AT.filter((c) => u >= c - 0.015).length;
      if (n !== reachedRef.current) {
        reachedRef.current = n;
        setReached(n);
      }
    };
    let lastPx = 0, lastPy = 0;

    const progress = () => {
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.55 - r.height;
      return Math.max(0, Math.min(1, (start - r.top) / (start - end)));
    };
    const frame = () => {
      raf = 0;
      if (disposed) return;
      target = reduced ? 1 : progress();
      cur += (target - cur) * 0.085;
      if (Math.abs(target - cur) < 0.0006) cur = target;
      const moving = Math.abs(cur - lastU) > 0.00035;
      lastU = cur;
      paint(cur, moving);
      if (cur !== target) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(frame);
    };
    resize();
    lastPx = at(cur)[0] * W;
    lastPy = at(cur)[1] * H;
    lastX = lastPx;
    paint(cur, false);
    kick();
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(box);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  const camps = trail.camps as P[];
  const summit = trail.summit as P;
  const summitReached = reached >= 3;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <ol className="order-2 flex flex-col gap-4 lg:order-1 lg:gap-8">
        {steps.map((s, i) => {
          const on = reached > i;
          return (
            <li
              key={s.title}
              className="relative flex gap-4 rounded-2xl border-2 p-4 transition-all duration-500 sm:p-5"
              style={{
                borderColor: on ? "#ffd24d" : "rgba(255,255,255,0.18)",
                background: on ? "rgba(255,210,77,0.12)" : "rgba(10,8,32,0.28)",
                boxShadow: on ? "0 0 30px rgba(255,210,77,0.25)" : undefined,
                transform: on ? "translateX(0)" : "translateX(-6px)",
                opacity: on ? 1 : 0.62,
              }}
            >
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-xl font-extrabold"
                style={{ borderColor: on ? "#16132b" : "rgba(255,255,255,0.35)", background: on ? "#ffd24d" : "transparent", color: on ? "#16132b" : "#fff", fontFamily: "var(--font-heading)" }}
              >
                {on ? "✓" : i + 1}
              </span>
              <div>
                <h3 className="font-bold">
                  <span className="sr-only">{i + 1}. </span>
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-white/80">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div ref={scene} className="relative order-1 mx-auto w-full max-w-[640px] lg:order-2" style={{ aspectRatio: `${trail.w} / ${trail.h}` }}>
        {/* eslint-disable @next/next/no-img-element */}
        <img src={`${DIR}/hora.webp`} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full select-none" />
        <canvas ref={walked} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        {camps.map((c, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: `${c[0] * 100}%`, top: `${c[1] * 100}%`, width: "7%", aspectRatio: "1 / 1", transform: "translate(-170%, -86%)", opacity: reached > i ? 1 : 0, transition: "opacity 0.6s" }}
          >
            <span className="globe-sprite block h-full w-full" style={{ backgroundImage: `url(${DIR}/ohen.webp)`, animationDuration: `${0.9 + i * 0.13}s` }} />
          </div>
        ))}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: `${summit[0] * 100}%`, top: `${summit[1] * 100}%`, width: "14%", aspectRatio: "1 / 1", transform: "translate(-28%, -100%)" }}
        >
          <span className="globe-sprite block h-full w-full" style={{ backgroundImage: `url(${DIR}/vlajka.webp)`, animationDuration: "1.1s" }} />
        </div>
        <div ref={hiker} aria-hidden className="pointer-events-none absolute left-0 top-0 will-change-transform" style={{ backgroundImage: `url(${DIR}/turista.webp)`, backgroundSize: "1200% 100%", backgroundRepeat: "no-repeat", filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.35))" }} />
        {/* eslint-enable @next/next/no-img-element */}
        {summitReached && <Confetti />}
      </div>
    </div>
  );
}

// Konfeta nad vrcholem: čisté CSS, spustí se jednou po dosažení vrcholu.
function Confetti() {
  const colors = ["#ff5a3c", "#ffd24d", "#3b9bff", "#7ee0b0", "#ff9ec7", "#c9b8ff"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-[30%] top-[2%] h-[30%]">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="trek-confetti absolute block h-2 w-1.5 rounded-[1px]"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 7) * 0.09}s`, ["--dx" as string]: `${((i * 53) % 90) - 45}px`, ["--rot" as string]: `${(i * 97) % 360}deg` }}
        />
      ))}
    </div>
  );
}
