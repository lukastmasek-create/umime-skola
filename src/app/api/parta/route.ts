import { avatarIcons } from "@/lib/avatar-icon";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAY_MS, startOfUtcWeek } from "@/lib/gamify";
import {
  DUEL_DAYS,
  DUEL_REWARD_XP,
  GROUP_WEEKLY_XP_PER_MEMBER,
  MAX_GROUPS_PER_USER,
  MAX_GROUP_MEMBERS,
  activityXp,
  randomCode,
} from "@/lib/social";

const MAX_ACTIVE_DUELS = 3;
const userSelect = { id: true, name: true, avatar: true } as const;

async function snapshot(userId: string) {
  const now = Date.now();
  const weekStart = startOfUtcWeek(now);

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: { include: { members: { include: { user: { select: userSelect } } } } },
    },
    orderBy: { joinedAt: "asc" },
  });
  const duels = await prisma.duel.findMany({
    where: { OR: [{ challengerId: userId }, { opponentId: userId }], status: { in: ["pending", "active"] } },
    include: { challenger: { select: userSelect }, opponent: { select: userSelect } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const allIds = new Set<string>();
  for (const m of memberships) for (const g of m.group.members) allIds.add(g.userId);
  const weekXp = await activityXp([...allIds], weekStart);

  const duelXp = new Map<string, [number, number]>();
  for (const d of duels) {
    if (d.status !== "active" || !d.startsAt || !d.endsAt) continue;
    const to = new Date(Math.min(now, d.endsAt.getTime()) + 1);
    const xp = await activityXp([d.challengerId, d.opponentId], d.startsAt, to);
    duelXp.set(d.id, [xp.get(d.challengerId) ?? 0, xp.get(d.opponentId) ?? 0]);
  }
  const claimedRows = duels.length
    ? await prisma.xpEvent.findMany({
        where: { userId, source: { in: duels.map((d) => `duel:${d.id}`) } },
        select: { source: true },
      })
    : [];
  const claimed = new Set(claimedRows.map((r) => r.source));
  const icons = await avatarIcons([
    ...memberships.flatMap(({ group }) => group.members.map((m) => m.userId)),
    ...duels.flatMap((d) => [d.challengerId, d.opponentId]),
  ]);

  return {
    loggedIn: true as const,
    userId,
    limits: { maxGroups: MAX_GROUPS_PER_USER },
    groups: memberships.map(({ group }) => {
      const members = group.members
        .map((m) => ({ id: m.userId, name: m.user.name, avatar: m.user.avatar, icon: icons[m.userId] ?? null, xp: weekXp.get(m.userId) ?? 0 }))
        .sort((a, b) => b.xp - a.xp);
      const target = GROUP_WEEKLY_XP_PER_MEMBER * members.length;
      const total = members.reduce((sum, m) => sum + m.xp, 0);
      return {
        id: group.id,
        name: group.name,
        code: group.code,
        isOwner: group.ownerId === userId,
        members,
        target,
        total,
        done: total >= target,
      };
    }),
    duels: duels.map((d) => {
      const [a, b] = duelXp.get(d.id) ?? [0, 0];
      const ended = !!d.endsAt && d.endsAt.getTime() <= now;
      const mine = d.challengerId === userId ? a : b;
      const theirs = d.challengerId === userId ? b : a;
      return {
        id: d.id,
        status: d.status,
        incoming: d.opponentId === userId && d.status === "pending",
        endsAt: d.endsAt?.toISOString() ?? null,
        ended,
        me: mine,
        them: theirs,
        other: (() => {
          const o = d.challengerId === userId ? d.opponent : d.challenger;
          return { ...o, icon: icons[o.id] ?? null };
        })(),
        won: ended && mine > theirs,
        tied: ended && mine === theirs && mine > 0,
        claimed: claimed.has(`duel:${d.id}`),
        reward: DUEL_REWARD_XP,
      };
    }),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  try {
    return NextResponse.json(await snapshot(userId));
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

  try {
    switch (body.action) {
      case "create": {
        const name = str(body.name, 30);
        if (name.length < 2) return fail("invalid-name");
        if ((await prisma.groupMember.count({ where: { userId } })) >= MAX_GROUPS_PER_USER) return fail("too-many-groups");
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            await prisma.group.create({
              data: { name, code: randomCode(), ownerId: userId, members: { create: { userId } } },
            });
            return NextResponse.json(await snapshot(userId));
          } catch (e) {
            if ((e as { code?: string }).code !== "P2002") throw e;
          }
        }
        return fail("unavailable", 503);
      }
      case "join": {
        const code = str(body.code, 12).toUpperCase();
        const group = await prisma.group.findUnique({ where: { code }, include: { _count: { select: { members: true } } } });
        if (!group) return fail("unknown-code", 404);
        if (group._count.members >= MAX_GROUP_MEMBERS) return fail("group-full", 409);
        if ((await prisma.groupMember.count({ where: { userId } })) >= MAX_GROUPS_PER_USER) return fail("too-many-groups");
        await prisma.groupMember.upsert({
          where: { groupId_userId: { groupId: group.id, userId } },
          create: { groupId: group.id, userId },
          update: {},
        });
        return NextResponse.json(await snapshot(userId));
      }
      case "leave": {
        const groupId = str(body.groupId, 40);
        await prisma.groupMember.deleteMany({ where: { groupId, userId } });
        // Parta bez členů zaniká.
        const left = await prisma.groupMember.count({ where: { groupId } });
        if (left === 0) await prisma.group.deleteMany({ where: { id: groupId } });
        return NextResponse.json(await snapshot(userId));
      }
      case "challenge": {
        const opponentId = str(body.opponentId, 40);
        if (!opponentId || opponentId === userId) return fail("invalid-opponent");
        const mine = await prisma.groupMember.findMany({ where: { userId }, select: { groupId: true } });
        const shared = await prisma.groupMember.count({
          where: { userId: opponentId, groupId: { in: mine.map((m) => m.groupId) } },
        });
        if (shared === 0) return fail("not-in-group", 403);
        const open = await prisma.duel.findMany({
          where: { status: { in: ["pending", "active"] }, OR: [{ challengerId: userId }, { opponentId: userId }] },
        });
        const running = open.filter((d) => d.status === "pending" || !d.endsAt || d.endsAt.getTime() > Date.now());
        if (running.length >= MAX_ACTIVE_DUELS) return fail("too-many-duels", 409);
        if (running.some((d) => d.challengerId === opponentId || d.opponentId === opponentId)) return fail("duel-exists", 409);
        await prisma.duel.create({ data: { challengerId: userId, opponentId } });
        return NextResponse.json(await snapshot(userId));
      }
      case "accept":
      case "decline": {
        const duel = await prisma.duel.findUnique({ where: { id: str(body.duelId, 40) } });
        if (!duel || duel.opponentId !== userId || duel.status !== "pending") return fail("unknown-duel", 404);
        if (body.action === "decline") {
          await prisma.duel.update({ where: { id: duel.id }, data: { status: "declined" } });
        } else {
          const startsAt = new Date();
          await prisma.duel.update({
            where: { id: duel.id },
            data: { status: "active", startsAt, endsAt: new Date(startsAt.getTime() + DUEL_DAYS * DAY_MS) },
          });
        }
        return NextResponse.json(await snapshot(userId));
      }
      case "claim": {
        const snap = await snapshot(userId);
        const duelId = str(body.duelId, 40);
        const duel = snap.duels.find((d) => d.id === duelId);
        if (!duel || !duel.ended || duel.claimed || !(duel.won || duel.tied)) return fail("not-claimable", 409);
        await prisma.xpEvent.create({ data: { userId, amount: DUEL_REWARD_XP, source: `duel:${duelId}` } });
        return NextResponse.json(await snapshot(userId));
      }
      default:
        return fail("unknown-action");
    }
  } catch {
    return fail("unavailable", 503);
  }
}
