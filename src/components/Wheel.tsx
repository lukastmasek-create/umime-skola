"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WHEEL_EXTRA_PRICE, WHEEL_PRIZES } from "@/lib/wheel";
import { WHEEL_LABEL_RADIUS } from "@/lib/rewards";
import { Icon } from "@/components/Icon";
import layout from "./kolo-stojan.json";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

// Ikony výher jako SVG (public/ikony/cat-*.svg), místo dřívějších WebP.
const ICON_FILE = { title: "cat-title", avatar: "cat-avatar", frame: "cat-frame", banner: "cat-banner" } as const;
const SEGMENT_ANGLE = 360 / WHEEL_PRIZES.length;
// Svislá poloha popisků od horního okraje kola, v procentech jeho výšky.
const LABEL_TOP = `${(0.5 - WHEEL_LABEL_RADIUS) * 100}%`;

function formatCountdown(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function Wheel({
  locale,
  dict,
  loggedIn,
  initialPoints,
  initialNextSpinAt,
}: {
  locale: Locale;
  dict: Dictionary;
  loggedIn: boolean;
  initialPoints: number;
  initialNextSpinAt: string | null;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [points, setPoints] = useState(initialPoints);
  const [nextSpinAt, setNextSpinAt] = useState(initialNextSpinAt);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [wonItem, setWonItem] = useState<string | null>(null);
  const [wonIcon, setWonIcon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [shown, setShown] = useState(initialPoints);
  const shownRef = useRef(initialPoints);
  const [burst, setBurst] = useState(0);
  // Po dotočení se kolo rozpadne (sprite z Blenderu) a pak se složí zpět.
  const [shatter, setShatter] = useState(0);
  const [reform, setReform] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // Počítadlo bodů plynule dopočítá na novou hodnotu (aktualizace běží v animačním snímku).
  useEffect(() => {
    const from = shownRef.current;
    if (from === points) return;
    const start = performance.now();
    let raf = 0;
    const tick = (nowMs: number) => {
      const k = Math.min(1, (nowMs - start) / 1200);
      const v = Math.round(from + (points - from) * (1 - (1 - k) ** 3));
      shownRef.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  const cooldownRemaining = nextSpinAt ? new Date(nextSpinAt).getTime() - now : 0;
  const onCooldown = cooldownRemaining > 0;

  async function spin(extra = false) {
    if (spinning || (onCooldown && !extra) || !loggedIn) return;
    setError(null);
    setWonAmount(null);
    setWonItem(null);
    setSpinning(true);

    try {
      const res = await fetch("/api/kolo-stesti", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ extra }) });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo.");
        if (data.nextSpinAt) setNextSpinAt(data.nextSpinAt);
        setSpinning(false);
        return;
      }

      const prizeIndex: number = data.prizeIndex;
      const segmentCenter = prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const fullSpins = 5 * 360;
      const currentMod = rotation % 360;
      const targetWithinTurn = 360 - segmentCenter;
      const delta = ((targetWithinTurn - currentMod) % 360 + 360) % 360;
      const newRotation = rotation + fullSpins + delta;

      setRotation(newRotation);

      window.setTimeout(() => {
        setSpinning(false);
        setWonAmount(data.amount);
        setWonItem(data.item ?? null);
        const won = WHEEL_PRIZES[prizeIndex].item;
        setWonIcon(data.item && won ? ICON_FILE[won.kind] : null);
        setBurst((b) => b + 1);
        setShatter((n) => n + 1);
        setReform(false);
        window.setTimeout(() => setReform(true), 1000);
        setPoints(data.points);
        setNextSpinAt(data.nextSpinAt);
      }, 4000);
    } catch {
      setError("Něco se pokazilo.");
      setSpinning(false);
    }
  }

  return (
    <div className="card flex flex-col items-center gap-5 p-8 text-center">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.shop.wheelTitle.replace(/^[^a-zA-ZÀ-ɏА-я0-9]+/, "")}
      </h2>
      <p className="max-w-sm text-sm text-[var(--muted)]">{dict.shop.wheelDesc}</p>

      {/* Pouťová budka z Blenderu: pevný stojan, disk s částkami se točí, žárovky v popředí běží dokola. */}
      <div className="relative mx-auto w-full max-w-[540px] overflow-hidden" style={{ aspectRatio: `${layout.w} / ${layout.h}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src="/home/obchod/kolo-stojan.webp" alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full select-none" />
        <div className="absolute aspect-square" style={{ left: `${layout.cx * 100}%`, top: `${layout.cy * 100}%`, width: `${layout.disk * 100}%`, transform: "translate(-50%, -50%)" }}>
          <div
            className={`absolute inset-0 ${reform ? "wheel-reform" : ""}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,1)" : "none",
              filter: "drop-shadow(0 6px 8px rgba(10,6,40,0.45))",
              visibility: shatter > 0 && !reform ? "hidden" : "visible",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" src="/home/obchod/kolo-disk.webp" alt="" aria-hidden draggable={false} className="h-full w-full select-none" />
            {WHEEL_PRIZES.map((prize, i) => {
              const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              return (
                <div key={i} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                  <span
                    className={`absolute left-1/2 font-extrabold text-white ${prize.item ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
                    style={{
                      top: LABEL_TOP,
                      transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                      fontFamily: "var(--font-heading)",
                      textShadow: "0 0 3px #16132b, 0 0 3px #16132b, 0 2px 0 #16132b",
                    }}
                  >
                    {prize.item ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" decoding="async" src={`/ikony/${ICON_FILE[prize.item.kind]}.svg`} alt={prize.item.name} draggable={false} className="h-12 w-12 select-none sm:h-16 sm:w-16" style={{ filter: "drop-shadow(0 2px 2px rgba(22,19,43,0.6))" }} />
                    ) : (
                      prize.amount
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          {shatter > 0 && !reform && (
            <span
              key={shatter}
              aria-hidden
              className="wheel-shatter pointer-events-none absolute z-20 block"
              style={{ left: "-31.6%", top: "-31.6%", width: "163.3%", height: "163.3%", backgroundImage: "url(/home/obchod/kolo-rozpad.webp)" }}
            />
          )}
          <span
            aria-hidden
            className="globe-sprite pointer-events-none absolute inset-0 block"
            style={{ backgroundImage: "url(/home/obchod/kolo-predni.webp)", animationDuration: spinning ? "0.5s" : "2.2s" }}
          />
        </div>
        {burst > 0 && <WheelWin key={burst} label={wonItem ?? `+${wonAmount ?? 0}`} icon={wonIcon} cx={layout.cx * 100} cy={layout.cy * 100} />}
      </div>

      {!loggedIn ? (
        <p className="text-sm text-[var(--muted)]">
          {dict.shop.loginToSpin}{" "}
          <Link href={`/${locale}/prihlaseni`} className="font-semibold text-[var(--brand-600)] hover:underline">
            {dict.nav.login}
          </Link>
        </p>
      ) : (
        <button
          onClick={() => spin()}
          disabled={spinning || onCooldown}
          className="btn-bouncy rounded-full bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {spinning
            ? dict.shop.spinning
            : onCooldown
              ? `${dict.shop.spinAgainIn} ${formatCountdown(cooldownRemaining)}`
              : dict.shop.spinButton}
        </button>
      )}
      {loggedIn && onCooldown && (
        <button
          onClick={() => spin(true)}
          disabled={spinning || points < WHEEL_EXTRA_PRICE}
          className="btn-bouncy -mt-2 rounded-full border border-[var(--brand-500)] px-5 py-2 text-sm font-semibold text-[var(--brand-600)] transition-colors hover:bg-[var(--brand-50)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Zatočit znovu za {WHEEL_EXTRA_PRICE} bodů
        </button>
      )}

      {wonAmount !== null && (
        <p className="pill flex items-center gap-2 bg-[var(--brand-50)] py-1 pl-1 pr-4 text-sm text-[var(--brand-700)]">
          <Icon name="hero-mince" size={32} />
          {wonItem ? `${dict.shop.wonPrefix} ${wonItem}` : `${dict.shop.wonPrefix} ${wonAmount} ${dict.shop.pointsSuffix}`}
        </p>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {loggedIn && (
        <p className="flex items-center gap-1 text-xs text-[var(--faint)]">
          <Icon name="hero-mince" size={18} />
          {dict.shop.yourPoints}: {shown}
        </p>
      )}
    </div>
  );
}

// Výhra: truhla vyskočí a otevře se, ze středu kola vylétnou konfety, jiskry a mince (čisté CSS, jednorázově).
function WheelWin({ label, icon, cx, cy }: { label: string; icon: string | null; cx: number; cy: number }) {
  const colors = ["#ff5a3c", "#ffd23a", "#3b9bff", "#7ee0b0", "#ff9ec7", "#c9b8ff"];
  return (
    <div aria-hidden className="wheel-win pointer-events-none absolute inset-0 z-30 overflow-visible">
      <div className="absolute" style={{ left: `${cx}%`, top: `${cy}%` }}>
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i / 40) * Math.PI * 2 + (i % 3) * 0.2;
          const d = 110 + ((i * 37) % 120);
          return (
            <span
              key={i}
              className="wheel-confetti absolute block h-2.5 w-1.5 rounded-[1px]"
              style={{ background: colors[i % colors.length], ["--dx" as string]: `${Math.cos(a) * d}px`, ["--dy" as string]: `${Math.sin(a) * d - 30}px`, ["--rot" as string]: `${(i * 97) % 540}deg`, animationDelay: `${(i % 5) * 0.04}s` }}
            />
          );
        })}
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="wheel-coin absolute block h-8 w-8" style={{ ["--dx" as string]: `${(i - 4.5) * 28}px`, ["--dx2" as string]: `${(i - 4.5) * 38}px`, animationDelay: `${0.25 + i * 0.05}s` }}>
            <Icon name="hero-mince" size={32} className="h-full w-full" />
          </span>
        ))}
      </div>
      <div className="wheel-chest absolute left-1/2 top-[10%] flex -translate-x-1/2 flex-col items-center">
        {icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" src={`/ikony/${icon}.svg`} alt="" draggable={false} className="h-40 w-40 select-none drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]" />
        )}
        <span className="whitespace-nowrap text-4xl font-extrabold text-[#ffd23a]" style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 4px #16132b, 0 3px 0 #16132b" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
