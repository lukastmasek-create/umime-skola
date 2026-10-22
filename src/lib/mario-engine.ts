import type { EngineCallbacks, EngineConfig } from "./space-engine";
import { drawFloatTexts, sfx, stepFloatTexts, type FloatText } from "./game-fx";
import { Sprites } from "./sprites";

const SHELL_FRAME: Record<string, string> = { "#2fb344": "zelena", "#e5484d": "cervena", "#3b82f6": "modra", "#f5a524": "oranzova" };

const W = 640;
const H = 420;
const GROUND = 340;
const TURTLE_W = 36;
const TURTLE_H = 24;
const SPACING = 96;
const SHELLS = ["#2fb344", "#e5484d", "#3b82f6", "#f5a524"];
const QUESTION_TIME = 28;
const COYOTE = 0.1;
const JUMP_BUFFER = 0.12;

type Turtle = {
  cx: number;
  dir: number;
  speed: number;
  label: string;
  correct: boolean;
  alive: boolean;
  shell: string;
};
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type Cloud = { x: number; y: number; s: number };

export class MarioEngine {
  private sp = new Sprites("mario");
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
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
  private squash = 0;
  private coyote = 0;
  private jumpBuffer = 0;
  private jumpHeld = false;
  private prevFire = false;
  private shake = 0;
  private flash = { color: "#ffffff", a: 0 };
  private banner = 0;
  private lastTick = -1;
  private input = { left: false, right: false, fire: false };
  private pointerTarget: number | null = null;
  private turtles: Turtle[] = [];
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private clouds: Cloud[] = [
    { x: 80, y: 60, s: 1 },
    { x: 300, y: 100, s: 0.7 },
    { x: 520, y: 50, s: 1.2 },
  ];
  private timeLeft = QUESTION_TIME;
  private countdown = 0;
  private prompt = "";
  private config: EngineConfig = { fireCooldown: 0.35, alienSpeedFactor: 1 };

