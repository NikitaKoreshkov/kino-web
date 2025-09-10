import { cookies } from "next/headers";
import Events from "./Events";
import type { Lang } from "../../lang";
import { getSettingsMap, read } from "@/lib/settings";

export default async function EventsSSR() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang | undefined) ?? "ru";
  // Read admin-managed events (3 items)
  let items: Array<{ image?: string; title?: string; description?: string; time?: string }> | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const raw = read<any[]>(settings, "home.events", []);
    if (Array.isArray(raw) && raw.length) {
      items = raw.slice(0,3).map((it) => {
        const title = lang === 'en' ? (it?.title_en || it?.title) : it?.title;
        const description = lang === 'en' ? (it?.description_en || it?.description) : it?.description;
        return {
          image: (it?.image || it?.src || "").toString() || undefined,
          title: (title || "").toString() || undefined,
          description: (description || "").toString() || undefined,
          time: (it?.time || "").toString() || undefined,
        };
      });
    }
  } catch {}
  return <Events initial={lang} items={items} />;
}
