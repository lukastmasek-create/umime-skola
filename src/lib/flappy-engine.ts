import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const BIRD_X = 150;
const BIRD_R = 13;
const WALL_W = 70;
const GAP_BASE = 74;
const GAP_CENTERS = [56, 150, 244, 338];
const GRAVITY = 760;
const FLAP = -265;
const GROUND = H - 8;

// Letící ptáček: každé kolo letí zeď se čtyřmi průlety, u každého je odpověď.
// Proletíš tím správným a vyhráváš, špatný průlet ubere život. Náraz do zdi nebo země taky.
export class FlappyEngine extends ArcadeEngine {
  private order: number[] = [];
  private labels: string[] = [];
  private correct = 0;
  private birdY = H / 2;
  private vy = 0;
  private wallX = W + 40;
  private gapIndex: number | null = null;
  private wait = 1.2;
  private hitFlash = 0;
  private eliminated = new Set<number>();
  private sp = new Sprites("flappy");
  private clouds = Array.from({ length: 5 }, (_, i) => ({ x: i * 140, y: 30 + (i % 3) * 55, s: 0.7 + (i % 2) * 0.4 }));

  protected questionTime() {
    return 75;
  }

  // Průlet o něco větší a pomalejší pád pro snazší obtížnosti.
  private gapH() {
    return Math.min(84, GAP_BASE * this.forgive());
  }

  private blocked(i: number) {
    return this.eliminated.has(this.order[i]);
  }

  protected eliminate(indices: number[]) {
    for (const i of indices) {
      if (i === this.correct) continue;
      this.eliminated.add(i);
      const g = this.order.indexOf(i);
      if (g >= 0) this.burst(this.wallX + WALL_W / 2, GAP_CENTERS[g], "#ff5d73", 14);
    }
    sfx("pickup");
  }

  protected setup(options: string[], correctIndex: number) {
    this.eliminated = new Set();
    this.labels = options;
    this.correct = correctIndex;
    this.order = shuffleInPlace(options.map((_, i) => i));
    this.birdY = H / 2;
    this.vy = 0;
    this.wait = 1.2;
    this.wallX = W + 40;
    this.gapIndex = null;
  }

  protected usesSwipe() {
    return false;
  }

  protected onTap() {
    this.flap();
  }

  // Snazší obtížnost = pomalejší, plovoucí let: nižší gravitace a úměrně slabší mávnutí (stejná výška skoku).
  private floaty() {
    return Math.max(0.5, 1 / Math.pow(this.forgive(), 1.6));
  }

  private flap() {
    this.vy = FLAP * Math.sqrt(this.floaty());
    if (this.wait > 0) this.wait = Math.min(this.wait, 0.25);
    sfx("shoot");
  }

  private restartWall() {
    this.order = shuffleInPlace(this.order);
    this.wallX = W + 40;
    this.gapIndex = null;
  }

  private crash() {
    this.damage();
    this.hitFlash = 0.5;
    this.birdY = H / 2;
    this.vy = 0;
    this.wait = 0.9;
    this.restartWall();
    this.wallX = W + 200;
  }

