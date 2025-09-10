import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// --- Simple in-memory rate limiter (per process) ---
// Limits POST attempts to /api/auth/* (login) to max N attempts per window per IP.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 10; // max attempts per window
type Hit = { ts: number };
const rateStore = new Map<string, Hit[]>();

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  const ip = xf?.split(',')[0]?.trim() || (req as any).ip || req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = rateStore.get(key) || [];
  // drop old
  const fresh = hits.filter(h => now - h.ts < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX) {
    rateStore.set(key, fresh);
    return true;
  }
  fresh.push({ ts: now });
  rateStore.set(key, fresh);
  return false;
}

export const config = {
  // Apply to all routes so we can set security headers/CSP globally
  matcher: ["/:path*"],
};

function genNonce(): string {
  // 128-bit random nonce, base64
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  let s = '';
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
  // btoa is available in Edge runtime
  return btoa(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProd = process.env.NODE_ENV === 'production';
  const nonce = isProd ? genNonce() : undefined;

  // Prepare response baseline; in prod forward nonce, in dev keep headers intact to avoid hydration/CSP issues with Next dev overlay
  const res = nonce
    ? NextResponse.next({
        request: { headers: new Headers({ ...Object.fromEntries(req.headers), 'x-nonce': nonce }) },
      })
    : NextResponse.next();

  // 1) Rate limit login attempts
  if (pathname.startsWith('/api/auth') && req.method === 'POST') {
    const ip = getClientIp(req);
    const key = `auth:${ip}`;
    if (isRateLimited(key)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // 2) Protect /admin/* routes (but allow /admin/login)
  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) {
      // continue
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  // 3) Security headers including strict CSP with nonce (production only)
  if (isProd && nonce) {
    const csp = [
      "default-src 'self'",
      "img-src 'self' https: data: blob:",
      "media-src 'self' https: data: blob:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      `connect-src 'self' https:`,
      "frame-src 'self' https:",
      "child-src 'self' https:",
      "frame-ancestors 'self'",
    ].join('; ');

    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  } else {
    // In development, still set some basic but permissive headers to not interfere with Next dev overlay
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  return res;
}
