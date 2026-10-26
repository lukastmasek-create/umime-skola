import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const GRAVITY = 430;
const ITEM_H = 40;
// 3D ovoce z Blenderu, každá odpověď dostane jedno (celé a rozkrojené).
const FRUITS = ["meloun", "jablko", "pomeranc", "ananas", "kiwi"];
const FRUIT_SIZE = 56;

type Item = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  label: string;
  index: number;
  correct: boolean;
  color: string;
  fruit: string;
  state: "wait" | "fly" | "gone";
  delay: number;
};

type Half = { x: number; y: number; vx: number; vy: number; rot: number; w: number; label: string; color: string; fruit: string; left: boolean; life: number };

// Ninja: odpovědi vyletují jako ovoce. Švihni po té správné a rozkrojíš ji. Špatnou odpověď
// neřež, ubere život. Propadlé ovoce nevadí, vyletí znovu.
export class NinjaEngine extends ArcadeEngine {
  private items: Item[] = [];
  private halves: Half[] = [];
  private trail: { x: number; y: number; life: number }[] = [];
  private lastPoint: { x: number; y: number } | null = null;
  private cx = W / 2;
  private cy = H / 2;
  private keyboard = false;
  private sp = new Sprites("ninja");

  protected questionTime() {
    return 75;
  }

  protected setup(options: string[], correctIndex: number) {
    const order = shuffleInPlace(options.map((_, i) => i));
    this.items = order.map((optIndex, k) => ({
      x: 0,
      y: H + 60,
      vx: 0,
      vy: 0,
      w: 150,
      label: options[optIndex],
      index: optIndex,
      correct: optIndex === correctIndex,
      color: ANSWER_COLORS[k % ANSWER_COLORS.length],
      fruit: FRUITS[k % FRUITS.length],
      state: "wait",
      delay: 0.4 + k * 0.75,
    }));
    this.halves = [];
    this.trail = [];
    this.lastPoint = null;
  }

  // Nápověda 50:50: špatné ovoce zmizí.
  protected eliminate(indices: number[]) {
    for (const item of this.items) {
      if (item.correct || item.state === "gone" || !indices.includes(item.index)) continue;
      if (item.state === "fly") this.burst(item.x, item.y, item.color, 14);
      item.state = "gone";
    }
    sfx("pickup");
  }

  protected usesSwipe() {
    return false;
  }

  protected onTap(x: number, y: number) {
    this.keyboard = false;
    this.lastPoint = { x, y };
    this.trail.push({ x, y, life: 0.3 });
    this.sliceAt(x, y, x, y);
  }

  protected onDrag(x: number, y: number) {
    const from = this.lastPoint ?? { x, y };
    this.trail.push({ x, y, life: 0.3 });
    this.sliceAt(from.x, from.y, x, y);
    this.lastPoint = { x, y };
  }

  private launch(item: Item) {
    const sp = this.pace();
    item.w = Math.min(190, Math.max(110, 40 + item.label.length * 8));
    item.x = 90 + Math.random() * (W - 180);
    item.y = H + 30;
    item.vx = (W / 2 - item.x) * 0.22 + (Math.random() - 0.5) * 70;
    item.vy = -(470 + Math.random() * 70) * Math.min(1.12, 0.94 + sp * 0.06);
    item.state = "fly";
  }

  private sliceAt(x0: number, y0: number, x1: number, y1: number) {
    for (const item of this.items) {
      if (item.state !== "fly" || this.over) continue;
      const steps = 6;
      let hit = false;
      for (let s = 0; s <= steps; s++) {
        const px = x0 + ((x1 - x0) * s) / steps;
        const py = y0 + ((y1 - y0) * s) / steps;
        if (Math.abs(px - item.x) <= item.w / 2 + 6 && Math.abs(py - item.y) <= ITEM_H / 2 + 6) {
          hit = true;
          break;
        }
      }
      if (!hit) continue;
      item.state = "gone";
      sfx("hit");
      for (const left of [true, false]) {
        this.halves.push({ x: item.x, y: item.y, vx: item.vx + (left ? -90 : 90), vy: item.vy * 0.4, rot: 0, w: item.w, label: item.label, color: item.color, fruit: item.fruit, left, life: 1.2 });
      }
      this.burst(item.x, item.y, item.color, 14);
      if (item.correct) {
        this.win(item.index);
        return;
      }
      this.wrong(item.index);
    }
  }

