import { ANSWER_COLORS, ArcadeEngine, DIR_VEC, H, OPPOSITE, W, drawLabel, shuffleInPlace, type Dir } from "./arcade-base";
import { sfx } from "./game-fx";

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
