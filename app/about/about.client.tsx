"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Header from "@/app/(public)/_components/Header";
import { Marck_Script, Montserrat } from "next/font/google";
import { useLang } from "@/app/lang";
import { getTexts } from "@/app/i18n";
import TrustScroll from "@/app/(public)/_components/TrustScroll";
import YupiShow from "@/app/(public)/_components/YupiShow";
import KinoShow from "@/app/(public)/_components/KinoShow";
import MasterShow from "@/app/(public)/_components/MasterShow";
import Extras from "@/app/(public)/_components/Extras";
import Footer from "@/app/(public)/_components/Footer";
import { HeroLavaLetters } from "@/app/(public)/_components/HeroLavaLetters";
import GlassPanelShell from "@/app/(public)/_components/GlassPanelShell";
import { useAboutReveal } from "@/app/(public)/_hooks/useAboutReveal";
import {
  scrollAboutTo,
  scrollAboutToWhenReady,
  takeAboutScrollTarget,
} from "@/app/(public)/_lib/aboutScroll";

const marck = Marck_Script({ subsets: ["latin", "cyrillic"], weight: "400", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["700", "800"], display: "swap" });

type ShowBlock = { cover?: string; title?: string; description?: string; prices?: Array<{ label?: string; price?: string; ticket?: string }>; panels?: Array<{ title?: string; description?: string }>; };
type ExtrasData = { title?: string; lead?: string; groups?: { photos?: string; ice?: string; congrats?: string }; items?: { photos?: Array<{ title: string; subtitle?: string; price: string }>; ice?: Array<{ title: string; subtitle?: string; price: string }>; congrats?: Array<{ title: string; subtitle?: string; price: string }> } };

