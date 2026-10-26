import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DAILY_ACTIVITY_XP_CAP, MAX_XP_PER_CLAIM } from "@/lib/progression";
import {
  applyChest,
  chestOptions,
  cleanName,
  cleanQuestions,
  cleanSettings,
  effectiveStatus,
  generatePin,
  isChestOutcome,
  playerQuestionIndex,
  quizPoints,
  rankPlayers,
} from "./logic";
import type { AnswerResult, ChestOutcome, ChestResult, LiveMode, LiveQuestion, LiveSettings, LiveView, PlayerRow, StoredStatus } from "./types";

export class LiveError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}

const DAY = 24 * 60 * 60 * 1000;

const token = () => randomBytes(18).toString("base64url");

type RoomRow = Prisma.LiveRoomGetPayload<object>;

function roomParts(room: RoomRow) {
  return {
    mode: room.mode as LiveMode,
    status: room.status as StoredStatus,
    questions: cleanQuestions(room.questions),
    settings: cleanSettings(room.settings),
    startedAt: room.questionStartedAt ? room.questionStartedAt.getTime() : null,
    endsAt: room.endsAt ? room.endsAt.getTime() : null,
  };
}

async function loadRoom(pin: string): Promise<RoomRow> {
  if (!/^\d{6}$/.test(pin)) throw new LiveError("room-not-found", 404);
  const room = await prisma.liveRoom.findUnique({ where: { pin } });
  if (!room) throw new LiveError("room-not-found", 404);
  return room;
}

// --- Založení a připojení ---

export async function createRoom(input: {
  hostUserId: string | null;
  title: string;
  mode: LiveMode;
  questions: unknown;
  settings: unknown;
}): Promise<{ pin: string; hostSecret: string }> {
  const questions = cleanQuestions(input.questions);
  if (questions.length === 0) throw new LiveError("no-questions");
  const title = (input.title || "").trim().slice(0, 80) || "Živá hra";
  const hostSecret = token();
  // Staré místnosti uklidíme při založení nové, ať se tabulka nezanáší.
  await prisma.liveRoom.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - DAY) } } }).catch(() => undefined);
  for (let attempt = 0; attempt < 8; attempt++) {
    const pin = generatePin();
    try {
      await prisma.liveRoom.create({
        data: {
          pin,
          hostSecret,
          hostUserId: input.hostUserId,
          title,
          mode: input.mode,
          questions: questions as unknown as Prisma.InputJsonValue,
          settings: cleanSettings(input.settings) as unknown as Prisma.InputJsonValue,
        },
      });
      return { pin, hostSecret };
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new LiveError("pin-unavailable", 503);
}

export async function joinRoom(input: {
  pin: string;
  name: unknown;
  userId: string | null;
  avatar: string | null;
}): Promise<{ playerId: string; token: string; name: string }> {
  const room = await loadRoom(input.pin);
  if (room.status === "ENDED") throw new LiveError("room-ended", 409);
  const name = cleanName(input.name);
  if (!name) throw new LiveError("name-required");

  if (input.userId) {
    const existing = await prisma.livePlayer.findFirst({ where: { roomId: room.id, userId: input.userId } });
    if (existing) return { playerId: existing.id, token: existing.token, name: existing.name };
  }
  const t = token();
  try {
    const p = await prisma.livePlayer.create({
      data: { roomId: room.id, name, token: t, userId: input.userId, avatar: input.avatar },
    });
    return { playerId: p.id, token: t, name: p.name };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new LiveError("name-taken", 409);
    throw e;
  }
}

// --- Odměna za hru ---

/** Přihlášenému hráči po konci hry připíše XP a body (jednou; nárok se bere atomicky). */
async function rewardPlayer(player: { id: string; userId: string | null; rewardXp: number | null }, rank: number): Promise<{ xp: number; points: number } | null> {
  if (!player.userId) return null;
  if (player.rewardXp !== null) return null;
  const claimed = await prisma.livePlayer.updateMany({ where: { id: player.id, rewardXp: null }, data: { rewardXp: 0, rewardPoints: 0 } });
  if (claimed.count === 0) return null;
  const correct = await prisma.liveAnswer.count({ where: { playerId: player.id, correct: true } });
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const used = await prisma.xpEvent.aggregate({ where: { userId: player.userId, source: { in: ["game", "test"] }, createdAt: { gte: startOfDay } }, _sum: { amount: true } });
  const remaining = Math.max(0, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0));
  const xp = Math.min(MAX_XP_PER_CLAIM, remaining, 10 + correct * 3);
  const points = correct * 2 + (rank === 1 ? 20 : 0);
  await prisma.$transaction([
    ...(xp > 0 ? [prisma.xpEvent.create({ data: { userId: player.userId, amount: xp, source: "game" } })] : []),
    ...(points > 0
      ? [
          prisma.pointTransaction.create({ data: { userId: player.userId, amount: points, reason: "Živá hra" } }),
          prisma.user.update({ where: { id: player.userId }, data: { points: { increment: points } } }),
        ]
      : []),
    prisma.livePlayer.update({ where: { id: player.id }, data: { rewardXp: xp, rewardPoints: points } }),
  ]);
  return { xp, points };
}

