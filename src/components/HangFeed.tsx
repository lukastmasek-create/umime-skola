"use client";

import { useEffect, useRef, useState } from "react";
import { HangIcon } from "./HangDecor";

// Proud krátkých hlášek, které postupně vyskakují zespodu a starší se odsouvají nahoru a mizí.
const KINDS = ["bug", "check", "bolt", "star", "bulb", "flag"] as const;
const COLORS = ["#ff8a6b", "#7ee0b0", "#ffc933", "#c9a8ff", "#8fd0ff", "#ffc933"];
const VISIBLE = 4; // poslední čtvrtá se zároveň vytrácí
const EVERY = 2600;

type Msg = { id: number; text: string };

export function HangFeed({ messages }: { messages: string[] }) {
  const [list, setList] = useState<Msg[]>(() => [1, 0].map((id) => ({ id, text: messages[id % messages.length] ?? "" })));
  const next = useRef(2);

  useEffect(() => {
    if (messages.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      const id = next.current++;
      setList((l) => [{ id, text: messages[id % messages.length] }, ...l].slice(0, VISIBLE));
    }, EVERY);
    return () => window.clearInterval(t);
  }, [messages]);

  return (
    <ul className="hang-feed" aria-hidden>
      {list.map((m) => {
        const k = m.id % KINDS.length;
        return (
          <li key={m.id} className="hang-msg" style={{ ["--mc" as string]: COLORS[k] }}>
            <div className="hang-msg-in">
              <span className="hang-msg-ic"><HangIcon kind={KINDS[k]} size={16} /></span>
              <span className="hang-msg-tx">{m.text}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
