"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeShowcaseText } from "@/i18n/home-showcase";
import { Card, noMotion } from "./motion";

type C = HomeShowcaseText["cards"];

/* LED displej: text se vykreslí do malé mřížky a z ní se vytvoří svítící body */
export function LedBoard({ c }: { c: C }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"tournament" | "reward" | "time">("tournament");
  const message = c.ledTexts[mode];
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx || !octx) return;
    const ROWS = 11;
    const COLS = 35;
    const text = ` ${message} `;
    octx.font = "bold 12px sans-serif";
    const tw = Math.ceil(octx.measureText(text).width);
    off.width = Math.max(tw, COLS);
    off.height = ROWS;
    octx.font = "bold 12px sans-serif";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(text, 0, ROWS / 2 + 1);
    const data = octx.getImageData(0, 0, off.width, ROWS).data;
    const still = noMotion();
    let offset = 0;
    let raf = 0;
    let last = 0;
    function draw() {
      const W = cv!.width;
      const H = cv!.height;
      const cell = W / COLS;
      ctx!.clearRect(0, 0, W, H);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const sx = (x + Math.floor(offset)) % off.width;
          const lit = data[(y * off.width + sx) * 4 + 3] > 110;
          ctx!.fillStyle = lit ? "#ffc933" : "#2a2440";
          ctx!.beginPath();
          ctx!.arc(x * cell + cell / 2, y * cell + cell / 2 + (H - ROWS * cell) / 2, cell * 0.36, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }
    function frame(t: number) {
      if (t - last > 95) { offset += 1; last = t; draw(); }
      raf = requestAnimationFrame(frame);
    }
    draw();
    if (!still && off.width > COLS) raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [message]);
  return (
    <Card title={c.led}>
      <div className="sc-stage">
        <div className="sc-led">
          <canvas ref={ref} width={420} height={132} role="img" aria-label={message} />
        </div>
      </div>
      <div className="sc-seg" role="group" aria-label={c.led}>
        {(["tournament", "reward", "time"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)}>{c.ledModes[k]}</button>
        ))}
      </div>
    </Card>
  );
}

/* Historie bodů */
export function PointsHistory({ c }: { c: C }) {
  const [items, setItems] = useState(() => c.historyItems.map((x, i) => ({ ...x, id: i })));
  const [filter, setFilter] = useState<"all" | "income" | "spend">("all");
  const nextId = useRef(c.historyItems.length);
  const shown = items.filter((x) => filter === "all" || (filter === "income" ? x.amount > 0 : x.amount < 0));
  function add() {
    const base = c.historyItems[nextId.current % c.historyItems.length];
    setItems((xs) => [{ ...base, id: nextId.current++ }, ...xs].slice(0, 7));
  }
  return (
    <Card title={c.history}>
      <div className="sc-seg" role="group" aria-label={c.history}>
        {(["all", "income", "spend"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{c.historyFilters[k]}</button>
        ))}
      </div>
      <ul className="sc-tx" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {shown.map((x) => (
          <li key={x.id}>
            <span className="l">{x.label}<small>{c.historyToday}</small></span>
            <span className={`a ${x.amount > 0 ? "pos" : "neg"}`}>{x.amount > 0 ? `+${x.amount}` : x.amount}</span>
          </li>
        ))}
      </ul>
      <div className="sc-row"><button type="button" className="sc-btn" onClick={add}>{c.historyAdd}</button></div>
    </Card>
  );
}

