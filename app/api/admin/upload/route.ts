import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_INPUT_BYTES = 40 * 1024 * 1024; // 40 MB raw upload
const MAX_EDGE = 2560;

function isImageMime(mime?: string, ext?: string) {
  if (mime?.startsWith("image/")) return true;
  const e = (ext || "").toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tif", ".tiff", ".heic", ".heif"].includes(e);
}

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
    if (arrayBuffer.byteLength > MAX_INPUT_BYTES) {
      return NextResponse.json({ error: "File too large (max 40MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

    const originalName = (file as any)?.name as string | undefined;
    let ext = originalName ? path.extname(originalName) : "";
    const mime: string | undefined = (file as any)?.type;
    if (!ext && mime) {
      const guess = mime.split("/")[1];
      if (guess) ext = `.${guess}`;
    }

    let outName: string;
    let outBuf: Buffer;

    if (isImageMime(mime, ext)) {
      // Optimize any size: auto-orient, max edge, WebP (keeps animated GIFs as-is)
      const lower = (ext || "").toLowerCase();
      if (lower === ".gif") {
        outName = `${randomUUID()}.gif`;
        outBuf = buffer;
      } else {
        outBuf = await sharp(buffer, { failOn: "none" })
          .rotate()
          .resize({
            width: MAX_EDGE,
            height: MAX_EDGE,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();
        outName = `${randomUUID()}.webp`;
      }
    } else {
      // Non-images (e.g. video) stored as uploaded
      outName = `${randomUUID()}${ext || ""}`;
      outBuf = buffer;
    }

    const fullPath = path.join(uploadsDir, outName);
    writeFileSync(fullPath, outBuf);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${outName}`,
      bytes: outBuf.length,
    });
  } catch (e: any) {
    console.error("/api/admin/upload error:", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
