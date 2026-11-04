import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

// Patra: 0 je země, TOP je horní patro se dveřmi s odpověďmi.
const LEVEL_Y = [398, 322, 246, 170, 94];
const TOP = LEVEL_Y.length - 1;
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

// Sudy valí gorila, dokud je hráč pod horním patrem. Cap je jen pojistka proti přeplnění plátna.
const BARREL_CAP = 10;
const TOSS = 0.35; // délka oblouku, kterým gorila sud hodí
const FADE = 0.6; // doba, za kterou zmizí špatná odpověď

// Odpovědi visí nad horním patrem jako bloky: musíš pod ně vyskočit a udeřit hlavou.
type Door = {
  x: number;
  w: number;
  label: string;
  correct: boolean;
  alive: boolean;
  index: number;
  color: string;
  hit: number; // doba od úderu hlavou (animace odrazu)
  aim: number; // 0–1: hráč je přímo pod blokem (plynule se zvýrazní)
  fade: number; // doba mizení po vyřazení
};
const BLOCK_BOTTOM = 52;
const BLOCK_H = 36;
type Barrel = {
  x: number;
  y: number;
  vy: number;
  level: number;
  dir: number;
  falling: boolean;
  rot: number;
  jumped: boolean;
  toss: number; // zbývající doba oblouku po hodu
};

