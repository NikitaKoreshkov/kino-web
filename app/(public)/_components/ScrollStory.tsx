"use client";

import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useLang } from "../../lang";

export type ScrollStoryCard = {
  id: string | number;
  image?: string; // URL from CDN/DB later
  text: string; // title or main line
  durationMin?: number; // meta: duration in minutes
};

export type ScrollStoryEvent = {
  id: string | number;
  title: string;
  image?: string; // hero image
  cards: ScrollStoryCard[]; // expected 6 per event
};

export type ScrollStoryProps = {
  lang?: "ru" | "en";
  events?: ScrollStoryEvent[]; // if not provided, component uses mock
  promoImage?: string; // optional override for left promo image
};

// ————————————————————————————————————————————
// Scaffold with sensible defaults. Ready for dynamic data injection later.
// ————————————————————————————————————————————
function StoryBlock({
  lang,
  event,
  tempCard,
  promoImage,
}: {
  lang: "ru" | "en";
  event: ScrollStoryEvent;
  tempCard: string;
  promoImage?: string;
}) {
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const leftLimiterRef = useRef<HTMLDivElement | null>(null);
  const promoRef = useRef<HTMLElement | null>(null);
  const promoImgRef = useRef<HTMLImageElement | null>(null);
  const promoCtaRef = useRef<HTMLAnchorElement | null>(null);
  // Smooth hotspot/parallax state for promo CTA
  const promoCtaAnimRef = useRef(
    new WeakMap<
      HTMLElement,
      { gx: number; gy: number; tgx: number; tgy: number; px: number; py: number; tpx: number; tpy: number; raf: number }
    >()
  );

  // Viewport-based per-card fade out near top edge
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const right = rightColRef.current;
    if (!right) return;
    let cards = Array.from(right.querySelectorAll<HTMLElement>('.card'));
    if (cards.length) { for (const el of cards) { (el as HTMLElement).style.animation = 'none'; } }

    let raf = 0;
    let activeUntil = 0;
    const compute = () => {
      const vh = window.innerHeight;
      const threshold = Math.max(170, Math.round(vh * 0.55));
      const span = Math.max(480, Math.round(vh * 0.70));
      cards = Array.from(right.querySelectorAll<HTMLElement>('.card'));
      for (const el of cards) {
        const r = el.getBoundingClientRect();
        const raw = (threshold - r.top) / span;
        const p = Math.max(0, Math.min(1, raw));
        const pe = p * p * (3 - 2 * p);
        const targetOpacity = 1 - pe;
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== 'none') { (el as HTMLElement).style.animation = 'none'; }
        let prev = Number((el as any).__op);
        let eased: number;
        if (!Number.isFinite(prev)) {
          const co = parseFloat(getComputedStyle(el).opacity);
          prev = Number.isFinite(co) ? co : 1;
          (el as any).__op = prev;
        }
        {
          const delta = targetOpacity - prev; const mag = Math.abs(delta);
          const active = Date.now() < activeUntil;
          if (active) { eased = targetOpacity; }
          else if (mag < 0.003) { eased = targetOpacity; }
          else { const k = mag > 0.35 ? 0.45 : mag > 0.12 ? 0.30 : 0.18; eased = prev + delta * k; }
        }
        (el as any).__op = eased; el.style.setProperty('opacity', eased.toFixed(3), 'important');
      }
    };
    const tick = () => { compute(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const onResize = () => {};
    const onScrollActive = () => { activeUntil = Date.now() + 140; compute(); };
    const onWheel = () => { activeUntil = Date.now() + 140; compute(); };
    const onTouchMove = () => { activeUntil = Date.now() + 140; compute(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScrollActive, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true } as any);
    window.addEventListener('touchmove', onTouchMove, { passive: true } as any);
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    const ro = RO ? new RO(() => {}) : null; if (ro) { ro.observe(right); cards.forEach(c => ro.observe(c)); }
    const imgs = Array.from(right.querySelectorAll<HTMLImageElement>('img'));
    const imgHandler = () => {}; imgs.forEach(img => img.addEventListener('load', imgHandler, { once: true } as any));
    compute();
    return () => {
      window.removeEventListener('resize', onResize as any);
      window.removeEventListener('scroll', onScrollActive as any);
      window.removeEventListener('wheel', onWheel as any);
      window.removeEventListener('touchmove', onTouchMove as any);
      if (raf) cancelAnimationFrame(raf); if (ro) ro.disconnect();
      imgs.forEach(img => img.removeEventListener('load', imgHandler as any));
      const all = Array.from(right.querySelectorAll<HTMLElement>('.card'));
      for (const el of all) { el.style.opacity = ''; el.style.animation = ''; (el as any).__op = undefined; }
    };
  }, []);

  // Once-only reveal for the first card on approach
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = firstCardRef.current;
    if (!el) return;
    el.classList.add('revealUp');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { el.classList.add('is-revealed'); return; }
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > 0.15) {
          el.classList.add('is-revealed');
          obs.disconnect();
          break;
        }
      }
    }, { threshold: [0, 0.15, 0.3] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // (Hero parallax removed)

  // Progressive top fade height based on scroll
  useEffect(() => {
    if (typeof window === 'undefined') return; const right = rightColRef.current; if (!right) return;
    let raf = 0;
    const cssTargetPx = () => {
      const v = getComputedStyle(right).getPropertyValue('--fade-target').trim();
      const n = parseFloat(v || '0'); if (Number.isFinite(n) && n > 0) return n; const vh = window.innerHeight; return Math.max(320, Math.min(880, Math.round(vh * 0.56)));
    };
    const computeParams = () => {
      const rect = right.getBoundingClientRect(); const rightDocTop = rect.top + window.scrollY; const vh = window.innerHeight; const threshold = Math.max(40, Math.min(110, Math.round(vh * 0.07))); const startY = rightDocTop - threshold; const target = cssTargetPx(); const range = Math.max(target * 0.9, Math.round(vh * 0.8)); return { startY, range, target };
    };
    let params = computeParams();
    const update = () => { const { startY, range, target } = params; const sy = window.scrollY; const raw = (sy - startY) / range; const p = Math.max(0, Math.min(1, raw)); const pe = p * p; const h = pe * target; right.style.setProperty('--fade-height', `${h.toFixed(1)}px`); raf = 0; };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); }; const onResize = () => { params = computeParams(); onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize);
    onResize(); onScroll();
    return () => { window.removeEventListener('scroll', onScroll as any); window.removeEventListener('resize', onResize as any); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // Sync left limiter height to right column height (minus offset) to control sticky release point
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const right = rightColRef.current; const limiter = leftLimiterRef.current; if (!right || !limiter) return;
    let raf = 0;
    const compute = () => {
      const cs = getComputedStyle(limiter);
      const offRaw = cs.getPropertyValue('--sticky-release-offset').trim();
      const off = Number.parseFloat(offRaw || '0') || 0;
      const h = Math.max(0, right.offsetHeight - off);
      limiter.style.minHeight = h + 'px';
      raf = 0;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(compute); };
    const onResize = schedule;
    schedule();
    window.addEventListener('resize', onResize);
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    const ro = RO ? new RO(schedule) : null; if (ro) ro.observe(right);
    const imgs = Array.from(right.querySelectorAll('img')) as HTMLImageElement[];
    const onImg = schedule; imgs.forEach(img => img.addEventListener('load', onImg, { once: true } as any));
    return () => {
      window.removeEventListener('resize', onResize as any);
      if (ro) ro.disconnect();
      imgs.forEach(img => img.removeEventListener('load', onImg as any));
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // No hero/promo scroll effects — static layout
  // Subtle parallax for promo image (like hero video, but very gentle)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const card = promoRef.current; const img = promoImgRef.current;
    if (!card || !img) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { img.style.transform = ''; return; }
    let raf = 0; let tx = 0, ty = 0; let cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width; // 0..1
      const y = (e.clientY - r.top) / r.height;
      const dx = (x - 0.5) * 2; const dy = (y - 0.5) * 2; // -1..1
      tx = dx * 6; ty = dy * 4; // max translate px
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
      img.style.transform = `scale(1.08) translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) { raf = requestAnimationFrame(tick); } else { raf = 0; }
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className={"scrollStory"} aria-labelledby={`scroll-story-${event.id}`}>
      <div className="container">
        {/* Left promo card (sticky) */}
        <div className="leftCol" ref={leftColRef}>
          <div className="leftLimiter" ref={leftLimiterRef}>
          <article ref={promoRef as any} className="promoCard stickyLeft" aria-label={lang === 'ru' ? 'Промокарта' : 'Promo card'}>
            <div className="promoMedia">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={promoImgRef}
                src={promoImage || 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=1400&q=70'}
                alt={lang === 'ru' ? 'Пространство для новых идей' : 'A space for new ideas'}
                className="promoImg"
                loading="lazy"
              />
              <div className="promoImgShade" />
            </div>
            <div className="promoBody">
              <h3 className="promoTitle">
                {lang === 'ru' ? 'Пространство для новых идей' : 'A space for new ideas'}
              </h3>
              <p className="promoSub">
                {lang === 'ru'
                  ? 'Один вечер — больше, чем просто формат.'
                  : 'One evening — more than a format.'}
              </p>
              <div className="promoCtaRow">
                <a
                  ref={promoCtaRef}
                  href="/booking"
                  className="ctaBtn ctaPromo"
                  onMouseMove={(e) => {
                    const t = promoCtaRef.current; if (!t) return;
                    const r = t.getBoundingClientRect();
                    const x = ((e.clientX - r.left) / r.width) * 100;
                    const y = ((e.clientY - r.top) / r.height) * 100;
                    // keep global fallback in sync
                    t.style.setProperty('--mx', `${x}%`);
                    t.style.setProperty('--my', `${y}%`);
                    t.style.setProperty('--gop', '1');
                    let state = promoCtaAnimRef.current.get(t);
                    if (!state) { state = { gx: x, gy: y, tgx: x, tgy: y, px: 0, py: 0, tpx: 0, tpy: 0, raf: 0 } as any; promoCtaAnimRef.current.set(t, state as any); }
                    (state as any).tgx = x; (state as any).tgy = y;
                    const tick = () => {
                      const s: any = promoCtaAnimRef.current.get(t);
                      if (!s) return;
                      s.gx += (s.tgx - s.gx) * 0.10;
                      s.gy += (s.tgy - s.gy) * 0.10;
                      t.style.setProperty('--gx', `${s.gx}%`);
                      t.style.setProperty('--gy', `${s.gy}%`);
                      s.px += (s.tpx - s.px) * 0.10;
                      s.py += (s.tpy - s.py) * 0.10;
                      t.style.setProperty('--tx', `${s.px.toFixed(2)}px`);
                      t.style.setProperty('--ty', `${s.py.toFixed(2)}px`);
                      const cont = Math.abs(s.tgx - s.gx) > 0.05 || Math.abs(s.tgy - s.gy) > 0.05 || Math.abs(s.tpx - s.px) > 0.05 || Math.abs(s.tpy - s.py) > 0.05;
                      if (cont) { s.raf = requestAnimationFrame(tick); } else { s.raf = 0; }
                    };
                    if (!(state as any).raf) (state as any).raf = requestAnimationFrame(tick);
                    const dx = (x - 50) / 50; const dy = (y - 50) / 50;
                    (state as any).tpx = dx * 1.6; (state as any).tpy = dy * 1.2;
                  }}
                  onMouseLeave={() => {
                    const t = promoCtaRef.current; if (!t) return;
                    let state = promoCtaAnimRef.current.get(t) as any;
                    if (state) {
                      state.tpx = 0; state.tpy = 0; state.tgx = 50; state.tgy = 50;
                      // keep glow visible for a short time while easing to center
                      if (state.fadeTimer) { clearTimeout(state.fadeTimer); state.fadeTimer = null; }
                      state.fadeTimer = setTimeout(() => { t.style.setProperty('--gop', '0'); state.fadeTimer = null; }, 300);
                      const tickOut = () => {
                        const s: any = promoCtaAnimRef.current.get(t);
                        if (!s) return;
                        s.gx += (s.tgx - s.gx) * 0.08;
                        s.gy += (s.tgy - s.gy) * 0.08;
                        t.style.setProperty('--gx', `${s.gx}%`);
                        t.style.setProperty('--gy', `${s.gy}%`);
                        s.px += (s.tpx - s.px) * 0.08;
                        s.py += (s.tpy - s.py) * 0.08;
                        t.style.setProperty('--tx', `${s.px.toFixed(2)}px`);
                        t.style.setProperty('--ty', `${s.py.toFixed(2)}px`);
                        const cont = Math.abs(s.tgx - s.gx) > 0.05 || Math.abs(s.tgy - s.gy) > 0.05 || Math.abs(s.tpx - s.px) > 0.05 || Math.abs(s.tpy - s.py) > 0.05;
                        if (cont) { s.raf = requestAnimationFrame(tickOut); } else { s.raf = 0; }
                      };
                      if (!state.raf) state.raf = requestAnimationFrame(tickOut);
                    } else {
                      // fallback: hard reset
                      t.style.setProperty('--tx', '0px'); t.style.setProperty('--ty', '0px'); t.style.setProperty('--gx', '50%'); t.style.setProperty('--gy', '50%'); t.style.setProperty('--gop', '0');
                    }
                  }}
                  onPointerDown={(e) => {
                    const t = promoCtaRef.current; if (!t) return;
                    const r = t.getBoundingClientRect();
                    const x = ((e.clientX - r.left) / r.width) * 100;
                    const y = ((e.clientY - r.top) / r.height) * 100;
                    t.style.setProperty('--rx', `${x}%`);
                    t.style.setProperty('--ry', `${y}%`);
                    t.classList.remove('press'); void (t as any).offsetWidth; t.classList.add('press');
                    t.classList.remove('ripples'); void (t as any).offsetWidth; t.classList.add('ripples');
                  }}
                  onPointerUp={() => { const t = promoCtaRef.current; if (t) t.classList.remove('press'); }}
                >
                  {lang === 'ru' ? 'Забронировать место' : 'Reserve a spot'}
                  <span aria-hidden className="wave" />
                </a>
              </div>
            </div>
          </article>
          </div>

          {/* (Second promo card removed) */}
        </div>

        {/* Right list of cards */}
        <div className="rightCol" ref={rightColRef}>
          <section className="group" aria-labelledby={`group-${event.id}-title`}>
            <h3 id={`group-${event.id}-title`} className="groupTitle">{event.title}</h3>
            <div className="cards">
              {event.cards.slice(0, 6).map((c, i) => (
                <article
                  key={c.id}
                  className="card"
                  data-card-idx={i}
                  data-last={i === 5 ? 'true' : undefined}
                  ref={i === 0 ? (firstCardRef as any) : undefined}
                >
                  <div className="thumbWrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image || tempCard}
                      alt={c.text}
                      className="thumb"
                      loading="lazy"
                      onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.src = tempCard; }}
                    />
                    <div className="thumbGlass sparkle" />
                  </div>
                  <div className="cardBody">
                    <p className="cardText">{c.text}</p>
                    <div className="cardMeta">
                      <a
                        className="moreLink"
                        href={(function(){
                          const txt = (c.text || '').toLowerCase();
                          // RU/EN keyword mapping
                          const isFoam = /пенн|foam/.test(txt);
                          const isRain = /ливень|rain/.test(txt);
                          const isColor = /краск|color/.test(txt);
                          const isCandy = /сладкая\s+вата|candy/.test(txt);
                          const isPopcorn = /попкорн|popcorn/.test(txt);
                          const isPerformance = /перформанс|artist|mascot|performance/.test(txt);
                          const isBalls = /мяч|ball/.test(txt);
                          const isKino = /кино|экран|звук|cinema|screen|sound/.test(txt);
                          if (isCandy || isPopcorn) return '/about#masters';
                          if (isFoam || isRain || isColor) return '/about#yupi';
                          if (isPerformance || isBalls || isKino) return '/about#kino';
                          // fallback by index heuristics
                          if (i === 0 || i === 1 || i === 3) return '/about#yupi';
                          if (i === 4) return '/about#masters';
                          if (i === 2 || i === 5) return '/about#kino';
                          return '/about#about';
                        })()}
                        aria-label={(lang === 'ru' ? 'Подробнее: ' : 'More details: ') + c.text}
                      >
                        {lang === 'ru' ? 'Подробнее' : 'More details'}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
    {/* CTA animation styles (scoped) */}
    <style jsx>{`
      .ctaPromo { position: relative; overflow: hidden; will-change: transform; transition: transform 360ms cubic-bezier(.18,.6,.2,1), box-shadow 300ms ease, border-color 300ms ease; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
      .ctaPromo { transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0); }
      @media (prefers-reduced-motion: reduce) { .ctaPromo { transition: none; transform: none; } }
      .ctaPromo::before { content: ""; position: absolute; inset: -1px; border-radius: 9999px; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
      .ctaPromo::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; opacity: var(--gop, 0); transition: opacity 480ms ease; background:
        radial-gradient(26px 26px at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.00) 6%),
        radial-gradient(98px 98px at var(--gx,50%) var(--gy,50%), rgba(156,167,255,1.0) 0%, rgba(133,145,245,0.96) 14%, rgba(133,145,245,0.74) 28%, rgba(133,145,245,0.00) 46%);
        mix-blend-mode: screen; }
      .wave { position: absolute; left: 0; top: 0; right: 0; bottom: 0; pointer-events: none; overflow: hidden; border-radius: 9999px; }
      .wave::before { content: ""; position: absolute; width: 12px; height: 12px; border-radius: 9999px; left: var(--rx,50%); top: var(--ry,50%); transform: translate(-50%, -50%) scale(0); background: radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0.00)); opacity: 0; }
      .ripples .wave::before { animation: ripple 700ms cubic-bezier(.2,.65,.2,1); }
      @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0); opacity: .35; } 60% { opacity: .18; } 100% { transform: translate(-50%, -50%) scale(14); opacity: 0; } }
      .press { animation: press 160ms cubic-bezier(.2,.65,.2,1); }
      @keyframes press { 0% { transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(1); } 100% { transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(0.98); } }
    `}</style>
        </div>
      </div>
    </section>
  );
}

export default function ScrollStory({ lang: initialLang = "ru", events, promoImage }: ScrollStoryProps) {
  // subscribe to global language changes; use SSR-provided value as initial
  const { lang } = useLang(initialLang);
  const TEMP_CARD_URL =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60";
  const data = useMemo<ScrollStoryEvent[]>(() => {
    if (events && events.length) return events.slice(0, 3);
    // Mock data (replace with DB later) — curated 6 cards
    const cardsRU = [
      {
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1100&q=70", // bright ocean wave
        text: "Пенное шоу: шесть пушек и волны до 1,5 м",
        durationMin: 90,
      },
      {
        image:
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1100&q=70", // sunny palm leaves
        text: "Тропический ливень: тёплые струи и атмосфера каникул",
        durationMin: 60,
      },
      {
        image:
          "https://images.unsplash.com/photo-1520975922203-b114b1b5b2a8?auto=format&fit=crop&w=1100&q=70", // placeholder visual
        text: "Огромные экраны и кинозвук: эффект полного погружения",
        durationMin: 120,
      },
      {
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=70", // colorful powder bright
        text: "Фейерверк из красок: зрелищные облака цвета — безопасно",
        durationMin: 45,
      },
      {
        image:
          "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1100&q=70", // bright dessert
        text: "Комплимент детям: сладкая вата каждому гостю",
        durationMin: 75,
      },
      {
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1100&q=70", // placeholder visual
        text: "Кино под звёздами: атмосферные показы на свежем воздухе",
        durationMin: 30,
      },
    ];
    const cardsEN = [
      {
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1100&q=70",
        text: "Foam Show: six cannons, waves up to 1.5 m",
        durationMin: 90,
      },
      {
        image:
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1100&q=70",
        text: "Tropical Rain: warm showers and holiday vibes",
        durationMin: 60,
      },
      {
        image:
          "https://images.unsplash.com/photo-1520975922203-b114b1b5b2a8?auto=format&fit=crop&w=1100&q=70",
        text: "Large screens and cinema‑grade sound: immersive experience",
        durationMin: 120,
      },
      {
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=70",
        text: "Color Fireworks: guest‑safe clouds of color",
        durationMin: 45,
      },
      {
        image:
          "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1100&q=70",
        text: "Kids’ Treat: cotton candy for every child",
        durationMin: 75,
      },
      {
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1100&q=70",
        text: "Cinema under the stars: enchanting outdoor screenings",
        durationMin: 30,
      },
    ];

    return [0, 1, 2].map((i) => ({
      id: i + 1,
      title:
        lang === "ru"
          ? ["Мастер‑класс", "Фестиваль", "Кино и шоу"][i]
          : ["Master Class", "Festival", "Cinema & Show"][i],
      cards: (lang === "ru" ? cardsRU : cardsEN).map((c, idx) => ({
        id: `${i + 1}-${idx + 1}`,
        image: c.image,
        text: c.text,
        durationMin: c.durationMin,
      })),
    }));
  }, [events, lang]);

  const formatDuration = useCallback(
    (min?: number) => {
      if (!min || min <= 0) return null;
      if (lang === "ru") {
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (h && m) return `${h} ч ${m} мин`;
        if (h) return `${h} ч`;
        return `${m} мин`;
      } else {
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (h && m) return `${h}h ${m}m`;
        if (h) return `${h}h`;
        return `${m}m`;
      }
    },
    [lang]
  );

  // Split right-side cards into 3 groups of 6 (or whatever provided)
  const groups = useMemo(() => {
    return data.map((ev) => ({
      id: ev.id,
      title: ev.title,
      cards: ev.cards.slice(0, 6),
    }));
  }, [data]);

  // Render a single block (remove duplicate)
  const first = data[0];
  return (
    <>
      {first && (
        <StoryBlock lang={lang} event={first} tempCard={TEMP_CARD_URL} promoImage={promoImage} />
      )}
    </>
  );
}
