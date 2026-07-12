"use client";

import React, { useRef } from "react";
import GlassPanelShell from "./GlassPanelShell";
import { HeroLavaLetters } from "./HeroLavaLetters";
import { useAboutReveal } from "../_hooks/useAboutReveal";
import MediaPlaceholder from "./MediaPlaceholder";

export type AboutShowData = {
  cover?: string;
  title?: string;
  description?: string;
  prices?: Array<{ label?: string; price?: string; note?: string; ticket?: string }>;
  panels?: Array<{ title?: string; desc?: string; description?: string }>;
};

export type AboutShowPrice = {
  label: string;
  price: string;
  note?: string;
  ticket: string;
};

export type AboutShowFeature = { title: string; desc: string };

type Props = {
  id: string;
  flip?: boolean;
  bookingShow: string;
  coverFallback?: string;
  title: string;
  lead: string;
  imgAlt: string;
  ariaPrices: string;
  ctaBook: string;
  blockTitle: string;
  blockSub: string;
  prices: AboutShowPrice[];
  features: AboutShowFeature[];
};

export default function AboutShowSection({
  id,
  flip = false,
  bookingShow,
  coverFallback,
  title,
  lead,
  imgAlt,
  ariaPrices,
  ctaBook,
  blockTitle,
  blockSub: _blockSub,
  prices,
  features,
}: Props) {
  const rootRef = useRef<HTMLElement | null>(null);
  useAboutReveal(rootRef, [title, features.length]);
  const cover = coverFallback?.trim() || "";

  return (
    <section id={id} ref={rootRef} className="abShow abBand plWall">
      <div className={`abShow__top${flip ? " is-flip" : ""}`}>
        <div
          className="abShow__mediaCol ab-reveal"
          style={{ ["--ab-delay" as string]: flip ? "120ms" : "0ms" }}
        >
          <GlassPanelShell className="abShow__media" disabled elasticity={0}>
            {cover ? (
              <img src={cover} alt={imgAlt} loading="lazy" decoding="async" />
            ) : (
              <MediaPlaceholder className="abShow__mediaEmpty" />
            )}
          </GlassPanelShell>
        </div>

        <div
          className="abShow__copy ab-reveal"
          style={{ ["--ab-delay" as string]: flip ? "0ms" : "100ms" }}
        >
          <div className="title headline">
            <HeroLavaLetters variant="headlinePp">{title}</HeroLavaLetters>
          </div>
          <p className="abShow__lead">{lead}</p>

          <ul className="abShow__prices" aria-label={ariaPrices}>
            {prices.map((p, i) => {
              const ticketId = p.ticket?.trim() || `${bookingShow}_custom_${i + 1}`;
              const href = `/booking?ticket=${encodeURIComponent(ticketId)}`;
              return (
                <li key={`${p.label}-${i}`}>
                  <a href={href} className="abShow__price">
                    <span className="abShow__priceLabel">{p.label}</span>
                    <span className="abShow__priceValue">{p.price}</span>
                    {p.note ? <span className="abShow__priceNote">{p.note}</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="abShow__cta">
            <a
              href={`/booking?show=${encodeURIComponent(bookingShow)}`}
              className="abShow__book"
            >
              {ctaBook}
            </a>
          </div>
        </div>
      </div>

      {features.length > 0 ? (
        <div
          className="abShow__included ab-reveal"
          style={{ ["--ab-delay" as string]: "160ms" }}
        >
          <p className="abShow__blockLabel">{blockTitle}</p>
          <ul className="abShow__feats">
            {features.slice(0, 4).map((f) => (
              <li key={f.title} className="abShow__feat">
                <span className="abShow__featTitle">{f.title}</span>
                <span className="abShow__featText">{f.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
