import { cookies } from "next/headers";
import ScrollStory, { type ScrollStoryEvent } from "./ScrollStory";
import { getSettingsMap, read } from "@/lib/settings";

export default async function ScrollStorySSR() {
  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const ssrLang = (langVal === "ru" || langVal === "en" ? (langVal as "ru" | "en") : "ru");

  // Override the left promo image from settings
  let promoImage: string | undefined = undefined;
  // Build right-side cards from admin-controlled home.panels.items (6 items)
  let events: ScrollStoryEvent[] | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const mp = read<any>(settings, "home.panels.mainPhoto", { src: "" });
    promoImage = typeof mp === "string" ? (mp || undefined) : (mp?.src || undefined);

    const itemsRaw = read<any[]>(settings, "home.panels.items", []);
    const cards = (Array.isArray(itemsRaw) ? itemsRaw : [])
      .slice(0, 6)
      .map((it: any, idx: number) => ({
        id: idx + 1,
        image: (it?.image || it?.src || "").toString(),
        text: (ssrLang === 'en' ? (it?.title_en || it?.title) : it?.title)?.toString() || (ssrLang === 'ru' ? `Панель ${idx + 1}` : `Panel ${idx + 1}`),
        durationMin: undefined,
      }))
      .filter((c) => c.image && typeof c.image === 'string' && c.image.trim().length > 0);

    if (cards.length) {
      events = [{ id: 1, title: ssrLang === 'ru' ? 'Панели' : 'Panels', image: undefined, cards }];
    }
  } catch {}

  return <ScrollStory lang={ssrLang} promoImage={promoImage} events={events} />;
}
