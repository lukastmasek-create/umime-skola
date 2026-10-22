import { ANSWER_COLORS, ArcadeEngine, DIR_VEC, H, OPPOSITE, W, drawLabel, shuffleInPlace, type Dir } from "./arcade-base";
import { sfx } from "./game-fx";
import type { Item3D, Scene3D } from "./scene3d";

const APPLE_MODEL: Record<string, string> = { "#7c6cff": "fialove", "#ff5d73": "cervene", "#ffb020": "zlute", "#22c55e": "zelene" };

const C = 20;
const COLS = 32;
const ROWS = 20;
const OY = 14;

type Cell = { x: number; y: number };
type Apple = Cell & { label: string; correct: boolean; alive: boolean; index: number; color: string };

export class SnakeEngine extends ArcadeEngine {
  private snake: Cell[] = [];
  private dir: Dir = "right";
  private acc = 0;
  private apples: Apple[] = [];
  private food: Cell[] = [];
  private grow = 0;
  private invuln = 0;

  protected questionTime() {
    return 55;
  }

  private free(x: number, y: number) {
    return !this.snake.some((c) => c.x === x && c.y === y) && !this.apples.some((a) => a.alive && a.x === x && a.y === y) && !this.food.some((f) => f.x === x && f.y === y);
  }

  private randomFree(minX: number, maxX: number, minY: number, maxY: number): Cell {
    for (let i = 0; i < 200; i++) {
      const x = minX + Math.floor(Math.random() * (maxX - minX));
      const y = minY + Math.floor(Math.random() * (maxY - minY));
      const head = this.snake[0];
      if (this.free(x, y) && Math.abs(x - head.x) + Math.abs(y - head.y) > 6) return { x, y };
    }
    return { x: 1, y: 1 };
  }

  // Had se ve hře zvětšuje pořád: mezi otázkami si délku i směr nese s sebou a zrychluje.
  // Hra končí jen smrtí (došly životy), proto `round` roste přes všechny otázky.
  protected pace(): number {
    const r = this.config.round ?? 0;
    return (1 + Math.min(r, 24) * 0.035) * this.config.alienSpeedFactor;
  }

  protected setup(options: string[], correctIndex: number) {
    const carry = options.length > 0 && (this.config.round ?? 0) > 0 && this.snake.length > 0;
    if (!carry) {
      this.snake = [
        { x: 4, y: 10 },
        { x: 3, y: 10 },
        { x: 2, y: 10 },
      ];
      this.dir = "right";
      this.grow = 0;
    }
    this.acc = 0;
    this.invuln = carry ? 1.2 : 0;
    this.apples = [];
    this.food = [];
    if (options.length === 0) return;
    const order = shuffleInPlace(options.map((_, i) => i));
    // Čtyři čtvrtiny hrací plochy, v každé jedna odpověď.
    const quadrants: [number, number, number, number][] = [
      [2, 12, 3, 8],
      [20, 30, 3, 8],
      [2, 12, 12, 18],
      [20, 30, 12, 18],
    ];
    shuffleInPlace(quadrants);
    this.apples = order.map((optIndex, k) => {
      const q = quadrants[k % quadrants.length];
      const cell = this.randomFree(q[0], q[1], q[2], q[3]);
      const apple: Apple = {
        ...cell,
        label: options[optIndex],
        correct: optIndex === correctIndex,
        alive: true,
        index: optIndex,
        color: ANSWER_COLORS[k % ANSWER_COLORS.length],
      };
      this.apples.push(apple);
      return apple;
    });
    for (let i = 0; i < 3; i++) this.spawnFood();
  }

  private spawnFood() {
    const c = this.randomFree(1, COLS - 1, 2, ROWS - 1);
    this.food.push(c);
  }

  protected update(dt: number) {
    this.invuln = Math.max(0, this.invuln - dt);
    const interval = Math.max(0.06, 0.17 / (this.pace() * this.moveMul()));
    this.acc += dt;
    while (this.acc >= interval && !this.over) {
      this.acc -= interval;
      this.step();
    }
  }

  private step() {
    const want = this.lastDir;
    if (want && want !== OPPOSITE[this.dir]) this.dir = want;
    const v = DIR_VEC[this.dir];
    const head = this.snake[0];
    const next = { x: (head.x + v.x + COLS) % COLS, y: (head.y + v.y + ROWS) % ROWS };

    if (this.invuln <= 0 && this.snake.slice(0, -1).some((c) => c.x === next.x && c.y === next.y)) {
      this.damage();
      this.burst((head.x + 0.5) * C, OY + (head.y + 0.5) * C, "#7ee0b0", 18);
      this.snake = this.snake.slice(0, Math.max(3, Math.ceil(this.snake.length / 2)));
      this.invuln = 1.5;
      return;
    }
    this.snake.unshift(next);
    if (this.grow > 0) this.grow -= 1;
    else this.snake.pop();

    const fi = this.food.findIndex((f) => f.x === next.x && f.y === next.y);
    if (fi >= 0) {
      this.food.splice(fi, 1);
      this.grow += 1;
      this.spawnFood();
      sfx("land");
    }
    for (const a of this.apples) {
      if (!a.alive || a.x !== next.x || a.y !== next.y) continue;
      const px = (a.x + 0.5) * C;
      const py = OY + (a.y + 0.5) * C;
      if (a.correct) {
        this.burst(px, py, a.color, 26);
        this.grow += 3;
        this.win(a.index);
        return;
      }
      a.alive = false;
      this.burst(px, py, "#ff5d73", 20);
      this.wrong(a.index);
    }
  }

