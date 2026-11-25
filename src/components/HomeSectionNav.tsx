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
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const first = items.find((it) => seen.get(it.id));
        setActive(first ? first.id : null);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  // Aktivní tlačítko se na úzkém displeji posune do viditelné části pásu.
  useEffect(() => {
    if (!active) return;
    const link = navRef.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    const list = link?.parentElement?.parentElement;
    if (!link || !list) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left, behavior: "smooth" });
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
