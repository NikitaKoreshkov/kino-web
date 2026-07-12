"use client";

import React, { useMemo } from "react";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";
import AboutShowSection, { type AboutShowData } from "./AboutShowSection";

export default function YupiShow({ data }: { data?: AboutShowData }) {
  const { lang } = useLang();
  const t = getTexts(lang).yupi;

  const features = useMemo(() => {
    if (Array.isArray(data?.panels) && data!.panels!.length) {
      return data!.panels!
        .map((p) => ({
          title: String(p?.title || ""),
          desc: String(p?.desc || p?.description || ""),
        }))
        .filter((p) => p.title || p.desc);
    }
    return Array.isArray(t.features) ? [...t.features] : [];
  }, [data, t]);

  const prices = useMemo(() => {
    const toCurr = (usd: string, rub: string) => (lang === "ru" ? rub : usd);
    if (Array.isArray(data?.prices) && data!.prices!.length) {
      return data!.prices!.slice(0, 3).map((p, i) => ({
        label: String(p.label || ""),
        price: String(p.price || ""),
        note: String(p.note || ""),
        ticket: String(p.ticket || `upi_custom_${i + 1}`),
      }));
    }
    return [
      {
        label: t.priceAdult,
        price: toCurr("$15", "1\u202F500 ₽"),
        note: t.priceAdultNote,
        ticket: "upi_adult",
      },
      {
        label: t.priceChild,
        price: toCurr("$15", "1\u202F500 ₽"),
        note: t.priceChildNote,
        ticket: "upi_adult_pair",
      },
      { label: t.pricePhoto, price: toCurr("$8", "700 ₽"), note: "", ticket: "upi_photo" },
    ];
  }, [data, lang, t]);

  return (
    <AboutShowSection
      id="yupi"
      bookingShow="upi"
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
