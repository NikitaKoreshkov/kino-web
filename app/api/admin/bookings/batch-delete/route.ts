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

    const { ids } = await req.json().catch(() => ({}));
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }

    const result = await prisma.booking.deleteMany({ where: { id: { in: ids as string[] } } });
    return NextResponse.json({ ok: true, count: result.count });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
