"use client";

import React, { useEffect } from "react";
import { Montserrat } from "next/font/google";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["700", "800"], display: "swap" });

type ShowBlock = { cover?: string; title?: string; description?: string; prices?: Array<{ label?: string; price?: string; ticket?: string }>; panels?: Array<{ title?: string; desc?: string; description?: string }>; };

export default function KinoShow({ data }: { data?: ShowBlock }) {
  const { lang } = useLang();
  const t = getTexts(lang).kino;
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("ks-in")),
      { threshold: 0.15 }
    );
    const nodes = document.querySelectorAll<HTMLElement>(".ks-reveal");
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lang]);

  // Revert to original i18n-driven tiles for "Что входит в шоу"
  const features: { title: string; desc: string }[] = Array.isArray((t as any).features) ? (t as any).features : [];
  if (typeof window !== 'undefined') {
    console.debug('[KinoShow] features length', lang, features.length);
  }

  return (
    <section id="kino" className="ksRoot plWall mt-10 sm:mt-16 lg:mt-24 mb-8 lg:mb-14">
      <article className="ksCard ks-reveal">
        <div className="ksTop">
          {/* Text first, media on the right (desktop) */}
          <div className="ksCopy">
            <h2 className={`${montserrat.className} ksTitle`}>{(data?.title && String(data.title)) || t.title}</h2>
            <p className="ksLead">{(data?.description && String(data.description)) || t.lead}</p>
            <ul className="ksPrices" aria-label={t.ariaPrices}>
              {(() => {
                const toCurr = (usd: string, rub: string) => (lang === 'ru' ? rub : usd);
                const prices = Array.isArray(data?.prices) && data!.prices!.length
                  ? data!.prices!.slice(0,3).map((p:any)=>({ label:String(p.label||""), price:String(p.price||""), note:String(p.note||""), ticket:String(p.ticket||"") }))
                  : [
                      { label: t.priceChild, price: toCurr('$4', '400 ₽'), note: '', ticket: 'cinema_child' },
                      { label: t.priceAdult, price: toCurr('$6', '500 ₽'), note: '', ticket: 'cinema_adult' },
                      { label: t.pricePopcorn, price: toCurr('$3', '250 ₽'), note: '', ticket: '' },
                    ];
                return (
                  <>
                    {prices.map((p, i) => {
                      const ticketId = p.ticket && p.ticket.trim() ? p.ticket.trim() : `cinema_custom_${i+1}`;
                      const href = `/booking?ticket=${encodeURIComponent(ticketId)}`;
                      return (
                        <li key={i} className="list-none">
                          <a href={href} className="ksPrice block">
                            <span className="k">{p.label}</span>
                            <span className="v">{p.price}</span>
                            {p.note && <span className="s">{p.note}</span>}
                          </a>
                        </li>
                      );
                    })}
                  </>
                );
              })()}
            </ul>
            <div className="ksCtasTop">
              <a href="/booking?show=cinema" className="ksBtnPrimary">{t.ctaBook}</a>
            </div>
          </div>
          <figure className="ksMedia">
            <img src={(data?.cover && String(data.cover)) || "/images/cinema.svg"} alt={t.imgAlt} loading="lazy" decoding="async" />
          </figure>
        </div>

        <h3 className="ksBlockTitle">{t.blockTitle}</h3>
        <p className="ksBlockSub">{t.blockSub}</p>

        <div className="ksGrid">
          {features.length > 0 && features.map((f) => (
            <div key={f.title} className="ksFeat ks-reveal">
              <div className="ksFeatHead">
                <div className="ksDot" aria-hidden />
                <h3 className="ksFeatTitle">{f.title}</h3>
              </div>
              <p className="ksFeatText">{f.desc}</p>
            </div>
          ))}
        </div>
      </article>
      </section>
  );
}
