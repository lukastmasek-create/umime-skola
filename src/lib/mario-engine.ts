import type { EngineCallbacks, EngineConfig } from "./space-engine";

const W = 640;
const H = 420;
const GROUND = 340;
const TURTLE_W = 36;
const TURTLE_H = 24;
const SPACING = 96;
const SHELLS = ["#2fb344", "#e5484d", "#3b82f6", "#f5a524"];
const QUESTION_TIME = 28;

type Turtle = {
  cx: number;
  dir: number;
  speed: number;
  label: string;
  correct: boolean;
  alive: boolean;
  shell: string;
};
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Cloud = { x: number; y: number; s: number };

export class MarioEngine {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private running = false;
  private time = 0;
  private px = W / 2;
  private py = GROUND;
  private vy = 0;
  private onGround = true;
  private facing = 1;
  private knock = 0;
  private knockDir = 1;
  private input = { left: false, right: false, fire: false };
  private turtles: Turtle[] = [];
  private particles: Particle[] = [];
  private clouds: Cloud[] = [
    { x: 80, y: 60, s: 1 },
    { x: 300, y: 100, s: 0.7 },
    { x: 520, y: 50, s: 1.2 },
  ];
  private timeLeft = QUESTION_TIME;
  private countdown = 0;
  private prompt = "";
  private config: EngineConfig = { fireCooldown: 0.6, alienSpeedFactor: 1 };

  constructor(
    private canvas: HTMLCanvasElement,
    private cb: EngineCallbacks,
  ) {
    canvas.width = W;
    canvas.height = H;
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

  loadQuestion(options: string[], correctIndex: number, config: EngineConfig, prompt = "") {
    this.config = config;
    this.prompt = prompt;
    this.countdown = prompt ? 3 : 0;
    this.px = 28;
    this.py = GROUND;
    this.vy = 0;
    this.onGround = true;
    this.knock = 0;
    this.timeLeft = QUESTION_TIME;
    const n = options.length;
    const first = 130;
    const gap = n > 1 ? (W - SPACING / 2 - first) / (n - 1) : 0;
    this.turtles = options.map((label, i) => ({
      cx: first + i * gap,
      dir: i % 2 === 0 ? 1 : -1,
      speed: 38 + ((i * 17) % 28),
      label,
      correct: i === correctIndex,
      alive: true,
      shell: SHELLS[i % SHELLS.length],
    }));
  }

  private isJump(code: string) {
    return code === "Space" || code === "ArrowUp" || code === "KeyW";
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.running) return;
    if (e.code === "ArrowLeft" || e.code === "KeyA") this.input.left = true;
    else if (e.code === "ArrowRight" || e.code === "KeyD") this.input.right = true;
    else if (this.isJump(e.code)) this.input.fire = true;
    else return;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") this.input.left = false;
    else if (e.code === "ArrowRight" || e.code === "KeyD") this.input.right = false;
    else if (this.isJump(e.code)) this.input.fire = false;
  };

