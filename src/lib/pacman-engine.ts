import { ANSWER_COLORS, ArcadeEngine, DIR_VEC, H, OPPOSITE, W, drawLabel, shuffleInPlace, type Dir } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const GHOST_FRAME: Record<string, string> = { "#ff4d4d": "cerveny", "#ff9ecb": "ruzovy", "#4de3ff": "modry", "#ffb347": "oranzovy" };

const C = 20;
const COLS = 31;
const ROWS = 19;
const OX = (W - COLS * C) / 2;
const OY = 30;
const DIRS: Dir[] = ["left", "right", "up", "down"];
const GHOST_COLORS = ["#ff4d4d", "#ff9ecb", "#4de3ff", "#ffb347"];

type Ent = { tx: number; ty: number; dx: number; dy: number; t: number };
type Ghost = Ent & { sx: number; sy: number; wait: number; color: string; eatenWait: number };
type Answer = { tx: number; ty: number; label: string; correct: boolean; alive: boolean; index: number; color: string };

export class PacmanEngine extends ArcadeEngine {
  private sp = new Sprites("pacman");
  private walls: boolean[][] = [];
  private dots: number[][] = []; // 0 nic, 1 tečka, 2 power pilulka
  private maze: HTMLCanvasElement | null = null;
  private pac: Ent = { tx: 15, ty: 9, dx: 0, dy: 0, t: 0 };
  private ghosts: Ghost[] = [];
  private answers: Answer[] = [];
  private scared = 0;
  private invuln = 0;
  private startX = 15;
  private startY = 9;

  protected questionTime() {
    return 60;
  }

  protected setup(options: string[], correctIndex: number) {
    this.generate();
    this.pac = { tx: this.startX, ty: this.startY, dx: 0, dy: 0, t: 0 };
    this.scared = 0;
    this.invuln = 0;
    this.ghosts = [];
    this.answers = [];
    if (options.length === 0) return;
    const dist = this.bfs(this.startX, this.startY);
    const open: [number, number][] = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) if (!this.walls[y][x]) open.push([x, y]);

    // Odpovědi: nejlépe ve slepých uličkách, daleko od startu a od sebe.
    const deg = (x: number, y: number) => DIRS.filter((d) => this.isOpen(x + DIR_VEC[d].x, y + DIR_VEC[d].y)).length;
    const chosen: [number, number][] = [];
    for (const minGap of [11, 8, 5, 2]) {
      if (chosen.length >= options.length) break;
      const pool = shuffleInPlace(open.filter(([x, y]) => deg(x, y) === 1 || minGap < 6));
      for (const [x, y] of pool) {
        if (chosen.length >= options.length) break;
        if (dist[y][x] < 10) continue;
        if (chosen.some(([cx, cy]) => Math.abs(cx - x) + Math.abs(cy - y) < minGap)) continue;
        chosen.push([x, y]);
      }
    }
    const mixed = shuffleInPlace(options.map((_, i) => i));
    this.answers = chosen.slice(0, options.length).map(([x, y], k) => ({
      tx: x,
      ty: y,
      label: options[mixed[k]],
      correct: mixed[k] === correctIndex,
      alive: true,
      index: mixed[k],
      color: ANSWER_COLORS[k % ANSWER_COLORS.length],
    }));
    for (const a of this.answers) this.dots[a.ty][a.tx] = 0;

