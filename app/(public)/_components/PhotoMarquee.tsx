"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GlassPanelShell from "./GlassPanelShell";
import MediaPlaceholder from "./MediaPlaceholder";

type Props = {
  images: { src: string; alt?: string }[];
  height?: number; // px row height
  width?: number;  // px image width (approx, responsive via CSS)
  gap?: number;    // px gap between images
  speedSec?: number; // seconds per cycle
  reverse?: boolean; // direction of second row if needed
  pauseOnHover?: boolean;
  className?: string;
  /** Glass rim tiles (static, no elasticity) for premium marquees */
  glass?: boolean;
};

/**
 * Seamless photo marquee row.
 * - Duplicates items to ensure gapless loop
 * - Uses CSS variable driven animation duration and direction
 * - Pauses on hover (container-level)
 */
export default function PhotoMarquee({
  images,
  height = 160,
  width = 240,
  gap = 16,
  speedSec = 8,
  reverse = false,
  pauseOnHover = true,
  className = "",
  glass = false,
}: Props) {
  // Fixed-size base window of 8 items, cycling source images if их меньше
  const windowSize = 8;
  const source = images.length ? images : Array.from({ length: windowSize }, () => ({ src: "", alt: "" }));
  const items = Array.from({ length: windowSize }, (_, i) => source[i % Math.max(1, source.length)]);
  // Duplicate for seamless loop A + A
  const loop = [...items, ...items];
  const shellRef = useRef<HTMLDivElement | null>(null); // outer, not scrollable
  const scrollerRef = useRef<HTMLDivElement | null>(null); // inner, scrollable on mobile
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [jsMode, setJsMode] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  // How many tiles to eagerly load at the leading edge (and at the seam)
  const [preloadCount, setPreloadCount] = useState<number>(4);

  // Mobile breakpoint detection (<=1023px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const apply = () => setIsMobile(window.innerWidth <= 1023);
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  // Switch modes based on breakpoint
  useEffect(() => {
    setJsMode(!isMobile); // desktop: JS marquee; mobile: no JS animation
  }, [isMobile]);

  // Reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduceMotion(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Smoothly mark images as loaded to trigger CSS fade/blur release
  useEffect(() => {
    const root = shellRef.current; if (!root) return;
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    imgs.forEach((img) => {
      const parent = img.closest('.pm-item');
      const mark = () => parent && parent.classList.add('loaded');
      if (img.complete && img.naturalWidth > 0) {
        // ensure paint-ready
        img.decode?.().then(mark).catch(mark);
      } else {
        const onLoad = () => { img.decode?.().then(mark).catch(mark); img.removeEventListener('load', onLoad); };
        img.addEventListener('load', onLoad);
      }
    });
  }, [loop.length]);

  // Fixed preload: всегда 4 лидера
  useEffect(() => { setPreloadCount(4); }, []);

  // JS-driven marquee to avoid subpixel stutter on ultra-wide screens (desktop only)
  useEffect(() => {
    if (!jsMode) return;
    const root = shellRef.current; const track = trackRef.current; if (!root || !track) return;

    let raf = 0; let last = performance.now();
    let x = 0; // current translateX in px
    let paused = false;

    // Hard-disable any CSS animation that might be applied by stylesheets
    track.style.animation = 'none';
    track.style.animationName = 'none';

    const recompute = () => {
      x = 0;
      track.style.transform = `translate3d(${x}px,0,0)`;
    };
    // compute speed: pixels per second to travel exactly half of the track in speedSec
    // robust half calculation: distance between start of A[0] and A'[0] (child[n]) including flex gap
    const getHalf = () => {
      const children = Array.from(track.children) as HTMLElement[];
      const n = items.length;
      if (!children.length || n === 0) return track.scrollWidth / 2;
      const first = children[0];
      const firstDup = children[n];
      if (!first || !firstDup) return track.scrollWidth / 2;
      const left0 = first.offsetLeft;
      const half = firstDup.offsetLeft - left0;
      return Math.max(1, half);
    };
    const velocity = () => getHalf() / Math.max(0.0001, speedSec);

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && !reduceMotion) {
        const v = velocity() * (reverse ? 1 : -1);
        x += v * dt;
        const half = getHalf();
        if (half > 0.5) {
          // modulo-based wrap to keep x in [-half, 0) for normal, ( -half, 0 ] for reverse
          if (!reverse) {
            if (x <= -half) {
              const t = (-x) % half; // 0..half
              x = -t;
            }
          } else {
            if (x >= 0) {
              const t = x % half; // 0..half
              x = (t === 0 ? -half : t - half);
            }
          }
        }
        track.style.transform = `translate3d(${x.toFixed(3)}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => recompute();
    const onPointerOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.(".pm-item")) paused = true;
    };
    const onPointerOut = (e: PointerEvent) => {
      const rel = e.relatedTarget as Element | null;
      // Unpause only when leaving this row entirely, or moving to a non-tile gap
      if (!rel || !root.contains(rel)) {
        paused = false;
        return;
      }
      if (!rel.closest?.(".pm-item")) paused = false;
    };
    window.addEventListener("resize", onResize);
    if (pauseOnHover) {
      root.addEventListener("pointerover", onPointerOver);
      root.addEventListener("pointerout", onPointerOut);
    }
    recompute();
    last = performance.now();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (pauseOnHover) {
        root.removeEventListener("pointerover", onPointerOver);
        root.removeEventListener("pointerout", onPointerOut);
      }
    };
  }, [jsMode, speedSec, reverse, pauseOnHover, reduceMotion, loop.length, items.length, gap]);

  // Swipe navigation (mobile): scroll by one tile width
  const scrollByTile = (dir: 1 | -1) => {
    const track = trackRef.current; if (!track) return;
    const firstTile = track.querySelector<HTMLElement>('.pm-item');
    const tileWidth = firstTile ? (firstTile.offsetWidth + (parseFloat(getComputedStyle(track).gap || '0') || 0)) : (width + gap);
    const scroller = scrollerRef.current; // inner container scrolls
    if (!scroller) return;
    scroller.scrollBy({ left: dir * tileWidth, behavior: 'smooth' });
  };

  // For mobile swipe: add ghost items at both ends to allow perfect centering near edges
  const renderList = useMemo(() => {
    if (!isMobile) return loop.map((img) => ({ img, ghost: false }));
    const n = source.length;
    if (!n) return [] as Array<{ img: { src: string; alt?: string }, ghost: boolean }>;
    const head = { img: source[0], ghost: true };
    const tail = { img: source[n - 1], ghost: true };
    return [head, ...source.map((img) => ({ img, ghost: false })), tail];
  }, [isMobile, source, loop]);

  // Precise side padding on mobile to avoid snap rounding between 3rd and 4th slide
  useEffect(() => {
    if (!isMobile) return;
    if (typeof window === 'undefined') return;
    const scroller = scrollerRef.current; const track = trackRef.current;
    if (!scroller || !track) return;
    let ro: ResizeObserver | null = null;
    const apply = () => {
      const first = track.querySelector<HTMLElement>('.pm-item');
      const tileW = first ? first.offsetWidth : width;
      const contW = scroller.clientWidth;
      const pad = Math.max(16, Math.round((contW - tileW) / 2));
      scroller.style.paddingLeft = pad + 'px';
      scroller.style.paddingRight = pad + 'px';
      scroller.style.scrollPaddingLeft = pad + 'px';
      scroller.style.scrollPaddingRight = pad + 'px';
    };
    apply();
    // Update on resize
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    if (RO) { ro = new RO(() => apply()); ro.observe(scroller); ro.observe(document.body); }
    window.addEventListener('orientationchange', apply);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('orientationchange', apply); };
  }, [isMobile, width]);

  return (
    <div
      className={`pm-shell${className ? ` ${className}` : ""}${glass ? " pm-glassShell" : ""}`}
      style={{
        // Всегда выставляем размеры через CSS-переменные, чтобы расчёты center-padding и snap были точными на мобильных
        // @ts-ignore custom props
        ['--pm-h' as any]: `${height}px`,
        // @ts-ignore
        ['--pm-w' as any]: `${width}px`,
        // @ts-ignore
        ['--pm-gap' as any]: `${gap}px`,
        // @ts-ignore
        ['--pm-dur' as any]: `${speedSec}s`,
        // @ts-ignore
        ['--pm-dir' as any]: reverse ? 'reverse' : 'normal',
        // Небольшая задержка, чтобы дать первым тайлам декодироваться
        // @ts-ignore
        ['--pm-delay' as any]: `480ms`,
      }}
      aria-hidden
      ref={shellRef}
    >
      <div
        className={`pm-container pm-run${pauseOnHover && !glass ? " hoverPause" : ""} ${jsMode ? 'jsMarquee' : ''} ${isMobile ? 'pm-swipe' : ''}`}
        ref={scrollerRef}
      >
        <div className="pm-track" ref={trackRef} style={{ willChange: 'transform' }}>
        {renderList.map((entry, i) => {
          const img = (entry as any).img || (entry as any);
          const ghost = !!(entry as any).ghost;
          const n = items.length;
          // Preload first N entering tiles and their seam duplicates
          let isLeader = false;
          if (!reverse) {
            // start: 0..preloadCount-1, seam: n..n+preloadCount-1
            isLeader = (i < preloadCount) || (i >= n && i < n + preloadCount);
          } else {
            // start: n-preloadCount..n-1, seam: 2n-preloadCount..2n-1
            isLeader = (i >= n - preloadCount && i < n) || (i >= 2 * n - preloadCount);
          }
          return (
          <GlassPanelShell
            key={i}
            className={`pm-item${glass ? " pm-glass" : ""}${isLeader ? " preload" : ""}${ghost ? " ghost" : ""}${img?.src ? "" : " loaded"}`}
            disabled
            aria-hidden={ghost ? true : undefined}
          >
            {img?.src ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt || ''}
                  loading={isLeader ? 'eager' : 'lazy'}
                  decoding="async"
                  width={Math.round(width)}
                  height={Math.round(height)}
                  fetchPriority={isLeader ? 'high' : 'auto'}
                />
              </>
            ) : (
              <MediaPlaceholder className="pm-placeholder" />
            )}
          </GlassPanelShell>
        );})}
        </div>
      </div>
      {/* Mobile arrows (overlay on shell) */}
      {isMobile && (
        <div className="pm-arrows">
          <GlassPanelShell as="button" className="pm-arrow pm-prev" aria-label={"Предыдущая"} onClick={() => scrollByTile(-1)} />
          <GlassPanelShell as="button" className="pm-arrow pm-next" aria-label={"Следующая"} onClick={() => scrollByTile(1)} />
        </div>
      )}
    </div>
  );
}
