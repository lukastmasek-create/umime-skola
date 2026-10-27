"use client";

import { useEffect, useRef, useState } from "react";
import { AnimArt } from "@/components/SpaceDecor";

// Liána, která zaroste roh, jakmile se objeví na obrazovce (pás snímků z Blenderu, viz globals.css).
export function Liana({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setGrown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGrown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none ${className}`} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <div className="liana" data-grown={grown} />
    </div>
  );
}

// Padající sníh: pevné hodnoty podle pořadí, ať se server a prohlížeč shodnou.
const FLAKES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  dur: 8 + ((i * 7) % 6),
  delay: -((i * 1.7) % 10),
  drift: i % 2 ? 40 : -30,
  size: 2 + (i % 3),
}));

// Hory z Blenderu ve třech vrstvách s paralaxou (kurzor a posun stránky), sníh, polární záře,
// zapadající slunce a vlajka na nejvyšším vrcholu.
export function MountainScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = ref.current;
    if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const zone = scene.closest(".zone") as HTMLElement | null;
    let frame = 0;
    let mx = 0;

    const apply = () => {
      frame = 0;
      const rect = (zone ?? scene).getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      scene.style.setProperty("--mx", mx.toFixed(3));
      scene.style.setProperty("--sp", progress.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      schedule();
    };
    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="aurora" />
      <div aria-hidden className="sun-glow" />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {FLAKES.map((f, i) => (
          <i
            key={i}
            className="snowflake"
            style={{
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              ["--dur" as string]: `${f.dur}s`,
              ["--delay" as string]: `${f.delay}s`,
              ["--drift" as string]: `${f.drift}px`,
            }}
          />
        ))}
      </div>
      <div ref={ref} aria-hidden className="peak-scene pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 select-none sm:h-72">
        <div className="peak-layer peak-layer-back" />
        <div className="peak-layer peak-layer-flag">
          <AnimArt
            name="vlajka"
            size={84}
            className="absolute hidden sm:block"
            style={{ left: "69.5%", top: "13.5%", transform: "translate(-44%, -80%)" }}
          />
        </div>
        <div className="peak-layer peak-layer-volcano">
          <div className="volcano-glow" />
          <AnimArt name="sopka" size={400} height={450} className="volcano hidden sm:block" />
        </div>
        <div className="peak-layer peak-layer-mid" />
        <div className="peak-layer peak-layer-front" />
      </div>
    </>
  );
}
