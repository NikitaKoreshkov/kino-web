"use client";

import React, { useEffect, useMemo } from "react";
import { useLang, type Lang } from "../../lang";
import {
  scrollAboutToWhenReady,
  takeHomeScrollTarget,
} from "../_lib/aboutScroll";
import { HeroLavaLetters } from "./HeroLavaLetters";
import GlassPanelShell from "./GlassPanelShell";
import MediaPlaceholder from "./MediaPlaceholder";

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
        const title = (it.title || (id === 'master' ? t('Кулинарный мастер-класс', 'Culinary master class') : id === 'upi' ? t('Семейное пенное шоу', 'Family foam show') : t('Кино и шоу под звёздами', 'Cinema & show under the stars')));
        const desc = (it.description || (id === 'master' ? t('Каждый день в 10:00 и 11:00', 'Every day at 10:00 and 11:00') : id === 'upi' ? t('Краски и пена, тропический дождь, мячи‑гиганты, ростовые куклы, ведущий и DJ. Сладкая вата в подарок.', 'Paint and foam, tropical rain, giant balls, mascots, host and DJ. Cotton candy as a gift.') : t('Большой экран, звук Dolby Atmos. 20:00, 22:00, 00:00. Попкорн в подарок.', 'Big screen, Dolby Atmos sound. 20:00, 22:00, 00:00. Complimentary popcorn.')));
        const time = it.time || (id === 'master' ? '10:00, 11:00' : id === 'upi' ? '17:00' : '20:00, 22:00, 00:00');
        const image = it.image || undefined;
        const href = id === 'master' ? '/booking?show=master' : id === 'upi' ? '/booking?show=upi' : '/booking?show=cinema';
        return { id, title, desc, time, image, primaryCta: { label: t('Купить билет', 'Buy ticket'), href } };
      });
      return cards;
    }
    return [
      {
        id: 'master',
        title: t('Кулинарный мастер-класс', 'Culinary master class'),
        time: '10:00, 11:00',
        desc: t('Каждый день в 10:00 и 11:00', 'Every day at 10:00 and 11:00'),
        image: undefined,
        primaryCta: { label: t('Купить билет', 'Buy ticket'), href: '/booking?show=master' },
      },
      {
        id: 'upi',
        title: t('Семейное пенное шоу', 'Family foam show'),
        time: '17:00',
        desc: t(
          'Краски и пена, тропический дождь, мячи‑гиганты, ростовые куклы, ведущий и DJ. Сладкая вата в подарок.',
          'Paint and foam, tropical rain, giant balls, mascots, host and DJ. Cotton candy as a gift.',
        ),
        image: undefined,
        primaryCta: { label: t('Купить билет', 'Buy ticket'), href: '/booking?show=upi' },
      },
      {
        id: 'cinema',
        title: t('Кино и шоу под звёздами', 'Cinema & show under the stars'),
        time: '20:00, 22:00, 00:00',
        desc: t('Большой экран, звук Dolby Atmos. Попкорн в подарок.', 'Big screen, Dolby Atmos sound. Complimentary popcorn.'),
        image: undefined,
        primaryCta: { label: t('Купить билет', 'Buy ticket'), href: '/booking?show=cinema' },
      },
    ];
  }, [lang, items]);

  // After /about → /#events, Next lands on the hero; scroll once #events is ready
  useEffect(() => {
    const stashed = takeHomeScrollTarget();
    const hashId =
      typeof window !== "undefined"
        ? decodeURIComponent(window.location.hash.replace(/^#/, ""))
        : "";
    const id = stashed || hashId || null;
    if (!id) return;
    if (stashed && hashId !== stashed) {
      window.history.replaceState(null, "", `/#${stashed}`);
    }
    return scrollAboutToWhenReady(id, {
      behavior: "auto",
      attempts: [0, 40, 120, 280, 560, 1000],
    });
  }, []);

  return (
    <>
      {/* Title above cards */}
      <section id="events" className="peekSection peekSectionBottom peekEvents" aria-labelledby="peek-title">
        <div className="peekWrap">
          <div className="title headline">
            <HeroLavaLetters variant="headlinePp" id="peek-title">
              {lang === 'ru' ? 'Ближайшие события' : 'Upcoming events'}
            </HeroLavaLetters>
          </div>
          <div className="subcopy">
            <HeroLavaLetters variant="body">
              {lang === 'ru' ? 'Каждый день новые впечатления' : 'New impressions every day'}
            </HeroLavaLetters>
          </div>
        </div>
      </section>

      {/* Events cards */}
      <section className="eventsSection" aria-labelledby="events-title">
        <div className="eventsWrap">
          <div className="grid">
            {events.map((ev) => (
              <GlassPanelShell
                as="article"
                key={ev.id}
                id={ev.id === 'master' ? 'event-master-info' : ev.id === 'upi' ? 'event-upi-info' : 'event-cinema-info'}
                className="card"
                disabled
              >
                <a
                  href={ev.id === 'master' ? '/shows/master' : ev.id === 'upi' ? '/shows/yupi' : '/shows/cinema'}
                  aria-label={(lang === 'ru' ? 'Подробнее о ' : 'Learn more about ') + ev.title}
                  className="cardOverlay"
                />
                <div className={`imagePanel${!ev.image ? ' noImg' : ''}`}>
                  {ev.image ? (
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
                  ) : (
                    <MediaPlaceholder className="eventsMediaPlaceholder" lang={lang} />
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
                <div className="title headline">
                  <HeroLavaLetters variant="headlinePp" as="h3">
                    {ev.title}
                  </HeroLavaLetters>
                </div>
                <div className="subcopy">
                  <HeroLavaLetters variant="body">
                    {ev.desc}
                  </HeroLavaLetters>
                </div>
                <div className="ctaRow">
                  <GlassPanelShell
                    as="a"
                    className="ctaBtn"
                    href={ev.primaryCta.href}
                    aria-label={`${ev.primaryCta.label} — ${ev.title}`}
                  >
                    {ev.primaryCta.label}
                  </GlassPanelShell>
                  <GlassPanelShell
                    as="a"
                    className="ctaBtn secondary"
                    href={ev.id === 'master' ? '/shows/master' : ev.id === 'upi' ? '/shows/yupi' : '/shows/cinema'}
                    aria-label={(lang === 'ru' ? 'Подробнее о ' : 'Learn more about ') + ev.title}
                  >
                    {lang === 'ru' ? 'Подробнее' : 'Learn more'}
                  </GlassPanelShell>
                </div>
              </GlassPanelShell>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