  protected scene3d(): Scene3D | null {
    if (this.snake.length === 0) return null;
    const items: Item3D[] = [];
    const pos = (c: Cell) => ({ x: (c.x + 0.5) * C, y: OY + (c.y + 0.5) * C });
    // okraj hřiště
    const fw = COLS * C;
    const fh = ROWS * C;
    items.push({ key: "bt", model: "box", x: fw / 2, y: OY, w: fw + 8, h: 10, d: 6, color: "#2f8f68" });
    items.push({ key: "bb", model: "box", x: fw / 2, y: OY + fh, w: fw + 8, h: 10, d: 6, color: "#2f8f68" });
    items.push({ key: "bl", model: "box", x: 0, y: OY + fh / 2, w: 6, h: 10, d: fh, color: "#2f8f68" });
    items.push({ key: "br", model: "box", x: fw, y: OY + fh / 2, w: 6, h: 10, d: fh, color: "#2f8f68" });
    this.food.forEach((f, i) => items.push({ key: "f" + i, model: "sphere", ...pos(f), z: 4, w: 7, h: 7, d: 7, color: "#ffe066", bob: 1.5 }));
    const flicker = this.invuln > 0 && Math.floor(this.time * 12) % 2 === 0;
    if (!flicker) {
      const n = this.snake.length;
      this.snake.forEach((c, i) => {
        const p = pos(c);
        if (i === 0) {
          const v = DIR_VEC[this.dir];
          items.push({ key: "sh", model: "snake/hlava", ...p, w: C * 1.4, rot: -Math.atan2(v.y, v.x) + Math.PI });
          return;
        }
        const prev = this.snake[i - 1];
        const next = this.snake[i + 1];
        if (!next) {
          items.push({ key: "st", model: "snake/ocas", ...p, w: C * 1.05, rot: -Math.atan2(prev.y - c.y, prev.x - c.x) });
          return;
        }
        const straight = prev.x - c.x === c.x - next.x && prev.y - c.y === c.y - next.y;
        if (straight) items.push({ key: "s" + i, model: "snake/telo", ...p, w: C * 1.1, rot: prev.y !== c.y ? Math.PI / 2 : 0 });
        else items.push({ key: "s" + i, model: "sphere", ...p, z: 0, w: C * 0.8, h: C * 0.7, d: C * 0.8, color: "#35b36b" });
        void n;
      });
    }
    for (const [i, a] of this.apples.entries()) {
      if (!a.alive) continue;
      items.push({ key: "a" + i, model: "snake/jablko_" + (APPLE_MODEL[a.color] ?? "cervene"), ...pos(a), w: C * 1.5, bob: 1.5, spin: 1, label: a.label, labelColor: a.color, labelW: 130 });
    }
    return { layout: "floor", items, ground: "#0e2a22", sky: "linear-gradient(180deg, #123a2c, #0a1f18)" };
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#0f2b1d";
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.035)";
          ctx.fillRect(x * C, OY + y * C, C, C);
        }
      }
    ctx.strokeStyle = "rgba(126,224,176,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, OY + 1, W - 2, ROWS * C - 2);

    for (const f of this.food) {
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.arc((f.x + 0.5) * C, OY + (f.y + 0.5) * C, 4 + Math.sin(this.time * 6 + f.x) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // had
    const flicker = this.invuln > 0 && Math.floor(this.time * 12) % 2 === 0;
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const c = this.snake[i];
      const t = 1 - i / Math.max(1, this.snake.length);
      ctx.globalAlpha = flicker ? 0.4 : 1;
      ctx.fillStyle = i === 0 ? "#4ade80" : `rgb(${40 + t * 50}, ${150 + t * 60}, ${90 + t * 30})`;
      ctx.beginPath();
      ctx.roundRect(c.x * C + 1, OY + c.y * C + 1, C - 2, C - 2, i === 0 ? 8 : 6);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const h = this.snake[0];
    if (h) {
      const v = DIR_VEC[this.dir];
      const cx = (h.x + 0.5) * C;
      const cy = OY + (h.y + 0.5) * C;
      for (const s of [-1, 1]) {
        const ex = cx + (v.x !== 0 ? v.x * 3 : s * 4);
        const ey = cy + (v.y !== 0 ? v.y * 3 : s * 4);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#16132b";
        ctx.beginPath();
        ctx.arc(ex + v.x, ey + v.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "800 13px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`🐍 ${this.snake.length}`, W - 8, OY + 16);

    // jablka s odpověďmi
    for (const a of this.apples) {
      if (!a.alive) continue;
      const ax = (a.x + 0.5) * C;
      const ay = OY + (a.y + 0.5) * C;
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(ax, ay + 1, 8 + Math.sin(this.time * 5) * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "#6b4423";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax, ay - 7);
      ctx.lineTo(ax + 2, ay - 12);
      ctx.stroke();
      const maxW = 140;
      const ly = a.y < 4 ? ay + 24 : ay - 24;
      const lx = Math.max(maxW / 2 + 3, Math.min(W - maxW / 2 - 3, ax));
      drawLabel(ctx, a.label, lx, ly, maxW, a.color, { alpha: 0.95 });
    }
  }
}
