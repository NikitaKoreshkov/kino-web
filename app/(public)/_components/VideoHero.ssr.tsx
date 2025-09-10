import { cookies } from "next/headers";
import VideoHero from "./VideoHero";
import { getSettingsMap, read } from "@/lib/settings";

export default async function VideoHeroSSR() {
  const cookieStore = await cookies();
  const langVal = cookieStore.get("lang")?.value;
  const ssrLang = langVal === "ru" || langVal === "en" ? (langVal as "ru" | "en") : undefined;
  // Read settings for hero video (optional)
  let videoSrc: string | undefined = undefined;
  try {
    const settings = await getSettingsMap();
    const raw = read<any>(settings, "home.hero.video", { src: "" });
    if (typeof raw === 'string') {
      videoSrc = raw || undefined;
    } else if (raw && typeof raw === 'object') {
      videoSrc = (raw.src || '').toString() || undefined;
    }
  } catch {}
  return <VideoHero ssrLang={ssrLang} videoSrc={videoSrc} />;
}
