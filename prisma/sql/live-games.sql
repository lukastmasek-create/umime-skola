-- Živé třídní hry: spusť jednou v databázi (Supabase SQL editor) před nasazením.
-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveRoom" (
    "id" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "hostSecret" TEXT NOT NULL,
    "hostUserId" TEXT,
    "title" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOBBY',
    "questions" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "current" INTEGER NOT NULL DEFAULT -1,
    "questionStartedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivePlayer" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT,
    "avatar" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "answered" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "pendingChest" JSONB,
    "rewardXp" INTEGER,
    "rewardPoints" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LivePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveAnswer" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "qIndex" INTEGER NOT NULL,
    "seq" INTEGER NOT NULL,
    "choice" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "ms" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionSet_ownerId_updatedAt_idx" ON "QuestionSet"("ownerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LiveRoom_pin_key" ON "LiveRoom"("pin");

-- CreateIndex
CREATE INDEX "LiveRoom_createdAt_idx" ON "LiveRoom"("createdAt");

-- CreateIndex
CREATE INDEX "LivePlayer_roomId_score_idx" ON "LivePlayer"("roomId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "LivePlayer_roomId_name_key" ON "LivePlayer"("roomId", "name");

-- CreateIndex
CREATE INDEX "LiveAnswer_roomId_qIndex_idx" ON "LiveAnswer"("roomId", "qIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LiveAnswer_playerId_seq_key" ON "LiveAnswer"("playerId", "seq");

-- AddForeignKey
ALTER TABLE "QuestionSet" ADD CONSTRAINT "QuestionSet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveRoom" ADD CONSTRAINT "LiveRoom_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivePlayer" ADD CONSTRAINT "LivePlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivePlayer" ADD CONSTRAINT "LivePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveAnswer" ADD CONSTRAINT "LiveAnswer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveAnswer" ADD CONSTRAINT "LiveAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "LivePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

