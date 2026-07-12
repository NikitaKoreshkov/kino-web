"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getTexts } from "../../i18n";
import { useTheme } from "../../theme";
import { useLang } from "../../lang";
import GlassPanelShell from "./GlassPanelShell";
import {
  scrollAboutTo,
  stashAboutScrollTarget,
  stashHomeScrollTarget,
} from "../_lib/aboutScroll";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700"], display: "swap" });

const navIds = [
  { key: "about" as const, href: "/about#about" },
  { key: "events" as const, href: "/#events" },
  { key: "help" as const, href: "/about#help" },
  { key: "features" as const, href: "/about#features" },
];

function parseAboutHash(href: string): string | null {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/about") return null;
    const id = u.hash.replace(/^#/, "");
    return id || null;
  } catch {
    return null;
  }
}

function parseHomeHash(href: string): string | null {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/") return null;
    const id = u.hash.replace(/^#/, "");
    return id || null;
  } catch {
    return null;
  }
}

export default function Header({ ssrLang, ssrTheme }: { ssrLang?: "ru" | "en"; ssrTheme?: "light" | "dark" }) {
  const { theme, toggle: toggleTheme } = useTheme(ssrTheme);
  const { lang, toggle: toggleLang } = useLang(ssrLang ?? "ru");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [langReady, setLangReady] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const headerElRef = useRef<HTMLElement | null>(null);
  const scrollLockY = useRef(0);
  const wasLockedRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Light theme: pure-black header chrome while over the home video hero
  const [overHomeHero, setOverHomeHero] = useState(() => pathname === "/");

  useEffect(() => {
    setPortalReady(true);
    setLangReady(true);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setOverHomeHero(false);
      return;
    }

    let io: IntersectionObserver | null = null;
    let cancelled = false;
    let tries = 0;
    let onScrollOrResize: (() => void) | null = null;

    const attach = () => {
      if (cancelled) return;
      const hero = document.getElementById("home-hero") ?? document.querySelector(".heroFold");
      if (!hero) {
        if (tries++ < 40) requestAnimationFrame(attach);
        else setOverHomeHero(true);
        return;
      }

      const update = () => {
        const rect = hero.getBoundingClientRect();
        const headerBand = 96;
        setOverHomeHero(rect.bottom > headerBand && rect.top < headerBand);
      };

      onScrollOrResize = update;
      update();
      io = new IntersectionObserver(update, {
        threshold: [0, 0.01, 0.05, 0.1, 0.25, 0.5, 1],
      });
      io.observe(hero);
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update, { passive: true });
    };

    attach();

    return () => {
      cancelled = true;
      io?.disconnect();
      if (onScrollOrResize) {
        window.removeEventListener("scroll", onScrollOrResize);
        window.removeEventListener("resize", onScrollOrResize);
      }
    };
  }, [pathname]);

  const closeMenu = () => {
    if (!open || closing) return;
    setClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, 520);
  };

  const openMenu = () => {
    if (closing) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setClosing(false);
    setOpen(true);
  };

  const toggleMenu = () => {
    if (open) closeMenu();
    else openMenu();
  };

  const onAboutNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const aboutId = parseAboutHash(href);
    const homeId = parseHomeHash(href);

    if (homeId) {
      e.preventDefault();
      closeMenu();

      if (pathname === "/") {
        window.history.pushState(null, "", `/#${homeId}`);
        scrollAboutTo(homeId, "smooth");
        return;
      }

      stashHomeScrollTarget(homeId);
      router.push(`/#${homeId}`, { scroll: false });
      return;
    }

    if (!aboutId) return;

    e.preventDefault();
    closeMenu();

    const onAbout = pathname === "/about";

    if (onAbout) {
      if (aboutId === "about" && window.scrollY < 40) {
        if (window.location.hash !== "#about") {
          window.history.replaceState(null, "", "/about#about");
        }
        return;
      }
      window.history.pushState(null, "", `/about#${aboutId}`);
      scrollAboutTo(aboutId, "smooth");
      return;
    }

    stashAboutScrollTarget(aboutId);
    router.push(`/about#${aboutId}`, { scroll: false });
  };

  // Lock page scroll while menu is open or during closing animation
  useEffect(() => {
    const shouldLock = open || closing;
    const docEl = document.documentElement;
    const body = document.body as HTMLBodyElement;
    if (shouldLock) {
      scrollLockY.current = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollLockY.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      docEl.style.overflow = "hidden";
      (docEl as HTMLElement).style.touchAction = "none";
    } else {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      docEl.style.overflow = "";
      (docEl as HTMLElement).style.touchAction = "";
      if (wasLockedRef.current) {
        window.scrollTo(0, scrollLockY.current || 0);
      }
    }
    wasLockedRef.current = shouldLock;
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      docEl.style.overflow = "";
      (docEl as HTMLElement).style.touchAction = "";
    };
  }, [open, closing]);

  // Close on Escape
  useEffect(() => {
    if (!(open || closing)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closing]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
    setClosing(false);
  }, [pathname]);

  const glass = "backdrop-blur-xl transition-colors duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.10)]";
  const t = getTexts(lang);
  const menuVisible = open || closing;

  return (
    <header
      ref={headerElRef}
      className={`siteHeader fixed left-0 right-0 z-[2147483647] ${montserrat.className} ${open || closing ? "menu-open" : ""} ${overHomeHero ? "siteHeader--overHomeHero" : ""}`}
      suppressHydrationWarning
    >
      <div className="siteHeader__inner mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div
          className={`headerPanel liquidGlass mt-2 sm:mt-3 border border-[color:var(--header-glass-border)] ${glass} rounded-2xl`}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 px-3 sm:px-4">
            {/* Left: Logo */}
            <Link href="/" className="select-none focus:outline-none shrink-0" prefetch={false}>
              <span
                className={`${montserrat.className} font-bold uppercase text-[17px] sm:text-[19px] lg:text-[21px] tracking-wide`}
                style={{ color: "var(--header-foreground)", textShadow: "0 1px 2px rgba(0,0,0,0.12)", display: "inline-block" }}
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
                  onClick={(e) => onAboutNavClick(e, item.href)}
                  className="group relative text-[16px] font-semibold text-[var(--header-foreground)] transition-all duration-200 tracking-[0.1px] hover:tracking-[0.6px] hover:opacity-100"
                >
                  <span className="inline-block">{t.nav[item.key]}</span>
                  <span className="pointer-events-none absolute left-0 -bottom-1 h-px w-0 bg-gradient-to-r from-[#8591F5] via-[#9CA7FF] to-[#8591F5] transition-[width] duration-250 ease-out group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right: Theme + Lang + Burger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme toggle */}
              <GlassPanelShell
                as="button"
                className="hidden lg:grid relative h-9 w-9 rounded-2xl place-items-center backdrop-blur-sm transition-colors overflow-hidden themeToggleBtn"
                aria-label={t.aria.theme}
                onClick={toggleTheme}
                style={{ background: "var(--control-glass-bg)" }}
                title="Theme"
                data-theme={theme}
                suppressHydrationWarning
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="themeToggleIcon relative z-10"
                  aria-hidden="true"
                >
                  <g className="themeToggleIcon__sun">
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 4V2M12 22v-2M4.93 4.93L3.52 3.52M20.48 20.48l-1.41-1.41M22 12h-2M4 12H2M19.07 4.93l1.41-1.41M3.52 20.48l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                  <path
                    className="themeToggleIcon__moon"
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <style jsx>{`
                  :global(.themeToggleBtn) { color: var(--icon-sun); }
                  :global(.themeToggleBtn[data-theme="dark"]) { color: var(--icon-moon); }
                  .themeToggleIcon { overflow: visible; }
                  .themeToggleIcon__sun,
                  .themeToggleIcon__moon {
                    transform-box: fill-box;
                    transform-origin: center;
                    transition:
                      opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.52s cubic-bezier(0.34, 1.15, 0.64, 1);
                  }
                  .themeToggleIcon__sun { opacity: 1; transform: rotate(0deg) scale(1); }
                  .themeToggleIcon__moon { opacity: 0; transform: rotate(28deg) scale(0.55); }
                  :global(.themeToggleBtn[data-theme="dark"]) .themeToggleIcon__sun {
                    opacity: 0;
                    transform: rotate(-28deg) scale(0.55);
                  }
                  :global(.themeToggleBtn[data-theme="dark"]) .themeToggleIcon__moon {
                    opacity: 1;
                    transform: rotate(0deg) scale(1);
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .themeToggleIcon__sun,
                    .themeToggleIcon__moon {
                      transition: opacity 0.15s ease;
                      transform: none !important;
                    }
                  }
                  :global(html[data-safari] .siteHeader:not(.siteHeader--overHomeHero) .themeToggleBtn) { color: #16171B !important; }
                  :global(html[data-safari] .siteHeader--overHomeHero .themeToggleBtn) { color: #000000 !important; }
                `}</style>
              </GlassPanelShell>

              {/* Lang switch */}
              <GlassPanelShell
                as="div"
                className={`hidden lg:block langSwitch relative h-9 w-[144px] rounded-full backdrop-blur-md text-sm font-semibold overflow-hidden select-none ${langReady ? "langSwitch--ready" : ""}`}
                data-lang={lang}
                style={{
                  background: "var(--control-glass-bg)",
                  WebkitBackdropFilter: "blur(12px)",
                  backdropFilter: "blur(12px)",
                }}
                suppressHydrationWarning
              >
                <div className="pill" aria-hidden="true" />
                <div className="relative z-10 grid grid-cols-2 h-full">
                  <button
                    type="button"
                    onClick={() => lang !== "ru" && toggleLang()}
                    className="langBtn w-full h-full flex items-center justify-center"
                    aria-pressed={lang === "ru"}
                  >
                    <span className="langLabel langLabel--ru">RU</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => lang !== "en" && toggleLang()}
                    className="langBtn w-full h-full flex items-center justify-center"
                    aria-pressed={lang === "en"}
                  >
                    <span className="langLabel langLabel--en">EN</span>
                  </button>
                </div>
                <style jsx>{`
                  :global(.langSwitch) {
                    contain: paint;
                    isolation: isolate;
                  }
                  .pill {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    z-index: 3;
                    width: calc(50% - 8px);
                    height: 26px;
                    border-radius: 9999px;
                    pointer-events: none;
                    will-change: transform, box-shadow;
                    background: var(--header-glass-bg);
                    border: 1px solid var(--header-glass-border);
                    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
                    transform: translate3d(0, 0, 0);
                  }
                  :global(.langSwitch[data-lang="en"]) .pill {
                    transform: translate3d(calc(100% + 8px), 0, 0);
                  }
                  :global(.langSwitch--ready) .pill {
                    transition: transform 0.56s cubic-bezier(0.34, 1.18, 0.64, 1);
                  }
                  .langBtn { position: relative; z-index: 10; }
                  .langLabel {
                    display: inline-block;
                    transform-origin: center;
                    letter-spacing: 0.04em;
                    color: var(--muted-foreground);
                    opacity: 0.52;
                    transform: translate3d(0, 1px, 0) scale(0.92);
                  }
                  :global(.langSwitch--ready) .langLabel {
                    transition:
                      color 0.42s ease,
                      opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.56s cubic-bezier(0.34, 1.18, 0.64, 1);
                  }
                  :global(.langSwitch[data-lang="ru"]) .langLabel--ru,
                  :global(.langSwitch[data-lang="en"]) .langLabel--en {
                    color: var(--foreground);
                    opacity: 1;
                    transform: translate3d(0, 0, 0) scale(1);
                  }
                  @media (prefers-reduced-motion: reduce) {
                    :global(.langSwitch--ready) .pill,
                    :global(.langSwitch--ready) .langLabel {
                      transition-duration: 0.15s;
                    }
                    .langLabel { transform: none; }
                  }
                  :global(html:not(.dark)) .pill {
                    background: rgba(34, 38, 46, 0.26) !important;
                    border: 1px solid rgba(24, 26, 31, 0.22) !important;
                    box-shadow: 0 8px 18px rgba(0,0,0,0.12) !important;
                  }
                  :global(html:not(.dark) .langSwitch) {
                    background: rgba(34, 38, 46, 0.22) !important;
                    -webkit-backdrop-filter: none !important;
                    backdrop-filter: none !important;
                    box-shadow: none !important;
                  }
                  :global(html[data-safari]:not(.dark) .langSwitch) {
                    background: #FFFFFF !important;
                    -webkit-backdrop-filter: none !important;
                    backdrop-filter: none !important;
                  }
                  :global(html[data-safari]:not(.dark)) .pill {
                    background: #FFFFFF !important;
                    border: 1px solid rgba(24,26,31,0.18) !important;
                    box-shadow: inset 0 0 0 1px rgba(24,26,31,0.10) !important;
                  }
                  :global(html[data-safari] .siteHeader:not(.siteHeader--overHomeHero) .langSwitch) .langLabel { color: #16171B !important; opacity: 0.45 !important; }
                  :global(html[data-safari] .siteHeader--overHomeHero .langSwitch) .langLabel { color: #000000 !important; opacity: 0.45 !important; }
                  :global(html[data-safari] .langSwitch[data-lang="ru"]) .langLabel--ru,
                  :global(html[data-safari] .langSwitch[data-lang="en"]) .langLabel--en {
                    opacity: 1 !important;
                  }
                `}</style>
              </GlassPanelShell>

              {/* Burger — plain button so glassPanel position rules don't clip the icon */}
              <button
                type="button"
                onClick={toggleMenu}
                className={`burger lg:hidden ${open && !closing ? "is-open" : ""}`}
                aria-label={open ? t.aria.burgerClose : t.aria.burgerOpen}
                aria-expanded={open && !closing}
                aria-controls="mobile-nav-menu"
                title="Menu"
              >
                <span className="burger__box" aria-hidden="true">
                  <span className="burger-line line-top" />
                  <span className="burger-line line-mid" />
                  <span className="burger-line line-bot" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen mobile menu — header stays on top so the same burger morphs to ✕ */}
      {menuVisible && portalReady && typeof window !== "undefined" && createPortal(
        <div
          id="mobile-nav-menu"
          className={`mobileNav ${closing ? "is-closing" : "is-open"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className="mobileNav__backdrop"
            aria-label={t.aria.burgerClose}
            onClick={closeMenu}
          />
          <div className="mobileNav__sheet">
            <nav className="mobileNav__links">
              {navIds.map((n, idx) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => onAboutNavClick(e, n.href)}
                  className="mobileNav__link"
                  style={{ ["--i" as string]: idx }}
                >
                  {t.nav[n.key]}
                </a>
              ))}
            </nav>

            <div className="mobileNav__controls">
              <GlassPanelShell
                as="button"
                type="button"
                onClick={toggleTheme}
                className="mobileMenuBtn h-11 px-5 rounded-full text-sm font-semibold"
                style={{ background: "var(--glass-bg)", color: "var(--foreground)" }}
              >
                {theme === "light" ? t.theme.light : t.theme.dark}
              </GlassPanelShell>
              <GlassPanelShell
                as="button"
                type="button"
                onClick={toggleLang}
                className="mobileMenuBtn h-11 px-5 rounded-full text-sm font-semibold"
                style={{ background: "var(--glass-bg)", color: "var(--foreground)" }}
              >
                {lang.toUpperCase()}
              </GlassPanelShell>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
