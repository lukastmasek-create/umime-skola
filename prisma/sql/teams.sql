-- Týmy pro učitele a žáky. Spusť v SQL editoru databáze (stejně jako social-update.sql).
CREATE TABLE IF NOT EXISTS "Team" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "code" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "Team_code_key" ON "Team"("code");

CREATE TABLE IF NOT EXISTS "TeamMember" (
  "id" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'STUDENT',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "teamId" TEXT NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_teamId_userId_key" ON "TeamMember"("teamId","userId");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");

CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '',
  "questions" JSONB NOT NULL, "maxAttempts" INTEGER, "passPercent" INTEGER NOT NULL DEFAULT 50,
  "dueAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "teamId" TEXT NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "Assignment_teamId_createdAt_idx" ON "Assignment"("teamId","createdAt");

CREATE TABLE IF NOT EXISTS "AssignmentView" (
  "id" TEXT NOT NULL, "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "AssignmentView_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "AssignmentView_assignmentId_userId_key" ON "AssignmentView"("assignmentId","userId");

CREATE TABLE IF NOT EXISTS "AssignmentAttempt" (
  "id" TEXT NOT NULL, "percent" INTEGER NOT NULL, "correct" INTEGER NOT NULL, "total" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "AssignmentAttempt_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "AssignmentAttempt_assignmentId_userId_idx" ON "AssignmentAttempt"("assignmentId","userId");

CREATE TABLE IF NOT EXISTS "TeamMessage" (
  "id" TEXT NOT NULL, "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "teamId" TEXT NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "assignmentId" TEXT REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "TeamMessage_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "TeamMessage_teamId_assignmentId_createdAt_idx" ON "TeamMessage"("teamId","assignmentId","createdAt");
