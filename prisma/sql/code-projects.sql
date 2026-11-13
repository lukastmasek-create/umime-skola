-- Projekty z Čistého listu (soubory projektu jako JSON). Spusť jednou v SQL editoru databáze.
CREATE TABLE IF NOT EXISTS "CodeProject" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "files" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "CodeProject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CodeProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CodeProject_userId_updatedAt_idx" ON "CodeProject" ("userId", "updatedAt");
ALTER TABLE "CodeProject" ENABLE ROW LEVEL SECURITY;
