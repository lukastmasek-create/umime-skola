"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fill } from "@/i18n/profile";
import { getRoomText } from "@/i18n/room";
import { FURNITURE, ROOM_LAYOUT, ROOM_SLOTS, ROOM_SLOT_POS, furnitureSprite } from "@/lib/room";
import { CARDS, type Rarity } from "@/lib/collection";
import type { Locale } from "@/i18n/config";

type Data = { loggedIn: true; points: number; room: { owned: string[]; placed: (string | null)[] }; cards: Record<string, number> };

const RARITY_STYLE: Record<Rarity, string> = {
  common: "var(--border-soft)",
  rare: "#4da3ff",
  epic: "#ffc933",
};

// Obrázek nábytku z Blenderu; když chybí, zobrazí se emoji.
function Piece({ id, className = "" }: { id: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const def = FURNITURE.find((f) => f.id === id);
  if (failed) {
    return (
      <span aria-hidden className={`flex items-center justify-center ${className}`}>
        {def?.icon ?? "❔"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={furnitureSprite(id)} alt="" aria-hidden draggable={false} onError={() => setFailed(true)} className={`pointer-events-none select-none object-contain ${className}`} />
  );
}

const poly = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(",")})`;

// Živý pokoj: za oknem plují mraky, dovnitř padá sluneční paprsek s tančícím prachem a lampa jemně pulzuje.
function RoomAmbient() {
  const beam = ROOM_LAYOUT.beam;
  const bx = Math.min(...beam.map((p) => p[0]));
  const bw = Math.max(...beam.map((p) => p[0])) - bx;
  const by = Math.min(...beam.map((p) => p[1]));
  const bh = Math.max(...beam.map((p) => p[1])) - by;
  const pane = ROOM_LAYOUT.pane;
  const px = Math.min(...pane.map((p) => p[0]));
  const pw = Math.max(...pane.map((p) => p[0])) - px;
  const py = Math.min(...pane.map((p) => p[1]));
  const ph = Math.max(...pane.map((p) => p[1])) - py;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ clipPath: poly(ROOM_LAYOUT.pane) }}>
        <div className="absolute overflow-hidden" style={{ left: `${px}%`, top: `${py}%`, width: `${pw}%`, height: `${ph}%`, background: "linear-gradient(180deg,#5db8ff 0%,#b8e6ff 100%)" }}>
          <span className="room-cloud absolute left-0 top-[12%] h-[34%] w-[38%]" />
          <span className="room-cloud absolute left-0 top-[48%] h-[28%] w-[30%]" style={{ animationDuration: "46s", animationDelay: "-22s" }} />
        </div>
      </div>
      <div className="room-beam absolute inset-0" style={{ clipPath: poly(beam) }} />
      <div className="absolute" style={{ left: `${bx}%`, top: `${by}%`, width: `${bw}%`, height: `${bh}%` }}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="room-mote absolute block h-[3px] w-[3px] rounded-full bg-[#fff6cf]" style={{ left: `${(i * 37) % 90 + 4}%`, top: `${(i * 53) % 70 + 15}%`, animationDelay: `${-i * 0.9}s`, animationDuration: `${7 + (i % 4)}s` }} />
        ))}
      </div>
      <span className="room-lamp absolute h-[16%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${ROOM_LAYOUT.lamp[0]}%`, top: `${ROOM_LAYOUT.lamp[1]}%` }} />
    </div>
  );
}

