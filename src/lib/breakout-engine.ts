import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const BRICK_FRAME: Record<string, string> = { "#7c6cff": "fialova", "#ff5d73": "cervena", "#ffb020": "zluta", "#22c55e": "zelena", "#5a6cff": "fialova", "#4f8bff": "zluta", "#7ee0b0": "zelena" };

const PADDLE_Y = H - 24;
const PADDLE_H = 12;
const BALL_R = 7;
const BRICK_H = 14;

type Block = { x: number; y: number; w: number; h: number; alive: boolean; label?: string; correct?: boolean; index?: number; color: string };

export class BreakoutEngine extends ArcadeEngine {
  private sp = new Sprites("breakout");
  private blocks: Block[] = [];
  private paddleX = W / 2;
  private paddleW = 92;
  private ballX = W / 2;
  private ballY = PADDLE_Y - BALL_R - 1;
  private vx = 0;
  private vy = 0;
  private launched = false;
  private wait = 0;
  private target: number | null = null;

  protected questionTime() {
    return 70;
  }

  protected setup(options: string[], correctIndex: number) {
    this.blocks = [];
    this.paddleX = W / 2;
    this.paddleW = 92 * (1 + (this.moveMul() - 1) * 0.5) * this.forgive();
    this.target = null;
    this.resetBall();
    if (options.length === 0) return;
    const order = shuffleInPlace(options.map((_, i) => i));
    const n = order.length;
    const bw = 142;
    const gap = (W - 20 - bw * n) / (n + 1);
    order.forEach((optIndex, k) => {
      this.blocks.push({
        x: 10 + gap + k * (bw + gap),
        y: 34,
        w: bw,
        h: 46,
        alive: true,
        label: options[optIndex],
        correct: optIndex === correctIndex,
        index: optIndex,
        color: ANSWER_COLORS[k % ANSWER_COLORS.length],
      });
    });
    // Ozdobné cihličky pod odpověďmi: zpomalují hru a dávají míčku co rozbíjet.
    const cols = 16;
    const cw = (W - 20) / cols;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < cols; c++) {
        if ((c + r) % 5 === 4) continue;
        this.blocks.push({
          x: 10 + c * cw + 1,
          y: 106 + r * (BRICK_H + 3),
          w: cw - 2,
          h: BRICK_H,
          alive: true,
          color: ["#5a6cff", "#4f8bff", "#7ee0b0"][r],
        });
      }
  }

  protected eliminate(indices: number[]) {
    for (const b of this.blocks) {
      if (!b.alive || b.label === undefined || b.correct || !indices.includes(b.index ?? -1)) continue;
      b.alive = false;
      this.burst(b.x + b.w / 2, b.y + b.h / 2, b.color, 14);
    }
    sfx("pickup");
  }

  private resetBall() {
    this.launched = false;
    this.wait = 1.6;
    this.vx = 0;
    this.vy = 0;
    this.ballX = this.paddleX;
    this.ballY = PADDLE_Y - BALL_R - 1;
  }

  private launch() {
    if (this.launched) return;
    this.launched = true;
    const sp = Math.max(190, 300 * this.pace());
    const a = (-Math.PI / 2) + (Math.random() - 0.5) * 0.7;
    this.vx = Math.cos(a) * sp;
    this.vy = Math.sin(a) * sp;
    sfx("shoot");
  }

  protected onTap() {
    this.launch();
  }

  protected onDrag(x: number) {
    this.target = x;
  }

  protected usesSwipe() {
    return false;
  }

  protected update(dt: number) {
    const move = 380 * this.moveMul() * dt;
    if (this.input.left) {
      this.paddleX -= move;
      this.target = null;
    }
    if (this.input.right) {
      this.paddleX += move;
      this.target = null;
    }
    if (this.target !== null) this.paddleX += Math.max(-move * 1.6, Math.min(move * 1.6, this.target - this.paddleX));
    this.paddleX = Math.max(this.paddleW / 2 + 4, Math.min(W - this.paddleW / 2 - 4, this.paddleX));
    if (this.consume("fire")) this.launch();

    if (!this.launched) {
      this.ballX = this.paddleX;
      this.wait -= dt;
      if (this.wait <= 0) this.launch();
      return;
    }

    const steps = 3;
    for (let s = 0; s < steps && !this.over; s++) this.moveBall(dt / steps);
  }

  private moveBall(dt: number) {
    this.ballX += this.vx * dt;
    this.ballY += this.vy * dt;
    if (this.ballX < BALL_R) {
      this.ballX = BALL_R;
      this.vx = Math.abs(this.vx);
    } else if (this.ballX > W - BALL_R) {
      this.ballX = W - BALL_R;
      this.vx = -Math.abs(this.vx);
    }
    if (this.ballY < BALL_R + 6) {
      this.ballY = BALL_R + 6;
      this.vy = Math.abs(this.vy);
    }

    // pálka
    if (this.vy > 0 && this.ballY + BALL_R >= PADDLE_Y && this.ballY - BALL_R <= PADDLE_Y + PADDLE_H) {
      const half = this.paddleW / 2;
      if (Math.abs(this.ballX - this.paddleX) <= half + BALL_R) {
        const hit = (this.ballX - this.paddleX) / half;
        const sp = Math.hypot(this.vx, this.vy);
        const a = -Math.PI / 2 + hit * 1.05;
        this.vx = Math.cos(a) * sp;
        this.vy = Math.sin(a) * sp;
        this.ballY = PADDLE_Y - BALL_R;
        sfx("land");
      }
    }

    // bloky
    for (const b of this.blocks) {
      if (!b.alive) continue;
      const nx = Math.max(b.x, Math.min(this.ballX, b.x + b.w));
      const ny = Math.max(b.y, Math.min(this.ballY, b.y + b.h));
      const dx = this.ballX - nx;
      const dy = this.ballY - ny;
      if (dx * dx + dy * dy > BALL_R * BALL_R) continue;
      if (Math.abs(dx) > Math.abs(dy)) this.vx = dx > 0 ? Math.abs(this.vx) : -Math.abs(this.vx);
      else this.vy = dy > 0 ? Math.abs(this.vy) : -Math.abs(this.vy);
      b.alive = false;
      this.burst(b.x + b.w / 2, b.y + b.h / 2, b.color, b.label ? 24 : 8);
      if (b.label !== undefined) {
        if (b.correct) {
          this.win(b.index ?? 0);
          return;
        }
        this.wrong(b.index ?? 0);
      } else sfx("hit");
      break;
    }

    if (this.ballY > H + 12) {
      this.damage();
      this.resetBall();
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#14123a");
    g.addColorStop(1, "#0a0a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (const b of this.blocks) {
      if (!b.alive) continue;
      const frame = BRICK_FRAME[b.color] ?? "fialova";
      if (b.label === undefined) {
        if (this.sp.draw(ctx, "cihly", frame, b.x + b.w / 2, b.y + b.h / 2, b.w, b.h)) continue;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();
        continue;
      }
      if (this.sp.draw(ctx, "odpovedi", frame, b.x + b.w / 2, b.y + b.h / 2, b.w, b.h)) {
        drawLabel(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2, b.w - 8, "rgba(0,0,0,0.28)", { height: b.h - 12, size: 19 });
        continue;
      }
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawLabel(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2, b.w - 8, "rgba(0,0,0,0.28)", { height: b.h - 12, size: 19 });
    }

    // pálka
    if (!this.sp.draw(ctx, "palka", "palka", this.paddleX, PADDLE_Y + PADDLE_H / 2, this.paddleW, PADDLE_H + 2)) {
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.roundRect(this.paddleX - this.paddleW / 2, PADDLE_Y, this.paddleW, PADDLE_H, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(this.paddleX - this.paddleW / 2 + 6, PADDLE_Y + 2, this.paddleW - 12, 2);
    }

    // míček
    if (!this.sp.draw(ctx, "micek", "micek", this.ballX, this.ballY, BALL_R * 2.2, BALL_R * 2.2)) {
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#9fd3ff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.ballX, this.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (!this.launched && !this.over) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "700 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("▲", this.ballX, this.ballY - 18);
    }
  }
}
