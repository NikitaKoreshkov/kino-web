import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { Lang } from "@/app/lang";
import ShowPage from "@/app/(public)/_components/ShowPage";
import JsonLd from "@/app/_components/JsonLd";
import { getAboutExtras, getAboutShowBlocks } from "@/lib/aboutContent";
import {
  SHOWS,
  breadcrumbJsonLd,
  buildPageMetadata,
  showEventJsonLd,
} from "@/lib/seo";

const show = SHOWS.cinema;

export const metadata: Metadata = buildPageMetadata({
  title: show.titleRu,
  description: show.descriptionRu,
  path: show.path,
  keywords: show.keywords,
});

export default async function CinemaShowPage() {
  const cookieStore = await cookies();
  const lang = ((cookieStore.get("lang")?.value as Lang) || "ru") as Lang;
  const blocks = await getAboutShowBlocks(lang);
  const extras = await getAboutExtras(lang);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: show.titleRu, path: show.path },
          ]),
          showEventJsonLd("cinema"),
        ]}
      />
      <ShowPage
        show="cinema"
        initialLang={lang}
        data={blocks?.cinema}
        extras={extras}
      />
    </>
  );
}
