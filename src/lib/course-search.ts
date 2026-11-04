// Hledání kurzů: porovnání bez velkých písmen a bez diakritiky („Frazémy“ najde „frazemy“).
export function normalizeSearchText(text: string): string {
  return text
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// Dotaz se porovná s názvem a popisem kurzu. Prázdný dotaz vyhovuje všem kurzům.
export function matchesCourseQuery(course: { title: string; description: string | null }, query: string): boolean {
  const needle = normalizeSearchText(query);
  if (!needle) return true;
  return normalizeSearchText(`${course.title} ${course.description ?? ""}`).includes(needle);
}
