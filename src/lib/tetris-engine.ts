import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";

const COLS = 10;
const ROWS = 20;
const CELL = 19;
const BX = 22;
const BY = 20;
const PX = 236;
const GARBAGE = "#6b6f8a";

type Shape = number[][];
const SHAPES: { m: Shape; color: string }[] = [
  { m: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: "#4de3ff" },
  { m: [[1, 1], [1, 1]], color: "#ffe14d" },
  { m: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "#b36bff" },
  { m: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "#4ade80" },
  { m: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "#ff5d73" },
  { m: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: "#5a8bff" },
  { m: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: "#ffb020" },
];

type Piece = { m: Shape; color: string; x: number; y: number };
type Option = { label: string; correct: boolean; index: number; used: boolean; rect: { x: number; y: number; w: number; h: number } };

function rotate(m: Shape): Shape {
  const n = m.length;
  return m.map((_, y) => m.map((__, x) => m[n - 1 - x][y]));
}

export class TetrisEngine extends ArcadeEngine {
  private board: (string | null)[][] = [];
  private piece: Piece | null = null;
  private next: { m: Shape; color: string } = SHAPES[0];
  private bag: number[] = [];
  private fall = 0;
  private repeat = { left: 0, right: 0 };
  private options: Option[] = [];
  private clearing: { rows: number[]; t: number } | null = null;
  private digit = (e: KeyboardEvent) => {
    if (!this.running || this.over) return;
    const m = /^(?:Digit|Numpad)([1-4])$/.exec(e.code);
    if (m) this.choose(Number(m[1]) - 1);
  };

  constructor(canvas: HTMLCanvasElement, cb: ConstructorParameters<typeof ArcadeEngine>[1]) {
    super(canvas, cb);
    window.addEventListener("keydown", this.digit);
  }

  destroy() {
    window.removeEventListener("keydown", this.digit);
    super.destroy();
  }

  protected questionTime() {
    return 90;
  }

  protected usesSwipe() {
    return false;
  }

  private nextShape() {
    if (this.bag.length === 0) this.bag = shuffleInPlace([0, 1, 2, 3, 4, 5, 6]);
    return SHAPES[this.bag.pop()!];
  }

  protected setup(options: string[], correctIndex: number) {
    this.board = Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
    this.clearing = null;
    this.fall = 0;
    this.repeat = { left: 0, right: 0 };
    this.bag = [];
    this.piece = null;
    this.options = [];
    if (options.length === 0) return;
    for (let i = 0; i < 3; i++) this.addGarbage();
    this.next = this.nextShape();
    this.spawn();
    const order = shuffleInPlace(options.map((_, i) => i));
    const h = 64;
    const gap = 8;
    this.options = order.map((optIndex, k) => ({
      label: options[optIndex],
      correct: optIndex === correctIndex,
      index: optIndex,
      used: false,
      rect: { x: PX, y: 112 + k * (h + gap), w: W - PX - 18, h },
    }));
  }

  private addGarbage(): boolean {
    const topOccupied = this.board[0].some((c) => c !== null);
    this.board.shift();
    const hole = Math.floor(Math.random() * COLS);
    const hole2 = Math.random() < 0.4 ? Math.floor(Math.random() * COLS) : hole;
    this.board.push(Array.from({ length: COLS }, (_, x) => (x === hole || x === hole2 ? null : GARBAGE)));
    return !topOccupied;
  }

