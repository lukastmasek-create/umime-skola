"use client";

import { useEffect, useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import type { HomeShowcaseText } from "@/i18n/home-showcase";

type C = HomeShowcaseText["cards"];

/** Respektuje systémové nastavení i přepínač „Animace“ v nastavení webu. */
export function noMotion(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.getAttribute("data-motion") === "off"
  );
}

export function Card({ title, wide, children }: { title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <article className={`sc-card${wide ? " wide" : ""}`}>
      <h3>{title}</h3>
      {children}
    </article>
  );
}

/* Vlny */
export function Ripples({ c }: { c: C }) {
  return (
    <Card title={c.ripple}>
      <div className="sc-stage">
        <div className="sc-ripple" aria-hidden="true">
          <i /><i /><i /><i /><i />
          <b>⚡</b>
        </div>
      </div>
    </Card>
  );
}

/* Částice přitahované ke kurzoru */
export function Particles({ c }: { c: C }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = noMotion();
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = 46;
    const frac = (v: number) => v - Math.floor(v);
    const pts = Array.from({ length: N }, (_, i) => {
      const x = 0.05 + 0.9 * frac(Math.sin(i * 12.9898 + 1.3) * 43758.5453);
      const y = 0.08 + 0.84 * frac(Math.sin(i * 78.233 + 4.1) * 24634.6345);
      return { x, y, vx: 0, vy: 0, hx: x, hy: y };
    });
    const mouse = { x: -1, y: -1 };
    function size() {
      const r = cv!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv!.width = w * dpr;
      cv!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    let raf = 0;
    function frame() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of pts) {
        const px = p.x * w;
        const py = p.y * h;
        if (mouse.x >= 0) {
          const dx = mouse.x - px;
          const dy = mouse.y - py;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 110) {
            p.vx += (dx / d) * 0.05;
            p.vy += (dy / d) * 0.05;
          }
        }
        p.vx += (p.hx - p.x) * 0.002;
        p.vy += (p.hy - p.y) * 0.002;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx / w * 60;
        p.y += p.vy / h * 60;
      }
      ctx!.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot((pts[i].x - pts[j].x) * w, (pts[i].y - pts[j].y) * h);
          if (d < 56) {
            ctx!.strokeStyle = `rgba(143,208,255,${(1 - d / 56) * 0.6})`;
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x * w, pts[i].y * h);
            ctx!.lineTo(pts[j].x * w, pts[j].y * h);
            ctx!.stroke();
          }
        }
      }
      ctx!.fillStyle = "#ffc933";
      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x * w, p.y * h, 2.4, 0, Math.PI * 2);
        ctx!.fill();
      }
      if (!still) raf = requestAnimationFrame(frame);
    }
    frame();
    function move(e: PointerEvent) {
      const r = cv!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    function leave() {
      mouse.x = -1;
      mouse.y = -1;
    }
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <Card title={c.particles}>
      <canvas ref={ref} className="sc-canvas" role="img" aria-label={c.particles} style={{ background: "rgba(8,6,28,.55)" }} />
      <p className="sc-hint">{c.particlesHint}</p>
    </Card>
  );
}

