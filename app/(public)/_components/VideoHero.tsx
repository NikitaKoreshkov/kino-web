"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLang } from "../../lang";
import { useTheme } from "../../theme";
import { Montserrat, Marck_Script } from "next/font/google";
import GlassPanelShell from "./GlassPanelShell";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], display: "swap" });
// Sacramento не поддерживает кириллицу. Используем Marck Script (визуально близок, есть кириллица).
const marck = Marck_Script({ subsets: ["latin", "cyrillic"], weight: "400", display: "swap" });

const DEFAULT_HERO_VIDEO = "/video/drone.mp4";

/**
 * Full-bleed 18:9 video hero under the fixed header.
 * - Container uses aspect-ratio 18/9, so the block size is locked and never jumps.
 * - Any input video is cropped with object-fit: cover (never changes container size).
 * - Source can be overridden via env: NEXT_PUBLIC_HERO_VIDEO_URL and NEXT_PUBLIC_HERO_POSTER_URL.
 */
export default function VideoHero({ ssrLang, ssrTheme, videoSrc, posterUrl }: { ssrLang?: "ru" | "en"; ssrTheme?: "light" | "dark"; videoSrc?: string; posterUrl?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoLayerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Keep scale in one place for both CSS and bounds math
  const SCALE = 1.12; // enlarge video to allow translation without revealing edges
  // Refs for text effects
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const { lang } = useLang(ssrLang);
  const { theme } = useTheme(ssrTheme);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  // prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduceMotion(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    // Ensure CTA doesn't flash initially; if reduced motion, show it immediately
    const cta = ctaRef.current;
    if (cta && mq.matches) {
      cta.style.opacity = '1';
      cta.style.transform = 'translate3d(0,0,0)';
    }
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Once-only reveal when hero enters viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sec = sectionRef.current;
    if (!sec) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { sec.classList.add('is-revealed'); return; }
    // Helper: reveal immediately and cleanup observers/listeners
    let io: IntersectionObserver | null = null;
    const reveal = () => { sec.classList.add('is-revealed'); if (io) { io.disconnect(); io = null; } cleanupLoadListeners(); };

    // Immediate synchronous check — иногда IO не триггерится до первого скролла
    const immediateCheck = () => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      // Считаем блок видимым, если хотя бы 20% его высоты в пределах вьюпорта
      const visibleTop = Math.max(0, Math.min(vh, r.bottom)) - Math.max(0, Math.min(vh, r.top));
      const visRatio = r.height > 0 ? visibleTop / r.height : 0;
      if (visRatio > 0.2) return true;
      return false;
    };

    // Fallback: слушаем pageshow/load + rAF, чтобы поймать поздние сдвиги макета/скролл-restore
    const onPageShow = (e: PageTransitionEvent) => {
      // Если пришли из BFCache, тоже проверим
      requestAnimationFrame(() => { requestAnimationFrame(() => { if (immediateCheck()) reveal(); }); });
    };
    const onLoad = () => {
      setTimeout(() => { if (immediateCheck()) reveal(); }, 0);
    };
    const cleanupLoadListeners = () => {
      window.removeEventListener('pageshow', onPageShow as any);
      window.removeEventListener('load', onLoad);
    };
    window.addEventListener('pageshow', onPageShow as any);
    window.addEventListener('load', onLoad);

    // Основной наблюдатель
    io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > 0.12) { // чуточку ниже порог
          reveal();
          break;
        }
      }
    }, { threshold: [0, 0.01, 0.12, 0.3] });
    io.observe(sec);

    // Последний шанс — если уже видно прямо сейчас, ставим без ожидания событий
    if (immediateCheck()) reveal();

    return () => {
      if (io) io.disconnect();
      cleanupLoadListeners();
    };
  }, []);

  // Mouse parallax (bounded, noticeable). Disabled on touch and when reduced motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current || !videoLayerRef.current) return;
    const el = containerRef.current;
    const target = videoLayerRef.current;

    let raf = 0;
    let tx = 0, ty = 0; // target translate offsets
    let cx = 0, cy = 0; // current animated translate offsets
    let rtx = 0, rty = 0; // target rotations (deg)
    let rcx = 0, rcy = 0; // current rotations

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch || reduceMotion) return; // do nothing

    // Ensure initial scale is applied even before first mouse move to avoid a sudden jump
    try { target.style.transform = `translate3d(0px, 0px, 0) scale(${SCALE})`; } catch {}

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      // map to -1..1 around center
      const dx = (x - 0.5) * 2;
      const dy = (y - 0.5) * 2;
      // compute safe translate bounds from scale margin so edges never show
      const marginX = (SCALE - 1) * rect.width * 0.5; // extra pixels per side
      const marginY = (SCALE - 1) * rect.height * 0.5;
      const maxX = marginX * 0.95; // keep a little safety
      const maxY = marginY * 0.95;
      tx = Math.max(-maxX, Math.min(maxX, dx * maxX));
      ty = Math.max(-maxY, Math.min(maxY, dy * maxY));
      // rotations отключены, чтобы не "косило" по краям
      const rotMaxY = 0.0;
      const rotMaxX = 0.0;
      rty = dx * rotMaxY;
      rtx = -dy * rotMaxX;
      if (!raf) loop();
    };

    const loop = () => {
      cx += (tx - cx) * 0.1; // ease
      cy += (ty - cy) * 0.1;
      rcx += (rtx - rcx) * 0.1;
      rcy += (rty - rcy) * 0.1;
      target.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(${SCALE})`;
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const onLeave = () => {
      tx = 0; ty = 0; rtx = 0; rty = 0; if (!raf) loop();
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);
  const baseSrcRaw =
    (videoSrc && videoSrc.trim()) ||
    process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
    DEFAULT_HERO_VIDEO;
  // If admin accidentally saved a still image into the video field, fall back to the drone reel
  const baseSrc = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(baseSrcRaw) || /youtube|youtu\.be/i.test(baseSrcRaw)
    ? baseSrcRaw
    : DEFAULT_HERO_VIDEO;
  // Detect YouTube URLs and build an embed URL with autoplay/mute/loop
  const yt = useMemo(() => {
    const url = baseSrc.trim();
    const m1 = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    if (!m1) return null as null | { id: string; embed: string };
    const id = m1[1];
    const params = new URLSearchParams({ autoplay: '1', mute: '1', controls: '0', rel: '0', modestbranding: '1', playsinline: '1', loop: '1', playlist: id });
    const embed = `https://www.youtube.com/embed/${id}?${params.toString()}`;
    return { id, embed };
  }, [baseSrc]);
  const explicitVersion = process.env.NEXT_PUBLIC_HERO_VERSION;
  // Keep SSR/CSR markup identical: do NOT call Date.now() during render.
  const [finalSrc, setFinalSrc] = useState(() => {
    if (yt) return yt.embed; // for YouTube we use the embed URL and don't append version
    return explicitVersion ? `${baseSrc}?v=${encodeURIComponent(explicitVersion)}` : baseSrc;
  });
  useEffect(() => {
    if (yt) { setFinalSrc(yt.embed); return; }
    if (!explicitVersion && process.env.NODE_ENV !== "production") {
      setFinalSrc(`${baseSrc}?v=${Date.now().toString()}`);
    } else {
      setFinalSrc(explicitVersion ? `${baseSrc}?v=${encodeURIComponent(explicitVersion)}` : baseSrc);
    }
  }, [baseSrc, explicitVersion, yt]);
  // Always try to autoplay (no pause when off-screen)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vid = videoRef.current;
    if (!vid) return;
    const p = vid.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [finalSrc]);
  const poster =
    (posterUrl && posterUrl.trim()) ||
    process.env.NEXT_PUBLIC_HERO_POSTER_URL ||
    undefined;

  // Note: events list moved into separate component.

  return (
    <>
    <section
      id="home-hero"
      aria-label="Video hero"
      className="relative w-full max-w-full overflow-hidden heroFold"
      ref={sectionRef as any}
    >
      {/* Full viewport on mobile; cinematic 18:9 on desktop */}
      <div
        ref={containerRef}
        className="heroFold__frame relative w-full overflow-hidden shadow-xl revealUp"
      >
        {/* Parallax layer (scaled + translated) */}
        <div ref={videoLayerRef} className="absolute inset-0 will-change-transform">
          {yt ? (
            <iframe
              className="h-full w-full object-cover"
              src={finalSrc}
              title="YouTube video player"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video
              className="h-full w-full object-cover"
              preload="metadata"
              autoPlay
              muted
              loop
              playsInline
              poster={poster}
              aria-label="Background video"
              ref={videoRef}
            >
              <source src={finalSrc} type="video/mp4" />
            </video>
          )}
        </div>

        {/* Cinematic scrim — dark theme (moon) only */}
        {theme === "dark" && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-black/25" />
          <div
            className="absolute inset-x-0 top-0 h-[42%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.34) 48%, rgba(0,0,0,0.08) 78%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 65% at 50% 42%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 52%, transparent 78%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[48%]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.22) 55%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.35] mix-blend-multiply"
            style={{
              background:
                "linear-gradient(120deg, rgba(14,18,32,0.30) 0%, transparent 42%, rgba(6,10,22,0.22) 100%)",
            }}
          />
        </div>
        )}

        {/* Posh text */}
        <div ref={textWrapRef} className="absolute inset-0 flex items-center justify-center px-5 sm:px-6 text-center">
          <div className="relative max-w-[64rem] mx-auto select-none -translate-y-0 sm:-translate-y-0.5 lg:-translate-y-1">
            {/* behind-text vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[110%] sm:w-[105%] lg:w-[90%] h-[62%] sm:h-[58%] lg:h-[54%] blur-2xl"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.00) 72%)",
              }}
            />
            <h1
              ref={headingRef}
              className={`${montserrat.className} font-bold lg:font-extrabold tracking-tight leading-[1.05] whitespace-normal sm:whitespace-nowrap text-[clamp(36px,11vw,54px)] sm:text-[64px] lg:text-[92px] xl:text-[108px] text-white`}
              style={{ textShadow: reduceMotion ? undefined : "0 2px 12px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.22)" }}
            >
              {/* word-by-word reveal */}
              <span className="block sm:inline-block animate-word opacity-0" style={{ animationDelay: '0ms' }}>
                {Array.from(lang === 'ru' ? 'Каждое' : 'Every').map((ch, i) => (
                  <span key={`k-${i}`} data-char className="char">{ch}</span>
                ))}
              </span>
              <span className="hidden sm:inline-block sm:w-3" />
              <span className="block sm:inline-block animate-word opacity-0" style={{ animationDelay: '350ms' }}>
                {Array.from(lang === 'ru' ? 'мгновение' : 'moment').map((ch, i) => (
                  <span key={`m-${i}`} data-char className="char">{ch}</span>
                ))}
              </span>
            </h1>
            <div
              ref={subRef}
              className={`${marck.className} mt-1 sm:mt-0.5 text-[clamp(34px,10vw,51px)] sm:text-[48px] lg:text-[64px] xl:text-[84px] leading-none text-white`}
              style={{ textShadow: reduceMotion ? undefined : "0 2px 12px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.22)" }}
            >
              <span className="inline-block animate-word opacity-0" style={{ animationDelay: '800ms' }}>
                {Array.from(lang === 'ru' ? 'Событие' : 'Event').map((ch, i) => (
                  <span key={`s-${i}`} data-char className="char">{ch}</span>
                ))}
              </span>
            </div>
            {/* CTA */}
            <div className="mt-2 sm:mt-3">
              <GlassPanelShell
                ref={ctaRef}
                as="a"
                href="/booking"
                className="cta inline-flex items-center justify-center px-6 sm:px-7 h-12 sm:h-[52px] rounded-full text-[14px] sm:text-[15px] font-semibold tracking-[0.06em] uppercase select-none"
                style={{ opacity: 0, ['--rx' as string]: '50%', ['--ry' as string]: '50%' }}
                onPointerDown={(e) => {
                  if (!ctaRef.current || reduceMotion) return;
                  const computedOpacity = getComputedStyle(ctaRef.current).opacity;
                  if (parseFloat(computedOpacity) < 0.99) return;
                  const t = e.currentTarget as HTMLAnchorElement;
                  const r = t.getBoundingClientRect();
                  const x = ((e.clientX - r.left) / r.width) * 100;
                  const y = ((e.clientY - r.top) / r.height) * 100;
                  t.style.setProperty('--rx', `${x}%`);
                  t.style.setProperty('--ry', `${y}%`);
                  t.classList.remove('ripples');
                  void t.offsetWidth;
                  t.classList.add('ripples');
                }}
                onAnimationEnd={(e) => {
                  if (e.animationName === 'ctaIn' && ctaRef.current) {
                    ctaRef.current.style.opacity = '1';
                    ctaRef.current.style.removeProperty('transform');
                  }
                }}
              >
                <span className="label relative z-[1]">
                  {lang === 'ru' ? 'Забронировать' : 'Book now'}
                </span>
                <span aria-hidden className="wave" />
              </GlassPanelShell>
            </div>
          </div>
        </div>
        {/* Bottom subtle scroll hint over video */}
        <div className="vh-hint sp-hint" aria-hidden>
          <span className="sp-hintText">{lang === 'ru' ? 'Продолжайте вниз' : 'Continue down'}</span>
        </div>
        {/* Component-scoped animations */}
        <style jsx>{`
          @keyframes wordIn {
            0% { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.98); filter: blur(2px); }
            60% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
            80% { opacity: 1; transform: translate3d(0, 0, 0) scale(1.02); }
            100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          }
          .animate-word { animation: wordIn 900ms cubic-bezier(.2,.65,.2,1) forwards; will-change: opacity, transform, filter; }
          /* Per-character transforms controlled from JS (RAF) */
          .char { display: inline-block; will-change: transform; }
          .cta { position: relative; overflow: hidden; text-shadow: 0 1px 2px rgba(0,0,0,0.35); animation: ctaIn 720ms cubic-bezier(.18,.6,.2,1) forwards; animation-delay: 1100ms; }
          @keyframes ctaIn {
            from { opacity: 0; transform: translate3d(0, 6px, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          @media (prefers-reduced-motion: reduce) { .cta { animation: none; opacity: 1; transform: none; } }
          .wave { position: absolute; left: 0; top: 0; right: 0; bottom: 0; pointer-events: none; overflow: hidden; border-radius: 9999px; }
          .wave::before { content: ""; position: absolute; width: 12px; height: 12px; border-radius: 9999px; left: var(--rx,50%); top: var(--ry,50%); transform: translate(-50%, -50%) scale(0); background: radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0.00)); opacity: 0; }
          .ripples .wave::before { animation: ripple 700ms cubic-bezier(.2,.65,.2,1); }
          @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0); opacity: .35; } 60% { opacity: .18; } 100% { transform: translate(-50%, -50%) scale(14); opacity: 0; } }
          @media (prefers-reduced-motion: reduce) {
            .char { transform: none !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-word { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
          }
          /* VideoHero local styles for the scroll hint */
          .vh-hint {
            position: absolute;
            left: 50%;
            bottom: calc(18px + env(safe-area-inset-bottom, 0px));
            transform: translateX(-50%);
            pointer-events: none;
          }
          :global(.vh-hint .sp-hintText) { color: rgba(255,255,255,0.94); opacity: .86; text-shadow: 0 1px 6px rgba(0,0,0,0.45); }
          @media (min-width: 1024px) { :global(.vh-hint) { display: flex !important; } }
          @media (max-width: 1023.98px) { :global(.heroFold .cta) { height: 46px !important; padding: 0 18px !important; font-size: 13.5px !important; } }
          @media (max-width: 480px) { :global(.heroFold .cta) { height: 44px !important; padding: 0 16px !important; font-size: 13px !important; } }
        `}</style>
      </div>
    </section>
    {/* Sections below were moved to separate components to control ordering from the page. */}
    </>
  );
}
