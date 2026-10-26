import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const COLOR_FRAME: Record<string, string> = {
  "#4de3ff": "i",
  "#ffe14d": "o",
  "#b36bff": "t",
  "#4ade80": "s",
  "#ff5d73": "z",
  "#5a8bff": "j",
  "#ffb020": "l",
  "#6b6f8a": "smeti",
};

const COLS = 10;
const ROWS = 20;
const CELL = 19;
const BX = 22;
const BY = 20;
const PX = 236;
const GARBAGE: string = "#6b6f8a";

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
// Odpovědi jsou drahokamy zabudované do řádků na dně: vymaž řádek se správným drahokamem.
// Políčko drahokamu je v poli zapsané jako "g<index odpovědi>".
type Option = { label: string; correct: boolean; index: number };

function rotate(m: Shape): Shape {
  const n = m.length;
  return m.map((_, y) => m.map((__, x) => m[n - 1 - x][y]));
}

export class TetrisEngine extends ArcadeEngine {
  private sp = new Sprites("tetris");
  private board: (string | null)[][] = [];
  private piece: Piece | null = null;
  private next: { m: Shape; color: string } = SHAPES[0];
  private bag: number[] = [];
  private fall = 0;
  private repeat = { left: 0, right: 0 };
  private options: Option[] = [];
  private pendingGarbage = 0;
  private clearing: { rows: number[]; t: number } | null = null;
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
    this.pendingGarbage = 0;
    if (options.length === 0) return;
    this.options = options.map((label, i) => ({ label, correct: i === correctIndex, index: i }));
    // Zespodu: drahokamový řádek, prázdný řádek, … Díra se v řádcích posouvá o jedno políčko,
    // takže jde zalepit kostkami shora.
    const order = shuffleInPlace(options.map((_, i) => i));
    let hole = Math.floor(Math.random() * COLS);
    let row = ROWS - 1;
    for (let k = 0; k < order.length; k++) {
      for (let g = 0; g < 2 && row >= 0; g++, row--) {
        hole = Math.max(0, Math.min(COLS - 3, hole + Math.floor(Math.random() * 3) - 1));
        // Čím snazší obtížnost, tím širší mezera v řádku, takže jde zaplnit jednou kostkou.
        const holeW = this.config.alienSpeedFactor <= 0.7 ? 3 : this.config.alienSpeedFactor <= 0.92 ? 2 : 1;
        const line = Array.from({ length: COLS }, (_, x) => (x >= hole && x < hole + holeW ? null : GARBAGE));
        if (g === 0) {
          let gx = Math.floor(Math.random() * COLS);
          while (gx >= hole - 1 && gx <= hole + holeW) gx = (gx + 3) % COLS;
          line[gx] = "g" + order[k];
        }
        this.board[row] = line;
      }
    }
    this.next = this.nextShape();
    this.spawn();
  }

  // Nápověda 50:50: drahokam špatné odpovědi se změní na obyčejnou kostku.
  protected eliminate(indices: number[]) {
    for (const i of indices) {
      const o = this.options[i];
      if (!o || o.correct) continue;
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++)
          if (this.board[y][x] === "g" + i) {
            this.board[y][x] = GARBAGE;
            this.burst(BX + x * CELL + CELL / 2, BY + y * CELL + CELL / 2, ANSWER_COLORS[i % ANSWER_COLORS.length], 12);
          }
      this.options[i] = { ...o, label: "" };
    }
    sfx("pickup");
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
      if (this.collectGems(rows)) return;
      sfx("stomp");
      this.popText(rows.length >= 4 ? "TETRIS!" : `+${rows.length}`, "#ffe066", BX + (COLS * CELL) / 2, BY + rows[0] * CELL);
    } else {
      sfx("land");
      this.spawn();
    }
  }

  // Vymazaný řádek s drahokamem = zvolená odpověď. Vrací true, když to byla správná (otázka končí).
  private collectGems(rows: number[]): boolean {
    for (const y of rows) {
      for (const cell of this.board[y]) {
        if (typeof cell !== "string" || cell[0] !== "g") continue;
        const idx = Number(cell.slice(1));
        const o = this.options[idx];
        if (!o) continue;
        const color = ANSWER_COLORS[idx % ANSWER_COLORS.length];
        this.burst(BX + (COLS * CELL) / 2, BY + y * CELL, color, 28);
        if (o.correct) {
          this.win(o.index);
          return true;
        }
        this.wrong(o.index);
        this.pendingGarbage += 1;
      }
    }
    return false;
  }

  private finishClear() {
    const c = this.clearing;
    if (!c) return;
    for (const y of c.rows) {
      this.board.splice(y, 1);
      this.board.unshift(Array<string | null>(COLS).fill(null));
    }
    this.clearing = null;
    while (this.pendingGarbage > 0) {
      this.pendingGarbage -= 1;
      if (!this.addGarbage()) {
        this.topOut();
        return;
      }
    }
    this.spawn();
  }

  private hardDrop() {
    const p = this.piece;
    if (!p) return;
    while (this.fits(p.m, p.x, p.y + 1)) p.y += 1;
    this.lock();
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
        if (!c) continue;
        if (c[0] === "g") this.gem(ctx, BX + x * CELL, BY + y * CELL, Number(c.slice(1)));
        else this.cell(ctx, BX + x * CELL, BY + y * CELL, c);
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

    // odpovědi: popisek vedle řádku s příslušným drahokamem, sleduje ho při propadávání
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("◆ = odpověď", PX + 140, 34);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "600 11px system-ui, sans-serif";
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = this.board[y]?.[x];
        if (!c || c[0] !== "g") continue;
        const idx = Number(c.slice(1));
        const o = this.options[idx];
        if (!o) continue;
        const cy = BY + y * CELL + CELL / 2;
        const color = ANSWER_COLORS[idx % ANSWER_COLORS.length];
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(BX + COLS * CELL + 4, cy);
        ctx.lineTo(PX + 6, cy);
        ctx.stroke();
        ctx.globalAlpha = 1;
        drawLabel(ctx, o.label, PX + 10 + 170 / 2, cy, 170, color, { height: 18, size: 13 });
      }
    }
    ctx.textBaseline = "alphabetic";
  }

  private gem(ctx: CanvasRenderingContext2D, x: number, y: number, idx: number) {
    if (this.sp.draw(ctx, "kostky", "drahokam_" + (idx + 1), x + CELL / 2, y + CELL / 2, CELL, CELL)) return;
    const color = ANSWER_COLORS[idx % ANSWER_COLORS.length];
    ctx.fillStyle = GARBAGE;
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    const cx = x + CELL / 2;
    const cy = y + CELL / 2;
    const pulse = 1 + Math.sin(this.time * 5 + idx) * 0.08;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8 * pulse);
    ctx.lineTo(cx + 8 * pulse, cy);
    ctx.lineTo(cx, cy + 8 * pulse);
    ctx.lineTo(cx - 8 * pulse, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private cell(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = CELL) {
    const frame = COLOR_FRAME[color];
    if (frame && this.sp.draw(ctx, "kostky", frame, x + size / 2, y + size / 2, size, size)) return;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(x + 1, y + 1, size - 2, 3);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + 1, y + size - 4, size - 2, 3);
  }
}
