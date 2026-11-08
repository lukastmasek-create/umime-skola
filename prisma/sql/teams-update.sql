-- Týmy a třídy 2: skupiny, schvalování připojení, zadání vybraným žákům, chyby po otázkách.
-- Spusť v SQL editoru databáze (po teams.sql). Je idempotentní.

-- Režim připojení kódem: OPEN (hned), APPROVAL (čeká na schválení učitelem), CLOSED (nikdo nový).
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "joinMode" TEXT NOT NULL DEFAULT 'OPEN';

CREATE TABLE IF NOT EXISTS "TeamGroup" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "teamId" TEXT NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  CONSTRAINT "TeamGroup_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "TeamGroup_teamId_idx" ON "TeamGroup"("teamId");

-- Stav členství: ACTIVE nebo PENDING (žádost o připojení). Dosavadní členové jsou ACTIVE.
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "groupId" TEXT REFERENCES "TeamGroup"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "TeamMember_groupId_idx" ON "TeamMember"("groupId");

-- Zadání jen vybraným skupinám / žákům. Bez řádků je zadání pro celou třídu.
CREATE TABLE IF NOT EXISTS "AssignmentTarget" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "groupId" TEXT REFERENCES "TeamGroup"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "AssignmentTarget_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AssignmentTarget_one" CHECK (("groupId" IS NULL) <> ("userId" IS NULL)));
CREATE INDEX IF NOT EXISTS "AssignmentTarget_assignmentId_idx" ON "AssignmentTarget"("assignmentId");

-- Indexy otázek, na které žák v pokusu odpověděl špatně (NULL = starší pokus, nevíme).
ALTER TABLE "AssignmentAttempt" ADD COLUMN IF NOT EXISTS "wrong" JSONB;