    // Duchové startují daleko od hráče.
    const round = this.config.round ?? 0;
    // Snadnější obtížnosti mají méně duchů, kteří se objeví později.
    const gentle = this.config.alienSpeedFactor <= 0.7;
    const count = gentle ? 1 + (round >= 3 ? 1 : 0) + (round >= 6 || this.config.boss ? 1 : 0) : 2 + (round >= 2 ? 1 : 0) + (round >= 5 || this.config.boss ? 1 : 0);
    const far = shuffleInPlace(open.filter(([x, y]) => dist[y][x] >= 16 && !this.answers.some((a) => a.tx === x && a.ty === y)));
    const spawns: [number, number][] = [];
    for (const [x, y] of far) {
      if (spawns.length >= count) break;
      if (spawns.every(([sx, sy]) => Math.abs(sx - x) + Math.abs(sy - y) > 8)) spawns.push([x, y]);
    }
    while (spawns.length < count) spawns.push(far[spawns.length % Math.max(1, far.length)] ?? [1, 1]);
    this.ghosts = spawns.map(([x, y], i) => ({
      tx: x,
      ty: y,
      dx: 0,
      dy: 0,
      t: 0,
      sx: x,
      sy: y,
      wait: 2.5 + i * 0.8,
      color: GHOST_COLORS[i % GHOST_COLORS.length],
      eatenWait: 0,
    }));
    // Power pilulky v rozích mapy.
    const powers = shuffleInPlace(open.filter(([x, y]) => dist[y][x] >= 8 && this.dots[y][x] === 1)).slice(0, 3);
    for (const [x, y] of powers) this.dots[y][x] = 2;
  }

  protected eliminate(indices: number[]) {
    for (const a of this.answers) {
      if (!a.alive || a.correct || !indices.includes(a.index)) continue;
      a.alive = false;
      this.burst(OX + (a.tx + 0.5) * C, OY + (a.ty + 0.5) * C, a.color, 14);
    }
    sfx("pickup");
  }

  private isOpen(x: number, y: number) {
    return x >= 0 && y >= 0 && x < COLS && y < ROWS && !this.walls[y][x];
  }

  private generate() {
    const walls = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(true));
    const stack: [number, number][] = [[1, 1]];
    walls[1][1] = false;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const options = shuffleInPlace(
        ([[2, 0], [-2, 0], [0, 2], [0, -2]] as [number, number][]).filter(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          return nx > 0 && ny > 0 && nx < COLS - 1 && ny < ROWS - 1 && walls[ny][nx];
        }),
      );
      if (options.length === 0) {
        stack.pop();
        continue;
      }
      const [dx, dy] = options[0];
      walls[y + dy / 2][x + dx / 2] = false;
      walls[y + dy][x + dx] = false;
      stack.push([x + dx, y + dy]);
    }
    // Smyčky: odstraníme část zdí, aby nevznikaly slepé uličky, ve kterých by hráč uvízl.
    const candidates: [number, number][] = [];
    for (let y = 1; y < ROWS - 1; y++)
      for (let x = 1; x < COLS - 1; x++) {
        if (!walls[y][x]) continue;
        const horizontal = !walls[y][x - 1] && !walls[y][x + 1];
        const vertical = !walls[y - 1][x] && !walls[y + 1][x];
        if (horizontal || vertical) candidates.push([x, y]);
      }
    for (const [x, y] of shuffleInPlace(candidates).slice(0, 55)) walls[y][x] = false;
    this.walls = walls;
    this.dots = walls.map((row) => row.map((w) => (w ? 0 : 1)));
    this.dots[this.startY][this.startX] = 0;
    this.renderMaze();
  }

  // Zdi ze spritů: podle sousedních zdí se vybere rovný kus, roh, T, křižovatka nebo konec.
  private drawMazeSprites(ctx: CanvasRenderingContext2D): boolean {
    if (!this.sp.has("bludiste", "rovne")) return false;
    const wall = (x: number, y: number) => x < 0 || y < 0 || x >= COLS || y >= ROWS || this.walls[y][x];
    const Q = Math.PI / 2;
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        if (!this.walls[y][x]) continue;
        const n = wall(x, y - 1);
        const e = wall(x + 1, y);
        const s = wall(x, y + 1);
        const w = wall(x - 1, y);
        const count = +n + +e + +s + +w;
        let frame = "konec";
        let rot = 0;
        if (count === 4) frame = "krizovatka";
        else if (count === 3) {
          frame = "t";
          rot = !n ? 0 : !e ? Q : !s ? 2 * Q : 3 * Q;
          // základ T: chybí sever
          rot = !n ? 0 : !e ? Q : !s ? 2 * Q : 3 * Q;
        } else if (count === 2) {
          if (e && w) frame = "rovne";
          else if (n && s) {
            frame = "rovne";
            rot = Q;
          } else {
            frame = "roh";
            // základ rohu: východ + jih
            rot = e && s ? 0 : s && w ? Q : w && n ? 2 * Q : 3 * Q;
          }
        } else if (count === 1) {
          rot = e ? 0 : s ? Q : w ? 2 * Q : 3 * Q;
        }
        this.sp.draw(ctx, "bludiste", frame, OX + (x + 0.5) * C, OY + (y + 0.5) * C, C, C, { rot });
      }
    return true;
  }

  private renderMaze() {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0b0a1f";
    g.fillRect(0, 0, W, H);
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        if (!this.walls[y][x]) continue;
        const px = OX + x * C;
        const py = OY + y * C;
        g.fillStyle = "#1b2cc4";
        g.beginPath();
        g.roundRect(px + 1, py + 1, C - 2, C - 2, 5);
        g.fill();
        g.strokeStyle = "#5a7bff";
        g.lineWidth = 1.5;
        g.stroke();
      }
    this.maze = c;
  }

  private bfs(sx: number, sy: number) {
    const dist = Array.from({ length: ROWS }, () => Array<number>(COLS).fill(999));
    dist[sy][sx] = 0;
    const queue: [number, number][] = [[sx, sy]];
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const d of DIRS) {
        const nx = x + DIR_VEC[d].x;
        const ny = y + DIR_VEC[d].y;
        if (this.isOpen(nx, ny) && dist[ny][nx] === 999) {
          dist[ny][nx] = dist[y][x] + 1;
          queue.push([nx, ny]);
        }
      }
    }
    return dist;
  }

  private canGo(e: Ent, d: Dir) {
    return this.isOpen(e.tx + DIR_VEC[d].x, e.ty + DIR_VEC[d].y);
  }

  private setDir(e: Ent, d: Dir | null) {
    e.dx = d ? DIR_VEC[d].x : 0;
    e.dy = d ? DIR_VEC[d].y : 0;
  }

  private dirOf(e: Ent): Dir | null {
    return DIRS.find((d) => DIR_VEC[d].x === e.dx && DIR_VEC[d].y === e.dy && (e.dx || e.dy)) ?? null;
  }

  private posX(e: Ent) {
    return OX + (e.tx + e.dx * e.t + 0.5) * C;
  }

  private posY(e: Ent) {
    return OY + (e.ty + e.dy * e.t + 0.5) * C;
  }

  protected update(dt: number) {
    const speedBase = this.pace();
    // --- Pac-Man ---
    const pac = this.pac;
    const wanted = this.lastDir;
    const cur = this.dirOf(pac);
    if (wanted && cur && wanted === OPPOSITE[cur]) {
      pac.tx += pac.dx;
      pac.ty += pac.dy;
      pac.t = 1 - pac.t;
      this.setDir(pac, wanted);
    }
    if (!cur && wanted && this.canGo(pac, wanted)) {
      this.setDir(pac, wanted);
      pac.t = 0;
    }
    if (pac.dx || pac.dy) {
      pac.t += 6.2 * this.moveMul() * Math.min(1.25, 0.9 + (speedBase - 1) * 0.3) * dt;
      while (pac.t >= 1) {
        pac.t -= 1;
        pac.tx += pac.dx;
        pac.ty += pac.dy;
        this.arrive();
        const w = this.lastDir;
        if (w && this.canGo(pac, w)) this.setDir(pac, w);
        else if (!this.canGo(pac, this.dirOf(pac)!)) {
          this.setDir(pac, null);
          pac.t = 0;
          break;
        }
      }
    }

    this.scared = Math.max(0, this.scared - dt);
    this.invuln = Math.max(0, this.invuln - dt);

    // --- duchové ---
    const gSpeed = 4.3 * Math.min(1.45, speedBase);
    for (const g of this.ghosts) {
      if (g.eatenWait > 0) {
        g.eatenWait -= dt;
        continue;
      }
      if (g.wait > 0) {
        g.wait -= dt;
        continue;
      }
      if (!g.dx && !g.dy) this.ghostThink(g);
      const slow = this.scared > 0 ? 0.6 : 1;
      g.t += gSpeed * slow * dt;
      while (g.t >= 1 && (g.dx || g.dy)) {
        g.t -= 1;
        g.tx += g.dx;
        g.ty += g.dy;
        this.ghostThink(g);
      }
    }

    // --- kolize ---
    const px = this.posX(pac);
    const py = this.posY(pac);
    for (const a of this.answers) {
      if (!a.alive) continue;
      const ax = OX + (a.tx + 0.5) * C;
      const ay = OY + (a.ty + 0.5) * C;
      if (Math.hypot(ax - px, ay - py) < C * 0.55) {
        if (a.correct) {
          this.burst(ax, ay, a.color, 26);
          this.win(a.index);
          return;
        }
        a.alive = false;
        this.burst(ax, ay, "#ff5d73", 20);
        this.wrong(a.index);
      }
    }
    for (const g of this.ghosts) {
      if (g.eatenWait > 0) continue;
      if (Math.hypot(this.posX(g) - px, this.posY(g) - py) < C * 0.7) {
        if (this.scared > 0) {
          this.burst(this.posX(g), this.posY(g), "#9fd3ff", 16);
          this.popText("👻", "#9fd3ff", this.posX(g), this.posY(g) - 16);
          sfx("pickup");
          g.tx = g.sx;
          g.ty = g.sy;
          g.dx = 0;
          g.dy = 0;
          g.t = 0;
          g.eatenWait = 4;
        } else if (this.invuln <= 0) {
          this.hitByGhost();
          return;
        }
      }
    }
  }

  private arrive() {
    const pac = this.pac;
    const v = this.dots[pac.ty][pac.tx];
    if (v === 1) this.dots[pac.ty][pac.tx] = 0;
    else if (v === 2) {
      this.dots[pac.ty][pac.tx] = 0;
      this.scared = 7;
      sfx("pickup");
      this.popText("⚡", "#9fd3ff", this.posX(pac), this.posY(pac) - 16);
    }
  }

  private hitByGhost() {
    this.damage();
    this.burst(this.posX(this.pac), this.posY(this.pac), "#ffe066", 22);
    this.pac = { tx: this.startX, ty: this.startY, dx: 0, dy: 0, t: 0 };
    this.lastDir = null;
    this.invuln = 2.5;
    for (const g of this.ghosts) {
      g.tx = g.sx;
      g.ty = g.sy;
      g.dx = 0;
      g.dy = 0;
      g.t = 0;
      g.wait = 2;
    }
  }

  private ghostThink(g: Ghost) {
    const cur = this.dirOf(g);
    let options = DIRS.filter((d) => this.canGo(g, d) && !(cur && d === OPPOSITE[cur]));
    if (options.length === 0) options = DIRS.filter((d) => this.canGo(g, d));
    if (options.length === 0) {
      this.setDir(g, null);
      return;
    }
    const dist = (d: Dir) => Math.abs(g.tx + DIR_VEC[d].x - this.pac.tx) + Math.abs(g.ty + DIR_VEC[d].y - this.pac.ty);
    let pick: Dir;
    if (this.scared > 0) pick = options.reduce((a, b) => (dist(b) > dist(a) ? b : a));
    else if (Math.random() < Math.min(0.7, 0.7 * Math.pow(this.config.alienSpeedFactor, 1.2))) pick = options.reduce((a, b) => (dist(b) < dist(a) ? b : a));
    else pick = options[Math.floor(Math.random() * options.length)];
    this.setDir(g, pick);
  }

  protected draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#0b0a1f";
    ctx.fillRect(0, 0, W, H);
    if (!this.drawMazeSprites(ctx) && this.maze) ctx.drawImage(this.maze, 0, 0, W, H);
    // tečky
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const v = this.dots[y]?.[x];
        if (!v) continue;
        const cx = OX + (x + 0.5) * C;
        const cy = OY + (y + 0.5) * C;
        if (this.sp.draw(ctx, "tecky", v === 2 ? "energie" : "tecka", cx, cy, v === 2 ? 17 + Math.sin(this.time * 8) * 2 : 12, v === 2 ? 17 + Math.sin(this.time * 8) * 2 : 12)) continue;
        ctx.fillStyle = "#ffe9a8";
        ctx.beginPath();
        ctx.arc(cx, cy, v === 2 ? 5 + Math.sin(this.time * 8) : 2, 0, Math.PI * 2);
        ctx.fill();
      }
    for (const g of this.ghosts) this.drawGhost(ctx, g);
    this.drawPac(ctx);
    // odpovědi nahoře, aby byly čitelné
    for (const a of this.answers) {
      if (!a.alive) continue;
      const ax = OX + (a.tx + 0.5) * C;
      const ay = OY + (a.ty + 0.5) * C;
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(ax, ay, 6 + Math.sin(this.time * 6) * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      const maxW = 150;
      const above = ay > 70;
      const ly = above ? ay - 22 : ay + 24;
      const lx = Math.max(maxW / 2 + 3, Math.min(W - maxW / 2 - 3, ax));
      drawLabel(ctx, a.label, lx, ly, maxW, a.color, { alpha: 0.95 });
    }
    if (this.scared > 0) {
      ctx.fillStyle = "#9fd3ff";
      ctx.fillRect(0, H - 5, (W * this.scared) / 7, 5);
    }
  }

  private drawPac(ctx: CanvasRenderingContext2D) {
    const pac = this.pac;
    if (this.invuln > 0 && Math.floor(this.time * 10) % 2 === 0) return;
    const x = this.posX(pac);
    const y = this.posY(pac);
    const dir = this.dirOf(pac) ?? this.lastDir ?? "right";
    const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir];
    const moving = pac.dx || pac.dy;
    const open = moving ? Math.abs(Math.sin(this.time * 14)) : 0.3;
    if (this.sp.draw(ctx, "pac", open > 0.66 ? "otevrena" : open > 0.33 ? "pootevrena" : "zavrena", x, y, C * 1.35, C * 1.35, { rot: angle })) return;
    const mouth = moving ? (0.15 + 0.3 * Math.abs(Math.sin(this.time * 14))) * Math.PI : 0.2 * Math.PI;
    ctx.fillStyle = "#ffe14d";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, C * 0.46, angle + mouth, angle - mouth + Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#16132b";
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle - 1.1) * 4, y + Math.sin(angle - 1.1) * 4, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGhost(ctx: CanvasRenderingContext2D, g: Ghost) {
    if (g.eatenWait > 0) return;
    const x = this.posX(g);
    const y = this.posY(g);
    const r = C * 0.46;
    const blink = this.scared > 0 && this.scared < 2 && Math.floor(this.time * 8) % 2 === 0;
    const step = Math.floor(this.time * 6) % 2 === 0 ? "_1" : "_2";
    const gname = this.scared > 0 ? (blink ? "vystraseny_blik" : "vystraseny" + step) : (GHOST_FRAME[g.color] ?? "cerveny") + step;
    if (this.sp.draw(ctx, "duchove", gname, x, y, C * 1.35, C * 1.35)) return;
    ctx.fillStyle = this.scared > 0 ? (blink ? "#ffffff" : "#3b5bff") : g.color;
    ctx.beginPath();
    ctx.arc(x, y - 1, r, Math.PI, 0);
    ctx.lineTo(x + r, y + r);
    const wave = Math.sin(this.time * 12) * 1.5;
    for (let i = 0; i < 3; i++) {
      const bx = x + r - (i + 0.5) * ((r * 2) / 3);
      ctx.lineTo(bx + 2, y + r - 3 + (i % 2 ? wave : -wave));
      ctx.lineTo(bx - 2, y + r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + s * 3.2, y - 2, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = this.scared > 0 ? "#ffd1e0" : "#16132b";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + s * 3.2 + g.dx * 1.2, y - 2 + g.dy * 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
