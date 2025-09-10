"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";
const listeners = new Set<(t: Theme) => void>();

function readStored(): Theme | null {
  try {
    const s = localStorage.getItem(THEME_KEY) as Theme | null;
    return s === "light" || s === "dark" ? s : null;
  } catch {
    return null;
  }
}

function applyToDom(t: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", t === "dark");
  }
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const m = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);
    const cookieTheme = (m?.[1] as Theme | undefined);
    return cookieTheme ?? readStored() ?? "light";
  } catch {
    return readStored() ?? "light";
  }
}

export function setTheme(next: Theme) {
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  try { document.cookie = `theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`; } catch {}
  // smooth transition
  try {
    const html = document.documentElement;
    html.classList.add('theme-transition');
    window.setTimeout(() => html.classList.remove('theme-transition'), 320);
  } catch {}
  applyToDom(next);
  listeners.forEach((l) => l(next));
}

export function toggleTheme() {
  const next: Theme = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
}

export function subscribeTheme(cb: (t: Theme) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTheme(initialFromSSR?: Theme) {
  const [theme, setState] = useState<Theme>(() => {
    // Prefer explicit SSR-provided value to guarantee server/client match
    if (initialFromSSR) return initialFromSSR;
    if (typeof document !== "undefined") {
      const fromDom = document.documentElement.classList.contains("dark") ? "dark" : "light";
      return fromDom;
    }
    return "light";
  });

  useEffect(() => {
    const initial = getTheme();
    setState(initial);
    applyToDom(initial);
    // ensure cookie is set to initial for future SSR
    try { document.cookie = `theme=${initial}; Path=/; Max-Age=31536000; SameSite=Lax`; } catch {}

    const unsub = subscribeTheme((t) => setState(t));
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        applyToDom(e.newValue);
        setState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    theme,
    setTheme: (t: Theme) => { setTheme(t); setState(t); },
    toggle: () => {
      const next: Theme = theme === "light" ? "dark" : "light";
      setTheme(next);
      setState(next);
    },
  } as const;
}
