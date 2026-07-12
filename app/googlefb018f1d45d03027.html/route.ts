import { NextResponse } from "next/server";

/** Google Search Console ownership verification */
export function GET() {
  return new NextResponse("google-site-verification: googlefb018f1d45d03027.html\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
