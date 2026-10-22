import type { EngineCallbacks, EngineConfig } from "./space-engine";
import { drawFloatTexts, sfx, stepFloatTexts, type FloatText } from "./game-fx";

export const W = 640;
export const H = 420;

export type Dir = "left" | "right" | "up" | "down";
export type HeldKey = Dir | "fire";
export type ArcadeInput = Record<HeldKey, boolean>;

export const DIR_VEC: Record<Dir, { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};
export const OPPOSITE: Record<Dir, Dir> = { left: "right", right: "left", up: "down", down: "up" };

export const ANSWER_COLORS = ["#7c6cff", "#ff5d73", "#ffb020", "#22c55e"];

export type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };

const KEY_MAP: Record<string, HeldKey> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  Space: "fire",
  Enter: "fire",
};

export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Popisek odpovědi: zmenšuje písmo a případně zalomí do dvou řádků, aby se vešel do šířky.
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxW: number,
  color: string,
  opts: { textColor?: string; height?: number; alpha?: number; size?: number } = {},
) {
  const textColor = opts.textColor ?? "#ffffff";
  let size = opts.size ?? 15;
  let lines = [text];
  const measure = (s: string, px: number) => {
    ctx.font = `700 ${px}px system-ui, sans-serif`;
    return ctx.measureText(s).width;
  };
  while (size > 11 && measure(text, size) > maxW - 14) size -= 1;
  if (measure(text, size) > maxW - 14) {
    const words = text.split(" ");
    if (words.length > 1) {
      let best = 1;
      let bestW = Infinity;
      for (let i = 1; i < words.length; i++) {
        const w = Math.max(measure(words.slice(0, i).join(" "), size), measure(words.slice(i).join(" "), size));
        if (w < bestW) {
          bestW = w;
          best = i;
        }
      }
      lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    }
    while (size > 9 && Math.max(...lines.map((l) => measure(l, size))) > maxW - 12) size -= 1;
    if (Math.max(...lines.map((l) => measure(l, size))) > maxW - 12) {
      lines = lines.map((l) => {
        let s = l;
        while (s.length > 3 && measure(s + "…", size) > maxW - 12) s = s.slice(0, -1);
        return s === l ? l : s + "…";
      });
    }
  }
  const widest = Math.max(...lines.map((l) => measure(l, size)));
  const w = Math.min(maxW, widest + 16);
  const h = opts.height ?? (lines.length > 1 ? size * 2 + 10 : size + 12);
  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(10,8,30,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  if (lines.length === 1) ctx.fillText(lines[0], cx, cy + 1);
  else {
    ctx.fillText(lines[0], cx, cy - size * 0.55);
    ctx.fillText(lines[1], cx, cy + size * 0.6);
  }
  ctx.restore();
  return { w, h };
}

// Společný základ arkádových her: plátno, smyčka, vstup (klávesy, tlačítka, tah prstem),
// časový limit otázky, částice a vznášející se texty. Konkrétní hra dodá pravidla.
export abstract class ArcadeEngine {
  protected ctx: CanvasRenderingContext2D;
  protected dpr: number;
  protected raf = 0;
  protected last = 0;
  protected running = false;
  protected time = 0;
  protected input: ArcadeInput = { left: false, right: false, up: false, down: false, fire: false };
  protected pressed = new Set<HeldKey>();
  protected lastDir: Dir | null = null;
  protected config: EngineConfig = { fireCooldown: 0.35, alienSpeedFactor: 1 };
  protected particles: Particle[] = [];
  protected texts: FloatText[] = [];
  protected shake = 0;
  protected flashColor = "#ffffff";
  protected flashA = 0;
  protected banner = 0;
  protected over = true;
  protected maxTime = 50;
  protected timeLeft = 50;
  private lastTick = -1;
  private swipeStart: { x: number; y: number } | null = null;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected cb: EngineCallbacks,
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
      this.input = { left: false, right: false, up: false, down: false, fire: false };
      this.pressed.clear();
      this.swipeStart = null;
    }
  }

  setInput(partial: Partial<ArcadeInput>) {
    for (const key of Object.keys(partial) as HeldKey[]) {
      const value = !!partial[key];
      if (value && !this.input[key]) this.press(key);
      this.input[key] = value;
    }
  }

  popText(text: string, color = "#ffe066", x = W / 2, y = H / 2) {
    this.texts.push({ x, y, text, color, life: 1.1 });
  }

  // Zrychlení hry s pořadím otázky; poslední („boss“) otázka je ještě o třetinu svižnější.
  protected pace(): number {
    const round = this.config.round ?? 0;
    return (1 + Math.min(round, 6) * 0.06) * (this.config.boss ? 1.25 : 1) * this.config.alienSpeedFactor;
  }

  // Vylepšení „rychlost hráče“ (fireCooldown klesá s úrovní) se promítne do pohyblivosti.
  protected moveMul(): number {
    return 1 + (0.35 / Math.max(0.1, this.config.fireCooldown) - 1) * 0.4;
  }

  protected press(key: HeldKey) {
    this.pressed.add(key);
    if (key !== "fire") this.lastDir = key;
  }

  protected consume(key: HeldKey): boolean {
    return this.pressed.delete(key);
  }

  loadQuestion(options: string[], correctIndex: number, config: EngineConfig, _prompt = "") {
    void _prompt;
    this.config = config;
    this.over = options.length === 0;
    this.time = 0;
    this.maxTime = this.questionTime();
    this.timeLeft = this.maxTime;
    this.lastTick = -1;
    this.particles = [];
    this.texts = [];
    this.pressed.clear();
    this.lastDir = null;
    this.banner = config.boss && options.length > 0 ? 2.2 : 0;
    if (config.boss && options.length > 0) sfx("boss");
    this.setup(options, correctIndex);
  }

  protected questionTime(): number {
    return 50;
  }

  protected abstract setup(options: string[], correctIndex: number): void;
  protected abstract update(dt: number): void;
  protected abstract draw(ctx: CanvasRenderingContext2D): void;

  // Konec otázky: správná odpověď.
  protected win(index: number) {
    if (this.over) return;
    this.over = true;
    sfx("correct");
    this.flashColor = "#7ee0b0";
    this.flashA = 0.35;
    this.cb.onHit(index, true);
  }

  protected wrong(index: number) {
    sfx("wrong");
    this.shake = 0.3;
    this.flashColor = "#ff5d73";
    this.flashA = 0.3;
    this.cb.onHit(index, false);
  }

  protected damage() {
    sfx("damage");
    this.shake = 0.4;
    this.flashColor = "#ff5d73";
    this.flashA = 0.35;
    this.cb.onDamage?.();
  }

  protected timeout() {
    if (this.over) return;
    this.over = true;
    sfx("miss");
    this.cb.onMiss();
  }

  protected burst(x: number, y: number, color: string, n = 18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 50 + Math.random() * 150;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.7, color, size: 3 + Math.random() * 2 });
    }
  }

  private tick = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;
    if (this.running) {
      this.time += dt;
      if (!this.over) {
        this.timeLeft -= dt;
        const tick = Math.ceil(this.timeLeft);
        if (tick <= 5 && tick > 0 && tick !== this.lastTick) {
          this.lastTick = tick;
          sfx("tick");
        }
        if (this.timeLeft <= 0) this.timeout();
      }
      this.shake = Math.max(0, this.shake - dt);
      this.flashA = Math.max(0, this.flashA - dt * 1.4);
      this.banner = Math.max(0, this.banner - dt);
      this.particles = this.particles.filter((p) => {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 160 * dt;
        return p.life > 0;
      });
      this.texts = stepFloatTexts(this.texts, dt);
      if (!this.over) this.update(dt);
    }
    this.render();
    this.raf = requestAnimationFrame(this.tick);
  };

  private render() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 8 * this.shake * 3, (Math.random() - 0.5) * 8 * this.shake * 3);
    this.draw(ctx);
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    drawFloatTexts(ctx, this.texts);
    ctx.restore();
    if (this.flashA > 0) {
      ctx.globalAlpha = this.flashA;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    this.drawTimer(ctx);
    if (this.banner > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.banner);
      ctx.fillStyle = "#ff5d73";
      ctx.font = "900 34px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(10,8,30,0.9)";
      ctx.strokeText("BOSS!", W / 2, 70);
      ctx.fillText("BOSS!", W / 2, 70);
      ctx.restore();
    }
  }

  private drawTimer(ctx: CanvasRenderingContext2D) {
    if (this.over && this.timeLeft <= 0) return;
    const frac = Math.max(0, Math.min(1, this.timeLeft / this.maxTime));
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = frac > 0.3 ? "#7ee0b0" : "#ff5d73";
    ctx.fillRect(0, 0, W * frac, 5);
  }

  private screen(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  // Podtřídy mohou reagovat na klepnutí do plátna (pozice ve hře).
  protected onTap(_x: number, _y: number): void {
    void _x;
    void _y;
  }

  protected onDrag(_x: number, _y: number): void {
    void _x;
    void _y;
  }

  protected usesSwipe(): boolean {
    return true;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.running) return;
    const p = this.screen(e);
    this.canvas.setPointerCapture?.(e.pointerId);
    this.swipeStart = p;
    this.onTap(p.x, p.y);
    e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.running || !this.swipeStart) return;
    const p = this.screen(e);
    this.onDrag(p.x, p.y);
    if (!this.usesSwipe()) return;
    const dx = p.x - this.swipeStart.x;
    const dy = p.y - this.swipeStart.y;
    if (Math.hypot(dx, dy) < 26) return;
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    this.press(dir);
    this.swipeStart = p;
  };

  private onPointerUp = () => {
    this.swipeStart = null;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.running) return;
    const key = KEY_MAP[e.code];
    if (!key) return;
    if (!this.input[key]) this.press(key);
    this.input[key] = true;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const key = KEY_MAP[e.code];
    if (key) this.input[key] = false;
  };
}
