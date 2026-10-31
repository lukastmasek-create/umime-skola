import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMaterialSubject, getTopic, materialSubjectLabel } from "@/lib/materials";
import type { Block } from "@/lib/materials/types";
import { getMaterialsText } from "@/i18n/materials";
import { isLocale, type Locale } from "@/i18n/config";
import { CardsBlock, QuizBlock, TopicPractice, type InteractiveLabels } from "@/components/MaterialInteractive";
import { topicPractice } from "@/lib/materials/practice";
import { relatedCourses } from "@/lib/materials/courses";

type Params = { locale: string; subject: string; topic: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { subject: slug, topic: topicSlug } = await params;
  const found = getTopic(slug, topicSlug);
  return found ? { title: found.topic.title, description: found.topic.intro } : {};
}

function BlockView({ block, labels, live }: { block: Block; labels: { examples: string; tip: string }; live: InteractiveLabels }) {
  switch (block.type) {
    case "quiz":
      return <QuizBlock question={block.question} options={block.options} answer={block.answer} why={block.why} labels={live} />;
    case "cards":
      return <CardsBlock items={block.items} labels={live} />;
    case "p":
      return <p className="leading-relaxed">{block.text}</p>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className={`flex flex-col gap-1.5 pl-6 leading-relaxed ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border-2 border-[var(--edge)]">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <thead className="bg-[var(--brand-50)] text-[var(--brand-700)]">
              <tr>
                {block.head.map((cell, c) => (
                  <th key={c} className="px-3 py-2 font-bold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-[var(--border-soft)]">
                  {row.map((cell, i) => (
                    <td key={i} className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "examples":
      return (
        <div className="rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{labels.examples}</p>
          <ul className="flex flex-col gap-1.5 leading-relaxed">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case "tip":
      return (
        <div className="rounded-xl border-2 border-[var(--edge)] bg-[var(--accent-yellow)] p-4 text-[#16132b]">
          <span className="font-bold">💡 {labels.tip}: </span>
          {block.text}
        </div>
      );
  }
}

export default async function MaterialTopicPage({ params }: { params: Promise<Params> }) {
  const { locale, subject: slug, topic: topicSlug } = await params;
  if (!isLocale(locale)) notFound();
  const subject = getMaterialSubject(slug);
  const found = getTopic(slug, topicSlug);
  if (!subject || !found) notFound();
  const { topic, prev, next } = found;
  const t = getMaterialsText(locale as Locale);
  const label = materialSubjectLabel(subject, locale as Locale);
  const practiceHref = `/${locale}/kurzy/${topic.level === 4 ? "prijimacky" : "zakladni"}?predmet=${slug}`;
  const practice = topicPractice(topic);
  const courses = await relatedCourses(subject.value, topic);

  return (
    <article data-world={subject.slug} className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href={`/${locale}/materialy/${slug}`} className="mb-4 inline-flex text-sm font-semibold text-[var(--brand-600)] hover:underline">
        ← {label}
      </Link>
      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--brand-600)]">
        {t.levels[topic.level].title} · {t.levels[topic.level].hint}
      </p>
      <h1 className="mb-3 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {topic.title}
      </h1>
      <p className="mb-6 text-lg text-[var(--muted)]">{topic.intro}</p>

      <nav aria-label={t.contents} className="card mb-8 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.contents}</p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
          {topic.sections.map((section, i) => (
            <li key={section.heading}>
              <a href={`#sekce-${i + 1}`} className="font-semibold text-[var(--brand-600)] hover:underline">
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-10">
        {topic.sections.map((section, i) => (
          <section key={section.heading} id={`sekce-${i + 1}`} className="scroll-mt-28">
            <h2 className="mb-3 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {section.heading}
            </h2>
            <div className="flex flex-col gap-4">
              {section.blocks.map((block, j) => (
                <BlockView key={j} block={block} labels={t} live={t.interactive} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="card mt-10 border-l-8 p-5" style={{ borderLeftColor: subject.color }}>
        <h2 className="mb-2 text-lg font-bold">✅ {t.remember}</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 leading-relaxed">
          {topic.remember.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </aside>

      <TopicPractice cards={practice.cards} questions={practice.questions} labels={t.interactive} />

      {subject.value && (
        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border-2 border-[var(--edge)] bg-[var(--brand-50)] p-5">
          <p className="text-sm text-[var(--muted)]">{t.practiceHint}</p>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <Link key={c.slug} href={`/${locale}/kurzy/${c.category}/${c.slug}`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
                🎮 {c.title}
              </Link>
            ))}
            <Link href={practiceHref} className={`btn-bouncy px-4 py-2 text-sm font-bold ${courses.length ? "bg-[var(--surface)]" : "bg-[var(--brand-500)] text-white"}`}>
              {courses.length ? t.allCourses : t.practice} →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/${locale}/materialy/${slug}/${prev.slug}`} className="card card-hover p-4">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">← {t.prev}</span>
            <span className="mt-1 block font-semibold">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/${locale}/materialy/${slug}/${next.slug}`} className="card card-hover p-4 text-right">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.next} →</span>
            <span className="mt-1 block font-semibold">{next.title}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
