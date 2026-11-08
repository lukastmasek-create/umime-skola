export type Assignment = {
  id: string; title: string; description: string; maxAttempts: number | null; passPercent: number; dueAt: string | null; questions: number;
  due: "none" | "ok" | "soon" | "overdue";
  students?: number; done?: number; viewed?: number; used?: number; best?: number;
  groupIds?: string[]; userIds?: string[]; archived?: boolean;
};
export type Member = { id: string; name: string | null; email: string | null; role: string; groupId: string | null };
export type Pending = { id: string; name: string | null; email: string | null; requestedAt: string };
export type Group = { id: string; name: string; members: number };
export type Team = {
  id: string; name: string; role: string; userId: string; code: string | null; joinMode: string;
  members: Member[]; pending: Pending[]; groups: Group[]; assignments: Assignment[];
};
export type Audience = { groupIds: string[]; userIds: string[] };

export const field = "rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm";
export const primaryBtn = "btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60";
export const linkBtn = "text-xs font-bold text-[var(--brand-600)]";
export const dangerBtn = "text-xs font-bold text-[var(--danger)]";
