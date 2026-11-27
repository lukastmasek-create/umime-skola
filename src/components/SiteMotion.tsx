"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/motion";

// Pohyb po celém webu: světlo za kurzorem na kartách, náběh karet při rolování, kruh po kliknutí na tlačítko
// a jemný náběh obsahu při přechodu na jinou stránku. Nic nemění rozložení (jen vlastnosti translate, opacity
// a pomocné prvky mimo tok) a respektuje systémové omezení pohybu i přepínač „Animace“ v nastavení.
// Styly jsou v globals.css v bloku „Pohyb po celém webu“.

const CARD = ".card";
const REVEAL = "main :is(.card, .gc-item, .hs-card, h2, h3, figure, blockquote), .site-footer";
const BUTTONS = ".btn-bouncy, .btn-primary, .btn-secondary, .btn-cta";

export function SiteMotion() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  // Přechod mezi stránkami: obsah jemně naběhne.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (prefersReducedMotion()) return;
    const main = document.querySelector("main");
    if (!main) return;
    main.classList.add("sm-page");
    const id = window.setTimeout(() => main.classList.remove("sm-page"), 700);
    return () => {
      window.clearTimeout(id);
      main.classList.remove("sm-page");
    };
  }, [pathname]);

  useEffect(() => {
    // 1) Světlo za kurzorem na kartě pod ukazatelem.
    let raf = 0;
    let pointer: { el: HTMLElement; x: number; y: number } | null = null;
    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch" || prefersReducedMotion()) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(CARD);
      pointer = el ? { el, x: e.clientX, y: e.clientY } : null;
      if (!pointer || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!pointer?.el.isConnected) return;
        const { el, x, y } = pointer;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${x - r.left}px`);
        el.style.setProperty("--my", `${y - r.top}px`);
      });
    }

    // 2) Kruh po kliknutí na tlačítko (prvek mimo tok, nic neposouvá).
    function onDown(e: PointerEvent) {
      if (prefersReducedMotion()) return;
      const btn = (e.target as Element | null)?.closest<HTMLElement>(BUTTONS);
      if (!btn || (btn as HTMLButtonElement).disabled) return;
      const ring = document.createElement("span");
      ring.className = "sm-ring";
      ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      window.setTimeout(() => ring.remove(), 900);
    }

    // 3) Náběh karet, které jsou při načtení pod okrajem obrazovky.
    const io = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          io?.unobserve(el);
          el.classList.remove("sm-pre");
          el.classList.add("sm-in");
          el.addEventListener("animationend", () => el.classList.remove("sm-in"), { once: true });
        }
      },
      { rootMargin: "0px 0px -3% 0px", threshold: 0.01 },
    );
    let order = 0;
    function prep(root: Document | Element) {
      if (!io || prefersReducedMotion()) return;
      const found = Array.from(root.querySelectorAll<HTMLElement>(REVEAL));
      if (root instanceof HTMLElement && root.matches(REVEAL)) found.unshift(root);
      const visibleHeight = window.innerHeight * 0.92;
      // Nejdřív měření, potom změny tříd, aby seznam karet nevyvolal opakovaný layout.
      const upcoming = found.filter((el) => {
        if (el.dataset.sm || el.parentElement?.closest(REVEAL)) return false;
        if (el.closest(".reveal, [data-sm-skip], [role=dialog], canvas, .gradient-hero")) return false;
        el.dataset.sm = "1";
        return el.getBoundingClientRect().top >= visibleHeight;
      });
      for (const el of upcoming) {
        el.style.setProperty("--sm-d", `${(order++ % 4) * 60}ms`);
        el.classList.add("sm-pre");
        io.observe(el);
      }
    }
    prep(document);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function resetMotion() {
      if (!prefersReducedMotion()) return;
      document.querySelectorAll<HTMLElement>(".sm-pre, .sm-in").forEach((el) => {
        io?.unobserve(el);
        el.classList.remove("sm-pre", "sm-in");
      });
    }
    media.addEventListener("change", resetMotion);
    const preferences = new MutationObserver(resetMotion);
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    // Obsah, který se dotáhne později (data z API, přepnutí záložky).
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (!(node instanceof HTMLElement) || node.isConnected) continue;
          if (node.classList.contains("sm-pre")) io?.unobserve(node);
          node.querySelectorAll(".sm-pre").forEach((el) => io?.unobserve(el));
        }
        for (const node of mutation.addedNodes) {
          if (node instanceof Element && node.isConnected) prep(node);
        }
      }
    });
    const main = document.querySelector("main");
    if (io && main) mo.observe(main, { childList: true, subtree: true });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      media.removeEventListener("change", resetMotion);
      preferences.disconnect();
      mo.disconnect();
      // Při opětovném spuštění efektu (např. v dev režimu) se karty připraví znovu, žádná nezůstane skrytá.
      document.querySelectorAll<HTMLElement>("[data-sm]").forEach((el) => {
        delete el.dataset.sm;
        el.classList.remove("sm-pre", "sm-in");
      });
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return null;
}
