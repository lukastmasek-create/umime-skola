"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { tr8, type Locale } from "@/i18n/config";
import { getFooterLinks } from "@/i18n/legal";
import styles from "./CookieNotice.module.css";

const STORAGE_KEY = "ush:cookie-notice:v1";
const REMEMBER_MS = 180 * 24 * 60 * 60 * 1000;

const TEXT = {
  badge: tr8("Tvoje soukromí je v bezpečí", "Your privacy is safe", "Deine Privatsphäre ist sicher", "Твоя приватность защищена", "Твою приватність захищено", "プライバシーを守ります", "Tu privacidad está a salvo", "Ta vie privée est protégée"),
  title: tr8("Malé cookies.", "Small cookies.", "Kleine Cookies.", "Маленькие cookie.", "Маленькі cookie.", "小さなクッキー。", "Pequeñas cookies.", "De petits cookies."),
  highlight: tr8("Velká dobrodružství.", "Big adventures.", "Große Abenteuer.", "Большие приключения.", "Великі пригоди.", "大きな冒険。", "Grandes aventuras.", "De grandes aventures."),
  description: tr8(
    "Používáme jen nezbytné cookies pro přihlášení, jazyk a ochranu proti botům. Nastavení a herní postup ukládáme do tvého prohlížeče.",
    "We only use essential cookies for sign-in, language and bot protection. Settings and game progress are saved in your browser.",
    "Wir verwenden nur notwendige Cookies für Anmeldung, Sprache und Bot-Schutz. Einstellungen und Spielfortschritt speichern wir in deinem Browser.",
    "Мы используем только необходимые cookie для входа, языка и защиты от ботов. Настройки и игровой прогресс сохраняются в твоём браузере.",
    "Ми використовуємо лише необхідні cookie для входу, мови та захисту від ботів. Налаштування й ігровий прогрес зберігаються у твоєму браузері.",
    "ログイン、言語設定、ボット対策に必要なクッキーのみを使います。設定やゲームの進行状況はブラウザーに保存します。",
    "Solo usamos cookies necesarias para iniciar sesión, el idioma y la protección contra bots. Los ajustes y el progreso se guardan en tu navegador.",
    "Nous utilisons uniquement les cookies nécessaires à la connexion, à la langue et à la protection contre les robots. Les réglages et la progression sont enregistrés dans ton navigateur.",
  ),
  essential: tr8("Jen nezbytné cookies", "Essential cookies only", "Nur notwendige Cookies", "Только необходимые cookie", "Лише необхідні cookie", "必要なクッキーのみ", "Solo cookies necesarias", "Cookies nécessaires uniquement"),
  noAds: tr8("Bez reklamních cookies", "No advertising cookies", "Keine Werbe-Cookies", "Без рекламных cookie", "Без рекламних cookie", "広告クッキーなし", "Sin cookies publicitarias", "Sans cookies publicitaires"),
  analytics: tr8("Návštěvnost měříme souhrnně přes Cloudflare, bez cookies a sledování napříč weby.", "Cloudflare measures aggregate traffic without cookies or cross-site tracking.", "Cloudflare misst Besuche zusammengefasst, ohne Cookies oder websiteübergreifendes Tracking.", "Cloudflare измеряет общую посещаемость без cookie и отслеживания между сайтами.", "Cloudflare вимірює загальну відвідуваність без cookie та відстеження між сайтами.", "Cloudflareでクッキーやサイト間追跡を使わず、アクセス数を集計します。", "Cloudflare mide visitas agregadas sin cookies ni seguimiento entre sitios.", "Cloudflare mesure les visites agrégées sans cookies ni suivi entre sites."),
  continue: tr8("Rozumím, jdeme hrát", "Got it, let's play", "Verstanden, los geht’s", "Понятно, начнём играть", "Зрозуміло, нумо грати", "わかった、遊ぼう", "Entendido, a jugar", "Compris, on joue"),
  reject: tr8("Odmítnout", "Reject", "Ablehnen", "Отклонить", "Відхилити", "拒否する", "Rechazar", "Refuser"),
  reopen: tr8("Informace o cookies", "Cookie information", "Cookie-Informationen", "Информация о cookie", "Інформація про cookie", "クッキーについて", "Información de cookies", "Informations sur les cookies"),
  close: tr8("Zavřít", "Close", "Schließen", "Закрыть", "Закрити", "閉じる", "Cerrar", "Fermer"),
};

// Both actions keep only essential cookies; there are no optional cookies to enable.
export function CookieNotice({ locale }: { locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let acknowledged = false;
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      acknowledged = saved > Date.now() - REMEMBER_MS && saved <= Date.now();
    } catch {
      // The notice remains usable when browser storage is blocked.
    }
    const element = dialog.current;
    if (!acknowledged && element && !element.open) element.showModal();
    return () => element?.close();
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Dismiss for this page visit even if persistence is unavailable.
    }
    dialog.current?.close();
  }

  return (
    <>
      <button type="button" className="sketch-chip" onClick={() => dialog.current?.showModal()}>
        {TEXT.reopen[locale]}
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="cookie-notice-title"
        aria-describedby="cookie-notice-description"
        onCancel={(event) => { event.preventDefault(); dismiss(); }}
      >
        <div className={styles.panel}>
          <button type="button" className={styles.close} aria-label={TEXT.close[locale]} onClick={dismiss}>×</button>
          <span className={styles.badge}><span aria-hidden="true" />{TEXT.badge[locale]}</span>
          <div className={styles.art} aria-hidden="true">
            <svg viewBox="0 0 32 32" width="88" height="88" shapeRendering="crispEdges">
              <path fill="#090f2e" d="M10 2h12v4h4v4h4v12h-4v4h-4v4H10v-4H6v-4H2V10h4V6h4z" />
              <path fill="#a55d32" d="M10 5h12v4h4v13h-4v4H10v-4H6V10h4z" />
              <path fill="#f7bb62" d="M10 5h12v4h4v10h-4v4H10v-4H6v-9h4z" />
              <path fill="#ffe3a2" d="M10 6h9v3h-9zM7 10h3v6H7z" />
              <path fill="#6e3a32" d="M12 10h4v4h-4zM20 13h3v3h-3zM10 18h3v3h-3zM17 20h4v4h-4z" />
              <path fill="#80ffe0" d="M27 2h2v2h2v2h-2v2h-2V6h-2V4h2zM2 25h2v2h2v2H4v2H2v-2H0v-2h2z" />
            </svg>
          </div>
          <h2 id="cookie-notice-title" className={styles.title}>
            {TEXT.title[locale]}<span>{TEXT.highlight[locale]}</span>
          </h2>
          <p id="cookie-notice-description" className={styles.description}>{TEXT.description[locale]}</p>
          <div className={styles.features}>
            <span><b aria-hidden="true">✓</b> {TEXT.essential[locale]}</span>
            <span><b aria-hidden="true">✓</b> {TEXT.noAds[locale]}</span>
          </div>
          <p className={styles.analytics}>{TEXT.analytics[locale]}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={dismiss} autoFocus>{TEXT.continue[locale]} <span aria-hidden="true">→</span></button>
            <button type="button" className={styles.primary} style={{ background: "#18264a", boxShadow: "0 5px 0 #090f27" }} onClick={dismiss} title={TEXT.essential[locale]}>{TEXT.reject[locale]}</button>
            <Link href={`/${locale}/zasady-cookies`} className={styles.details} onClick={() => dialog.current?.close()}>{getFooterLinks(locale).cookies}</Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
