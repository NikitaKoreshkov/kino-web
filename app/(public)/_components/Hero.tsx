"use client";

import React from "react";

/**
 * Hero block with soft warm light background, subtle vertical gradient,
 * three gentle glow spots and a very light grain overlay.
 * Colors are aligned with front/fon/spec.json (light theme).
 */
export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-screen h-screen w-full isolate flex items-center justify-center"
      aria-label="Hero"
    >
      {/* Theme base */}
      <div className="absolute inset-0 -z-50" style={{ background: "var(--background)" }} />

      {/* Cold blue‑violet accent wash (theme-aware) */}
      <div
        className="absolute inset-0 -z-40 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(120% 80% at 70% 30%, var(--accent-a) 0%, rgba(0,0,0,0) 55%), linear-gradient(120deg, var(--accent-a) 0%, var(--accent-b) 100%)",
        }}
      />

      {/* Subtle vignette for focus */}
      <div
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 60%, rgba(0,0,0,0) 45%, var(--vignette) 100%)",
          mixBlendMode: "normal",
        }}
      />

      {/* Grain overlay (slightly stronger to neutralize tint) */}
      <div className="pointer-events-none absolute inset-0 -z-20 mix-blend-multiply opacity-[0.035] grain" />

      {/* Unified soft glows with cool tint (theme-aware) */}
      {/* Glow A */}
      <div
        className="pointer-events-none absolute -top-40 -left-24 h-[900px] w-[900px] rounded-full blur-[90px] opacity-[0.45]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--glow-a) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      {/* Glow B */}
      <div
        className="pointer-events-none absolute top-1/4 right-[-140px] h-[820px] w-[820px] rounded-full blur-[95px] opacity-[0.40]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--glow-b) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      {/* Glow C */}
      <div
        className="pointer-events-none absolute bottom-[-240px] left-[32%] h-[880px] w-[880px] rounded-full blur-[95px] opacity-[0.42]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--glow-c) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Content placeholder */}
      <div className="relative z-10 w-full max-w-7xl px-6 py-20 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
        </h1>
        <p className="mt-4 text-base sm:text-lg" style={{ color: "var(--muted-foreground)" }}>
        </p>
      </div>
    </section>
  );
}
