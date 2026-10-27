"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { LiveView } from "@/lib/live/types";

export type Identity = { kind: "host"; secret: string } | { kind: "player"; token: string; name: string };

const hostKey = (pin: string) => `live-host-${pin}`;
const playerKey = (pin: string) => `live-player-${pin}`;

const CHANGED = "live-identity-changed";
const notify = () => window.dispatchEvent(new Event(CHANGED));

export function saveHost(pin: string, secret: string) {
  try {
    localStorage.setItem(hostKey(pin), secret);
  } catch {}
  notify();
}

export function savePlayer(pin: string, token: string, name: string) {
  try {
    localStorage.setItem(playerKey(pin), JSON.stringify({ token, name }));
  } catch {}
  notify();
}

export function forget(pin: string) {
  try {
    localStorage.removeItem(hostKey(pin));
    localStorage.removeItem(playerKey(pin));
  } catch {}
  notify();
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGED, cb);
    window.removeEventListener("storage", cb);
  };
}

function rawIdentity(pin: string): string {
  try {
    return `${localStorage.getItem(hostKey(pin)) ?? ""}|${localStorage.getItem(playerKey(pin)) ?? ""}`;
  } catch {
    return "|";
  }
}

/** Kdo jsem v téhle místnosti (učitel, hráč, nikdo); undefined, dokud nejsme v prohlížeči. */
export function useStoredIdentity(pin: string): Identity | null | undefined {
  const raw = useSyncExternalStore(subscribe, () => rawIdentity(pin), () => "?");
  return useMemo(() => {
    if (raw === "?") return undefined;
    const cut = raw.indexOf("|");
    const host = raw.slice(0, cut);
    const player = raw.slice(cut + 1);
    if (host) return { kind: "host", secret: host } as Identity;
    if (player) {
      try {
        const p = JSON.parse(player) as { token?: string; name?: string };
        if (p.token) return { kind: "player", token: p.token, name: p.name ?? "" } as Identity;
      } catch {}
    }
    return null;
  }, [raw]);
}

export function headersFor(id: Identity | null): Record<string, string> {
  if (!id) return {};
  return id.kind === "host" ? { "x-host-secret": id.secret } : { "x-player-token": id.token };
}

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: string; status: number };

export async function liveApi<T = Record<string, unknown>>(
  path: string,
  opts: { method?: string; body?: unknown; identity?: Identity | null } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/live${path}`, {
      method: opts.method ?? (opts.body ? "POST" : "GET"),
      headers: { "content-type": "application/json", ...headersFor(opts.identity ?? null) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: typeof data.error === "string" ? data.error : "unavailable", status: res.status };
    return { ok: true, ...(data as T) };
  } catch {
    return { ok: false, error: "unavailable", status: 0 };
  }
}

/** Čte stav hry každou sekundu (po skončení pomaleji). Vrací i čas serveru podle hodin klienta. */
export function useLiveView(pin: string, identity: Identity | null) {
  const [view, setView] = useState<LiveView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const offset = useRef(0);

  useEffect(() => {
    if (!identity) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
      const r = await liveApi(`/rooms/${pin}`, { identity });
      if (stop) return;
      let next = 1000;
      if (r.ok) {
        const v = r as unknown as LiveView;
        offset.current = v.serverNow - Date.now();
        setView(v);
        setError(null);
        if (v.status === "ENDED") next = 4000;
      } else {
        setError(r.error);
        next = r.status === 404 || r.status === 401 ? 5000 : 2000;
      }
      timer = setTimeout(run, next);
    };
    void run();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [pin, identity, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  /** Aktuální čas serveru podle hodin klienta. */
  const serverNow = useCallback(() => Date.now() + offset.current, []);
  return { view, error, refresh, serverNow };
}
