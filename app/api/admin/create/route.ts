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

    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });

    const argon2 = (await import("argon2")).default;
    const passwordHash = await argon2.hash(password);

    await prisma.user.create({ data: { email, passwordHash, role: "ADMIN" as any } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
