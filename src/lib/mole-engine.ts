import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const HOLE_Y = 290;
const HOLE_X = [95, 245, 395, 545];
const UP_TIME = 2.0;
const DOWN_TIME = 0.9;

type Mole = { phase: "down" | "up" | "stunned"; t: number; label: string; index: number; correct: boolean; swing: number };

// Krtek: čtyři krtci vystrkují hlavy a každý drží cedulku s odpovědí. Klepni kladivem na toho
// se správnou. Špatný krtek ubere život a na chvíli se schová.
export class MoleEngine extends ArcadeEngine {
  private moles: Mole[] = [];
  private cursor = 1;
  private sp = new Sprites("mole");

  protected questionTime() {
    return 70;
  }

  protected setup(options: string[], correctIndex: number) {
    const order = shuffleInPlace(options.map((_, i) => i));
    const starts = shuffleInPlace([0.5, 1.2, 1.9, 2.6]);
    this.moles = order.map((optIndex, k) => ({
      phase: "down",
      t: starts[k % 4],
      label: options[optIndex],
      index: optIndex,
      correct: optIndex === correctIndex,
      swing: 0,
    }));
    this.cursor = 1;
  }

  protected usesSwipe() {
    return false;
  }

  protected onTap(x: number, y: number) {
    let best = -1;
    let bestD = 70;
    HOLE_X.forEach((hx, i) => {
      const d = Math.hypot(x - hx, y - (HOLE_Y - 40));
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) {
      this.cursor = best;
      this.whack(best);
    }
  }

  private whack(i: number) {
    const m = this.moles[i];
    if (!m) return;
    m.swing = 0.22;
    if (m.phase !== "up") {
      sfx("miss");
      return;
    }
    const x = HOLE_X[i];
    if (m.correct) {
      this.burst(x, HOLE_Y - 50, "#7ee0b0", 26);
      this.win(m.index);
      return;
    }
    this.burst(x, HOLE_Y - 50, "#ff5d73", 14);
    m.phase = "stunned";
    m.t = 2.2 / this.pace();
    this.wrong(m.index);
  }

  protected update(dt: number) {
    if (this.consume("left")) this.cursor = (this.cursor + HOLE_X.length - 1) % HOLE_X.length;
    if (this.consume("right")) this.cursor = (this.cursor + 1) % HOLE_X.length;
    this.consume("up");
    this.consume("down");
    if (this.consume("fire")) this.whack(this.cursor);

    for (const m of this.moles) {
      m.swing = Math.max(0, m.swing - dt);
      m.t -= dt * this.pace();
      if (m.t > 0) continue;
      if (m.phase === "down" || m.phase === "stunned") {
        m.phase = "up";
        m.t = UP_TIME;
        sfx("land");
      } else {
        m.phase = "down";
        m.t = DOWN_TIME + Math.random() * 0.8;
      }
    }
  }

  private popOut(m: Mole): number {
    if (m.phase === "down" || m.phase === "stunned") return 0;
    const used = UP_TIME - m.t;
    return Math.min(1, Math.min(used, m.t) / 0.25);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#8fd8ff");
    g.addColorStop(0.45, "#d8f2ff");
    g.addColorStop(0.46, "#7bc96f");
    g.addColorStop(1, "#4f9a47");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // keře a plot
    ctx.fillStyle = "#5aa84f";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(40 + i * 85, 188, 42, 24, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = "#c9a46a";
    for (let i = 0; i < 20; i++) ctx.fillRect(i * 34 + 4, 184, 6, 24);
    ctx.fillRect(0, 192, W, 4);

    const art = this.sp.has("dira", "dira") && this.sp.has("krtek", "nahoru");
    this.moles.forEach((m, i) => {
      const x = HOLE_X[i];
      const p = this.popOut(m);
      if (art) {
        this.drawMoleArt(ctx, m, i, x, p);
        return;
      }
      // dutina
      ctx.fillStyle = "#3b2a1c";
      ctx.beginPath();
      ctx.ellipse(x, HOLE_Y, 54, 17, 0, 0, Math.PI * 2);
      ctx.fill();

      if (p > 0 || m.phase === "stunned") {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 70, 120, 140, HOLE_Y - 120);
        ctx.clip();
        const rise = p * 62;
        const by = HOLE_Y + 48 - rise;
        ctx.fillStyle = "#8a5a3a";
        ctx.beginPath();
        ctx.ellipse(x, by, 36, 44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e9c8a0";
        ctx.beginPath();
        ctx.ellipse(x, by + 12, 20, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#16132b";
        ctx.beginPath();
        ctx.arc(x - 12, by - 12, 4, 0, Math.PI * 2);
        ctx.arc(x + 12, by - 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff8aa0";
        ctx.beginPath();
        ctx.ellipse(x, by - 2, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 5, by + 4, 4, 7);
        ctx.fillRect(x + 1, by + 4, 4, 7);
        ctx.restore();
        if (p > 0.6 && m.phase === "up") {
          drawLabel(ctx, m.label, x, HOLE_Y - 118 + (1 - p) * 20, 138, ANSWER_COLORS[i % ANSWER_COLORS.length], { height: 34, size: 15 });
        }
        if (m.phase === "stunned") {
          ctx.fillStyle = "#ffe066";
          ctx.font = "700 20px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("★ ★", x, HOLE_Y - 40);
        }
      }

      // hlína před dutinou
      ctx.fillStyle = "#6b4a2b";
      ctx.beginPath();
      ctx.ellipse(x, HOLE_Y + 6, 58, 14, 0, 0, Math.PI);
      ctx.fill();

      // kladivo
      if (m.swing > 0) {
        const a = (1 - m.swing / 0.22) * 1.2 - 0.6;
        ctx.save();
        ctx.translate(x + 38, HOLE_Y - 70);
        ctx.rotate(a);
        ctx.fillStyle = "#a0714d";
        ctx.fillRect(-4, -4, 8, 70);
        ctx.fillStyle = "#e5484d";
        ctx.beginPath();
        ctx.roundRect(-24, -26, 48, 28, 6);
        ctx.fill();
        ctx.restore();
      }
    });

    // kurzor pro ovládání klávesnicí
    const cx = HOLE_X[this.cursor];
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(cx, HOLE_Y, 64, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 3D krtek z Blenderu: díra, krtek vylézá z dutiny (přední okraj díry ho překrývá), kladivo při úderu.
  private drawMoleArt(ctx: CanvasRenderingContext2D, m: Mole, i: number, x: number, p: number) {
    const holeW = 128;
    const holeH = 52;
    this.sp.draw(ctx, "dira", "dira", x, HOLE_Y, holeW, holeH);
    if (p > 0 || m.phase === "stunned") {
      const rise = m.phase === "stunned" ? 46 : p * 86;
      const frame = m.phase === "stunned" ? "zasah" : p < 0.7 ? "vykukuje" : "nahoru";
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 80, 100, 160, HOLE_Y + 2 - 100);
      ctx.clip();
      this.sp.draw(ctx, "krtek", frame, x, HOLE_Y + 96 - rise, 84, 112, { anchorBottom: true });
      ctx.restore();
      // přední polovina okraje díry přes krtka
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - holeW / 2, HOLE_Y, holeW, holeH);
      ctx.clip();
      this.sp.draw(ctx, "dira", "dira", x, HOLE_Y, holeW, holeH);
      ctx.restore();
      if (p > 0.6 && m.phase === "up") {
        drawLabel(ctx, m.label, x, HOLE_Y - 130 + (1 - p) * 20, 138, ANSWER_COLORS[i % ANSWER_COLORS.length], { height: 34, size: 15 });
      }
    }
    if (m.swing > 0) {
      const t = 1 - m.swing / 0.22;
      this.sp.draw(ctx, "kladivo", t > 0.45 ? "uder" : "klid", x + 34, HOLE_Y - 70, 84, 84, { rot: t * 0.5 - 0.25 });
    }
  }
}
