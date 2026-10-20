export type EngineCallbacks = {
  onHit: (index: number, correct: boolean) => void;
  onMiss: () => void;
};

export type EngineConfig = {
  fireCooldown: number;
  alienSpeedFactor: number;
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
};
type Bullet = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 420;

const ALIEN_STYLES = [
  { body: "#7c6cff", dark: "#4b3fd1" },
  { body: "#ff5d73", dark: "#c23049" },
  { body: "#ffb020", dark: "#c77a00" },
  { body: "#22c55e", dark: "#128a3e" },
];
type Ring = { x: number; y: number; r: number; life: number; color: string };
const LANDING_Y = GAME_HEIGHT - 70;
const SHIP_Y = GAME_HEIGHT - 36;

export class SpaceEngine {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private running = false;
  private shipX = GAME_WIDTH / 2;
  private input = { left: false, right: false, fire: false };
  private cooldown = 0;
  private aliens: Alien[] = [];
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * GAME_WIDTH,
    y: Math.random() * GAME_HEIGHT,
    s: Math.random() * 1.5 + 0.5,
  }));
  private swayT = 0;
  private time = 0;
  private spawn = 1;
  private rings: Ring[] = [];
  private descent = 0;
  private config: EngineConfig = { fireCooldown: 0.6, alienSpeedFactor: 1 };

  constructor(
    private canvas: HTMLCanvasElement,
    private cb: EngineCallbacks,
  ) {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    this.ctx = canvas.getContext("2d")!;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.raf = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  setRunning(running: boolean) {
    this.running = running;
    if (!running) this.input = { left: false, right: false, fire: false };
  }

  setInput(partial: Partial<typeof this.input>) {
    this.input = { ...this.input, ...partial };
  }

  loadQuestion(options: string[], correctIndex: number, config: EngineConfig) {
    this.config = config;
    this.bullets = [];
    this.cooldown = 0;
    this.descent = 0;
    this.swayT = 0;
    this.spawn = 0;
    const count = options.length;
    const slot = (GAME_WIDTH - 40) / count;
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
    }));
  }

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

  private burst(x: number, y: number, color: string) {
    this.rings.push({ x, y, r: 8, life: 1, color });
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 140;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6 + Math.random() * 0.4, color });
    }
  }

  private update(dt: number) {
    this.time += dt;
    this.spawn += dt;
    this.rings = this.rings.filter((r) => {
      r.life -= dt * 1.8;
      r.r += 170 * dt;
      return r.life > 0;
    });
    for (const s of this.stars) {
      s.y += s.s * 12 * dt;
      if (s.y > GAME_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * GAME_WIDTH;
      }
    }
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });

    if (!this.running) return;

    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    this.shipX = Math.max(24, Math.min(GAME_WIDTH - 24, this.shipX + dir * 320 * dt));

    this.cooldown -= dt;
    if (this.input.fire && this.cooldown <= 0) {
      this.bullets.push({ x: this.shipX, y: SHIP_Y - 18 });
      this.cooldown = this.config.fireCooldown;
    }

    this.swayT += dt * 1.1;
    this.descent += 11 * this.config.alienSpeedFactor * dt;
    const sway = Math.sin(this.swayT) * 12;

    for (const a of this.aliens) {
      if (!a.alive) continue;
      a.y = 24 + this.descent;
      if (a.y + a.h >= LANDING_Y) {
        a.alive = false;
        if (a.correct) {
          this.running = false;
          this.burst(a.x + a.w / 2, a.y + a.h / 2, "#ff5d73");
          this.cb.onMiss();
          return;
        }
      }
    }

    for (const b of this.bullets) b.y -= 520 * dt;
    this.bullets = this.bullets.filter((b) => b.y > -10);

    for (let bi = this.bullets.length - 1; bi >= 0 && this.spawn >= 0.5; bi--) {
      const b = this.bullets[bi];
      const idx = this.aliens.findIndex(
        (a) => a.alive && b.x >= a.x + sway && b.x <= a.x + sway + a.w && b.y >= a.y && b.y <= a.y + a.h,
      );
      if (idx === -1) continue;
      const a = this.aliens[idx];
      a.alive = false;
      this.bullets.splice(bi, 1);
      this.burst(a.x + a.w / 2, a.y + a.h / 2, a.color);
      if (a.correct) this.running = false;
      this.cb.onHit(idx, a.correct);
      if (!this.running) return;
    }
  }

  private drawAlien(a: Alien, x: number, index: number) {
    const ctx = this.ctx;
    const t = this.time;
    const style = ALIEN_STYLES[index % ALIEN_STYLES.length];
    const appear = Math.min(1, this.spawn / 0.5);
    const eased = 1 - Math.pow(1 - appear, 3);
    const y = a.y + Math.sin(t * 3 + index * 1.3) * 2.5 - (1 - eased) * 50;
    const cx = x + a.w / 2;
    const blink = (t * 0.8 + index * 1.7) % 4 > 3.85;
    const look = Math.max(-1, Math.min(1, (this.shipX - cx) / 90)) * 3;

    const eye = (ex: number, ey: number, r: number) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (blink) {
        ctx.fillRect(ex - r, ey - 1, r * 2, 2.5);
        return;
      }
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1233";
      ctx.beginPath();
      ctx.arc(ex + look * (r / 11), ey + 1, r * 0.48, 0, Math.PI * 2);
      ctx.fill();
    };

    ctx.save();
    ctx.globalAlpha = eased;
    ctx.shadowColor = style.body;
    ctx.shadowBlur = 16;
    ctx.fillStyle = style.body;
    ctx.strokeStyle = style.body;
    ctx.lineCap = "round";

    switch (index % ALIEN_STYLES.length) {
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
        const swing = Math.sin(t * 4 + index) * 5;
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
          const tx = cx - a.w * 0.2 + k * (a.w * 0.4 / 3);
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
          ctx.arc(cx - a.w * 0.3 + k * (a.w * 0.6 / 4), y + 34, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        eye(cx, y + 21, 3.2);
        break;
      }
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(11,8,32,0.82)";
    ctx.strokeStyle = style.body;
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

  private draw() {
    const ctx = this.ctx;
    ctx.fillStyle = "#0b0820";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#ffffff";
    for (const s of this.stars) {
      ctx.globalAlpha = 0.35 + s.s * 0.25;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(255,93,115,0.35)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, LANDING_Y);
    ctx.lineTo(GAME_WIDTH, LANDING_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    const sway = Math.sin(this.swayT) * 12;
    this.aliens.forEach((a, i) => {
      if (a.alive) this.drawAlien(a, a.x + sway, i);
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

    ctx.fillStyle = "#ffe066";
    for (const b of this.bullets) ctx.fillRect(b.x - 2, b.y - 10, 4, 12);

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(this.shipX, SHIP_Y - 20);
    ctx.lineTo(this.shipX + 20, SHIP_Y + 12);
    ctx.lineTo(this.shipX + 8, SHIP_Y + 6);
    ctx.lineTo(this.shipX - 8, SHIP_Y + 6);
    ctx.lineTo(this.shipX - 20, SHIP_Y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.shipX, SHIP_Y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