/* Mapa aktivity za 14 týdnů (ukázková data, deterministicky) */
function buildHeat(): number[] {
  let seed = 7;
  const out: number[] = [];
  for (let i = 0; i < 14 * 7; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const r = (seed >> 8) % 100;
    const weekend = i % 7 > 4;
    out.push(r < (weekend ? 55 : 22) ? 0 : r < 52 ? 1 : r < 72 ? 2 : r < 90 ? 3 : 4);
  }
  return out;
}
const HEAT = buildHeat();
export function ActivityMap({ c }: { c: C }) {
  const cells = HEAT;
  const [tip, setTip] = useState(c.heatmapHint);
  return (
    <Card title={c.heatmap} wide>
      <div className="sc-stage" style={{ gap: 12, alignContent: "center" }}>
        <div className="sc-heat" role="img" aria-label={c.heatmap}>
          {cells.map((l, i) => (
            <i key={i} data-l={l} tabIndex={0} onPointerEnter={() => setTip(c.heatmapTip.replace("{n}", String(l * 3)))} onFocus={() => setTip(c.heatmapTip.replace("{n}", String(l * 3)))} />
          ))}
        </div>
        <p style={{ fontWeight: 700, fontSize: "0.85rem", minHeight: "1.3em" }} aria-live="polite">{tip}</p>
        <div className="sc-legend">
          {c.heatmapLess}
          {["#26224a", "#245f49", "#2f9a72", "#3ddc97", "#b8ffd9"].map((col) => <i key={col} style={{ background: col }} />)}
          {c.heatmapMore}
        </div>
      </div>
    </Card>
  );
}

/* Studijní čas po předmětech */
const SUBJECT_COLORS = ["#ff9a3c", "#f472b6", "#ffd21f"];
export function StudyTime({ c }: { c: C }) {
  const [mins, setMins] = useState([57, 24, 26]);
  const total = mins.reduce((a, b) => a + b, 0);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return (
    <Card title={c.study}>
      <div className="sc-stage">
        <div className="sc-study">
          <div className="tm" aria-live="polite">{hh}:{mm}</div>
          <div className="lg">
            {c.studySubjects.map((s, i) => (
              <span key={s} style={{ color: SUBJECT_COLORS[i] }}>{mins[i]} min · {s}</span>
            ))}
          </div>
          <div className="bars" aria-hidden="true">
            {mins.map((m, i) => (
              <i key={i} style={{ flexGrow: m, background: SUBJECT_COLORS[i], height: `${28 + (m / total) * 30}px` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="sc-row">
        <button type="button" className="sc-btn" onClick={() => setMins((m) => { const k = Math.floor(Math.random() * 3); return m.map((v, i) => (i === k ? v + 10 : v)); })}>{c.studyAdd}</button>
      </div>
    </Card>
  );
}

/* Dither field: hustě tečkovaný přechod, který sleduje kurzor */
export function DitherField({ c }: { c: C }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const STEP = 5;
    const still = noMotion();
    const mouse = { x: 0.5, y: 0.5 };
    let w = 0;
    let h = 0;
    let t = 0;
    let raf = 0;
    function size() {
      const r = cv!.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      cv!.width = w;
      cv!.height = h;
    }
    size();
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(cv);
    function draw() {
      ctx!.fillStyle = "#0a0820";
      ctx!.fillRect(0, 0, w, h);
      ctx!.fillStyle = "#8d9bff";
      for (let y = 0; y < h; y += STEP) {
        for (let x = 0; x < w; x += STEP) {
          const nx = x / w;
          const ny = y / h;
          const d = Math.hypot(nx - mouse.x, (ny - mouse.y) * (h / w));
          const wave = 0.5 + 0.5 * Math.sin(nx * 9 + t) * Math.cos(ny * 7 - t * 0.7);
          const v = Math.max(0, Math.min(1, 0.65 * wave * 0.6 + 0.9 * Math.exp(-d * 5)));
          const thr = (BAYER[((y / STEP) & 3) * 4 + ((x / STEP) & 3)] + 0.5) / 16;
          if (v > thr) ctx!.fillRect(x, y, STEP - 1, STEP - 1);
        }
      }
    }
    function frame() { t += 0.03; draw(); raf = requestAnimationFrame(frame); }
    draw();
    if (!still) raf = requestAnimationFrame(frame);
    function move(e: PointerEvent) {
      const r = cv!.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      if (still) draw();
    }
    cv.addEventListener("pointermove", move);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.removeEventListener("pointermove", move); };
  }, []);
  return (
    <Card title={c.dither}>
      <canvas ref={ref} className="sc-canvas" role="img" aria-label={c.dither} />
      <p className="sc-hint">{c.ditherHint}</p>
    </Card>
  );
}
