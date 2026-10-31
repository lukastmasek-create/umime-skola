-- Kontaktní formulář (/kontakt). Spusť jednou v SQL editoru databáze (stejně jako schema-update.sql).
CREATE TABLE IF NOT EXISTS "ContactMessage" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "details" JSONB NOT NULL DEFAULT '{}',
  "locale" TEXT NOT NULL DEFAULT 'cs',
  "status" TEXT NOT NULL DEFAULT 'new',
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ContactMessage_email_createdAt_idx" ON "ContactMessage"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "ContactMessage_userId_createdAt_idx" ON "ContactMessage"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
