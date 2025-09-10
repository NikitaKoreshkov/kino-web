"use client";

import React, { useEffect } from "react";
import { Montserrat } from "next/font/google";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["700", "800"], display: "swap" });

type ShowBlock = { cover?: string; title?: string; description?: string; prices?: Array<{ label?: string; price?: string; ticket?: string }>; panels?: Array<{ title?: string; desc?: string; description?: string }>; };

export default function MasterShow({ data }: { data?: ShowBlock }) {
  const { lang } = useLang();
  const t = getTexts(lang).master;
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("ms-in")),
      { threshold: 0.15 }
    );
    const nodes = document.querySelectorAll<HTMLElement>(".ms-reveal");
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lang]);

  // Revert to original i18n-driven tiles for "Что входит в шоу"
  const features: { title: string; desc: string }[] = Array.isArray((t as any).features) ? (t as any).features : [];
  if (typeof window !== 'undefined') {
    console.debug('[MasterShow] features length', lang, features.length);
  }

  return (
    <section id="masters" className="msRoot plWall mt-10 sm:mt-16 lg:mt-24 mb-8 lg:mb-14">
      <article className="msCard ms-reveal">
        <div className="msTop">
          <figure className="msMedia">
            <img src={(data?.cover && String(data.cover)) || "/images/cinema.svg"} alt={t.imgAlt} loading="lazy" decoding="async" />
          </figure>
          <div className="msCopy">
            <h2 className={`${montserrat.className} msTitle`}>{(data?.title && String(data.title)) || t.title}</h2>
            <p className="msLead">{(data?.description && String(data.description)) || t.lead}</p>
            <ul className="msPrices" aria-label={t.ariaPrices}>
              {(() => {
                const toCurr = (usd: string, rub: string) => (lang === 'ru' ? rub : usd);
                const prices = Array.isArray(data?.prices) && data!.prices!.length
                  ? data!.prices!.slice(0,3).map((p:any)=>({ label:String(p.label||""), price:String(p.price||""), note:String(p.note||""), ticket:String(p.ticket||"") }))
                  : [
                      { label: t.priceBoth, price: toCurr('$10', '900 ₽'), note: '', ticket: 'master_combo' },
                      { label: t.priceCandy, price: toCurr('$8', '700 ₽'), note: '', ticket: 'master_cotton' },
                      { label: t.pricePopcorn, price: toCurr('$8', '700 ₽'), note: '', ticket: 'master_popcorn' },
                    ];
                return (
                  <>
                    {prices.map((p, i) => {
                      const ticketId = p.ticket && p.ticket.trim() ? p.ticket.trim() : `master_custom_${i+1}`;
                      const href = `/booking?ticket=${encodeURIComponent(ticketId)}`;
                      return (
                        <li key={i} className="list-none">
                          <a href={href} className="msPrice block">
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
            <div className="msCtasTop">
              <a href="/booking?show=master" className="msBtnPrimary">{t.ctaBook}</a>
            </div>
          </div>
        </div>

        <h3 className="msBlockTitle">{t.blockTitle}</h3>
        <p className="msBlockSub">{t.blockSub}</p>

        <div className="msGrid">
          {features.length > 0 && features.map((f) => (
            <div key={f.title} className="msFeat ms-reveal">
              <div className="msFeatHead">
                <div className="msDot" aria-hidden />
                <h3 className="msFeatTitle">{f.title}</h3>
              </div>
              <p className="msFeatText">{f.desc}</p>
            </div>
          ))}
        </div>
      </article>
      </section>
  );
}
