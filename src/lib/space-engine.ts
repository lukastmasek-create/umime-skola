import { drawFloatTexts, sfx, stepFloatTexts, type FloatText } from "./game-fx";
import type { Item3D, Scene3D, View3D } from "./scene3d";

export type EngineCallbacks = {
  onHit: (index: number, correct: boolean) => void;
  onMiss: () => void;
  // Hráče zasáhla nepřátelská střela (neukončuje otázku, jen ubírá život).
  onDamage?: () => void;
};

export type EngineConfig = {
  fireCooldown: number;
  alienSpeedFactor: number;
  // Pořadí otázky v kole od 0; s ním roste rychlost a od 3. otázky začnou vetřelci střílet.
  round?: number;
  // Poslední otázka kola: rychlejší vetřelci, červená aura a častější střelba.
  boss?: boolean;
};

type Alien = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  correct: boolean;
  alive: boolean;
  color: string;
  charge: number;
};
type Bullet = { x: number; y: number };
type Bolt = { x: number; y: number; vy: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Ring = { x: number; y: number; r: number; life: number; color: string };
type PickupKind = "shield" | "rapid" | "slow";
type Pickup = { x: number; y: number; kind: PickupKind; t: number };

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 420;

const ALIEN_STYLES = [
  { body: "#7c6cff", dark: "#4b3fd1" },
  { body: "#ff5d73", dark: "#c23049" },
  { body: "#ffb020", dark: "#c77a00" },
  { body: "#22c55e", dark: "#128a3e" },
];
const LANDING_Y = GAME_HEIGHT - 70;
const SHIP_Y = GAME_HEIGHT - 36;
const PICKUP_ICONS: Record<PickupKind, string> = { shield: "🛡️", rapid: "⚡", slow: "🐌" };
const PICKUP_COLORS: Record<PickupKind, string> = { shield: "#5ab8ff", rapid: "#ffd24d", slow: "#7ee0b0" };

export class SpaceEngine {
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private raf = 0;
  private last = 0;
  private running = false;
  private shipX = GAME_WIDTH / 2;
  private shipVx = 0;
  private input = { left: false, right: false, fire: false };
  private pointerTarget: number | null = null;
  private pointerFire = false;
  private cooldown = 0;
  private aliens: Alien[] = [];
  private bullets: Bullet[] = [];
  private bolts: Bolt[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private texts: FloatText[] = [];
  private layers = [
    { speed: 6, size: 1, alpha: 0.35, stars: this.makeStars(40) },
    { speed: 14, size: 1.5, alpha: 0.55, stars: this.makeStars(26) },
    { speed: 30, size: 2, alpha: 0.8, stars: this.makeStars(12) },
  ];
  private swayT = 0;
  private time = 0;
  private spawn = 1;
  private descent = 0;
  private config: EngineConfig = { fireCooldown: 0.35, alienSpeedFactor: 1 };
  private shake = 0;
  private flash = { color: "#ffffff", a: 0 };
  private muzzle = 0;
  private invuln = 0;
  private shield = false;
  private rapid = 0;
  private slow = 0;
  private boltTimer = 3;
  private pickupTimer = 6;
  private banner = 0;
  private view3d: View3D | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private cb: EngineCallbacks,
  ) {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = GAME_WIDTH * this.dpr;
    canvas.height = GAME_HEIGHT * this.dpr;
    this.ctx = canvas.getContext("2d")!;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    this.raf = requestAnimationFrame(this.tick);
  }

  private makeStars(n: number) {
    return Array.from({ length: n }, () => ({ x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT }));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
  }

  setView3D(view: View3D | null) {
    this.view3d = view;
  }

  getScene3D(): Scene3D | null {
    const items: Item3D[] = [];
    items.push({ key: "line", model: "box", x: GAME_WIDTH / 2, y: LANDING_Y, w: GAME_WIDTH, h: 1.5, d: 2, color: "#ff5d73", opacity: 0.5 });
    const types = ["kyklop", "krab", "chobotnice", "ufo"];
    this.aliens.forEach((a, i) => {
      if (!a.alive) return;
      const p = this.alienPos(a, i);
      items.push({
        key: "al" + i,
        model: "space/mimozemstan_" + types[i % types.length],
        x: p.x + a.w / 2,
        y: p.y + a.h / 2,
        z: 4,
        w: Math.min(a.w, a.h * 1.4) * 0.95,
        bob: 2,
        rot: Math.sin(this.time * 1.5 + i) * 0.25,
        label: a.label,
        labelColor: a.color,
        labelW: Math.max(110, a.w),
      });
    });
    if (!(this.invuln > 0 && Math.floor(this.time * 14) % 2 === 0)) {
      items.push({ key: "ship", model: "space/lod", x: this.shipX, y: SHIP_Y, z: 2, w: 46, rot: Math.PI + Math.max(-0.3, Math.min(0.3, this.shipVx / 1400)) });
      if (this.shield) items.push({ key: "shield", model: "sphere", x: this.shipX, y: SHIP_Y, z: 14, w: 62, h: 30, d: 62, color: "#5ab8ff", opacity: 0.28 });
    }
    this.bullets.forEach((b, i) => items.push({ key: "bu" + i, model: "box", x: b.x, y: b.y, z: 6, w: 4, h: 4, d: 20, color: "#fff7b0" }));
    this.bolts.forEach((b, i) => items.push({ key: "bo" + i, model: "sphere", x: b.x, y: b.y, z: 6, w: 9, h: 9, d: 16, color: "#ff5d73" }));
    const pk: Record<PickupKind, string> = { shield: "bonus_stit", rapid: "bonus_rychla_strelba", slow: "bonus_zpomaleni" };
    this.pickups.forEach((p, i) => items.push({ key: "pk" + i, model: "space/" + pk[p.kind], x: p.x, y: p.y, z: 4, w: 30, bob: 3, spin: 2 }));
    return {
      layout: "floor",
      items,
      ground: this.config.boss ? "#2a0b1a" : "#0b0a2a",
      sky: this.config.boss ? "linear-gradient(180deg, #3a0f24, #12061a)" : "linear-gradient(180deg, #0b0a2a, #1a1448)",
    };
  }

  setRunning(running: boolean) {
    this.running = running;
    if (!running) {
      this.input = { left: false, right: false, fire: false };
      this.pointerTarget = null;
      this.pointerFire = false;
    }
  }

  setInput(partial: Partial<typeof this.input>) {
    this.input = { ...this.input, ...partial };
  }

  popText(text: string, color = "#ffe066", x = this.shipX, y = SHIP_Y - 40) {
    this.texts.push({ x, y, text, color, life: 1.1 });
  }

  loadQuestion(options: string[], correctIndex: number, config: EngineConfig) {
    this.config = config;
    this.bullets = [];
    this.bolts = [];
    this.pickups = [];
    this.cooldown = 0;
    this.descent = 0;
    this.swayT = 0;
    this.spawn = 0;
    this.invuln = 0;
    this.boltTimer = config.boss ? 2 : 3.2;
    this.pickupTimer = 5 + Math.random() * 4;
    this.banner = config.boss ? 1.8 : 0;
    if (config.boss && options.length > 0) sfx("boss");
    const count = options.length;
    const slot = (GAME_WIDTH - 40) / Math.max(1, count);
    const w = slot - 14;
    this.aliens = options.map((label, i) => ({
      x: 20 + i * slot + (slot - w) / 2,
      y: 24,
      w,
      h: 76,
      label,
      correct: i === correctIndex,
      alive: true,
      color: ALIEN_STYLES[i % ALIEN_STYLES.length].body,
      charge: 0,
    }));
  }

  private screenX(clientX: number) {
    const rect = this.canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * GAME_WIDTH;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.running) return;
    this.canvas.setPointerCapture?.(e.pointerId);
    this.pointerTarget = this.screenX(e.clientX);
    this.pointerFire = true;
    e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.pointerFire) this.pointerTarget = this.screenX(e.clientX);
  };

  private onPointerUp = () => {
    this.pointerTarget = null;
    this.pointerFire = false;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.running) return;
    if (e.code === "ArrowLeft" || e.code === "KeyA") this.input.left = true;
    else if (e.code === "ArrowRight" || e.code === "KeyD") this.input.right = true;
    else if (e.code === "Space") this.input.fire = true;
    else return;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") this.input.left = false;
    else if (e.code === "ArrowRight" || e.code === "KeyD") this.input.right = false;
    else if (e.code === "Space") this.input.fire = false;
  };

  private tick = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  private burst(x: number, y: number, color: string, count = 18) {
    this.rings.push({ x, y, r: 8, life: 1, color });
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 160;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6 + Math.random() * 0.5, color });
    }
  }

  // Pohyb vetřelce v rámci vlny. Vzorec se mění podle pořadí otázky, ať se kolo neopakuje.
  private offset(i: number): { dx: number; dy: number } {
    const round = this.config.round ?? 0;
    const pattern = (round + (this.config.boss ? 1 : 0)) % 4;
    const t = this.swayT;
    const k = this.config.boss ? 1.3 : 1;
    switch (pattern) {
      case 1:
        return { dx: Math.sin(t * 1.3 + i * 1.7) * 20 * k, dy: 0 };
      case 2:
        return { dx: Math.sin(t + i * 0.9) * 16 * k, dy: Math.sin(t * 1.7 + i) * 14 };
      case 3:
        return { dx: (i % 2 ? 1 : -1) * Math.sin(t * 0.9) * 22 * k, dy: Math.sin(t * 2.2 + i * 2) * 6 };
      default:
        return { dx: Math.sin(t) * 12 * k, dy: 0 };
    }
  }

  private alienPos(a: Alien, i: number) {
    const o = this.offset(i);
    return { x: a.x + o.dx, y: a.y + o.dy };
  }

  private damage() {
    if (this.invuln > 0) return;
    if (this.shield) {
      this.shield = false;
      this.invuln = 0.8;
      this.popText("🛡️", "#5ab8ff");
      this.burst(this.shipX, SHIP_Y, "#5ab8ff", 14);
      sfx("pickup");
      return;
    }
    this.invuln = 1.5;
    this.shake = 14;
    this.flash = { color: "#ff3355", a: 0.35 };
    this.burst(this.shipX, SHIP_Y, "#ff5d73", 22);
    sfx("damage");
    this.cb.onDamage?.();
  }

  private update(dt: number) {
    this.time += dt;
    this.spawn += dt;
    this.shake = Math.max(0, this.shake - dt * 40);
    this.flash.a = Math.max(0, this.flash.a - dt * 1.6);
    this.muzzle = Math.max(0, this.muzzle - dt * 12);
    this.banner = Math.max(0, this.banner - dt);
    this.texts = stepFloatTexts(this.texts, dt);
    this.rings = this.rings.filter((r) => {
      r.life -= dt * 1.8;
      r.r += 170 * dt;
      return r.life > 0;
    });
    for (const layer of this.layers) {
      for (const s of layer.stars) {
        s.y += layer.speed * dt;
        if (s.y > GAME_HEIGHT) {
          s.y = 0;
          s.x = Math.random() * GAME_WIDTH;
        }
      }
    }
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });

    if (!this.running) return;

    // --- loď: plynulé zrychlení a brzdění, ovládání klávesnicí i tažením prstu ---
    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    let targetVx = dir * 400;
    if (this.pointerTarget !== null) {
      const dx = this.pointerTarget - this.shipX;
      targetVx = Math.abs(dx) < 4 ? 0 : Math.max(-620, Math.min(620, dx * 9));
    }
    this.shipVx += (targetVx - this.shipVx) * Math.min(1, 14 * dt);
    this.shipX = Math.max(24, Math.min(GAME_WIDTH - 24, this.shipX + this.shipVx * dt));

    this.invuln = Math.max(0, this.invuln - dt);
    this.rapid = Math.max(0, this.rapid - dt);
    this.slow = Math.max(0, this.slow - dt);

    this.cooldown -= dt;
    if ((this.input.fire || this.pointerFire) && this.cooldown <= 0) {
      this.bullets.push({ x: this.shipX, y: SHIP_Y - 18 });
      this.cooldown = this.config.fireCooldown * (this.rapid > 0 ? 0.45 : 1);
      this.muzzle = 1;
      sfx("shoot");
    }

    // --- vetřelci ---
    const round = this.config.round ?? 0;
    const speed = 14 + Math.min(round, 6) * 1.6;
    const slowFactor = this.slow > 0 ? 0.5 : 1;
    this.swayT += dt * (this.config.boss ? 1.5 : 1.1) * slowFactor;
    this.descent += speed * (this.config.boss ? 1.25 : 1) * this.config.alienSpeedFactor * slowFactor * dt;

    for (let i = 0; i < this.aliens.length; i++) {
      const a = this.aliens[i];
      if (!a.alive) continue;
      a.y = 24 + this.descent;
      if (a.y + a.h >= LANDING_Y) {
        a.alive = false;
        if (a.correct) {
          this.running = false;
          this.shake = 16;
          this.flash = { color: "#ff3355", a: 0.4 };
          this.burst(a.x + a.w / 2, a.y + a.h / 2, "#ff5d73");
          sfx("miss");
          this.cb.onMiss();
          return;
        }
      }
      if (a.charge > 0) {
        a.charge -= dt;
        if (a.charge <= 0) {
          const p = this.alienPos(a, i);
          this.bolts.push({ x: p.x + a.w / 2, y: p.y + a.h - 6, vy: 150 + round * 12 + (this.config.boss ? 40 : 0) });
        }
      }
    }

    // nepřátelské střely od 4. otázky (kolo začíná klidně, pak se přitvrdí)
    if (round >= 3 || this.config.boss) {
      this.boltTimer -= dt;
      if (this.boltTimer <= 0 && this.spawn > 1.2) {
        const wrong = this.aliens.filter((a) => a.alive && !a.correct && a.charge <= 0);
        const pool = wrong.length > 0 ? wrong : this.aliens.filter((a) => a.alive && a.charge <= 0);
        if (pool.length > 0) pool[Math.floor(Math.random() * pool.length)].charge = 0.5;
        const base = this.config.boss ? 1.5 : 2.8 - Math.min(round, 6) * 0.2;
        this.boltTimer = base + Math.random() * base * 0.7;
      }
    }

    for (const b of this.bolts) b.y += b.vy * dt;
    for (const b of this.bolts) {
      if (b.y > SHIP_Y - 18 && b.y < SHIP_Y + 14 && Math.abs(b.x - this.shipX) < 18) {
        b.y = GAME_HEIGHT + 50;
        this.damage();
      }
    }
    this.bolts = this.bolts.filter((b) => b.y < GAME_HEIGHT + 10);

    // --- bonusy ---
    this.pickupTimer -= dt;
    if (this.pickupTimer <= 0 && this.spawn > 1) {
      const kinds: PickupKind[] = ["shield", "rapid", "slow"];
      this.pickups.push({ x: 40 + Math.random() * (GAME_WIDTH - 80), y: -10, kind: kinds[Math.floor(Math.random() * 3)], t: 0 });
      this.pickupTimer = 9 + Math.random() * 6;
    }
    for (const p of this.pickups) {
      p.t += dt;
      p.y += 85 * dt;
      if (Math.abs(p.x - this.shipX) < 28 && Math.abs(p.y - SHIP_Y) < 28) {
        p.y = GAME_HEIGHT + 50;
        if (p.kind === "shield") this.shield = true;
        if (p.kind === "rapid") this.rapid = 6;
        if (p.kind === "slow") this.slow = 6;
        this.popText(PICKUP_ICONS[p.kind], PICKUP_COLORS[p.kind], p.x, SHIP_Y - 30);
        this.burst(p.x, SHIP_Y, PICKUP_COLORS[p.kind], 12);
        sfx("pickup");
      }
    }
    this.pickups = this.pickups.filter((p) => p.y < GAME_HEIGHT + 20);

    // --- střely hráče ---
    for (const b of this.bullets) b.y -= 640 * dt;
    this.bullets = this.bullets.filter((b) => b.y > -10);

    // střela může sestřelit i nepřátelskou střelu
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      const hit = this.bolts.findIndex((o) => Math.abs(o.x - b.x) < 9 && Math.abs(o.y - b.y) < 14);
      if (hit === -1) continue;
      this.burst(this.bolts[hit].x, this.bolts[hit].y, "#ff9eb0", 8);
      this.bolts.splice(hit, 1);
      this.bullets.splice(bi, 1);
    }

    for (let bi = this.bullets.length - 1; bi >= 0 && this.spawn >= 0.5; bi--) {
      const b = this.bullets[bi];
      const idx = this.aliens.findIndex((a, i) => {
        if (!a.alive) return false;
        const p = this.alienPos(a, i);
        return b.x >= p.x && b.x <= p.x + a.w && b.y >= p.y && b.y <= p.y + a.h;
      });
      if (idx === -1) continue;
      const a = this.aliens[idx];
      const p = this.alienPos(a, idx);
      a.alive = false;
      this.bullets.splice(bi, 1);
      this.burst(p.x + a.w / 2, p.y + a.h / 2, a.color, a.correct ? 30 : 18);
      if (a.correct) {
        this.running = false;
        this.shake = 8;
        this.flash = { color: "#7ee0b0", a: 0.22 };
        sfx("correct");
      } else {
        this.shake = 10;
        this.flash = { color: "#ff3355", a: 0.25 };
        sfx("wrong");
      }
      this.cb.onHit(idx, a.correct);
      if (!this.running) return;
    }
  }

  private drawAlien(a: Alien, i: number) {
    const ctx = this.ctx;
    const t = this.time;
    const style = ALIEN_STYLES[i % ALIEN_STYLES.length];
    const pos = this.alienPos(a, i);
    const x = pos.x;
    const appear = Math.min(1, this.spawn / 0.5);
    const eased = 1 - Math.pow(1 - appear, 3);
    const y = pos.y + Math.sin(t * 3 + i * 1.3) * 2.5 - (1 - eased) * 50;
    const cx = x + a.w / 2;
    const blink = (t * 0.8 + i * 1.7) % 4 > 3.85;
    const look = Math.max(-1, Math.min(1, (this.shipX - cx) / 90)) * 3;
    const charging = a.charge > 0;

    const eye = (ex: number, ey: number, r: number) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (blink && !charging) {
        ctx.fillRect(ex - r, ey - 1, r * 2, 2.5);
        return;
      }
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = charging ? "#ff2244" : "#1a1233";
      ctx.beginPath();
      ctx.arc(ex + look * (r / 11), ey + 1, r * (charging ? 0.7 : 0.48), 0, Math.PI * 2);
      ctx.fill();
    };

    ctx.save();
    ctx.globalAlpha = eased;
    if (this.config.boss) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6 + i);
      ctx.fillStyle = `rgba(255,50,80,${0.1 + pulse * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(cx, y + 34, a.w * 0.55, 46, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowColor = charging ? "#ff2244" : style.body;
    ctx.shadowBlur = charging ? 26 : 16;
    ctx.fillStyle = style.body;
    ctx.strokeStyle = style.body;
    ctx.lineCap = "round";

    switch (i % ALIEN_STYLES.length) {
      case 0: {
        ctx.beginPath();
        ctx.ellipse(cx, y + 26, a.w * 0.34, 23, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = style.dark;
        ctx.beginPath();
        ctx.roundRect(cx - 28, y + 40, 15, 9, 4);
        ctx.roundRect(cx + 13, y + 40, 15, 9, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 22, y + 14, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 24, y + 30, 4.5, 0, Math.PI * 2);
        ctx.arc(cx + 18, y + 11, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        eye(cx, y + 24, 11);
        break;
      }
      case 1: {
        const swing = Math.sin(t * 4 + i) * 5;
        ctx.beginPath();
        ctx.ellipse(cx, y + 31, a.w * 0.3, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 5;
        for (const dir of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + dir * a.w * 0.26, y + 32);
          ctx.lineTo(cx + dir * (a.w * 0.36), y + 22 + swing * dir);
          ctx.stroke();
          ctx.fillStyle = style.dark;
          ctx.beginPath();
          ctx.arc(cx + dir * (a.w * 0.38), y + 19 + swing * dir, 9, 0.35, Math.PI * 2 - 0.35);
          ctx.lineTo(cx + dir * (a.w * 0.38), y + 19 + swing * dir);
          ctx.fill();
        }
        ctx.lineWidth = 3;
        for (const dir of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + dir * 12, y + 20);
          ctx.lineTo(cx + dir * 12, y + 8);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        eye(cx - 12, y + 7, 6);
        eye(cx + 12, y + 7, 6);
        break;
      }
      case 2: {
        ctx.beginPath();
        ctx.ellipse(cx, y + 22, a.w * 0.27, 21, 0, Math.PI, 0);
        ctx.lineTo(cx + a.w * 0.27, y + 36);
        ctx.lineTo(cx - a.w * 0.27, y + 36);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 6;
        for (let k = 0; k < 4; k++) {
          const tx = cx - a.w * 0.2 + k * ((a.w * 0.4) / 3);
          ctx.beginPath();
          ctx.moveTo(tx, y + 34);
          ctx.bezierCurveTo(
            tx + Math.sin(t * 5 + k) * 7, y + 40,
            tx - Math.sin(t * 5 + k) * 7, y + 46,
            tx + Math.sin(t * 5 + k + 1) * 5, y + 52,
          );
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        eye(cx - 11, y + 22, 7);
        eye(cx + 11, y + 22, 7);
        break;
      }
      default: {
        ctx.fillStyle = "rgba(160,235,255,0.55)";
        ctx.beginPath();
        ctx.ellipse(cx, y + 24, 19, 16, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = "#7dd87d";
        ctx.beginPath();
        ctx.arc(cx, y + 22, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = style.body;
        ctx.beginPath();
        ctx.ellipse(cx, y + 33, a.w * 0.4, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        for (let k = 0; k < 5; k++) {
          const lit = Math.floor(t * 4) % 5 === k;
          ctx.fillStyle = lit ? "#fff7b0" : style.dark;
          ctx.beginPath();
          ctx.arc(cx - a.w * 0.3 + k * ((a.w * 0.6) / 4), y + 34, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        eye(cx, y + 21, 3.2);
        break;
      }
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(11,8,32,0.82)";
    ctx.strokeStyle = charging ? "#ff2244" : style.body;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 8, y + a.h - 26, a.w - 16, 24, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(a.label, cx, y + a.h - 13, a.w - 30);
    ctx.restore();
  }

  private drawBackground() {
    const ctx = this.ctx;
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    bg.addColorStop(0, "#070519");
    bg.addColorStop(0.6, "#120b34");
    bg.addColorStop(1, "#1d0f45");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // mlhovina
    const blobs = [
      { x: 110, y: 120, r: 190, c: "rgba(124,108,255,0.13)" },
      { x: 520, y: 260, r: 210, c: "rgba(255,93,115,0.09)" },
    ];
    for (const b of blobs) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // vzdálená planeta s prstencem
    ctx.save();
    ctx.globalAlpha = 0.55;
    const planet = ctx.createRadialGradient(76, 292, 4, 80, 298, 48);
    planet.addColorStop(0, "#ffb26b");
    planet.addColorStop(1, "#7c2a5e");
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(80, 298, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,230,200,0.55)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(80, 302, 66, 14, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    for (const layer of this.layers) {
      ctx.globalAlpha = layer.alpha;
      for (const s of layer.stars) ctx.fillRect(s.x, s.y, layer.size, layer.size);
    }
    ctx.globalAlpha = 1;
  }

  private drawShip() {
    const ctx = this.ctx;
    if (this.invuln > 0 && Math.floor(this.time * 14) % 2 === 0) return;
    const tilt = Math.max(-0.28, Math.min(0.28, this.shipVx / 1400));
    ctx.save();
    ctx.translate(this.shipX, SHIP_Y);
    ctx.rotate(tilt);

    // plamen z trysky
    const flame = 10 + Math.random() * 8 + (this.running ? 4 : 0);
    const fg = ctx.createLinearGradient(0, 8, 0, 8 + flame);
    fg.addColorStop(0, "#fff7b0");
    fg.addColorStop(0.5, "#ff9d3d");
    fg.addColorStop(1, "rgba(255,93,60,0)");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(0, 8 + flame);
    ctx.lineTo(6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(20, 12);
    ctx.lineTo(8, 6);
    ctx.lineTo(-8, 6);
    ctx.lineTo(-20, 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0e7490";
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(7, 6);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, -2, 4, 0, Math.PI * 2);
    ctx.fill();

    if (this.muzzle > 0) {
      ctx.fillStyle = `rgba(255,240,150,${this.muzzle})`;
      ctx.beginPath();
      ctx.arc(0, -24, 7 * this.muzzle, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.shield) {
      ctx.strokeStyle = `rgba(90,184,255,${0.55 + 0.25 * Math.sin(this.time * 8)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -2, 28, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHud() {
    const ctx = this.ctx;
    const active: { icon: string; left: number; color: string }[] = [];
    if (this.rapid > 0) active.push({ icon: PICKUP_ICONS.rapid, left: this.rapid / 6, color: PICKUP_COLORS.rapid });
    if (this.slow > 0) active.push({ icon: PICKUP_ICONS.slow, left: this.slow / 6, color: PICKUP_COLORS.slow });
    if (this.shield) active.push({ icon: PICKUP_ICONS.shield, left: 1, color: PICKUP_COLORS.shield });
    active.forEach((p, k) => {
      const x = 14 + k * 44;
      ctx.fillStyle = "rgba(10,8,30,0.7)";
      ctx.beginPath();
      ctx.roundRect(x, GAME_HEIGHT - 34, 38, 24, 8);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.fillRect(x + 4, GAME_HEIGHT - 14, 30 * p.left, 3);
      ctx.font = "15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.icon, x + 19, GAME_HEIGHT - 24);
    });

    if (this.banner > 0) {
      const a = Math.min(1, this.banner * 1.5);
      const grow = 1 + (1.8 - this.banner) * 0.08;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
      ctx.scale(grow, grow);
      ctx.font = "900 64px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(10,8,30,0.9)";
      ctx.strokeText("BOSS", 0, 0);
      ctx.fillStyle = "#ff5d73";
      ctx.fillText("BOSS", 0, 0);
      ctx.restore();
    }
  }

  private draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const view = this.view3d;
    if (view) {
      // 3D režim: svět kreslí GameView3D, tady jen efekty a rozhraní.
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      for (const p of this.particles) {
        const pos = view.project(p.x, p.y, 8);
        if (!pos) continue;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(pos.x, pos.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      drawFloatTexts(
        ctx,
        this.texts.flatMap((t) => {
          const pos = view.project(t.x, t.y, 30);
          return pos ? [{ ...t, x: pos.x, y: pos.y }] : [];
        }),
      );
      if (this.flash.a > 0) {
        ctx.globalAlpha = this.flash.a;
        ctx.fillStyle = this.flash.color;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.globalAlpha = 1;
      }
      this.drawHud();
      return;
    }
    this.drawBackground();

    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);

    ctx.strokeStyle = "rgba(255,93,115,0.35)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, LANDING_Y);
    ctx.lineTo(GAME_WIDTH, LANDING_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    this.aliens.forEach((a, i) => {
      if (a.alive) this.drawAlien(a, i);
    });

    for (const r of this.rings) {
      ctx.globalAlpha = Math.max(0, r.life);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // nepřátelské střely
    for (const b of this.bolts) {
      ctx.shadowColor = "#ff2244";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ff5d73";
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, 4.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffd1d8";
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, 1.8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // bonusy
    for (const p of this.pickups) {
      const pulse = 1 + Math.sin(p.t * 8) * 0.1;
      ctx.shadowColor = PICKUP_COLORS[p.kind];
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(10,8,30,0.85)";
      ctx.strokeStyle = PICKUP_COLORS[p.kind];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 15 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = "16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(PICKUP_ICONS[p.kind], p.x, p.y + 1);
    }

    // střely hráče se světelnou stopou
    for (const b of this.bullets) {
      const g = ctx.createLinearGradient(0, b.y - 4, 0, b.y + 26);
      g.addColorStop(0, "#fff7b0");
      g.addColorStop(1, "rgba(255,224,102,0)");
      ctx.fillStyle = g;
      ctx.fillRect(b.x - 2.5, b.y - 4, 5, 30);
      ctx.shadowColor = "#ffe066";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(b.x - 2, b.y - 10, 4, 10);
      ctx.shadowBlur = 0;
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;

    this.drawShip();
    drawFloatTexts(ctx, this.texts);
    ctx.restore();

    if (this.flash.a > 0) {
      ctx.globalAlpha = this.flash.a;
      ctx.fillStyle = this.flash.color;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.globalAlpha = 1;
    }
    this.drawHud();
  }
}
