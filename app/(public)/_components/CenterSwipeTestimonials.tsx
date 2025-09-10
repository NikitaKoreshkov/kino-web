"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type TestimonialCard = {
  quote: string;
  name: string;
  title?: string;
  avatar?: string;
};

type Props = {
  items: TestimonialCard[];
  width?: number; // slide width
  height?: number; // slide height
  gap?: number;
  className?: string;
};

export default function CenterSwipeTestimonials({
  items,
  width = 420,
  height = 280,
  gap = 16,
  className = "",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const programmaticRef = useRef(false);

  const list = useMemo(() => items || [], [items]);
  const n = list.length;
  const ext = useMemo(() => (n ? [...list, ...list, ...list] : []), [list, n]);
  const baseStart = useMemo(() => (n ? n : 0), [n]);

  // Wrap scroll to middle copy if near edges
  const wrapIfNeeded = () => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const first = track.children[baseStart] as HTMLElement | undefined;
    const last = track.children[baseStart + n - 1] as HTMLElement | undefined;
    if (!first || !last) return;
    const midStart = first.offsetLeft + first.offsetWidth / 2 - scroller.clientWidth / 2;
    const midEnd = last.offsetLeft + last.offsetWidth / 2 - scroller.clientWidth / 2;
    const cycleDist = midEnd - midStart;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    if (centerX < midStart - cycleDist / 2) {
      scroller.scrollLeft += cycleDist;
    } else if (centerX > midStart + cycleDist / 2) {
      scroller.scrollLeft -= cycleDist;
    }
  };

  // Find nearest index to center
  const updateActive = () => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestIdx = 0;
    let bestD = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement;
      if (!el) continue;
      const cx = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(cx - centerX);
      if (d < bestD) { bestD = d; bestIdx = i; }
    }
    const norm = (((bestIdx - baseStart) % n) + n) % n;
    setActive(norm);
  };

  // Scroll to index with nearest copy
  const scrollToIndex = (idx: number) => {
    const scroller = scrollerRef.current; const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const idxNorm = ((idx % n) + n) % n;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    const cands = [baseStart + idxNorm - n, baseStart + idxNorm, baseStart + idxNorm + n]
      .map(i => ({ i, el: track.children[i] as HTMLElement | undefined }))
      .filter(x => !!x.el) as { i: number, el: HTMLElement }[];
    if (!cands.length) return;
    let best = cands[0];
    let bestD = Math.abs((best.el.offsetLeft + best.el.offsetWidth / 2) - centerX);
    for (let k = 1; k < cands.length; k++) {
      const d = Math.abs((cands[k].el.offsetLeft + cands[k].el.offsetWidth / 2) - centerX);
      if (d < bestD) { best = cands[k]; bestD = d; }
    }
    const target = best.el.offsetLeft + best.el.offsetWidth / 2 - scroller.clientWidth / 2;
    programmaticRef.current = true;
    scroller.scrollTo({ left: target, behavior: "smooth" });
    let t0 = performance.now();
    const maxMs = 900;
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

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !n) return;
    // position to middle copy initially
    const t = trackRef.current;
    const el = t?.children[baseStart] as HTMLElement | undefined;
    if (el) {
      scroller.scrollLeft = el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2;
    }
    const onScroll = () => {
      if (!programmaticRef.current) wrapIfNeeded();
      updateActive();
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [n, baseStart]);

  if (!n) return null;

  return (
    <section className={`tSwipeSection ${className}`}
      style={{
        // @ts-ignore
        ['--t-w' as any]: `${width}px`,
        // @ts-ignore
        ['--t-h' as any]: `${height}px`,
        // @ts-ignore
        ['--t-gap' as any]: `${gap}px`,
      }}
    >
      <div className="tswipe" ref={scrollerRef}>
        <div className="ttrack" ref={trackRef}>
          {ext.map((t, i) => (
            <div
              key={i}
              className={`titem${(((i % n) + n) % n) === active ? ' is-active' : ''}`}
              onClick={() => {
                const idxNorm = (((i % n) + n) % n);
                if (idxNorm === active) {
                  scrollToIndex((active + 1) % n);
                } else {
                  scrollToIndex(idxNorm);
                }
              }}
            >
              <article className="tcard">
                <p className="tquote">{t.quote}</p>
                <div className="tperson">
                  {t.avatar ? (
                    <img className="tavatar" src={t.avatar} alt={t.name} />
                  ) : (
                    <div className="tavatar tavatar-fallback" aria-hidden>
                      <span>{t.name.split(" ").slice(0,2).map(p=>p[0]?.toUpperCase()).join("")}</span>
                    </div>
                  )}
                  <div className="tmeta">
                    <strong>{t.name}</strong>
                    {t.title && <span>{t.title}</span>}
                  </div>
                </div>
              </article>
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
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to testimonial ${i+1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
