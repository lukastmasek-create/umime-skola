"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getRoom3dText } from "@/i18n/room3d";
import { getAvatarModel } from "@/lib/avatars3d";
import { getHeroLook } from "@/lib/hero";
import { FURNITURE, ROOM_PERKS, roomEndlessBonus, roomXpBonus, type RoomState } from "@/lib/room";
import { useAccount } from "@/lib/use-account";
import type { RoomHandle } from "@/lib/town3d/room3d";
import type { Locale } from "@/i18n/config";

// Živý 3D pokoj: nábytek na svých místech, avatar chodí po pokoji; karta vybraného nábytku ukáže bonus a akci.
export function Room3DView({
  locale,
  room,
  day,
  busy,
  onUse,
  onFail,
}: {
  locale: Locale;
  room: RoomState;
  day: string;
  busy: boolean;
  onUse: (id: string) => Promise<number | null>;
  onFail: () => void;
}) {
  const t = getRoom3dText(locale);
  const [account] = useAccount();
  const avatar = account && account.loggedIn ? getAvatarModel(account.avatar) : null;
  const box = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const handle = useRef<RoomHandle | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [gained, setGained] = useState<string | null>(null);
  const placedKey = room.placed.filter(Boolean).join(",");
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  });

  useEffect(() => {
    const el = box.current;
    if (!el || account === null) return;
    let alive = true;
    let h: RoomHandle | null = null;
    void import("@/lib/town3d/room3d").then(({ createRoom3D }) => {
      if (!alive) return;
      h = createRoom3D(el, { avatar, look: getHeroLook(), onPick: (id) => setPicked(id), onArrive: () => {} });
      if (!h) return failRef.current();
      handle.current = h;
      h.setPlaced(placedKey.split(",").filter(Boolean));
      h.labels((items) => {
        const lbl = tip.current;
        if (!lbl) return;
        const on = items.find((i) => i.visible);
        lbl.style.display = on ? "" : "none";
        if (on) {
          lbl.textContent = FURNITURE.find((f) => f.id === on.id)?.names[locale] ?? on.id;
          lbl.style.transform = `translate(${on.x}px, ${on.y}px) translate(-50%, -100%)`;
        }
      });
    });
    return () => {
      alive = false;
      h?.dispose();
      handle.current = null;
    };
    // stav nábytku se posílá zvlášť (setPlaced), scéna se kvůli němu nestaví znovu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatar, account === null, locale]);
  useEffect(() => {
    handle.current?.setPlaced(placedKey.split(",").filter(Boolean));
  }, [placedKey]);

  const def = picked ? FURNITURE.find((f) => f.id === picked) : null;
  const perk = picked ? ROOM_PERKS[picked] : undefined;
  const isPlaced = picked ? room.placed.includes(picked) : false;
  const usedToday = picked ? room.used[picked] === day : false;
  const xpTest = roomXpBonus(room, "test");
  const xpGame = roomXpBonus(room, "game");
  const endless = Math.round(roomEndlessBonus(room) * 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]" style={{ aspectRatio: "16 / 10", minHeight: 380 }}>
        <div ref={box} className="absolute inset-0 bg-[#2a2340]" />
        <div ref={tip} className="pointer-events-none absolute left-0 top-0 rounded-lg border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-xs font-extrabold text-[#ffe8b8]" style={{ display: "none" }} />
        {def && (
          <div className="absolute bottom-3 left-3 max-w-[min(360px,calc(100%-24px))] rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_4px_0_var(--shadow-ink)]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold">
                {def.icon} {def.names[locale]}
              </p>
              <button type="button" onClick={() => setPicked(null)} className="text-sm font-bold text-[var(--muted)]" aria-label="✕">
                ✕
              </button>
            </div>
            <ul className="mt-1 text-xs text-[var(--muted)]">
              {perk?.xpTest ? <li>{t.perkXpTest.replace("{n}", String(perk.xpTest))}</li> : null}
              {perk?.xpGame ? <li>{t.perkXpGame.replace("{n}", String(perk.xpGame))}</li> : null}
              {perk?.endless ? <li>{t.perkEndless.replace("{n}", String(Math.round(perk.endless * 100)))}</li> : null}
              {perk?.daily ? <li>{t.perkDaily.replace("{n}", String(perk.daily))}</li> : null}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!isPlaced && <span className="text-xs font-semibold">{t.notPlaced}</span>}
              {isPlaced && perk?.daily && (
                <button
                  type="button"
                  disabled={busy || usedToday}
                  onClick={async () => {
                    const n = await onUse(def.id);
                    if (n) {
                      setGained(t.gained.replace("{n}", String(n)));
                      window.setTimeout(() => setGained(null), 2200);
                    }
                  }}
                  className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {usedToday ? t.usedToday : t.use[def.id]}
                </button>
              )}
              {perk?.link && t.go[def.id] && (
                <Link href={`/${locale}${perk.link}`} className="btn-bouncy bg-[var(--accent-yellow)] px-3 py-1.5 text-xs font-bold text-[#16132b]">
                  {t.go[def.id]} →
                </Link>
              )}
              {gained && <span className="text-sm font-extrabold text-[var(--accent-green)]">{gained}</span>}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-[var(--muted)]">{t.hint}</p>
      <p className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="pill bg-[var(--surface-muted)] px-2.5 py-1">{t.bonuses}:</span>
        {xpTest > 0 && <span className="pill bg-[var(--brand-50)] px-2.5 py-1">{t.perkXpTest.replace("{n}", String(xpTest))}</span>}
        {xpGame > 0 && <span className="pill bg-[var(--brand-50)] px-2.5 py-1">{t.perkXpGame.replace("{n}", String(xpGame))}</span>}
        {endless > 0 && <span className="pill bg-[var(--brand-50)] px-2.5 py-1">{t.perkEndless.replace("{n}", String(endless))}</span>}
      </p>
    </div>
  );
}
