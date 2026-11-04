// Veřejný site key pro Cloudflare Turnstile (není tajný, může být v kódu).
// Secret key patří jen do prostředí serveru (TURNSTILE_SECRET_KEY), viz src/lib/turnstile.ts.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFz0ptQAOBNPk8gB";
