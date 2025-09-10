import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import LangRefresher from "@/app/LangRefresher.client";
// ThemeToggle removed: admin runs in enforced dark theme

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Every moment — Event Agency",
    template: "%s | Every moment",
  },
  description: "Premium event experiences. Book unforgettable moments with our agency.",
  openGraph: {
    type: "website",
    url: "https://example.com",
    title: "Every moment — Event Agency",
    description: "Premium event experiences. Book unforgettable moments with our agency.",
    siteName: "Every moment",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Every moment — Event Agency",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Every moment — Event Agency",
    description: "Premium event experiences. Book unforgettable moments with our agency.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hdrs = await headers();
  const isProd = process.env.NODE_ENV === 'production';
  const nonce = isProd ? (hdrs.get('x-nonce') || undefined) : undefined;
  const themeCookie = cookieStore.get("theme")?.value;
  const theme = themeCookie === "dark" ? "dark" : "light";
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "ru";
  return (
    <html lang={lang} className={`${theme === 'dark' ? 'dark' : ''} notranslate`} translate="no" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="google" content="notranslate" />
        {nonce ? (
          <Script id="boot-theme-scroll" nonce={nonce} strategy="beforeInteractive" suppressHydrationWarning>{`
(function(){
  try {
    // Hardening: reduce React DevTools in production
    try {
      var isProd = ${process.env.NODE_ENV === 'production' ? 'true' : 'false'};
      if (isProd && typeof window !== 'undefined') {
        Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', { value: undefined, configurable: false, writable: false });
      }
    } catch(_) {}

    // Apply theme ASAP based on cookie/localStorage; default to light
    var next = (function(){
      try { var m = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/); if (m && (m[1]==='light'||m[1]==='dark')) return m[1]; } catch(_) {}
      try { var s = localStorage.getItem('theme'); if (s==='light'||s==='dark') return s; } catch(_) {}
      return '${theme}';
    })();
    var html = document.documentElement;
    html.classList.toggle('dark', next === 'dark');
    try { document.cookie = 'theme=' + next + '; Path=/; Max-Age=31536000; SameSite=Lax'; } catch(_){ }

    // Detect Safari (exclude Chrome/Android) and mark html
    var ua = navigator.userAgent;
    var isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua) && !/Android/.test(ua);
    if (isSafari) { html.setAttribute('data-safari', '1'); }

    // Scroll restoration: preserve scroll on hard reloads only (deterministic)
    try {
      var KEY = 'scroll-pos:' + location.pathname + location.search;
      var navType = (function(){
        try { var n = (performance && performance.getEntriesByType) ? performance.getEntriesByType('navigation') : null; if (n && n[0] && n[0].type) return n[0].type; } catch(_) {}
        var pn = performance && performance.navigation; if (pn && pn.type === 1) return 'reload'; return 'navigate';
      })();
      if (navType === 'reload' && 'scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
      if (navType === 'reload') {
        try {
          var raw0 = sessionStorage.getItem(KEY);
          var y0 = raw0 != null ? parseFloat(raw0) : NaN;
          if (Number.isFinite(y0) && y0 > 0) {
            var prevSB = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, y0);
            setTimeout(function(){ document.documentElement.style.scrollBehavior = prevSB || ''; }, 200);
          }
        } catch(_) {}
      }
      var restore = function(e){
        var raw = sessionStorage.getItem(KEY); var hasSaved = !!raw; var isBfcache = !!(e && (e).persisted);
        if (!(navType === 'reload' || (hasSaved && !isBfcache))) return; if (!raw) return; var y = parseFloat(raw); if (!Number.isFinite(y)) return;
        var attempts = [0, 40, 120, 240, 420];
        attempts.forEach(function(ms){ setTimeout(function(){ var p2 = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,y); document.documentElement.style.scrollBehavior = p2 || ''; }, ms); });
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ var p3 = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,y); document.documentElement.style.scrollBehavior = p3 || ''; }); });
      };
      window.addEventListener('pageshow', function(e){ restore(e); });
      window.addEventListener('load', function(e){ restore(e); });
      var save = function(){ try { sessionStorage.setItem(KEY, String(window.scrollY || 0)); } catch(_) {} };
      window.addEventListener('beforeunload', save);
      window.addEventListener('pagehide', save);
      document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') save(); });
      var saveT = 0;
      window.addEventListener('scroll', function(){ clearTimeout(saveT); saveT = setTimeout(save, 120); }, { passive: true });
    } catch(_) {}
  } catch(e) {}
})();
          `}</Script>
        ) : (
          <Script id="boot-theme-scroll" strategy="beforeInteractive" suppressHydrationWarning>{`
(function(){
  try {
    // Hardening: reduce React DevTools in production
    try {
      var isProd = ${process.env.NODE_ENV === 'production' ? 'true' : 'false'};
      if (isProd && typeof window !== 'undefined') {
        Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', { value: undefined, configurable: false, writable: false });
      }
    } catch(_) {}

    // Apply theme ASAP based on cookie/localStorage; default to light
    var next = (function(){
      try { var m = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/); if (m && (m[1]==='light'||m[1]==='dark')) return m[1]; } catch(_) {}
      try { var s = localStorage.getItem('theme'); if (s==='light'||s==='dark') return s; } catch(_) {}
      return '${theme}';
    })();
    var html = document.documentElement;
    html.classList.toggle('dark', next === 'dark');
    try { document.cookie = 'theme=' + next + '; Path=/; Max-Age=31536000; SameSite=Lax'; } catch(_){ }

    // Detect Safari (exclude Chrome/Android) and mark html
    var ua = navigator.userAgent;
    var isSafari = /Safari\\//.test(ua) && !/Chrome\\//.test(ua) && !/Chromium\\//.test(ua) && !/Android/.test(ua);
    if (isSafari) { html.setAttribute('data-safari', '1'); }

    // Scroll restoration: preserve scroll on hard reloads only (deterministic)
    try {
      var KEY = 'scroll-pos:' + location.pathname + location.search;
      var navType = (function(){
        try { var n = (performance && performance.getEntriesByType) ? performance.getEntriesByType('navigation') : null; if (n && n[0] && n[0].type) return n[0].type; } catch(_) {}
        var pn = performance && performance.navigation; if (pn && pn.type === 1) return 'reload'; return 'navigate';
      })();
      if (navType === 'reload' && 'scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
      if (navType === 'reload') {
        try {
          var raw0 = sessionStorage.getItem(KEY);
          var y0 = raw0 != null ? parseFloat(raw0) : NaN;
          if (Number.isFinite(y0) && y0 > 0) {
            var prevSB = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, y0);
            setTimeout(function(){ document.documentElement.style.scrollBehavior = prevSB || ''; }, 200);
          }
        } catch(_) {}
      }
      var restore = function(e){
        var raw = sessionStorage.getItem(KEY); var hasSaved = !!raw; var isBfcache = !!(e && (e).persisted);
        if (!(navType === 'reload' || (hasSaved && !isBfcache))) return; if (!raw) return; var y = parseFloat(raw); if (!Number.isFinite(y)) return;
        var attempts = [0, 40, 120, 240, 420];
        attempts.forEach(function(ms){ setTimeout(function(){ var p2 = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,y); document.documentElement.style.scrollBehavior = p2 || ''; }, ms); });
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ var p3 = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,y); document.documentElement.style.scrollBehavior = p3 || ''; }); });
      };
      window.addEventListener('pageshow', function(e){ restore(e); });
      window.addEventListener('load', function(e){ restore(e); });
      var save = function(){ try { sessionStorage.setItem(KEY, String(window.scrollY || 0)); } catch(_) {} };
      window.addEventListener('beforeunload', save);
      window.addEventListener('pagehide', save);
      document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') save(); });
      var saveT = 0;
      window.addEventListener('scroll', function(){ clearTimeout(saveT); saveT = setTimeout(save, 120); }, { passive: true });
    } catch(_) {}
  } catch(e) {}
})();
          `}</Script>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Client helper: refresh server components on language change without full reload */}
        <LangRefresher />
        {children}
      </body>
    </html>
  );
}
