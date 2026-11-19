"use client";

import { useState } from "react";
import Link from "next/link";
import { GRADES, type CategorySlug } from "@/lib/taxonomy";
import { gradeLabel } from "@/i18n/grades";
import { tr8, type Locale } from "@/i18n/config";
import { Icon } from "@/components/Icon";

const text = {
  title: tr8("Najdi si procvičování", "Find your practice", "Finde Übungen", "Найди упражнения", "Знайди вправи", "練習を探す", "Encuentra ejercicios", "Trouve des exercices"),
  section: tr8("Oblast", "Section", "Bereich", "Раздел", "Розділ", "分野", "Sección", "Section"),
  grade: tr8("Ročník", "Grade", "Klasse", "Класс", "Клас", "学年", "Curso", "Classe"),
  subject: tr8("Předmět", "Subject", "Fach", "Предмет", "Предмет", "科目", "Asignatura", "Matière"),
  anyGrade: tr8("Všechny ročníky", "All grades", "Alle Klassen", "Все классы", "Усі класи", "すべての学年", "Todos los cursos", "Toutes les classes"),
  anySubject: tr8("Všechny předměty", "All subjects", "Alle Fächer", "Все предметы", "Усі предмети", "すべての科目", "Todas las asignaturas", "Toutes les matières"),
  go: tr8("Najít procvičování", "Find practice", "Übungen finden", "Найти упражнения", "Знайти вправи", "練習を探す", "Buscar ejercicios", "Trouver des exercices"),
};

type Option = { slug: string; label: string };

export function HomeQuickStart({ locale, categories, subjects }: { locale: Locale; categories: { slug: CategorySlug; label: string }[]; subjects: Option[] }) {
  const [category, setCategory] = useState<CategorySlug>("zakladni");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const query = new URLSearchParams();
  if (grade) query.set("trida", grade);
  if (subject) query.set("predmet", subject);
  const href = `/${locale}/kurzy/${category}${query.size ? `?${query}` : ""}${subject ? "#vyber-kurzu" : ""}`;
  const field = "home-finder-select";
  const selectedSubject = subjects.find((item) => item.slug === subject);

  return (
    <div className="home-finder" role="group" aria-label={text.title[locale]}>
      <h2>{text.title[locale]}</h2>
      <div className="home-finder-fields">
        <label>
          <span>{text.section[locale]}</span>
          <select className={field} value={category} onChange={(event) => { setCategory(event.target.value as CategorySlug); setGrade(""); }}>
            {categories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
          </select>
        </label>
        {GRADES[category].length > 0 && (
          <label>
            <span>{text.grade[locale]}</span>
            <select className={field} value={grade} onChange={(event) => setGrade(event.target.value)}>
              <option value="">{text.anyGrade[locale]}</option>
              {GRADES[category].map((n) => <option key={n} value={n}>{gradeLabel(locale, category, n)}</option>)}
            </select>
          </label>
        )}
        <label>
          <span>{text.subject[locale]}</span>
          <select className={field} value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="">{text.anySubject[locale]}</option>
            {subjects.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div className="home-finder-route" data-selected={!!subject} aria-hidden="true">
        <span key={subject || "empty"} className="home-finder-route-icon">{selectedSubject && <Icon name={subject} size={30} />}</span>
        <svg viewBox="0 0 220 32" preserveAspectRatio="none"><path key={subject || "empty"} d="M 2 17 C 60 -4, 100 38, 158 17 S 200 16, 218 16" /></svg>
        <span className="home-finder-route-destination">★</span>
      </div>
      <Link href={href} className="btn-bouncy btn-primary home-finder-go" onClick={() => { if (subject) sessionStorage.setItem("course-subject-arrival", subject); }}>{text.go[locale]} <span aria-hidden>→</span></Link>
    </div>
  );
}
