"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getSettingsLookText } from "@/i18n/settings-look";
import { primaryButtonClass } from "./ui";
import { SettingRow } from "./ui-kit";

// Předplatné: ukáže, zda má účet PRO, a odkáže na stránku s tarify.
export function PlanSection({ locale }: { locale: Locale }) {
  const t = getSettingsLookText(locale);
  const [state, setState] = useState<"loading" | "login" | "pro" | "free" | "unknown">("loading");

  useEffect(() => {
    void fetch("/api/ucet/plan")
      .then((r) => r.json())
      .then((d) => setState(!d.loggedIn ? "login" : d.pro === null ? "unknown" : d.pro ? "pro" : "free"))
      .catch(() => setState("unknown"));
  }, []);

  const text = { loading: "…", login: t.planLogin, pro: t.planPro, free: t.planFree, unknown: t.planUnknown }[state];
  return (
    <SettingRow title={t.plan} hint={t.planHint}>
      <p className="mb-4 text-sm font-medium">{text}</p>
      {state !== "login" && state !== "loading" && (
        <Link href={`/${locale}/pro`} className={`${primaryButtonClass} inline-block`}>
          {t.planCta}
        </Link>
      )}
    </SettingRow>
  );
}
