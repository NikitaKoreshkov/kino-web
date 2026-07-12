/** Scroll to an about-page section by id, accounting for fixed header. */
export function scrollAboutTo(
  id: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  if (typeof window === "undefined") return false;

  // Hero: always pin to absolute top (avoids scroll-margin bounce)
  if (id === "about") {
    if (window.scrollY < 8) return true;
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const el = document.getElementById(id);
  if (!el) return false;

  const headerOffset = 96;
  const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, Math.round(y)), behavior });
  return true;
}

const STORAGE_KEY = "about:scrollTo";
const HOME_STORAGE_KEY = "home:scrollTo";

export function stashAboutScrollTarget(id: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function takeAboutScrollTarget(): string | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v) sessionStorage.removeItem(STORAGE_KEY);
    return v;
  } catch {
    return null;
  }
}

/** Stash a home-page hash target across client navigations (Next resets scroll). */
export function stashHomeScrollTarget(id: string) {
  try {
    sessionStorage.setItem(HOME_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function takeHomeScrollTarget(): string | null {
  try {
    const v = sessionStorage.getItem(HOME_STORAGE_KEY);
    if (v) sessionStorage.removeItem(HOME_STORAGE_KEY);
    return v;
  } catch {
    return null;
  }
}

/** Retry scroll until the target exists / layout settles.
 *  Only the first successful scroll may animate; later retries are instant
 *  corrections so layout shifts don't restart a smooth animation (visible jerk). */
export function scrollAboutToWhenReady(
  id: string,
  opts?: { behavior?: ScrollBehavior; attempts?: number[] },
) {
  if (typeof window === "undefined") return () => {};
  const behavior = opts?.behavior ?? "smooth";
  const attempts = opts?.attempts ?? [0, 60, 180, 400, 800];
  let cancelled = false;
  let scrolledOnce = false;

  const timers = attempts.map((delay) =>
    window.setTimeout(() => {
      if (cancelled) return;
      const useBehavior: ScrollBehavior = scrolledOnce ? "auto" : behavior;
      if (scrollAboutTo(id, useBehavior)) {
        scrolledOnce = true;
      }
    }, delay),
  );

  return () => {
    cancelled = true;
    timers.forEach((t) => window.clearTimeout(t));
  };
}
