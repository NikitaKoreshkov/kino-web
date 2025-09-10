"use client";

import React, { useEffect } from "react";
import { Montserrat } from "next/font/google";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["700", "800"], display: "swap" });

type ShowBlock = { cover?: string; title?: string; description?: string; prices?: Array<{ label?: string; price?: string; ticket?: string }>; panels?: Array<{ title?: string; desc?: string; description?: string }>; };

export default function YupiShow({ data }: { data?: ShowBlock }) {
  const { lang } = useLang();
  const t = getTexts(lang).yupi;
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("ys-in")),
      { threshold: 0.15 }
    );
    const nodes = document.querySelectorAll<HTMLElement>(".ys-reveal");
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lang]);

  // Use admin-configured panels if provided; fallback to i18n features
  const features: { title: string; desc: string }[] = Array.isArray((data as any)?.panels)
    ? ((data as any).panels
        .map((p: any) => ({ title: String(p?.title || ''), desc: String(p?.desc || p?.description || '') }))
        .filter((p: any) => p.title || p.desc))
    : (Array.isArray((t as any).features) ? (t as any).features : []);
  if (typeof window !== 'undefined') {
    console.debug('[YupiShow] features length', lang, features.length);
  }

  return (
    <section id="yupi" className="ysRoot plWall mt-16 sm:mt-24 lg:mt-32 mb-8 lg:mb-14">
      <article className="ysCard ys-reveal">
        <div className="ysTop">
          <figure className="ysMedia">
            <img src={(data?.cover && String(data.cover)) || "/images/cinema.svg"} alt={t.imgAlt} loading="lazy" decoding="async" />
          </figure>
          <div className="ysCopy">
            <h2 className={`${montserrat.className} ysTitle`}>{(data?.title && String(data.title)) || t.title}</h2>
            <p className="ysLead">{(data?.description && String(data.description)) || t.lead}</p>
            <ul className="ysPrices" aria-label={t.ariaPrices}>
              {(() => {
                const toCurr = (usd: string, rub: string) => (lang === 'ru' ? rub : usd);
                const prices = Array.isArray(data?.prices) && data!.prices!.length
                  ? data!.prices!.slice(0,3).map((p:any) => ({ label: String(p.label||""), price: String(p.price||""), note: String(p.note||""), ticket: String(p.ticket||"") }))
                  : [
                      { label: t.priceChild, price: toCurr('$21', '1\u202F850 ₽'), note: t.priceChildNote, ticket: 'upi_child_combo' },
                      { label: t.priceAdult, price: toCurr('$8', '700 ₽'), note: '', ticket: 'upi_adult' },
                      { label: t.pricePhoto, price: toCurr('$8', '700 ₽'), note: '', ticket: '' },
                    ];
                return (
                  <>
                    {prices.map((p, i) => {
                      const ticketId = p.ticket && p.ticket.trim() ? p.ticket.trim() : `upi_custom_${i+1}`;
                      const href = `/booking?ticket=${encodeURIComponent(ticketId)}`;
                      return (
                        <li key={i} className="list-none">
                          <a href={href} className="ysPrice block">
                            <span className="k">{p.label}</span>
                            <span className="v">{p.price}</span>
                            {p.note && <span className="s">{p.note}</span>}
                            {(!p.note && i===0 && !data?.prices) && (<span className="s">{t.priceChildNote}</span>)}
                          </a>
                        </li>
                      );
                    })}
                  </>
                );
              })()}
            </ul>
            <div className="ysCtasTop">
              <a href="/booking?show=upi" className="ysBtnPrimary">{t.ctaBook}</a>
            </div>
          </div>
        </div>

        <h3 className="ysBlockTitle">{t.blockTitle}</h3>
        <p className="ysBlockSub">{t.blockSub}</p>

        <div className="ysGrid">
          {features.length > 0 && features.map((f) => (
            <div key={f.title} className="ysFeat ys-reveal">
              <div className="ysFeatHead">
                <div className="ysDot" aria-hidden />
                <h3 className="ysFeatTitle">{f.title}</h3>
              </div>
              <p className="ysFeatText">{f.desc}</p>
            </div>
          ))}
        </div>

        
      </article>
      </section>
  );
}
