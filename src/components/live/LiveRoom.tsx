"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { fmt, getLiveText, type LiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import { useAccount } from "@/lib/use-account";
import { forget, liveApi, savePlayer, useLiveView, useStoredIdentity, type Identity } from "./api";
import { HostView } from "./HostView";
import { PlayerView } from "./PlayerView";

export function errorText(t: LiveText, code: string | null | undefined): string {
  if (!code) return "";
  return t.errors[code] ?? t.errors.default;
}

function JoinForm({ locale, pin, onJoined }: { locale: Locale; pin: string; onJoined: (id: Identity) => void }) {
  const t = getLiveText(locale);
  const [account] = useAccount();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loggedIn = account && account.loggedIn ? account : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await liveApi<{ token: string; name: string }>(`/rooms/${pin}/join`, { body: { name: name || loggedIn?.name || "" } });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    savePlayer(pin, r.token, r.name);
    onJoined({ kind: "player", token: r.token, name: r.name });
  }

  return (
    <form onSubmit={submit} className="card mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.join.title}
      </h1>
      <p className="text-center font-mono text-3xl font-extrabold tracking-[0.3em]">{pin}</p>
      {loggedIn ? (
        <p className="text-sm text-[var(--muted)]">{fmt(t.join.loggedInAs, { name: loggedIn.name ?? "" })}</p>
      ) : (
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t.join.name}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            autoFocus
            autoComplete="nickname"
            placeholder={t.join.namePlaceholder}
            className="rounded-lg border-2 px-3 py-3 text-lg outline-none focus:border-[var(--brand-500)]"
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold text-[var(--danger)]">
          {errorText(t, error)}
        </p>
      )}
      <button type="submit" disabled={busy || (!loggedIn && !name.trim())} className="btn-bouncy btn-primary btn-lg disabled:opacity-50">
        {t.join.button}
      </button>
    </form>
  );
}

export function LiveRoom({ locale, pin }: { locale: Locale; pin: string }) {
  const t = getLiveText(locale);
  // undefined = ještě nevíme (úložiště čteme až v prohlížeči), null = nikdo se nepřihlásil
  const identity = useStoredIdentity(pin);

  const { view, error, serverNow } = useLiveView(pin, identity ?? null);

  if (identity === undefined) return null;
  if (!identity) return <JoinForm locale={locale} pin={pin} onJoined={() => {}} />;

  if (error === "room-not-found" || (error === "unauthorized" && !view)) {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <p className="font-semibold">{errorText(t, error)}</p>
        <button
          type="button"
          className="btn-bouncy btn-primary btn-lg"
          onClick={() => forget(pin)}
        >
          {t.join.button}
        </button>
        <Link href={`/${locale}/hrat-spolecne`} className="text-sm font-bold text-[var(--brand-600)] hover:underline">
          {t.title}
        </Link>
      </div>
    );
  }
  if (!view) return <p className="text-center text-[var(--muted)]">{t.create.loading}</p>;

  return (
    <div className="fs-classic">
      <div className="w-full">
        {identity.kind === "host" ? (
          <HostView locale={locale} t={t} view={view} identity={identity} serverNow={serverNow} />
        ) : (
          <PlayerView locale={locale} t={t} view={view} identity={identity} serverNow={serverNow} />
        )}
      </div>
    </div>
  );
}
