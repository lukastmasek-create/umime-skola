import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ContactInput } from "@/lib/contact";
import { buildSupportMail } from "@/lib/contact-mail-format";

// Odeslání e-mailu týmu podpory přes Resend (HTTP API, bez závislostí).
// Potřebné nastavení (secrety na Cloudflare nebo proměnné prostředí):
//   RESEND_API_KEY     klíč z resend.com
//   CONTACT_EMAIL_TO   kam zprávy přijdou, např. podpora@ucimesehrou.org
//   CONTACT_EMAIL_FROM odesílatel na ověřené doméně, např. "Učíme se hrou <kontakt@ucimesehrou.org>"
// Pokud něco chybí (lokální vývoj), e-mail se přeskočí a zaloguje se varování. Formulář tím neselže.

type MailEnv = { RESEND_API_KEY?: string; CONTACT_EMAIL_TO?: string; CONTACT_EMAIL_FROM?: string };

function mailEnv(): MailEnv {
  let env: MailEnv = {};
  try {
    // Na Workers nemusí být secrety z dashboardu v process.env, proto se čtou z bindingů.
    env = getCloudflareContext({ async: false }).env as MailEnv;
  } catch {
    // Mimo požadavek na Workers kontext není k dispozici.
  }
  return {
    RESEND_API_KEY: env.RESEND_API_KEY || process.env.RESEND_API_KEY,
    CONTACT_EMAIL_TO: env.CONTACT_EMAIL_TO || process.env.CONTACT_EMAIL_TO,
    CONTACT_EMAIL_FROM: env.CONTACT_EMAIL_FROM || process.env.CONTACT_EMAIL_FROM,
  };
}

async function sendSupportMail(input: ContactInput, id: string, createdAt: Date): Promise<void> {
  const { RESEND_API_KEY, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM } = mailEnv();
  if (!RESEND_API_KEY || !CONTACT_EMAIL_TO || !CONTACT_EMAIL_FROM) {
    console.warn("Kontakt: e-mail podpory není nastavený (RESEND_API_KEY, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM), přeskakuji.");
    return;
  }

  const mail = buildSupportMail(input, id, createdAt);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_EMAIL_FROM,
      to: [CONTACT_EMAIL_TO],
      subject: mail.subject,
      text: mail.text,
      reply_to: mail.replyTo,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Kontakt: odeslání e-mailu selhalo (${res.status})`, detail.slice(0, 300));
  }
}

/**
 * Pošle e-mail podpory na pozadí, takže odpověď uživateli nečeká na poštovní server.
 * Chyba se jen zaloguje; uložená zpráva v databázi zůstává v každém případě.
 */
export async function notifySupportInBackground(input: ContactInput, id: string, createdAt: Date): Promise<void> {
  const job = sendSupportMail(input, id, createdAt).catch((error) => {
    console.error("Kontakt: e-mail podpory se nepodařilo připravit", error);
  });
  try {
    getCloudflareContext({ async: false }).ctx.waitUntil(job);
  } catch {
    // Bez Workers kontextu (lokální vývoj) počkáme na dokončení přímo.
    await job;
  }
}
