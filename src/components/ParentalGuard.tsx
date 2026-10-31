"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import { useAccount } from "@/lib/use-account";
import type { Locale } from "@/i18n/config";

// Rodičovská kontrola v prohlížeči: počítá čas na webu za den (jen když je karta vidět) a po limitu web zakryje;
// rodič čas odemkne PINem do konce dne. Při zákazu společného hraní zakryje stránky Hrát společně a Parta.
const today = () => new Date().toISOString().slice(0, 10);

export function ParentalGuard({ locale }: { locale: Locale }) {
  const t = getSettingsExtraText(locale);
  const [account] = useAccount();
  const pathname = usePathname() ?? "";
  const [rules, setRules] = useState<{ minutes: number; blockTogether: boolean } | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const loggedIn = !!account && account.loggedIn;

  useEffect(() => {
    if (!loggedIn) return;
    void fetch("/api/ucet/rodic")
      .then((r) => r.json())
      .then((d) => d.enabled && setRules({ minutes: d.minutes, blockTogether: d.blockTogether }))
      .catch(() => {});
  }, [loggedIn]);

  useEffect(() => {
    if (!rules?.minutes) return;
    const key = `pc:time:${today()}`;
    const tick = () => {
      if (document.hidden) return;
      try {
        if (localStorage.getItem(`pc:unlock:${today()}`)) return;
        const used = Number(localStorage.getItem(key) || 0) + 15;
        localStorage.setItem(key, String(used));
        if (used >= rules.minutes * 60) setTimeUp(true);
      } catch {
        // bez localStorage limit nehlídáme
      }
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [rules]);

  const together = !!rules?.blockTogether && /\/(hrat-spolecne|parta)(\/|$)/.test(pathname);
  if (!timeUp && !together) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#16132b]/92 p-6 text-center text-white backdrop-blur">
      <div className="flex max-w-md flex-col items-center gap-3">
        <p className="text-5xl" aria-hidden>
          {timeUp ? "⏰" : "👪"}
        </p>
        <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          {timeUp ? t.timeUp : t.parental}
        </h2>
        <p className="text-sm opacity-85">{timeUp ? t.timeUpHint : t.blockedTogether}</p>
        {timeUp && (
          <form
            className="flex items-center gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch("/api/ucet/rodic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", pin }) }).catch(() => null);
              if (res?.ok) {
                try {
                  localStorage.setItem(`pc:unlock:${today()}`, "1");
                } catch {
                  // ignorovat
                }
                setTimeUp(false);
              } else setErr(true);
            }}
          >
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder={t.pin} className="rounded-xl border-2 border-white/40 bg-white/10 px-3 py-2 text-sm text-white" />
            <button type="submit" className="btn-bouncy bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b]">
              {t.unlock}
            </button>
          </form>
        )}
        {err && <p className="text-sm font-semibold text-[#ff8a8a]">{t.errors["wrong-pin"]}</p>}
      </div>
    </div>
  );
}
