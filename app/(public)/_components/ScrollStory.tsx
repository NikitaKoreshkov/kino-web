"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../lang";
import { stashAboutScrollTarget } from "../_lib/aboutScroll";
import GlassPanelShell from "./GlassPanelShell";
import MediaPlaceholder from "./MediaPlaceholder";

export type ScrollStoryCard = {
  id: string | number;
  image?: string;
  text: string;
  description?: string;
  durationMin?: number;
};

export type ScrollStoryEvent = {
  id: string | number;
  title: string;
  image?: string;
  cards: ScrollStoryCard[];
};

export type ScrollStoryProps = {
  lang?: "ru" | "en";
  events?: ScrollStoryEvent[];
  promoImage?: string;
};

function cardHref(text: string, index: number): string {
  const txt = (text || "").toLowerCase();
  const isFoam = /пенн|foam/.test(txt);
  const isRain = /ливень|rain/.test(txt);
  const isColor = /краск|color/.test(txt);
  const isCandy = /сладкая\s+вата|candy/.test(txt);
  const isPopcorn = /попкорн|popcorn/.test(txt);
  const isPerformance = /перформанс|artist|mascot|performance/.test(txt);
  const isBalls = /мяч|ball/.test(txt);
  const isKino = /кино|экран|звук|cinema|screen|sound/.test(txt);
  if (isCandy || isPopcorn) return "/about#masters";
  if (isFoam || isRain || isColor) return "/about#yupi";
  if (isPerformance || isBalls || isKino) return "/about#kino";
  if (index === 0 || index === 1 || index === 3) return "/about#yupi";
  if (index === 4) return "/about#masters";
  if (index === 2 || index === 5) return "/about#kino";
  return "/about#about";
}

function useRevealOnView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.add("is-revealed");
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.12) {
            el.classList.add("is-revealed");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.12, 0.25] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

type FrameMotion = {
  frame: HTMLDivElement;
  img: HTMLImageElement;
  row: HTMLElement | null;
  mx: number;
  my: number;
  lit: boolean;
};

