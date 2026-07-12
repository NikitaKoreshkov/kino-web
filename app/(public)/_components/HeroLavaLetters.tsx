"use client";

import type { CSSProperties, ElementType } from "react";

type Variant =
  | "eyebrow"
  | "title"
  | "headline"
  | "headlineMono"
  | "headlinePp"
  | "body";

const VARIANT: Record<
  Variant,
  {
    Tag: ElementType;
    initialColor: string;
    wrapperStyle: CSSProperties;
  }
> = {
  eyebrow: {
    Tag: "p",
    initialColor: "rgba(255,255,255,0.3)",
    wrapperStyle: {
      fontFamily: "var(--font-jetbrains), Consolas, monospace",
      fontSize: "11px",
      letterSpacing: "3px",
      textTransform: "uppercase",
      margin: 0,
    },
  },
  title: {
    Tag: "h2",
    initialColor: "#ffffff",
    wrapperStyle: {
      fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      fontSize: "clamp(2.5rem, 6vw, 5rem)",
      fontWeight: "normal",
      letterSpacing: "2px",
      lineHeight: 1.1,
      maxWidth: "800px",
      margin: 0,
    },
  },
  headline: {
    Tag: "h2",
    initialColor: "#ffffff",
    wrapperStyle: {
      fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      fontSize: "clamp(1.75rem, 3.4vw, 2.85rem)",
      fontWeight: "normal",
      letterSpacing: "0.5px",
      lineHeight: 1.12,
      maxWidth: "560px",
      margin: 0,
    },
  },
  headlineMono: {
    Tag: "h2",
    initialColor: "#ffffff",
    wrapperStyle: {
      fontFamily: "var(--font-jetbrains), Consolas, monospace",
      fontSize: "clamp(1.75rem, 3.4vw, 2.85rem)",
      fontWeight: "normal",
      letterSpacing: "0.5px",
      lineHeight: 1.12,
      maxWidth: "560px",
      margin: 0,
    },
  },
  headlinePp: {
    Tag: "h2",
    initialColor: "#ffffff",
    wrapperStyle: {
      fontFamily: "var(--font-unbounded), sans-serif",
      fontWeight: 900,
      fontSize: "clamp(1.45rem, 2.85vw, 2.45rem)",
      lineHeight: 1.05,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      maxWidth: "920px",
      margin: 0,
    },
  },
  body: {
    Tag: "p",
    initialColor: "rgba(255,255,255,0.45)",
    wrapperStyle: {
      fontFamily: "var(--font-jetbrains), Consolas, monospace",
      fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
      maxWidth: "520px",
      lineHeight: 1.7,
      letterSpacing: "0.5px",
      margin: 0,
    },
  },
};

export function HeroLavaLetters({
  variant,
  children,
  className,
  id,
  as,
}: {
  variant: Variant;
  children: string;
  className?: string;
  id?: string;
  as?: ElementType;
}) {
  const { Tag: DefaultTag, initialColor, wrapperStyle } = VARIANT[variant];
  const Tag = as || DefaultTag;
  const text = children.replace(/\s+/g, " ").trim();

  return (
    <Tag id={id} className={className} style={{ ...wrapperStyle, color: initialColor }}>
      {text}
    </Tag>
  );
}
