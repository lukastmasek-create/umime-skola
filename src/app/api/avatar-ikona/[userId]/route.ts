import { readAvatarIcon } from "@/lib/avatar-icon";

// Vlastní ikonka avatara hráče (snímek přebarvené postavy). Adresa nese verzi, takže se smí cachovat dlouho.
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const img = await readAvatarIcon(userId).catch(() => null);
  if (!img) return new Response(null, { status: 404 });
  const [head, b64] = img.split(",");
  const type = head.slice(5, head.indexOf(";"));
  return new Response(Buffer.from(b64, "base64"), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
