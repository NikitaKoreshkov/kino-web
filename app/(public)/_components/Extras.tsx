"use client";

import React, { useEffect, useMemo } from "react";
import { Montserrat } from "next/font/google";
import { getTexts, currency } from "../../i18n";
import type { Lang } from "../../i18n";
import { useLang } from "../../lang";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["700", "800"], display: "swap" });

type Item = { title: string; subtitle?: string; price: string };
type ExtrasData = {
  title?: string;
  lead?: string;
  groups?: { photos?: string; ice?: string; congrats?: string };
  items?: { photos?: Item[]; ice?: Item[]; congrats?: Item[] };
};

export default function Extras({ data }: { data?: ExtrasData }) {
  const { lang } = useLang();
  const t = getTexts(lang).extras as any;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("ex-in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll<HTMLElement>(".ex-reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lang]);

  const groups = useMemo(() => {
    if (data?.groups) return data.groups as any;
    return (t?.groups ?? {}) as { photos?: string; ice?: string; congrats?: string };
  }, [t, data]);
  const items = useMemo(() => {
    if (data?.items) {
      return {
        photos: data.items.photos ?? [],
        ice: data.items.ice ?? [],
        congrats: data.items.congrats ?? [],
      } as { photos: Item[]; ice: Item[]; congrats: Item[] };
    }
    return (t?.items ?? { photos: [], ice: [], congrats: [] }) as { photos: Item[]; ice: Item[]; congrats: Item[] };
  }, [t, data]);

  return (
    <section id="extras" className="exRoot plWall mt-8 sm:mt-12 lg:mt-16 mb-8 lg:mb-14">
      <article className="exCard ex-reveal">
        <h2 className={`${montserrat.className} exTitle`}>{data?.title ?? t?.title ?? ""}</h2>
        <p className="exLead">{data?.lead ?? t?.lead ?? ""}</p>

        <h3 className="exGroup">{groups.photos ?? ""}</h3>
        <div className="exList">
          {items.photos.map((it) => (
            <ExtraRow key={it.title} item={it} lang={lang} />
          ))}
        </div>

        <h3 className="exGroup">{groups.ice ?? ""}</h3>
        <div className="exList">
          {items.ice.map((it) => (
            <ExtraRow key={it.title} item={it} lang={lang} />
          ))}
        </div>

        <h3 className="exGroup">{groups.congrats ?? ""}</h3>
        <div className="exList">
          {items.congrats.map((it) => (
            <ExtraRow key={it.title} item={it} lang={lang} />
          ))}
        </div>
      </article>
    </section>
  );
}

function ExtraRow({ item, lang }: { item: Item; lang: Lang }) {
  const price = React.useMemo(() => {
    // ожидаем строки вида "$12"; если нет символа $, возвращаем как есть
    const m = item.price.match(/^\$\s*([0-9][\d.,]*)$/);
    if (lang === "ru" && m) {
      const usd = parseFloat(m[1].replace(/,/g, "."));
      const rate = currency.ru.usdRate || 100;
      const rub = Math.round(usd * rate);
      // формат: 12 ₽ (узкий неразрывный пробел)
      return `${rub.toLocaleString("ru-RU")}\u202F₽`;
    }
    return item.price;
  }, [item.price, lang]);

  return (
    <div className="exRow ex-reveal">
      <div className="exText">
        <div className="t1">{item.title}</div>
        {item.subtitle && <div className="t2">{item.subtitle}</div>}
      </div>
      <div className="exPrice">{price}</div>
    </div>
  );
}