/** Scroll focus: active row lights up, others dim — plus hover spotlight */
function useScrollCinema(total: number) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      section.querySelectorAll<HTMLElement>(".ss-row").forEach((row) => {
        row.classList.add("is-focus");
        row.style.setProperty("--ss-focus", "1");
      });
      return;
    }

    const frames = new Map<HTMLDivElement, FrameMotion>();
    const rows = () => Array.from(section.querySelectorAll<HTMLElement>(".ss-row"));

    const collect = () => {
      frames.clear();
      section.querySelectorAll<HTMLDivElement>(".ss-mediaFrame").forEach((frame) => {
        const img = frame.querySelector<HTMLImageElement>(".ss-img");
        if (!img) return;
        frames.set(frame, {
          frame,
          img,
          row: frame.closest<HTMLElement>(".ss-row"),
          mx: 0.5,
          my: 0.5,
          lit: false,
        });
      });
    };
    collect();

    let raf = 0;
    let running = true;

    const paint = () => {
      const vh = window.innerHeight || 1;
      let bestIdx = 0;
      let bestScore = -1;
      const rowScores = new Map<HTMLElement, number>();

      rows().forEach((row) => {
        const r = row.getBoundingClientRect();
        const mid = r.top + r.height * 0.5;
        // Peak when row center is near ~42% of viewport
        const score = 1 - Math.min(1, Math.abs(mid - vh * 0.42) / (vh * 0.62));
        const eased = score * score * (3 - 2 * score);
        rowScores.set(row, eased);
        row.style.setProperty("--ss-focus", eased.toFixed(3));
        const idx = Number(row.dataset.cardIdx || 0);
        if (eased > bestScore) {
          bestScore = eased;
          bestIdx = idx;
        }
      });

        rows().forEach((row) => {
          const score = rowScores.get(row) ?? 0;
          row.classList.toggle("is-focus", score > 0.55);
          // Soft curtain: 0 closed → 1 open
          const open = Math.max(0, Math.min(1, (score - 0.08) / 0.55));
          const media = row.querySelector<HTMLElement>(".ss-media");
          if (media) {
            media.style.setProperty("--ss-wipe", open.toFixed(3));
          }
        });

      frames.forEach((m) => {
        const hovered = !!m.row?.matches(":hover");
        const base = hovered ? 1.07 : 1.02;
        // Hover spotlight only — no scroll parallax
        if (m.lit) {
          const dx = (m.mx - 0.5) * 10;
          const dy = (m.my - 0.5) * 7;
          m.img.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${(base + 0.02).toFixed(3)})`;
        } else if (hovered) {
          m.img.style.transform = `scale(${base})`;
        } else {
          m.img.style.transform = "scale(1.02)";
        }
        m.frame.style.setProperty("--spot-x", `${(m.mx * 100).toFixed(2)}%`);
        m.frame.style.setProperty("--spot-y", `${(m.my * 100).toFixed(2)}%`);
        m.frame.classList.toggle("is-lit", m.lit);
        m.row?.classList.toggle("is-hover", hovered);
      });

      const sr = section.getBoundingClientRect();
      const span = Math.max(1, sr.height - vh);
      const scrolled = Math.max(0, Math.min(1, -sr.top / span));
      if (progressRef.current) {
        progressRef.current.style.setProperty("--ss-progress", `${(scrolled * 100).toFixed(2)}%`);
        progressRef.current.classList.toggle(
          "is-active",
          sr.top < vh * 0.7 && sr.bottom > vh * 0.25
        );
      }
      if (indexRef.current) {
        indexRef.current.textContent = String(bestIdx + 1).padStart(2, "0");
      }

      if (running) raf = requestAnimationFrame(paint);
    };

    const onMove = (e: MouseEvent) => {
      if (window.innerWidth <= 1023) return;
      frames.forEach((m) => {
        const r = m.frame.getBoundingClientRect();
        const inside =
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom;
        if (inside) {
          m.mx = (e.clientX - r.left) / Math.max(1, r.width);
          m.my = (e.clientY - r.top) / Math.max(1, r.height);
          m.lit = true;
        } else if (m.lit) {
          m.mx = 0.5;
          m.my = 0.5;
          m.lit = false;
        }
      });
    };

    const onLeave = () => {
      frames.forEach((m) => {
        m.mx = 0.5;
        m.my = 0.5;
        m.lit = false;
      });
    };

    const ro = new ResizeObserver(() => collect());
    ro.observe(section);
    window.addEventListener("mousemove", onMove, { passive: true });
    section.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(paint);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      frames.forEach((m) => {
        m.img.style.transform = "";
        m.frame.classList.remove("is-lit");
      });
      rows().forEach((row) => {
        row.classList.remove("is-focus");
        row.classList.remove("is-hover");
        row.style.removeProperty("--ss-focus");
        const media = row.querySelector<HTMLElement>(".ss-media");
        if (media) media.style.removeProperty("--ss-wipe");
      });
    };
  }, [total]);

  return { sectionRef, progressRef, indexRef };
}

function LeadPanel({
  lang,
  image,
}: {
  lang: "ru" | "en";
  image?: string;
}) {
  const ref = useRevealOnView<HTMLElement>();

  return (
    <article ref={ref} className="ss-leadWrap ss-reveal">
      <GlassPanelShell className="ss-lead">
        <div className="ss-mediaFrame ss-leadFrame">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={lang === "ru" ? "Пространство для новых идей" : "A space for new ideas"}
                className="ss-img ss-leadImg"
                loading="eager"
              />
              <div className="ss-spot" aria-hidden />
              <div className="ss-leadShade" aria-hidden />
            </>
          ) : (
            <MediaPlaceholder lang={lang} className="ss-mediaPlaceholder" />
          )}
        </div>
        <div className="ss-leadBody">
          <p className="ss-leadEyebrow">
            {lang === "ru" ? "Атмосфера" : "Atmosphere"}
          </p>
          <h3 className="ss-leadTitle">
            {lang === "ru" ? "Пространство для новых идей" : "A space for new ideas"}
          </h3>
          <p className="ss-leadSub">
            {lang === "ru"
              ? "Один вечер — больше, чем просто формат."
              : "One evening — more than a format."}
          </p>
          <div className="ss-leadCta">
            <GlassPanelShell as="a" href="/booking" className="ctaBtn ctaPromo">
              {lang === "ru" ? "Забронировать место" : "Reserve a spot"}
            </GlassPanelShell>
          </div>
        </div>
      </GlassPanelShell>
    </article>
  );
}

function FeatureRow({
  lang,
  card,
  index,
  flip,
}: {
  lang: "ru" | "en";
  card: ScrollStoryCard;
  index: number;
  flip: boolean;
}) {
  const ref = useRevealOnView<HTMLAnchorElement>();
  const router = useRouter();
  const n = String(index + 1).padStart(2, "0");
  const href = cardHref(card.text, index);
  const more = lang === "ru" ? "Подробнее" : "More details";

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Avoid native hash scroll fighting Next's scroll-to-top (visible jerk on about)
    e.preventDefault();
    try {
      const id = new URL(href, "http://local").hash.replace(/^#/, "");
      if (id) stashAboutScrollTarget(id);
    } catch {
      /* ignore */
    }
    router.push(href, { scroll: false });
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      className={`ss-row ss-reveal${flip ? " is-flip" : ""}`}
      data-card-idx={index}
      aria-label={`${more}: ${card.text}`}
    >
      <GlassPanelShell className="ss-media" disabled>
        <div className="ss-mediaFrame">
          {card.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt=""
                className="ss-img"
                loading="lazy"
              />
              <div className="ss-spot" aria-hidden />
            </>
          ) : (
            <MediaPlaceholder lang={lang} className="ss-mediaPlaceholder" />
          )}
        </div>
      </GlassPanelShell>
      <div className="ss-copy">
        <span className="ss-index" aria-hidden>
          {n}
        </span>
        <p className="ss-text">{card.text}</p>
        {card.description ? <p className="ss-desc">{card.description}</p> : null}
        <span className="ss-link">
          {more}
          <span className="ss-linkArrow" aria-hidden>
            →
          </span>
        </span>
      </div>
    </a>
  );
}

export default function ScrollStory({
  lang: initialLang = "ru",
  events,
  promoImage,
}: ScrollStoryProps) {
  const { lang } = useLang(initialLang);

  const data = useMemo<ScrollStoryEvent[]>(() => {
    if (events && events.length) return events.slice(0, 3);
    const defaults =
      lang === "ru"
        ? [
            "Пенное шоу: шесть пушек и волны до 1,5 м",
            "Тропический ливень: тёплые струи и атмосфера каникул",
            "Огромные экраны и кинозвук: эффект полного погружения",
            "Фейерверк из красок: зрелищные облака цвета — безопасно",
            "Комплимент детям: сладкая вата каждому гостю",
            "Кино под звёздами: атмосферные показы на свежем воздухе",
          ]
        : [
            "Foam Show: six cannons, waves up to 1.5 m",
            "Tropical Rain: warm showers and holiday vibes",
            "Large screens and cinema‑grade sound: immersive experience",
            "Color Fireworks: guest‑safe clouds of color",
            "Kids’ Treat: cotton candy for every child",
            "Cinema under the stars: enchanting outdoor screenings",
          ];
    return [
      {
        id: 1,
        title: lang === "ru" ? "Панели" : "Panels",
        cards: defaults.map((text, i) => ({ id: i + 1, text })),
      },
    ];
  }, [events, lang]);

  const first = data[0];
  const cards = first.cards.slice(0, 6);
  const { sectionRef, progressRef, indexRef } = useScrollCinema(cards.length);
  const totalLabel = String(cards.length).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      className="scrollStory"
      aria-labelledby={`scroll-story-${first.id}`}
    >
      <div className="ss-progressRail" aria-hidden>
        <div className="ss-progress" ref={progressRef}>
          <span className="ss-progressIndex" ref={indexRef}>
            01
          </span>
          <span className="ss-progressTrack">
            <span className="ss-progressFill" />
          </span>
          <span className="ss-progressTotal">{totalLabel}</span>
        </div>
      </div>

      <div className="ss-container">
        <h2 id={`scroll-story-${first.id}`} className="sr-only">
          {first.title}
        </h2>

        <LeadPanel lang={lang} image={promoImage} />

        <div className="ss-rows">
          {cards.map((c, i) => (
            <FeatureRow
              key={c.id}
              lang={lang}
              card={c}
              index={i}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
