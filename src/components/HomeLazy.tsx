"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";

// Těžké sekce úvodní stránky (plátno, obrázky, animace) se stáhnou a spustí až kousek před tím,
// než se objeví na obrazovce. Do té doby je v HTML jen místo držák s odkazy a texty pro vyhledávače.
// Skrytý prvek (display: none, např. dekorace na telefonu) se nenačte vůbec.
function InView({
  fallback,
  children,
  className,
  style,
}: {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    if (!("IntersectionObserver" in window)) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={ref} className={className} style={style} aria-busy={!show}>
      {show ? children : fallback}
    </div>
  );
}

const SubjectGlobe = dynamic(() => import("./SubjectGlobe").then((m) => m.SubjectGlobe), { ssr: false });
const TownLife = dynamic(() => import("./TownLife").then((m) => m.TownLife), { ssr: false });
const PlanetLive = dynamic(() => import("./PlanetLive").then((m) => m.PlanetLive), { ssr: false });

type GlobeSubject = { slug: string; value: string; label: string; color: string };

export function LazySubjectGlobe({ locale, subjects }: { locale: Locale; subjects: GlobeSubject[] }) {
  return (
    <InView
      style={{ minHeight: "28rem" }}
      fallback={
        <ul className="sr-only">
          {subjects.map((s) => (
            <li key={s.slug}>
              <Link href={`/${locale}/kurzy/zakladni?predmet=${s.slug}#vyber-kurzu`}>{s.label}</Link>
            </li>
          ))}
        </ul>
      }
    >
      <SubjectGlobe locale={locale} subjects={subjects} />
    </InView>
  );
}

export function LazyTownLife({ steps, locale }: { steps: { title: string; text: string }[]; locale: string }) {
  return (
    <InView
      style={{ minHeight: "26rem" }}
      fallback={
        <ol className="sr-only">
          {steps.map((s) => (
            <li key={s.title}>
              {s.title}: {s.text}
            </li>
          ))}
        </ol>
      }
    >
      <TownLife steps={steps} locale={locale} />
    </InView>
  );
}

// Dekorativní planeta: obal nese umístění a viditelnost (třídy), planeta sama jen kreslí.
export function LazyPlanet({
  className,
  size,
  dir,
  still,
  spinSeconds,
  glow,
}: {
  className: string;
  size: number;
  dir?: string;
  still?: string;
  spinSeconds?: number;
  glow?: string;
}) {
  return (
    <InView className={className} style={{ width: size, height: size }}>
      <PlanetLive size={size} dir={dir} still={still} spinSeconds={spinSeconds} glow={glow} />
    </InView>
  );
}