export class KongEngine extends ArcadeEngine {
  private sp = new Sprites("kong");
  private px = START_X;
  private py = LEVEL_Y[0];
  private vy = 0;
  private level = 0; // patro, na kterém hráč stojí
  private prevLevel = 0;
  private onGround = true;
  private climbing: { x: number; from: number } | null = null;
  private facing = 1;
  private invuln = 0;
  private squash = 0; // 1 těsně po dopadu, pak se vrací k normálu
  private doors: Door[] = [];
  private barrels: Barrel[] = [];
  private spawn = 1.5;
  private throwT = 0; // gorila právě hází (krátká animace)

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
    this.prevLevel = 0;
    this.onGround = true;
    this.climbing = null;
    this.invuln = 0;
    this.squash = 0;
    this.throwT = 0;
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
      hit: 0,
      aim: 0,
      fade: 0,
    }));
  }

  protected eliminate(indices: number[]) {
    for (const d of this.doors) {
      if (!d.alive || d.correct || !indices.includes(d.index)) continue;
      d.alive = false;
      d.fade = FADE;
      this.burst(d.x + d.w / 2, BLOCK_BOTTOM - BLOCK_H / 2, d.color, 14);
    }
    sfx("pickup");
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
    this.squash = Math.max(0, this.squash - dt * 4);
    this.throwT = Math.max(0, this.throwT - dt);
    const speed = 115 * this.moveMul();

    // Hráč právě doskočil nahoru: krátká nápověda, co dělat.
    if (this.level === TOP && this.prevLevel !== TOP && this.onGround && !this.climbing && this.doors.some((d) => d.alive)) {
      this.popText("Skoč pod správnou odpověď!", "#ffe066", W / 2, 130);
    }
    this.prevLevel = this.level;

    // --- hráč ---
    if (this.climbing) {
      const l = this.climbing;
      const climbSpeed = 88 * this.moveMul();
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
        this.squash = 0.6;
        sfx("land");
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
          this.vy = -335; // nižší skok: hlava nezasáhne sudy valící se o patro výš
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
              this.squash = 1;
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
    // Gorila hází, dokud hráč není v horním patře. Tam se přestane dívat a hází až po sestupu.
    if (this.level < TOP) this.spawn -= dt;
    if (this.level < TOP && this.spawn <= 0 && this.barrels.length < BARREL_CAP) {
      // Na lehčích obtížnostech (forgive > 1) jsou mezi sudy delší pauzy; sudy ale chodí pořád.
      this.spawn = Math.max(1.1, 2.6 / this.pace()) * (0.8 + Math.random() * 0.5) * this.forgive();
      this.throwT = 0.3;
      this.barrels.push({ x: W - 62, y: LEVEL_Y[TOP], vy: 0, level: TOP, dir: -1, falling: false, rot: 0, jumped: false, toss: TOSS });
    }
    const bspeed = 78 * this.pace();
    for (const b of this.barrels) {
      b.rot += b.dir * dt * 6;
      if (b.toss > 0) {
        // oblouk z rukou gorily dolů na patro
        b.toss = Math.max(0, b.toss - dt);
        const p = 1 - b.toss / TOSS;
        b.x += b.dir * bspeed * dt;
        b.y = b.toss > 0 ? LEVEL_Y[TOP] - 22 * (1 - p) - 26 * Math.sin(p * Math.PI) : LEVEL_Y[TOP];
      } else if (!b.falling) {
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
    // Na žebříku sudy nezasahují: šplhání je bezpečný úsek.
    if (this.invuln <= 0 && !this.climbing) {
      for (const b of this.barrels) {
        const dx = Math.abs(b.x - this.px);
        const dy = b.y - 9 - (this.py - PLAYER_H / 2);
        if (dx < 14 / Math.sqrt(this.forgive()) && Math.abs(dy) < 17) {
          this.damage();
          this.burst(this.px, this.py - 10, "#ffb020", 20);
          this.respawn(true);
          return;
        }
      }
    }

    // --- odpovědní bloky: zvýraznění pod hráčem, úder hlavou při výskoku ---
    for (const d of this.doors) {
      d.hit = Math.max(0, d.hit - dt);
      if (!d.alive) d.fade = Math.max(0, d.fade - dt);
      const under = d.alive && this.level === TOP && !this.climbing && this.px >= d.x - 4 && this.px <= d.x + d.w + 4;
      d.aim += ((under ? 1 : 0) - d.aim) * Math.min(1, dt * 12);
    }
    if (this.level === TOP && !this.onGround && !this.climbing && this.vy < 0) {
      const headTop = this.py - PLAYER_H - 5;
      for (const d of this.doors) {
        if (!d.alive) continue;
        if (this.px < d.x - 4 || this.px > d.x + d.w + 4 || headTop > BLOCK_BOTTOM) continue;
        const cx = d.x + d.w / 2;
        this.vy = 140; // odrazí se dolů
        d.hit = 0.25;
        sfx("hit");
        if (d.correct) {
          this.burst(cx, BLOCK_BOTTOM, d.color, 30);
          this.win(d.index);
          return;
        }
        d.alive = false;
        d.fade = FADE;
        this.burst(cx, BLOCK_BOTTOM - BLOCK_H / 2, "#ff5d73", 20);
        this.wrong(d.index);
        break;
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
      if (this.sp.has("zebrik", "zebrik")) {
        for (let y = top; y < bottom; y += 12) this.sp.draw(ctx, "zebrik", "zebrik", l.x, Math.min(y + 6, bottom - 6), 16, 12);
        continue;
      }
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
      if (this.sp.has("dlazdice", "nosnik")) {
        for (let x = a; x < b; x += 24) this.sp.draw(ctx, "dlazdice", "nosnik", Math.min(x + 12, b - 12 + 12), y + 5, 24, 12);
        return;
      }
      ctx.fillStyle = "#e0523a";
      ctx.fillRect(a, y, b - a, 9);
      ctx.fillStyle = "#ff8a6b";
      for (let x = a + 4; x < b; x += 24) ctx.fillRect(x, y + 3, 12, 3);
    });

    // gorila nahoře vpravo: nabírá sílu (buseni), hodí (hod), jinak dýchá (klid)
    const windup = this.level < TOP && this.spawn > 0 && this.spawn < 0.5 && this.barrels.length < BARREL_CAP;
    const gname =
      this.throwT > 0
        ? "hod_1"
        : windup
          ? Math.floor(this.time * 8) % 2 === 0
            ? "buseni_1"
            : "buseni_2"
          : Math.floor(this.time * 3) % 2 === 0
            ? "klid_1"
            : "klid_2";
    if (!this.sp.draw(ctx, "gorila", gname, W - 40, LEVEL_Y[TOP], 60, 68, { anchorBottom: true })) this.drawKong(ctx, W - 40, LEVEL_Y[TOP]);

    // vodicí čára: od bloku, pod kterým hráč stojí, dolů k hlavě
    const aimed = this.doors.find((d) => d.alive && d.aim > 0.5);
    if (aimed && !this.climbing) {
      ctx.save();
      ctx.globalAlpha = aimed.aim * 0.9;
      ctx.strokeStyle = aimed.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      ctx.lineDashOffset = -this.time * 20;
      ctx.beginPath();
      ctx.moveTo(this.px, BLOCK_BOTTOM + 2);
      ctx.lineTo(this.px, this.py - PLAYER_H - 3);
      ctx.stroke();
      ctx.restore();
    }

    // odpovědní bloky nad horním patrem
    for (const d of this.doors) {
      if (!d.alive && d.fade <= 0) continue;
      const k = d.alive ? 1 : d.fade / FADE; // průhlednost při zmizení
      const bump = d.hit > 0 ? Math.sin((d.hit / 0.25) * Math.PI) * 8 : 0;
      const bob = d.alive ? Math.sin(this.time * 2.2 + d.x * 0.05) * 1.5 : 0;
      const drop = d.alive ? 0 : (1 - k) * 24;
      const cx = d.x + d.w / 2;
      const cy = BLOCK_BOTTOM - BLOCK_H / 2 - bump + bob + drop;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.translate(cx, cy);
      ctx.scale(1 + d.aim * 0.07, 1 + d.aim * 0.07);
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 18 * d.aim;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.roundRect(-d.w / 2, -BLOCK_H / 2, d.w, BLOCK_H, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255,255,255,${0.7 + d.aim * 0.3})`;
      ctx.lineWidth = 2 + d.aim * 1.5;
      ctx.stroke();
      drawLabel(ctx, d.label, 0, 0, d.w - 6, "rgba(0,0,0,0.25)", { height: BLOCK_H - 8, size: 16, alpha: k });
      ctx.restore();

      // šipka naznačuje, že se pod blok skáče; pod zvoleným blokem svítí víc
      if (d.alive) {
        ctx.fillStyle = `rgba(255,255,255,${0.45 + d.aim * 0.5})`;
        const ay = BLOCK_BOTTOM + 8 + Math.sin(this.time * 6 + d.x) * 2 + d.aim * 3;
        ctx.beginPath();
        ctx.moveTo(cx, ay);
        ctx.lineTo(cx - 6, ay + 8);
        ctx.lineTo(cx + 6, ay + 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    // sudy
    for (const b of this.barrels) {
      if (this.sp.draw(ctx, "sud", "kutaleni_" + (((Math.floor(Math.abs(b.rot) * 2.5) % 4) + 4) % 4 + 1), b.x, b.y - 9, 22, 22)) continue;
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

    // hráč: při skoku se protáhne, při dopadu zmáčkne (kolem chodidel)
    if (!(this.invuln > 0 && Math.floor(this.time * 10) % 2 === 0)) {
      const air = !this.onGround && !this.climbing ? (this.vy < 0 ? 1 : -0.6) : 0;
      const sx = 1 + this.squash * 0.22 - air * 0.05;
      const sy = 1 - this.squash * 0.22 + air * 0.05;
      ctx.save();
      ctx.translate(this.px, this.py);
      ctx.scale(sx, sy);
      ctx.translate(-this.px, -this.py);
      this.drawPlayer(ctx);
      ctx.restore();
    }
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
    const moving = this.input.left || this.input.right;
    const name = this.climbing
      ? "lezeni_" + (Math.floor(this.py / 6) % 2 === 0 ? 1 : 2)
      : !this.onGround
        ? "skok"
        : moving
          ? "beh_" + ((Math.floor(this.time * 10) % 4) + 1)
          : "klid";
    if (this.sp.draw(ctx, "hrac", name, this.px, this.py, 26, 34, { anchorBottom: true, flip: this.facing < 0 })) return;
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
