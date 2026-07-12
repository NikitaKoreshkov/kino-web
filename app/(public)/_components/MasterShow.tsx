"use client";

import React, { useMemo } from "react";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";
import AboutShowSection, { type AboutShowData } from "./AboutShowSection";

export default function MasterShow({ data }: { data?: AboutShowData }) {
  const { lang } = useLang();
  const t = getTexts(lang).master;

  const features = useMemo(
    () => (Array.isArray(t.features) ? [...t.features] : []),
    [t],
  );

  const prices = useMemo(() => {
    const toCurr = (usd: string, rub: string) => (lang === "ru" ? rub : usd);
    if (Array.isArray(data?.prices) && data!.prices!.length) {
      return data!.prices!.slice(0, 3).map((p, i) => ({
        label: String(p.label || ""),
        price: String(p.price || ""),
        note: String(p.note || ""),
        ticket: String(p.ticket || `master_custom_${i + 1}`),
      }));
    }
    return [
      { label: t.priceBoth, price: toCurr("$10", "900 ₽"), note: "", ticket: "master_combo" },
      { label: t.priceCandy, price: toCurr("$8", "700 ₽"), note: "", ticket: "master_cotton" },
      { label: t.pricePopcorn, price: toCurr("$8", "700 ₽"), note: "", ticket: "master_popcorn" },
    ];
  }, [data, lang, t]);

  return (
    <AboutShowSection
      id="masters"
      bookingShow="master"
      coverFallback={(data?.cover && String(data.cover).trim()) || undefined}
      title={(data?.title && String(data.title)) || t.title}
      lead={(data?.description && String(data.description)) || t.lead}
      imgAlt={t.imgAlt}
      ariaPrices={t.ariaPrices}
      ctaBook={t.ctaBook}
      blockTitle={t.blockTitle}
      blockSub={t.blockSub}
      prices={prices}
      features={features}
    />
  );
}
