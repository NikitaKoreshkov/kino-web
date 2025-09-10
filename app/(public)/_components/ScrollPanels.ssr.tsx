import { cookies } from "next/headers";
import ScrollPanels, { type PanelItem } from "./ScrollPanels";
import { getSettingsMap, read } from "@/lib/settings";

export default async function ScrollPanelsSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as "ru" | "en" | undefined) ?? "ru";
  const settings = await getSettingsMap();
  const mainPhotoObj = read<any>(settings, "home.panels.mainPhoto", { src: "" });
  const mainPhoto = typeof mainPhotoObj === 'string' ? mainPhotoObj : (mainPhotoObj?.src || "");
  const itemsRaw = read<any[]>(settings, "home.panels.items", []);
  const items: PanelItem[] = (Array.isArray(itemsRaw) ? itemsRaw : []).slice(0, 6).map((it) => {
    const title = lang === 'en' ? (it?.title_en || it?.title) : it?.title;
    const description = lang === 'en' ? (it?.description_en || it?.description) : it?.description;
    return {
      image: (it?.image || it?.src || "").toString(),
      title: (title || "").toString(),
      description: (description || "").toString(),
    };
  }).filter(x => x.image);
  return <ScrollPanels mainPhoto={mainPhoto} items={items} />;
}
