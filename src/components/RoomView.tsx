"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fill } from "@/i18n/profile";
import { getRoomText } from "@/i18n/room";
import { FURNITURE, ROOM_SLOTS } from "@/lib/room";
import { CARDS, type Rarity } from "@/lib/collection";
import type { Locale } from "@/i18n/config";

type Data = { loggedIn: true; points: number; room: { owned: string[]; placed: (string | null)[] }; cards: Record<string, number> };

const RARITY_STYLE: Record<Rarity, string> = {
  common: "var(--border-soft)",
  rare: "#4da3ff",
  epic: "#ffc933",
};

// Vlastní pokoj s nábytkem za body a sbírka karet za splněné výzvy.
export function RoomView({ locale }: { locale: Locale }) {
  const t = getRoomText(locale);
  const [data, setData] = useState<Data | null | "guest" | "error">(null);
  const [tab, setTab] = useState<"room" | "cards">("room");
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
  const iconOf = (id: string | null) => FURNITURE.find((f) => f.id === id)?.icon ?? "";
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
          <div className="card mx-auto grid w-full max-w-xl grid-cols-4 gap-2 p-3 sm:gap-3 sm:p-4" style={{ background: "var(--surface-muted)" }}>
            {Array.from({ length: ROOM_SLOTS }, (_, slot) => {
              const id = data.room.placed[slot];
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
                  title={id ? t.remove : t.emptySlot}
                  className={`flex aspect-square items-center justify-center rounded-xl border-2 text-4xl sm:text-5xl ${
                    selected && !id ? "border-dashed border-[var(--accent-500)]" : "border-[var(--border-soft)]"
                  } bg-[var(--surface)]`}
                >
                  {id ? iconOf(id) : selected ? <span className="text-2xl text-[var(--accent-500)]">+</span> : null}
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
                  <span className="text-3xl" aria-hidden>
                    {f.icon}
                  </span>
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
