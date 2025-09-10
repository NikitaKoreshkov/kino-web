"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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


  // simple IntersectionObserver reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

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
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (!hash) return;
      const id = decodeURIComponent(hash.replace('#', ''));
      const el = document.getElementById(id);
      if (!el) return;
      // wait a tick to ensure layout is ready
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    // run on mount
    scrollToHash();
    // respond to in-page hash changes as well
    window.addEventListener('hashchange', scrollToHash, { passive: true });
    return () => window.removeEventListener('hashchange', scrollToHash);
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

  // smooth anchor scroll if coming from same page
  useEffect(() => {
    const onClick = (e: Event) => {
      const a = e.target as HTMLElement | null;
      if (!a) return;
      const link = a.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Header ssrLang={initialLang} />
      <main className={`aboutPage relative`}>
      {/* premium background */}
      <div className="premiumBg" aria-hidden />

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

      {/* Company intro — Nike-like: big photo left, copy right */}
      <section id="about-company" className="w-full max-w-none plWall py-6 lg:py-8 -mt-24 sm:-mt-28 lg:-mt-28 xl:-mt-24 2xl:-mt-24">
        <div className="grid grid-cols-12 md:gap-8 lg:gap-10 items-start lg:items-center">
          {/* Left: Media */}
          <figure className={`col-span-12 md:col-start-1 md:col-end-10 overflow-hidden rounded-2xl aboutFigure ${showPhoto ? 'is-on' : 'is-off'}`} aria-hidden={!showPhoto}>
            <img
              src={introImage || "/images/cinema.svg"}
              alt={t.about.mediaAlt}
              className="block w-full h-full object-cover object-left"
              loading="eager"
              decoding="async"
            />
          </figure>

          {/* Right: Copy */}
          <div className="col-span-12 md:col-start-10 md:col-end-13 md:pl-4 lg:pl-6 self-start lg:self-center reveal max-w-[520px]">
            <h2 className={`${montserrat.className} aboutCompanyTitle text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.2] tracking-normal mb-3`}>{t.about.companyTitle}</h2>
            <p className="aboutCompanyText text-base sm:text-lg leading-7 sm:leading-8 max-w-prose">{t.about.companyText}</p>
          </div>
        </div>
      </section>

      {/* Features/Help/Events anchors will exist even if content comes later */}
      <section id="features" className="w-full max-w-none plWall mt-12 sm:mt-16 lg:mt-24 pb-8">
        <div className="grid md:grid-cols-3 gap-6">
          {t.about.features.map((f) => (
            <article key={f.title} className="card reveal premiumCard">
              <div className="featureRow">
                <span className="featIcon" aria-hidden>{
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                    <path d="M7 11l3 3 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="4" width="18" height="16" rx="4"/>
                  </svg>
                }</span>
                <div className="flex-1 flex flex-col">
                  <h3 className={`${montserrat.className} text-lg sm:text-xl font-extrabold tracking-tight`}>{f.title}</h3>
                  <p className="mt-2 text-[15px] sm:text-base opacity-85 leading-6 sm:leading-7">{f.text}</p>
                  {/* badges and CTA intentionally not rendered */}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      

      {/* Trust reasons with ScrollStory-like effect */}
      <TrustScroll />

      {/* Yupi Show — premium section */}
      <YupiShow data={blocks?.upi as any} />

      {/* Kino Show — mirrored layout */}
      <KinoShow data={blocks?.cinema as any} />

      {/* Master Show — same layout as YupiShow */}
      <MasterShow data={blocks?.master as any} />

      {/* Extra products */}
      <Extras data={extras} />

      {/* Schedule */}
      <section id="schedule" className="schRoot w-full max-w-none plWall py-10">
        <article className="card reveal schCard">
          <h2 className="text-2xl font-semibold schTitle">{t.about.scheduleTitle}</h2>
          <p className="mt-3 schLead">{t.about.scheduleEveryday}</p>
          <div className="schGrid mt-4">
            {t.about.weekdays.map((d, i) => {
              const isToday = i === todayIdx;
              return (
              <div key={d} className={`schItem text-center ${isToday ? "is-today" : ""}`}>
                <div className="schDay">{d}</div>
                <div className="schTime">{scheduleTimes[0]}</div>
                <div className="schTime">{scheduleTimes[1]}</div>
              </div>
            );})}
          </div>
        </article>
      </section>

      {/* Help / Contacts */}
      <section id="help" className="w-full max-w-none plWall pt-2 pb-10">
        <article className="card reveal premiumCard">
          <h2 className={`${montserrat.className} text-2xl sm:text-3xl font-extrabold tracking-tight`}>{lang === 'ru' ? 'Нужна помощь?' : 'Need help?'}</h2>
          <p className="mt-2 text-base sm:text-lg opacity-85 leading-7">
            {lang === 'ru'
              ? 'Мы всегда на связи. Подскажем по билетам, шоу и броням — быстро и с заботой.'
              : 'We’re here for you. Questions about tickets, shows or bookings — fast and friendly support.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-10 items-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm opacity-70">{lang === 'ru' ? 'Телефон' : 'Phone'}</span>
              <a href="tel:+79631630066" className="btnPrimary" aria-label={lang === 'ru' ? 'Позвонить +7 (963) 163-00-66' : 'Call +7 (963) 163-00-66'}>
                +7 (963) 163‑00‑66
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm opacity-70">WhatsApp</span>
              <a
                href="https://api.whatsapp.com/send/?phone=79631630066&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%9F%D0%B8%D1%88%D1%83+%D1%81+%D1%81%D0%B0%D0%B9%D1%82%D0%B0%2C+%D0%BD%D1%83%D0%B6%D0%BD%D0%B0+%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="btnGhost"
                aria-label={lang === 'ru' ? 'Написать в WhatsApp' : 'Message on WhatsApp'}
              >
                {lang === 'ru' ? 'Написать в WhatsApp' : 'Message on WhatsApp'}
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* Removed: Наши шоу */}

      {/* Footer from homepage */}
      <Footer />
      </main>
    </>
  );
}