  protected update(dt: number) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.consume("fire") || this.consume("up")) this.flap();
    this.consume("down");
    this.consume("left");
    this.consume("right");

    if (this.wait > 0) {
      this.wait -= dt;
      this.birdY = H / 2 + Math.sin(this.time * 5) * 6;
      return;
    }

    this.vy += GRAVITY * this.floaty() * dt;
    this.birdY += this.vy * dt;
    if (this.birdY < BIRD_R) {
      this.birdY = BIRD_R;
      this.vy = 0;
    }
    if (this.birdY > GROUND - BIRD_R) {
      this.crash();
      return;
    }

    this.wallX -= 100 * this.pace() * dt;
    const overlaps = this.wallX < BIRD_X + BIRD_R && this.wallX + WALL_W > BIRD_X - BIRD_R;
    if (overlaps) {
      const h = this.gapH();
      const inside = GAP_CENTERS.findIndex((c, i) => !this.blocked(i) && this.birdY - BIRD_R * 0.8 >= c - h / 2 && this.birdY + BIRD_R * 0.8 <= c + h / 2);
      if (inside < 0) {
        this.crash();
        return;
      }
      this.gapIndex = inside;
    } else if (this.gapIndex !== null && this.wallX + WALL_W < BIRD_X - BIRD_R) {
      const option = this.order[this.gapIndex];
      const x = BIRD_X;
      const y = this.birdY;
      this.gapIndex = null;
      if (option === this.correct) {
        this.burst(x, y, "#7ee0b0", 28);
        this.win(option);
      } else {
        this.burst(x, y, "#ff5d73", 16);
        this.wrong(option);
        this.restartWall();
      }
    }

    for (const c of this.clouds) {
      c.x -= 14 * dt;
      if (c.x < -90) c.x = W + 60;
    }
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#6ec6ff");
    g.addColorStop(1, "#d8f2ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const c of this.clouds) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 34 * c.s, 14 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(c.x + 22 * c.s, c.y + 4, 24 * c.s, 11 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(c.x - 24 * c.s, c.y + 5, 22 * c.s, 10 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // země
    ctx.fillStyle = "#7bc96f";
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = "#5aa84f";
    ctx.fillRect(0, GROUND, W, 3);

    // zeď: úseky mezi průlety
    const h = this.gapH();
    const open = GAP_CENTERS.filter((_, i) => !this.blocked(i));
    const edges: [number, number][] = [[0, open[0] - h / 2]];
    for (let i = 0; i < open.length - 1; i++) edges.push([open[i] + h / 2, open[i + 1] - h / 2]);
    edges.push([open[open.length - 1] + h / 2, GROUND]);
    for (const [y0, y1] of edges) {
      if (this.drawWall(ctx, y0, y1, y0 > 0, y1 < GROUND)) continue;
      ctx.fillStyle = "#3fae4a";
      ctx.strokeStyle = "#1f6b2b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(this.wallX, y0 - 4, WALL_W, y1 - y0 + 8, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(this.wallX + 8, y0, 8, y1 - y0);
    }

    // popisky odpovědí v průletech
    GAP_CENTERS.forEach((c, i) => {
      const option = this.order[i];
      if (option === undefined || this.blocked(i)) return;
      drawLabel(ctx, this.labels[option], this.wallX + WALL_W / 2, c, 156, ANSWER_COLORS[i % ANSWER_COLORS.length], { height: 30, size: 14, alpha: 0.95 });
    });

    // ptáček (3D render: mávání podle času, po nárazu zčervená)
    const tilt = Math.max(-0.5, Math.min(0.9, this.vy / 520));
    const wing = `mavani_${1 + (Math.floor(this.time * 12) % 3)}`;
    if (this.sp.draw(ctx, "ptacek", this.hitFlash > 0 ? "naraz" : wing, BIRD_X, this.birdY, 36, 36, { rot: tilt })) {
      this.drawHint(ctx);
      return;
    }
    ctx.save();
    ctx.translate(BIRD_X, this.birdY);
    ctx.rotate(Math.max(-0.5, Math.min(0.9, this.vy / 520)));
    ctx.fillStyle = "#ffd24d";
    ctx.strokeStyle = "rgba(10,8,30,0.7)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const flap = Math.sin(this.time * 18) * 5;
    ctx.fillStyle = "#ffb020";
    ctx.beginPath();
    ctx.ellipse(-3, 3, 8, 5 + flap * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(5, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#16132b";
    ctx.beginPath();
    ctx.arc(6.4, -4, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.moveTo(BIRD_R - 1, -1);
    ctx.lineTo(BIRD_R + 9, 2);
    ctx.lineTo(BIRD_R - 1, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    this.drawHint(ctx);
  }

  private drawHint(ctx: CanvasRenderingContext2D) {
    if (this.wait > 0 && !this.over) {
      ctx.fillStyle = "rgba(10,8,30,0.7)";
      ctx.font = "700 14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("▲", BIRD_X, this.birdY - 26);
    }
  }

  // Úsek zdi z 3D dílů: tělo se opakuje po 20 px, u průletů je hlavice (nahoře otočená).
  private drawWall(ctx: CanvasRenderingContext2D, y0: number, y1: number, capTop: boolean, capBottom: boolean): boolean {
    if (!this.sp.has("zed_telo", "zed_telo") || !this.sp.has("zed_hlavice", "zed_hlavice")) return false;
    const cx = this.wallX + WALL_W / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.wallX - 8, y0, WALL_W + 16, y1 - y0);
    ctx.clip();
    for (let y = y0; y < y1; y += 19) this.sp.draw(ctx, "zed_telo", "zed_telo", cx, y + 10, WALL_W, 20);
    ctx.restore();
    if (capTop) this.sp.draw(ctx, "zed_hlavice", "zed_hlavice", cx, y0 + 6, WALL_W + 4, 20, { rot: Math.PI });
    if (capBottom) this.sp.draw(ctx, "zed_hlavice", "zed_hlavice", cx, y1 - 6, WALL_W + 4, 20);
    return true;
  }
}
