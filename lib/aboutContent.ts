import type { Lang } from "@/app/lang";
import { getSettingsMap, read } from "@/lib/settings";
import type { AboutShowData } from "@/app/(public)/_components/AboutShowSection";

export type AboutExtrasData = {
  title?: string;
  lead?: string;
  groups?: { photos?: string; ice?: string; congrats?: string };
  items?: {
    photos?: Array<{ title: string; subtitle?: string; price: string }>;
    ice?: Array<{ title: string; subtitle?: string; price: string }>;
    congrats?: Array<{ title: string; subtitle?: string; price: string }>;
  };
};

export async function getAboutIntroImage(): Promise<string | undefined> {
  try {
    const settings = await getSettingsMap();
    const intro = read<any>(settings, "about.intro", { image: "" });
    const img = typeof intro === "string" ? intro : intro?.image || intro?.src || "";
    if (typeof img === "string" && img.trim()) return img.trim();
  } catch {}
  return undefined;
}

export async function getAboutShowBlocks(
  lang: Lang,
): Promise<Record<string, AboutShowData> | undefined> {
  try {
    const settings = await getSettingsMap();
    const rawBlocks = read<any[]>(settings, "about.blocks", []);
    if (!Array.isArray(rawBlocks) || !rawBlocks.length) return undefined;

    const byKey: Record<string, AboutShowData> = {};
    rawBlocks.forEach((b: any) => {
      const key = (b?.key || "").toString();
      if (!key) return;
      const title = lang === "en" ? b?.title_en || b?.title : b?.title;
      const description =
        lang === "en" ? b?.description_en || b?.description : b?.description;
      byKey[key] = {
        cover: (b?.cover || "").toString(),
        title: (title || "").toString(),
        description: (description || "").toString(),
        prices: Array.isArray(b?.prices)
          ? b.prices.map((p: any) => {
              const label = lang === "en" ? p?.label_en || p?.label : p?.label;
              const note = lang === "en" ? p?.note_en || p?.note : p?.note;
              const price = lang === "en" ? p?.price_en || p?.price : p?.price;
              return {
                label: (label || "").toString(),
                price: (price || "").toString(),
                note: (note || "").toString(),
                ticket: (p?.ticket || "").toString(),
              };
            })
          : [],
        panels: Array.isArray(b?.panels)
          ? b.panels.map((p: any) => {
              const pt = lang === "en" ? p?.title_en || p?.title : p?.title;
              const pd =
                lang === "en" ? p?.description_en || p?.description : p?.description;
              return {
                title: (pt || "").toString(),
                description: (pd || "").toString(),
              };
            })
          : [],
      };
    });
    return byKey;
  } catch {
    return undefined;
  }
}

export async function getAboutExtras(lang: Lang): Promise<AboutExtrasData | undefined> {
  try {
    const settings = await getSettingsMap();
    const rawExtras = read<any>(settings, "about.addons", {});
    if (!rawExtras || typeof rawExtras !== "object") return undefined;

    const title = lang === "en" ? rawExtras?.title_en || rawExtras?.title : rawExtras?.title;
    const lead = lang === "en" ? rawExtras?.lead_en || rawExtras?.lead : rawExtras?.lead;
    return {
      title: (title || "").toString(),
      lead: (lead || "").toString(),
      groups: {
        photos: (
          lang === "en"
            ? rawExtras?.groups?.photos_en || rawExtras?.groups?.photos
            : rawExtras?.groups?.photos || ""
        ).toString(),
        ice: (
          lang === "en"
            ? rawExtras?.groups?.ice_en || rawExtras?.groups?.ice
            : rawExtras?.groups?.ice || ""
        ).toString(),
        congrats: (
          lang === "en"
            ? rawExtras?.groups?.congrats_en || rawExtras?.groups?.congrats
            : rawExtras?.groups?.congrats || ""
        ).toString(),
      },
      items: {
        photos: Array.isArray(rawExtras?.items?.photos)
          ? rawExtras.items.photos.map((it: any) => ({
              title: (
                lang === "en" ? it?.title_en || it?.title : it?.title || ""
              ).toString(),
              subtitle: (
                lang === "en" ? it?.subtitle_en || it?.subtitle : it?.subtitle || ""
              ).toString(),
              price: (
                lang === "en" ? it?.price_en || it?.price : it?.price || ""
              ).toString(),
            }))
          : [],
        ice: Array.isArray(rawExtras?.items?.ice)
          ? rawExtras.items.ice.map((it: any) => ({
              title: (
                lang === "en" ? it?.title_en || it?.title : it?.title || ""
              ).toString(),
              subtitle: (
                lang === "en" ? it?.subtitle_en || it?.subtitle : it?.subtitle || ""
              ).toString(),
              price: (
                lang === "en" ? it?.price_en || it?.price : it?.price || ""
              ).toString(),
            }))
          : [],
        congrats: Array.isArray(rawExtras?.items?.congrats)
          ? rawExtras.items.congrats.map((it: any) => ({
              title: (
                lang === "en" ? it?.title_en || it?.title : it?.title || ""
              ).toString(),
              subtitle: (
                lang === "en" ? it?.subtitle_en || it?.subtitle : it?.subtitle || ""
              ).toString(),
              price: (
                lang === "en" ? it?.price_en || it?.price : it?.price || ""
              ).toString(),
            }))
          : [],
      },
    };
  } catch {
    return undefined;
  }
}