/* Psaní s kurzorem */
export function Typing({ c }: { c: C }) {
  const [text, setText] = useState(c.typingWords[0]);
  useEffect(() => {
    if (noMotion()) return;
    let i = 0;
    let n = 0;
    let del = false;
    let t: ReturnType<typeof setTimeout>;
    function tick() {
      const word = c.typingWords[i % c.typingWords.length];
      if (!del) {
        n++;
        setText(word.slice(0, n));
        if (n === word.length) {
          del = true;
          t = setTimeout(tick, 1400);
          return;
        }
        t = setTimeout(tick, 75);
      } else {
        n--;
        setText(word.slice(0, n));
        if (n === 0) {
          del = false;
          i++;
          t = setTimeout(tick, 350);
          return;
        }
        t = setTimeout(tick, 35);
      }
    }
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [c.typingWords]);
  return (
    <Card title={c.typing}>
      <div className="sc-stage">
        <p className="sc-typing" aria-label={c.typingWords.join(", ")}>
          <span aria-hidden="true">{text}</span>
          <span className="sc-caret" aria-hidden="true" />
        </p>
      </div>
    </Card>
  );
}

/* Číselný automat */
export function Ticker({ c }: { c: C }) {
  const [v, setV] = useState(1240);
  return (
    <Card title={c.ticker}>
      <div className="sc-stage">
        <NumberFlow className="sc-ticker" value={v} locales="cs-CZ" aria-live="polite" />
      </div>
      <div className="sc-row">
        <button type="button" className="sc-btn primary" onClick={() => setV((x) => x + 50 + Math.floor(Math.random() * 450))}>{c.tickerAdd}</button>
        <button type="button" className="sc-btn" onClick={() => setV(0)}>{c.tickerReset}</button>
      </div>
    </Card>
  );
}

/* Tečka, která zaplaví tlačítko */
export function FillButton({ c }: { c: C }) {
  return (
    <Card title={c.fill}>
      <div className="sc-stage">
        <button type="button" className="sc-fill">
          <span className="d" aria-hidden="true" />
          <span className="t1">{c.fillIdle}</span>
          <span className="t2">{c.fillHover} →</span>
        </button>
      </div>
    </Card>
  );
}

/* Životy a kombo */
export function LivesCombo({ c }: { c: C }) {
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const over = lives === 0;
  return (
    <Card title={c.lives}>
      <div className="sc-stage" style={{ justifyItems: "start", alignContent: "center", gap: 12 }}>
        <div className="sc-hearts" role="img" aria-label={`${lives} / 3`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`sc-heart${i >= lives ? " lost" : ""}`} aria-hidden="true">❤️</span>
          ))}
        </div>
        <div className="sc-combo">
          <span className={`sc-flame${combo >= 3 ? " on" : ""}`} aria-hidden="true">🔥</span>
          <div>
            <div className="x"><NumberFlow value={combo} prefix="x" /></div>
            <span className="sc-hint" aria-live="polite">{over ? c.gameOver : c.comboHint}</span>
          </div>
        </div>
      </div>
      <div className="sc-row">
        <button type="button" className="sc-btn good" disabled={over} onClick={() => setCombo((x) => x + 1)}>{c.right}</button>
        <button type="button" className="sc-btn bad" disabled={over} onClick={() => { setCombo(0); setLives((x) => Math.max(0, x - 1)); }}>{c.wrong}</button>
        <button type="button" className="sc-btn" onClick={() => setLives((x) => Math.min(3, x + 1))}>{c.addLife}</button>
      </div>
    </Card>
  );
}

/* Mince a nový level */
export function Rewards({ c }: { c: C }) {
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(4);
  function burst(x: number, y: number, n = 80) {
    if (noMotion()) return;
    void confetti({ particleCount: n, spread: 70, origin: { x, y }, disableForReducedMotion: true });
  }
  return (
    <Card title={c.rewards}>
      <div className="sc-stage" style={{ gap: 6 }}>
        <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-yellow)" }}>
          🪙 <NumberFlow value={coins} />
        </div>
        <div style={{ fontWeight: 700 }}>{c.levelDone} <NumberFlow value={level} /></div>
      </div>
      <div className="sc-row">
        <button type="button" className="sc-btn primary" onClick={(e) => { setCoins((x) => x + 12); const r = e.currentTarget.getBoundingClientRect(); burst((r.left + r.width / 2) / window.innerWidth, r.top / window.innerHeight, 30); }}>{c.claimCoins}</button>
        <button type="button" className="sc-btn" onClick={(e) => { setLevel((x) => x + 1); const r = e.currentTarget.getBoundingClientRect(); burst((r.left + r.width / 2) / window.innerWidth, r.top / window.innerHeight, 120); }}>{c.levelUp}</button>
      </div>
    </Card>
  );
}

