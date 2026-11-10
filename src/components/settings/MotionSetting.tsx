"use client";

import { useEffect, useState } from "react";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import type { Locale } from "@/i18n/config";
import { SettingRow, Switch } from "./ui-kit";

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

  function toggleMotion(on: boolean) {
    setMotionOff(!on);
    try {
      if (!on) localStorage.setItem("motion", "off");
      else localStorage.removeItem("motion");
    } catch {
      // ignorovat
    }
    if (!on) document.documentElement.setAttribute("data-motion", "off");
    else document.documentElement.removeAttribute("data-motion");
  }

  return (
    <SettingRow title={t.motion} hint={t.motionHint} control={<Switch checked={!motionOff} onChange={toggleMotion} label={t.motion} />} />
  );
}
