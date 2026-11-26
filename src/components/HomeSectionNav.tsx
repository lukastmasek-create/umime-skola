"use client";

import { useEffect, useRef, useState } from "react";

// Rychlá navigace úvodní stránky: pixelové „tlačítka levelů“ přilepená pod hlavičkou.
// Odsazení shora bere z výšky hlavičky (ta se při rolování zmenšuje), aktivní sekci hlídá IntersectionObserver.
export function HomeSectionNav({ label, items }: { label: string; items: { id: string; label: string }[] }) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!nav || !header) return;
    const sync = () => nav.style.setProperty("--hn-top", `${header.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const seen = new Map<string, boolean>();
    // Na konci stránky poslední (nízká) sekce nemusí dojet do středu obrazovky, tak se zvýrazní ručně.
    const atEnd = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    const pick = () => {
      if (atEnd()) return setActive(items[items.length - 1].id);
      const first = items.find((it) => seen.get(it.id));
      setActive(first ? first.id : null);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        pick();
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    // pick() je levné a stejná hodnota nevyvolá nové vykreslení; hlídá hlavně příjezd a odjezd z konce stránky.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        pick();
      });
    };
    els.forEach((el) => io.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  // Aktivní tlačítko se na úzkém displeji posune do viditelné části pásu.
  useEffect(() => {
    if (!active) return;
    const link = navRef.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    const list = link?.parentElement?.parentElement;
    if (!link || !list) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off" ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav ref={navRef} className="home-nav" aria-label={label}>
      <ul className="home-nav-list">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="home-nav-link" aria-current={active === it.id ? "location" : undefined}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
