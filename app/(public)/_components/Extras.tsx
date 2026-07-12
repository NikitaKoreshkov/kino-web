"use client";

import React, { useMemo, useRef } from "react";
import { getTexts, currency } from "../../i18n";
import type { Lang } from "../../i18n";
import { useLang } from "../../lang";
import { HeroLavaLetters } from "./HeroLavaLetters";
import { useAboutReveal } from "../_hooks/useAboutReveal";

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
  const rootRef = useRef<HTMLElement | null>(null);

  const groups = useMemo(() => {
    if (data?.groups) return data.groups as { photos?: string; ice?: string; congrats?: string };
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
    return (t?.items ?? { photos: [], ice: [], congrats: [] }) as {
      photos: Item[];
      ice: Item[];
      congrats: Item[];
    };
  }, [t, data]);

  const sections = [
    { key: "photos", label: groups.photos ?? "", list: items.photos },
    { key: "ice", label: groups.ice ?? "", list: items.ice },
    { key: "congrats", label: groups.congrats ?? "", list: items.congrats },
  ].filter((s) => s.list.length > 0);

  useAboutReveal(rootRef, [lang, sections.length]);

  return (
    <section id="extras" ref={rootRef} className="abExtras abBand plWall">
      <div className="abExtras__head ab-reveal">
        <div className="title headline">
          <HeroLavaLetters variant="headlinePp">
            {data?.title ?? t?.title ?? ""}
          </HeroLavaLetters>
        </div>
        <div className="subcopy">
          <HeroLavaLetters variant="body">{data?.lead ?? t?.lead ?? ""}</HeroLavaLetters>
        </div>
      </div>

      {sections.map((sec, i) => (
        <div
          key={sec.key}
          className="abExtras__group ab-reveal"
          style={{ ["--ab-delay" as string]: `${90 + i * 90}ms` }}
        >
          <h3 className="abExtras__groupTitle">{sec.label}</h3>
          <div className="abExtras__list">
            {sec.list.map((it) => (
              <ExtraRow key={it.title} item={it} lang={lang} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ExtraRow({ item, lang }: { item: Item; lang: Lang }) {
  const price = React.useMemo(() => {
    const m = item.price.match(/^\$\s*([0-9][\d.,]*)$/);
    if (lang === "ru" && m) {
      const usd = parseFloat(m[1].replace(/,/g, "."));
      const rate = currency.ru.usdRate || 100;
      const rub = Math.round(usd * rate);
      return `${rub.toLocaleString("ru-RU")}\u202F₽`;
    }
    return item.price;
  }, [item.price, lang]);

  return (
    <div className="abExtras__row">
      <div className="abExtras__text">
        <div className="abExtras__name">{item.title}</div>
        {item.subtitle ? <div className="abExtras__sub">{item.subtitle}</div> : null}
      </div>
      <div className="abExtras__price">{price}</div>
    </div>
  );
}
