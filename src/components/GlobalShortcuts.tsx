"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getHomeText } from "@/i18n/home";
import { useAccount } from "@/lib/use-account";
import { SketchIcon } from "@/components/SketchIcons";
import { PcardTape } from "@/components/PcardArt";
import { GROUP_SVG_ICON, isActiveTab, useGroups } from "@/components/NavTabs";

// Zkratky G + písmeno: stránka, kterou písmeno otevře. Když už na ní jste, zobrazí se její sekce (záložky).
const LETTERS: Record<string, { path: string; label: string }> = {
  H: { path: "", label: "Domů" },
  K: { path: "/kurzy/zakladni", label: "Kurzy" },
  D: { path: "/denni-kviz", label: "Denní kvíz" },
  Z: { path: "/zebricky", label: "Žebříčky" },
  O: { path: "/obchod", label: "Obchod" },
  N: { path: "/nastaveni", label: "Nastavení" },
};

const ARROWS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
const KBD = "rounded-md border border-[var(--edge)] bg-[var(--surface)] px-1.5 font-mono text-xs font-bold";

// Štítek se zkratkou (číslo nebo písmeno) na dlaždici nebo podsekci.
function ShortcutKey({ children }: { children: string | number }) {
  return (
    <kbd className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border border-[var(--edge)] bg-[var(--surface)] px-1 font-mono text-xs font-bold text-[var(--foreground)]">
      {children}
    </kbd>
  );
}

// Papírová karta s přehledem zkratek (styl jako karty na úvodní stránce).
function ShortcutCard({ sections, onPick }: { sections: { label: string; el: HTMLElement }[] | null; onPick: (el: HTMLElement) => void }) {
  const rows: [string, string][] = Object.entries(LETTERS).map(([k, v]) => [k, v.label]);
  return (
    <aside
      aria-label="Přehled zkratek"
      className="nav-panel pointer-events-auto fixed bottom-4 right-4 z-[95] w-64 max-w-[calc(100vw-2rem)] -rotate-1 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-4 pt-5 shadow-[0_6px_0_var(--shadow-ink)]"
    >
      <PcardTape />
      <p className="mb-2 text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
        Zkratky
      </p>
      <ul className="space-y-1.5 text-sm">
        <li className="flex items-center justify-between gap-2">
          <span>Nabídka</span>
          <span className="flex gap-1"><kbd className={KBD}>G</kbd></span>
        </li>
        {rows.map(([k, label]) => (
          <li key={k} className="flex items-center justify-between gap-2">
            <span>{label}</span>
            <span className="flex gap-1">
              <kbd className={KBD}>G</kbd>
              <kbd className={KBD}>{k}</kbd>
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-2 text-[var(--muted)]">
          <span>Skupina v nabídce</span>
          <kbd className={KBD}>1–9</kbd>
        </li>
      </ul>

      {sections && (
        <div className="mt-3 border-t-2 border-dashed border-[var(--border-soft)] pt-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Sekce na této stránce</p>
          {sections.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Na této stránce nejsou žádné sekce.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {sections.slice(0, 9).map((s, i) => (
                <li key={i}>
                  <button type="button" onClick={() => onPick(s.el)} className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left font-semibold hover:bg-[var(--surface-muted)]">
                    <ShortcutKey>{i + 1}</ShortcutKey>
                    <span className="truncate">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
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
  // Sekce (záložky) aktuální stránky, pokud je jejich podmenu otevřené.
  const [sections, setSections] = useState<{ label: string; el: HTMLElement }[] | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setExpanded(null);
    setSections(null);
    setOpenPath(pathname ?? "");
  }, [pathname]);

  const close = useCallback(() => {
    if (!open) return;
    setOpenPath(null);
    setExpanded(null);
    setSections(null);
    returnFocus.current?.focus?.();
  }, [open]);

  // Vybere sekci (záložku) a nabídku zavře.
  const pick = useCallback((el: HTMLElement) => {
    el.click();
    setOpenPath(null);
    setExpanded(null);
    setSections(null);
  }, []);

  // Klávesy po celém webu (ignoruje psaní do polí a kombinace s Ctrl/Cmd/Alt).
  useEffect(() => {
    // Sekce aktuální stránky = záložky v hlavním obsahu (role="tab").
    const readSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("main [role='tab']")).map((el) => ({
        label: (el.textContent ?? "").trim(),
        el,
      }));
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "Escape") {
        // Esc zavře nejdřív podmenu sekcí, pak rozbalenou skupinu, až potom celou nabídku.
        if (open && sections) setSections(null);
        else if (open && expanded) setExpanded(null);
        else close();
        return;
      }
      const k = e.key.toUpperCase();
      // Sekce aktuální stránky: číslice vybere záložku a nabídka se zavře.
      if (open && sections && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const s = sections[Number(e.key) - 1];
        if (s) pick(s.el);
        return;
      }
      if (open && k.length === 1 && Object.prototype.hasOwnProperty.call(LETTERS, k)) {
        e.preventDefault();
        const target = LETTERS[k];
        const base = `/${locale}${target.path}`;
        const onPage = target.path === "" ? pathname === `/${locale}` : pathname === base || !!pathname?.startsWith(`${base}/`);
        if (onPage) {
          // Už jsme na této stránce: stisk otevře (nebo zavře) její sekce, bez přechodu.
          setExpanded(null);
          setSections(sections ? null : readSections());
          return;
        }
        setOpenPath(null);
        setExpanded(null);
        setSections(null);
        router.push(base);
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
  }, [locale, router, open, expanded, sections, groups, pathname, show, close, pick]);

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

      <ShortcutCard sections={sections} onPick={pick} />
    </div>
  );
}
