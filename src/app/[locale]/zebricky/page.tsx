import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityText } from "@/i18n/community";
import { isLocale, type Locale } from "@/i18n/config";
import { Avatar } from "@/components/Avatar";
import { Podium } from "@/components/Podium";
import { RewardImage } from "@/components/RewardImage";
import { TROPHIES } from "@/lib/rewards";
import { getEscapeText } from "@/i18n/escape";
import { getIdleText } from "@/i18n/idle";
import { ROOMS } from "@/lib/escape/rewards";

export const revalidate = 0;

type EscapeRow = {
  id: string;
  name: string | null;
  avatar: string | null;
  school: string | null;
  seconds: number;
  stars: number;
};

const mmss = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

type Player = { id: string; name: string | null; points: number; avatar: string | null };
type SchoolRow = { id: string; name: string; city: string; total: number; players: number; average: number };

function RankBadge({ position }: { position: number }) {
  const trophy = TROPHIES[position - 1];
  if (trophy) {
    // 1. až 3. místo: pohár z Blenderu, číslo zůstává pro čtečky obrazovky.
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
        <RewardImage name={trophy} size={44} />
        <span className="sr-only">{position}</span>
      </span>
    );
  }
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--edge)] bg-[var(--surface-muted)] text-base font-extrabold text-[var(--foreground)]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {position}
    </span>
  );
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; razeni?: string; room?: string; rozsah?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { tab: tabParam, razeni, room: roomParam, rozsah } = await searchParams;
  const t = getCommunityText(locale as Locale).leaderboards;
  const escapeText = getEscapeText(locale as Locale);
  const idleText = getIdleText(locale as Locale);

  const tab =
    tabParam === "skola" || tabParam === "skoly" || tabParam === "unikovky" || tabParam === "hry"
      ? tabParam
      : "hraci";
  const sortByAverage = razeni === "prumer";
  const roomId = roomParam && roomParam in ROOMS ? roomParam : "lab";
  const schoolScope = rozsah === "skola";
  let escapeRows: EscapeRow[] = [];

  const session = await auth();
  const userId = session?.user?.id;

  let failed = false;
  let top: Player[] = [];
  let myRank: { rank: number; points: number } | null = null;
  let mySchool: { id: string; name: string; city: string } | null = null;
  let schools: SchoolRow[] = [];

  try {
    const me = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { points: true, school: { select: { id: true, name: true, city: true } } },
        })
      : null;
    mySchool = me?.school ?? null;

    if (tab === "hraci") {
      top = await prisma.user.findMany({
        where: { points: { gt: 0 } },
        orderBy: [{ points: "desc" }, { createdAt: "asc" }],
        take: 20,
        select: { id: true, name: true, points: true, avatar: true },
      });
      if (me) {
        const ahead = await prisma.user.count({ where: { points: { gt: me.points } } });
        myRank = { rank: ahead + 1, points: me.points };
      }
    } else if (tab === "skola" && mySchool) {
      top = await prisma.user.findMany({
        where: { schoolId: mySchool.id, points: { gt: 0 } },
        orderBy: [{ points: "desc" }, { createdAt: "asc" }],
        take: 20,
        select: { id: true, name: true, points: true, avatar: true },
      });
    } else if (tab === "skoly") {
      const grouped = await prisma.user.groupBy({
        by: ["schoolId"],
        where: { schoolId: { not: null } },
        _sum: { points: true },
        _count: { _all: true },
      });
      const ids = grouped.map((g) => g.schoolId).filter((id): id is string => !!id);
      const names = await prisma.school.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, city: true },
      });
      schools = grouped
        .map((g) => {
          const school = names.find((s) => s.id === g.schoolId);
          const total = g._sum.points ?? 0;
          const players = g._count._all;
          return school
            ? { ...school, total, players, average: players ? Math.round(total / players) : 0 }
            : null;
        })
        .filter((s): s is SchoolRow => !!s && s.total > 0)
        .sort((a, b) => (sortByAverage ? b.average - a.average : b.total - a.total))
        .slice(0, 20);
    } else if (tab === "unikovky" && (!schoolScope || mySchool)) {
      // Nejlepší čas každého hráče v časovaném režimu.
      const where = {
        room: roomId,
        relaxed: false,
        ...(schoolScope && mySchool ? { user: { schoolId: mySchool.id } } : {}),
      };
      const best = await prisma.escapeRun.groupBy({
        by: ["userId"],
        where,
        _min: { seconds: true },
        orderBy: { _min: { seconds: "asc" } },
        take: 20,
      });
      const ids = best.map((b) => b.userId);
      const [users, runs] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, avatar: true, school: { select: { name: true } } },
        }),
        prisma.escapeRun.findMany({
          where: { room: roomId, relaxed: false, userId: { in: ids } },
          select: { userId: true, seconds: true, stars: true },
        }),
      ]);
      escapeRows = best.flatMap((b) => {
        const user = users.find((u) => u.id === b.userId);
        const seconds = b._min.seconds;
        if (!user || seconds === null) return [];
        const run = runs.find((r) => r.userId === b.userId && r.seconds === seconds);
        return [
          {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            school: user.school?.name ?? null,
            seconds,
            stars: run?.stars ?? 1,
          },
        ];
      });
    }
  } catch {
    failed = true;
  }

  const base = `/${locale}/zebricky`;
  const chip = (active: boolean) =>
    `pill px-4 py-2 text-sm ${
      active
        ? "bg-[var(--brand-500)] text-white"
        : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"
    }`;

  const playerList = (
    <>
      <Podium players={top} anonymous={t.anonymous} highlightId={userId} />
      <ol className="flex flex-col gap-3">
        {top.map((player, i) => (
          <li
            key={player.id}
            className={`card flex items-center gap-4 px-4 py-3 ${
              player.id === userId ? "outline outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""
            }`}
          >
            <RankBadge position={i + 1} />
            <Avatar id={player.avatar} size={36} />
            <span className="flex-1 truncate font-semibold">{player.name || t.anonymous}</span>
            <span className="font-bold tabular-nums">{player.points}</span>
          </li>
        ))}
      </ol>
    </>
  );

  let content: React.ReactNode;
  if (tab === "hry") {
    content = (
      <div className="grid gap-4 sm:grid-cols-2">
        {idleText.games.map((game, i) => (
          <div key={game.name} className="card flex flex-col gap-2 p-5 opacity-80">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">{game.name}</h2>
              <span className="pill bg-[var(--surface-muted)] px-2.5 py-1">{t.idleSoon}</span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {t.idleMetric}: <span className="font-semibold">{t.idleMetrics[i]}</span>
            </p>
          </div>
        ))}
      </div>
    );
  } else if (failed) {
    content = <div className="card p-8 text-center text-[var(--muted)]">{t.unavailable}</div>;
  } else if ((tab === "skola" || (tab === "unikovky" && schoolScope)) && !userId) {
    content = <div className="card p-8 text-center text-[var(--muted)]">{t.loginHint}</div>;
  } else if (tab === "unikovky" && !(schoolScope && !mySchool)) {
    content =
      escapeRows.length === 0 ? (
        <div className="card p-8 text-center text-[var(--muted)]">{t.noRuns}</div>
      ) : (
        <ol className="flex flex-col gap-3">
          {escapeRows.map((row, i) => (
            <li
              key={row.id}
              className={`card flex items-center gap-4 px-4 py-3 ${
                row.id === userId ? "outline outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""
              }`}
            >
              <RankBadge position={i + 1} />
              <Avatar id={row.avatar} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{row.name || t.anonymous}</span>
                {row.school && (
                  <span className="block truncate text-xs text-[var(--faint)]">{row.school}</span>
                )}
              </span>
              <span className="text-lg tracking-widest text-[var(--accent-yellow)]" aria-label={`${row.stars}/3`}>
                {"★".repeat(row.stars)}
              </span>
              <span className="w-16 text-right font-bold tabular-nums">{mmss(row.seconds)}</span>
            </li>
          ))}
        </ol>
      );
  } else if ((tab === "skola" || tab === "unikovky") && !mySchool) {
    content = (
      <div className="card p-8 text-center">
        <p className="mb-3 text-[var(--muted)]">{t.noSchool}</p>
        <Link
          href={`/${locale}/nastaveni`}
          className="text-sm font-bold text-[var(--brand-600)] hover:underline"
        >
          {t.chooseSchool}
        </Link>
      </div>
    );
  } else if (tab === "skoly") {
    content =
      schools.length === 0 ? (
        <div className="card p-8 text-center text-[var(--muted)]">{t.schoolsEmpty}</div>
      ) : (
        <ol className="flex flex-col gap-3">
          {schools.map((school, i) => (
            <li
              key={school.id}
              className={`card flex items-center gap-4 px-4 py-3 ${
                school.id === mySchool?.id
                  ? "outline outline-2 outline-offset-2 outline-[var(--brand-500)]"
                  : ""
              }`}
            >
              <RankBadge position={i + 1} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{school.name}</span>
                <span className="block truncate text-xs text-[var(--faint)]">
                  {school.city ? `${school.city} · ` : ""}
                  {school.players} {t.players.toLowerCase()}
                  {school.id === mySchool?.id ? ` · ${t.yourSchool}` : ""}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-bold tabular-nums">
                  {sortByAverage ? school.average : school.total}
                </span>
                <span className="block text-xs text-[var(--faint)]">
                  {sortByAverage ? t.average : t.total}
                </span>
              </span>
            </li>
          ))}
        </ol>
      );
  } else if (top.length === 0) {
    content = (
      <div className="card p-8 text-center text-[var(--muted)]">
        {tab === "skola" ? t.mySchoolEmpty : t.empty}
      </div>
    );
  } else {
    content = playerList;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-6 text-[var(--muted)]">
        {tab === "skoly"
          ? t.schoolsSubtitle
          : tab === "skola" && mySchool
            ? mySchool.name
            : tab === "unikovky"
              ? t.escapeSubtitle
              : tab === "hry"
                ? t.idleSubtitle
                : t.subtitle}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={base} className={chip(tab === "hraci")}>
          {t.tabPlayers}
        </Link>
        <Link href={`${base}?tab=skola`} className={chip(tab === "skola")}>
          {t.tabMySchool}
        </Link>
        <Link href={`${base}?tab=skoly`} className={chip(tab === "skoly")}>
          {t.tabSchools}
        </Link>
        <Link href={`${base}?tab=unikovky`} className={chip(tab === "unikovky")}>
          {t.tabEscape}
        </Link>
        <Link href={`${base}?tab=hry`} className={chip(tab === "hry")}>
          {t.tabIdle}
        </Link>
      </div>

      {tab === "unikovky" && (
        <div className="mb-6 flex flex-wrap gap-2">
          {escapeText.list.rooms
            .filter((r) => r.available)
            .map((r) => (
              <Link
                key={r.id}
                href={`${base}?tab=unikovky&room=${r.id}${schoolScope ? "&rozsah=skola" : ""}`}
                className={chip(roomId === r.id)}
              >
                {r.name}
              </Link>
            ))}
          <span aria-hidden className="mx-1 w-0.5 self-stretch rounded bg-[var(--border-soft)]" />
          <Link href={`${base}?tab=unikovky&room=${roomId}`} className={chip(!schoolScope)}>
            {t.scopeAll}
          </Link>
          <Link href={`${base}?tab=unikovky&room=${roomId}&rozsah=skola`} className={chip(schoolScope)}>
            {t.scopeSchool}
          </Link>
        </div>
      )}

      {tab === "skoly" && (
        <div className="mb-6 flex gap-2">
          <Link href={`${base}?tab=skoly`} className={chip(!sortByAverage)}>
            {t.total}
          </Link>
          <Link href={`${base}?tab=skoly&razeni=prumer`} className={chip(sortByAverage)}>
            {t.average}
          </Link>
        </div>
      )}

      {tab === "hraci" &&
        (!userId ? (
          <p className="mb-6 text-sm text-[var(--faint)]">{t.loginHint}</p>
        ) : (
          myRank && (
            <div className="card mb-6 flex items-center justify-between gap-4 p-4">
              <span className="text-sm font-semibold text-[var(--muted)]">{t.yourRank}</span>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                #{myRank.rank} · {myRank.points} {t.points.toLowerCase()}
              </span>
            </div>
          )
        ))}

      {content}
    </div>
  );
}
