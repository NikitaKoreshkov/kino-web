"use client";

import { useEffect, useState } from "react";

export type Lang = "ru" | "en";

const LANG_KEY = "lang";
const listeners = new Set<(l: Lang) => void>();

function readStored(): Lang | null {
  try {
    const s = localStorage.getItem(LANG_KEY) as Lang | null;
    return s === "ru" || s === "en" ? s : null;
  } catch {
    return null;
  }
}

export function getLang(): Lang {
  if (typeof window === "undefined") return "ru";
  return readStored() ?? "ru";
}

export function setLang(next: Lang) {
  try { localStorage.setItem(LANG_KEY, next); } catch {}
  try {
    if (typeof document !== "undefined") {
      document.cookie = `lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  } catch {}
  listeners.forEach((l) => l(next));
}

export function toggleLang() {
  const next: Lang = getLang() === "ru" ? "en" : "ru";
  setLang(next);
}

export function subscribeLang(cb: (l: Lang) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLang(initial?: Lang) {
  // ВАЖНО: чтобы избежать hydration mismatch, первая отрисовка на клиенте
  // должна совпадать с SSR. Поэтому инициализируемся только из initial или 'ru'.
  const [lang, setState] = useState<Lang>(() => initial ?? "ru");

  useEffect(() => {
    // После монтирования синхронизируемся с cookie/localStorage
    try {
      const m = document.cookie.match(/(?:^|; )lang=(ru|en)(?:;|$)/);
      const cookieLang = (m?.[1] as Lang | undefined) ?? readStored() ?? "ru";
      if (cookieLang !== lang) {
        setState(cookieLang);
      }
      // Актуализируем хранилища выбранным значением
      localStorage.setItem(LANG_KEY, cookieLang);
      document.cookie = `lang=${cookieLang}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
    const unsub = subscribeLang((l) => setState(l));
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && (e.newValue === "ru" || e.newValue === "en")) {
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
    lang,
    setLang: (l: Lang) => { setLang(l); setState(l); },
    toggle: () => {
      const next: Lang = lang === "ru" ? "en" : "ru";
      setLang(next);
      setState(next);
    },
  } as const;
}
