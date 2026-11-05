import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ContactInput } from "@/lib/contact";
import { buildSupportMail } from "@/lib/contact-mail-format";

// Odeslání e-mailu týmu podpory přes Cloudflare Email Service (binding `EMAIL`, Email Sending).
// Nastavení ve wrangler.jsonc:
//   send_email: [{ name: "EMAIL" }]   odesílání z workeru (vyžaduje Workers Paid a ověřenou doménu)
//   CONTACT_EMAIL_TO                  kam zprávy přijdou
//   CONTACT_EMAIL_FROM                odesílatel na doméně nakonfigurované v Email Service
// Pokud binding nebo adresy chybí (lokální vývoj), e-mail se přeskočí a zaloguje se varování.
// Formulář tím neselže.

type SendEmailBinding = {
  send(message: {
    from: { email: string; name: string };
    to: string;
    subject: string;
    text: string;
    replyTo: string;
  }): Promise<{ messageId: string }>;
};

type MailEnv = { EMAIL?: SendEmailBinding; CONTACT_EMAIL_TO?: string; CONTACT_EMAIL_FROM?: string };

const SENDER_NAME = "Učíme se hrou";

function mailEnv(): MailEnv {
  try {
    // Bindingy a proměnné z wrangler.jsonc jsou dostupné přes Cloudflare kontext.
    return getCloudflareContext({ async: false }).env as MailEnv;
  } catch {
    // Mimo požadavek na Workers kontext (lokální vývoj bez wrangleru).
    return {};
  }
}

async function sendSupportMail(input: ContactInput, id: string, createdAt: Date): Promise<void> {
  const { EMAIL, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM } = mailEnv();
  if (!EMAIL || !CONTACT_EMAIL_TO || !CONTACT_EMAIL_FROM) {
    console.warn("Kontakt: e-mail podpory není nastavený (binding EMAIL, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM), přeskakuji.");
    return;
  }

  const mail = buildSupportMail(input, id, createdAt);
  try {
    await EMAIL.send({
      from: { email: CONTACT_EMAIL_FROM, name: SENDER_NAME },
      to: CONTACT_EMAIL_TO,
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
    });
  } catch (error) {
    console.error("Kontakt: odeslání e-mailu přes Email Service selhalo", error);
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
