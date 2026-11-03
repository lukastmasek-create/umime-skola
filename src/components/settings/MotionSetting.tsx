"use client";

import { useEffect, useState } from "react";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import type { Locale } from "@/i18n/config";
import { headingStyle } from "./ui";

export function MotionSetting({ locale }: { locale: Locale }) {
  const t = getSettingsExtraText(locale);
  const [motionOff, setMotionOff] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      setMotionOff(localStorage.getItem("motion") === "off");
    } catch {
      // bez localStorage zůstanou animace zapnuté
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function toggleMotion(off: boolean) {
    setMotionOff(off);
    try {
      if (off) localStorage.setItem("motion", "off");
      else localStorage.removeItem("motion");
    } catch {
      // ignorovat
    }
    if (off) document.documentElement.setAttribute("data-motion", "off");
    else document.documentElement.removeAttribute("data-motion");
  }

  const opt = (on: boolean) => `btn-bouncy rounded-full px-4 py-2 text-sm font-medium ${on ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`;

  return (
    <section className="card p-6">
      <h2 className="mb-2 text-lg font-bold" style={headingStyle}>
        {t.motion}
      </h2>
      <p className="mb-3 text-sm text-[var(--muted)]">{t.motionHint}</p>
      <div className="flex gap-2">
        <button type="button" className={opt(!motionOff)} onClick={() => toggleMotion(false)}>
          {t.motionOn}
        </button>
        <button type="button" className={opt(motionOff)} onClick={() => toggleMotion(true)}>
          {t.motionOff}
        </button>
      </div>
    </section>
  );
}
