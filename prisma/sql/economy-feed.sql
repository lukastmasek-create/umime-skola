-- Oznámení Ekonomiky (založení firmy, předehnání v žebříčku). Spusť jednou v SQL editoru databáze.
CREATE TABLE IF NOT EXISTS "EconomyEvent" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "kind" TEXT NOT NULL,
  "actorName" TEXT NOT NULL,
  "companyId" TEXT,
  "targetName" TEXT,
  "targetUserId" TEXT,
  "targetSeen" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "EconomyEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EconomyEvent_createdAt_idx" ON "EconomyEvent" ("createdAt");
CREATE INDEX IF NOT EXISTS "EconomyEvent_targetUserId_targetSeen_idx" ON "EconomyEvent" ("targetUserId", "targetSeen");
-- Hledání předehnaných hráčů podle rekordu (recordProgress v economy-server.ts) bez skenu celé tabulky.
CREATE INDEX IF NOT EXISTS "IdleState_ekonomika_best_idx" ON "IdleState" (((data->>'best')::float)) WHERE game = 'ekonomika';
