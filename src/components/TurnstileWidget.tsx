"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile-config";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

function loadScript(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile"))));
    script.addEventListener("error", () => reject(new Error("turnstile")));
  });
}

// Cloudflare Turnstile widget. Vrací token přes onToken; po každém odeslání se musí resetovat (token platí jednou).
export const TurnstileWidget = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void; locale?: string }>(
  function TurnstileWidget({ onToken, locale }, ref) {
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const api = useRef<TurnstileApi | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    useImperativeHandle(ref, () => ({
      reset() {
        onTokenRef.current(null);
        if (api.current && widgetId.current) api.current.reset(widgetId.current);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      loadScript()
        .then((t) => {
          if (cancelled || !container.current) return;
          api.current = t;
          widgetId.current = t.render(container.current, {
            sitekey: TURNSTILE_SITE_KEY,
            language: locale ?? "auto",
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
          });
        })
        .catch(() => onTokenRef.current(null));
      return () => {
        cancelled = true;
        if (api.current && widgetId.current) api.current.remove(widgetId.current);
        widgetId.current = null;
      };
    }, [locale]);

    return <div ref={container} className="min-h-[65px]" />;
  }
);
