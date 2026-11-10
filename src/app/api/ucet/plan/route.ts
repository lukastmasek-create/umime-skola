import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPro } from "@/lib/pro-server";

// GET: má přihlášený účet aktivní PRO předplatné (vlastní, rodinné nebo školní)?
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });
  const pro = await hasPro(userId).catch(() => null);
  return NextResponse.json({ loggedIn: true, pro });
}
