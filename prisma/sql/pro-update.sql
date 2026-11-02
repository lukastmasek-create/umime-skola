-- PRO předplatné: tabulka Subscription a vazby z User a School.
-- Idempotentní: bezpečné spustit i když část už v databázi je.

-- Enum tarifů
DO $$ BEGIN
  CREATE TYPE "SubscriptionTier" AS ENUM ('INDIVIDUAL', 'FAMILY', 'SCHOOL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Předplatné
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "tier" "SubscriptionTier" NOT NULL,
  "ownerId" TEXT,
  "schoolId" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  -- INDIVIDUAL a FAMILY musí mít plátce, SCHOOL musí mít školu
  CONSTRAINT "Subscription_tier_payer_check" CHECK (
    ("tier" = 'SCHOOL' AND "schoolId" IS NOT NULL)
    OR ("tier" IN ('INDIVIDUAL', 'FAMILY') AND "ownerId" IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS "Subscription_ownerId_idx" ON "Subscription"("ownerId");
CREATE INDEX IF NOT EXISTS "Subscription_schoolId_idx" ON "Subscription"("schoolId");

-- Vazba člena na předplatné
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT;
CREATE INDEX IF NOT EXISTS "User_subscriptionId_idx" ON "User"("subscriptionId");

-- Cizí klíče (přidané podmíněně, aby se skript dal spustit znovu)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_ownerId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_schoolId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_subscriptionId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- RLS zapnuté na nové tabulce (aplikace se připojuje jako role postgres)
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
