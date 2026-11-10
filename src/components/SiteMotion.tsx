"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Pohyb po celém webu: světlo za kurzorem na kartách, náběh karet při rolování, kruh po kliknutí na tlačítko
// a jemný náběh obsahu při přechodu na jinou stránku. Nic nemění rozložení (jen vlastnosti translate, opacity
// a pomocné prvky mimo tok) a respektuje systémové omezení pohybu i přepínač „Animace“ v nastavení.
// Styly jsou v globals.css v bloku „Pohyb po celém webu“.

const CARD = ".card";
const BUTTONS = ".btn-bouncy, .btn-primary, .btn-secondary, .btn-cta";

function motionOff(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

export function SiteMotion() {
  const pathname = usePathname();

  // Přechod mezi stránkami: obsah jemně naběhne.
  useEffect(() => {
    if (motionOff()) return;
    const main = document.querySelector("main");
    if (!main) return;
    main.classList.remove("sm-page");
    void main.offsetWidth;
    main.classList.add("sm-page");
    const id = window.setTimeout(() => main.classList.remove("sm-page"), 700);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    // 1) Světlo za kurzorem na kartě pod ukazatelem.
    let raf = 0;
    let lastEvent: PointerEvent | null = null;
    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      lastEvent = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const ev = lastEvent;
        if (!ev || motionOff()) return;
        const el = (ev.target as Element | null)?.closest<HTMLElement>(CARD);
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${ev.clientX - r.left}px`);
        el.style.setProperty("--my", `${ev.clientY - r.top}px`);
      });
    }

    // 2) Kruh po kliknutí na tlačítko (prvek mimo tok, nic neposouvá).
    function onDown(e: PointerEvent) {
      if (motionOff()) return;
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
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          io.unobserve(el);
          el.classList.remove("sm-pre");
          el.classList.add("sm-in");
          el.addEventListener("animationend", () => el.classList.remove("sm-in"), { once: true });
        }
      },
      { rootMargin: "0px 0px -3% 0px", threshold: 0.01 },
    );
    let order = 0;
    function prep(root: ParentNode) {
      if (motionOff()) return;
      const found = root.querySelectorAll<HTMLElement>(CARD);
      for (const el of Array.from(found)) {
        if (el.dataset.sm || el.classList.contains("reveal") || el.closest("[data-sm-skip],[role=dialog]")) continue;
        el.dataset.sm = "1";
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) continue; // už je vidět, nic se nehýbe
        if (r.top < 0) continue;
        el.style.setProperty("--sm-d", `${(order++ % 4) * 60}ms`);
        el.classList.add("sm-pre");
        io.observe(el);
      }
    }
    prep(document);
    // Obsah, který se dotáhne později (data z API, přepnutí záložky).
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = n as HTMLElement;
          if (el.matches(CARD) || el.querySelector(CARD)) prep(el.parentElement ?? document);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
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
