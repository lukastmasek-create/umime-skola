-- Limitované edice v obchodě (tabulka LimitedCopy). Opakované spuštění nic nezdvojí.
CREATE TABLE IF NOT EXISTS "LimitedCopy" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "serial" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "LimitedCopy_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LimitedCopy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LimitedCopy_itemId_serial_key" ON "LimitedCopy"("itemId", "serial");
CREATE UNIQUE INDEX IF NOT EXISTS "LimitedCopy_itemId_userId_key" ON "LimitedCopy"("itemId", "userId");
