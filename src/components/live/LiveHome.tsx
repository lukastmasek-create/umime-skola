"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";
import { ArenaBackdrop } from "@/components/arena/ArenaBackdrop";
import { getLiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import { MODES } from "@/lib/live/logic";
import { MODE_ACCENT } from "./shared";
import styles from "./LiveHome.module.css";

export function LiveHome({ locale }: { locale: Locale }) {
  const t = getLiveText(locale);
  const router = useRouter();
  const [pin, setPin] = useState("");
  const roomPath = `/${locale}/hrat-spolecne`;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pin.length === 6) router.push(`${roomPath}/${pin}`);
  }

  return (
    <div className={`arena-stage mx-auto max-w-6xl ${styles.home}`}>
      <ArenaBackdrop variant="neutral" />
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <div className={styles.actions}>
        <form onSubmit={submit} aria-labelledby="join-title" className={`arena-panel ${styles.join}`}>
          <div>
            <h2 id="join-title">{t.join.title}</h2>
            <p id="join-hint">{t.join.hint}</p>
          </div>
          <div className={styles.field}>
            <label htmlFor="live-pin">{t.join.pin}</label>
            <input
              id="live-pin"
              name="pin"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="go"
              aria-describedby="join-hint"
              placeholder="000000"
            />
          </div>
          <button type="submit" disabled={pin.length !== 6} className="arena-btn">
            {t.join.button} <span aria-hidden>→</span>
          </button>
        </form>

        <section aria-labelledby="host-title" className={`arena-panel ${styles.host}`}>
          <div>
            <h2 id="host-title">{t.host.title}</h2>
            <p>{t.host.hint}</p>
          </div>
          <div className={styles.hostActions}>
            <Link href={`${roomPath}/nova`} className="arena-btn arena-btn-ghost">
              {t.host.button}
            </Link>
            <Link href={`${roomPath}/sady`} className={styles.setsLink}>
              {t.create.manageSets} <span aria-hidden>↗</span>
            </Link>
          </div>
        </section>
      </div>

      <section aria-labelledby="mode-title" className={styles.modes}>
        <h2 id="mode-title">{t.create.mode}</h2>
        <ul>
          {MODES.map((mode) => (
            <li key={mode} style={{ "--mode": MODE_ACCENT[mode] } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/arena/emblem-${mode.toLowerCase()}.webp`} alt="" width={64} height={64} loading="lazy" decoding="async" />
              <div>
                <h3>{t.create.modes[mode].name}</h3>
                <p>{t.create.modes[mode].description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
