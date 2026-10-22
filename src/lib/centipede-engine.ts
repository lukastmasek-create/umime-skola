import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";

const ROW0 = 56;
const ROW_H = 20;
const ROWS = 14; // řádky s houbami a stonožkou
const SEG_W = 76;
const SEG_H = 26;
const SPACING = 84;
const PLAYER_ZONE_Y = 340;
const SHOT_SPEED = 520;

type Seg = { label: string; correct: boolean; alive: boolean; index: number; color: string };
type Shot = { x: number; y: number };

export class CentipedeEngine extends ArcadeEngine {
  private segs: Seg[] = [];
  private mush: number[][] = [];
  private shots: Shot[] = [];
  private px = W / 2;
  private py = H - 26;
  private cool = 0;
  private invuln = 0;
  private hx = 0;
  private hy = ROW0;
  private dir = 1;
  private vdir = 1;
  private path: { x: number; y: number; d: number }[] = [];
  private headD = 0;

  protected questionTime() {
    return 75;
  }

  protected usesSwipe() {
    return false;
  }

  protected setup(options: string[], correctIndex: number) {
    this.px = W / 2;
    this.py = H - 26;
    this.cool = 0;
    this.invuln = 0;
    this.shots = [];
    this.dir = 1;
    this.vdir = 1;
    this.hx = SEG_W / 2 + 4;
    this.hy = ROW0;
    this.headD = 0;
    this.path = [{ x: this.hx - 600, y: ROW0, d: -600 }, { x: this.hx, y: ROW0, d: 0 }];
    this.mush = Array.from({ length: ROWS }, () => Array<number>(Math.floor(W / ROW_H)).fill(0));
    this.segs = [];
    if (options.length === 0) return;
    const cols = this.mush[0].length;
    const count = 16;
    for (let i = 0; i < count; i++) {
      const r = 1 + Math.floor(Math.random() * (ROWS - 3));
      const c = 3 + Math.floor(Math.random() * (cols - 6));
      this.mush[r][c] = 2;
    }
    const order = shuffleInPlace(options.map((_, i) => i));
    this.segs = order.map((optIndex, k) => ({
      label: options[optIndex],
      correct: optIndex === correctIndex,
      alive: true,
      index: optIndex,
      color: ANSWER_COLORS[k % ANSWER_COLORS.length],
    }));
  }