// --- Stav pro polling ---

type Creds = { hostSecret?: string | null; playerToken?: string | null };

export async function getView(pin: string, creds: Creds, now = Date.now()): Promise<LiveView> {
  const room = await loadRoom(pin);
  const isHost = !!creds.hostSecret && creds.hostSecret === room.hostSecret;
  const players = await prisma.livePlayer.findMany({ where: { roomId: room.id }, orderBy: { joinedAt: "asc" } });
  const meRow = !isHost && creds.playerToken ? players.find((p) => p.token === creds.playerToken) : undefined;
  if (!isHost && !meRow) throw new LiveError("unauthorized", 401);

  const { mode, status, questions, settings, startedAt, endsAt } = roomParts(room);
  const quiz = mode === "QUIZ";
  const answers = quiz && room.current >= 0 ? await prisma.liveAnswer.findMany({ where: { roomId: room.id, qIndex: room.current } }) : [];

  const eff = effectiveStatus({ mode, status, questionStartedAt: startedAt, endsAt, settings, now, answered: answers.length, players: players.length });

  const ranked = rankPlayers(
    mode,
    players.map((p) => ({ ...p, joinedAt: p.joinedAt.getTime() })),
  );
  const row = (p: (typeof ranked)[number]): PlayerRow => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score, gold: p.gold, progress: p.progress });

  let question: LiveView["question"] = null;
  let qIndex = -1;
  if (eff === "QUESTION" || eff === "REVEAL" || eff === "ENDED") {
    if (quiz) qIndex = room.current;
    else if (meRow) qIndex = playerQuestionIndex(questions.length, meRow.id, meRow.answered);
    const q: LiveQuestion | undefined = qIndex >= 0 ? questions[qIndex] : undefined;
    if (q && (eff !== "ENDED" || isHost)) {
      const reveal = isHost || (quiz && eff === "REVEAL");
      question = {
        index: quiz ? room.current : meRow ? meRow.answered : 0,
        prompt: q.prompt,
        options: q.options,
        startedAt: quiz ? startedAt : null,
        seconds: quiz ? settings.seconds : null,
        ...(reveal ? { correctIndex: q.correctIndex, explanation: q.explanation } : {}),
      };
    }
  }

  const view: LiveView = {
    serverNow: now,
    pin: room.pin,
    title: room.title,
    mode,
    status: eff,
    role: isHost ? "host" : "player",
    settings,
    total: questions.length,
    endsAt,
    question,
    counts: { players: players.length, answered: answers.length },
    leaderboard: (isHost ? ranked : ranked.slice(0, 10)).map(row),
  };

  if (isHost && quiz && question) {
    const dist = question.options.map(() => 0);
    for (const a of answers) if (a.choice >= 0 && a.choice < dist.length) dist[a.choice]++;
    view.distribution = dist;
  }

  if (meRow) {
    const mine = answers.find((a) => a.playerId === meRow.id);
    const rank = ranked.findIndex((p) => p.id === meRow.id) + 1;
    if (eff === "ENDED") {
      const fresh = await rewardPlayer(meRow, rank).catch(() => null);
      const xp = fresh?.xp ?? meRow.rewardXp;
      const points = fresh?.points ?? meRow.rewardPoints;
      if (meRow.userId && xp !== null && points !== null) view.reward = { xp, points };
    }
    view.me = {
      id: meRow.id,
      name: meRow.name,
      rank,
      score: meRow.score,
      gold: meRow.gold,
      progress: meRow.progress,
      streak: meRow.streak,
      answeredCurrent: !!mine,
      choice: mine ? mine.choice : null,
      correct: mine && eff !== "QUESTION" ? mine.correct : null,
      lastPoints: mine ? mine.points : 0,
      chests: Array.isArray(meRow.pendingChest) ? meRow.pendingChest.length : 0,
    };
  }
  return view;
}