  private tick = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  private burst(x: number, y: number, color: string) {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 140;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0.7, color });
    }
  }

  private update(dt: number) {
    this.time += dt;
    for (const c of this.clouds) {
      c.x += 6 * c.s * dt;
      if (c.x > W + 80) c.x = -80;
    }
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.vy += 500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });

    if (!this.running) return;

    if (this.countdown > 0) {
      this.countdown -= dt;
      return;
    }

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.running = false;
      this.cb.onMiss();
      return;
    }

    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    if (dir !== 0) this.facing = dir;
    let vx = dir * 200;
    if (this.knock > 0) {
      this.knock -= dt;
      vx = this.knockDir * 230;
    }
    this.px = Math.max(14, Math.min(W - 14, this.px + vx * dt));

    const boost = 1 + (0.6 - this.config.fireCooldown) * 0.5;
    if (this.input.fire && this.onGround) {
      this.vy = -520 * boost;
      this.onGround = false;
    }
    const prevFeet = this.py;
    this.vy += 1500 * dt;
    this.py += this.vy * dt;
    if (this.py >= GROUND) {
      this.py = GROUND;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    const alive = this.turtles.filter((t) => t.alive);
    for (const t of alive) {
      t.cx += t.dir * t.speed * this.config.alienSpeedFactor * dt;
      if (t.cx < SPACING / 2) {
        t.cx = SPACING / 2;
        t.dir = 1;
      }
      if (t.cx > W - SPACING / 2) {
        t.cx = W - SPACING / 2;
        t.dir = -1;
      }
    }
    for (let i = 0; i < alive.length; i++) {
      for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i];
        const b = alive[j];
        const d = b.cx - a.cx;
        if (Math.abs(d) < SPACING) {
          const push = ((SPACING - Math.abs(d)) / 2) * (d >= 0 ? 1 : -1);
          a.cx -= push;
          b.cx += push;
          a.dir = d >= 0 ? -1 : 1;
          b.dir = d >= 0 ? 1 : -1;
        }
      }
    }

    const top = GROUND - TURTLE_H;
    for (let i = 0; i < this.turtles.length; i++) {
      const t = this.turtles[i];
      if (!t.alive) continue;
      const overlapX = Math.abs(this.px - t.cx) < TURTLE_W / 2 + 11;
      const overlapY = this.py > top && this.py - 34 < GROUND;
      if (!overlapX || !overlapY) continue;
      if (this.vy > 0 && prevFeet <= top + 10) {
        t.alive = false;
        this.py = top;
        this.vy = -380;
        this.onGround = false;
        this.burst(t.cx, top + 8, t.shell);
        if (t.correct) this.running = false;
        this.cb.onHit(i, t.correct);
        if (!this.running) return;
      } else {
        this.knockDir = this.px < t.cx ? -1 : 1;
        this.knock = 0.18;
        this.px = t.cx + this.knockDir * (TURTLE_W / 2 + 12);
      }
    }
  }

  private cloud(c: Cloud) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 34 * c.s, 15 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - 22 * c.s, c.y + 4 * c.s, 20 * c.s, 11 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 24 * c.s, c.y + 5 * c.s, 22 * c.s, 11 * c.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTurtle(t: Turtle, i: number) {
    const ctx = this.ctx;
    const step = Math.sin(this.time * 9 + i * 1.7);
    ctx.save();
    ctx.translate(t.cx, GROUND);
    ctx.scale(t.dir >= 0 ? 0.72 : -0.72, 0.72);
    ctx.fillStyle = "#d9a441";
    ctx.beginPath();
    ctx.ellipse(-9, -2 + (step > 0 ? -2 : 0), 7, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(9, -2 + (step > 0 ? 0 : -2), 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3d9a0";
    ctx.beginPath();
    ctx.roundRect(-20, -14, 40, 12, 6);
    ctx.fill();
    ctx.fillStyle = t.shell;
    ctx.beginPath();
    ctx.ellipse(0, -17, 23, 16, 0, Math.PI, 0);
    ctx.lineTo(23, -14);
    ctx.lineTo(-23, -14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-5, -30);
    ctx.moveTo(8, -14);
    ctx.lineTo(5, -30);
    ctx.moveTo(-17, -22);
    ctx.lineTo(17, -22);
    ctx.stroke();
    ctx.fillStyle = "#d9a441";
    ctx.beginPath();
    ctx.roundRect(15, -33 + (step > 0 ? 0 : 1), 11, 20, 5);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(22, -28, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1233";
    ctx.beginPath();
    ctx.arc(23, -28, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const px = t.cx;
    const py = GROUND - TURTLE_H - 28;
    ctx.strokeStyle = "#8a5a2b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py + 22);
    ctx.lineTo(px, GROUND - TURTLE_H + 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(11,8,32,0.85)";
    ctx.strokeStyle = t.shell;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(px - 40, py, 80, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.label, px, py + 12, 72);
  }

  private drawHero() {
    const ctx = this.ctx;
    const moving = (this.input.left || this.input.right) && this.onGround;
    const swing = moving ? Math.sin(this.time * 16) * 6 : 0;
    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.scale(this.facing, 1);
    ctx.fillStyle = "#5b3a1a";
    ctx.beginPath();
    ctx.roundRect(-11 + swing * 0.4, -6, 11, 6, 3);
    ctx.roundRect(1 - swing * 0.4, -6, 12, 6, 3);
    ctx.fill();
    ctx.fillStyle = "#2f5fd0";
    ctx.beginPath();
    ctx.roundRect(-10, -20, 20, 15, 4);
    ctx.fill();
    ctx.fillStyle = "#d62828";
    ctx.beginPath();
    ctx.roundRect(-11, -29, 22, 11, 4);
    ctx.fill();
    ctx.strokeStyle = "#d62828";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, -24);
    ctx.lineTo(this.onGround ? 14 : 15, this.onGround ? -18 + swing * 0.3 : -34);
    ctx.stroke();
    ctx.fillStyle = "#ffd5a8";
    ctx.beginPath();
    ctx.arc(0, -35, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d62828";
    ctx.beginPath();
    ctx.arc(0, -38, 9.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(1, -39, 13, 4);
    ctx.fillStyle = "#3b2314";
    ctx.beginPath();
    ctx.roundRect(1, -32, 10, 3.5, 2);
    ctx.fill();
    ctx.fillStyle = "#1a1233";
    ctx.beginPath();
    ctx.arc(4, -36, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawBanner() {
    const ctx = this.ctx;
    ctx.font = "bold 24px system-ui, sans-serif";
    const maxWidth = W - 96;
    const lines: string[] = [];
    let line = "";
    for (const word of this.prompt.split(" ")) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const height = lines.length * 32 + 22;
    ctx.fillStyle = "rgba(23,20,43,0.9)";
    ctx.beginPath();
    ctx.roundRect(28, 36, W - 56, height, 14);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((l, i) => ctx.fillText(l, W / 2, 36 + 11 + 16 + i * 32));
  }

  private draw() {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#5ab7ff");
    sky.addColorStop(1, "#d6f0ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#7fd58a";
    ctx.beginPath();
    ctx.ellipse(120, GROUND, 150, 70, 0, Math.PI, 0);
    ctx.ellipse(430, GROUND, 190, 90, 0, Math.PI, 0);
    ctx.fill();
    for (const c of this.clouds) this.cloud(c);

    ctx.fillStyle = "#b5651d";
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = "#3fae3f";
    ctx.fillRect(0, GROUND, W, 10);
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 40) {
      ctx.strokeRect(x, GROUND + 10, 40, 30);
      ctx.strokeRect(x + 20, GROUND + 40, 40, 30);
    }

    this.turtles.forEach((t, i) => {
      if (t.alive) this.drawTurtle(t, i);
    });
    this.drawHero();

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    }
    ctx.globalAlpha = 1;

    if (this.prompt) this.drawBanner();
    if (this.running && this.countdown > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, GROUND);
      ctx.font = "bold 120px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#17142b";
      ctx.strokeText(String(Math.ceil(this.countdown)), W / 2, 235);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(Math.ceil(this.countdown)), W / 2, 235);
    }

    const ratio = Math.max(0, this.timeLeft / QUESTION_TIME);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(14, 12, 160, 10);
    ctx.fillStyle = ratio > 0.4 ? "#2fb344" : ratio > 0.2 ? "#f5a524" : "#e5484d";
    ctx.fillRect(14, 12, 160 * ratio, 10);
  }
}
