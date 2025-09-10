"use client";

import React, { useEffect, useRef } from "react";
import { useLang, type Lang } from "../../lang";

export type MapItem = { image?: string; showTitle?: string; price?: string; description?: string };

export default function MapPrograms({ initial, items }: { initial?: Lang; items?: MapItem[] }) {
  const { lang } = useLang(initial);
  const rootRef = useRef<HTMLElement | null>(null);

  // Reuse the smooth scroll-based scale/translate effect from the demo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>(".sp-panel"));

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      panels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const delta = (center - vh / 2) / vh; // -1..1 around center
        const t = Math.max(-1, Math.min(1, delta));
        const scale = 1 - Math.abs(t) * 0.06; // subtle scale in
        const y = -t * 16; // px translate
        p.style.setProperty("--sp-scale", String(scale));
        p.style.setProperty("--sp-y", `${y}px`);
        const visible = r.top < vh * 0.9 && r.bottom > vh * 0.1;
        p.classList.toggle("in", visible);
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll as any);
    };
  }, []);

  return (
    <>
      {/* Centered section title like other blocks */}
      <section className="peekSection peekSectionBottom" aria-labelledby="map-title">
        <div className="peekWrap">
          <h2 id="map-title">{lang === 'ru' ? 'Как добраться к нам' : 'How to reach us'}</h2>
          <h3>{lang === 'ru' ? 'Одно место — три программы. Парковка рядом, удобный вход, строим маршрут за секунду.' : 'One place — three programs. Parking nearby, easy entry, get your route in seconds.'}</h3>
        </div>
      </section>

      <section ref={rootRef} className="scrollPanels" aria-label="Location and programs">
        <div className="container sp-grid">
          <div className="sp-left">
            <div className="sp-sticky">
              <div className="sp-mapCard">
                {/* Premium-styled map: using real Yandex embed provided by the user */}
                <div className="sp-mapGlass">
                  <iframe
                    title="map"
                    className="sp-map"
                    src="https://yandex.kz/map-widget/v1/org/shousochi/131805703222/?ll=39.912852%2C43.427962&z=19.23"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <div className="sp-mapActions">
                  <a
                    className="cta mini"
                    href="https://yandex.kz/maps/239/sochi/?ll=39.912714%2C43.428581&mode=routes&rtext=~43.428499%2C39.912944&rtt=auto&ruri=~ymapsbm1%3A%2F%2Forg%3Foid%3D131805703222&utm_source=share&z=17"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === 'ru' ? 'Маршрут' : 'Route'}
                  </a>
                  <a
                    className="cta mini"
                    href="https://taxi.yandex.kz/order?gfrom=,&gto=43.428499,39.912944&tariff=&lang=ru"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === 'ru' ? 'Вызвать такси' : 'Taxi'}
                  </a>
                  <a className="cta mini" href="https://yandex.kz/maps/-/CHxyACzn" target="_blank" rel="noopener noreferrer">{lang === 'ru' ? 'Открыть в картах' : 'Open in Maps'}</a>
                </div>
              </div>
            </div>
          </div>
          <div className="sp-right">
            {(items && items.length ? normalizeFromAdmin(items, lang) : (lang === 'ru' ? programsRU : programsEN)).map((c) => (
              <article key={c.id} className="sp-panel">
                <a href={c.href} className="sp-cardOverlay" aria-label={`${lang === 'ru' ? 'Подробнее — ' : 'More — '}${c.title}`} />
                <div className="sp-overlay" />
                {/* Top banner thumbnail (no inline gradient; dark overlay handled in CSS) */}
                <div className="sp-thumb" style={{ backgroundImage: `url(${c.thumb})` }} />
                <div className="sp-body">
                  <h4 className="sp-h4">{c.title}</h4>
                  {c.meta && <div className="sp-meta">{c.meta}</div>}
                  <p className="sp-p">{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

type Program = { id: string; title: string; meta?: string; text: string; thumb: string; href: string };

const programsRU: Program[] = [
  { id: "p1", title: "ЮПИ шоу", meta: "от 700 ₽", text: "Формат: дневное шоу с красками и пеной", thumb: "/images/mock/fallback-hero.svg", href: "/shows/yupi" },
  { id: "p2", title: "Кино шоу", meta: "от 400 ₽", text: "Формат: вечерний показ фильмов + развлекательная программа", thumb: "/images/mock/fallback-thumb.svg", href: "/shows/cinema" },
  { id: "p3", title: "Мастер‑класс", meta: "от 700 ₽", text: "Формат: творческие занятия / обучение", thumb: "/images/mock/fallback-hero.svg", href: "/shows/master" },
];

const programsEN: Program[] = [
  { id: "p1", title: "UPI Show", meta: "from 700 ₽", text: "Format: daytime show with colors and foam", thumb: "/images/mock/fallback-hero.svg", href: "/shows/yupi" },
  { id: "p2", title: "Cinema Show", meta: "from 400 ₽", text: "Format: evening film screening + entertainment program", thumb: "/images/mock/fallback-thumb.svg", href: "/shows/cinema" },
  { id: "p3", title: "Master Class", meta: "from 700 ₽", text: "Format: creative workshops / learning", thumb: "/images/mock/fallback-hero.svg", href: "/shows/master" },
];

function normalizeFromAdmin(items: MapItem[], lang: Lang): Program[] {
  const fallbacks = (lang === 'ru' ? programsRU : programsEN);
  const hrefs = ["/shows/yupi", "/shows/cinema", "/shows/master"]; // keep consistent ordering
  return items.slice(0,3).map((it, i) => ({
    id: `p${i+1}`,
    title: (it.showTitle && it.showTitle.trim()) || fallbacks[i]?.title || (lang==='ru'?`Программа ${i+1}`:`Program ${i+1}`),
    meta: (it.price && it.price.trim()) || undefined,
    text: (it.description && it.description.trim()) || fallbacks[i]?.text || "",
    thumb: (it.image && it.image.trim()) || fallbacks[i]?.thumb || "/images/mock/fallback-hero.svg",
    href: hrefs[i] || "/shows",
  }));
}
