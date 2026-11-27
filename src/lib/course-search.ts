// Hledání kurzů: porovnání bez velkých písmen a bez diakritiky („Frazémy“ najde „frazemy“).
export function normalizeSearchText(text: string): string {
  return text
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

type SearchableCourse = { title: string; description: string | null };

// Dotaz se normalizuje jednou pro celý seznam kurzů.
export function courseQueryFilter(query: string) {
  const needle = normalizeSearchText(query);
  return (course: SearchableCourse) =>
    !needle || normalizeSearchText(`${course.title} ${course.description ?? ""}`).includes(needle);
}

export function matchesCourseQuery(course: SearchableCourse, query: string): boolean {
  return courseQueryFilter(query)(course);
}
