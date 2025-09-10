"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLang } from "../../lang";
import { Montserrat, Marck_Script } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], display: "swap" });
// Sacramento не поддерживает кириллицу. Используем Marck Script (визуально близок, есть кириллица).
const marck = Marck_Script({ subsets: ["latin", "cyrillic"], weight: "400", display: "swap" });

/**
 * Full-bleed 21:9 video hero under the fixed header.
 * - Container uses aspect-ratio 21/9, so the block size is locked and never jumps.
 * - Any input video is cropped with object-fit: cover (never changes container size).
 * - Source can be overridden via env: NEXT_PUBLIC_HERO_VIDEO_URL and NEXT_PUBLIC_HERO_POSTER_URL.
 */
export default function VideoHero({ ssrLang, videoSrc, posterUrl }: { ssrLang?: "ru" | "en"; videoSrc?: string; posterUrl?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoLayerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Fixed mobile viewport height string (e.g., "calc(700px - env(safe-area-inset-bottom))")
  const [vhFixed, setVhFixed] = useState<string | null>(null);
  // Keep scale in one place for both CSS and bounds math
  const SCALE = 1.12; // enlarge video to allow translation without revealing edges
  // Refs for text effects
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const { lang } = useLang(ssrLang);
  // Smooth hotspot + parallax animation for CTA
  const ctaAnimRef = useRef(
    new WeakMap<
      HTMLElement,
      { gx: number; gy: number; tgx: number; tgy: number; px: number; py: number; tpx: number; tpy: number; raf: number }
    >()
  );
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

  // Calculate fixed small-screen height once (on mount) and on orientation change only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const HEADER_SPACER_PX = 96; // matches <div className="h-24" /> above
    const compute = () => {
      try {
        const base = (window.visualViewport?.height ?? window.innerHeight) - HEADER_SPACER_PX;
        const clamped = Math.max(380, Math.round(base)); // minimal sensible height safeguard
        // Subtract safe-area bottom if present (iOS)
        setVhFixed(`calc(${clamped}px - env(safe-area-inset-bottom))`);
      } catch {
        setVhFixed(null);
      }
    };
    compute();
    // Update on orientation changes, not on every resize (prevents dynamic growth on scroll)
    const onOrient = () => compute();
    window.addEventListener('orientationchange', onOrient);
    return () => window.removeEventListener('orientationchange', onOrient);
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
  const baseSrc =
    (videoSrc && videoSrc.trim()) ||
    process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
    "/video/Abstract.mp4";
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
  // Per-character physics-like local repulsion
  useEffect(() => {
    if (typeof window === 'undefined' || reduceMotion) return;
    const root = textWrapRef.current;
    const area = sectionRef.current || root; // расширяем зону ховера до всей секции
    if (!root || !area) return;
    const chars = Array.from(root.querySelectorAll<HTMLElement>('[data-char]'));
    if (!chars.length) return;

    const RADIUS = 150; // px influence radius (чуть больше для заметности)
    const MAX = 18; // px max push (слегка больше для живости)
    const STIFF = 0.12; // мягче и медленнее реакция
    const DAMP = 0.90;  // сильнее сглаживание/торможение
    const targets = new WeakMap<HTMLElement, {x: number; y: number}>();
    const currents = new WeakMap<HTMLElement, {x: number; y: number}>();
    const velocities = new WeakMap<HTMLElement, {x: number; y: number}>();
    chars.forEach((c) => { targets.set(c, {x:0,y:0}); currents.set(c, {x:0,y:0}); velocities.set(c, {x:0,y:0}); });

    let raf = 0;
    let mx = 0, my = 0;
    let hovering = false;

    const compute = () => {
      if (!hovering) {
        // decay to zero
        chars.forEach((c) => { const t = targets.get(c)!; t.x = 0; t.y = 0; });
      } else {
        // push nearby chars away from mouse
        chars.forEach((c) => {
          const r = c.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.hypot(dx, dy);
          const t = targets.get(c)!;
          if (dist < RADIUS) {
            const k = 1 - dist / RADIUS; // 0..1
            const kSmooth = Math.pow(k, 1.4); // нелинейное уменьшение для более мягкого разлёта
            const len = Math.min(MAX, MAX * kSmooth);
            // unit vector away from mouse
            const inv = dist > 0 ? 1 / dist : 0;
            t.x = dx * inv * len;
            t.y = dy * inv * len;
          } else {
            t.x = 0; t.y = 0;
          }
        });
      }

      // spring animate towards targets
      let moving = false;
      chars.forEach((c) => {
        const t = targets.get(c)!;
        const cur = currents.get(c)!;
        const v = velocities.get(c)!;
        // F = k * (target - pos); v += F; v *= damping; pos += v
        v.x += (t.x - cur.x) * STIFF;
        v.y += (t.y - cur.y) * STIFF;
        v.x *= DAMP;
        v.y *= DAMP;
        cur.x += v.x;
        cur.y += v.y;
        c.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
        if (Math.abs(v.x) > 0.02 || Math.abs(v.y) > 0.02 || Math.abs(t.x - cur.x) > 0.1 || Math.abs(t.y - cur.y) > 0.1) moving = true;
      });

      if (moving || hovering) raf = requestAnimationFrame(compute); else raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      // игнорим тач/перо
      if ((e as any).pointerType && (e as any).pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      // если по какой-то причине pointerenter не пришёл, активируемся на первом движении
      if (!hovering) hovering = true;
      if (!raf) compute();
    };
    const onEnter = (e?: PointerEvent) => {
      if (e && (e as any).pointerType && (e as any).pointerType !== 'mouse') return;
      hovering = true; if (!raf) compute(); };
    const onLeave = (e?: PointerEvent) => { hovering = false; if (!raf) compute(); };

    // Слушаем на window, чтобы не терять события из-за вложенных слоёв
    window.addEventListener('pointermove', onMove as any, { passive: true } as any);
    area.addEventListener('pointerenter', onEnter as any);
    area.addEventListener('pointerleave', onLeave as any);
    area.addEventListener('pointercancel', onLeave as any);
    return () => {
      window.removeEventListener('pointermove', onMove as any);
      area.removeEventListener('pointerenter', onEnter as any);
      area.removeEventListener('pointerleave', onLeave as any);
      area.removeEventListener('pointercancel', onLeave as any);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion, lang]);
  const poster =
    (posterUrl && posterUrl.trim()) ||
    process.env.NEXT_PUBLIC_HERO_POSTER_URL ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop";

  // Note: events list moved into separate component.

  return (
    <>
    <section
      aria-label="Video hero"
      className="relative w-screen max-w-[100vw] overflow-hidden heroFold"
      ref={sectionRef as any}
    >
      {/* Restore original spacer to keep comfortable distance from header */}
      <div className="h-24 sm:h-29" />

      {/* fixed 21:9 frame */}
      <div
        ref={containerRef}
        className="relative w-full sm:aspect-[21/9] overflow-hidden shadow-xl revealUp"
        style={{
          // Fix mobile height; fallback uses 100dvh to avoid dynamic address bar changes
          height: 'var(--vh-fixed, calc(100svh - 96px - env(safe-area-inset-bottom)))',
          ...(vhFixed ? ({ ['--vh-fixed' as any]: vhFixed } as React.CSSProperties) : null),
        }}
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

        {/* Overlay for text readability (stronger on small screens) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 sm:from-black/40 lg:from-black/35 via-black/15 to-black/0" />

        {/* Posh text */}
        <div ref={textWrapRef} className="absolute inset-0 flex items-center justify-center px-6 text-center">
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
              className={`${montserrat.className} font-bold lg:font-extrabold tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap text-[54px] sm:text-[64px] lg:text-[92px] xl:text-[108px] text-white`}
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
              className={`${marck.className} mt-1 sm:mt-0.5 text-[51px] sm:text-[48px] lg:text-[64px] xl:text-[84px] leading-none text-white`}
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
              <a
                ref={ctaRef}
                href="/booking"
                className={`cta inline-flex items-center justify-center px-6 sm:px-7 h-12 sm:h-[52px] rounded-full border text-[14px] sm:text-[15px] font-semibold tracking-[0.06em] uppercase select-none`}
                style={{
                  // gradient hotspot defaults
                  // @ts-ignore custom props — start with center coords but zero opacity
                  ['--gx' as any]: '50%',
                  ['--gy' as any]: '50%',
                  ['--gop' as any]: '0',
                  // ripple vars
                  // @ts-ignore
                  ['--rx' as any]: '50%',
                  ['--ry' as any]: '50%',
                  // prevent initial flash before CSS animation applies
                  opacity: 0
                }}
                onMouseMove={(e) => {
                  if (reduceMotion) return;
                  const t = e.currentTarget as HTMLAnchorElement;
                  const r = t.getBoundingClientRect();
                  const x = ((e.clientX - r.left) / r.width) * 100;
                  const y = ((e.clientY - r.top) / r.height) * 100;
                  let state = ctaAnimRef.current.get(t);
                  if (!state) {
                    state = { gx: x, gy: y, tgx: x, tgy: y, px: 0, py: 0, tpx: 0, tpy: 0, raf: 0 };
                    ctaAnimRef.current.set(t, state);
                  }
                  state.tgx = x; state.tgy = y;
                  t.style.setProperty('--gop', '1');
                  const tick = () => {
                    if (!state) return;
                    // hotspot easing (slower for maximum smoothness)
                    state.gx += (state.tgx - state.gx) * 0.10;
                    state.gy += (state.tgy - state.gy) * 0.10;
                    t.style.setProperty('--gx', `${state.gx}%`);
                    t.style.setProperty('--gy', `${state.gy}%`);
                    // parallax easing
                    state.px += (state.tpx - state.px) * 0.10;
                    state.py += (state.tpy - state.py) * 0.10;
                    t.style.setProperty('--tx', `${state.px.toFixed(2)}px`);
                  t.style.setProperty('--ty', `${state.py.toFixed(2)}px`);
                    const cont =
                      Math.abs(state.tgx - state.gx) > 0.05 ||
                      Math.abs(state.tgy - state.gy) > 0.05 ||
                      Math.abs(state.tpx - state.px) > 0.05 ||
                      Math.abs(state.tpy - state.py) > 0.05;
                    if (cont) { state.raf = requestAnimationFrame(tick); } else { state.raf = 0; }
                  };
                  if (!state.raf) state.raf = requestAnimationFrame(tick);
                  // micro-parallax
                  const dx = (x - 50) / 50; // -1..1
                  const dy = (y - 50) / 50;
                  state.tpx = dx * 1.8;
                  state.tpy = dy * 1.4;
                }}
                onMouseLeave={(e) => {
                  const t = e.currentTarget as HTMLAnchorElement;
                  const state = ctaAnimRef.current.get(t);
                  // ease back to center + fade out smoothly
                  if (state) {
                    state.tpx = 0; state.tpy = 0;
                    state.tgx = 50; state.tgy = 50;
                    const tickOut = () => {
                      if (!state) return;
                      state.gx += (state.tgx - state.gx) * 0.10;
                      state.gy += (state.tgy - state.gy) * 0.10;
                      t.style.setProperty('--gx', `${state.gx}%`);
                      t.style.setProperty('--gy', `${state.gy}%`);
                      state.px += (state.tpx - state.px) * 0.10;
                      state.py += (state.tpy - state.py) * 0.10;
                      t.style.setProperty('--tx', `${state.px.toFixed(2)}px`);
                      t.style.setProperty('--ty', `${state.py.toFixed(2)}px`);
                      const cont =
                        Math.abs(state.tgx - state.gx) > 0.05 ||
                        Math.abs(state.tgy - state.gy) > 0.05 ||
                        Math.abs(state.tpx - state.px) > 0.05 ||
                        Math.abs(state.tpy - state.py) > 0.05;
                      if (cont) { state.raf = requestAnimationFrame(tickOut); } else { state.raf = 0; }
                    };
                    if (!state.raf) state.raf = requestAnimationFrame(tickOut);
                  }
                  // fade
                  t.style.setProperty('--gop', '0');
                }}
                onPointerDown={(e) => {
                  // ignore press if ещё не закончен intro
                  if (!ctaRef.current) return;
                  const computedOpacity = getComputedStyle(ctaRef.current).opacity;
                  if (parseFloat(computedOpacity) < 0.99) return;
                  const t = e.currentTarget as HTMLAnchorElement;
                  const r = t.getBoundingClientRect();
                  const x = ((e.clientX - r.left) / r.width) * 100;
                  const y = ((e.clientY - r.top) / r.height) * 100;
                  t.style.setProperty('--rx', `${x}%`);
                  t.style.setProperty('--ry', `${y}%`);
                  if (!reduceMotion) {
                    t.classList.remove('press');
                    void t.offsetWidth; // restart animation
                    t.classList.add('press');
                    t.classList.remove('ripples');
                    void t.offsetWidth;
                    t.classList.add('ripples');
                  }
                }}
                onPointerUp={(e) => {
                  const t = e.currentTarget as HTMLAnchorElement;
                  t.classList.remove('press');
                }}
                onAnimationEnd={(e) => {
                  if (e.animationName === 'ctaIn' && ctaRef.current) {
                    // lock visible state so later animations (press) не обнуляли opacity
                    ctaRef.current.style.opacity = '1';
                    ctaRef.current.style.removeProperty('transform');
                  }
                }}
                >
                <span className="label relative z-[1]">
                  {lang === 'ru' ? 'Забронировать' : 'Book now'}
                </span>
                <span aria-hidden className="wave" />
              </a>
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
          .cta { position: relative; overflow: hidden; will-change: transform; transition: transform 360ms cubic-bezier(.18,.6,.2,1), box-shadow 300ms ease, border-color 300ms ease; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
          /* CTA appear after subtitle */
          .cta { opacity: 0; transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0); }
          .cta { animation: ctaIn 720ms cubic-bezier(.18,.6,.2,1) forwards; animation-delay: 1100ms; }
          @keyframes ctaIn { 
            from { opacity: 0; transform: translate3d(var(--tx, 0px), calc(var(--ty, 0px) + 6px), 0); }
            to { opacity: 1; transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0); }
          }
          @media (prefers-reduced-motion: reduce) { .cta { animation: none; opacity: 1; transform: none; } }
          .cta::before { content: ""; position: absolute; inset: -1px; border-radius: 9999px; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
          .cta::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; opacity: var(--gop, 0); transition: opacity 480ms ease; background: 
            /* white glint */
            radial-gradient(26px 26px at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.00) 6%),
            /* blue body */
            radial-gradient(98px 98px at var(--gx,50%) var(--gy,50%), rgba(156,167,255,1.0) 0%, rgba(133,145,245,0.96) 14%, rgba(133,145,245,0.74) 28%, rgba(133,145,245,0.00) 46%);
            mix-blend-mode: screen; }
          /* Ripple element */
          .wave { position: absolute; left: 0; top: 0; right: 0; bottom: 0; pointer-events: none; overflow: hidden; border-radius: 9999px; }
          .wave::before { content: ""; position: absolute; width: 12px; height: 12px; border-radius: 9999px; left: var(--rx,50%); top: var(--ry,50%); transform: translate(-50%, -50%) scale(0); background: radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0.00)); opacity: 0; }
          .ripples .wave::before { animation: ripple 700ms cubic-bezier(.2,.65,.2,1); }
          @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0); opacity: .35; } 60% { opacity: .18; } 100% { transform: translate(-50%, -50%) scale(14); opacity: 0; } }
          /* Press spring */
          .press { animation: pressSpring 260ms cubic-bezier(.2,.65,.2,1); }
          @keyframes pressSpring { 
            0% { transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(.98); }
            60% { transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(1.02); }
            100% { transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            .cta { transition: none; transform: none !important; }
            .cta::after { opacity: .18; }
          }
          @media (prefers-reduced-motion: reduce) {
            .char { transform: none !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-word { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
          }
          /* VideoHero local styles for the scroll hint */
          .vh-hint { position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); pointer-events: none; }
          :global(.vh-hint .sp-hintText) { color: rgba(255,255,255,0.94); opacity: .86; text-shadow: 0 1px 6px rgba(0,0,0,0.45); }
          /* Ранее на десктопе скрывали подсказку, теперь показываем на всех экранах */
          @media (min-width: 1024px) { :global(.vh-hint) { display: flex !important; } }
          /* Responsive CTA sizing from tablets down to small phones (shrink stronger than subtitle) */
          @media (max-width: 1023.98px) { :global(.heroFold .cta) { height: 46px !important; padding: 0 16px !important; font-size: 13.5px !important; } }
          @media (max-width: 768px) { :global(.heroFold .cta) { height: 44px !important; padding: 0 14px !important; font-size: 13px !important; } }
          @media (max-width: 640px) { :global(.heroFold .cta) { height: 44px !important; padding: 0 14px !important; font-size: 12.8px !important; } }
          @media (max-width: 480px) { :global(.heroFold .cta) { height: 42px !important; padding: 0 12px !important; font-size: 12.5px !important; } }
          @media (max-width: 360px) { :global(.heroFold .cta) { height: 38px !important; padding: 0 10px !important; font-size: 11.5px !important; letter-spacing: 0.045em !important; } }
        `}</style>
      </div>
    </section>
    {/* Sections below were moved to separate components to control ordering from the page. */}
    </>
  );
}