export default function AboutClient({ initialLang, introImage, blocks, extras }: { initialLang: "ru" | "en"; introImage?: string; blocks?: Record<string, ShowBlock>; extras?: ExtrasData }) {
  const { lang } = useLang(initialLang);
  const t = getTexts(lang);
  const words = t.about.heroWords;
  // -1: hidden until line 2 finishes
  const [wIndex, setWIndex] = useState(-1);
  const [showSub, setShowSub] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startHeroRef = useRef<() => void>(() => {});
  const belowHeroRef = useRef<HTMLDivElement | null>(null);

  useAboutReveal(belowHeroRef, [lang]);

  // Reveal photo on first scroll as an alternative trigger
  useEffect(() => {
    if (showPhoto) return; // already shown by words
    const onScroll = () => {
      if (window.scrollY > 0) {
        setShowPhoto(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', onScroll);
  }, [showPhoto]);

  // Freeze hero height once (no updates on resize) so browser UI overlays content instead of moving it
  useEffect(() => {
    const h = Math.round(window.visualViewport?.height ?? window.innerHeight);
    document.documentElement.style.setProperty('--about-hero-h', `${h}px`);
  }, []);


  // handle initial hash scroll on route load and subsequent hash changes
  useLayoutEffect(() => {
    const stashed = takeAboutScrollTarget();
    const hashId =
      typeof window !== "undefined"
        ? decodeURIComponent(window.location.hash.replace(/^#/, ""))
        : "";
    const id = stashed || hashId || null;
    if (!id) return;

    // Keep URL in sync when we arrived via stash (no native hash scroll)
    if (stashed && hashId !== stashed) {
      window.history.replaceState(null, "", `/about#${stashed}`);
    }

    if (id === "about") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    // Instant land on deep-link entry — smooth-from-top + retries caused a visible jerk
    const cancel = scrollAboutToWhenReady(id, {
      behavior: "auto",
      attempts: [0, 40, 120, 280, 560, 1000],
    });

    const onHash = () => {
      const next = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!next) return;
      if (next === "about") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      scrollAboutToWhenReady(next, { behavior: "smooth", attempts: [0, 80, 240] });
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      cancel();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  const scheduleTimes = useMemo(() => t.about.scheduleTimes.split("\n"), [t]);
  // Current weekday index for Mon-first arrays used in i18n (0=Mon..6=Sun)
  const todayIdx = useMemo(() => {
    const js = new Date().getDay(); // 0=Sun..6=Sat
    return (js + 6) % 7;
  }, []);

  // gate hero animations to start only once after client mount
  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    // Prevent double-start in React StrictMode (dev) and on fast remounts
    if ((window as any).__aboutAnimStarted) return;
    (window as any).__aboutAnimStarted = true;
    const root = document.querySelector('.aboutPage');
    if (root) root.classList.add('about-anim');
  }, []);

  // define hero animation (start/restart) logic
  startHeroRef.current = () => {
    // clear any previous timers
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    // reset state
    setShowSub(false);
    setWIndex(-1);
    setShowPhoto(false);

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startMs = prefersReduced ? 400 : 1500; // start after line2 anim
    const stepMs = 300;
    const startId = window.setTimeout(() => {
      setWIndex(0);
      intervalRef.current = window.setInterval(() => {
        setWIndex((prev) => {
          if (prev >= words.length - 1) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            intervalRef.current = null;
            setShowSub(true);
            // reveal photo when last word (e.g. СОЧИ) is reached
            setShowPhoto(true);
            return prev;
          }
          return prev + 1;
        });
      }, stepMs);
    }, startMs);
    timeoutsRef.current.push(startId);
  };

  // rotate third line words via interval; final stops on last
  useEffect(() => {
    startHeroRef.current();
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restart hero animation when returning from bfcache (e.g., swipe back from Google)
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      // Only when restored from bfcache
      if ((e as any).persisted) {
        // retrigger CSS animations by toggling the gate class
        const root = document.querySelector('.aboutPage');
        if (root) {
          root.classList.remove('about-anim');
          // force reflow
          void (root as HTMLElement).clientWidth;
          root.classList.add('about-anim');
        }
        startHeroRef.current();
      }
    };
    window.addEventListener('pageshow', onPageShow as any, { passive: true } as any);
    return () => window.removeEventListener('pageshow', onPageShow as any);
  }, []);

  // smooth in-page #anchor clicks
  useEffect(() => {
    const onClick = (e: Event) => {
      const a = e.target as HTMLElement | null;
      if (!a) return;
      const link = a.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      window.history.pushState(null, "", `#${id}`);
      scrollAboutTo(id, "smooth");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Header ssrLang={initialLang} />
      <main className={`aboutPage relative`}>
      {/* soft page atmosphere — no purple glow */}
      <div className="aboutBg" aria-hidden />

      {/* Hero — Nike-like sequential words */}
      <section id="about" className="heroSection">
        <div className="relative">
          <div className={`${montserrat.className} heroStack`}>
            <div className="heroLine heroLine1">{t.about.heroLine1}</div>
            <div className="heroLine heroLine2">{t.about.heroLine2}</div>
            <div className="heroLine heroLine3" aria-live="polite">
              {/* Ghost placeholders reserve space on SSR to avoid layout shift */}
              <span className="ghost" aria-hidden>{words[words.length - 1]}</span>
              <span className="ghost starGhost" aria-hidden>*</span>
              <span className={`swap ${wIndex >= 0 ? "is-on" : ""}`} key={wIndex}>{words[wIndex]}</span>
              <span className={`star ${wIndex === words.length - 1 ? "show" : ""}`} aria-hidden>
                *
              </span>
            </div>
          </div>
          <p className={`${marck.className} heroSub ${showSub ? "show" : ""}`}>{t.about.heroSub}</p>
        </div>
      </section>

      <div ref={belowHeroRef} className="aboutBelow">
      {/* Company intro */}
      <section id="about-company" className="abCompany abBand plWall">
        <GlassPanelShell
          as="figure"
          className={`abCompany__media aboutFigure ${showPhoto ? "is-on" : "is-off"}`}
          elasticity={0.2}
          aria-hidden={!showPhoto}
        >
          <img
            src={introImage || ""}
            alt={t.about.mediaAlt}
            loading="eager"
            decoding="async"
            style={{ display: introImage ? undefined : "none" }}
          />
        </GlassPanelShell>

        <div
          className="abCompany__copy ab-reveal"
          style={{ ["--ab-delay" as string]: "120ms" }}
        >
          <div className="title headline">
            <HeroLavaLetters variant="headlinePp">{t.about.companyTitle}</HeroLavaLetters>
          </div>
          <div className="subcopy">
            <HeroLavaLetters variant="body">{t.about.companyText}</HeroLavaLetters>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="abFeatures abBand plWall">
        <div className="abFeatures__list">
          {t.about.features.map((f, i) => (
            <article
              key={f.title}
              className="abFeatures__item ab-reveal"
              style={{ ["--ab-delay" as string]: `${i * 90}ms` }}
            >
              <span className="abFeatures__index" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="abFeatures__body">
                <h3 className="abFeatures__title">{f.title}</h3>
                <p className="abFeatures__text">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TrustScroll />

      <YupiShow data={blocks?.upi as any} />
      <KinoShow data={blocks?.cinema as any} />
      <MasterShow data={blocks?.master as any} />

      <Extras data={extras} />

      {/* Schedule */}
      <section id="schedule" className="abSchedule abBand plWall">
        <div className="abSchedule__inner ab-reveal">
          <div className="abSchedule__head">
            <div className="title headline">
              <HeroLavaLetters variant="headlinePp">{t.about.scheduleTitle}</HeroLavaLetters>
            </div>
            <p className="abSchedule__everyday">{t.about.scheduleEveryday}</p>
          </div>

          <div
            className="abSchedule__slots ab-reveal"
            style={{ ["--ab-delay" as string]: "100ms" }}
          >
            {scheduleTimes.map((time) => (
              <div key={time} className="abSchedule__slot">
                {time}
              </div>
            ))}
          </div>

          <div
            className="abSchedule__days ab-reveal"
            style={{ ["--ab-delay" as string]: "180ms" }}
            aria-label={t.about.scheduleTitle}
          >
            {t.about.weekdays.map((d, i) => (
              <span
                key={d}
                className={`abSchedule__day${i === todayIdx ? " is-today" : ""}`}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Help / Contacts */}
      <section id="help" className="abHelp abBand plWall">
        <div className="abHelp__inner ab-reveal">
          <div className="title headline">
            <HeroLavaLetters variant="headlinePp">{t.about.helpTitle}</HeroLavaLetters>
          </div>
          <div className="subcopy">
            <HeroLavaLetters variant="body">{t.about.helpText}</HeroLavaLetters>
          </div>
          <div
            className="abHelp__contacts ab-reveal"
            style={{ ["--ab-delay" as string]: "120ms" }}
          >
            <div className="abHelp__col">
              <span className="abHelp__label">{t.about.helpAddressLabel}</span>
              <a
                href={t.about.helpMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="abHelp__link"
                aria-label={`${t.about.helpAddressLabel} ${t.about.helpAddress}`}
              >
                {t.about.helpAddress}
              </a>
            </div>
            <div className="abHelp__col">
              <span className="abHelp__label">{t.about.helpPhoneLabel}</span>
              <a
                href="tel:+79631630066"
                className="abHelp__link"
                aria-label={`${t.about.helpPhoneLabel} +7 (963) 163-00-66`}
              >
                +7 (963) 163‑00‑66
              </a>
            </div>
            <div className="abHelp__col">
              <span className="abHelp__label">{t.about.helpWhatsappLabel}</span>
              <a
                href="https://api.whatsapp.com/send/?phone=79631630066&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%9F%D0%B8%D1%88%D1%83+%D1%81+%D1%81%D0%B0%D0%B9%D1%82%D0%B0%2C+%D0%BD%D1%83%D0%B6%D0%BD%D0%B0+%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="abHelp__link"
                aria-label={t.about.helpWhatsappCta}
              >
                {t.about.helpWhatsappCta}
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>

      <Footer />
      </main>
    </>
  );
}