// --- Odpovědi ---

export async function submitAnswer(pin: string, playerToken: string, choice: unknown, now = Date.now()): Promise<AnswerResult> {
  const room = await loadRoom(pin);
  const player = await prisma.livePlayer.findFirst({ where: { roomId: room.id, token: playerToken } });
  if (!player) throw new LiveError("unauthorized", 401);
  const { mode, status, questions, settings, startedAt, endsAt } = roomParts(room);
  if (typeof choice !== "number" || !Number.isInteger(choice) || choice < 0 || choice > 3) throw new LiveError("bad-choice");

  if (mode === "QUIZ") {
    const [count, total] = await Promise.all([
      prisma.liveAnswer.count({ where: { roomId: room.id, qIndex: room.current } }),
      prisma.livePlayer.count({ where: { roomId: room.id } }),
    ]);
    const eff = effectiveStatus({ mode, status, questionStartedAt: startedAt, endsAt, settings, now, answered: count, players: total });
    if (eff !== "QUESTION" || startedAt === null) throw new LiveError("not-open", 409);
    const q = questions[room.current];
    if (!q || choice >= q.options.length) throw new LiveError("bad-choice");
    const correct = choice === q.correctIndex;
    const ms = Math.max(0, now - startedAt);
    const points = quizPoints(correct, ms, settings.seconds, player.streak);
    try {
      await prisma.$transaction([
        prisma.liveAnswer.create({ data: { roomId: room.id, playerId: player.id, qIndex: room.current, seq: room.current, choice, correct, ms, points } }),
        prisma.livePlayer.update({ where: { id: player.id }, data: { score: { increment: points }, streak: correct ? { increment: 1 } : 0 } }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new LiveError("already-answered", 409);
      throw e;
    }
    return { ok: true };
  }

  // Závod a Zlatá horečka: každý jde svým tempem.
  const eff = effectiveStatus({ mode, status, questionStartedAt: startedAt, endsAt, settings, now, answered: 0, players: 0 });
  if (eff !== "QUESTION") throw new LiveError("not-open", 409);
  if (player.pendingChest) throw new LiveError("choose-chest", 409);
  const qIndex = playerQuestionIndex(questions.length, player.id, player.answered);
  const q = questions[qIndex];
  if (choice >= q.options.length) throw new LiveError("bad-choice");
  const correct = choice === q.correctIndex;
  const chests = mode === "GOLD" && correct ? chestOptions() : null;
  const progress = player.progress + (correct && mode === "RACE" ? 1 : 0);
  try {
    await prisma.$transaction([
      prisma.liveAnswer.create({ data: { roomId: room.id, playerId: player.id, qIndex, seq: player.answered, choice, correct, ms: 0, points: correct ? 100 : 0 } }),
      prisma.livePlayer.update({
        where: { id: player.id },
        data: {
          answered: { increment: 1 },
          progress: correct ? { increment: 1 } : undefined,
          score: correct ? { increment: 100 } : undefined,
          streak: correct ? { increment: 1 } : 0,
          pendingChest: chests ? (chests as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      }),
    ]);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new LiveError("already-answered", 409);
    throw e;
  }
  let won = false;
  if (mode === "RACE" && progress >= settings.raceTarget) {
    // Dorazil do cíle jako první: hra končí.
    const res = await prisma.liveRoom.updateMany({ where: { id: room.id, status: "QUESTION" }, data: { status: "ENDED", endsAt: new Date(now) } });
    won = res.count > 0;
  }
  return { ok: true, correct, correctIndex: q.correctIndex, explanation: q.explanation, chests: chests ? chests.length : 0, won };
}

export async function openChest(pin: string, playerToken: string, index: unknown): Promise<ChestResult> {
  const room = await loadRoom(pin);
  if (room.mode !== "GOLD") throw new LiveError("not-gold", 409);
  const player = await prisma.livePlayer.findFirst({ where: { roomId: room.id, token: playerToken } });
  if (!player) throw new LiveError("unauthorized", 401);
  const all = Array.isArray(player.pendingChest) ? (player.pendingChest as unknown[]).filter(isChestOutcome) : [];
  if (all.length === 0) throw new LiveError("no-chest", 409);
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= all.length) throw new LiveError("bad-choice");
  const outcome: ChestOutcome = all[index];

  // Krást se dá jen od někoho, kdo má zlato; vybereme náhodného z lepší poloviny.
  let victim: { id: string; name: string; gold: number } | null = null;
  if (outcome.kind === "steal") {
    const others = await prisma.livePlayer.findMany({ where: { roomId: room.id, id: { not: player.id }, gold: { gt: 0 } }, orderBy: { gold: "desc" } });
    const pool = others.slice(0, Math.max(1, Math.ceil(others.length / 2)));
    victim = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }
  const delta = applyChest(outcome, player.gold, victim ? victim.gold : null);

  // Truhlu lze otevřít jen jednou: podmínka na pendingChest brání dvojitému kliknutí.
  const claimed = await prisma.livePlayer.updateMany({
    where: { id: player.id, pendingChest: { not: Prisma.DbNull } },
    data: { pendingChest: Prisma.DbNull },
  });
  if (claimed.count === 0) throw new LiveError("no-chest", 409);
  const ops: Prisma.PrismaPromise<unknown>[] = [prisma.livePlayer.update({ where: { id: player.id }, data: { gold: { increment: delta.me } } })];
  if (victim && delta.victim !== 0) ops.push(prisma.livePlayer.update({ where: { id: victim.id }, data: { gold: { increment: delta.victim } } }));
  await prisma.$transaction(ops);
  return { ok: true, outcome, gold: delta.me, victim: victim ? victim.name : null, all };
}

// --- Řízení hry učitelem ---

export async function advance(pin: string, hostSecret: string, action: "next" | "end", now = Date.now()): Promise<void> {
  const room = await loadRoom(pin);
  if (!hostSecret || hostSecret !== room.hostSecret) throw new LiveError("unauthorized", 401);
  const { mode, status, questions, settings, startedAt, endsAt } = roomParts(room);
  if (status === "ENDED") return;
  if (action === "end") {
    await prisma.liveRoom.update({ where: { id: room.id }, data: { status: "ENDED", endsAt: new Date(now) } });
    return;
  }
  if (status === "LOBBY") {
    const players = await prisma.livePlayer.count({ where: { roomId: room.id } });
    if (players === 0) throw new LiveError("no-players", 409);
    await prisma.liveRoom.update({
      where: { id: room.id },
      data: {
        status: "QUESTION",
        current: mode === "QUIZ" ? 0 : -1,
        questionStartedAt: new Date(now),
        endsAt: mode === "QUIZ" ? null : new Date(now + settings.durationMin * 60_000),
      },
    });
    return;
  }
  if (mode !== "QUIZ") return; // závod a horečka mají jen start a konec
  const answered = await prisma.liveAnswer.count({ where: { roomId: room.id, qIndex: room.current } });
  const total = await prisma.livePlayer.count({ where: { roomId: room.id } });
  const eff = effectiveStatus({ mode, status, questionStartedAt: startedAt, endsAt, settings, now, answered, players: total });
  if (eff === "QUESTION") {
    // Předčasné odhalení: posuneme začátek tak, aby čas otázky právě vypršel.
    await prisma.liveRoom.update({ where: { id: room.id }, data: { questionStartedAt: new Date(now - settings.seconds * 1000) } });
    return;
  }
  const next = room.current + 1;
  if (next >= questions.length) {
    await prisma.liveRoom.update({ where: { id: room.id }, data: { status: "ENDED", endsAt: new Date(now) } });
  } else {
    await prisma.liveRoom.update({ where: { id: room.id }, data: { current: next, questionStartedAt: new Date(now) } });
  }
}

export type { LiveSettings };
