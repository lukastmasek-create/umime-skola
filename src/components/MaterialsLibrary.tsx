"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { LibraryHandle } from "@/lib/town3d/library3d";

// Rozcestník materiálů jako 3D knihovna; cedule nad knihovnami jsou HTML odkazy (fungují i bez myši).
export function MaterialsLibrary({ locale, subjects }: { locale: string; subjects: { slug: string; color: string; emoji: string; label: string; count: number }[] }) {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let handle: LibraryHandle | null = null;
    let alive = true;
    void import("@/lib/town3d/library3d").then(({ createLibrary3D }) => {
      if (!alive) return;
      handle = createLibrary3D(el, subjects, (slug) => router.push(`/${locale}/materialy/${slug}`));
      if (!handle) {
        el.parentElement?.classList.add("hidden");
        return;
      }
      const els = new Map<string, HTMLElement>();
      layer.current?.querySelectorAll<HTMLElement>("[data-slug]").forEach((a) => els.set(a.dataset.slug!, a));
      handle.labels((items) => {
        for (const it of items) {
          const a = els.get(it.slug);
          if (!a) continue;
          a.style.display = it.visible ? "" : "none";
          a.style.transform = `translate(${it.x}px, ${it.y}px) translate(-50%, -100%)`;
        }
      });
    });
    return () => {
      alive = false;
      handle?.dispose();
    };
  }, [locale, router, subjects]);
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]" style={{ aspectRatio: "16 / 9", minHeight: 420 }}>
      <div ref={box} className="absolute inset-0 bg-[#2a1e18]" />
      <div ref={layer} className="pointer-events-none absolute inset-0">
        {subjects.map((s) => (
          <a key={s.slug} data-slug={s.slug} href={`/${locale}/materialy/${s.slug}`} className="library-sign" style={{ display: "none", borderColor: s.color }}>
            <span aria-hidden>{s.emoji}</span> {s.label}
            <span className="block text-[10px] font-semibold opacity-70">{s.count}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
