// Cut scény městečka: jednoduchý režisér kamery (plynulé přejezdy mezi záběry s titulky) a efekty denních událostí na plátně.
// Souřadnice záběrů jsou v poměru k rámečku městečka (x 0..1, y 0..1 včetně oblohy), stejně jako polohy v TownHub.

export type Pt = [number, number];
export type Shot = { to: Pt; zoom: number; dur: number; hold?: number; caption?: string; at?: () => void };
export type Handle = { skip: () => void; stop: () => void };

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function applyCam(cam: HTMLElement, box: HTMLElement, p: Pt, zoom: number) {
  const W = box.clientWidth;
  const H = box.clientHeight;
  const tx = clamp(W / 2 - p[0] * W * zoom, W - W * zoom, 0);
  const ty = clamp(H / 2 - p[1] * H * zoom, H - H * zoom, 0);
  cam.style.transformOrigin = "0 0";
  cam.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
}

export function resetCam(cam: HTMLElement | null) {
  if (!cam) return;
  cam.style.transform = "";
  cam.style.transformOrigin = "";
}

/** Přehraje záběry po sobě; mezi záběry se kamera plynule přesouvá a přibližuje. `bars` (0..1) řídí černé pruhy. */
export function runShots(
  r: { box: HTMLElement; cam: HTMLElement },
  shots: Shot[],
  hooks: { onCaption: (text: string | null, index: number) => void; onBars: (k: number) => void; onEnd: () => void },
  from: { to: Pt; zoom: number } = { to: [0.5, 0.5], zoom: 1 },
): Handle {
  let raf = 0;
  let done = false;
  const t0 = performance.now();
  const spans: { start: number; move: number; hold: number }[] = [];
  let acc = 0;
  for (const s of shots) {
    spans.push({ start: acc, move: s.dur, hold: s.hold ?? 1.6 });
    acc += s.dur + (s.hold ?? 1.6);
  }
  const total = acc;
  let fired = -1;
  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    hooks.onCaption(null, -1);
    hooks.onBars(0);
    resetCam(r.cam);
    hooks.onEnd();
  };
  const frame = (now: number) => {
    if (done) return;
    const t = (now - t0) / 1000;
    if (t >= total) return finish();
    let i = spans.findIndex((s, k) => t < s.start + s.move + s.hold || k === spans.length - 1);
    if (i < 0) i = spans.length - 1;
    const sp = spans[i];
    const prev = i === 0 ? from : { to: shots[i - 1].to, zoom: shots[i - 1].zoom };
    const k = ease(clamp((t - sp.start) / Math.max(sp.move, 0.001), 0, 1));
    const p: Pt = [prev.to[0] + (shots[i].to[0] - prev.to[0]) * k, prev.to[1] + (shots[i].to[1] - prev.to[1]) * k];
    applyCam(r.cam, r.box, p, prev.zoom + (shots[i].zoom - prev.zoom) * k);
    if (fired < i) {
      fired = i;
      shots[i].at?.();
      hooks.onCaption(shots[i].caption ?? null, i);
    }
    hooks.onBars(clamp(Math.min(t / 0.6, (total - t) / 0.6), 0, 1));
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return {
    skip: finish,
    stop: () => {
      done = true;
      cancelAnimationFrame(raf);
      hooks.onCaption(null, -1);
      hooks.onBars(0);
      resetCam(r.cam);
    },
  };
}

// ---------------------------------------------------------------------------------------------- denní události
export type EventId = "festival" | "fireworks" | "rain" | "balloons" | "market";
export const EVENT_IDS: EventId[] = ["festival", "fireworks", "rain", "balloons", "market"];

/** Událost dne se počítá z data, takže ji všichni hráči vidí stejnou. */
export function eventForDay(day: string): EventId {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) h = Math.imul(h ^ day.charCodeAt(i), 16777619);
  return EVENT_IDS[((h >>> 0) % EVENT_IDS.length + EVENT_IDS.length) % EVENT_IDS.length];
}

/** Kam se kamera dívá, když událost uvádí cut scéna. */
export const EVENT_SHOT: Record<EventId, { to: Pt; zoom: number }> = {
  festival: { to: [0.5, 0.62], zoom: 1.9 },
  fireworks: { to: [0.55, 0.3], zoom: 1.5 },
  rain: { to: [0.5, 0.3], zoom: 1.5 },
  balloons: { to: [0.35, 0.5], zoom: 1.6 },
  market: { to: [0.7, 0.66], zoom: 2.0 },
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number };
const LANTERN = ["#ff6b4a", "#ffc933", "#ff8ad0", "#7ee0b0", "#8fd0ff"];

