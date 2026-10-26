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
};

// Hrací plocha: 12 sloupců ve čtyřech zónách po třech. Dole jsou čtyři přistávací plochy s odpověďmi
// (vyvýšená podlaha, na kterou kostka dosedne). Kostka se zamkne tam, kam dopadne, a zóna, ve které
// přistála, je zvolená odpověď.
const COLS = 12;
const ROWS = 15;
const FLOOR = 2;
const CELL = 26;
const BX = 18;
const BY = 12;
const ZONES = 4;
const ZONE_W = COLS / ZONES;
const PX = 354;

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
type Zone = { label: string; index: number; correct: boolean; closed: boolean; hit: number };

function rotate(m: Shape): Shape {
  const n = m.length;
  return m.map((_, y) => m.map((__, x) => m[n - 1 - x][y]));
}

// Kostkový kvíz: pohybuj, otáčej a shoď kostku tak, aby dosedla na plochu se správnou odpovědí.
// Zóna pod kostkou se zvýrazňuje už za letu, takže je vidět, kam to dopadne. Špatná odpověď ubere
// život a plocha se zavře, správná ukončí otázku.
export class TetrisEngine extends ArcadeEngine {
  private sp = new Sprites("tetris");
  private piece: Piece | null = null;
  private next: { m: Shape; color: string } = SHAPES[0];
  private bag: number[] = [];
  private fall = 0;
  private repeat = { left: 0, right: 0 };
  private zones: Zone[] = [];
  private landed: Piece | null = null;
  private pause = 0;

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
    this.fall = 0;
    this.repeat = { left: 0, right: 0 };
    this.bag = [];
    this.piece = null;
    this.landed = null;
    this.pause = 0;
    this.zones = [];
    if (options.length === 0) return;
    const order = shuffleInPlace(options.map((_, i) => i));
    this.zones = order.slice(0, ZONES).map((optIndex) => ({
      label: options[optIndex],
      index: optIndex,
      correct: optIndex === correctIndex,
      closed: false,
      hit: 0,
    }));
    this.next = this.nextShape();
    this.spawn();
  }

  // Nápověda 50:50: špatné plochy se zavřou.
  protected eliminate(indices: number[]) {
    this.zones.forEach((z, i) => {
      if (z.correct || z.closed || !indices.includes(z.index)) return;
      z.closed = true;
      this.burst(this.zoneCenterX(i), this.floorTop(), ANSWER_COLORS[i % ANSWER_COLORS.length], 14);
    });
    sfx("pickup");
  }

  private zoneCenterX(zone: number) {
    return BX + (zone * ZONE_W + ZONE_W / 2) * CELL;
  }

  private floorTop() {
    return BY + (ROWS - FLOOR) * CELL;
  }

  private fits(m: Shape, x: number, y: number) {
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue;
        const bx = x + c;
        const by = y + r;
        if (bx < 0 || bx >= COLS || by >= ROWS - FLOOR) return false;
      }
    return true;
  }

  private spawn() {
    const s = this.next;
    this.next = this.nextShape();
    this.piece = { m: s.m, color: s.color, x: Math.floor((COLS - s.m.length) / 2), y: s.m.length === 4 ? -1 : 0 };
    this.fall = 0;
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

  private landingY(p: Piece) {
    let y = p.y;
    while (this.fits(p.m, p.x, y + 1)) y += 1;
    return y;
  }

  // Do které zóny kostka dopadne: podle sloupců jejího nejnižšího řádku.
  private zoneOf(p: Piece, y: number) {
    let low = -99;
    for (let r = 0; r < p.m.length; r++) if (p.m[r].some(Boolean)) low = Math.max(low, y + r);
    const cols: number[] = [];
    for (let r = 0; r < p.m.length; r++)
      if (y + r === low) for (let c = 0; c < p.m[r].length; c++) if (p.m[r][c]) cols.push(p.x + c);
    const avg = cols.reduce((a, b) => a + b, 0) / Math.max(1, cols.length);
    return Math.max(0, Math.min(ZONES - 1, Math.floor((avg + 0.5) / ZONE_W)));
  }

  private lock() {
    const p = this.piece;
    if (!p) return;
    p.y = this.landingY(p);
    const z = this.zoneOf(p, p.y);
    const zone = this.zones[z];
    this.piece = null;
    const cx = this.zoneCenterX(z);
    zone.hit = 0.5;
    if (zone.closed) {
      // zavřená plocha: kostka se jen odrazí a zmizí, nic se neděje
      this.burst(cx, this.floorTop(), "#9aa4c4", 10);
      sfx("land");
      this.landed = p;
      this.pause = 0.35;
      return;
    }
    if (zone.correct) {
      this.landed = p;
      this.burst(cx, this.floorTop(), ANSWER_COLORS[z % ANSWER_COLORS.length], 34);
      this.win(zone.index);
      return;
    }
    this.landed = p;
    zone.closed = true;
    this.burst(cx, this.floorTop(), "#ff5d73", 20);
    this.pause = 0.7;
    this.wrong(zone.index);
  }

  private hardDrop() {
    const p = this.piece;
    if (!p) return;
    p.y = this.landingY(p);
    this.lock();
  }

  protected update(dt: number) {
    for (const z of this.zones) z.hit = Math.max(0, z.hit - dt);
    if (this.pause > 0) {
      this.pause -= dt;
      if (this.pause <= 0) {
        this.landed = null;
        this.spawn();
      }
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
          this.repeat[side] = 0.07 / ctrl;
        }
      }
    }
    // Pád: pomalejší než klasický tetris, ať je čas přemýšlet nad odpovědí.
    const interval = Math.max(0.09, 0.62 / this.pace());
    this.fall += dt * (this.input.down ? 10 : 1);
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

    // zóna pod letící kostkou svítí, ať je vidět, kam dopadne
    const p = this.piece;
    const aim = p && !this.over ? this.zoneOf(p, this.landingY(p)) : -1;
    this.zones.forEach((z, i) => {
      const x = BX + i * ZONE_W * CELL;
      const color = ANSWER_COLORS[i % ANSWER_COLORS.length];
      ctx.fillStyle = z.closed ? "rgba(255,255,255,0.03)" : color;
      ctx.globalAlpha = z.closed ? 1 : i === aim ? 0.26 : 0.1;
      ctx.fillRect(x, BY, ZONE_W * CELL, (ROWS - FLOOR) * CELL);
      ctx.globalAlpha = 1;
      if (i > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, BY);
        ctx.lineTo(x, this.floorTop());
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // podlaha s odpovědí
      const fy = this.floorTop();
      const lift = Math.sin((z.hit / 0.5) * Math.PI) * 6;
      ctx.fillStyle = z.closed ? "#3a3d55" : color;
      ctx.globalAlpha = z.closed ? 0.9 : i === aim ? 1 : 0.8;
      ctx.beginPath();
      ctx.roundRect(x + 3, fy - lift, ZONE_W * CELL - 6, FLOOR * CELL, 8);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (i === aim && !z.closed) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      drawLabel(ctx, z.closed ? "✖" : z.label, x + (ZONE_W * CELL) / 2, fy + FLOOR * CELL * 0.5 - lift, ZONE_W * CELL - 12, "rgba(0,0,0,0.3)", {
        height: FLOOR * CELL - 12,
        size: 15,
        alpha: z.closed ? 0.6 : 1,
      });
    });

    // kostka, která dopadla (po správné odpovědi zůstane ležet)
    const drawPiece = (piece: Piece, y: number, alpha = 1) => {
      ctx.globalAlpha = alpha;
      for (let r = 0; r < piece.m.length; r++)
        for (let c = 0; c < piece.m[r].length; c++) if (piece.m[r][c] && y + r >= 0) this.cell(ctx, BX + (piece.x + c) * CELL, BY + (y + r) * CELL, piece.color);
      ctx.globalAlpha = 1;
    };
    if (this.landed) drawPiece(this.landed, this.landed.y, this.pause > 0 ? Math.max(0, this.pause / 0.7) : 1);
    if (p && !this.over) {
      const gy = this.landingY(p);
      for (let r = 0; r < p.m.length; r++)
        for (let c = 0; c < p.m[r].length; c++) {
          if (!p.m[r][c] || gy + r < 0) continue;
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(BX + (p.x + c) * CELL + 1.5, BY + (gy + r) * CELL + 1.5, CELL - 3, CELL - 3);
        }
      drawPiece(p, p.y);
    }

    // další kostka
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.roundRect(PX, 16, 120, 90, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("NEXT", PX + 8, 32);
    const nm = this.next.m;
    const size = 18;
    const ox = PX + 60 - (nm[0].length * size) / 2;
    for (let r = 0; r < nm.length; r++)
      for (let c = 0; c < nm[r].length; c++) if (nm[r][c]) this.cell(ctx, ox + c * size, 42 + r * size, this.next.color, size);

    // nápověda ovládání
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "600 12px system-ui, sans-serif";
    const tips = ["← →  posun", "↑  otočit", "↓  zrychlit", "mezerník  shodit"];
    tips.forEach((t, i) => ctx.fillText(t, PX + 6, 140 + i * 20));
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
