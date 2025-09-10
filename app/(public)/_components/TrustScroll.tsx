"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Montserrat } from "next/font/google";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["700", "800"], display: "swap" });

export default function TrustScroll() {
  const { lang } = useLang();
  const t = getTexts(lang).trust as any;
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const leftLimiterRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLElement | null>(null);

  // Правый столбец: плавное затухание карточек возле верхнего края
  useEffect(() => {
    if (typeof window === "undefined") return;
    const right = rightColRef.current;
    if (!right) return;

    let raf = 0;
    let activeUntil = 0;

    const compute = () => {
      const vh = window.innerHeight;
      const threshold = Math.max(160, Math.round(vh * 0.52));
      const span = Math.max(420, Math.round(vh * 0.68));
      const cards = Array.from(right.querySelectorAll<HTMLElement>(".tsCard"));
      for (const el of cards) {
        const r = el.getBoundingClientRect();
        const raw = (threshold - r.top) / span;
        const p = Math.max(0, Math.min(1, raw));
        const pe = p * p * (3 - 2 * p); // smoothstep
        const target = 1 - pe;
        let prev = Number((el as any).__op);
        if (!Number.isFinite(prev)) {
          prev = parseFloat(getComputedStyle(el).opacity) || 1;
        }
        const delta = target - prev;
        const mag = Math.abs(delta);
        const k = Date.now() < activeUntil ? 1 : mag > 0.35 ? 0.45 : mag > 0.12 ? 0.3 : 0.18;
        const eased = prev + delta * k;
        (el as any).__op = eased;
        el.style.opacity = eased.toFixed(3);
      }
    };

    const tick = () => {
      compute();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const onScrollActive = () => {
      activeUntil = Date.now() + 140;
    };

    window.addEventListener("scroll", onScrollActive, { passive: true });
    window.addEventListener("wheel", onScrollActive as any, { passive: true } as any);
    window.addEventListener("touchmove", onScrollActive as any, { passive: true } as any);

    return () => {
      window.removeEventListener("scroll", onScrollActive as any);
      window.removeEventListener("wheel", onScrollActive as any);
      window.removeEventListener("touchmove", onScrollActive as any);
      if (raf) cancelAnimationFrame(raf);
      const all = Array.from(right.querySelectorAll<HTMLElement>(".tsCard"));
      for (const el of all) {
        el.style.opacity = "";
        (el as any).__op = undefined;
      }
    };
  }, []);

  // Первая карточка — одноразовое появление снизу
  useEffect(() => {
    if (!firstCardRef.current) return;
    const el = firstCardRef.current;
    el.classList.add("tsReveal");
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.15) {
            el.classList.add("is-revealed");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.15, 0.3] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Синхронизация высоты ограничителя слева с фактической высотой правой колонки
  useEffect(() => {
    const right = rightColRef.current;
    const limiter = leftLimiterRef.current;
    if (!right || !limiter) return;
    let raf = 0;
    const compute = () => {
      // Целевой путь липкого блока — до низа 3-й карточки
      const grid = right.querySelector('.tsGrid') as HTMLDivElement | null;
      const cards = grid ? (Array.from(grid.querySelectorAll('.tsCard')) as HTMLElement[]) : [];
      const target = cards[2];
      let desired = 0;
      if (target) {
        const rTop = right.getBoundingClientRect().top + window.scrollY;
        const tBottom = target.getBoundingClientRect().bottom + window.scrollY;
        // расстояние внутри правой колонки до низа 3-й карточки
        const distanceInsideRight = Math.max(0, tBottom - rTop);
        // параметры sticky
        const sticky = limiter.querySelector('.tsSticky') as HTMLElement | null;
        const stickyH = sticky ? sticky.offsetHeight : 0;
        const stickyTop = sticky ? parseFloat(getComputedStyle(sticky).top || '0') || 0 : 0;
        // Правильная формула для контейнера sticky:
        // minHeight = stickyHeight + (distanceToTarget - stickyTop)
        const nudgeRaw = getComputedStyle(limiter).getPropertyValue('--sticky-nudge').trim();
        const nudge = parseFloat(nudgeRaw || '0') || 0;
        desired = Math.max(stickyH + Math.max(0, distanceInsideRight - stickyTop + nudge), stickyH + 1);
      } else {
        // запасной вариант — половина высоты
        const sticky = limiter.querySelector('.tsSticky') as HTMLElement | null;
        const stickyH = sticky ? sticky.offsetHeight : 0;
        const stickyTop = sticky ? parseFloat(getComputedStyle(sticky).top || '0') || 0 : 0;
        const nudgeRaw = getComputedStyle(limiter).getPropertyValue('--sticky-nudge').trim();
        const nudge = parseFloat(nudgeRaw || '0') || 0;
        desired = Math.max(stickyH + Math.max(0, Math.round(right.scrollHeight * 0.5) - stickyTop + nudge), stickyH + 1);
      }
      const off = Math.max(0, right.scrollHeight - desired);
      limiter.style.setProperty('--sticky-release-offset', off + 'px');
      limiter.style.minHeight = desired + 'px';
      raf = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    schedule();
    window.addEventListener("resize", schedule);
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    const ro = RO ? new RO(schedule) : null;
    if (ro) ro.observe(right);
    // пересчёт при загрузке картинок
    const imgs = Array.from(right.querySelectorAll('img')) as HTMLImageElement[];
    const onImg = schedule;
    imgs.forEach((img) => img.addEventListener('load', onImg, { once: true } as any));
    return () => {
      window.removeEventListener("resize", schedule as any);
      if (ro) ro.disconnect();
      imgs.forEach((img) => img.removeEventListener('load', onImg as any));
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const items = useMemo(() => {
    const arr = Array.isArray((t as any).items) ? (t as any).items : [];
    return arr as { title: string; text: string }[];
  }, [t]);

  return (
    <section id="trust" className="tsRoot mt-12 sm:mt-16 lg:mt-12">
      <div className="tsContainer">
        {/* Левая колонка (липкая) */}
        <div className="tsLeft">
          <div className="tsLimiter" ref={leftLimiterRef}>
            <div className="tsSticky">
              <h2 className={`${montserrat.className} tsTitle`}>{t.title}</h2>
              <p className="tsSub">{t.sub}</p>
            </div>
          </div>
        </div>

        {/* Правая колонка (карточки с затуханием) */}
        <div className="tsRight" ref={rightColRef}>
          <div className="tsGrid">
            {items.map((it, idx) => (
              <article
                key={it.title}
                className="tsCard"
                ref={idx === 0 ? (firstCardRef as any) : undefined}
              >
                <h3 className="tsCardTitle">{it.title}</h3>
                <p className="tsCardText">{it.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      </section>
  );
}
