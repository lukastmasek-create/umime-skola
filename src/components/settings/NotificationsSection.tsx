"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getSettingsLookText } from "@/i18n/settings-look";
import { post } from "./ui";
import { SettingRow, Switch } from "./ui-kit";

// Oznámení: e-mailové připomínky termínů zadání (žák den předem, učitel souhrn po termínu).
export function NotificationsSection({ locale, onSaved }: { locale: Locale; onSaved: () => void }) {
  const t = getSettingsLookText(locale);
  const [state, setState] = useState<{ loggedIn: boolean; deadline: boolean; hasEmail: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/ucet/oznameni")
      .then((r) => r.json())
      .then((d) => setState({ loggedIn: !!d.loggedIn, deadline: !!d.deadline, hasEmail: !!d.hasEmail }))
      .catch(() => setState({ loggedIn: false, deadline: false, hasEmail: false }));
  }, []);

  async function toggle(deadline: boolean) {
    if (!state) return;
    setBusy(true);
    const r = await post("/api/ucet/oznameni", { deadline });
    setBusy(false);
    if (r.ok) {
      setState({ ...state, deadline });
      onSaved();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--faint)]">{t.notifyHint}</p>
      {state && !state.loggedIn && <p className="text-sm text-[var(--muted)]">{t.notifyLogin}</p>}
      {state?.loggedIn && (
        <>
          <SettingRow
            title={t.notifyDeadline}
            hint={t.notifyDeadlineHint}
            control={<Switch checked={state.deadline} onChange={(v) => !busy && void toggle(v)} label={t.notifyDeadline} />}
          />
          {!state.hasEmail && <p className="text-sm font-medium text-[var(--danger)]">{t.notifyNoEmail}</p>}
        </>
      )}
    </div>
  );
}
