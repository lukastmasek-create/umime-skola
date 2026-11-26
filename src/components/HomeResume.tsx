"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { learningResumeHref, parseLearningResume, type LearningResume } from "@/lib/learning-resume";
import { getHomeStartText } from "@/i18n/home-start";
import { getTestText } from "@/i18n/test";
import { getHomeText } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function HomeResume({ locale, userId }: { locale: Locale; userId?: string }) {
  const [saved, setSaved] = useState<{ userId: string; resume: LearningResume & { title: string } } | null>(null);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    fetch("/api/uceni/pokracovat", { signal: controller.signal, cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const resume = parseLearningResume(data?.resume);
        if (resume && typeof data.resume.title === "string") setSaved({ userId, resume: { ...resume, title: data.resume.title } });
      }).catch(() => {});
    return () => controller.abort();
  }, [userId]);
  const resume = saved?.userId === userId ? saved?.resume : null;
  const c = getHomeStartText(locale);
  const title = resume ? `${resume.title} · ${getTestText(locale).difficulties[resume.difficulty - 1]}` : null;
  return <div className="home-resume">
    {title && <p><span>{c.last}</span><strong>{title}</strong></p>}
    <Link href={resume ? learningResumeHref(locale, resume) : "#stupne"} className="btn-primary">
      {resume ? getHomeText(locale).continueLearning : c.choose} →
    </Link>
  </div>;
}
