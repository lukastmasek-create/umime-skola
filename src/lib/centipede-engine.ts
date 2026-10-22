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

type Seg = { label: string; correct: boolean; index: number; color: string };
type Shot = { x: number; y: number };
// Jedna stonožka: články za hlavou jdou po její stopě. Zásah špatného článku ji rozdělí na dvě.
type Chain = {
  segs: Seg[];
  hx: number;
  hy: number;
  dir: number;
  vdir: number;
  path: { x: number; y: number; d: number }[];
  headD: number;
};
type Spider = { x: number; y: number; vx: number; t: number };

export class CentipedeEngine extends ArcadeEngine {
  private chains: Chain[] = [];
  private mush: number[][] = [];
  private shots: Shot[] = [];
  private px = W / 2;
  private py = H - 26;
  private cool = 0;
  private invuln = 0;
  private spider: Spider | null = null;
  private spiderIn = 6;
  private hint = 0;

  protected questionTime() {
    return 80;
  }

  protected usesSwipe() {
    return false;
  }

  private newChain(segs: Seg[]): Chain {
    const hx = SEG_W / 2 + 4;
    return {
      segs,
      hx,
      hy: ROW0,
      dir: 1,
      vdir: 1,
      headD: 0,
      path: [
        { x: hx - 600, y: ROW0, d: -600 },
        { x: hx, y: ROW0, d: 0 },
      ],
    };
  }

  protected setup(options: string[], correctIndex: number) {
    this.px = W / 2;
    this.py = H - 26;
    this.cool = 0;
    this.invuln = 0;
    this.shots = [];
    this.spider = null;
    this.spiderIn = 6;
    this.hint = 0;
    this.chains = [];
    this.mush = Array.from({ length: ROWS }, () => Array<number>(Math.floor(W / ROW_H)).fill(0));
    if (options.length === 0) return;
    const cols = this.mush[0].length;
    for (let i = 0; i < 18; i++) {
      const r = 1 + Math.floor(Math.random() * (ROWS - 3));
      const c = 3 + Math.floor(Math.random() * (cols - 6));
      this.mush[r][c] = 2;
    }
    const order = shuffleInPlace(options.map((_, i) => i));
    this.chains = [
      this.newChain(
        order.map((optIndex, k) => ({
          label: options[optIndex],
          correct: optIndex === correctIndex,
          index: optIndex,
          color: ANSWER_COLORS[k % ANSWER_COLORS.length],
        })),
      ),
    ];
  }