  constructor(
    private canvas: HTMLCanvasElement,
    private cb: EngineCallbacks,
  ) {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * this.dpr;
    canvas.height = H * this.dpr;
    this.ctx = canvas.getContext("2d")!;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    this.raf = requestAnimationFrame(this.tick);
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

  setRunning(running: boolean) {
    this.running = running;
    if (!running) {
      this.input = { left: false, right: false, fire: false };
      this.pointerTarget = null;
    }
  }

  setInput(partial: Partial<typeof this.input>) {
    this.input = { ...this.input, ...partial };
  }

  popText(text: string, color = "#ffe066", x = this.px, y = this.py - 60) {
    this.texts.push({ x, y, text, color, life: 1.1 });
  }

  loadQuestion(options: string[], correctIndex: number, config: EngineConfig, prompt = "") {
    this.config = config;
    this.prompt = prompt;
    this.countdown = prompt ? 3 : 0;
    this.lastTick = -1;
    this.px = 28;
    this.py = GROUND;
    this.vy = 0;
    this.onGround = true;
    this.knock = 0;
    this.squash = 0;
    this.jumpBuffer = 0;
    this.timeLeft = QUESTION_TIME;
    this.banner = config.boss ? 2.2 : 0;
    if (config.boss && options.length > 0) sfx("boss");
    const n = options.length;
    const first = 130;
    const gap = n > 1 ? (W - SPACING / 2 - first) / (n - 1) : 0;
    const round = config.round ?? 0;
    const pace = (1 + Math.min(round, 6) * 0.07) * (config.boss ? 1.3 : 1);
    this.turtles = options.map((label, i) => ({
      cx: first + i * gap,
      dir: i % 2 === 0 ? 1 : -1,
      speed: (38 + ((i * 17) % 28)) * pace,
      label,
      correct: i === correctIndex,
      alive: true,
      shell: SHELLS[i % SHELLS.length],
    }));
  }

  private isJump(code: string) {
    return code === "Space" || code === "ArrowUp" || code === "KeyW";
  }

  private screenX(clientX: number) {
    const rect = this.canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.running) return;
    this.canvas.setPointerCapture?.(e.pointerId);
    this.pointerTarget = this.screenX(e.clientX);
    this.input.fire = true;
    e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.pointerTarget !== null) this.pointerTarget = this.screenX(e.clientX);
  };

  private onPointerUp = () => {
    this.pointerTarget = null;
    this.input.fire = false;
  };

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
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 160;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, life: 0.7, color, size: 4 });
    }
  }

  private dust(x: number, y: number, count = 6) {
    for (let i = 0; i < count; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.particles.push({
        x,
        y,
        vx: dir * (30 + Math.random() * 70),
        vy: -20 - Math.random() * 40,
        life: 0.35,
        color: "rgba(255,255,255,0.8)",
        size: 3,
      });
    }
  }

  private update(dt: number) {
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 40);
    this.flash.a = Math.max(0, this.flash.a - dt * 1.6);
    this.banner = Math.max(0, this.banner - dt);
    this.squash += (0 - this.squash) * Math.min(1, 14 * dt);
    this.texts = stepFloatTexts(this.texts, dt);
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
      const before = Math.ceil(this.countdown);
      this.countdown -= dt;
      const after = Math.ceil(this.countdown);
      if (after !== before && after >= 0 && this.lastTick !== after) {
        this.lastTick = after;
        sfx(this.countdown > 0 ? "tick" : "go");
      }
      return;
    }

    this.timeLeft -= dt;
    if (this.timeLeft <= 5 && Math.ceil(this.timeLeft) !== this.lastTick && this.timeLeft > 0) {
      this.lastTick = Math.ceil(this.timeLeft);
      sfx("tick");
    }
    if (this.timeLeft <= 0) {
      this.running = false;
      this.shake = 12;
      this.flash = { color: "#ff3355", a: 0.35 };
      sfx("miss");
      this.cb.onMiss();
      return;
    }

    // --- pohyb: plynulý rozjezd, tažení prstem a pohyb po klávesách ---
    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    let vx = dir * 230;
    if (this.pointerTarget !== null) {
      const dx = this.pointerTarget - this.px;
      vx = Math.abs(dx) < 6 ? 0 : Math.max(-280, Math.min(280, dx * 6));
    }
    if (vx !== 0) this.facing = vx > 0 ? 1 : -1;
    if (this.knock > 0) {
      this.knock -= dt;
      vx = this.knockDir * 230;
    }
    this.px = Math.max(14, Math.min(W - 14, this.px + vx * dt));

    // --- skok: buffer stisku, coyote time a nižší skok při dřívějším puštění ---
    if (this.input.fire && !this.prevFire) this.jumpBuffer = JUMP_BUFFER;
    this.prevFire = this.input.fire;
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    this.coyote = this.onGround ? COYOTE : Math.max(0, this.coyote - dt);

    const boost = 1 + (0.35 - this.config.fireCooldown) * 0.6;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = -540 * boost;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.jumpHeld = true;
      this.squash = -0.22;
      this.dust(this.px, GROUND, 4);
      sfx("jump");
    }
    if (this.jumpHeld && !this.input.fire && this.vy < -220) {
      this.vy = -220;
      this.jumpHeld = false;
    }
    if (this.vy >= 0) this.jumpHeld = false;

    const prevFeet = this.py;
    this.vy += 1500 * dt;
    this.py += this.vy * dt;
    if (this.py >= GROUND) {
      if (!this.onGround && this.vy > 250) {
        this.squash = 0.3;
        this.dust(this.px, GROUND);
        sfx("land");
      }
      this.py = GROUND;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // --- želvy ---
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
        this.vy = this.input.fire ? -520 : -380;
        this.onGround = false;
        this.squash = -0.2;
        this.burst(t.cx, top + 8, t.shell);
        if (t.correct) {
          this.running = false;
          this.shake = 8;
          this.flash = { color: "#7ee0b0", a: 0.22 };
          sfx("correct");
          this.popText("⭐", "#ffe066", t.cx, top - 30);
        } else {
          this.shake = 10;
          this.flash = { color: "#ff3355", a: 0.25 };
          sfx("wrong");
          this.popText("✖", "#ff6b81", t.cx, top - 30);
        }
        sfx("stomp");
        this.cb.onHit(i, t.correct);
        if (!this.running) return;
      } else {
        this.knockDir = this.px < t.cx ? -1 : 1;
        this.knock = 0.18;
        this.px = t.cx + this.knockDir * (TURTLE_W / 2 + 12);
        this.shake = Math.max(this.shake, 3);
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
    if (this.config.boss) {
      ctx.fillStyle = `rgba(255,50,80,${0.12 + 0.1 * Math.sin(this.time * 6 + i)})`;
      ctx.beginPath();
      ctx.ellipse(0, -18, 34, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const frame = (SHELL_FRAME[t.shell] ?? "zelena") + "_chuze_" + (1 + (Math.floor(this.time * 9 + i * 2) % 6));
    const spriteBody = this.sp.draw(ctx, "zelvy", frame, 0, 4, 54, 54, { anchorBottom: true, flip: t.dir < 0 });
    ctx.scale(t.dir >= 0 ? 0.72 : -0.72, 0.72);
    if (!spriteBody) {
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
    }
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
    const moving = (this.input.left || this.input.right || this.pointerTarget !== null) && this.onGround;
    const heroFrame = !this.onGround ? (this.vy < 0 ? "skok" : "pad") : moving ? "beh_" + (1 + (Math.floor(this.time * 12) % 6)) : "klid_" + (1 + (Math.floor(this.time * 2) % 2));
    if (this.sp.draw(ctx, "hrdina", heroFrame, this.px, this.py + 4, 52 * (1 + this.squash), 52 * (1 - this.squash), { anchorBottom: true, flip: this.facing < 0 })) return;
    const swing = moving ? Math.sin(this.time * 16) * 6 : 0;
    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.scale(this.facing * (1 + this.squash), 1 - this.squash);
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
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const spr = this.sp.has("nebe", "nebe");
    if (spr) {
      this.sp.draw(ctx, this.config.boss ? "nebe_boss" : "nebe", this.config.boss ? "nebe_boss" : "nebe", W / 2, H / 2, W, H);
      this.sp.draw(ctx, "slunce", "slunce", 560, 70, 76, 76);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, this.config.boss ? "#ff8a6b" : "#5ab7ff");
      sky.addColorStop(1, this.config.boss ? "#ffe0c2" : "#d6f0ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // slunce
      ctx.fillStyle = "rgba(255,244,170,0.9)";
      ctx.beginPath();
      ctx.arc(560, 70, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,244,170,0.25)";
      ctx.beginPath();
      ctx.arc(560, 70, 40, 0, Math.PI * 2);
      ctx.fill();

    }

    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);

    if (spr) {
      this.sp.draw(ctx, "kopce_daleke", "kopce_daleke", W / 2, H / 2, W, H);
      this.sp.draw(ctx, "kopce_blizke", "kopce_blizke", W / 2, H / 2, W, H);
      this.clouds.forEach((c, k) => this.sp.draw(ctx, "mraky", "mrak_" + ((k % 3) + 1), c.x, c.y, 96 * c.s, 56 * c.s));
      for (let row = 0; row < 4; row++) for (let x = 0; x < W; x += 20) this.sp.draw(ctx, "zem", "cihla", x + 10, GROUND + 10 + row * 20, 20, 20);
    } else {
      // vzdálené kopce
      ctx.fillStyle = "#9bd8b0";
      ctx.beginPath();
      ctx.ellipse(40, GROUND, 130, 120, 0, Math.PI, 0);
      ctx.ellipse(300, GROUND, 170, 100, 0, Math.PI, 0);
      ctx.ellipse(600, GROUND, 140, 110, 0, Math.PI, 0);
      ctx.fill();
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
      ctx.fillStyle = "#5fd35f";
      ctx.fillRect(0, GROUND, W, 3);
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 40) {
        ctx.strokeRect(x, GROUND + 10, 40, 30);
        ctx.strokeRect(x + 20, GROUND + 40, 40, 30);
      }

    }

    // stín pod hrdinou
    const shadowScale = Math.max(0.4, 1 - (GROUND - this.py) / 220);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(this.px, GROUND + 3, 14 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    this.turtles.forEach((t, i) => {
      if (t.alive) this.drawTurtle(t, i);
    });
    this.drawHero();

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    drawFloatTexts(ctx, this.texts);
    ctx.restore();

    if (this.flash.a > 0) {
      ctx.globalAlpha = this.flash.a;
      ctx.fillStyle = this.flash.color;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

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

    if (this.banner > 0) {
      const a = Math.min(1, this.banner * 1.5);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(W / 2, H / 2 + 20);
      ctx.scale(1 + (2.2 - this.banner) * 0.06, 1 + (2.2 - this.banner) * 0.06);
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

    const ratio = Math.max(0, this.timeLeft / QUESTION_TIME);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(14, 12, 160, 10);
    ctx.fillStyle = ratio > 0.4 ? "#2fb344" : ratio > 0.2 ? "#f5a524" : "#e5484d";
    ctx.fillRect(14, 12, 160 * ratio, 10);
  }
}
