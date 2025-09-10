import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: вернуть все настройки (только для админки)
export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    const requester = (session as any)?.user?.email as string | undefined;
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.setting.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) result[s.key] = s.value as any;
    return NextResponse.json({ ok: true, settings: result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

// POST: сохранить набор настроек: { changes: { key: value, ... } }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const requester = (session as any)?.user?.email as string | undefined;
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { changes } = await req.json();
    if (!changes || typeof changes !== "object") {
      return NextResponse.json({ error: "changes object required" }, { status: 400 });
    }

    const entries = Object.entries(changes) as [string, any][];
    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    return NextResponse.json({ ok: true, count: entries.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
