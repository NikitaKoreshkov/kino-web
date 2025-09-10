import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

export const runtime = "nodejs"; // ensure Node fs available

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const requester = (session as any)?.user?.email as string | undefined;
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as unknown as File | Blob | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

    // Try to detect extension from original name or mime type
    // @ts-ignore name may exist on File only
    const originalName = (file as any)?.name as string | undefined;
    let ext = originalName ? path.extname(originalName) : "";
    if (!ext) {
      // @ts-ignore type may exist on Blob/File
      const mime: string | undefined = (file as any)?.type;
      if (mime) {
        const guess = mime.split("/")[1];
        if (guess) ext = `.${guess}`;
      }
    }
    const name = `${randomUUID()}${ext}`;
    const fullPath = path.join(uploadsDir, name);

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(fullPath);
      stream.on("error", reject);
      stream.on("finish", resolve);
      stream.end(buffer);
    });

    const url = `/uploads/${name}`;
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error("/api/admin/upload error:", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
