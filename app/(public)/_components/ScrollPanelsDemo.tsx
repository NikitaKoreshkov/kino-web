"use client";

import React, { useEffect, useRef } from "react";

export default function ScrollPanelsDemo() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>(".sp-panel"));

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      panels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const delta = (center - vh / 2) / vh; // -1..1 around center
        const t = Math.max(-1, Math.min(1, delta));
        const scale = 1 - Math.abs(t) * 0.06; // subtle scale in
        const y = -t * 16; // px translate
        p.style.setProperty("--sp-scale", String(scale));
        p.style.setProperty("--sp-y", `${y}px`);
        const visible = r.top < vh * 0.9 && r.bottom > vh * 0.1;
        p.classList.toggle("in", visible);
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll as any);
    };
  }, []);

  return (
    <section ref={rootRef} className="scrollPanels" aria-label="Scroll demo">
      <div className="container sp-grid">
        <div className="sp-left">
          <div className="sp-sticky">
            <h3 className="sp-title">Живая прокрутка</h3>
            <p className="sp-sub">Демонстрация эффекта перед блоком отзывов</p>
          </div>
        </div>
        <div className="sp-right">
          {demoCards.map((c) => (
            <article key={c.id} className="sp-panel" style={{ backgroundImage: `url(${c.img})` }}>
              <div className="sp-overlay" />
              <div className="sp-body">
                <h4 className="sp-h4">{c.title}</h4>
                <p className="sp-p">{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const demoCards = [
  {
    id: "a",
    title: "Панель 1",
    text: "Лёгкое приближение и параллакс при скролле.",
    img:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=70",
  },
  {
    id: "b",
    title: "Панель 2",
    text: "Только для демонстрации поведения.",
    img:
      "https://images.unsplash.com/photo-1500534314209-bf1b7893a9a2?auto=format&fit=crop&w=1600&q=70",
  },
  {
    id: "c",
    title: "Панель 3",
    text: "Можно заменить на реальные блоки.",
    img:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=70",
  },
  {
    id: "d",
    title: "Панель 4",
    text: "Работает без сторонних библиотек.",
    img:
      "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=1600&q=70",
  },
];
