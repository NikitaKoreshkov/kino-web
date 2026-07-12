"use client";

import React from "react";
import { useLang, type Lang } from "../../lang";
import { HeroLavaLetters } from "./HeroLavaLetters";
import GlassPanelShell from "./GlassPanelShell";
import MediaPlaceholder from "./MediaPlaceholder";

export type MapItem = { image?: string; showTitle?: string; price?: string; description?: string };

type Program = { id: string; title: string; meta?: string; text: string; thumb?: string; href: string };

const MAPS_ORG =
  "https://yandex.ru/maps/org/shousochi/131805703222?si=xuveu79t4ej551g2etpf7ty3t8";

const programsRU: Program[] = [
  {
    id: "p1",
    title: "Семейное пенное шоу",
    meta: "1 500 ₽",
    text: "Краски и пена, тропический дождь, мячи‑гиганты — 17:00",
    href: "/shows/yupi",
  },
  {
    id: "p2",
    title: "Кино и шоу под звёздами",
    meta: "от 400 ₽",
    text: "Большой экран, Dolby Atmos — 20:00, 22:00, 00:00",
    href: "/shows/cinema",
  },
  {
    id: "p3",
    title: "Кулинарный мастер-класс",
    meta: "от 700 ₽",
    text: "Каждый день в 10:00 и 11:00",
    href: "/shows/master",
  },
];

const programsEN: Program[] = [
  {
    id: "p1",
    title: "Family foam show",
    meta: "1,500 ₽",
    text: "Paint and foam, tropical rain, giant balls — 17:00",
    href: "/shows/yupi",
  },
  {
    id: "p2",
    title: "Cinema & show under the stars",
    meta: "from 400 ₽",
    text: "Big screen, Dolby Atmos — 20:00, 22:00, 00:00",
    href: "/shows/cinema",
  },
  {
    id: "p3",
    title: "Culinary master class",
    meta: "from 700 ₽",
    text: "Every day at 10:00 and 11:00",
    href: "/shows/master",
  },
];

function normalizeFromAdmin(items: MapItem[], lang: Lang): Program[] {
  const fallbacks = lang === "ru" ? programsRU : programsEN;
  const hrefs = ["/shows/yupi", "/shows/cinema", "/shows/master"];
  return items.slice(0, 3).map((it, i) => ({
    id: `p${i + 1}`,
    title:
      (it.showTitle && it.showTitle.trim()) ||
      fallbacks[i]?.title ||
      (lang === "ru" ? `Программа ${i + 1}` : `Program ${i + 1}`),
    meta: (it.price && it.price.trim()) || undefined,
    text: (it.description && it.description.trim()) || fallbacks[i]?.text || "",
    thumb: (it.image && it.image.trim()) || undefined,
    href: hrefs[i] || "/shows",
  }));
}

export default function MapPrograms({
  initial,
  items,
}: {
  initial?: Lang;
  items?: MapItem[];
}) {
  const { lang } = useLang(initial);
  const programs =
    items && items.length
      ? normalizeFromAdmin(items, lang)
      : lang === "ru"
        ? programsRU
        : programsEN;
  const more = lang === "ru" ? "Подробнее" : "More details";

  return (
    <>
      <section
        className="peekSection peekSectionBottom peekEvents peekMap"
        aria-labelledby="map-title"
      >
        <div className="peekWrap">
          <div className="title headline">
            <HeroLavaLetters variant="headlinePp" id="map-title">
              {lang === "ru" ? "Как добраться к нам" : "How to reach us"}
            </HeroLavaLetters>
          </div>
          <div className="subcopy copyLines2">
            <HeroLavaLetters variant="body">
              {lang === "ru" ? "ул. Калинина, 1/1, Сочи" : "Kalinin St, 1/1, Sochi"}
            </HeroLavaLetters>
            <HeroLavaLetters variant="body">
              {lang === "ru" ? "Одно место — три программы" : "One place — three programs"}
            </HeroLavaLetters>
            <HeroLavaLetters variant="body">
              {lang === "ru" ? "парковка рядом, строим маршрут за секунду" : "parking nearby, route in seconds"}
            </HeroLavaLetters>
          </div>
        </div>
      </section>

      <section className="mp-section" aria-label="Location and programs">
        <div className="mp-grid">
          <div className="mp-mapCol">
            <GlassPanelShell className="mp-mapCard" elasticity={0.28}>
              <div className="mp-mapFrame">
                <iframe
                  title="map"
                  className="mp-map"
                  src="https://yandex.ru/map-widget/v1/org/shousochi/131805703222/?ll=39.912852%2C43.427962&z=19"
                  loading="lazy"
                  allowFullScreen
                />
                <div className="mp-mapVignette" aria-hidden />
              </div>
              <div className="mp-mapActions">
                <GlassPanelShell
                  as="a"
                  className="mp-action"
                  href={`${MAPS_ORG}&mode=routes`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {lang === "ru" ? "Маршрут" : "Route"}
                </GlassPanelShell>
                <GlassPanelShell
                  as="a"
                  className="mp-action"
                  href="https://taxi.yandex.ru/order?gto=43.428499,39.912944&lang=ru"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {lang === "ru" ? "Вызвать такси" : "Taxi"}
                </GlassPanelShell>
                <GlassPanelShell
                  as="a"
                  className="mp-action"
                  href={MAPS_ORG}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {lang === "ru" ? "Открыть в картах" : "Open in Maps"}
                </GlassPanelShell>
              </div>
            </GlassPanelShell>
          </div>

          <div className="mp-programs">
            {programs.map((p, i) => (
              <a
                key={p.id}
                href={p.href}
                className="mp-card"
                aria-label={`${more}: ${p.title}`}
              >
                <GlassPanelShell className="mp-cardShell" disabled>
                  <div className="mp-cardMedia">
                    {p.thumb ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.thumb} alt="" className="mp-cardImg" loading="lazy" />
                        <div className="mp-cardShade" aria-hidden />
                      </>
                    ) : (
                      <MediaPlaceholder lang={lang} className="mp-cardPlaceholder" />
                    )}
                  </div>
                  <div className="mp-cardBody">
                    <span className="mp-cardIndex" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mp-cardTop">
                      <h4 className="mp-cardTitle">{p.title}</h4>
                      {p.meta && <span className="mp-cardPrice">{p.meta}</span>}
                    </div>
                    <p className="mp-cardText">{p.text}</p>
                    <span className="mp-cardLink">
                      {more}
                      <span className="mp-cardArrow" aria-hidden>
                        →
                      </span>
                    </span>
                  </div>
                </GlassPanelShell>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
