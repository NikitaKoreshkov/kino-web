"use client";

import React, { useMemo, useRef } from "react";
import { getTexts } from "../../i18n";
import { useLang } from "../../lang";
import { HeroLavaLetters } from "./HeroLavaLetters";
import { useAboutReveal } from "../_hooks/useAboutReveal";

export default function TrustScroll() {
  const { lang } = useLang();
  const t = getTexts(lang).trust;
  const rootRef = useRef<HTMLElement | null>(null);

  const items = useMemo(
    () => [...(t.items ?? [])] as { title: string; text: string }[],
    [t],
  );

  useAboutReveal(rootRef, [items.length]);

  return (
    <section id="trust" ref={rootRef} className="abTrust abBand plWall">
      <div className="abTrust__head ab-reveal">
        <div className="title headline">
          <HeroLavaLetters variant="headlinePp">{t.title}</HeroLavaLetters>
        </div>
        <div className="subcopy">
          <HeroLavaLetters variant="body">{t.sub}</HeroLavaLetters>
        </div>
      </div>

      <ol className="abTrust__list">
        {items.map((it, i) => (
          <li
            key={it.title}
            className="abTrust__item ab-reveal"
            style={{ ["--ab-delay" as string]: `${80 + i * 70}ms` }}
          >
            <span className="abTrust__index" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="abTrust__body">
              <h3 className="abTrust__title">{it.title}</h3>
              <p className="abTrust__text">{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
