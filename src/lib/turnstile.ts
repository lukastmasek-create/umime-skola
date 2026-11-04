import { getCloudflareContext } from "@opennextjs/cloudflare";
import { clientIp } from "@/lib/rate-limit";

// Ověření Cloudflare Turnstile na serveru. Secret se čte z Workers bindingů, jinak z process.env.
// Pokud secret není nastavený (lokální vývoj), ověření se přeskočí a zaloguje se varování.
function turnstileSecret(): string | undefined {
  try {
    // Na Workers nemusí být secrety z dashboardu v process.env, proto se čtou z bindingů.
    const { env } = getCloudflareContext({ async: false });
    const secret = (env as { TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY;
    if (secret) return secret;
  } catch {
    // Mimo požadavek na Workers kontext není k dispozici.
  }
  return process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(request: Request, token: unknown): Promise<boolean> {
  const secret = turnstileSecret();
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY není nastavený, ověření robota se přeskakuje.");
    return true;
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;

  try {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    const ip = clientIp(request);
    if (ip !== "unknown") form.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return data?.success === true;
  } catch (error) {
    console.error("Turnstile ověření selhalo:", error);
    return false;
  }
}
