"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Klávesové zkratky po celém webu: stiskni G a pak písmeno (G H domů, G K kurzy ...).
const MAP: Record<string, { path: string; label: string }> = {
  H: { path: "", label: "Domů" },
  K: { path: "/kurzy/zakladni", label: "Kurzy" },
  D: { path: "/denni-kviz", label: "Denní kvíz" },
  Z: { path: "/zebricky", label: "Žebříčky" },
  O: { path: "/obchod", label: "Obchod" },
  N: { path: "/nastaveni", label: "Nastavení" },
};

export function GlobalShortcuts({ locale }: { locale: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armedRef = useRef(false);

  useEffect(() => {
    const set = (v: boolean) => {
      armedRef.current = v;
      setArmed(v);
      if (timer.current) clearTimeout(timer.current);
      if (v) timer.current = setTimeout(() => set(false), 2200);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const k = e.key.toUpperCase();
      if (armedRef.current) {
        const target = MAP[k];
        set(false);
        if (target) { e.preventDefault(); router.push(`/${locale}${target.path}`); }
        return;
      }
      if (k === "G") set(true);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (timer.current) clearTimeout(timer.current); };
  }, [locale, router]);

  if (!armed) return null;
  return (
    <div role="status" className="gs-pop">
      <b>G</b>
      {Object.entries(MAP).map(([k, v]) => (
        <span key={k}><kbd>{k}</kbd> {v.label}</span>
      ))}
    </div>
  );
}
