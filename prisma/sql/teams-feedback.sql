-- Týmy 3: komentář učitele k výsledku žáka a archivace zadání.
-- Spusť v SQL editoru databáze (po teams-update.sql). Je idempotentní.
-- Nové tabulky záměrně nemění stávající, takže aplikace běží i před spuštěním skriptu
-- (komentáře a archiv se prostě nezobrazí).

CREATE TABLE IF NOT EXISTS "AssignmentFeedback" (
  "id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "AssignmentFeedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AssignmentFeedback_unique" UNIQUE ("assignmentId", "userId"));

CREATE TABLE IF NOT EXISTS "AssignmentArchive" (
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssignmentArchive_pkey" PRIMARY KEY ("assignmentId"));
