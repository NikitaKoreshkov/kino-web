import { cookies } from "next/headers";
import ScrollStory, { type ScrollStoryEvent } from "./ScrollStory";
import { getSettingsMap, read } from "@/lib/settings";
import { mediaFromObject } from "@/lib/media";

const DEFAULT_TEXTS_RU = [
  "Пенное шоу: шесть пушек и волны до 1,5 м",
  "Тропический ливень: тёплые струи и атмосфера каникул",
  "Огромные экраны и кинозвук: эффект полного погружения",
  "Фейерверк из красок: зрелищные облака цвета — безопасно",
  "Комплимент детям: сладкая вата каждому гостю",
  "Кино под звёздами: атмосферные показы на свежем воздухе",
] as const;

const DEFAULT_TEXTS_EN = [
  "Foam Show: six cannons, waves up to 1.5 m",
  "Tropical Rain: warm showers and holiday vibes",
  "Large screens and cinema‑grade sound: immersive experience",
  "Color Fireworks: guest‑safe clouds of color",
  "Kids’ Treat: cotton candy for every child",
  "Cinema under the stars: enchanting outdoor screenings",
] as const;

export default async function ScrollStorySSR() {
  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const ssrLang = langVal === "ru" || langVal === "en" ? (langVal as "ru" | "en") : "ru";
  const defaults = ssrLang === "en" ? DEFAULT_TEXTS_EN : DEFAULT_TEXTS_RU;

  let promoImage: string | undefined = undefined;
  let events: ScrollStoryEvent[] | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    promoImage = mediaFromObject(read(settings, "home.panels.mainPhoto", { src: "" })) || undefined;

    const itemsRaw = read<unknown[]>(settings, "home.panels.items", []);
    const raw = Array.isArray(itemsRaw) ? itemsRaw : [];

    // Always keep 6 panel slots — missing photo = empty slot, not removed block
    const cards = Array.from({ length: 6 }, (_, idx) => {
      const it = raw[idx];
      const row = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
      const image = mediaFromObject(row) || undefined;
      const title =
        (ssrLang === "en" ? row.title_en || row.title : row.title)?.toString()?.trim() ||
        defaults[idx];
      const description =
        (ssrLang === "en" ? row.description_en || row.description : row.description)
          ?.toString()
          ?.trim() || undefined;
      return {
        id: idx + 1,
        image,
        text: title,
        description,
        durationMin: undefined as number | undefined,
      };
    });

    events = [{ id: 1, title: ssrLang === "ru" ? "Панели" : "Panels", image: undefined, cards }];
  } catch {}

  return <ScrollStory lang={ssrLang} promoImage={promoImage} events={events} />;
}
