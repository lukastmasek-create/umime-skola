-- Doplní tabulky a sloupce pro školy, XP, avatary, tituly a únikovky.
-- Idempotentní: bezpečné spustit i když část už v databázi je.

-- Sloupce uživatele
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "title" TEXT;

-- Školy
CREATE TABLE IF NOT EXISTS "School" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "School_name_city_key" ON "School"("name", "city");

-- XP události
CREATE TABLE IF NOT EXISTS "XpEvent" (
  "id" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "XpEvent_userId_createdAt_idx" ON "XpEvent"("userId", "createdAt");

-- Odemčené odměny
CREATE TABLE IF NOT EXISTS "Unlock" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "Unlock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Unlock_userId_key_key" ON "Unlock"("userId", "key");

-- Dokončené únikovky
CREATE TABLE IF NOT EXISTS "EscapeRun" (
  "id" TEXT NOT NULL,
  "room" TEXT NOT NULL,
  "seconds" INTEGER NOT NULL,
  "stars" INTEGER NOT NULL,
  "mistakes" INTEGER NOT NULL,
  "hints" INTEGER NOT NULL,
  "relaxed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "EscapeRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EscapeRun_userId_room_idx" ON "EscapeRun"("userId", "room");
CREATE INDEX IF NOT EXISTS "EscapeRun_room_seconds_idx" ON "EscapeRun"("room", "seconds");

-- Cizí klíče (jen pokud ještě neexistují)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_schoolId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'XpEvent_userId_fkey') THEN
    ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Unlock_userId_fkey') THEN
    ALTER TABLE "Unlock" ADD CONSTRAINT "Unlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EscapeRun_userId_fkey') THEN
    ALTER TABLE "EscapeRun" ADD CONSTRAINT "EscapeRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- RLS zapnuté na všech nových tabulkách (aplikace se připojuje jako role postgres)
ALTER TABLE "School" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "XpEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Unlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EscapeRun" ENABLE ROW LEVEL SECURITY;
