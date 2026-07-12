"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import MediaPlaceholder from "./MediaPlaceholder";

export type CenterSwipeGalleryProps = {
  images: { src: string; alt?: string }[];
  width?: number;   // tile width (px)
  height?: number;  // tile height (px)
  gap?: number;     // gap between tiles (px)
  className?: string;
};

/**
 * CenterSwipeGallery
 * - Первая карточка сразу по центру (за счёт симметричных внутренних отступов контейнера)
 * - Свайп влево/вправо с scroll-snap-align: center
 * - Активная (центральная) карточка масштабируется до 1.0, соседние ~0.9
 * - Индикатор-точки снизу, кликабелен
 */
export default function CenterSwipeGallery({
  images,
  width = 520,
  height = 400,
  gap = 18,
  className = "",
}: CenterSwipeGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const programmaticRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // track viewport to switch to CSS defaults on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023.98px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const list = useMemo(() => images || [], [images]);
  const n = list.length;
  const ext = useMemo(() => (n ? [...list, ...list, ...list] : []), [list, n]);
  const baseStart = n; // индекс начала среднего цикла

  // Найдём ближайший к центру индекс
  const updateActiveFromScroll = () => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    const tiles = Array.from(track.children) as HTMLElement[];
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    tiles.forEach((el, i) => {
      const rectLeft = el.offsetLeft;
      const mid = rectLeft + el.offsetWidth / 2;
      const d = Math.abs(mid - centerX);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    // нормализуем к базовому списку
    setActive(((bestIdx % n) + n) % n);
  };

  // Подписка на скролл и ресайз
  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { updateActiveFromScroll(); if (!programmaticRef.current) wrapIfNeeded(); }); };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // первичная установка
    // выставим старт: первая карточка в центре среднего цикла
    programmaticRef.current = true;
    const initEl = track.children[baseStart] as HTMLElement | undefined;
    if (initEl) {
      const target = initEl.offsetLeft + initEl.offsetWidth / 2 - scroller.clientWidth / 2;
      scroller.scrollTo({ left: target, behavior: "auto" });
    }
    onScroll();
    // короткая задержка, чтобы отключить защиту
    setTimeout(() => { programmaticRef.current = false; }, 50);
    return () => { scroller.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [n]);

  // Невидимая переустановка положения при выходе за границы цикла
  const wrapIfNeeded = () => {
    const scroller = scrollerRef.current; const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const tiles = Array.from(track.children) as HTMLElement[];
    const midStartEl = tiles[baseStart] as HTMLElement | undefined; // первый элемент среднего цикла
    const nextStartEl = tiles[baseStart + n] as HTMLElement | undefined; // первый элемент следующего цикла
    if (!midStartEl || !nextStartEl) return;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    const midStart = midStartEl.offsetLeft + midStartEl.offsetWidth / 2;
    const cycleDist = (nextStartEl.offsetLeft + nextStartEl.offsetWidth / 2) - midStart;
    if (cycleDist <= 1) return;
    // если уехали левее половины цикла от середины — перенесём вперёд на длину цикла
    if (centerX < midStart - cycleDist / 2) {
      scroller.scrollLeft += cycleDist;
    } else if (centerX > midStart + cycleDist / 2) {
      scroller.scrollLeft -= cycleDist;
    }
  };

  // Прокрутка к нужному индексу по клику на точке
  const scrollToIndex = (idx: number) => {
    const scroller = scrollerRef.current; const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const idxNorm = ((idx % n) + n) % n;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    // кандидаты: предыдущий цикл, средний, следующий
    const cands = [baseStart + idxNorm - n, baseStart + idxNorm, baseStart + idxNorm + n]
      .map(i => ({ i, el: track.children[i] as HTMLElement | undefined }))
      .filter(x => !!x.el) as { i: number, el: HTMLElement }[];
    if (!cands.length) return;
    // выбираем ближайший к текущему центру
    let best = cands[0];
    let bestD = Math.abs((best.el.offsetLeft + best.el.offsetWidth / 2) - centerX);
    for (let k = 1; k < cands.length; k++) {
      const d = Math.abs((cands[k].el.offsetLeft + cands[k].el.offsetWidth / 2) - centerX);
      if (d < bestD) { best = cands[k]; bestD = d; }
    }
    const target = best.el.offsetLeft + best.el.offsetWidth / 2 - scroller.clientWidth / 2;
    programmaticRef.current = true;
    scroller.scrollTo({ left: target, behavior: "smooth" });
    // мониторим достижение цели, затем снимаем флаг
    let t0 = performance.now();
    const maxMs = 800;
    const tick = () => {
      const done = Math.abs(scroller.scrollLeft - target) < 1;
      if (done || performance.now() - t0 > maxMs) {
        programmaticRef.current = false;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const shellStyle: React.CSSProperties = isMobile ? {} : {
    // CSS variables для размеров (desktop/tablet >1023)
    // @ts-ignore
    ['--c-w' as any]: `${width}px`,
    // @ts-ignore
    ['--c-h' as any]: `${height}px`,
    // @ts-ignore
    ['--c-gap' as any]: `${gap}px`,
  };

  return (
    <div className={`cshell ${className}`} style={shellStyle}>
      <div className="cswipe" ref={scrollerRef}>
        <div className="ctrack" ref={trackRef}>
          {ext.map((img, i) => (
            <div
              key={i}
              className={`citem${(((i % n) + n) % n) === active ? ' is-active' : ''}`}
              onClick={() => {
                const idxNorm = (((i % n) + n) % n);
                if (idxNorm === active) {
                  scrollToIndex((active + 1) % n);
                } else {
                  scrollToIndex(idxNorm);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {img.src ? (
                <img src={img.src} alt={img.alt || ''} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
              ) : (
                <MediaPlaceholder className="citemPlaceholder" />
              )}
            </div>
          ))}
        </div>
      </div>
      {list.length > 1 && (
        <div className="cdots" aria-hidden>
          {list.map((_, i) => (
            <button
              key={i}
              className={`cdot${i === active ? ' is-active' : ''}`}
              aria-label={`Перейти к фото ${i+1}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
