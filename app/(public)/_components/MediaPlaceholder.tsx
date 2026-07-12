"use client";

/** Empty media slot — keeps layout, no stock photos */
export default function MediaPlaceholder({
  labelRu = "Нет фото",
  labelEn = "No photo",
  lang = "ru",
  className = "",
}: {
  labelRu?: string;
  labelEn?: string;
  lang?: "ru" | "en";
  className?: string;
}) {
  return (
    <div className={`mediaPlaceholder ${className}`.trim()} role="img" aria-label={lang === "ru" ? labelRu : labelEn}>
      <span className="mediaPlaceholder__icon" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="1.75" fill="currentColor" />
          <path d="M4.5 16.5 9 12l3 3 3.5-4.5 4 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="mediaPlaceholder__label">{lang === "ru" ? labelRu : labelEn}</span>
    </div>
  );
}
