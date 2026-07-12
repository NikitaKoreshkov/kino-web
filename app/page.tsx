import type { Metadata } from "next";
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
import JsonLd from "@/app/_components/JsonLd";
import { getSettingsMap, read } from "@/lib/settings";
import { normalizeMediaList } from "@/lib/media";
import {
  DEFAULT_DESCRIPTION_RU,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "ШоуСочи — пенное шоу, кино и мастер-классы в Сочи",
  description: DEFAULT_DESCRIPTION_RU,
  path: "/",
  keywords: [
    "пенное шоу Сочи",
    "кино под звёздами",
    "амфитеатр Южное взморье",
    "купить билеты ШоуСочи",
  ],
});

export default async function Home() {
  let carousel: { src: string; alt?: string }[] = [];
  try {
    const settings = await getSettingsMap();
    carousel = normalizeMediaList(read(settings, "home.carousel", []));
  } catch {}
  return (
    <main>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Главная", path: "/" }])}
      />
      <Header />
      <VideoHero />
      <AtmosphereIntro />
      <ScrollStory />
      <Events />
      <EventsInvite />
      <div className="cSwipeMobile">
        <CenterSwipeGallery
          images={
            carousel.length
              ? carousel
              : Array.from({ length: 3 }, () => ({ src: "", alt: "" }))
          }
          width={520}
          height={400}
          gap={18}
        />
      </div>
      <MapPrograms />
      <TestimonialsMarquee />
      <Footer />
    </main>
  );
}
