"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/i18n/config";
import type { ProFeatureSlug } from "@/lib/pro-tools/features";

const AiSpace = dynamic(() => import("@/components/ai/AiSpace").then((module) => module.AiSpace));
const ExamRunner = dynamic(() => import("./ExamRunner").then((module) => module.ExamRunner));
const MistakeNotebook = dynamic(() => import("./MistakeNotebook").then((module) => module.MistakeNotebook));
const NotesCards = dynamic(() => import("./NotesCards").then((module) => module.NotesCards));
const OfflineManager = dynamic(() => import("./OfflineManager").then((module) => module.OfflineManager));
const OralExam = dynamic(() => import("./OralExam").then((module) => module.OralExam));
const PhotoTasks = dynamic(() => import("./PhotoTasks").then((module) => module.PhotoTasks));
const Pronunciation = dynamic(() => import("./Pronunciation").then((module) => module.Pronunciation));
const StudyPlan = dynamic(() => import("./StudyPlan").then((module) => module.StudyPlan));
const FamilyDuel = dynamic(() => import("./FamilyTools").then((module) => module.FamilyDuel));
const FamilyHub = dynamic(() => import("./FamilyTools").then((module) => module.FamilyHub));
const HolidayPlan = dynamic(() => import("./FamilyTools").then((module) => module.HolidayPlan));
const SchoolTools = dynamic(() => import("./SchoolTools").then((module) => module.SchoolTools));

const VIEWS: Record<ProFeatureSlug, (props: { locale: Locale }) => React.ReactNode> = {
  doucovatel: (p) => <AiSpace {...p} />,
  plan: (p) => <StudyPlan {...p} />,
  zkouska: (p) => <ExamRunner {...p} />,
  fotka: (p) => <PhotoTasks {...p} />,
  ustni: (p) => <OralExam {...p} />,
  "sesit-chyb": (p) => <MistakeNotebook {...p} />,
  poznamky: (p) => <NotesCards {...p} />,
  vyslovnost: (p) => <Pronunciation {...p} />,
  offline: (p) => <OfflineManager {...p} />,
  rodina: (p) => <FamilyHub {...p} />,
  souboj: (p) => <FamilyDuel {...p} />,
  prazdniny: (p) => <HolidayPlan {...p} />,
  skola: (p) => <SchoolTools {...p} />,
};

export function ProFeatureView({ locale, feature }: { locale: Locale; feature: ProFeatureSlug }) {
  return VIEWS[feature]({ locale });
}
