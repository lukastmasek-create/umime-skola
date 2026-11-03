import type { NextConfig } from "next";

// Bezpečnostní hlavičky pro všechny stránky a API. Stránka se nikde nevkládá do iframe
// a nepoužívá kameru, mikrofon ani polohu, proto lze vše zakázat.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Omezuje vložení do cizích stránek, <base> a přesměrování formulářů. Plné script-src se
  // zatím nenastavuje: stránka používá inline skripty (theme-init, Next), které by se zablokovaly.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
