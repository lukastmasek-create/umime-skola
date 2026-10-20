"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WHEEL_PRIZES } from "@/lib/wheel";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const SEGMENT_ANGLE = 360 / WHEEL_PRIZES.length;

function buildConicGradient() {
  const stops = WHEEL_PRIZES.map((prize, i) => {
    const from = i * SEGMENT_ANGLE;
    const to = from + SEGMENT_ANGLE;
    return `${prize.color} ${from}deg ${to}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

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

      <div className="relative h-64 w-64">
        <div
          className="absolute left-1/2 top-[-14px] z-10 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "22px solid var(--accent-500)",
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
          }}
        />
        <div
          className="relative h-full w-full rounded-full border-[6px] shadow-lg"
          style={{
            borderColor: "var(--surface)",
            background: buildConicGradient(),
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,1)" : "none",
            boxShadow: "0 10px 30px -8px rgba(90, 69, 240, 0.35)",
          }}
        >
          {WHEEL_PRIZES.map((prize, i) => {
            const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 text-xs font-bold text-white"
                style={{
                  transform: `rotate(${angle}deg) translate(0, -92px) rotate(${-angle}deg)`,
                  textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                }}
              >
                {prize.amount}
              </div>
            );
          })}
        </div>
        <div
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow"
          style={{ background: "var(--surface)" }}
        >
          🎡
        </div>
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
        <p className="pill bg-[var(--brand-50)] px-4 py-2 text-sm text-[var(--brand-700)]">
          🎉 {dict.shop.wonPrefix} {wonAmount} {dict.shop.pointsSuffix}
        </p>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {loggedIn && (
        <p className="text-xs text-[var(--faint)]">
          {dict.shop.yourPoints}: {points}
        </p>
      )}
    </div>
  );
}
