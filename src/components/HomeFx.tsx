"use client";

import { useEffect } from "react";

// Efekty úvodní stránky (jen myš, ne dotyk): záře za kurzorem, pixelové jiskry za kurzorem,
// magnetická hlavní tlačítka, 3D náklon karet a paralaxa karet v hero (.hs-card).
// Všechno dobíhá s pružným zpožděním (lerp), takže pohyb nikdy neskáče za kurzorem.
// Mění jen CSS proměnné a vlastnosti translate/transform, nic neposouvá rozložení.
// Respektuje systémové omezení pohybu i přepínač „Animace“ (data-motion="off"). Styly v globals.css a home-motion.css.

const TILT = ".space-page :is(.fx-tilt, .gcard-hover, .about-person, .about-note, .about-problem, .pro-tile, .rp-paper, .home-stat, .home-tpoint)";
const MAGNET = ".space-page .btn-cta, .space-page .fx-magnet";
const SPARK_COLORS = ["#ffc933", "#ff8fd0", "#8fd0ff", "#7ee0b0", "#b49cff"];
const MAX_TILT = 7; // stupně
const MAX_SPARKS = 18;

function motionOff(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

// Hodnota, která se plynule blíží cíli. k = podíl vzdálenosti za snímek při 60 fps.
type Spring = { v: number; to: number };
const spring = (v = 0): Spring => ({ v, to: v });
function step(s: Spring, k: number, dt: number) {
  const f = 1 - Math.pow(1 - k, dt / 16.67);
  s.v += (s.to - s.v) * f;
  return Math.abs(s.to - s.v) > 0.01;
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
    let last = 0;
    let mx = 0;
    let my = 0;
    let target: Element | null = null;
    let lastSparkX = 0;
    let lastSparkY = 0;
    let sparks = 0;
    let active = false;

    const gx = spring();
    const gy = spring();
    const px = spring();
    const py = spring();

    type Tilt = { el: HTMLElement; rx: Spring; ry: Spring; on: boolean };
    const tilts = new Map<HTMLElement, Tilt>();
    type Mag = { el: HTMLElement; x: Spring; y: Spring; on: boolean };
    const mags = new Map<HTMLElement, Mag>();

    function kick() {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function spark(x: number, y: number, dx: number, dy: number) {
      if (sparks >= MAX_SPARKS) return;
      sparks++;
      const s = document.createElement("span");
      s.className = "fx-spark";
      s.setAttribute("aria-hidden", "true");
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty("--c", SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]);
      // jiskra odletí proti směru pohybu a pak spadne
      const len = Math.hypot(dx, dy) || 1;
      s.style.setProperty("--dx", `${(-dx / len) * (10 + Math.random() * 14) + (Math.random() - 0.5) * 16}px`);
      s.style.setProperty("--fall", `${26 + Math.random() * 24}px`);
      s.style.setProperty("--s", `${Math.random() < 0.3 ? 8 : 4}px`);
      document.body.appendChild(s);
      const done = () => {
        if (!s.isConnected) return;
        s.remove();
        sparks--;
      };
      s.addEventListener("animationend", done, { once: true });
      window.setTimeout(done, 1100);
    }

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(48, now - last);
      last = now;
      if (motionOff()) {
        glow.style.opacity = "0";
        return;
      }
      let moving = false;

      // záře
      moving = step(gx, 0.22, dt) || moving;
      moving = step(gy, 0.22, dt) || moving;
      glow.style.translate = `${gx.v.toFixed(1)}px ${gy.v.toFixed(1)}px`;

      // 3D náklon: aktivní karta se natáčí ke kurzoru, opuštěné se pružně vrací
      const t = active ? (target?.closest<HTMLElement>(TILT) ?? null) : null;
      if (t && !tilts.has(t)) {
        tilts.set(t, { el: t, rx: spring(), ry: spring(), on: false });
        t.classList.add("fx-tilt-on"); // drží náklon i během pružného návratu
      }
      for (const it of tilts.values()) {
        const hot = it.el === t;
        if (hot) {
          const r = it.el.getBoundingClientRect();
          const u = (mx - r.left) / r.width;
          const v = (my - r.top) / r.height;
          it.ry.to = (u - 0.5) * 2 * MAX_TILT;
          it.rx.to = (0.5 - v) * 2 * MAX_TILT;
          it.el.style.setProperty("--gx", `${(u * 100).toFixed(1)}%`);
          it.el.style.setProperty("--gy", `${(v * 100).toFixed(1)}%`);
        } else {
          it.rx.to = 0;
          it.ry.to = 0;
        }
        if (hot !== it.on) {
          it.on = hot;
          it.el.classList.toggle("fx-tilt-hot", hot); // odlesk jen pod kurzorem
        }
        const a = step(it.rx, 0.16, dt);
        const b = step(it.ry, 0.16, dt);
        it.el.style.setProperty("--rx", `${it.rx.v.toFixed(2)}deg`);
        it.el.style.setProperty("--ry", `${it.ry.v.toFixed(2)}deg`);
        if (a || b) moving = true;
        else if (!hot) {
          it.el.style.removeProperty("--rx");
          it.el.style.removeProperty("--ry");
          it.el.classList.remove("fx-tilt-on", "fx-tilt-hot");
          tilts.delete(it.el);
        }
      }

      // magnetické tlačítko: natáhne se ke kurzoru, po odjetí pružně cvrnkne zpět
      const m = active ? (target?.closest<HTMLElement>(MAGNET) ?? null) : null;
      if (m && !mags.has(m)) mags.set(m, { el: m, x: spring(), y: spring(), on: false });
      for (const it of mags.values()) {
        const hot = it.el === m;
        if (hot) {
          const r = it.el.getBoundingClientRect();
          it.x.to = (mx - (r.left + r.width / 2)) * 0.22;
          it.y.to = (my - (r.top + r.height / 2)) * 0.32;
        } else {
          it.x.to = 0;
          it.y.to = 0;
        }
        const a = step(it.x, hot ? 0.2 : 0.12, dt);
        const b = step(it.y, hot ? 0.2 : 0.12, dt);
        it.el.style.translate = `${it.x.v.toFixed(1)}px ${it.y.v.toFixed(1)}px`;
        if (a || b) moving = true;
        else if (!hot) {
          it.el.style.removeProperty("translate");
          mags.delete(it.el);
        }
      }

      // paralaxa karet v hero
      if (hero && heroCards.length) {
        const hr = hero.getBoundingClientRect();
        if (hr.bottom > 0 && hr.top < window.innerHeight) {
          const a = step(px, 0.08, dt);
          const b = step(py, 0.08, dt);
          heroCards.forEach((c, i) => {
            const depth = 10 + (i % 3) * 9;
            c.style.translate = `${(-px.v * depth).toFixed(1)}px ${(-py.v * depth).toFixed(1)}px`;
          });
          if (a || b) moving = true;
        }
      }

      if (moving) raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;
      if (!active) {
        // první pohyb: záře se objeví rovnou pod kurzorem, ne odněkud z rohu
        gx.v = gx.to = e.clientX;
        gy.v = gy.to = e.clientY;
      }
      active = true;
      mx = e.clientX;
      my = e.clientY;
      target = e.target as Element | null;
      gx.to = mx;
      gy.to = my;
      px.to = mx / window.innerWidth - 0.5;
      py.to = my / window.innerHeight - 0.5;
      if (motionOff()) return;
      glow.style.opacity = "1";

      // jiskry podle uražené dráhy, ne podle času: když myš stojí, nic nepadá
      const dist = Math.hypot(mx - lastSparkX, my - lastSparkY);
      if (dist > 38 && !target?.closest("input, textarea, select, canvas, .hp-trans")) {
        lastSparkX = mx;
        lastSparkY = my;
        spark(mx, my, dx, dy);
      }
      kick();
    }
    function onLeave() {
      active = false;
      target = null;
      glow.style.opacity = "0";
      kick();
    }
    function onDown(e: PointerEvent) {
      if (e.pointerType !== "mouse" || motionOff()) return;
      if (!(e.target as Element | null)?.closest("a, button, summary")) return;
      // malý výbuch jisker při kliknutí na cokoli klikacího
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
        spark(e.clientX, e.clientY, Math.cos(a), Math.sin(a) * 0.6 + 0.4);
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      for (const it of tilts.values()) {
        it.el.style.removeProperty("--rx");
        it.el.style.removeProperty("--ry");
        it.el.classList.remove("fx-tilt-on", "fx-tilt-hot");
      }
      for (const it of mags.values()) it.el.style.removeProperty("translate");
      heroCards.forEach((c) => c.style.removeProperty("translate"));
      glow.remove();
      document.querySelectorAll(".fx-spark").forEach((s) => s.remove());
    };
  }, []);

  return null;
}
