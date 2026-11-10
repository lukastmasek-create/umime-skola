"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeShowcaseText } from "@/i18n/home-showcase";
import { Card, noMotion } from "./motion";

type C = HomeShowcaseText["cards"];

/* Složka s úkoly */
export function Folder({ c }: { c: C }) {
  const [open, setOpen] = useState(false);
  return (
    <Card title={c.folder}>
      <div className="sc-stage" style={{ minHeight: 170 }}>
        <button type="button" className="sc-fold" aria-expanded={open} aria-label={c.folderLabel} onClick={() => setOpen((o) => !o)}>
          <span className="back" />
          {c.folderPapers.map((p) => (
            <span key={p} className="pp">{p}</span>
          ))}
          <span className="front">{c.folderLabel}</span>
          <span className="cnt">{c.folderPapers.length}</span>
        </button>
      </div>
    </Card>
  );
}

/* Lampa nad nadpisem */
export function Lamp({ c }: { c: C }) {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const replay = useCallback(() => {
    setOn(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
  }, []);
  return (
    <Card title={c.lamp} wide>
      <div ref={ref} className={`sc-lamp${on ? " go" : ""}`}>
        <div className="glow" /><div className="cone" /><div className="bar" />
        <h4 style={on && noMotion() ? { opacity: 1, transform: "none" } : undefined}>{c.lampTitle}</h4>
      </div>
      <div className="sc-row"><button type="button" className="sc-btn" onClick={replay}>{c.replay}</button></div>
    </Card>
  );
}

/* Příprava kola */
export function Loader({ c }: { c: C }) {
  const steps = c.loaderSteps;
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const delay = noMotion() ? 0 : 750;
    const id = setInterval(() => setN((x) => (x < steps.length ? x + 1 : x)), delay || 10);
    return () => clearInterval(id);
  }, [run, steps.length]);
  return (
    <Card title={c.loader}>
      <div className="sc-stage" style={{ minHeight: 190 }}>
        <ol className="sc-steps" aria-live="polite" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {steps.map((s, i) => (
            <li key={s} className={`sc-step${i <= n ? " on" : ""}${i < n ? " done" : ""}${i === n && n < steps.length ? " cur" : ""}`}>
              <i aria-hidden="true">{i < n ? "✓" : ""}</i>{s}
            </li>
          ))}
        </ol>
      </div>
      <div className="sc-row">
        <button type="button" className="sc-btn" onClick={() => { setN(0); setRun((r) => r + 1); }}>{c.loaderRestart}</button>
      </div>
    </Card>
  );
}
