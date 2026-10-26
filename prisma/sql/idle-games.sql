-- Tabulka pro uložený postup ve stálých hrách (Mazlíčci a další).
-- Idempotentní: bezpečné spustit i opakovaně.

CREATE TABLE IF NOT EXISTS "IdleState" (
  "id" TEXT NOT NULL,
  "game" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "IdleState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IdleState_userId_game_key" ON "IdleState"("userId", "game");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'IdleState_userId_fkey') THEN
    ALTER TABLE "IdleState" ADD CONSTRAINT "IdleState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "IdleState" ENABLE ROW LEVEL SECURITY;
