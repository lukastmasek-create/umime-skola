// Voucherové kódy do obchodu. Každý kód lze uplatnit jednou na účet; uplatnění se
// uloží jako odemčení (tabulka Unlock) s klíčem "voucher:<KÓD>". Nové kódy stačí dopsat sem.
export type Voucher = { code: string; points: number; label: string };

export const VOUCHERS: Voucher[] = [
  { code: "UMIME50", points: 50, label: "Uvítací voucher" },
  { code: "SKOLA100", points: 100, label: "Školní voucher" },
  { code: "HVEZDA200", points: 200, label: "Hvězdný voucher" },
];

export function normalizeCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32) : "";
}

export function findVoucher(raw: unknown): Voucher | undefined {
  const code = normalizeCode(raw);
  return code ? VOUCHERS.find((v) => v.code === code) : undefined;
}

export const voucherKey = (v: Voucher) => `voucher:${v.code}`;
