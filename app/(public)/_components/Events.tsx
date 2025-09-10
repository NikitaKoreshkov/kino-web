"use client";

import React, { useMemo, useCallback } from "react";
import { useLang, type Lang } from "../../lang";

export type EventCard = {
  id: 'master' | 'upi' | 'cinema';
  title: string;
  desc: string;
  image?: string;
  time?: string;
  primaryCta: { label: string; href: string };
};

export default function Events({ initial, items }: { initial?: Lang; items?: Array<{ image?: string; title?: string; description?: string; time?: string }> }) {
  const { lang } = useLang(initial);

  const events = useMemo<EventCard[]>(() => {
    const t = (ru: string, en: string) => (lang === 'ru' ? ru : en);
    if (items && items.length) {
      const order: EventCard['id'][] = ['master', 'upi', 'cinema'];
      const cards = order.map((id, i) => {
        const it = items[i] || {};
        const title = (it.title || (id === 'master' ? t('Мастер-класс', 'Master class') : id === 'upi' ? t('Фестиваль ЮПИ шоу', 'UPI Festival show') : t('Кино и Шоу', 'Cinema & Show')));
        const desc = (it.description || (id === 'master' ? t('Формат: творческие занятия / обучение', 'Format: creative workshop / training') : id === 'upi' ? t('Формат: дневное шоу с красками и пеной', 'Format: day show with colors and foam') : t('Формат: вечерний показ фильмов + развлекательная программа', 'Format: evening films + entertainment program')));
        const time = it.time || undefined;
        const image = it.image || undefined;
        const href = id === 'master' ? '/booking?show=master' : id === 'upi' ? '/booking?show=upi' : '/booking?show=cinema';
        return { id, title, desc, time, image, primaryCta: { label: t('Купить билет', 'Buy ticket'), href } };
      });
      return cards;
    }
    return [
      {
        id: 'master',
        title: t('Мастер-класс', 'Master class'),
        time: '10:00 – 12:00',
        desc: t('Формат: творческие занятия / обучение', 'Format: creative workshop / training'),
        image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1800&auto=format&fit=crop',
        primaryCta: { label: t('Купить билет', 'Buy ticket'), href: '/booking?show=master' },
      },
      {
        id: 'upi',
        title: t('Фестиваль ЮПИ шоу', 'UPI Festival show'),
        time: '17:00 – 19:00',
        desc: t('Формат: дневное шоу с красками и пеной', 'Format: day show with colors and foam'),
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1800&auto=format&fit=crop',
        primaryCta: { label: t('Купить билет', 'Buy ticket'), href: '/booking?show=upi' },
      },
      {
        id: 'cinema',
        title: t('Кино и Шоу', 'Cinema & Show'),
        time: '20:00 – 02:00',
        desc: t('Формат: вечерний показ фильмов + развлекательная программа', 'Format: evening films + entertainment program'),
        image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1800&auto=format&fit=crop',
        primaryCta: { label: t('Купить билет', 'Buy ticket'), href: '/booking?show=cinema' },
      },
    ];
  }, [lang, items]);

  const onCtaMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const t = e.currentTarget;
    const r = t.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    t.style.setProperty('--mx', `${x}px`);
    t.style.setProperty('--my', `${y}px`);
  }, []);

  return (
    <>
      {/* Title above cards */}
      <section id="events" className="peekSection peekSectionBottom peekEvents" aria-labelledby="peek-title">
        <div className="peekWrap">
          <h2 id="peek-title">{lang === 'ru' ? 'Ближайшие события' : 'Upcoming events'}</h2>
          <h3>{lang === 'ru' ? 'Каждый день — новые впечатления' : 'New impressions every day'}</h3>
        </div>
      </section>

      {/* Events cards */}
      <section className="eventsSection" aria-labelledby="events-title">
        <div className="eventsWrap">
          <div className="grid">
            {events.map((ev) => (
              <article
                key={ev.id}
                id={ev.id === 'master' ? 'event-master-info' : ev.id === 'upi' ? 'event-upi-info' : 'event-cinema-info'}
                className="card"
              >
                <a
                  href={ev.id === 'master' ? '/shows/master' : ev.id === 'upi' ? '/shows/yupi' : '/shows/cinema'}
                  aria-label={(lang === 'ru' ? 'Подробнее о ' : 'Learn more about ') + ev.title}
                  className="cardOverlay"
                />
                <div className={`imagePanel${!ev.image ? ' noImg' : ''}`}>
                  {ev.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="imgBg"
                      src={ev.image}
                      alt={ev.title}
                      width={1600}
                      height={900}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        img.parentElement?.classList.add('noImg');
                      }}
                    />
                  )}
                  <div className="imageGlass" />
                  <div className="imageCaptionBottom">
                    <div className="imageMeta">
                      {ev.time ? (<span className="clock" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>) : null}
                      {ev.time ? (<span className="time">{ev.time}</span>) : null}
                    </div>
                  </div>
                </div>
                <h3 className="cardTitle" title={ev.title}>{ev.title}</h3>
                <p className="desc">{ev.desc}</p>
                <div className="ctaRow">
                  <a className="ctaBtn" onMouseMove={onCtaMove} href={ev.primaryCta.href} aria-label={`${ev.primaryCta.label} — ${ev.title}`}>
                    {ev.primaryCta.label}
                  </a>
                  <a className="ctaBtn secondary" onMouseMove={onCtaMove} href={ev.id === 'master' ? '/shows/master' : ev.id === 'upi' ? '/shows/yupi' : '/shows/cinema'} aria-label={(lang === 'ru' ? 'Подробнее о ' : 'Learn more about ') + ev.title}>
                    {lang === 'ru' ? 'Подробнее' : 'Learn more'}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
