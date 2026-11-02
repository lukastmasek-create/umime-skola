// Čistá logika PRO předplatného (bez databáze, aby šla testovat).
// Databázové dotazy jsou v pro-server.ts.

export type SubscriptionTier = "INDIVIDUAL" | "FAMILY" | "SCHOOL";

export type SubscriptionRecord = {
  id: string;
  tier: SubscriptionTier;
  ownerId: string | null;
  schoolId: string | null;
  startsAt: Date;
  endsAt: Date | null;
};

export type ProUser = {
  id: string;
  subscriptionId: string | null;
  schoolId: string | null;
};

// Předplatné je platné, pokud už začalo a ještě neskončilo (endsAt = null znamená bez konce).
export function isSubscriptionActive(sub: SubscriptionRecord, now: Date = new Date()): boolean {
  return sub.startsAt.getTime() <= now.getTime() && (sub.endsAt === null || sub.endsAt.getTime() > now.getTime());
}

// Vztah účtu k předplatnému:
// - plátce jednotlivce nebo rodiny (ownerId),
// - člen rodinného tarifu nebo jednotlivce (subscriptionId),
// - žák školy s aktivním školním tarifem (stejné schoolId).
export function subscriptionCoversUser(sub: SubscriptionRecord, user: ProUser): boolean {
  if (sub.tier === "SCHOOL") return sub.schoolId !== null && sub.schoolId === user.schoolId;
  return sub.ownerId === user.id || sub.id === user.subscriptionId;
}

export function userHasPro(user: ProUser, subs: SubscriptionRecord[], now: Date = new Date()): boolean {
  return subs.some((sub) => isSubscriptionActive(sub, now) && subscriptionCoversUser(sub, user));
}
