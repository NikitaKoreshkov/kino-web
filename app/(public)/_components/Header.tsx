"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { getTexts } from "../../i18n";
import dynamic from "next/dynamic";
// Dynamic WebGL overlay (no SSR)
const LiquidFXWrapper = dynamic(() => import("./LiquidGlassFX.client"), { ssr: false, loading: () => null });
import { useTheme } from "../../theme";
import { useLang } from "../../lang";

// Display font for the logo (choose from front/fonts)
const LogoFont = localFont({
  src: "../../../../front/fonts/QurovaDEMO-Bold-BF67a5c637eed62.otf",
  display: "swap",
});

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], display: "swap" });

// theme handled by global hook in ../../theme

// language handled by global hook in ../../lang

const navIds = [
  { key: "about" as const, href: "/about#about" },
  { key: "events" as const, href: "/#events" },
  { key: "help" as const, href: "/about#help" },
  { key: "features" as const, href: "/about#features" },
];

export default function Header({ ssrLang, ssrTheme }: { ssrLang?: "ru" | "en"; ssrTheme?: "light" | "dark" }) {
  const { theme, toggle: toggleTheme } = useTheme(ssrTheme);
  const { lang, toggle: toggleLang } = useLang(ssrLang ?? "ru");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [animatingTheme, setAnimatingTheme] = useState(false);
  const [flyingLang, setFlyingLang] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [langReady, setLangReady] = useState(false); // включаем переходы только после первого рендера
  const firstLangEffect = useRef(true);
  const headerElRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const [overlayTop, setOverlayTop] = useState<number>(84);
  const [closing, setClosing] = useState(false);
  const scrollLockY = useRef(0);
  const [portalReady, setPortalReady] = useState(false);
  const [menuPadLeft, setMenuPadLeft] = useState(16);
  const [extraTop, setExtraTop] = useState(0); // platform-specific bump (iOS in-app)
  const [safeInsetTop, setSafeInsetTop] = useState(0); // from CSS env(safe-area-inset-top)
  const [headerTop, setHeaderTop] = useState(12); // dynamic top offset accounting for viewport/safe-area

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dynamically adjust header top using visualViewport (works in iOS in-app browsers) + CSS safe-area
  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const compute = () => {
      const vvTop = vv?.offsetTop ?? 0; // distance from layout viewport to visual viewport
      // base 12px + measured safe-area + platform bump + visualViewport offset
      let t = 12 + Math.max(0, Math.round(safeInsetTop)) + Math.max(0, Math.round(extraTop)) + Math.max(0, Math.round(vvTop));
      // On iOS in-app contexts the status bar is ~44px; ensure a sensible minimum
      if (extraTop > 0) t = Math.max(t, 44);
      setHeaderTop(t);
    };
    compute();
    vv?.addEventListener('resize', compute, { passive: true } as any);
    vv?.addEventListener('scroll', compute, { passive: true } as any);
    window.addEventListener('orientationchange', compute, { passive: true } as any);
    return () => {
      vv?.removeEventListener('resize', compute as any);
      vv?.removeEventListener('scroll', compute as any);
      window.removeEventListener('orientationchange', compute as any);
    };
  }, [extraTop, safeInsetTop]);

  useEffect(() => { setMounted(true); setPortalReady(true); }, []);

  // Detect iOS in-app browsers (Google App GSA, Chrome CriOS, Firefox FxiOS, Edge EdgiOS, DDG, etc.)
  // and add extra bump. Also measure CSS env(safe-area-inset-top).
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isIOS = /iP(hone|od|ad)/.test(ua) || (/Mac/.test(ua) && typeof (window as any).ontouchend !== 'undefined');
    const isInApp = /\bGSA\b|CriOS|FxiOS|EdgiOS|DuckDuckGo|YaBrowser|Vivaldi/i.test(ua) || (!/Safari\//.test(ua) && /Mobile\//.test(ua));
    if (isIOS && isInApp) {
      setExtraTop(24); // base bump for in-app browsers (combined with safe-area and vv offset)
      try { document.documentElement.setAttribute('data-googleapp', 'true'); } catch {}
    }
    // Measure CSS env(safe-area-inset-top)
    try {
      const probe = document.createElement('div');
      probe.style.position = 'fixed';
      probe.style.top = '0';
      probe.style.left = '0';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      probe.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.appendChild(probe);
      const val = parseFloat(getComputedStyle(probe).paddingTop || '0');
      setSafeInsetTop(isFinite(val) ? val : 0);
      probe.remove();
    } catch {}
  }, []);

  // Lock page scroll while menu is open or during closing animation
  const wasLockedRef = useRef(false);
  useEffect(() => {
    const shouldLock = open || closing;
    const docEl = document.documentElement;
    const body = document.body as HTMLBodyElement;
    if (shouldLock) {
      scrollLockY.current = window.scrollY;
      body.style.position = 'fixed';
      body.style.top = `-${scrollLockY.current}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      docEl.style.overflow = 'hidden';
      (docEl as any).style.touchAction = 'none';
    } else {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      docEl.style.overflow = '';
      (docEl as any).style.touchAction = '';
      // Only restore scroll when we actually unlock (avoid initial mount jump)
      if (wasLockedRef.current) {
        window.scrollTo(0, scrollLockY.current || 0);
      }
    }
    wasLockedRef.current = shouldLock;
    return () => {
      // cleanup on unmount
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      docEl.style.overflow = '';
      (docEl as any).style.touchAction = '';
    };
  }, [open, closing]);

  // Scale при любом изменении языка (в обе стороны)
  useEffect(() => {
    // Пропускаем первый запуск, чтобы не было анимации при гидратации
    if (firstLangEffect.current) {
      firstLangEffect.current = false;
      return;
    }
    setFlyingLang(true);
    const t = setTimeout(() => setFlyingLang(false), 240);
    return () => clearTimeout(t);
  }, [lang]);

  useEffect(() => {
    // Включаем transition для pill только после монтирования
    setLangReady(true);
  }, []);

  // Glass classes
  const glass = useMemo(
    () =>
      `backdrop-blur-xl transition-colors duration-300 ` +
      (scrolled
        ? "shadow-[0_1px_0_rgba(0,0,0,0.08)_inset,0_14px_44px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.35)]"
        : "shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_12px_36px_rgba(0,0,0,0.10)]")
    , [scrolled]);

  const t = getTexts(lang);
  // Duplicate simple overflow lock removed to avoid conflicts with full-page lock

  useEffect(() => {
    const updateTop = () => {
      const el = headerElRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setOverlayTop(Math.ceil(rect.bottom));
    };
    updateTop();
    window.addEventListener('resize', updateTop, { passive: true });
    window.addEventListener('scroll', updateTop, { passive: true });
    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop);
    };
  }, [open]);

  // Align menu content exactly under the logo by matching left offset
  useEffect(() => {
    if (!(open || closing)) return;
    const calcPad = () => {
      const el = logoRef.current;
      if (!el) return;
      const left = Math.round(el.getBoundingClientRect().left);
      setMenuPadLeft(left);
    };
    calcPad();
    window.addEventListener('resize', calcPad, { passive: true });
    return () => window.removeEventListener('resize', calcPad);
  }, [open, closing]);

  return (
    <header
      ref={headerElRef}
      className={`siteHeader fixed left-0 right-0 z-[2147483647] ${montserrat.className} ${open ? 'menu-open' : ''}`}
      style={{ top: `${headerTop}px` }}
      suppressHydrationWarning
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
        <div
          className={`headerPanel liquidGlass mt-3 border ${glass} transition-[border-radius] duration-300 ${open ? 'rounded-none open' : 'rounded-2xl'}`}
          style={open ? ({ ['--panel-top' as any]: `${overlayTop}px` } as React.CSSProperties) : undefined}
          suppressHydrationWarning
        >
          {/* WebGL liquid highlights overlay (dynamic import to avoid SSR) */}
          {mounted && (
            <LiquidFXWrapper />
          )}
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left: Logo */}
            <Link ref={logoRef} href="/" className="select-none focus:outline-none" prefetch={false}>
              <span
                className={`${LogoFont.className} text-[19px] sm:text-[21px] tracking-wide transition-transform`} 
                style={{ color: "var(--header-foreground)", textShadow: "0 1px 2px rgba(0,0,0,0.12)", display: "inline-block" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Show Sochi
              </span>
            </Link>

            {/* Center: Nav (visible only on ≥1024px) */}
            <nav className="desktopNav hidden lg:flex items-center gap-7 lg:gap-9">
              {navIds.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group relative text-[16px] font-medium text-[var(--muted-foreground)] dark:text-[var(--foreground)] opacity-90 transition-all duration-200 tracking-[0.1px] hover:tracking-[0.6px] hover:text-[var(--header-foreground)] hover:opacity-100"
                >
                  <span className="inline-block">{t.nav[item.key]}</span>
                  {/* underline */}
                  <span className="pointer-events-none absolute left-0 -bottom-1 h-[3px] w-0 bg-gradient-to-r from-[#8591F5] via-[#9CA7FF] to-[#8591F5] transition-[width] duration-250 ease-out group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right: Theme + Lang + Burger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme toggle */}
              <button
                /* hidden on <lg */
                className="hidden lg:grid relative h-9 w-9 rounded-2xl place-items-center border backdrop-blur-sm transition-colors overflow-hidden"
                aria-label={t.aria.theme}
                onClick={() => {
                  if (animatingTheme) return;
                  setAnimatingTheme(true);
                  // Toggle immediately for instant visual feedback; animation handled via classes
                  toggleTheme();
                  setTimeout(() => setAnimatingTheme(false), 360);
                }}
                style={{ background: "var(--control-glass-bg)", borderColor: "var(--control-glass-border)" }}
                title="Theme"
              >
                {/* animated swap */}
                <span className={`absolute inset-0 grid place-items-center transition-all duration-300 iconPad ${theme === "light" ? (animatingTheme ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100") : "opacity-0 rotate-90 scale-75"} sun`} suppressHydrationWarning>
                  {/* Sun */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V2M12 22v-2M4.93 4.93L3.52 3.52M20.48 20.48l-1.41-1.41M22 12h-2M4 12H2M19.07 4.93l1.41-1.41M3.52 20.48l1.41-1.41M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className={`absolute inset-0 grid place-items-center transition-all duration-300 iconPad ${theme === "dark" ? (animatingTheme ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100") : "opacity-0 -rotate-90 scale-75"} moon`} suppressHydrationWarning>
                  {/* Moon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <style jsx>{`
                  .iconPad { margin-left: 0px; }
                  :global(.siteHeader) [title="Theme"] .sun { color: var(--icon-sun); }
                  :global(.siteHeader) [title="Theme"] .moon { color: var(--icon-moon);          }
                `}</style>
              </button>

              {/* Lang switch with bounce & glass highlights */}
              <div
                /* hidden on <lg */
                className="hidden lg:block langSwitch relative h-9 w-[144px] rounded-full border backdrop-blur-md text-sm font-medium overflow-hidden select-none"
                style={{
                  background: "var(--control-glass-bg)",
                  borderColor: "var(--control-glass-border)",
                  WebkitBackdropFilter: "blur(12px)",
                  backdropFilter: "blur(12px)",
                }}
                suppressHydrationWarning
              >
                {/* sliding pill */}
                <div
                  className={`pill absolute top-1 left-1 h-[26px] rounded-full ${langReady ? 'animate' : ''} ${flyingLang ? "flying" : ""}`}
                  style={{
                    width: "calc(50% - 8px)",
                    transform: `${lang === 'en' ? 'translateX(calc(100% + 8px))' : 'translateX(0)'}${flyingLang ? ' scale(1.04)' : ''}`,
                    background: "var(--header-glass-bg)",
                    border: "1px solid var(--header-glass-border)",
                    boxShadow: theme === "light"
                      ? "0 10px 20px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.22) inset, inset 0 0 0 1px rgba(24,26,31,0.10)"
                      : "0 8px 18px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.10) inset",
                  }}
                  suppressHydrationWarning
                />
                <div className="relative z-10 grid grid-cols-2 h-full pl-0 pr-0">
                  <button onClick={() => lang !== "ru" && toggleLang()} className="w-full h-full flex items-center justify-center">
                    <span className={`${lang === "ru" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>RU</span>
                  </button>
                  <button onClick={() => lang !== "en" && toggleLang()} className="w-full h-full flex items-center justify-center">
                    <span className={`${lang === "en" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>EN</span>
                  </button>
                </div>
                {/* styled-jsx for spring and highlights */}
                <style jsx>{`
                  .pill { will-change: transform, box-shadow; pointer-events: none; isolation: isolate; background-clip: padding-box; contain: paint; mix-blend-mode: normal; }
                  :global(.langSwitch) { contain: paint; mix-blend-mode: normal; }
                  .pill.animate { transition: transform 240ms cubic-bezier(.16,1,.3,1), box-shadow 220ms ease; }
                  .pill.flying { /* transform handled inline to compose translate + scale */ }

                  /* Replace blend-mode screen with a soft highlight gradient for cross-browser parity */
                  .pill::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 9999px;
                    background: linear-gradient(180deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0.04) 100%);
                    pointer-events: none;
                  }
                  .pill::after { content: ""; position: absolute; inset: 1px; border-radius: 9999px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); pointer-events: none; }

                  /* Light theme: slightly darker base to avoid Safari over-brightening */
                  :global(html:not(.dark)) .pill {
                    background: rgba(34, 38, 46, 0.26) !important; /* stronger neutral base over light bg */
                    border: 1px solid rgba(24, 26, 31, 0.22) !important;
                    box-shadow: 0 8px 18px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(24,26,31,0.12) !important;
                  }
                  :global(html:not(.dark)) .pill::before { background: none !important; }

                  /* Light theme: container should be slightly darker and use smaller blur to avoid washing out */
                  :global(html:not(.dark)) .langSwitch {
                    background: rgba(34, 38, 46, 0.22) !important;
                    border-color: rgba(24, 26, 31, 0.18) !important;
                    -webkit-backdrop-filter: none !important;
                    backdrop-filter: none !important;
                    isolation: isolate;
                    background-clip: padding-box;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 18px rgba(0,0,0,0.08) !important;
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .pill.animate { transition: transform 180ms ease; }
                  }

                  /* Safari-only (html[data-safari]) keep control white, force dark text/icons */
                  :global(html[data-safari]:not(.dark)) .langSwitch {
                    background: #FFFFFF !important;
                    border-color: rgba(24,26,31,0.16) !important;
                    -webkit-backdrop-filter: none !important;
                    backdrop-filter: none !important;
                  }
                  :global(html[data-safari]:not(.dark)) .pill {
                    background: #FFFFFF !important;
                    border: 1px solid rgba(24,26,31,0.18) !important;
                    box-shadow: inset 0 0 0 1px rgba(24,26,31,0.10) !important;
                  }
                  :global(html[data-safari]) .langSwitch span { color: #16171B !important; opacity: 1 !important; }
                  /* Theme button icon color (Moon/Sun) */
                  :global(html[data-safari]) .siteHeader [title="Theme"] span { color: #16171B !important; }
                `}</style>
              </div>

              {/* Burger */}
              <button
                onClick={() => {
                  if (open) {
                    setClosing(true);
                    setTimeout(() => { setOpen(false); setClosing(false); }, 260);
                  } else {
                    setOpen(true);
                  }
                }}
                className={`burger lg:hidden h-9 w-9 rounded-2xl grid place-items-center relative overflow-hidden ${open ? 'is-open' : ''}`}
                style={{ ['--bx' as any]: '7px', color: 'var(--foreground)', background: 'transparent', border: '1px solid transparent' }}
                aria-label={open ? t.aria.burgerClose : t.aria.burgerOpen}
                title="Menu"
                suppressHydrationWarning
              >
                <span className="burger-line line-top" />
                <span className="burger-line line-mid" />
                <span className="burger-line line-bot" />
              </button>
            </div>
          </div>
          {/* Portaled mobile menu to body to avoid any clipping and guarantee edge-to-edge */}
          {(open || closing) && portalReady && typeof window !== 'undefined' && createPortal(
            <>
              {/* Background */}
              <div
                className="fixed inset-0 z-[2147483645] pointer-events-none transition-opacity duration-300"
                style={{
                  background: 'var(--menu-overlay-bg)',
                  opacity: 1,
                  // light theme glass effect
                  backdropFilter: theme === 'light' ? 'blur(18px)' : undefined,
                  WebkitBackdropFilter: theme === 'light' ? 'blur(18px)' : undefined,
                }}
                aria-hidden
              />
              {/* Scrollable content under header */}
              <div
                className={`lg:hidden fixed left-0 right-0 top-0 z-[2147483646] overflow-y-auto will-change-transform transition-[padding] duration-500 ease-[cubic-bezier(.16,1,.3,1)]`}
                style={{ height: '100dvh', paddingTop: overlayTop, paddingLeft: menuPadLeft, paddingRight: 16 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`pt-6 pb-6 header-grow ${closing ? 'closing' : 'open'}`}>
                  {/* Big nav list */}
                  <nav className="space-y-4">
                    {navIds.map((n, idx) => (
                      <a
                        key={n.href}
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="block text-[clamp(30px,5vw,36px)] leading-[1.18] font-medium tracking-[0.2px] opacity-0 translate-y-2 will-change-transform transition-all duration-300 ease-out hover:opacity-100"
                        style={{ color: 'var(--foreground)', transitionDelay: `${idx * 50}ms`, opacity: 1, transform: 'translateY(0)' }}
                      >
                        {t.nav[n.key]}
                      </a>
                    ))}
                  </nav>
                  {/* Controls row */}
                  <div className="mt-8 flex gap-2">
                    <button onClick={toggleTheme} className="h-10 px-4 rounded-full text-sm border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--foreground)' }}>{theme === 'light' ? t.theme.light : t.theme.dark}</button>
                    <button onClick={toggleLang} className="h-10 px-4 rounded-full text-sm border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--foreground)' }}>{lang.toUpperCase()}</button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>

      {/* External mobile overlay removed — header panel itself becomes modal */}
    </header>
  );
}
