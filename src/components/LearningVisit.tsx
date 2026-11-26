"use client";

import { useEffect } from "react";
import { useAccount } from "@/lib/use-account";
import type { LearningResume } from "@/lib/learning-resume";

// Runs only after an actual exercise mounts, never during Next.js link prefetching.
export function LearningVisit({ category, course, difficulty, game }: LearningResume) {
  const [account] = useAccount();
  const userId = account?.loggedIn ? account.userId : null;
  useEffect(() => {
    if (!userId) return;
    void fetch("/api/uceni/pokracovat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, course, difficulty, game }),
    }).catch(() => {});
  }, [userId, category, course, difficulty, game]);
  return null;
}
