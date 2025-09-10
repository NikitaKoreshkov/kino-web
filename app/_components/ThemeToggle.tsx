"use client";
import { useEffect, useState } from "react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const c = (getCookie("theme") as "light" | "dark" | null);
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = c || (prefersDark ? "dark" : "light");
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setCookie("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="fixed right-4 top-4 z-[100] select-none rounded-full border border-[color:var(--header-glass-border)] bg-[color:var(--header-glass-bg)] text-[color:var(--header-foreground)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md px-3 py-2 flex items-center gap-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-shadow"
    >
      <span className="inline-block w-5 h-5" aria-hidden>
        {theme === "dark" ? (
          // Sun icon
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zm10.48 14.32l1.79 1.8 1.79-1.8-1.79-1.79-1.79 1.79zM12 4V1h-0v3h0zm0 19v-3h-0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.8 1.79 1.79 1.8 1.8-1.8-1.79-1.79zM19.16 6.76l1.79-1.8-1.8-1.79-1.79 1.79 1.8 1.8zM12 7a5 5 0 100 10A5 5 0 0012 7z"/></svg>
        ) : (
          // Moon icon
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21.64 13a9 9 0 01-11.3-11.3A10 10 0 1021.64 13z"/></svg>
        )}
      </span>
      <span className="text-sm font-semibold tracking-wide">{theme === "dark" ? "Тёмная" : "Светлая"}</span>
    </button>
  );
}