/** Efekty událostí na plátně přes celou scénu. `strength` 0..1 (v cut scéně 1, jinak jemné pozadí). */
export function createEventFx(canvas: HTMLCanvasElement, id: EventId) {
  const parts: Particle[] = [];
  let last = 0;
  let nextBurst = 0;
  const rnd = Math.random;
  const bursts: { x: number; y: number; t: number }[] = [];
  return {
    draw(now: number, strength: number) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      if (strength <= 0.01) return;
      ctx.globalAlpha = Math.min(1, strength);
      const u = h / 700;
      if (id === "festival") {
        // lampiony stoupají s mihotavým světlem
        if (parts.length < 26 * strength + 6 && rnd() < dt * 6 * strength) parts.push({ x: rnd() * w, y: h * (0.95 + rnd() * 0.1), vx: (rnd() - 0.5) * 12 * u, vy: -(18 + rnd() * 26) * u, life: 0, max: 14 + rnd() * 8, c: LANTERN[Math.floor(rnd() * LANTERN.length)], r: (7 + rnd() * 6) * u });
        for (const p of parts) {
          p.life += dt;
          p.x += (p.vx + Math.sin(t * 1.3 + p.max) * 8 * u) * dt;
          p.y += p.vy * dt;
          const a = Math.min(1, p.life / 1.5) * Math.min(1, (p.max - p.life) / 2);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
          g.addColorStop(0, "rgba(255,226,150,0.55)");
          g.addColorStop(1, "rgba(255,200,100,0)");
          ctx.globalAlpha = a * strength;
          ctx.fillStyle = g;
          ctx.fillRect(p.x - p.r * 3.2, p.y - p.r * 3.2, p.r * 6.4, p.r * 6.4);
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.roundRect(p.x - p.r * 0.7, p.y - p.r, p.r * 1.4, p.r * 1.8, p.r * 0.5);
          ctx.fill();
        }
      } else if (id === "fireworks") {
        // večerní příšeří a rakety s třpytivými kruhy
        ctx.globalAlpha = 0.34 * strength;
        ctx.fillStyle = "#050824";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
        if (t > nextBurst && strength > 0.2) {
          nextBurst = t + 0.5 + rnd() * 0.9;
          bursts.push({ x: w * (0.15 + rnd() * 0.7), y: h * (0.08 + rnd() * 0.3), t });
          const x = bursts[bursts.length - 1].x;
          const y = bursts[bursts.length - 1].y;
          const col = LANTERN[Math.floor(rnd() * LANTERN.length)];
          const n = 46;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const s = (70 + rnd() * 70) * u;
            parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 1.4 + rnd() * 0.6, c: col, r: 2.2 * u });
          }
        }
        ctx.globalCompositeOperation = "lighter";
        for (const p of parts) {
          p.life += dt;
          p.vy += 60 * u * dt;
          p.vx *= 0.985;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = Math.max(0, 1 - p.life / p.max) * strength;
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      } else if (id === "rain") {
        // krátký deštík a duha, která se po něm rozzáří
        const cyc = (t % 40) / 40;
        const rain = cyc < 0.3 ? 1 - cyc / 0.3 : 0;
        const bow = clamp((cyc - 0.2) / 0.15, 0, 1) * (1 - clamp((cyc - 0.85) / 0.15, 0, 1));
        ctx.lineWidth = 1.4 * u;
        ctx.strokeStyle = "rgba(190,215,255,0.8)";
        ctx.globalAlpha = rain * 0.7 * strength;
        for (let i = 0; i < 90 * rain * strength; i++) {
          const x = (rnd() * w * 1.2 + t * 80) % (w * 1.2);
          const y = rnd() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 5 * u, y + 16 * u);
          ctx.stroke();
        }
        const cols = ["#ff4d4d", "#ff9a3c", "#ffe14d", "#6fdc6f", "#4fb3ff", "#6a5cff", "#b45cff"];
        ctx.lineWidth = h * 0.012;
        cols.forEach((c, i) => {
          ctx.globalAlpha = bow * 0.42 * strength;
          ctx.strokeStyle = c;
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.62, w * 0.34 - i * h * 0.0125, Math.PI * 1.06, Math.PI * 1.94);
          ctx.stroke();
        });
      } else if (id === "balloons") {
        if (parts.length < 22 * strength + 4 && rnd() < dt * 3 * strength) parts.push({ x: rnd() * w, y: h * 1.05, vx: (rnd() - 0.5) * 10 * u, vy: -(20 + rnd() * 18) * u, life: 0, max: 30, c: LANTERN[Math.floor(rnd() * LANTERN.length)], r: (13 + rnd() * 9) * u });
        for (const p of parts) {
          p.life += dt;
          p.x += (p.vx + Math.sin(t * 1.1 + p.r) * 9 * u) * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = Math.min(1, p.life / 1.2) * strength;
          ctx.strokeStyle = "rgba(255,255,255,0.7)";
          ctx.lineWidth = u;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + p.r * 1.2);
          ctx.quadraticCurveTo(p.x + 6 * u * Math.sin(t * 2 + p.r), p.y + p.r * 2.4, p.x, p.y + p.r * 3.4);
          ctx.stroke();
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.r * 0.85, p.r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.beginPath();
          ctx.ellipse(p.x - p.r * 0.3, p.y - p.r * 0.35, p.r * 0.25, p.r * 0.4, -0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // trhy: praporky nad ulicí a rozsvícená vůně
        const y0 = h * 0.62;
        for (let row = 0; row < 2; row++) {
          const ya = y0 + row * h * 0.028;
          ctx.globalAlpha = strength;
          ctx.strokeStyle = "rgba(60,40,20,0.7)";
          ctx.lineWidth = 1.5 * u;
          ctx.beginPath();
          ctx.moveTo(w * 0.05, ya);
          ctx.quadraticCurveTo(w * 0.5, ya + h * 0.04, w * 0.95, ya);
          ctx.stroke();
          for (let i = 0; i < 26; i++) {
            const k = (i + 0.5) / 26;
            const x = w * (0.05 + 0.9 * k);
            const y = ya + h * 0.04 * 4 * k * (1 - k) + Math.sin(t * 2 + i + row) * 1.2 * u;
            ctx.fillStyle = LANTERN[(i + row) % LANTERN.length];
            ctx.beginPath();
            ctx.moveTo(x - 6 * u, y);
            ctx.lineTo(x + 6 * u, y);
            ctx.lineTo(x, y + 14 * u);
            ctx.closePath();
            ctx.fill();
          }
        }
        if (parts.length < 20 * strength && rnd() < dt * 5) parts.push({ x: w * (0.1 + rnd() * 0.8), y: h * (0.55 + rnd() * 0.2), vx: (rnd() - 0.5) * 6 * u, vy: -(10 + rnd() * 10) * u, life: 0, max: 3, c: "#fff3b0", r: 2.4 * u });
        for (const p of parts) {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = Math.max(0, 1 - p.life / p.max) * strength;
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // čistka mrtvých částic
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life > parts[i].max || parts[i].y < -40 * u || parts[i].y > h * 1.2) parts.splice(i, 1);
    },
    burst(x: number, y: number) {
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 80 + Math.random() * 150;
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90, life: 0, max: 1.8 + Math.random(), c: LANTERN[Math.floor(Math.random() * LANTERN.length)], r: 3 });
      }
    },
  };
}

