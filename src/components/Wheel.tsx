"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WHEEL_PRIZES } from "@/lib/wheel";
import { WHEEL_LABEL_RADIUS } from "@/lib/rewards";
import { RewardImage } from "@/components/RewardImage";
import layout from "./kolo-stojan.json";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

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
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [shown, setShown] = useState(initialPoints);
  const shownRef = useRef(initialPoints);
  const [burst, setBurst] = useState(0);

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

  async function spin() {
    if (spinning || onCooldown || !loggedIn) return;
    setError(null);
    setWonAmount(null);
    setSpinning(true);

    try {
      const res = await fetch("/api/kolo-stesti", { method: "POST" });
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
        setBurst((b) => b + 1);
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
      <div className="relative mx-auto w-full max-w-[540px]" style={{ aspectRatio: `${layout.w} / ${layout.h}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/obchod/kolo-stojan.webp" alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full select-none" />
        <div className="absolute aspect-square" style={{ left: `${layout.cx * 100}%`, top: `${layout.cy * 100}%`, width: `${layout.disk * 100}%`, transform: "translate(-50%, -50%)" }}>
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,1)" : "none",
              filter: "drop-shadow(0 6px 8px rgba(10,6,40,0.45))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/obchod/kolo-disk.webp" alt="" aria-hidden draggable={false} className="h-full w-full select-none" />
            {WHEEL_PRIZES.map((prize, i) => {
              const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              return (
                <div key={i} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                  <span
                    className="absolute left-1/2 text-lg font-extrabold text-white sm:text-xl"
                    style={{
                      top: LABEL_TOP,
                      transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                      fontFamily: "var(--font-heading)",
                      textShadow: "0 0 3px #16132b, 0 0 3px #16132b, 0 2px 0 #16132b",
                    }}
                  >
                    {prize.amount}
                  </span>
                </div>
              );
            })}
          </div>
          <span
            aria-hidden
            className="globe-sprite pointer-events-none absolute inset-0 block"
            style={{ backgroundImage: "url(/home/obchod/kolo-predni.webp)", animationDuration: spinning ? "0.5s" : "2.2s" }}
          />
        </div>
        {burst > 0 && <WheelWin key={burst} amount={wonAmount ?? 0} cx={layout.cx * 100} cy={layout.cy * 100} />}
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
          onClick={spin}
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

      {wonAmount !== null && (
        <p className="pill flex items-center gap-2 bg-[var(--brand-50)] py-1 pl-1 pr-4 text-sm text-[var(--brand-700)]">
          <RewardImage name="mince-otoceni" size={32} />
          {dict.shop.wonPrefix} {wonAmount} {dict.shop.pointsSuffix}
        </p>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {loggedIn && (
        <p className="flex items-center gap-1 text-xs text-[var(--faint)]">
          <RewardImage name="mince" size={18} />
          {dict.shop.yourPoints}: {shown}
        </p>
      )}
    </div>
  );
}

// Výhra: truhla vyskočí a otevře se, ze středu kola vylétnou konfety, jiskry a mince (čisté CSS, jednorázově).
function WheelWin({ amount, cx, cy }: { amount: number; cx: number; cy: number }) {
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
            <RewardImage name="mince-otoceni" size={32} className="h-full w-full" />
          </span>
        ))}
      </div>
      <div className="wheel-chest absolute left-1/2 top-[8%] w-[46%] -translate-x-1/2">
        <RewardImage name="truhla-otevreni" size={256} className="h-auto w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]" />
        <span className="mt-1 block text-center text-3xl font-extrabold text-[#ffd23a]" style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 4px #16132b, 0 3px 0 #16132b" }}>
          +{amount}
        </span>
      </div>
    </div>
  );
}
