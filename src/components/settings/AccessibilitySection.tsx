"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getSettingsLookText } from "@/i18n/settings-look";
import { SettingRow, Switch } from "./ui-kit";

// Přístupnost: vysoký kontrast, podtržené odkazy, větší mezery. Ukládá se do localStorage a atributů na <html>.
const OPTIONS = [
  { key: "contrast", value: "high", attr: "data-contrast" },
  { key: "links", value: "underline", attr: "data-links" },
  { key: "spacing", value: "wide", attr: "data-spacing" },
] as const;

export function AccessibilitySection({ locale, onChange }: { locale: Locale; onChange: () => void }) {
  const t = getSettingsLookText(locale);
  const [on, setOn] = useState<Record<string, boolean>>({});

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      setOn(Object.fromEntries(OPTIONS.map((o) => [o.key, localStorage.getItem(o.key) === o.value])));
    } catch {
      // bez localStorage zůstane vše vypnuté
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function toggle(o: (typeof OPTIONS)[number], v: boolean) {
    setOn((p) => ({ ...p, [o.key]: v }));
    try {
      if (v) localStorage.setItem(o.key, o.value);
      else localStorage.removeItem(o.key);
    } catch {
      // ignorovat
    }
    if (v) document.documentElement.setAttribute(o.attr, o.value);
    else document.documentElement.removeAttribute(o.attr);
    onChange();
  }

  const text = { contrast: [t.contrast, t.contrastHint], links: [t.links, t.linksHint], spacing: [t.spacing, t.spacingHint] } as const;
  return (
    <div className="flex flex-col gap-4">
      {OPTIONS.map((o) => (
        <SettingRow
          key={o.key}
          title={text[o.key][0]}
          hint={text[o.key][1]}
          control={<Switch checked={!!on[o.key]} onChange={(v) => toggle(o, v)} label={text[o.key][0]} />}
        />
      ))}
    </div>
  );
}
