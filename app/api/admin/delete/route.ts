import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const requester = (session as any)?.user?.email as string | undefined;
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const superEmail = process.env.SUPERADMIN_EMAIL;
    if (!superEmail) return NextResponse.json({ error: "SUPERADMIN_EMAIL not set" }, { status: 500 });
    if (requester !== superEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    if (email === superEmail) return NextResponse.json({ error: "Нельзя удалить супер-админа" }, { status: 400 });

    await prisma.user.delete({ where: { email } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
