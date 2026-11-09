import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import type { EngineCallbacks } from "./space-engine";

// Hledání min: hráč klepne na zakryté políčko, pak odpoví na otázku.
// Správná odpověď políčko odkryje (ukáže počet min v okolí; nula odkryje sousedy).
// Špatná odpověď nic nestojí, přijde další otázka, dokud není správná.
// Políčko s minou ubere život, když hráč odpoví správně (mina se odhalí).

const COLS = 5;
const ROWS = 5;
const MINES = 5;
const CELL = 58;
const GAP = 4;
const BOARD = COLS * CELL + (COLS - 1) * GAP;
const OX = (W - BOARD) / 2;
const OY = 14;
const ANS_Y = OY + BOARD + 26;
const ANS_W = 140;
const ANS_H = 56;
const ANS_GAP = 12;
const ANS_X0 = (W - (4 * ANS_W + 3 * ANS_GAP)) / 2;

const NUMBER_COLORS = ["", "#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#b45309", "#0891b2", "#111827", "#6b7280"];

type Cell = { mine: boolean; open: boolean; n: number };

export class MinesweeperEngine extends ArcadeEngine {
  private cells: Cell[] = [];
  private pending = -1;
  private options: string[] = [];
  private correct = -1;
  private struck: number[] = [];

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    super(canvas, cb);
  }

  protected questionTime() {
    // Čas na odpověď je dlouhý: hra nikoho netrestá za pomalé čtení.
    return 300;
  }

  // Nová hra: nové rozmístění min a všechna políčka zakrytá.
  newBoard() {
    const order = shuffleInPlace(Array.from({ length: COLS * ROWS }, (_, i) => i));
    const mines = new Set(order.slice(0, MINES));
    this.cells = Array.from({ length: COLS * ROWS }, (_, i) => ({ mine: mines.has(i), open: false, n: 0 }));
    this.cells.forEach((cell, i) => {
      cell.n = this.neighbors(i).filter((j) => this.cells[j].mine).length;
    });
    this.pending = -1;
    this.over = true;
  }

  // Hra je vyhraná, když jsou odkryta všechna políčka bez min.
  isCleared() {
    return this.cells.length > 0 && this.cells.every((c) => c.mine || c.open);
  }

  protected setup(options: string[], correctIndex: number) {
    if (this.cells.length === 0) this.newBoard();
    this.options = options;
    this.correct = correctIndex;
    this.struck = [];
  }

  // Nápověda 50:50 přeškrtne dvě špatné odpovědi.
  protected eliminate(indices: number[]) {
    this.struck = indices;
  }

  private neighbors(i: number): number[] {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const c = col + dc;
        const r = row + dr;
        if (c >= 0 && c < COLS && r >= 0 && r < ROWS) out.push(r * COLS + c);
      }
    }
    return out;
  }

  private cellRect(i: number) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return { x: OX + col * (CELL + GAP), y: OY + row * (CELL + GAP), w: CELL, h: CELL };
  }

  private cellAt(x: number, y: number): number {
    for (let i = 0; i < this.cells.length; i++) {
      const r = this.cellRect(i);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
    return -1;
  }

  private answerRect(k: number) {
    return { x: ANS_X0 + k * (ANS_W + ANS_GAP), y: ANS_Y, w: ANS_W, h: ANS_H };
  }

  private inside(x: number, y: number, r: { x: number; y: number; w: number; h: number }) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  protected onTap(x: number, y: number) {
    // Otázka je aktivní: klepnutí patří odpovědím.
    if (!this.over) {
      if (this.pending < 0) return;
      for (let k = 0; k < this.options.length; k++) {
        if (this.struck.includes(k)) continue;
        if (this.inside(x, y, this.answerRect(k))) {
          if (k === this.correct) this.win(k);
          else this.wrong(k);
          return;
        }
      }
      return;
    }
    // Žádná otázka: klepnutí na zakryté políčko vyvolá otázku pro něj.
    const i = this.cellAt(x, y);
    if (i < 0 || this.cells[i].open) return;
    this.pending = i;
    this.cb.onPick?.(i);
  }

  // Správná odpověď: políčko se odkryje; nula odhalí souvislou oblast bez min.
  protected win(index: number) {
    if (this.over || this.pending < 0) return;
    const i = this.pending;
    const cell = this.cells[i];
    cell.open = true;
    if (cell.mine) {
      this.over = true;
      const r = this.cellRect(i);
      this.burst(r.x + r.w / 2, r.y + r.h / 2, "#ff5d73", 26);
      this.damage();
      return;
    }
    if (cell.n === 0) this.flood(i);
    super.win(index);
  }

  private flood(start: number) {
    const stack = [start];
    while (stack.length > 0) {
      const i = stack.pop()!;
      for (const j of this.neighbors(i)) {
        const c = this.cells[j];
        if (c.open || c.mine) continue;
        c.open = true;
        if (c.n === 0) stack.push(j);
      }
    }
  }

  protected update(_dt: number) {
    void _dt;
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1e2a4a");
    g.addColorStop(1, "#0d1224");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    this.cells.forEach((cell, i) => {
      const r = this.cellRect(i);
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.w, r.h, 8);
      if (!cell.open) {
        ctx.fillStyle = "#4b5a8a";
        ctx.fill();
        ctx.fillStyle = "#6f7fb3";
        ctx.fillRect(r.x + 4, r.y + 4, r.w - 8, 5);
      } else if (cell.mine) {
        ctx.fillStyle = "#ff5d73";
        ctx.fill();
      } else {
        ctx.fillStyle = "#e9edf7";
        ctx.fill();
      }

      if (i === this.pending && !this.over) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffe066";
        ctx.stroke();
      }

      if (cell.open) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (cell.mine) {
          ctx.font = "28px system-ui, sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText("💣", r.x + r.w / 2, r.y + r.h / 2 + 2);
        } else if (cell.n > 0) {
          ctx.font = "800 30px system-ui, sans-serif";
          ctx.fillStyle = NUMBER_COLORS[cell.n];
          ctx.fillText(String(cell.n), r.x + r.w / 2, r.y + r.h / 2 + 2);
        }
      }
    });

    if (!this.over && this.options.length > 0) {
      this.options.forEach((text, k) => {
        const r = this.answerRect(k);
        const struck = this.struck.includes(k);
        ctx.save();
        ctx.globalAlpha = struck ? 0.25 : 1;
        drawLabel(ctx, text, r.x + r.w / 2, r.y + r.h / 2, r.w, ANSWER_COLORS[k % ANSWER_COLORS.length], { height: r.h, size: 16 });
        ctx.restore();
      });
    }
  }
}
