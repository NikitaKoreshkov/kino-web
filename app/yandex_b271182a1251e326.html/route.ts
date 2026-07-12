import { NextResponse } from "next/server";

/** Yandex Webmaster ownership verification */
export function GET() {
  const html = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: b271182a1251e326</body>
</html>
`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
