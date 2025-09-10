import Header from "@/app/(public)/_components/Header.ssr";
import VideoHero from "@/app/(public)/_components/VideoHero.ssr";
import AtmosphereIntro from "@/app/(public)/_components/AtmosphereIntro.ssr";
import ScrollStory from "@/app/(public)/_components/ScrollStory.ssr";
import Events from "@/app/(public)/_components/Events.ssr";
import EventsInvite from "@/app/(public)/_components/EventsInvite.ssr";
import CenterSwipeGallery from "@/app/(public)/_components/CenterSwipeGallery";
import TestimonialsMarquee from "@/app/(public)/_components/TestimonialsMarquee.ssr";
import Footer from "@/app/(public)/_components/Footer.ssr";
import MapPrograms from "@/app/(public)/_components/MapPrograms.ssr";
// Demo sections removed

import { getSettingsMap, read } from "@/lib/settings";

export const revalidate = 60; // Enable ISR: re-generate at most once per 60s

export default async function Home() {
  // Load settings for dynamic content
  let carousel: { src: string; alt?: string }[] = [
    { src: "/images/cinema.svg", alt: "" },
    { src: "/file.svg", alt: "" },
    { src: "/globe.svg", alt: "" },
    { src: "/next.svg", alt: "" },
    { src: "/window.svg", alt: "" },
  ];
  try {
    const settings = await getSettingsMap();
    const arr = read<any[]>(settings, "home.carousel", []);
    if (Array.isArray(arr) && arr.length) {
      const normalized = arr
        .map((x) => {
          if (typeof x === 'string') return { src: x, alt: '' } as { src: string; alt: string };
          if (x && typeof x === 'object') {
            const src = (x.src || x.image || '').toString();
            const alt = (x.alt || '').toString();
            return { src, alt } as { src: string; alt: string };
          }
          return null as { src: string; alt: string } | null;
        })
        .filter((x): x is { src: string; alt: string } => !!x && typeof x.src === 'string' && x.src.trim().length > 0);
      if (normalized.length) carousel = normalized;
    }
  } catch {}
  return (
    <main>
      <Header />
      <VideoHero />
      <AtmosphereIntro />
      <ScrollStory />
      <Events />
      <EventsInvite />
      <div className="cSwipeMobile">
        <CenterSwipeGallery images={carousel} width={520} height={400} gap={18} />
      </div>
      <MapPrograms />
      <TestimonialsMarquee />
      <Footer />
    </main>
  );
}
