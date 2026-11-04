import { ANSWER_COLORS, ArcadeEngine, H, W, drawLabel, shuffleInPlace } from "./arcade-base";
import { sfx } from "./game-fx";
import { Sprites } from "./sprites";

const HOLE_Y = 290;
const HOLE_X = [95, 245, 395, 545];
const UP_TIME = 2.0;
const DOWN_TIME = 0.9;

// Vysunutí krtka z díry (px) a jeho kreslená velikost (buňka listu je 224 × 240).
const RISE = 96;
const MOLE_W = 180;
const MOLE_H = 192;
// Kladivo: celý úder trvá SWING sekund, dopadne IMPACT_AT sekund po klepnutí.
const SWING = 0.3;
const IMPACT_AT = 0.17;
const HAMMER_W = 110;
const HAMMER_H = 192;
const HAMMER_PIVOT_CELL = 36; // kolik px nad spodním okrajem buňky kladiva je úchyt (cell 128 × 224)
// Při zásahu se čas na chvíli zastaví (hit-stop): úder je tak tvrdší a lépe čitelný.
const HIT_STOP = 0.085;

type Mole = {
  phase: "down" | "up" | "stunned";
  t: number;
  label: string;
  index: number;
  correct: boolean;
  swing: number; // zbývající čas švihu kladivem (0 = kladivo neletí)
  impacted: boolean; // tento švih už dopadl
  hitT: number; // čas posledního zásahu (pro stlačení a odskok)
  gone?: boolean;
};

