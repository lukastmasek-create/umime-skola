"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WHEEL_PRIZES } from "@/lib/wheel";
import { WHEEL_LABEL_RADIUS } from "@/lib/rewards";
import { RewardImage } from "@/components/RewardImage";
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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

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

      {/* Disk z Blenderu se točí i s částkami, náboj s ručičkou leží pevně nad ním. */}
      <div className="relative aspect-square w-72 max-w-full">
        <div
          className="absolute inset-0"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,1)" : "none",
          }}
        >
          <RewardImage name="kolo-disk" size={288} preload className="h-full w-full" />
          {WHEEL_PRIZES.map((prize, i) => {
            const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            return (
              <div key={i} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                <span
                  className="absolute left-1/2 text-lg font-extrabold text-white"
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
        <RewardImage
          name="kolo-stred"
          size={288}
          preload
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
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
          {dict.shop.yourPoints}: {points}
        </p>
      )}
    </div>
  );
}
