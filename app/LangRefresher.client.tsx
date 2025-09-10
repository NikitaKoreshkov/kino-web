"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { subscribeLang, getLang } from "@/app/lang";

/**
 * Client helper that listens to language changes and triggers a soft router refresh
 * so SSR components re-fetch data for the selected locale.
 */
export default function LangRefresher() {
  const router = useRouter();
  const pendingRef = useRef<number | null>(null);

  useEffect(() => {
    // On mount, ensure html[lang] attribute is in sync
    try {
      const html = document.documentElement;
      const current = getLang();
      if (html.getAttribute("lang") !== current) html.setAttribute("lang", current);
    } catch {}

    const unsub = subscribeLang(() => {
      // Debounce multiple quick toggles
      if (pendingRef.current) window.clearTimeout(pendingRef.current);
      pendingRef.current = window.setTimeout(() => {
        try { router.refresh(); } catch {}
      }, 20);
    });
    return () => {
      if (pendingRef.current) window.clearTimeout(pendingRef.current);
      unsub();
    };
  }, [router]);

  return null;
}
