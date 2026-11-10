-- Hodnocení obchodu. Spusť jednou v SQL editoru databáze.
CREATE TABLE IF NOT EXISTS "ShopReview" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stars" INTEGER NOT NULL,
  "text" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShopReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ShopReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ShopReview_userId_key" ON "ShopReview"("userId");
