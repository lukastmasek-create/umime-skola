// Boti pro bílé testování her: čtou vnitřek enginu přes window.__quizEngine a hrají jako rozumný hráč.
(function () {
  const dirs = ["left", "right", "up", "down"];
  const clearDirs = { left: false, right: false, up: false, down: false };
  const V = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };

  function setDir(e, d) {
    e.setInput({ ...clearDirs });
    if (d) e.setInput({ [d]: true });
  }

  const bots = {};

  // ---- Space Invaders: pod správného vetřelce a střílet ----
  bots["space-invaders"] = (e, st) => {
    const target = e.aliens.map((a, i) => ({ a, i })).find((o) => o.a.correct && o.a.alive);
    if (!target) return;
    const p = e.alienPos(target.a, target.i);
    const x = p.x + target.a.w / 2;
    const dx = x - e.shipX;
    let dodge = 0;
    for (const b of e.bolts) if (b.y > 250 && Math.abs(b.x - e.shipX) < 30) dodge = b.x < e.shipX ? 1 : -1;
    e.setInput({ left: dodge ? dodge < 0 : dx < -8, right: dodge ? dodge > 0 : dx > 8, fire: Math.abs(dx) < 16 });
  };

  // ---- Mario: přeskakovat špatné želvy a dopadnout na správnou ----
  bots["super-mario"] = (e, st) => {
    const t = e.turtles.find((x) => x.correct && x.alive);
    if (!t || e.countdown > 0) return;
    const dir = Math.sign(t.cx - e.px) || 1;
    const dxT = t.cx - e.px;
    // nejbližší živá želva před Mariem ve směru k cíli (kromě cíle)
    const ahead = e.turtles.filter((x) => x.alive && !x.correct && Math.sign(x.cx - e.px) === dir && Math.abs(x.cx - e.px) < 150).sort((a, b) => Math.abs(a.cx - e.px) - Math.abs(b.cx - e.px))[0];
    const want = { left: false, right: false, fire: false };
    if (e.onGround) {
      want.left = dir < 0 && Math.abs(dxT) > 6;
      want.right = dir > 0 && Math.abs(dxT) > 6;
      const dNear = ahead ? Math.abs(ahead.cx - e.px) : 999;
      const dTarget = Math.abs(dxT);
      // skok: přes špatnou želvu nebo na cíl
      if ((dNear < 95 && dNear > 40) || (dTarget < 100 && dTarget > 30 && dNear > 70)) want.fire = true;
    } else {
      // ve vzduchu pokračovat ke směru cíle, držet skok, dokud stoupáme
      want.left = dir < 0;
      want.right = dir > 0;
      want.fire = e.vy < 0;
      if (Math.abs(dxT) < 14) { want.left = false; want.right = false; }
    }
    e.setInput(want);
  };

  // ---- Pac-Man: nejlevnější cesta k správné odpovědi, políčka u duchů jsou drahá ----
  bots["pac-man"] = (e) => {
    const target = e.answers.find((a) => a.correct && a.alive);
    if (!target) return;
    const COLS = 31, ROWS = 19;
    const cost = (x, y) => {
      let c = 1;
      if (e.scared <= 0) for (const g of e.ghosts) {
        if (g.wait > 0) continue;
        const d = Math.abs(g.tx - x) + Math.abs(g.ty - y);
        if (d <= 1) c += 60; else if (d <= 3) c += 12;
      }
      return c;
    };
    const wrongAt = (x, y) => e.answers.some((a) => a.alive && !a.correct && a.tx === x && a.ty === y);
    const best = new Map();
    const first = new Map();
    const sx = e.pac.tx + e.pac.dx, sy = e.pac.ty + e.pac.dy;
    const pq = [[0, sx, sy]];
    best.set(sy * 100 + sx, 0);
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [c, x, y] = pq.shift();
      if (c > best.get(y * 100 + x)) continue;
      if (x === target.tx && y === target.ty) break;
      for (const d of dirs) {
        const nx = x + V[d][0], ny = y + V[d][1];
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || e.walls[ny][nx] || wrongAt(nx, ny)) continue;
        const nc = c + cost(nx, ny);
        const k = ny * 100 + nx;
        if (best.has(k) && best.get(k) <= nc) continue;
        best.set(k, nc);
        first.set(k, x === sx && y === sy ? d : first.get(y * 100 + x));
        pq.push([nc, nx, ny]);
      }
    }
    const d = first.get(target.ty * 100 + target.tx);
    if (d) setDir(e, d);
  };

  // ---- Snake: BFS k správnému jablku ----
  bots["snake"] = (e) => {
    const target = e.apples.find((a) => a.correct && a.alive);
    if (!target) return;
    const COLS = 32, ROWS = 20;
    const body = new Set(e.snake.slice(0, -1).map((c) => c.y * 100 + c.x));
    const wrong = new Set(e.apples.filter((a) => a.alive && !a.correct).map((a) => a.y * 100 + a.x));
    const head = e.snake[0];
    const opposite = { left: "right", right: "left", up: "down", down: "up" };
    const prev = new Map();
    const q = [[head.x, head.y]];
    prev.set(head.y * 100 + head.x, null);
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      if (x === target.x && y === target.y) break;
      for (const d of dirs) {
        if (x === head.x && y === head.y && d === opposite[e.dir]) continue;
        const nx = (x + V[d][0] + COLS) % COLS, ny = (y + V[d][1] + ROWS) % ROWS;
        const k = ny * 100 + nx;
        if (prev.has(k) || body.has(k) || wrong.has(k)) continue;
        prev.set(k, [x, y, d]);
        q.push([nx, ny]);
      }
    }
    const k = target.y * 100 + target.x;
    if (!prev.has(k)) return;
    let cur = k, first = null;
    while (prev.get(cur)) {
      const [px, py, d] = prev.get(cur);
      first = d;
      cur = py * 100 + px;
    }
    if (first) setDir(e, first);
  };

  // ---- Breakout: sledovat míček a mířit na správný blok ----
  bots["breakout"] = (e) => {
    const W = 640;
    if (!e.launched) {
      e.setInput({ fire: true });
      return;
    }
    e.setInput({ fire: false });
    const block = e.blocks.find((b) => b.label !== undefined && b.correct && b.alive);
    let landX = e.ballX;
    if (e.vy > 0) {
      const t = (418 - 24 - 8 - e.ballY) / e.vy;
      let px = e.ballX + e.vx * t;
      const w = W - 14;
      px = ((px - 7) % (2 * w) + 2 * w) % (2 * w);
      landX = px > w ? 2 * w - px + 7 : px + 7;
    }
    let aim = 0;
    if (block && e.vy > 0) {
      const bx = block.x + block.w / 2;
      const rise = 396 - (block.y + block.h);
      aim = Math.max(-0.85, Math.min(0.85, Math.atan((bx - landX) / rise) / 1.05));
    }
    const target = landX - aim * (e.paddleW / 2) * 0.9;
    const dx = target - e.paddleX;
    e.setInput({ left: dx < -6, right: dx > 6 });
  };

  // ---- Tetris: otočit a posunout kostku nad správnou zónu a shodit ----
  bots["tetris"] = (e, st) => {
    const p = e.piece;
    if (!p || e.pause > 0 || e.over) return;
    const zi = e.zones.findIndex((z) => z.correct && !z.closed);
    if (zi < 0) return;
    if (st.piece !== p) {
      st.piece = p;
      st.plan = null;
    }
    if (!st.plan) {
      const rotate = (m) => m.map((_, y) => m.map((__, x) => m[m.length - 1 - x][y]));
      let m = p.m;
      let best = null;
      for (let r = 0; r < 4 && !best; r++) {
        for (let x = -2; x < 12; x++) {
          if (!e.fits(m, x, p.y)) continue;
          const tmp = { m, color: p.color, x, y: p.y };
          if (e.zoneOf(tmp, e.landingY(tmp)) === zi) { best = { rot: r, x }; break; }
        }
        m = rotate(m);
      }
      st.plan = best || { rot: 0, x: p.x };
      st.rotDone = 0;
    }
    if (st.rotDone < st.plan.rot) {
      e.pressed.add("up");
      st.rotDone++;
      return;
    }
    if (p.x < st.plan.x) e.pressed.add("right");
    else if (p.x > st.plan.x) e.pressed.add("left");
    else e.pressed.add("fire");
  };

  // ---- Kong: žebříky, skoky přes sudy, pak úder do správného bloku ----
  bots["kong"] = (e) => {
    const LAD = [{ x: 500, from: 0 }, { x: 150, from: 1 }, { x: 470, from: 2 }, { x: 60, from: 3 }];
    const door = e.doors.find((d) => d.correct && d.alive);
    if (!door) return;
    const want = { left: false, right: false, up: false, down: false, fire: false };
    if (e.climbing) {
      want.up = true;
    } else {
      const near = e.barrels.find((b) => b.level === e.level && !b.falling && Math.abs(b.x - e.px) < 48 && Math.abs(b.x - e.px) > 20 && ((b.dir < 0 && b.x > e.px) || (b.dir > 0 && b.x < e.px)));
      if (near && e.onGround) want.fire = true;
      else if (e.level < 4) {
        const lad = LAD.find((l) => l.from === e.level);
        const dx = lad.x - e.px;
        if (Math.abs(dx) > 6) {
          want.left = dx < 0;
          want.right = dx > 0;
        } else if (e.onGround) want.up = true;
      } else {
        const dx = door.x + door.w / 2 - e.px;
        if (Math.abs(dx) > 8) {
          want.left = dx < 0;
          want.right = dx > 0;
        } else if (e.onGround) want.fire = true;
      }
    }
    e.setInput(want);
  };

  // ---- Stonožka: pod správný článek a střílet ----
  bots["stonozka"] = (e) => {
    let tx = null;
    for (const chain of e.chains) {
      const i = chain.segs.findIndex((s) => s.correct);
      if (i >= 0) tx = e.posAt(chain, chain.headD - i * 84).x + chain.dir * 18;
    }
    if (tx === null) return;
    const dx = tx - e.px;
    e.setInput({ left: dx < -6, right: dx > 6, fire: Math.abs(dx) < 26 && !(e.spider && Math.abs(e.spider.x - e.px) < 70), up: false, down: false });
  };

  // ---- Flappy: držet výšku středu průletu se správnou odpovědí ----
  bots["flappy"] = (e, st) => {
    const GAP = [56, 150, 244, 338];
    const gi = e.order.findIndex((o) => o === e.correct);
    const targetY = GAP[Math.max(0, gi)];
    st.cool = (st.cool || 0) - 1;
    if (e.birdY + e.vy * 0.05 > targetY + 20 && st.cool <= 0) {
      e.pressed.add("fire");
      st.cool = 3;
    }
  };

  // ---- Krtek: klepnout na správného krtka, když je nahoře ----
  bots["mole"] = (e, st) => {
    const i = e.moles.findIndex((m) => m.correct && !m.gone);
    if (i < 0) return;
    const m = e.moles[i];
    if (m.phase === "up" && e.popOut(m) > 0.6) {
      e.cursor = i;
      e.pressed.add("fire");
    }
  };

  // ---- Ninja: sekat správné ovoce za letu ----
  bots["ninja"] = (e) => {
    const it = e.items.find((x) => x.correct && x.state === "fly");
    if (it) e.sliceAt(it.x - 30, it.y, it.x + 30, it.y);
  };

  window.__bots = bots;
})();
