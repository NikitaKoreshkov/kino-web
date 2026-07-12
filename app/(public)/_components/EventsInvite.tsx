"use client";

import React, { useEffect, useRef } from "react";
import PhotoMarquee from "./PhotoMarquee";
import { useLang, type Lang } from "../../lang";
import { HeroLavaLetters } from "./HeroLavaLetters";

export default function EventsInvite({
  initial,
  images,
}: {
  initial?: Lang;
  images?: { src: string; alt?: string }[];
}) {
  const { lang } = useLang(initial);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const gallery =
    images && images.length
      ? images
      : Array.from({ length: 4 }, () => ({ src: "", alt: "" }));

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = ctaRef.current;
    if (!t || reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      const r = t.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      t.style.setProperty("--gx", `${x}%`);
      t.style.setProperty("--gy", `${y}%`);
      t.style.setProperty("--gop", "1");
      const tx = ((x - 50) / 50) * 4;
      const ty = ((y - 50) / 50) * 4;
      t.style.setProperty("--tx", `${tx}px`);
      t.style.setProperty("--ty", `${ty}px`);
    };
    const onLeave = () => {
      t.style.setProperty("--gop", "0");
      t.style.setProperty("--tx", "0px");
      t.style.setProperty("--ty", "0px");
    };
    t.addEventListener("mousemove", onMove);
    t.addEventListener("mouseleave", onLeave);
    return () => {
      t.removeEventListener("mousemove", onMove);
      t.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="eventsInvite" aria-label="Invite to events">
      <div className="wrap">
        <div className="title headline copyLines2 fadeUp">
          <HeroLavaLetters variant="headlinePp">
            {lang === "ru"
              ? "Наши мероприятия объединяют людей и"
              : "Our events bring people together and"}
          </HeroLavaLetters>
          <HeroLavaLetters variant="headlinePp">
            {lang === "ru" ? "дарят яркие эмоции" : "spark bright emotions"}
          </HeroLavaLetters>
        </div>
        <div className="subcopy copyLines2 fadeUp" style={{ animationDelay: "90ms" }}>
          <HeroLavaLetters variant="body">
            {lang === "ru"
              ? "Обучение, творчество, фестивали и шоу под открытым небом"
              : "Learning, creativity, festivals and open-air shows"}
          </HeroLavaLetters>
          <HeroLavaLetters variant="body">
            {lang === "ru"
              ? "У нас каждый найдёт что-то для себя"
              : "Everyone will find something for themselves"}
          </HeroLavaLetters>
        </div>
        <p className="fadeUp" style={{ animationDelay: "180ms" }}>
          {lang === "ru"
            ? "Выберите событие и забронируйте участие уже сейчас!"
            : "Choose an event and book your participation now!"}
        </p>
        <div className="ctaRow fadeUp" style={{ animationDelay: "260ms" }}>
          <a
            ref={ctaRef}
            href="/booking"
            className="cta"
            aria-label={lang === "ru" ? "Забронировать" : "Book now"}
            style={{
              ["--gx" as string]: "50%",
              ["--gy" as string]: "50%",
              ["--gop" as string]: "0",
              ["--tx" as string]: "0px",
              ["--ty" as string]: "0px",
            }}
          >
            <span className="label">{lang === "ru" ? "Забронировать" : "Book now"}</span>
            <span aria-hidden className="wave" />
          </a>
        </div>
      </div>

      <div
        className="marquees edgeOpenLeft is-revealed"
        aria-hidden
        style={{ ["--marquee-edge-w" as string]: "min(12vw, 160px)" }}
      >
        <PhotoMarquee
          images={gallery}
          height={220}
          width={320}
          gap={18}
          speedSec={14}
          reverse={false}
          pauseOnHover
        />
        <PhotoMarquee
          images={[...gallery].reverse()}
          height={220}
          width={320}
          gap={18}
          speedSec={16}
          reverse
          pauseOnHover
        />
      </div>
    </section>
  );
}
