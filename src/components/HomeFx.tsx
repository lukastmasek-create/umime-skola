"use client";

import { useEffect } from "react";

// Efekty úvodní stránky (jen myš, ne dotyk): záře za kurzorem, pixelové jiskry za kurzorem,
// magnetická hlavní tlačítka, 3D náklon karet (.fx-tilt) a paralaxa karet v hero (.hs-card).
// Mění jen CSS proměnné a vlastnosti translate/rotate, nic neposouvá rozložení.
// Respektuje systémové omezení pohybu i přepínač „Animace“ (data-motion="off"). Styly v globals.css.

const TILT = ".space-page :is(.fx-tilt, .lobby-card, .gcard-hover, .about-person, .about-note, .about-problem, .pro-tile, .rp-paper)";
const MAGNET = ".space-page .btn-cta, .space-page .fx-magnet";
const SPARK_COLORS = ["#ffc933", "#ff8fd0", "#8fd0ff", "#7ee0b0", "#b49cff"];

function motionOff(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

export function HomeFx() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const page = document.querySelector<HTMLElement>(".space-page");
    if (!page) return;

    const glow = document.createElement("div");
    glow.className = "fx-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    const hero = page.querySelector<HTMLElement>(".gradient-hero");
    const heroCards = hero ? Array.from(hero.querySelectorAll<HTMLElement>(".hs-card")) : [];

    let raf = 0;
    let ev: PointerEvent | null = null;
    let lastSpark = 0;
    let sparks = 0;
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    function release(el: HTMLElement | null, props: string[]) {
      if (!el) return;
      for (const p of props) el.style.removeProperty(p);
    }

    function frame() {
      raf = 0;
      const e = ev;
      if (!e) return;
      if (motionOff()) {
        glow.style.opacity = "0";
        return;
      }
      const x = e.clientX;
      const y = e.clientY;
      glow.style.opacity = "1";
      glow.style.translate = `${x}px ${y}px`;
      const target = e.target as Element | null;

      // 3D náklon karty pod kurzorem.
      const t = target?.closest<HTMLElement>(TILT) ?? null;
      if (t !== tilted) {
        release(tilted, ["--rx", "--ry", "--gx", "--gy"]);
        tilted?.classList.remove("fx-tilt-on");
        tilted = t;
        tilted?.classList.add("fx-tilt-on");
      }
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (x - r.left) / r.width;
        const py = (y - r.top) / r.height;
        t.style.setProperty("--ry", `${((px - 0.5) * 10).toFixed(2)}deg`);
        t.style.setProperty("--rx", `${((0.5 - py) * 10).toFixed(2)}deg`);
        t.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        t.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      }

      // Magnetické tlačítko: lehce se natáhne ke kurzoru.
      const m = target?.closest<HTMLElement>(MAGNET) ?? null;
      if (m !== magnet) {
        release(magnet, ["translate"]);
        magnet = m;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        m.style.translate = `${(dx * 0.18).toFixed(1)}px ${(dy * 0.28).toFixed(1)}px`;
      }

      // Paralaxa karet v hero podle polohy kurzoru (jen když je hero vidět).
      if (hero && heroCards.length) {
        const hr = hero.getBoundingClientRect();
        if (hr.bottom > 0 && hr.top < window.innerHeight) {
          const nx = x / window.innerWidth - 0.5;
          const ny = y / window.innerHeight - 0.5;
          heroCards.forEach((c, i) => {
            const depth = 10 + (i % 3) * 8;
            c.style.translate = `${(-nx * depth).toFixed(1)}px ${(-ny * depth).toFixed(1)}px`;
          });
        }
      }

      // Pixelové jiskry za kurzorem (max. ~25 najednou).
      const now = performance.now();
      if (now - lastSpark > 45 && sparks < 25 && !target?.closest("input, textarea, select, canvas")) {
        lastSpark = now;
        sparks++;
        const s = document.createElement("span");
        s.className = "fx-spark";
        s.setAttribute("aria-hidden", "true");
        s.style.left = `${x}px`;
        s.style.top = `${y}px`;
        s.style.setProperty("--c", SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]);
        s.style.setProperty("--dx", `${(Math.random() - 0.5) * 40}px`);
        s.style.setProperty("--dy", `${12 + Math.random() * 26}px`);
        document.body.appendChild(s);
        const done = () => {
          if (!s.isConnected) return;
          s.remove();
          sparks--;
        };
        s.addEventListener("animationend", done, { once: true });
        window.setTimeout(done, 1000);
      }
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      ev = e;
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function onLeave() {
      glow.style.opacity = "0";
      release(tilted, ["--rx", "--ry", "--gx", "--gy"]);
      tilted?.classList.remove("fx-tilt-on");
      tilted = null;
      release(magnet, ["translate"]);
      magnet = null;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
      heroCards.forEach((c) => c.style.removeProperty("translate"));
      glow.remove();
      document.querySelectorAll(".fx-spark").forEach((s) => s.remove());
    };
  }, []);

  return null;
}
