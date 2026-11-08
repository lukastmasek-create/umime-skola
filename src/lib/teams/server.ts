import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiveError } from "@/lib/live/service";
import { isAssignedTo } from "@/lib/teams/logic";

export const dynamic = "force-dynamic";

export async function requireUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) throw new LiveError("login-required", 401);
  return session.user.id;
}

/** Členství uživatele v týmu, jinak 404 (aby šlo tým jen hádat, ne ověřit). */
export async function requireMember(teamId: string, userId: string, teacherOnly = false) {
  const m = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
  if (!m || m.status !== "ACTIVE") throw new LiveError("team-not-found", 404);
  if (teacherOnly && m.role !== "TEACHER") throw new LiveError("teacher-only", 403);
  return m;
}

export async function loadAssignment(teamId: string, assignmentId: string) {
  const a = await prisma.assignment.findFirst({ where: { id: assignmentId, teamId } });
  if (!a) throw new LiveError("assignment-not-found", 404);
  return a;
}

/** Žák smí zadání vidět a plnit jen když je mu určené (učitel vždy). */
export async function requireAssigned(assignmentId: string, member: { userId: string; groupId: string | null; role: string }) {
  if (member.role === "TEACHER") return;
  const targets = await prisma.assignmentTarget.findMany({ where: { assignmentId }, select: { groupId: true, userId: true } });
  if (!isAssignedTo(targets, member)) throw new LiveError("assignment-not-found", 404);
}
