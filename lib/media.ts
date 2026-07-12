/** Media URLs that come from admin/DB settings (usually /uploads/...). */

const BUNDLED_PHOTO_RE =
  /^\/(images\/|file\.svg$|globe\.svg$|next\.svg$|vercel\.svg$|window\.svg$)/i;

export function mediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  if (!s) return undefined;
  // Never serve repo placeholder/stock assets as content photos
  if (BUNDLED_PHOTO_RE.test(s)) return undefined;
  return s;
}

export function mediaFromObject(
  value: unknown,
  keys: string[] = ["src", "image", "cover", "url"],
): string | undefined {
  if (typeof value === "string") return mediaUrl(value);
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  for (const k of keys) {
    const found = mediaUrl(obj[k]);
    if (found) return found;
  }
  return undefined;
}

export function normalizeMediaList(
  arr: unknown,
): { src: string; alt: string }[] {
  if (!Array.isArray(arr)) return [];
  const out: { src: string; alt: string }[] = [];
  for (const x of arr) {
    if (typeof x === "string") {
      const src = mediaUrl(x);
      if (src) out.push({ src, alt: "" });
      continue;
    }
    if (x && typeof x === "object") {
      const o = x as Record<string, unknown>;
      const src = mediaFromObject(o);
      if (!src) continue;
      out.push({ src, alt: typeof o.alt === "string" ? o.alt : "" });
    }
  }
  return out;
}