/** Konfety pro oslavu (vyletí z bodu a padají). */
export function confettiBurst(canvas: HTMLCanvasElement, at: Pt, seconds = 3) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const w = canvas.width;
  const h = canvas.height;
  const pieces = Array.from({ length: 160 }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
    const s = 220 + Math.random() * 380;
    return { x: at[0] * w, y: at[1] * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, c: LANTERN[Math.floor(Math.random() * LANTERN.length)], s: 4 + Math.random() * 5 };
  });
  let raf = 0;
  const t0 = performance.now();
  let last = t0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const el = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      p.vy += 480 * dt;
      p.vx *= 0.992;
      p.x += p.vx * dt * (h / 700);
      p.y += p.vy * dt * (h / 700);
      p.rot += p.vr * dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, el - seconds + 1));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    if (el < seconds) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, w, h);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, w, h);
  };
}


// ---------------------------------------------------------------------------------------------- denní doba a počasí
export type DayPhase = "dawn" | "day" | "dusk" | "night";

/** Fáze dne podle místní hodiny (0..24, může být desetinná). */
export function dayPhaseOf(hour: number): DayPhase {
  if (hour >= 21 || hour < 5) return "night";
  if (hour < 8) return "dawn";
  if (hour >= 18) return "dusk";
  return "day";
}

