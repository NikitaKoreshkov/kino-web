"use client";

import React from "react";
import { Lang, useLang } from "../../lang";
import { HeroLavaLetters } from "./HeroLavaLetters";

export default function AtmosphereIntro({ initial }: { initial?: Lang }) {
  const { lang } = useLang(initial);
  return (
    <section
      className="peekSection peekSectionBottom peekAfterHero peekAtmosphere"
      aria-labelledby="peek-bottom-title"
    >
      <div className="peekWrap">
        <div className="title headline copyLines2 fadeUp">
          <HeroLavaLetters variant="headlinePp" id="peek-bottom-title">
            {lang === "ru" ? "Погрузитесь в" : "Immerse yourself in"}
          </HeroLavaLetters>
          <HeroLavaLetters variant="headlinePp">
            {lang === "ru" ? "атмосферу" : "the atmosphere"}
          </HeroLavaLetters>
        </div>
        <div className="subcopy copyLines2 fadeUp" style={{ animationDelay: "90ms" }}>
          <HeroLavaLetters variant="body">
            {lang === "ru"
              ? "Каждое событие — часть большой истории"
              : "Each event is part of a larger story"}
          </HeroLavaLetters>
          <HeroLavaLetters variant="body">
            {lang === "ru"
              ? "и вы можете стать её героем"
              : "and you can become its hero"}
          </HeroLavaLetters>
        </div>
      </div>
    </section>
  );
}
