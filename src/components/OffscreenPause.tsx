"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Úspora výkonu: bloky obsahu (sekce stránky uvnitř <main>), které nejsou na obrazovce ani s rezervou,
// dostanou třídu „anim-idle“ a jejich animace se pozastaví (CSS v globals.css). Prohlížeč pak
// nepřepočítává styly a nepřekresluje pixely pro desítky nekonečných animací mimo obrazovku.
// Jakmile se blok přiblíží, animace běží dál tam, kde byla.

export function OffscreenPause() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Stránky mají obvykle jeden obalovací prvek (např. div.space-page), takže se bere jeho obsah.
    const root = document.querySelector("main");
    let top = root ? Array.from(root.children) : [];
    if (top.length === 1) top = Array.from(top[0].children);
    const blocks = top.filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName !== "SCRIPT");
    if (!blocks.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("anim-idle", !e.isIntersecting);
      },
      { rootMargin: "300px 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      blocks.forEach((b) => b.classList.remove("anim-idle"));
    };
  }, [pathname]);

  return null;
}
