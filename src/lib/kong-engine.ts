import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";

// Patra: 0 je země, 4 je horní patro se dveřmi s odpověďmi.
const LEVEL_Y = [398, 322, 246, 170, 94];
const SPANS: [number, number][] = [
  [0, W],
  [0, 540],
  [100, W],
  [0, 540],
  [0, W],
];
const LADDERS: { x: number; from: number }[] = [
  { x: 500, from: 0 },
  { x: 150, from: 1 },
  { x: 470, from: 2 },
  { x: 60, from: 3 },
];
const PLAYER_W = 16;
const PLAYER_H = 26;
const START_X = 30;
const GRAVITY = 1150;

type Door = { x: number; w: number; label: string; correct: boolean; alive: boolean; index: number; color: string };
type Barrel = { x: number; y: number; vy: number; level: number; dir: number; falling: boolean; rot: number; jumped: boolean };

export class KongEngine extends ArcadeEngine {
  private px = START_X;
  private py = LEVEL_Y[0];
  private vy = 0;
  private level = 0; // patro, na kterém hráč stojí
  private onGround = true;
  private climbing: { x: number; from: number } | null = null;
  private facing = 1;
  private invuln = 0;
  private doors: Door[] = [];
  private barrels: Barrel[] = [];
  private spawn = 1.5;

  protected questionTime() {
    return 90;
  }

  protected usesSwipe() {
    return false;
  }

  protected setup(options: string[], correctIndex: number) {
    this.px = START_X;
    this.py = LEVEL_Y[0];
    this.vy = 0;
    this.level = 0;
    this.onGround = true;
    this.climbing = null;
    this.invuln = 0;
    this.barrels = [];
    this.spawn = 1.8;
    this.doors = [];
    if (options.length === 0) return;
    const order = shuffleInPlace(options.map((_, i) => i));
    const n = order.length;
    const w = 104;
    const start = 130;
    const gap = (540 - start - w * n) / Math.max(1, n - 1) + 0;
    this.doors = order.map((optIndex, k) => ({
      x: start + k * (w + gap),
      w,
      label: options[optIndex],
      correct: optIndex === correctIndex,
      alive: true,
      index: optIndex,
      color: ANSWER_COLORS[k % ANSWER_COLORS.length],
    }));
  }

  private spanOk(level: number, x: number) {
    const [a, b] = SPANS[level];
    return x >= a - 4 && x <= b + 4;
  }

  private ladderAt(x: number, fromLevel: number) {
    return LADDERS.find((l) => l.from === fromLevel && Math.abs(l.x - x) < 14);
  }

  protected update(dt: number) {
    this.invuln = Math.max(0, this.invuln - dt);
    const speed = 105 * this.moveMul();

    // --- hráč ---
    if (this.climbing) {
      const l = this.climbing;
      const climbSpeed = 78 * this.moveMul();
      if (this.input.up) this.py -= climbSpeed * dt;
      else if (this.input.down) this.py += climbSpeed * dt;
      this.px = l.x;
      const top = LEVEL_Y[l.from + 1];
      const bottom = LEVEL_Y[l.from];
      if (this.py <= top) {
        this.py = top;
        this.level = l.from + 1;
        this.climbing = null;
        this.onGround = true;
      } else if (this.py >= bottom) {
        this.py = bottom;
        this.level = l.from;
        this.climbing = null;
        this.onGround = true;
      }
    } else {
      let move = 0;
      if (this.input.left) move -= 1;
      if (this.input.right) move += 1;
      if (move !== 0) this.facing = move;
      this.px += move * speed * dt;
      this.px = Math.max(PLAYER_W / 2, Math.min(W - PLAYER_W / 2, this.px));

      if (this.onGround) {
        if (!this.spanOk(this.level, this.px)) {
          this.onGround = false;
          this.vy = 0;
        }
        if (this.consume("fire")) {
          this.vy = -400;
          this.onGround = false;
          sfx("jump");
        }
        // žebřík nahoru
        if (this.input.up) {
          const l = this.ladderAt(this.px, this.level);
          if (l) {
            this.climbing = l;
            this.px = l.x;
            this.onGround = false;
          }
        } else if (this.input.down && this.level > 0) {
          const l = this.ladderAt(this.px, this.level - 1);
          if (l) {
            this.climbing = l;
            this.px = l.x;
            this.onGround = false;
            this.py += 2;
          }
        }
      } else if (!this.climbing) {
        this.vy += GRAVITY * dt;
        const prev = this.py;
        this.py += this.vy * dt;
        if (this.vy >= 0) {
          for (let lv = LEVEL_Y.length - 1; lv >= 0; lv--) {
            if (!this.spanOk(lv, this.px)) continue;
            if (prev <= LEVEL_Y[lv] + 1 && this.py >= LEVEL_Y[lv]) {
              this.py = LEVEL_Y[lv];
              this.vy = 0;
              this.level = lv;
              this.onGround = true;
              sfx("land");
              break;
            }
          }
        }
        if (this.py > H + 40) this.respawn(false);
      }
      this.consume("fire");
    }

    // --- sudy ---
    this.spawn -= dt;
    if (this.spawn <= 0) {
      this.spawn = Math.max(1.1, 2.6 / this.pace()) * (0.8 + Math.random() * 0.5);
      this.barrels.push({ x: W - 36, y: LEVEL_Y[4], vy: 0, level: 4, dir: -1, falling: false, rot: 0, jumped: false });
    }
    const bspeed = 78 * this.pace();
    for (const b of this.barrels) {
      b.rot += b.dir * dt * 6;
      if (!b.falling) {
        b.x += b.dir * bspeed * dt;
        if (!this.spanOk(b.level, b.x) && b.level > 0) {
          b.falling = true;
          b.vy = 0;
        }
      } else {
        b.vy += GRAVITY * 0.7 * dt;
        b.y += b.vy * dt;
        const target = LEVEL_Y[b.level - 1];
        if (b.y >= target) {
          b.y = target;
          b.level -= 1;
          b.falling = false;
          b.dir = -b.dir;
        }
      }
      // skok přes sud
      if (!b.jumped && Math.abs(b.x - this.px) < 12 && this.py < b.y - 14 && this.py > b.y - 70 && this.level === b.level) {
        b.jumped = true;
        this.popText("+", "#7ee0b0", this.px, this.py - 34);
      }
    }
    this.barrels = this.barrels.filter((b) => b.x > -30 && b.x < W + 30 && b.y < H + 40);

    // --- kolize se sudy ---
    if (this.invuln <= 0) {
      for (const b of this.barrels) {
        const dx = Math.abs(b.x - this.px);
        const dy = b.y - 9 - (this.py - PLAYER_H / 2);
        if (dx < 14 && Math.abs(dy) < 17) {
          this.damage();
          this.burst(this.px, this.py - 10, "#ffb020", 20);
          this.respawn(true);
          return;
        }
      }
    }

    // --- dveře ---
    if (this.level === 4 && this.onGround) {
      for (const d of this.doors) {
        if (!d.alive) continue;
        if (this.px > d.x + 6 && this.px < d.x + d.w - 6) {
          const cx = d.x + d.w / 2;
          if (d.correct) {
            this.burst(cx, LEVEL_Y[4] - 22, d.color, 30);
            this.win(d.index);
            return;
          }
          d.alive = false;
          this.burst(cx, LEVEL_Y[4] - 22, "#ff5d73", 20);
          this.wrong(d.index);
        }
      }
    }
  }

