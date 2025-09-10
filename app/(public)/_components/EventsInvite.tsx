"use client";

import React, { useRef, useEffect, useState } from "react";
import PhotoMarquee from './PhotoMarquee';
import { useLang, type Lang } from "../../lang";

export default function EventsInvite({ initial, images }: { initial?: Lang; images?: { src: string; alt?: string }[] }) {
  const { lang } = useLang(initial);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduceMotion(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Hover hotspot + micro-parallax with easing — match VideoHero CTA exactly
  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) return;
    const t = ctaRef.current;
    if (!t) return;
    type S = { gx: number; gy: number; tgx: number; tgy: number; px: number; py: number; tpx: number; tpy: number; raf: number };
    let state: S | null = null;
    const ensure = (x: number, y: number) => {
      if (!state) state = { gx: x, gy: y, tgx: x, tgy: y, px: 0, py: 0, tpx: 0, tpy: 0, raf: 0 };
      return state;
    };
    const tick = () => {
      if (!state) { return; }
      state.gx += (state.tgx - state.gx) * 0.10;
      state.gy += (state.tgy - state.gy) * 0.10;
      t.style.setProperty('--gx', `${state.gx}%`);
      t.style.setProperty('--gy', `${state.gy}%`);
      state.px += (state.tpx - state.px) * 0.10;
      state.py += (state.tpy - state.py) * 0.10;
      t.style.setProperty('--tx', `${state.px.toFixed(2)}px`);
      t.style.setProperty('--ty', `${state.py.toFixed(2)}px`);
      const cont = Math.abs(state.tgx - state.gx) > 0.05 || Math.abs(state.tgy - state.gy) > 0.05 || Math.abs(state.tpx - state.px) > 0.05 || Math.abs(state.tpy - state.py) > 0.05;
      if (cont) { state.raf = requestAnimationFrame(tick); } else { state.raf = 0; }
    };
    const onMove = (e: MouseEvent) => {
      const r = t.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const s = ensure(x, y);
      s.tgx = x; s.tgy = y;
      // show glow and schedule easing
      t.style.setProperty('--gop', '1');
      if (!s.raf) s.raf = requestAnimationFrame(tick);
      // micro-parallax
      const dx = (x - 50) / 50; const dy = (y - 50) / 50;
      s.tpx = dx * 1.8; s.tpy = dy * 1.4;
    };
    const onLeave = () => {
      if (!state) return;
      state.tpx = 0; state.tpy = 0; state.tgx = 50; state.tgy = 50;
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
        const cont = Math.abs(state.tgx - state.gx) > 0.05 || Math.abs(state.tgy - state.gy) > 0.05 || Math.abs(state.tpx - state.px) > 0.05 || Math.abs(state.tpy - state.py) > 0.05;
        if (cont) { state.raf = requestAnimationFrame(tickOut); } else { state.raf = 0; }
      };
      if (!state.raf) state.raf = requestAnimationFrame(tickOut);
      // fade glow
      t.style.setProperty('--gop', '0');
    };
    t.addEventListener('mousemove', onMove);
    t.addEventListener('mouseleave', onLeave);
    return () => {
      t.removeEventListener('mousemove', onMove);
      t.removeEventListener('mouseleave', onLeave);
    };
  }, [reduceMotion]);

  return (
    <section className="eventsInvite" aria-label="Invite to events">
      <div className="wrap">
        <h2 className="fadeUp">
          {lang === 'ru' ? 'Наши мероприятия объединяют людей и дарят яркие эмоции.' : 'Our events bring people together and spark bright emotions.'}
        </h2>
        <p className="fadeUp" style={{ animationDelay: '90ms' }}>
          {lang === 'ru'
            ? 'Обучение, творчество, фестивали и шоу под открытым небом — у нас каждый найдёт что-то для себя.'
            : 'Learning, creativity, festivals and open-air shows — everyone will find something for themselves.'}
        </p>
        <p className="fadeUp" style={{ animationDelay: '180ms' }}>
          {lang === 'ru' ? 'Выберите событие и забронируйте участие уже сейчас!' : 'Choose an event and book your participation now!'}
        </p>

        <div className="ctaRow fadeUp" style={{ animationDelay: '260ms' }}>
          <a
            ref={ctaRef}
            href="/booking"
            className="cta"
            aria-label={lang === 'ru' ? 'Забронировать' : 'Book now'}
            style={{
              // hotspot defaults
              // @ts-ignore
              ['--gx' as any]: '50%',
              // @ts-ignore
              ['--gy' as any]: '50%',
              // @ts-ignore
              ['--gop' as any]: '0',
              // parallax
              // @ts-ignore
              ['--tx' as any]: '0px',
              // @ts-ignore
              ['--ty' as any]: '0px',
            }}
          >
            <span className="label">{lang === 'ru' ? 'Забронировать' : 'Book now'}</span>
            <span aria-hidden className="wave" />
          </a>
        </div>
      </div>

      {/* Single full-bleed photo marquee */}
      <div
        className="marquees edgeOpenLeft is-revealed"
        aria-hidden
        style={{
          // @ts-ignore
          ['--marquee-edge-w' as any]: 'min(12vw, 160px)'
        }}
      >
        <PhotoMarquee
          images={
            images && images.length
              ? images
              : [
                  { src: '/images/mock/fallback-thumb.svg', alt: 'preview' },
                  { src: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800&auto=format&fit=crop', alt: 'event' },
                  { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop', alt: 'festival' },
                  { src: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=800&auto=format&fit=crop', alt: 'workshop' },
                  { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop', alt: 'friends' },
                ]
          }
          height={220}
          width={320}
          gap={18}
          speedSec={14}
          reverse={false}
          pauseOnHover
        />
      </div>
    </section>
  );
}