import { getCloudflareContext } from "@opennextjs/cloudflare";

// Obecné odeslání e-mailu uživateli přes Cloudflare Email Service (binding `EMAIL`).
// Vrací true jen při skutečném odeslání; bez bindingu nebo adresy odesílatele vrací false.
type SendEmailBinding = {
  send(message: { from: { email: string; name: string }; to: string; subject: string; text: string }): Promise<{ messageId: string }>;
};
type MailEnv = { EMAIL?: SendEmailBinding; CONTACT_EMAIL_FROM?: string };

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  let env: MailEnv = {};
  try {
    env = getCloudflareContext({ async: false }).env as MailEnv;
  } catch {
    // mimo Workers kontext (lokální vývoj)
  }
  if (!env.EMAIL || !env.CONTACT_EMAIL_FROM) {
    console.warn("E-mail: chybí binding EMAIL nebo CONTACT_EMAIL_FROM, přeskakuji.");
    return false;
  }
  try {
    await env.EMAIL.send({ from: { email: env.CONTACT_EMAIL_FROM, name: "Učíme se hrou" }, to, subject, text });
    return true;
  } catch (error) {
    console.error("E-mail: odeslání selhalo", error);
    return false;
  }
}
