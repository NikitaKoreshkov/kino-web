import { cookies } from "next/headers";
import EventsInvite from "./EventsInvite";
import type { Lang } from "../../lang";
import { getSettingsMap, read } from "@/lib/settings";
import { normalizeMediaList } from "@/lib/media";

export default async function EventsInviteSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang | undefined) ?? "ru";

  let images: { src: string; alt?: string }[] | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const normalized = normalizeMediaList(read(settings, "home.carousel", []));
    if (normalized.length) images = normalized;
  } catch {}

  return <EventsInvite initial={lang} images={images} />;
}