  private fits(m: Shape, x: number, y: number) {
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue;
        const bx = x + c;
        const by = y + r;
        if (bx < 0 || bx >= COLS || by >= ROWS) return false;
        if (by >= 0 && this.board[by][bx]) return false;
      }
    return true;
  }

  private spawn() {
    const s = this.next;
    this.next = this.nextShape();
    const p: Piece = { m: s.m, color: s.color, x: Math.floor((COLS - s.m.length) / 2), y: s.m.length === 4 ? -1 : 0 };
    if (!this.fits(p.m, p.x, p.y)) {
      this.piece = null;
      this.topOut();
      return;
    }
    this.piece = p;
    this.fall = 0;
  }

  private topOut() {
    this.damage();
    for (let y = 0; y < ROWS - 3; y++) this.board[y] = Array<string | null>(COLS).fill(null);
    this.spawn();
  }

  private move(dx: number) {
    const p = this.piece;
    if (p && this.fits(p.m, p.x + dx, p.y)) {
      p.x += dx;
      return true;
    }
    return false;
  }

  private rotatePiece() {
    const p = this.piece;
    if (!p) return;
    const r = rotate(p.m);
    for (const k of [0, -1, 1, -2, 2]) {
      if (this.fits(r, p.x + k, p.y)) {
        p.m = r;
        p.x += k;
        sfx("tick");
        return;
      }
    }
  }

  private lock() {
    const p = this.piece;
    if (!p) return;
    for (let r = 0; r < p.m.length; r++)
      for (let c = 0; c < p.m[r].length; c++)
        if (p.m[r][c] && p.y + r >= 0) this.board[p.y + r][p.x + c] = p.color;
    this.piece = null;
    const rows: number[] = [];
    for (let y = 0; y < ROWS; y++) if (this.board[y].every((c) => c !== null)) rows.push(y);
    if (rows.length) {
      this.clearing = { rows, t: 0.22 };
      sfx("stomp");
      this.popText(rows.length >= 4 ? "TETRIS!" : `+${rows.length}`, "#ffe066", BX + (COLS * CELL) / 2, BY + rows[0] * CELL);
    } else {
      sfx("land");
      this.spawn();
    }
  }

  private finishClear() {
    const c = this.clearing;
    if (!c) return;
    for (const y of c.rows) {
      this.board.splice(y, 1);
      this.board.unshift(Array<string | null>(COLS).fill(null));
    }
    this.clearing = null;
    this.spawn();
  }

  private hardDrop() {
    const p = this.piece;
    if (!p) return;
    while (this.fits(p.m, p.x, p.y + 1)) p.y += 1;
    this.lock();
  }

  protected onTap(x: number, y: number) {
    if (this.over) return;
    this.options.forEach((o, i) => {
      if (!o.used && x >= o.rect.x && x <= o.rect.x + o.rect.w && y >= o.rect.y && y <= o.rect.y + o.rect.h) this.choose(i);
    });
  }

  private choose(i: number) {
    const o = this.options[i];
    if (!o || o.used || this.over) return;
    o.used = true;
    if (o.correct) {
      // Odměna: spodní tři řádky zmizí.
      for (let k = 0; k < 3; k++) {
        this.board.pop();
        this.board.unshift(Array<string | null>(COLS).fill(null));
      }
      this.burst(BX + (COLS * CELL) / 2, BY + ROWS * CELL - 30, ANSWER_COLORS[i % ANSWER_COLORS.length], 30);
      this.win(o.index);
    } else {
      this.wrong(o.index);
      if (!this.addGarbage()) this.topOut();
      if (this.piece && !this.fits(this.piece.m, this.piece.x, this.piece.y)) this.piece.y -= 1;
    }
  }

  protected update(dt: number) {
    if (this.clearing) {
      this.clearing.t -= dt;
      if (this.clearing.t <= 0) this.finishClear();
      return;
    }
    const p = this.piece;
    if (!p) return;
    const ctrl = this.moveMul();
    if (this.consume("up")) this.rotatePiece();
    if (this.consume("fire")) {
      this.hardDrop();
      return;
    }
    for (const side of ["left", "right"] as const) {
      const dx = side === "left" ? -1 : 1;
      if (this.consume(side)) {
        this.move(dx);
        this.repeat[side] = 0.2 / ctrl;
      } else if (this.input[side]) {
        this.repeat[side] -= dt;
        if (this.repeat[side] <= 0) {
          this.move(dx);
          this.repeat[side] = 0.065 / ctrl;
        }
      }
    }
    const interval = Math.max(0.07, 0.8 / this.pace());
    this.fall += dt * (this.input.down ? 12 : 1);
    while (this.fall >= interval) {
      this.fall -= interval;
      if (this.fits(p.m, p.x, p.y + 1)) p.y += 1;
      else {
        this.lock();
        return;
      }
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#14123a");
    g.addColorStop(1, "#0a0a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // hrací plocha
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(BX - 3, BY - 3, COLS * CELL + 6, ROWS * CELL + 6);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(BX - 3, BY - 3, COLS * CELL + 6, ROWS * CELL + 6);
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const c = this.board[y]?.[x];
        if (c) this.cell(ctx, BX + x * CELL, BY + y * CELL, c);
      }
    if (this.clearing) {
      ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(this.time * 40) * 0.3})`;
      for (const y of this.clearing.rows) ctx.fillRect(BX, BY + y * CELL, COLS * CELL, CELL);
    }
    const p = this.piece;
    if (p && !this.over) {
      let gy = p.y;
      while (this.fits(p.m, p.x, gy + 1)) gy += 1;
      for (let r = 0; r < p.m.length; r++)
        for (let c = 0; c < p.m[r].length; c++) {
          if (!p.m[r][c]) continue;
          if (gy + r >= 0) {
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(BX + (p.x + c) * CELL + 1.5, BY + (gy + r) * CELL + 1.5, CELL - 3, CELL - 3);
          }
          if (p.y + r >= 0) this.cell(ctx, BX + (p.x + c) * CELL, BY + (p.y + r) * CELL, p.color);
        }
    }

    // další kostka
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.roundRect(PX, 20, 120, 80, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("NEXT", PX + 8, 34);
    const nm = this.next.m;
    const ox = PX + 60 - (nm[0].length * 16) / 2;
    for (let r = 0; r < nm.length; r++)
      for (let c = 0; c < nm[r].length; c++) if (nm[r][c]) this.cell(ctx, ox + c * 16, 46 + r * 16, this.next.color, 16);

    // odpovědi
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("1–4 / tap", PX + 140, 34);
    this.options.forEach((o, i) => {
      const color = ANSWER_COLORS[i % ANSWER_COLORS.length];
      ctx.globalAlpha = o.used ? 0.28 : 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(o.rect.x, o.rect.y, o.rect.w, o.rect.h, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(o.rect.x + 22, o.rect.y + o.rect.h / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), o.rect.x + 22, o.rect.y + o.rect.h / 2 + 1);
      drawLabel(ctx, o.label, o.rect.x + 46 + (o.rect.w - 54) / 2, o.rect.y + o.rect.h / 2, o.rect.w - 54, "rgba(0,0,0,0.22)", { height: o.rect.h - 18, size: 19 });
      ctx.globalAlpha = 1;
    });
    ctx.textBaseline = "alphabetic";
  }

  private cell(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = CELL) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(x + 1, y + 1, size - 2, 3);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + 1, y + size - 4, size - 2, 3);
  }
}
