"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GlassPanelShell from "./GlassPanelShell";

export type TestimonialCard = {
  quote: string;
  name: string;
  title?: string;
  avatar?: string;
};

type Props = {
  items: TestimonialCard[];
  width?: number;
  height?: number;
  gap?: number;
  className?: string;
};

const SWIPE_SUPPRESS_PX = 10;

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
  const pointerStartX = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const list = useMemo(() => items || [], [items]);
  const n = list.length;
  const ext = useMemo(() => (n ? [...list, ...list, ...list] : []), [list, n]);
  const baseStart = n;

  // Full cycle length = distance between matching cards in adjacent copies (n * stride)
  const wrapIfNeeded = () => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const midStartEl = track.children[baseStart] as HTMLElement | undefined;
    const nextStartEl = track.children[baseStart + n] as HTMLElement | undefined;
    if (!midStartEl || !nextStartEl) return;

    const midStart = midStartEl.offsetLeft + midStartEl.offsetWidth / 2;
    const cycleDist =
      nextStartEl.offsetLeft + nextStartEl.offsetWidth / 2 - midStart;
    if (cycleDist <= 1) return;

    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    if (centerX < midStart - cycleDist / 2) {
      scroller.scrollLeft += cycleDist;
    } else if (centerX > midStart + cycleDist / 2) {
      scroller.scrollLeft -= cycleDist;
    }
  };

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
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    setActive((((bestIdx - baseStart) % n) + n) % n);
  };

  const scrollToIndex = (idx: number, behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;
    const idxNorm = ((idx % n) + n) % n;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    const cands = [baseStart + idxNorm - n, baseStart + idxNorm, baseStart + idxNorm + n]
      .map((i) => ({ i, el: track.children[i] as HTMLElement | undefined }))
      .filter((x): x is { i: number; el: HTMLElement } => !!x.el);
    if (!cands.length) return;

    let best = cands[0];
    let bestD = Math.abs(best.el.offsetLeft + best.el.offsetWidth / 2 - centerX);
    for (let k = 1; k < cands.length; k++) {
      const d = Math.abs(cands[k].el.offsetLeft + cands[k].el.offsetWidth / 2 - centerX);
      if (d < bestD) {
        best = cands[k];
        bestD = d;
      }
    }

    const target = best.el.offsetLeft + best.el.offsetWidth / 2 - scroller.clientWidth / 2;
    programmaticRef.current = true;
    scroller.scrollTo({ left: target, behavior });
    const t0 = performance.now();
    const maxMs = 900;
    const tick = () => {
      if (Math.abs(scroller.scrollLeft - target) < 1 || performance.now() - t0 > maxMs) {
        programmaticRef.current = false;
        wrapIfNeeded();
        updateActive();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || !n) return;

    programmaticRef.current = true;
    const el = track.children[baseStart] as HTMLElement | undefined;
    if (el) {
      scroller.scrollLeft = el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!programmaticRef.current) wrapIfNeeded();
        updateActive();
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    const unlock = window.setTimeout(() => {
      programmaticRef.current = false;
    }, 60);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(unlock);
    };
  }, [n, baseStart]);

  // After a horizontal swipe, browsers still fire click — ignore it
  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    suppressClickRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerStartX.current == null) return;
    if (Math.abs(e.clientX - pointerStartX.current) > SWIPE_SUPPRESS_PX) {
      suppressClickRef.current = true;
    }
  };

  const onPointerUp = () => {
    pointerStartX.current = null;
  };

  const onCardClick = (i: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    const idxNorm = (((i % n) + n) % n);
    // Tap a side card → center it. Tap the active card → do nothing
    // (swipe already owns next/prev; advancing on tap fights reverse swipes)
    if (idxNorm !== active) scrollToIndex(idxNorm);
  };

  if (!n) return null;

  return (
    <section
      className={`tSwipeSection ${className}`}
      style={{
        ["--t-w" as string]: `${width}px`,
        ["--t-h" as string]: `${height}px`,
        ["--t-gap" as string]: `${gap}px`,
      }}
    >
      <div
        className="tswipe"
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="ttrack" ref={trackRef}>
          {ext.map((t, i) => (
            <div
              key={i}
              className={`titem${(((i % n) + n) % n) === active ? " is-active" : ""}`}
              onClick={() => onCardClick(i)}
            >
              <GlassPanelShell
                as="article"
                className={`tmCard tcard${(((i % n) + n) % n) === active ? " isHover" : ""}`}
                disabled
                elasticity={0}
              >
                <span className="tmMark" aria-hidden>
                  “
                </span>
                <p className="tmQuote tquote">{t.quote}</p>
                <div className="tmFoot">
                  <div className="tmPerson tperson">
                    {t.avatar ? (
                      <img className="tmAvatarImg tavatar" src={t.avatar} alt={t.name} />
                    ) : (
                      <div className="tmAvatar tavatar tavatar-fallback" aria-hidden>
                        <span>
                          {t.name
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0]?.toUpperCase())
                            .join("")}
                        </span>
                      </div>
                    )}
                    <div className="tmMeta tmeta">
                      <strong>{t.name}</strong>
                      {t.title && <span>{t.title}</span>}
                    </div>
                  </div>
                </div>
              </GlassPanelShell>
            </div>
          ))}
        </div>
      </div>
      {list.length > 1 && (
        <div className="cdots" aria-hidden>
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`cdot${i === active ? " is-active" : ""}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
