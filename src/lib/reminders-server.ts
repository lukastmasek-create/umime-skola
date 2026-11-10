import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { isAssignedTo, studentStatus } from "@/lib/teams/logic";
import {
  REMIND_BEFORE_HOURS, SUMMARY_WITHIN_HOURS, buildStudentMail, buildTeacherMail, parseNotifyPrefs, sentKey,
  studentReminderDue, teacherSummaryDue,
} from "@/lib/reminders";

export const NOTIFY_GAME = "oznameni";
const SITE = "https://ucimesehrou.org";

/** Zapíše značku „odesláno“. Falešné true nehrozí: při chybě i při duplicitě vrací false a e-mail se nepošle. */
async function claim(userId: string, key: string): Promise<boolean> {
  try {
    await prisma.idleState.create({ data: { userId, game: key, data: { at: new Date().toISOString() } } });
    return true;
  } catch {
    return false;
  }
}

/** Projde zadání s termínem kolem teď a rozešle připomínky těm, kdo si je zapnuli. Spouští ji cron. */
export async function runDeadlineReminders(now: Date = new Date()) {
  const from = new Date(now.getTime() - SUMMARY_WITHIN_HOURS * 3600_000);
  const to = new Date(now.getTime() + REMIND_BEFORE_HOURS * 3600_000);
  const assignments = await prisma.assignment.findMany({
    where: { dueAt: { gte: from, lte: to }, archive: null },
    take: 200,
    include: {
      team: { select: { id: true, name: true, members: { where: { status: "ACTIVE" }, select: { userId: true, role: true, groupId: true } } } },
      targets: { select: { groupId: true, userId: true } },
      attempts: { select: { userId: true, percent: true } },
      views: { select: { userId: true } },
    },
  });

  const userIds = [...new Set(assignments.flatMap((a) => a.team.members.map((m) => m.userId)))];
  const [prefRows, users] = await Promise.all([
    prisma.idleState.findMany({ where: { game: NOTIFY_GAME, userId: { in: userIds } }, select: { userId: true, data: true } }),
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } }),
  ]);
  const optedIn = new Set(prefRows.filter((r) => parseNotifyPrefs(r.data).deadline).map((r) => r.userId));
  const email = new Map(users.map((u) => [u.id, u.email]));

  let sent = 0;
  const deliver = async (userId: string, key: string, mail: { subject: string; text: string }) => {
    const to = email.get(userId);
    if (!to || !optedIn.has(userId)) return;
    if (!(await claim(userId, key))) return;
    if (await sendMail(to, mail.subject, mail.text)) sent++;
  };

  for (const a of assignments) {
    if (!a.dueAt) continue;
    const url = `${SITE}/cs/tymy/${a.team.id}/zadani/${a.id}`;
    const settingsUrl = `${SITE}/cs/nastaveni`;
    const students = a.team.members.filter((m) => m.role === "STUDENT" && isAssignedTo(a.targets, m));
    const status = (userId: string) => {
      const mine = a.attempts.filter((t) => t.userId === userId);
      return studentStatus({
        viewed: a.views.some((v) => v.userId === userId),
        attempts: mine.length,
        best: Math.max(0, ...mine.map((t) => t.percent)),
        passPercent: a.passPercent,
      });
    };

    if (studentReminderDue(a.dueAt, now)) {
      const mail = buildStudentMail({ title: a.title, teamName: a.team.name, dueAt: a.dueAt, url, settingsUrl });
      for (const s of students) if (status(s.userId) !== "done") await deliver(s.userId, sentKey("student", a.id), mail);
    }
    if (teacherSummaryDue(a.dueAt, now) && students.length > 0) {
      const done = students.filter((s) => status(s.userId) === "done").length;
      const mail = buildTeacherMail({ title: a.title, teamName: a.team.name, dueAt: a.dueAt, done, total: students.length, url, settingsUrl });
      for (const t of a.team.members.filter((m) => m.role === "TEACHER")) await deliver(t.userId, sentKey("teacher", a.id), mail);
    }
  }
  return { assignments: assignments.length, sent };
}
