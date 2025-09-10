"use client";

import React, { useEffect, useRef } from "react";

export type PanelItem = {
  image: string;
  title: string;
  description: string;
};

export default function ScrollPanels({ mainPhoto, items }: { mainPhoto?: string; items: PanelItem[] }) {
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

  const cards = (items || []).slice(0, 6);

  return (
    <section ref={rootRef} className="scrollPanels" aria-label="Panels">
      <div className="container sp-grid">
        <div className="sp-left">
          <div className="sp-sticky">
            {mainPhoto ? (
              <div className="sp-mainPhoto" style={{ backgroundImage: `url(${mainPhoto})` }}>
                <div className="sp-overlay" />
              </div>
            ) : (
              <h3 className="sp-title">Наши панели</h3>
            )}
          </div>
        </div>
        <div className="sp-right">
          {cards.map((c, idx) => (
            <article key={idx} className="sp-panel" style={{ backgroundImage: `url(${c.image})` }}>
              <div className="sp-overlay" />
              <div className="sp-body">
                <h4 className="sp-h4">{c.title}</h4>
                <p className="sp-p">{c.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
