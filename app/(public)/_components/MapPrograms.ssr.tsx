import { cookies } from "next/headers";
import MapPrograms, { type MapItem } from "./MapPrograms";
import type { Lang } from "../../lang";
import { getSettingsMap, read } from "@/lib/settings";

export default async function MapProgramsSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang | undefined) ?? "ru";
  let items: MapItem[] | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const raw = read<any[]>(settings, "home.map", []);
    if (Array.isArray(raw) && raw.length) {
      items = raw.slice(0,3).map((it) => {
        const showTitle = lang === 'en' ? (it?.showTitle_en || it?.showTitle) : it?.showTitle;
        const price = lang === 'en' ? (it?.price_en || it?.price) : it?.price;
        const description = lang === 'en' ? (it?.description_en || it?.description) : it?.description;
        return {
          image: (it?.image || it?.src || "").toString() || undefined,
          showTitle: (showTitle || '').toString() || undefined,
          price: (price || '').toString() || undefined,
          description: (description || '').toString() || undefined,
        } as MapItem;
      });
    }
  } catch {}
  return <MapPrograms initial={lang} items={items} />;
}