  protected update(dt: number) {
    const move = 320 * this.moveMul() * dt;
    if (this.input.left) {
      this.cx -= move;
      this.keyboard = true;
    }
    if (this.input.right) {
      this.cx += move;
      this.keyboard = true;
    }
    if (this.input.up) {
      this.cy -= move;
      this.keyboard = true;
    }
    if (this.input.down) {
      this.cy += move;
      this.keyboard = true;
    }
    this.cx = Math.max(10, Math.min(W - 10, this.cx));
    this.cy = Math.max(30, Math.min(H - 10, this.cy));
    if (this.consume("fire")) {
      this.keyboard = true;
      this.trail.push({ x: this.cx, y: this.cy, life: 0.3 });
      this.sliceAt(this.cx - 40, this.cy, this.cx + 40, this.cy);
    }

    for (const item of this.items) {
      if (item.state === "wait") {
        item.delay -= dt;
        if (item.delay <= 0) this.launch(item);
      } else if (item.state === "fly") {
        item.vy += GRAVITY * dt;
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        if (item.y > H + 50 && item.vy > 0) {
          if (item.correct) {
            item.state = "wait";
            item.delay = 0.5 + Math.random() * 0.6;
          } else {
            item.state = "wait";
            item.delay = 0.8 + Math.random() * 1.4;
          }
        }
      }
    }
    for (const h of this.halves) {
      h.vy += GRAVITY * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rot += (h.left ? -1 : 1) * 3 * dt;
      h.life -= dt;
    }
    this.halves = this.halves.filter((h) => h.life > 0);
    for (const t of this.trail) t.life -= dt;
    this.trail = this.trail.filter((t) => t.life > 0);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2a1b4d");
    g.addColorStop(1, "#5d2f5f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // bambusová stěna v pozadí
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < 9; i++) ctx.fillRect(i * 80 + 20, 0, 14, H);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(W - 90, 78, 38, 0, Math.PI * 2);
    ctx.fill();

    for (const h of this.halves) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.globalAlpha = Math.min(1, h.life * 1.6);
      const fx = -h.w / 2 - 6;
      ctx.save();
      ctx.beginPath();
      ctx.rect(h.left ? fx - FRUIT_SIZE : fx, -FRUIT_SIZE, FRUIT_SIZE, FRUIT_SIZE * 2);
      ctx.clip();
      this.sp.draw(ctx, "ovoce", `${h.fruit}_pulky`, fx + (h.left ? -8 : 8), 0, FRUIT_SIZE + 10, FRUIT_SIZE + 10);
      ctx.restore();
      ctx.beginPath();
      ctx.rect(h.left ? -h.w / 2 : 0, -ITEM_H / 2, h.w / 2, ITEM_H);
      ctx.clip();
      drawLabel(ctx, h.label, 0, 0, h.w, h.color, { height: ITEM_H, size: 15 });
      ctx.restore();
    }

    for (const item of this.items) {
      if (item.state !== "fly") continue;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.sin(item.x * 0.02 + this.time * 2) * 0.15);
      this.sp.draw(ctx, "ovoce", `${item.fruit}_cele`, -item.w / 2 - 6, 0, FRUIT_SIZE, FRUIT_SIZE, { rot: this.time * 1.5 + item.index });
      drawLabel(ctx, item.label, 0, 0, item.w, item.color, { height: ITEM_H, size: 15 });
      ctx.restore();
    }

    // šmouha čepele
    if (this.trail.length > 1) {
      ctx.lineCap = "round";
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1];
        const b = this.trail[i];
        ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, b.life * 3)})`;
        ctx.lineWidth = 5 * Math.min(1, b.life * 3);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    const head = this.trail[this.trail.length - 1];
    const prev = this.trail[this.trail.length - 2];
    if (head && prev && head.life > 0.15) {
      const a = Math.atan2(head.y - prev.y, head.x - prev.x);
      this.sp.draw(ctx, "cepel", "cepel", head.x, head.y, 64, 64, { rot: a + (3 * Math.PI) / 4 });
    }
    if (this.keyboard && !this.over && !this.sp.draw(ctx, "cepel", "cepel", this.cx, this.cy, 64, 64)) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.cx - 40, this.cy);
      ctx.lineTo(this.cx + 40, this.cy);
      ctx.moveTo(this.cx, this.cy - 10);
      ctx.lineTo(this.cx, this.cy + 10);
      ctx.stroke();
    }
  }
}
