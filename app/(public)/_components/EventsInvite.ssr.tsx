import { cookies } from "next/headers";
import EventsInvite from "./EventsInvite";
import type { Lang } from "../../lang";
import { getSettingsMap, read } from "@/lib/settings";

export default async function EventsInviteSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang | undefined) ?? "ru";

  // Read desktop marquee images from settings: home.carousel
  let images: { src: string; alt?: string }[] | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const arr = read<any[]>(settings, "home.carousel", []);
    if (Array.isArray(arr) && arr.length) {
      const normalized = arr
        .map((x) => {
          if (typeof x === "string") return { src: x, alt: "" } as { src: string; alt: string };
          if (x && typeof x === "object") {
            const src = (x.src || x.image || "").toString();
            const alt = (x.alt || "").toString();
            return { src, alt } as { src: string; alt: string };
          }
          return null as { src: string; alt: string } | null;
        })
        .filter((x): x is { src: string; alt: string } => !!x && typeof x.src === "string" && x.src.trim().length > 0);
      if (normalized.length) images = normalized;
    }
  } catch {}

  return <EventsInvite initial={lang} images={images} />;
}
