"use client";

import React from "react";

export default function ScrollLockDemo() {
  return (
    <section className="scrollLockDemo" aria-label="Scroll lock demo">
      <div className="container sld-grid">
        {/* Left: sticky featured card */}
        <aside className="sld-left">
          <article className="sld-feature">
            <div className="sld-media" />
            <div className="sld-body">
              <h3 className="sld-title">Закреплённый блок</h3>
              <p className="sld-sub">Стоит на месте, пока справа список прокручивается</p>
              <a className="sld-cta" href="#">Подробнее</a>
            </div>
          </article>
        </aside>

        {/* Right: list that scrolls while left is sticky */}
        <div className="sld-right">
          {Array.from({ length: 10 }).map((_, i) => (
            <article key={i} className="sld-item">
              <div className="sld-thumb" />
              <div className="sld-text">
                <h4>Карточка #{i + 1}</h4>
                <p>Демо-элемент для проверки поведения скролла и прилипания.</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