/* Dock s lupou */
const DOCK_COLORS = ["#5a6cff", "#a06bff", "#ffb020", "#ff7a5c", "#2fb67c", "#ff5fa8", "#8a84b8"];
const DOCK_ICONS = ["🏠", "🎮", "🏆", "🔥", "📘", "🔔", "⚙️"];
export function Dock({ c }: { c: C }) {
  const wrap = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    if (noMotion()) return;
    const kids = wrap.current?.children;
    if (!kids) return;
    for (const el of Array.from(kids) as HTMLElement[]) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const s = 1 + Math.max(0, 1 - d / 90) * 0.7;
      el.style.transform = `scale(${s})`;
    }
  }
  function reset() {
    const kids = wrap.current?.children;
    if (kids) for (const el of Array.from(kids) as HTMLElement[]) el.style.transform = "";
  }
  return (
    <Card title={c.dock} wide>
      <div className="sc-stage" style={{ minHeight: 130 }}>
        <div className="sc-dock" ref={wrap} onPointerMove={move} onPointerLeave={reset} role="toolbar" aria-label={c.dock}>
          {c.dockItems.map((label, i) => (
            <button key={label} type="button" aria-label={label} title={label} style={{ background: DOCK_COLORS[i % 7] }} onFocus={(e) => { e.currentTarget.style.transform = "scale(1.4)"; }} onBlur={(e) => { e.currentTarget.style.transform = ""; }}>
              <span aria-hidden="true">{DOCK_ICONS[i % 7]}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* Ostrůvek, který mění tvar */
type IslandState = "idle" | "timer" | "score" | "full";
export function Island({ c }: { c: C }) {
  const [s, setS] = useState<IslandState>("idle");
  const t = c.islandTitles;
  return (
    <Card title={c.island}>
      <div className="sc-stage" style={{ minHeight: 140 }}>
        <div className="sc-island" data-s={s} aria-live="polite">
          {s === "idle" && <span>⚡ {t.idle}</span>}
          {s === "timer" && <span><span className="live" aria-hidden="true" /><b>{t.timer}</b> <span style={{ float: "right" }}>0:42</span></span>}
          {s === "score" && <span><b>{t.score}</b><br /><small style={{ opacity: 0.7 }}>{t.scoreSub}</small></span>}
          {s === "full" && (<>
            <span><span className="live" aria-hidden="true" /><b>{t.full}</b></span>
            <span className="bar"><i /></span>
            <small style={{ opacity: 0.75 }}>{t.fullSub}</small>
          </>)}
        </div>
      </div>
      <div className="sc-seg" role="group" aria-label={c.island}>
        {(["idle", "timer", "score", "full"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={s === k} onClick={() => setS(k)}>{c.islandModes[k]}</button>
        ))}
      </div>
    </Card>
  );
}

/* Seznam s klávesovými zkratkami */
const KEYS = ["H", "M", "Z", "O", "N"];
export function Shortcuts({ c }: { c: C }) {
  const [active, setActive] = useState(0);
  const armed = useRef(false);
  function onKey(e: React.KeyboardEvent) {
    const k = e.key.toUpperCase();
    if (armed.current) {
      armed.current = false;
      const i = KEYS.indexOf(k);
      if (i >= 0) { e.preventDefault(); setActive(i); }
      return;
    }
    if (k === "G") armed.current = true;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((x) => Math.min(KEYS.length - 1, x + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((x) => Math.max(0, x - 1)); }
  }
  return (
    <Card title={c.shortcuts}>
      <div className="sc-stage">
        <ul className="sc-list" tabIndex={0} role="listbox" aria-label={c.shortcuts} aria-activedescendant={`sc-nav-${active}`} onKeyDown={onKey} onBlur={() => { armed.current = false; }}>
          <li role="presentation" className="bg" aria-hidden="true" style={{ transform: `translateY(${active * 38}px)` }} />
          {c.shortcutItems.map((label, i) => (
            <li key={label} id={`sc-nav-${i}`} role="option" aria-selected={active === i} onPointerEnter={() => setActive(i)} onClick={() => setActive(i)}>
              {label}<kbd aria-hidden="true">G {KEYS[i]}</kbd>
            </li>
          ))}
        </ul>
      </div>
      <p className="sc-hint">{c.shortcutsHint}</p>
    </Card>
  );
}
