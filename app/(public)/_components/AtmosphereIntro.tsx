"use client";

import React from "react";
import { Lang, useLang } from "../../lang";

export default function AtmosphereIntro({ initial }: { initial?: Lang }) {
  const { lang } = useLang(initial);
  return (
    <section className="peekSection peekSectionBottom peekAfterHero" aria-labelledby="peek-bottom-title">
      <div className="peekWrap">
        <h2 id="peek-bottom-title">{lang === 'ru' ? 'Погрузитесь в атмосферу' : 'Immerse yourself in the atmosphere'}</h2>
        <h3>{lang === 'ru' ? 'Каждое событие — часть большой истории, и вы можете стать её героем' : 'Each event is part of a larger story, and you can become its hero'}</h3>
      </div>
    </section>
  );
}