  private posAt(chain: Chain, d: number) {
    const p = chain.path;
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

  // Zásah článku i: ten se mění v houbu, zbytek za ním pokračuje jako samostatná stonožka.
  private split(chain: Chain, i: number) {
    const pos = this.posAt(chain, chain.headD - i * SPACING);
    const r = Math.round((pos.y - ROW0) / ROW_H);
    const c = Math.floor(pos.x / ROW_H);
    if (this.mush[r]?.[c] === 0) this.mush[r][c] = 2;
    const back = chain.segs.slice(i + 1);
    chain.segs = chain.segs.slice(0, i);
    if (back.length > 0) {
      const d = chain.headD - (i + 1) * SPACING;
      const head = this.posAt(chain, d);
      const path = chain.path.filter((p) => p.d < d).concat({ x: head.x, y: head.y, d });
      this.chains.push({ segs: back, hx: head.x, hy: head.y, dir: chain.dir, vdir: chain.vdir, path, headD: d });
    }
    this.chains = this.chains.filter((ch) => ch.segs.length > 0);
  }

  protected update(dt: number) {
    this.invuln = Math.max(0, this.invuln - dt);
    this.cool = Math.max(0, this.cool - dt);
    this.hint = Math.max(0, this.hint - dt);

    // --- hráč ---
    const sp = 195 * (0.85 + (this.moveMul() - 1) * 0.5);
    if (this.input.left) this.px -= sp * dt;
    if (this.input.right) this.px += sp * dt;
    if (this.input.up) this.py -= sp * dt;
    if (this.input.down) this.py += sp * dt;
    this.px = Math.max(14, Math.min(W - 14, this.px));
    this.py = Math.max(PLAYER_ZONE_Y, Math.min(H - 16, this.py));
    if (this.input.fire && this.cool <= 0) {
      this.cool = Math.max(0.16, this.config.fireCooldown * 1.2);
      this.shots.push({ x: this.px, y: this.py - 14 });
      sfx("shoot");
    }
    this.consume("fire");

    // --- pavouk: skáče po spodní zóně, zásah prozradí správný článek ---
    this.spiderIn -= dt;
    if (!this.spider && this.spiderIn <= 0) {
      const fromLeft = Math.random() < 0.5;
      this.spider = { x: fromLeft ? -16 : W + 16, y: PLAYER_ZONE_Y + 20, vx: (fromLeft ? 1 : -1) * (80 + Math.random() * 40), t: 0 };
    }
    const sd = this.spider;
    if (sd) {
      sd.t += dt;
      sd.x += sd.vx * dt;
      sd.y = PLAYER_ZONE_Y + 36 + Math.sin(sd.t * 3.2) * 30;
      if (sd.x < -40 || sd.x > W + 40) {
        this.spider = null;
        this.spiderIn = 5 + Math.random() * 4;
      } else if (this.invuln <= 0 && Math.abs(sd.x - this.px) < 20 && Math.abs(sd.y - this.py) < 18) {
        this.damage();
        this.burst(this.px, this.py, "#ffb020", 20);
        this.px = W / 2;
        this.py = H - 26;
        this.invuln = 2.2;
      }
    }

    // --- střely ---
    for (const s of this.shots) {
      s.y -= SHOT_SPEED * dt;
      if (this.spider && Math.abs(s.x - this.spider.x) < 18 && Math.abs(s.y - this.spider.y) < 14) {
        this.burst(this.spider.x, this.spider.y, "#e9d5ff", 24);
        this.popText("💡", "#ffe066", this.spider.x, this.spider.y - 18);
        this.spider = null;
        this.spiderIn = 7 + Math.random() * 4;
        this.hint = 3.5;
        s.y = -50;
        sfx("correct");
        continue;
      }
      const m = this.mushAt(s.x, s.y);
      if (m) {
        this.mush[m.r][m.c] -= 1;
        s.y = -50;
        this.burst(m.c * ROW_H + 10, ROW0 + m.r * ROW_H, "#d8a8ff", 8);
        sfx("hit");
        continue;
      }
      let used = false;
      for (const chain of this.chains) {
        for (let i = 0; i < chain.segs.length; i++) {
          const seg = chain.segs[i];
          const pos = this.posAt(chain, chain.headD - i * SPACING);
          if (Math.abs(s.x - pos.x) < SEG_W / 2 && Math.abs(s.y - pos.y) < SEG_H / 2 + 4) {
            s.y = -50;
            used = true;
            this.burst(pos.x, pos.y, seg.color, 26);
            if (seg.correct) {
              this.win(seg.index);
              return;
            }
            this.wrong(seg.index);
            this.split(chain, i);
            break;
          }
        }
        if (used) break;
      }
    }
    this.shots = this.shots.filter((s) => s.y > -20);

    // --- stonožky ---
    const speed = 74 * this.pace();
    for (const chain of this.chains) {
      const nx = chain.hx + chain.dir * speed * dt;
      const front = nx + chain.dir * (SEG_W / 2 + 2);
      const blocked = front < 0 || front > W || !!this.mushAt(front, chain.hy);
      if (blocked) {
        let ny = chain.hy + chain.vdir * ROW_H;
        if (ny > ROW0 + (ROWS - 1) * ROW_H + 16) {
          chain.vdir = -1;
          ny = chain.hy - ROW_H;
        } else if (chain.vdir < 0 && ny < ROW0 + (ROWS - 5) * ROW_H) {
          chain.vdir = 1;
          ny = chain.hy + ROW_H;
        }
        chain.dir = -chain.dir;
        chain.hy = ny;
        chain.headD += ROW_H;
        chain.path.push({ x: chain.hx, y: chain.hy, d: chain.headD });
      } else {
        chain.headD += Math.abs(nx - chain.hx);
        chain.hx = nx;
        chain.path.push({ x: chain.hx, y: chain.hy, d: chain.headD });
      }
      const limit = chain.headD - chain.segs.length * SPACING - 120;
      while (chain.path.length > 3 && chain.path[1].d < limit) chain.path.shift();
    }

    // --- kolize s hráčem ---
    if (this.invuln <= 0) {
      for (const chain of this.chains) {
        let hit = false;
        for (let i = 0; i < chain.segs.length && !hit; i++) {
          const pos = this.posAt(chain, chain.headD - i * SPACING);
          if (Math.abs(pos.x - this.px) < SEG_W / 2 + 8 && Math.abs(pos.y - this.py) < SEG_H / 2 + 8) hit = true;
        }
        if (!hit) continue;
        this.damage();
        this.burst(this.px, this.py, "#ffb020", 20);
        this.px = W / 2;
        this.py = H - 26;
        this.invuln = 2.4;
        // stonožka, která zasáhla, se vrátí nahoru
        chain.hy = ROW0;
        chain.vdir = 1;
        chain.dir = 1;
        chain.hx = SEG_W / 2 + 4;
        chain.headD += 600;
        chain.path = [
          { x: chain.hx - 600, y: ROW0, d: chain.headD - 600 },
          { x: chain.hx, y: ROW0, d: chain.headD },
        ];
        break;
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

    // stonožky (od ocasu k hlavě)
    for (const chain of this.chains) {
      for (let i = chain.segs.length - 1; i >= 0; i--) {
        const seg = chain.segs[i];
        const pos = this.posAt(chain, chain.headD - i * SPACING);
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
        const glow = this.hint > 0 && seg.correct;
        ctx.strokeStyle = glow ? `rgba(255,224,102,${0.6 + Math.sin(this.time * 14) * 0.4})` : "rgba(255,255,255,0.85)";
        ctx.lineWidth = glow ? 5 : 2;
        ctx.stroke();
        drawLabel(ctx, seg.label, pos.x, pos.y, SEG_W + 40, "rgba(0,0,0,0.3)", { height: SEG_H + 2 });
        if (i === 0) {
          ctx.fillStyle = "#fff";
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(pos.x + chain.dir * (SEG_W / 2 - 6), pos.y + s * 5, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // pavouk
    const sd = this.spider;
    if (sd) {
      ctx.strokeStyle = "#e9d5ff";
      ctx.lineWidth = 2;
      for (let k = -2; k <= 2; k++) {
        if (k === 0) continue;
        const wob = Math.sin(this.time * 16 + k) * 3;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(sd.x, sd.y);
          ctx.lineTo(sd.x + side * (10 + Math.abs(k) * 4), sd.y + k * 4 + wob);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.ellipse(sd.x, sd.y, 13, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff5d73";
      ctx.beginPath();
      ctx.arc(sd.x - 4, sd.y - 2, 2, 0, Math.PI * 2);
      ctx.arc(sd.x + 4, sd.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
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
