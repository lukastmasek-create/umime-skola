"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getHomeText } from "@/i18n/home";
import { useAccount } from "@/lib/use-account";
import { SketchIcon } from "@/components/SketchIcons";
import { GROUP_SVG_ICON, isActiveTab, useGroups } from "@/components/NavTabs";

// Klávesa G otevře velkou nabídku s ikonovými dlaždicemi. Zkratky G + písmeno fungují dál:
// uvnitř otevřené nabídky stačí stisknout písmeno (H domů, K kurzy, D kvíz, Z žebříčky, O obchod, N nastavení).
const LETTERS: Record<string, string> = {
  H: "",
  K: "/kurzy/zakladni",
  D: "/denni-kviz",
  Z: "/zebricky",
  O: "/obchod",
  N: "/nastaveni",
};

const ARROWS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];

// Štítek se zkratkou (číslo nebo písmeno) na dlaždici nebo podsekci.
function ShortcutKey({ children }: { children: string | number }) {
  return (
    <kbd className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border border-[var(--edge)] bg-[var(--surface)] px-1 font-mono text-xs font-bold text-[var(--foreground)]">
      {children}
    </kbd>
  );
}

export function GlobalShortcuts({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();
  const [account] = useAccount();
  const groups = useGroups(locale, dict, account ? account.loggedIn : null);
  const t = getHomeText(locale);

  // Nabídka je otevřená jen na stránce, na které byla otevřena; po přechodu jinam se sama zavře.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath !== null && openPath === pathname;
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setExpanded(null);
    setOpenPath(pathname ?? "");
  }, [pathname]);

  const close = useCallback(() => {
    if (!open) return;
    setOpenPath(null);
    setExpanded(null);
    returnFocus.current?.focus?.();
  }, [open]);

  // Klávesy po celém webu (ignoruje psaní do polí a kombinace s Ctrl/Cmd/Alt).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "Escape") {
        // Esc nejdřív zavře rozbalenou skupinu, až potom celou nabídku.
        if (open && expanded) setExpanded(null);
        else close();
        return;
      }
      const k = e.key.toUpperCase();
      if (open && k.length === 1 && Object.prototype.hasOwnProperty.call(LETTERS, k)) {
        e.preventDefault();
        setOpenPath(null);
        setExpanded(null);
        router.push(`/${locale}${LETTERS[k]}`);
        return;
      }
      // Číslice: bez rozbalené skupiny vybírají skupinu, s rozbalenou jen její podsekce.
      // Zkratky ostatních skupin jsou v tu chvíli vypnuté.
      if (open && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const n = Number(e.key) - 1;
        if (!expanded) {
          const group = groups[n];
          if (group) setExpanded(group.key);
        } else {
          const tab = groups.find((g) => g.key === expanded)?.items[n];
          if (tab) {
            setOpenPath(null);
            setExpanded(null);
            router.push(tab.href);
          }
        }
        return;
      }
      if (k === "G") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locale, router, open, expanded, groups, show, close]);

  // Fokus se přesune do nabídky (na dlaždice, nebo na podsekce po rozbalení skupiny).
  useEffect(() => {
    if (!open) return;
    const target = expanded ? "[data-sub] a" : "[data-tiles] button";
    panelRef.current?.querySelector<HTMLElement>(target)?.focus();
  }, [open, expanded]);

  // Šipky posouvají fokus mezi dlaždicemi a podpoložkami.
  const onArrow = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!ARROWS.includes(e.key)) return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    items[(i + step + items.length) % items.length].focus();
  };

  if (!open) return null;
  const current = groups.find((g) => g.key === expanded) ?? null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[rgba(8,12,30,0.55)] p-3 pt-[8vh] sm:p-6"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.menu}
        onKeyDown={onArrow}
        className="nav-panel w-full max-w-3xl rounded-3xl border-2 border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[0_8px_0_var(--shadow-ink)] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.menu}
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[var(--muted)] sm:inline">
              {expanded ? "1–9 vybrat · Esc zpět" : "1–9 skupina · Esc zavře"} · šipky pohyb
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={t.closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
            >
              <SketchIcon kind="close" size={18} />
            </button>
          </div>
        </div>

        <div data-tiles className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {groups.map((group, i) => {
            const isOpen = expanded === group.key;
            // Když je některá skupina rozbalená, zkratky ostatních dlaždic jsou vypnuté.
            const shortcutOn = !expanded;
            const active = group.items.some((tab) => isActiveTab(pathname, tab));
            return (
              <button
                key={group.key}
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : group.key)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4 text-center transition-all ${
                  isOpen || active
                    ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
                    : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--foreground)]"
                } ${shortcutOn ? "hover:-translate-y-0.5" : expanded ? "opacity-40" : ""}`}
              >
                {shortcutOn && i < 9 && <ShortcutKey>{i + 1}</ShortcutKey>}
                <SketchIcon kind={GROUP_SVG_ICON[group.key]} size={56} />
                <span className="text-sm font-bold leading-tight">{group.label}</span>
              </button>
            );
          })}
        </div>

        {current && (
          <div className="mt-4 rounded-2xl border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] p-3">
            <p className="mb-2 px-1 text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              {current.label}
            </p>
            <div data-sub className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {current.items.map((tab, i) => {
                const isActive = isActiveTab(pathname, tab);
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    onClick={close}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-bold ${
                      isActive
                        ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
                        : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--edge)]"
                    }`}
                  >
                    {i < 9 && <ShortcutKey>{i + 1}</ShortcutKey>}
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