type Clod = { x: number; y: number; vx: number; vy: number; t0: number; frame: number; spin: number; size: number };
type Ring = { x: number; t0: number; color: string };
type Boom = { x: number; y: number; t0: number; spin: number };
type Shout = { x: number; y: number; t0: number; text: string; color: string };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Krtek: čtyři krtci vystrkují hlavy a každý drží cedulku s odpovědí. Klepni kladivem na toho
// se správnou. Úder dopadne na krtka: zastaví se čas, odletí hlína, zvedne se prach a krtek
// se buď zatřese a omráčen se schová, nebo při správné odpovědi zatančí.
export class MoleEngine extends ArcadeEngine {
  private moles: Mole[] = [];
  private cursor = 1;
  private sp = new Sprites("mole");
  private hitStop = 0;
  private winI = -1;
  private winT = 0;
  private clods: Clod[] = [];
  private rings: Ring[] = [];
  private booms: Boom[] = [];
  private shouts: Shout[] = [];

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
      impacted: false,
      hitT: -10,
    }));
    this.cursor = 1;
    this.winI = -1;
    this.clods = [];
    this.rings = [];
    this.booms = [];
    this.shouts = [];
    this.hitStop = 0;
  }

  // Nápověda 50:50: špatní krtci se schovají a už nevylezou.
  protected eliminate(indices: number[]) {
    this.moles.forEach((m, i) => {
      if (m.correct || m.gone || !indices.includes(m.index)) return;
      m.gone = true;
      this.burst(HOLE_X[i], HOLE_Y - 40, "#ff5d73", 14);
      this.spawnClods(HOLE_X[i], HOLE_Y - 6, 6, 0.7);
    });
    sfx("pickup");
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
      this.swingAt(best);
    }
  }

  // Klepnutí spustí švih kladivem; zásah se počítá až v okamžiku dopadu (viz impact).
  private swingAt(i: number) {
    const m = this.moles[i];
    if (!m || m.gone || this.over || m.swing > 0) return;
    m.swing = SWING;
    m.impacted = false;
  }

  private impact(i: number) {
    const m = this.moles[i];
    if (!m || m.gone || this.over) return;
    const x = HOLE_X[i];
    const head = this.moleBottom(m, i) - MOLE_H * 0.6;
    if (m.phase !== "up") {
      // kladivo dopadlo vedle: jen prach a zklamaný zvuk
      this.spawnClods(x, HOLE_Y - 4, 6, 0.6);
      this.rings.push({ x, t0: this.time, color: "rgba(255,255,255,0.7)" });
      sfx("miss");
      return;
    }

    this.hitStop = HIT_STOP;
    m.hitT = this.time;
    this.booms.push({ x, y: head, t0: this.time, spin: Math.random() * 1.2 - 0.6 });
    this.rings.push({ x, t0: this.time, color: m.correct ? "#7ee0b0" : "#ffe066" });
    this.spawnClods(x, HOLE_Y - 8, m.correct ? 14 : 10, m.correct ? 1.2 : 1);
    this.burst(x, head, m.correct ? "#7ee0b0" : "#ff5d73", m.correct ? 30 : 20);
    sfx("hit");

    if (m.correct) {
      this.shake = 0.55;
      this.shouts.push({ x, y: Math.max(60, head - 70), t0: this.time, text: "BONK!", color: "#7ee0b0" });
      this.winI = i;
      this.winT = this.time;
      this.win(m.index);
    } else {
      this.wrong(m.index);
      this.shake = 0.45;
      m.phase = "stunned";
      m.t = 2.2 / this.pace();
      this.shouts.push({ x, y: Math.max(60, head - 70), t0: this.time, text: "AU!", color: "#ff8aa0" });
    }
  }

  private spawnClods(x: number, y: number, n: number, power: number) {
    for (let k = 0; k < n; k++) {
      this.clods.push({
        x: x + (Math.random() - 0.5) * 30,
        y,
        vx: (Math.random() - 0.5) * 260 * power,
        vy: -(170 + Math.random() * 190) * power,
        t0: this.time,
        frame: 1 + Math.floor(Math.random() * 3),
        spin: (Math.random() - 0.5) * 16,
        size: 16 + Math.random() * 14,
      });
    }
  }

  protected update(dt: number) {
    if (this.consume("left")) this.cursor = (this.cursor + HOLE_X.length - 1) % HOLE_X.length;
    if (this.consume("right")) this.cursor = (this.cursor + 1) % HOLE_X.length;
    this.consume("up");
    this.consume("down");
    if (this.consume("fire")) this.swingAt(this.cursor);

    // hit-stop: po zásahu chvíli stojí čas (krtek i kladivo), pak hra pokračuje
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    this.moles.forEach((m, i) => {
      if (m.swing > 0) {
        m.swing = Math.max(0, m.swing - dt);
        if (!m.impacted && SWING - m.swing >= IMPACT_AT) {
          m.impacted = true;
          this.impact(i);
        }
      }
      if (m.gone) {
        m.phase = "down";
        m.t = 9;
        return;
      }
      m.t -= dt * this.pace();
      if (m.t > 0) return;
      if (m.phase === "down" || m.phase === "stunned") {
        m.phase = "up";
        m.t = UP_TIME;
        sfx("land");
      } else {
        m.phase = "down";
        m.t = DOWN_TIME + Math.random() * 0.8;
      }
    });
  }

  // Jak moc je krtek vysunutý (0 schovaný, 1 plně nahoře).
  private popOut(m: Mole): number {
    if (m.phase === "down") return 0;
    if (m.phase === "stunned") return 1;
    const used = UP_TIME - m.t;
    return Math.min(1, Math.min(used, m.t) / 0.25);
  }

  // Y souřadnice spodku krtka (spodek je schovaný v díře, dokud je krtek dole).
  private moleBottom(m: Mole, i: number): number {
    const p = this.winI === i ? 1 : this.popOut(m);
    return HOLE_Y + 40 - p * RISE;
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

    const art = this.sp.has("dira", "dira") && this.sp.has("krtek", "nahoru_1") && this.sp.has("kladivo", "palka");

    // rozšiřující se kruh na zemi (dopad úderu)
    this.rings = this.rings.filter((r) => this.time - r.t0 < 0.45);
    for (const r of this.rings) {
      const tau = (this.time - r.t0) / 0.45;
      ctx.save();
      ctx.globalAlpha = 1 - tau;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 7 * (1 - tau) + 1;
      ctx.beginPath();
      ctx.ellipse(r.x, HOLE_Y + 8, 22 + tau * 92, 7 + tau * 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.moles.forEach((m, i) => {
      const x = HOLE_X[i];
      if (art) this.drawHoleBack(ctx, x);
      else this.drawVectorHoleBack(ctx, x);
      if (m.gone) {
        if (art) this.drawHoleFront(ctx, x);
        else this.drawVectorHoleFront(ctx, x);
        return;
      }
      if (this.popOut(m) > 0 || m.phase === "stunned" || this.winI === i) {
        if (art) this.drawMoleArt(ctx, m, i, x);
        else this.drawMoleVector(ctx, m, i, x);
      }
      if (art) this.drawHoleFront(ctx, x);
      else this.drawVectorHoleFront(ctx, x);
    });

    // kladivo (nad krtky, ale pod texty)
    this.moles.forEach((m, i) => {
      if (m.swing > 0 && !this.over) this.drawHammer(ctx, m, i, art);
    });

    // hrudky hlíny a úderová hvězda
    this.clods = this.clods.filter((c) => this.time - c.t0 < 1.2);
    for (const c of this.clods) {
      const tau = this.time - c.t0;
      const x = c.x + c.vx * tau;
      const y = c.y + c.vy * tau + 0.5 * 760 * tau * tau;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1.2 - tau) * 2.2);
      if (art) {
        this.sp.draw(ctx, "hlina", `hlina_${c.frame}`, x, y, c.size, c.size, { rot: c.spin * tau });
      } else {
        ctx.fillStyle = "#6b4a2b";
        ctx.beginPath();
        ctx.arc(x, y, c.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    this.booms = this.booms.filter((b) => this.time - b.t0 < 0.38);
    for (const b of this.booms) {
      const tau = (this.time - b.t0) / 0.38;
      const size = 40 + 110 * easeOut(tau);
      ctx.save();
      ctx.globalAlpha = 1 - tau * tau;
      if (art) {
        this.sp.draw(ctx, "bum", "bum", b.x, b.y, size, size, { rot: b.spin + tau * 0.8 });
      } else {
        ctx.fillStyle = "#ffe066";
        ctx.beginPath();
        ctx.arc(b.x, b.y, size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // nápisy „BONK!“ a „AU!“ — vyskočí, zvětší se a pomalu zmizí
    this.shouts = this.shouts.filter((s) => this.time - s.t0 < 1.0);
    for (const s of this.shouts) {
      const tau = (this.time - s.t0) / 1.0;
      const pop = tau < 0.18 ? easeOut(tau / 0.18) * 1.35 : 1.35 - (tau - 0.18) * 0.6;
      ctx.save();
      ctx.globalAlpha = tau < 0.6 ? 1 : 1 - (tau - 0.6) / 0.4;
      ctx.translate(s.x, s.y - tau * 14);
      ctx.rotate(-0.08);
      ctx.scale(pop, pop);
      ctx.font = "900 30px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 7;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#16132b";
      ctx.strokeText(s.text, 0, 0);
      ctx.fillStyle = s.color;
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }

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

  private drawHoleBack(ctx: CanvasRenderingContext2D, x: number) {
    this.sp.draw(ctx, "dira", "dira", x, HOLE_Y, 136, 56);
  }

  // přední okraj díry přes krtka (spodní polovina sprite, jen pod čarou díry)
  private drawHoleFront(ctx: CanvasRenderingContext2D, x: number) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 70, HOLE_Y, 140, 40);
    ctx.clip();
    this.sp.draw(ctx, "dira", "dira", x, HOLE_Y, 136, 56);
    ctx.restore();
  }

  // Krtek: pozice, squash po zásahu, kolébání při omámení a odskok po zásahu.
  private drawMoleArt(ctx: CanvasRenderingContext2D, m: Mole, i: number, x: number) {
    const bottom = this.moleBottom(m, i);
    const sinceHit = this.time - m.hitT;
    const hitEnv = Math.max(0, 1 - sinceHit / 0.35);
    const idle = 1 + 0.012 * Math.sin(this.time * 3.4 + i * 1.7);

    let frame: string;
    let bounce = 0;
    let wobble = 0;
    const winner = this.winI === i;
    if (winner) {
      const tau = this.time - this.winT;
      frame = Math.floor(tau * 4) % 2 ? "vitez_2" : "vitez_1";
      bounce = Math.abs(Math.sin(tau * 6.5)) * 26 * Math.max(0.4, 1 - tau * 0.12);
    } else if (m.phase === "stunned") {
      frame = sinceHit < 0.3 ? "zasah" : "omamen";
      bounce = sinceHit < 0.35 ? Math.sin((sinceHit / 0.35) * Math.PI) * 26 : 0;
      wobble = frame === "omamen" ? Math.sin(this.time * 5) * 0.1 : 0;
    } else {
      const p = this.popOut(m);
      if (p < 0.55) frame = "vykukuje";
      else {
        const k = (this.time * 0.9 + i * 0.31) % 3.2;
        frame = k < 0.14 ? "nahoru_2" : k > 2.6 && k < 2.9 ? "nahoru_3" : "nahoru_1";
      }
    }
    const squashX = 1 + 0.13 * hitEnv;
    const squashY = 1 - 0.13 * hitEnv;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, HOLE_Y + 2);
    ctx.clip();
    ctx.translate(x, bottom - bounce);
    ctx.rotate(wobble);
    ctx.scale(squashX, squashY * idle);
    this.sp.draw(ctx, "krtek", frame, 0, -MOLE_H / 2, MOLE_W, MOLE_H);
    ctx.restore();

    if (!winner && m.phase === "up" && this.popOut(m) > 0.6) {
      drawLabel(ctx, m.label, x, Math.max(24, bottom - MOLE_H - 4), 138, ANSWER_COLORS[i % ANSWER_COLORS.length], { height: 34, size: 15 });
    }
    if (winner) {
      drawLabel(ctx, m.label, x, Math.max(24, bottom - MOLE_H - 4 - bounce), 138, ANSWER_COLORS[i % ANSWER_COLORS.length], { height: 34, size: 15 });
    }
    if (m.phase === "stunned" && !winner) {
      // tři hvězdičky kroužící nad hlavou
      const headY = bottom - MOLE_H * 0.7;
      for (let k = 0; k < 3; k++) {
        const a = this.time * 5 + (k * Math.PI * 2) / 3;
        const sx = x + Math.cos(a) * 46;
        const sy = headY - 14 + Math.sin(a) * 9;
        ctx.save();
        ctx.font = "800 22px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(40,30,10,0.85)";
        ctx.strokeText("★", sx, sy);
        ctx.fillStyle = "#ffe066";
        ctx.fillText("★", sx, sy);
        ctx.restore();
      }
    }
  }

  // Kladivo: švih z pozice „nad ramenem“ přes dopad na krtka, pak krátký odraz.
  private drawHammer(ctx: CanvasRenderingContext2D, m: Mole, i: number, art: boolean) {
    const x = HOLE_X[i];
    const e = SWING - m.swing;
    const deg = e < IMPACT_AT ? lerp(38, -34, easeIn(e / IMPACT_AT)) : lerp(-34, 14, (e - IMPACT_AT) / (SWING - IMPACT_AT));
    ctx.save();
    ctx.translate(x + 78, HOLE_Y - 34);
    ctx.rotate((deg * Math.PI) / 180);
    if (art) {
      const s = HAMMER_H / 224;
      // úchyt je HAMMER_PIVOT_CELL px nad spodním okrajem, proto se obrázek posune nahoru
      this.sp.draw(ctx, "kladivo", "palka", 0, HAMMER_PIVOT_CELL * s - HAMMER_H / 2, HAMMER_W, HAMMER_H);
    } else {
      ctx.fillStyle = "#a0714d";
      ctx.fillRect(-4, -4, 8, 70);
      ctx.fillStyle = "#e5484d";
      ctx.beginPath();
      ctx.roundRect(-24, -66, 48, 28, 6);
      ctx.fill();
    }
    ctx.restore();
  }

  // Vektorová záloha (když se listy nenačtou): krtek nakreslený kódem, bez obrázků.
  private drawVectorHoleBack(ctx: CanvasRenderingContext2D, x: number) {
    ctx.fillStyle = "#3b2a1c";
    ctx.beginPath();
    ctx.ellipse(x, HOLE_Y, 54, 17, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawVectorHoleFront(ctx: CanvasRenderingContext2D, x: number) {
    ctx.fillStyle = "#6b4a2b";
    ctx.beginPath();
    ctx.ellipse(x, HOLE_Y + 6, 58, 14, 0, 0, Math.PI);
    ctx.fill();
  }

  private drawMoleVector(ctx: CanvasRenderingContext2D, m: Mole, i: number, x: number) {
    const p = this.popOut(m);
    if (p <= 0 && m.phase !== "stunned") return;
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
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeIn(t: number) {
  return t * t;
}