  private posAt(d: number) {
    const p = this.path;
    for (let i = p.length - 1; i > 0; i--) {
      if (p[i - 1].d <= d) {
        const a = p[i - 1];
        const b = p[i];
        const t = b.d === a.d ? 0 : Math.max(0, Math.min(1, (d - a.d) / (b.d - a.d)));
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
    }
    return { x: p[0].x, y: p[0].y };
  }

  private mushAt(x: number, y: number) {
    const r = Math.round((y - ROW0) / ROW_H);
    const c = Math.floor(x / ROW_H);
    return this.mush[r]?.[c] > 0 ? { r, c } : null;
  }

  protected update(dt: number) {
    this.invuln = Math.max(0, this.invuln - dt);
    this.cool = Math.max(0, this.cool - dt);

    // --- hráč ---
    const sp = 195;
    if (this.input.left) this.px -= sp * dt;
    if (this.input.right) this.px += sp * dt;
    if (this.input.up) this.py -= sp * dt;
    if (this.input.down) this.py += sp * dt;
    this.px = Math.max(14, Math.min(W - 14, this.px));
    this.py = Math.max(PLAYER_ZONE_Y, Math.min(H - 16, this.py));
    if (this.input.fire && this.cool <= 0) {
      this.cool = Math.max(0.12, this.config.fireCooldown);
      this.shots.push({ x: this.px, y: this.py - 14 });
      sfx("shoot");
    }
    this.consume("fire");

    // --- střely ---
    for (const s of this.shots) {
      s.y -= SHOT_SPEED * dt;
      const m = this.mushAt(s.x, s.y);
      if (m) {
        this.mush[m.r][m.c] -= 1;
        s.y = -50;
        this.burst(m.c * ROW_H + 10, ROW0 + m.r * ROW_H, "#d8a8ff", 8);
        sfx("hit");
        continue;
      }
      for (let i = 0; i < this.segs.length; i++) {
        const seg = this.segs[i];
        if (!seg.alive) continue;
        const pos = this.posAt(this.headD - i * SPACING);
        if (Math.abs(s.x - pos.x) < SEG_W / 2 && Math.abs(s.y - pos.y) < SEG_H / 2 + 4) {
          seg.alive = false;
          s.y = -50;
          this.burst(pos.x, pos.y, seg.color, 26);
          if (seg.correct) {
            this.win(seg.index);
            return;
          }
          this.wrong(seg.index);
          break;
        }
      }
    }
    this.shots = this.shots.filter((s) => s.y > -20);

    // --- stonožka ---
    const speed = 78 * this.pace();
    const nx = this.hx + this.dir * speed * dt;
    const front = nx + this.dir * (SEG_W / 2 + 2);
    const blocked = front < 0 || front > W || !!this.mushAt(front, this.hy);
    if (blocked) {
      let ny = this.hy + this.vdir * ROW_H;
      if (ny > ROW0 + (ROWS - 1) * ROW_H + 16 + 0) {
        this.vdir = -1;
        ny = this.hy - ROW_H;
      } else if (this.vdir < 0 && ny < ROW0 + (ROWS - 5) * ROW_H) {
        this.vdir = 1;
        ny = this.hy + ROW_H;
      }
      this.dir = -this.dir;
      this.hy = ny;
      this.headD += ROW_H;
      this.path.push({ x: this.hx, y: this.hy, d: this.headD });
    } else {
      this.headD += Math.abs(nx - this.hx);
      this.hx = nx;
      this.path.push({ x: this.hx, y: this.hy, d: this.headD });
    }
    const limit = this.headD - this.segs.length * SPACING - 120;
    while (this.path.length > 3 && this.path[1].d < limit) this.path.shift();

    // --- kolize s hráčem ---
    if (this.invuln <= 0) {
      for (let i = 0; i < this.segs.length; i++) {
        if (!this.segs[i].alive) continue;
        const pos = this.posAt(this.headD - i * SPACING);
        if (Math.abs(pos.x - this.px) < SEG_W / 2 + 8 && Math.abs(pos.y - this.py) < SEG_H / 2 + 8) {
          this.damage();
          this.burst(this.px, this.py, "#ffb020", 20);
          this.px = W / 2;
          this.py = H - 26;
          this.invuln = 2;
          // stonožka se vrátí nahoru, ať má hráč šanci
          this.hy = ROW0;
          this.vdir = 1;
          this.dir = 1;
          this.hx = SEG_W / 2 + 4;
          this.headD += 600;
          this.path = [{ x: this.hx - 600, y: ROW0, d: this.headD - 600 }, { x: this.hx, y: ROW0, d: this.headD }];
          break;
        }
      }
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0e1c14");
    g.addColorStop(1, "#091109");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(126,224,176,0.08)";
    ctx.fillRect(0, PLAYER_ZONE_Y - 8, W, H - PLAYER_ZONE_Y + 8);

    // houby
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < this.mush[r].length; c++) {
        const hp = this.mush[r][c];
        if (!hp) continue;
        const x = c * ROW_H + 10;
        const y = ROW0 + r * ROW_H;
        ctx.fillStyle = hp === 2 ? "#c24bff" : "#8a3fb0";
        ctx.beginPath();
        ctx.arc(x, y + 2, 9, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = "#f1e6d0";
        ctx.fillRect(x - 3, y + 2, 6, 7);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(x - 3, y - 2, 1.6, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 4, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

    // stonožka (od ocasu k hlavě)
    for (let i = this.segs.length - 1; i >= 0; i--) {
      const seg = this.segs[i];
      if (!seg.alive) continue;
      const pos = this.posAt(this.headD - i * SPACING);
      if (pos.x < -SEG_W || pos.x > W + SEG_W) continue;
      ctx.strokeStyle = "#16132b";
      ctx.lineWidth = 2;
      for (let k = -2; k <= 2; k++) {
        const wob = Math.sin(this.time * 14 + k + i) * 3;
        ctx.beginPath();
        ctx.moveTo(pos.x + k * 14, pos.y + SEG_H / 2 - 2);
        ctx.lineTo(pos.x + k * 14 + wob, pos.y + SEG_H / 2 + 7);
        ctx.stroke();
      }
      ctx.fillStyle = seg.color;
      ctx.beginPath();
      ctx.roundRect(pos.x - SEG_W / 2, pos.y - SEG_H / 2, SEG_W, SEG_H, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawLabel(ctx, seg.label, pos.x, pos.y, SEG_W + 40, "rgba(0,0,0,0.3)", { height: SEG_H + 2 });
      if (i === 0 || this.segs.slice(0, i).every((s) => !s.alive)) {
        ctx.fillStyle = "#fff";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(pos.x + this.dir * (SEG_W / 2 - 6), pos.y + s * 5, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // střely
    ctx.fillStyle = "#ffe066";
    for (const s of this.shots) ctx.fillRect(s.x - 1.5, s.y - 6, 3, 12);

    // hráč
    if (!(this.invuln > 0 && Math.floor(this.time * 10) % 2 === 0)) {
      ctx.fillStyle = "#7ee0ff";
      ctx.beginPath();
      ctx.moveTo(this.px, this.py - 14);
      ctx.lineTo(this.px + 13, this.py + 10);
      ctx.lineTo(this.px, this.py + 4);
      ctx.lineTo(this.px - 13, this.py + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#16132b";
      ctx.beginPath();
      ctx.arc(this.px, this.py - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
