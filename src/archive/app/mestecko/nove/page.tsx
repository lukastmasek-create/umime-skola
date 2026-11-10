import { redirect } from "next/navigation";

// Dřívější adresa nového 3D městečka; teď je na /mestecko.
export default async function NewTownRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/mestecko`);
}