// Vlastní pokoj s nábytkem za body a sbírka karet za splněné výzvy.
export function RoomView({ locale, initialTab = "room" }: { locale: Locale; initialTab?: "room" | "cards" }) {
  const t = getRoomText(locale);
  const [data, setData] = useState<Data | null | "guest" | "error">(null);
  const [tab, setTab] = useState<"room" | "cards">(initialTab);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/pokoj")
      .then((r) => r.json())
      .then((d) => setData(d.loggedIn === false ? "guest" : d.error ? "error" : d))
      .catch(() => setData("error"));
  }, []);

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pokoj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const next = await res.json();
      if (res.ok) setData(next);
      else setMessage(next.error === "not-enough-points" ? t.notEnough : t.actionError);
    } catch {
      setMessage(t.actionError);
    } finally {
      setBusy(false);
    }
  }

  if (data === null) return <div className="card h-48 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  if (data === "error") return <p className="card p-6 text-[var(--muted)]">{t.loadError}</p>;
  if (data === "guest") {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="text-[var(--muted)]">{t.loginNeeded}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
          {t.login}
        </Link>
      </div>
    );
  }

  const heading = { fontFamily: "var(--font-heading)" } as const;
  const cardTotal = Object.values(data.cards).reduce((a, b) => a + b, 0);
  const tabClass = (active: boolean) =>
    `btn-bouncy px-4 py-2 text-sm font-bold ${active ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <button className={tabClass(tab === "room")} onClick={() => setTab("room")}>
          🏠 {t.roomTab}
        </button>
        <button className={tabClass(tab === "cards")} onClick={() => setTab("cards")}>
          🃏 {t.cardsTab}
        </button>
        <span className="pill ml-auto bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">{fill(t.points, data.points)}</span>
      </div>
      {message && <p className="text-sm font-semibold text-[var(--danger)]">{message}</p>}

      {tab === "room" && (
        <>
          <p className="text-sm text-[var(--muted)]">{t.pickSlot}</p>
          <div className="room-stage relative mx-auto w-full max-w-4xl" style={{ aspectRatio: ROOM_LAYOUT.aspect }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/room/iso.webp" alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none drop-shadow-[0_26px_30px_rgba(0,0,0,0.45)]" />
            <RoomAmbient />
            {Array.from({ length: ROOM_SLOTS }, (_, slot) => {
              const id = data.room.placed[slot];
              const [x, y] = ROOM_SLOT_POS[slot];
              const lay = id ? ROOM_LAYOUT.furn[id] : null;
              const name = id ? (FURNITURE.find((f) => f.id === id)?.names[locale] ?? t.remove) : t.emptySlot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (selected) {
                      post({ action: "place", slot, id: selected });
                      setSelected(null);
                    } else if (id) post({ action: "place", slot, id: null });
                  }}
                  title={id ? `${name} · ${t.remove}` : t.emptySlot}
                  aria-label={id ? name : t.emptySlot}
                  className="group absolute aspect-square"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${lay ? lay.w : 11}%`,
                    transform: `translate(-50%, -${(lay ? lay.o : 0.5) * 100}%)`,
                    zIndex: Math.round(y),
                  }}
                >
                  {/* Prázdné místo na podlaze: izometrická dlaždice, při vybraném kusu zvýrazněná */}
                  {!id && (
                    <span
                      className={`room-tile absolute inset-[8%] rounded-lg border-2 border-dashed transition-all ${
                        selected ? "border-white bg-white/30 shadow-[0_0_18px_rgba(255,255,255,0.7)]" : "border-white/45 group-hover:border-white group-hover:bg-white/20"
                      }`}
                    />
                  )}
                  {id && <Piece id={id} className="h-full w-full transition-transform duration-200 group-hover:-translate-y-2 group-hover:scale-[1.04]" />}
                </button>
              );
            })}
          </div>

          <h2 className="text-lg font-extrabold" style={heading}>
            {t.shop}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {FURNITURE.map((f) => {
              const owned = data.room.owned.includes(f.id);
              const placed = data.room.placed.includes(f.id);
              return (
                <li key={f.id} className="flex items-center gap-3 rounded-xl border-2 border-[var(--border-soft)] px-3 py-2">
                  <Piece id={f.id} className="h-12 w-12 shrink-0 text-3xl" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{f.names[locale]}</span>
                  {owned ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => (placed ? post({ action: "place", slot: data.room.placed.indexOf(f.id), id: null }) : setSelected(selected === f.id ? null : f.id))}
                      className={`btn-bouncy px-3 py-1.5 text-xs font-bold ${selected === f.id ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
                    >
                      {placed ? t.remove : t.place}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || data.points < f.price}
                      onClick={() => post({ action: "buy", id: f.id })}
                      className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                    >
                      {fill(t.buy, f.price)}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {tab === "cards" && (
        <>
          <p className="text-sm text-[var(--muted)]">{t.cardsHint}</p>
          <p className="text-sm font-bold">{fill(t.cardsProgress, `${CARDS.filter((c) => data.cards[c.id]).length} / ${CARDS.length}`)} ({cardTotal})</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CARDS.map((c) => {
              const n = data.cards[c.id] ?? 0;
              return (
                <li
                  key={c.id}
                  className={`card flex flex-col items-center gap-1 p-3 text-center ${n ? "" : "opacity-40 grayscale"}`}
                  style={{ borderColor: RARITY_STYLE[c.rarity] }}
                >
                  <span className="text-4xl" aria-hidden>
                    {n ? c.icon : "❔"}
                  </span>
                  <span className="text-sm font-bold">{n ? c.names[locale] : "???"}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {t.rarity[c.rarity]}
                    {n > 1 ? ` · ×${n}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