/** Barevný závoj přes městečko pro soumrak a svítání (ve dne a v noci žádný). */
export const PHASE_TINT: Record<DayPhase, string | null> = {
  dawn: "linear-gradient(180deg, rgba(255,170,120,0.28), rgba(255,220,170,0.10) 60%, rgba(255,255,255,0))",
  day: null,
  dusk: "linear-gradient(180deg, rgba(255,110,70,0.32), rgba(190,80,140,0.18) 60%, rgba(60,40,110,0.10))",
  night: null,
};

export type WeatherId = "clear" | "cloudy" | "rain" | "fog" | "snow";

/** Počasí dne se počítá z data (a měsíce), takže ho všichni hráči vidí stejné. Sníh jen v zimě. */
export function weatherForDay(day: string): WeatherId {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) h = Math.imul(h ^ day.charCodeAt(i), 16777619);
  const r = ((h >>> 0) % 1000) / 1000;
  const month = Number(day.slice(5, 7));
  const winter = month === 12 || month <= 2;
  if (winter && r < 0.4) return "snow";
  if (r < 0.52) return "clear";
  if (r < 0.72) return "cloudy";
  if (r < 0.88) return "rain";
  return "fog";
}

/** Plátno s počasím: déšť s kapkami a vlnkami, sněžení, mlha ve vrstvách. `strength` 0..1. */
export function createWeatherFx(canvas: HTMLCanvasElement, id: WeatherId) {
  const hash = (n: number) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const flakes = Array.from({ length: 150 }, (_, i) => ({ x: hash(i + 1), y: hash(i * 3 + 7), s: 0.4 + hash(i * 5 + 2) * 0.7, w: hash(i * 11 + 3) }));
  let last = 0;
  return {
    draw(now: number, strength: number) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      if (id === "clear" || strength <= 0.01) return;
      const u = h / 700;
      if (id === "cloudy") {
        ctx.fillStyle = `rgba(90,105,135,${0.16 * strength})`;
        ctx.fillRect(0, 0, w, h);
        return;
      }
      if (id === "fog") {
        for (let k = 0; k < 4; k++) {
          const y = h * (0.35 + k * 0.17) + Math.sin(t * 0.2 + k * 2) * 12 * u;
          const g = ctx.createLinearGradient(0, y - 90 * u, 0, y + 90 * u);
          g.addColorStop(0, "rgba(235,242,250,0)");
          g.addColorStop(0.5, `rgba(235,242,250,${0.34 * strength})`);
          g.addColorStop(1, "rgba(235,242,250,0)");
          ctx.fillStyle = g;
          ctx.fillRect(((t * 8 * (k + 1)) % 60) - 60, y - 90 * u, w + 120, 180 * u);
        }
        return;
      }
      if (id === "snow") {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (const f of flakes) {
          f.y += (0.05 + 0.05 * f.s) * dt * 1.4;
          if (f.y > 1.02) f.y = -0.02;
          const x = (f.x + Math.sin(t * 0.7 + f.w * 9) * 0.01) * w;
          ctx.globalAlpha = Math.min(1, strength) * (0.55 + 0.4 * f.s * 0.6);
          ctx.beginPath();
          ctx.arc(x, f.y * h, (1.2 + f.s * 1.8) * u, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        return;
      }
      // rain
      ctx.fillStyle = `rgba(40,60,100,${0.12 * strength})`;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(210,230,255,${0.55 * strength})`;
      ctx.lineWidth = Math.max(1, 1.2 * u);
      ctx.beginPath();
      for (const f of flakes) {
        f.y += (0.9 + 0.5 * f.s) * dt;
        if (f.y > 1.02) f.y -= 1.05;
        const x = f.x * w + f.y * 30 * u;
        const y = f.y * h;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5 * u, y - 16 * u * (0.6 + f.s * 0.5));
      }
      ctx.stroke();
    },
  };
}
