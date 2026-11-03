-- Limit počtu požadavků (přihlášení, registrace, kontakt, změna hesla a e-mailu). Spusť jednou v SQL editoru databáze.
CREATE TABLE IF NOT EXISTS "RateLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);