  private respawn(keepBarrels: boolean) {
    this.px = START_X;
    this.py = LEVEL_Y[0];
    this.vy = 0;
    this.level = 0;
    this.onGround = true;
    this.climbing = null;
    this.invuln = 2;
    if (!keepBarrels) this.barrels = [];
    else this.barrels = this.barrels.filter((b) => Math.hypot(b.x - START_X, b.y - LEVEL_Y[0]) > 120);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1a1440");
    g.addColorStop(1, "#0b0a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // žebříky
    for (const l of LADDERS) {
      const top = LEVEL_Y[l.from + 1];
      const bottom = LEVEL_Y[l.from];
      ctx.strokeStyle = "#7ee0ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(l.x - 8, top);
      ctx.lineTo(l.x - 8, bottom);
      ctx.moveTo(l.x + 8, top);
      ctx.lineTo(l.x + 8, bottom);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let y = top + 8; y < bottom; y += 12) {
        ctx.beginPath();
        ctx.moveTo(l.x - 8, y);
        ctx.lineTo(l.x + 8, y);
        ctx.stroke();
      }
    }
    // nosníky
    SPANS.forEach(([a, b], i) => {
      const y = LEVEL_Y[i];
      ctx.fillStyle = "#e0523a";
      ctx.fillRect(a, y, b - a, 9);
      ctx.fillStyle = "#ff8a6b";
      for (let x = a + 4; x < b; x += 24) ctx.fillRect(x, y + 3, 12, 3);
    });

    // gorila nahoře vpravo
    this.drawKong(ctx, W - 40, LEVEL_Y[4]);

    // dveře
    for (const d of this.doors) {
      if (!d.alive) continue;
      const y = LEVEL_Y[4] - 52;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.roundRect(d.x, y, d.w, 52, [14, 14, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawLabel(ctx, d.label, d.x + d.w / 2, y + 26, d.w - 6, "rgba(0,0,0,0.25)", { height: 38, size: 17 });
    }

    // sudy
    for (const b of this.barrels) {
      ctx.save();
      ctx.translate(b.x, b.y - 9);
      ctx.rotate(b.rot);
      ctx.fillStyle = "#b8742f";
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5c3512";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();
      ctx.restore();
    }

    // hráč
    if (!(this.invuln > 0 && Math.floor(this.time * 10) % 2 === 0)) this.drawPlayer(ctx);
  }

  private drawKong(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const b = Math.sin(this.time * 4) * 2;
    ctx.fillStyle = "#7a4b2a";
    ctx.beginPath();
    ctx.ellipse(x, y - 24 + b, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c79a6b";
    ctx.beginPath();
    ctx.ellipse(x, y - 18 + b, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a4b2a";
    ctx.beginPath();
    ctx.arc(x, y - 52 + b, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8c9a0";
    ctx.beginPath();
    ctx.ellipse(x, y - 49 + b, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#16132b";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + s * 5, y - 56 + b, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const x = this.px;
    const y = this.py;
    const step = this.climbing ? Math.sin(this.py * 0.4) : Math.sin(this.time * 14) * (this.input.left || this.input.right ? 1 : 0);
    ctx.save();
    ctx.translate(x, y);
    // nohy
    ctx.fillStyle = "#2f4ac8";
    ctx.fillRect(-6, -10, 5, 10 + step * 2);
    ctx.fillRect(1, -10, 5, 10 - step * 2);
    // tělo
    ctx.fillStyle = "#e5484d";
    ctx.fillRect(-7, -20, 14, 12);
    // hlava
    ctx.fillStyle = "#ffd1a8";
    ctx.beginPath();
    ctx.arc(0, -25, 6, 0, Math.PI * 2);
    ctx.fill();
    // čepice
    ctx.fillStyle = "#e5484d";
    ctx.fillRect(-7, -31, 14, 4);
    ctx.fillRect(this.facing > 0 ? 0 : -9, -28, 9, 3);
    ctx.fillStyle = "#16132b";
    ctx.beginPath();
    ctx.arc(this.facing * 2.5, -25, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
